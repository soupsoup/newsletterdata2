import { useState, useEffect } from 'react';

interface PasswordGateProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'newsletter_auth';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has a valid session
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < SESSION_DURATION) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ timestamp: Date.now() }));
        setIsAuthenticated(true);
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch {
      setError('Authentication failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="password-gate">
      <div className="password-card">
        <h1>Newsletter Analytics</h1>
        <p>Enter password to access the dashboard</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
          />
          {error && <div className="password-error">{error}</div>}
          <button type="submit">Enter</button>
        </form>
      </div>
    </div>
  );
}
