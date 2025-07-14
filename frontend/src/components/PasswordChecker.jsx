import React, { useState } from 'react';
import axios from 'axios';

const PasswordChecker = () => {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const formatHash = (label, hash) => (
  <div>
    <strong>{label}:</strong>
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{hash}</pre>
  </div>
);
  const [showPassword, setShowPassword] = useState(false);

  const checkPassword = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/check/', {
        password: password,
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error:', error);
      setResult(null);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Password Strength Tester</h2>
<input
  type={showPassword ? 'text' : 'password'}
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Enter your password"
  style={{ padding: '0.5rem', marginRight: '0.5rem' }}
/>
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? 'Hide' : 'Show'}
</button>
      <button onClick={checkPassword}>Check</button>

      {result && (
  <div style={{ marginTop: '1.5rem' }}>
    <h3>Result:</h3>
    <p>Length: {result.length}</p>
    <p>Lowercase: {result.has_lower ? '✅' : '❌'}</p>
    <p>Uppercase: {result.has_upper ? '✅' : '❌'}</p>
    <p>Digit: {result.has_digit ? '✅' : '❌'}</p>
    <p>Special Char: {result.has_special ? '✅' : '❌'}</p>
    <p>Entropy: {result.entropy} bits</p>
    <p>Brute Force Time: {Number(result.brute_force_seconds).toExponential(2)} seconds</p>

    {/* 🚨 Breach Warning */}
    <p style={{ color: result.breach_count > 0 ? 'red' : 'green' }}>
      {result.breach_count > 0
        ? `⚠️ This password appeared in ${result.breach_count.toLocaleString()} data breaches.`
        : '✅ This password was not found in known breaches.'}
    </p>

    {/* 🔐 Hashes */}
    <div style={{ marginTop: '1rem' }}>
      <h4>Hashed Versions:</h4>
      {formatHash('SHA-256', result.sha256)}
      {formatHash('bcrypt', result.bcrypt)}
      {formatHash('argon2', result.argon2)}
    </div>
  </div>
)}
    </div>
  );
};

export default PasswordChecker;
