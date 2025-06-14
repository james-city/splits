import { useState, useEffect, useRef } from 'react'
import './App.css'

function debounce(func, delay) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), delay)
  }
}

function App() {
  const [paceTime, setPaceTime] = useState('5:00')
  const [paceDistance, setPaceDistance] = useState('1')
  const [customDistances, setCustomDistances] = useState(
    '400m, 1k, 1mi, 5k, 10k, half_marathon, marathon'
  )
  const [splits, setSplits] = useState({})
  const [isUpdated, setIsUpdated] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [shouldScroll, setShouldScroll] = useState(false)
  const [isEditingDistances, setIsEditingDistances] = useState(false)
  const resultsRef = useRef(null)

  const parseDistances = () => {
    return customDistances
      .split(',')
      .map(d => d.trim())
      .filter(d => d)
  }

  const handleDistancePillClick = () => {
    setIsEditingDistances(true)
  }

  const handleDistanceInputBlur = () => {
    setIsEditingDistances(false)
  }

  const handleDistanceInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      setIsEditingDistances(false)
    }
  }

  const removePill = (distanceToRemove) => {
    const distances = parseDistances().filter(d => d !== distanceToRemove)
    setCustomDistances(distances.join(', '))
  }

  const calculateSplits = () => {
    const paceParts = paceTime.split(':').map(Number)
    const totalPaceSeconds = paceParts[0] * 60 + paceParts[1]
    const paceDist = parseFloat(paceDistance)

    if (isNaN(totalPaceSeconds) || isNaN(paceDist) || paceDist <= 0) {
      setErrorMessage('Please enter valid pace time and distance.')
      return
    }

    setErrorMessage('')

    const distances = customDistances
      .split(',')
      .map(d => d.trim())
      .filter(d => d)
      .map(d => {
        const unit = d.endsWith('m')
          ? 'm'
          : d.endsWith('k')
            ? 'km'
            : d.endsWith('mi')
              ? 'mi'
              : null
        const value =
          d === 'half_marathon'
            ? 21.0975
            : d === 'marathon'
              ? 42.195
              : parseFloat(d)
        return unit || d === 'half_marathon' || d === 'marathon'
          ? { value, unit: unit || 'km' }
          : null
      })
      .filter(Boolean)

    const calculatedSplits = {}
    distances.forEach(({ value, unit }) => {
      const distanceInKm =
        unit === 'm' ? value / 1000 : unit === 'mi' ? value * 1.60934 : value
      const splitTime = totalPaceSeconds * (distanceInKm / paceDist)
      const hours = Math.floor(splitTime / 3600)
      const minutes = Math.floor((splitTime % 3600) / 60)
      const seconds = Math.round(splitTime % 60)
      const formattedDistance =
        unit === 'm'
          ? `${value}${unit}`
          : unit === 'km'
            ? `${value}k`
            : `${value}${unit}`
      const formattedTime =
        hours > 0
          ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          : unit === 'm'
            ? `${minutes}:${seconds.toString().padStart(2, '0')}.${Math.floor((splitTime % 1) * 10)}`
            : `${minutes}:${seconds.toString().padStart(2, '0')}`

      calculatedSplits[formattedDistance] = formattedTime
    })

    setSplits(calculatedSplits)
    setIsUpdated(true)
    setTimeout(() => setIsUpdated(false), 500) // Reset visual feedback after 500ms
    
    // Smooth scroll to results only if triggered by user action
    if (shouldScroll) {
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
        setShouldScroll(false) // Reset scroll flag after scrolling
      }, 100) // Small delay to ensure DOM is updated
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    })
  }

  const handleCalculateClick = () => {
    setShouldScroll(true)
    calculateSplits()
  }

  useEffect(() => {
    const debouncedCalculate = debounce(() => {
      if (paceTime && paceDistance && !isNaN(parseFloat(paceDistance))) {
        setShouldScroll(false) // Don't scroll for automatic calculations
        calculateSplits()
      }
    }, 300) // 300ms debounce delay

    const timeout = setTimeout(debouncedCalculate, 300)

    return () => clearTimeout(timeout) // Clear timeout on cleanup
  }, [paceTime, paceDistance, customDistances])

  return (
    <div className='app-container'>
      <h1 className='app-title'>Pace to Splits Calculator</h1>

      <div className='main-card'>
        <div className='input-group'>
          <label className='input-label'>Pace Time (mm:ss)</label>
          <input
            type='text'
            value={paceTime}
            onChange={e => setPaceTime(e.target.value)}
            placeholder='e.g., 5:30'
            className='input-field'
          />
        </div>

        <div className='input-group'>
          <label className='input-label'>Pace Distance (km)</label>
          <input
            type='number'
            value={paceDistance}
            onChange={e => setPaceDistance(e.target.value)}
            placeholder='e.g., 1'
            className='input-field'
          />
        </div>

        <div className='input-group'>
          <label className='input-label'>Distances to Calculate</label>
          {isEditingDistances ? (
            <input
              type='text'
              value={customDistances}
              onChange={e => setCustomDistances(e.target.value)}
              onBlur={handleDistanceInputBlur}
              onKeyPress={handleDistanceInputKeyPress}
              placeholder='e.g., 400m, 1k, 5k'
              className='input-field'
              autoFocus
            />
          ) : (
            <div className='pill-container' onClick={handleDistancePillClick}>
              {parseDistances().map((distance, index) => (
                <div key={index} className='distance-pill'>
                  <span className='pill-text'>{distance}</span>
                  <button 
                    className='pill-remove'
                    onClick={(e) => {
                      e.stopPropagation()
                      removePill(distance)
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className='pill-add-hint'>Tap to edit</div>
            </div>
          )}
        </div>

        {errorMessage && <div className='error-message'>{errorMessage}</div>}

        <button onClick={handleCalculateClick} className='primary-button'>
          Calculate Splits
        </button>
      </div>

      {Object.keys(splits).length > 0 && (
        <div className='results-card' ref={resultsRef} style={{ opacity: isUpdated ? 0.5 : 1 }}>
          <h2 className='results-title'>Splits</h2>
          <table className='splits-table'>
            <thead>
              <tr>
                <th className='table-header'>Distance</th>
                <th className='table-header'>Time</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(splits).map(([distance, time]) => (
                <tr key={distance} className='table-row'>
                  <td className='table-cell'>{distance}</td>
                  <td className='table-cell'>{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button onClick={scrollToTop} className='back-to-top-button'>
            ↑ Back to Top
          </button>
        </div>
      )}
    </div>
  )
}

export default App
