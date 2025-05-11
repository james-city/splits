import { useState } from 'react';

function App() {
  const [paceTime, setPaceTime] = useState('5:00');
  const [paceDistance, setPaceDistance] = useState('1');
  const [customDistances, setCustomDistances] = useState('400m, 1k, 1mi, 5k, 10k, half_marathon, marathon');
  const [splits, setSplits] = useState({});

  const calculateSplits = () => {
    const paceParts = paceTime.split(':').map(Number);
    const totalPaceSeconds = paceParts[0] * 60 + paceParts[1];
    const paceDist = parseFloat(paceDistance);

    if (isNaN(totalPaceSeconds) || isNaN(paceDist) || paceDist <= 0) {
      alert('Please enter valid pace time and distance.');
      return;
    }

    const distances = customDistances
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d)
      .map((d) => {
        const unit = d.endsWith('m') ? 'm' : d.endsWith('k') ? 'km' : d.endsWith('mi') ? 'mi' : null;
        const value =
          d === 'half_marathon'
            ? 21.0975
            : d === 'marathon'
            ? 42.195
            : parseFloat(d);
        return unit || d === 'half_marathon' || d === 'marathon' ? { value, unit: unit || 'km' } : null;
      })
      .filter(Boolean);

    const calculatedSplits = {};
    distances.forEach(({ value, unit }) => {
      const distanceInKm = unit === 'm' ? value / 1000 : unit === 'mi' ? value * 1.60934 : value;
      const splitTime = totalPaceSeconds * (distanceInKm / paceDist);
      const hours = Math.floor(splitTime / 3600);
      const minutes = Math.floor((splitTime % 3600) / 60);
      const seconds = Math.round(splitTime % 60);
      calculatedSplits[`${value}${unit}`] =
        hours > 0
          ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          : `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });

    setSplits(calculatedSplits);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Pace to Splits Calculator</h1>
      <div>
        <label>
          Pace Time (mm:ss):
          <input
            type="text"
            value={paceTime}
            onChange={(e) => setPaceTime(e.target.value)}
            placeholder="e.g., 5:30"
          />
        </label>
      </div>
      <div>
        <label>
          Pace Distance (km):
          <input
            type="number"
            value={paceDistance}
            onChange={(e) => setPaceDistance(e.target.value)}
            placeholder="e.g., 1"
          />
        </label>
      </div>
      <div>
        <label>
          Custom Distances (comma-separated, e.g., 400m, 1k, 5k):
          <input
            type="text"
            value={customDistances}
            onChange={(e) => setCustomDistances(e.target.value)}
            style={{ width: '100%' }}
          />
        </label>
      </div>
      <button onClick={calculateSplits}>Calculate Splits</button>
      {Object.keys(splits).length > 0 && (
        <div>
          <h2>Splits</h2>
          <table style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px' }}>Distance</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(splits).map(([distance, time]) => (
                <tr key={distance}>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{distance}</td>
                  <td style={{ border: '1px solid black', padding: '8px' }}>{time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
