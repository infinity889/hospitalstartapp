import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLogin, setIsLogin] = useState(true);
  
  if (token) {
    return <Dashboard token={token} setToken={setToken} />;
  }

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h1 className="auth-title">MediAI Connect</h1>
        {isLogin ? 
          <LoginForm setToken={setToken} /> : 
          <RegisterForm setToken={setToken} />
        }
        <div className="switch-auth">
          {isLogin ? (
            <p>Don't have an account? <span onClick={() => setIsLogin(false)}>Sign up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setIsLogin(true)}>Log in</span></p>
          )}
        </div>
      </div>
    </div>
  );
}

const LoginForm = ({ setToken }: { setToken: (t: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Is the Django backend running?');
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="error-msg">{error}</div>}
      <div className="form-group">
        <label>Username</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="btn">Sign In</button>
    </form>
  );
};

const RegisterForm = ({ setToken }: { setToken: (t: string) => void }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (res.ok) {
        // Auto login after register
        const loginRes = await fetch(`${API_URL}/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('token', loginData.token);
          setToken(loginData.token);
        }
      } else {
        const errData = await res.json();
        setError(JSON.stringify(errData));
      }
    } catch (err) {
      setError('Connection failed.');
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="error-msg">{error}</div>}
      <div className="form-group">
        <label>Username</label>
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="btn">Create Account</button>
    </form>
  );
};

const Dashboard = ({ token, setToken }: { token: string, setToken: (t: string | null) => void }) => {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [illness, setIllness] = useState('');
  const [prefTime, setPrefTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchRequests();
  }, []);

  const fetchUser = async () => {
    const res = await fetch(`${API_URL}/me/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (res.ok) setUser(await res.json());
    else logout();
  };

  const fetchRequests = async () => {
    const res = await fetch(`${API_URL}/appointments/`, {
      headers: { 'Authorization': `Token ${token}` }
    });
    if (res.ok) setRequests(await res.json());
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch(`${API_URL}/appointments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({ illness_description: illness, preferred_time: prefTime })
    });
    setIllness('');
    setPrefTime('');
    setLoading(false);
    fetchRequests();
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1 style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          MediAI Connect
        </h1>
        <div className="nav-user">
          <span>Welcome, <strong>{user?.username || 'Patient'}</strong></span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="main-grid">
        <div className="glass-card" style={{ maxWidth: '100%' }}>
          <h2>Request a Doctor</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Describe your symptoms and our AI will assign the best specialist for you.
          </p>
          <form onSubmit={submitRequest}>
            <div className="form-group">
              <label>Describe your illness or symptoms</label>
              <textarea 
                rows={4} 
                value={illness} 
                onChange={e => setIllness(e.target.value)} 
                required 
                placeholder="E.g. I have had a severe headache and fever for 3 days..."
              />
            </div>
            <div className="form-group">
              <label>Available Date & Time</label>
              <input 
                type="text" 
                value={prefTime} 
                onChange={e => setPrefTime(e.target.value)} 
                required 
                placeholder="E.g. Tomorrow morning, or DD/MM/YYYY hh:mm"
              />
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Find a Doctor'}
            </button>
          </form>
        </div>

        <div>
          <h2>Your Appointments</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Track the status of your requests below.
          </p>
          {requests.length === 0 ? (
             <div className="request-card" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
               You have no appointment requests yet.
             </div>
          ) : requests.map(req => (
            <div key={req.id} className="request-card">
              <div className={`status-badge status-${req.status}`}>
                {req.status.replace('_', ' ')}
              </div>
              <p><strong>Symptoms:</strong> {req.illness_description}</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <strong>Requested time:</strong> {req.preferred_time}
              </p>
              
              {req.assigned_doctor_details && (
                <div className="doctor-info">
                  <p><strong>Assigned Doctor:</strong> {req.assigned_doctor_details.name}</p>
                  <p><strong>Specialization:</strong> {req.assigned_doctor_details.specialization}</p>
                  <p><strong>Experience:</strong> {req.assigned_doctor_details.experience_years} years</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
