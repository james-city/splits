import { useState, useEffect } from 'react'

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
  }

  useEffect(() => {
    const debouncedCalculate = debounce(() => {
      if (paceTime && paceDistance && !isNaN(parseFloat(paceDistance))) {
        calculateSplits()
      }
    }, 300) // 300ms debounce delay

    const timeout = setTimeout(debouncedCalculate, 300)

    return () => clearTimeout(timeout) // Clear timeout on cleanup
  }, [paceTime, paceDistance, customDistances])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: 'green' }}>
        Pace to Splits Calculator
      </h1>
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontWeight: 'bold'
            }}
          >
            Pace Time (mm:ss):
            <input
              type='text'
              value={paceTime}
              onChange={e => setPaceTime(e.target.value)}
              placeholder='e.g., 5:30'
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontWeight: 'bold'
            }}
          >
            Pace Distance (km):
            <input
              type='number'
              value={paceDistance}
              onChange={e => setPaceDistance(e.target.value)}
              placeholder='e.g., 1'
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </label>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontWeight: 'bold'
            }}
          >
            Custom Distances (comma-separated, e.g., 400m, 1k, 5k):
            <input
              type='text'
              value={customDistances}
              onChange={e => setCustomDistances(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '100%'
              }}
            />
          </label>
        </div>
        {errorMessage && (
          <div style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
            {errorMessage}
          </div>
        )}
        <button
          onClick={calculateSplits}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: 'green',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          Calculate Splits
        </button>
      </div>
      {Object.keys(splits).length > 0 && (
        <div
          style={{
            marginTop: '20px',
            opacity: isUpdated ? 0.5 : 1,
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          <h2 style={{ textAlign: 'center' }}>Splits</h2>
          <table
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              margin: '0 auto',
              maxWidth: '600px'
            }}
          >
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px' }}>
                  Distance
                </th>
                <th style={{ border: '1px solid black', padding: '8px' }}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(splits).map(([distance, time]) => (
                <tr key={distance}>
                  <td style={{ border: '1px solid black', padding: '8px' }}>
                    {distance}
                  </td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>
                    {time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default App
