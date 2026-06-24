import React, { useState } from 'react';

const DOW_ACCOUNTS = [
  { email: 'j.williams@dow.com',  name: 'James Williams',  avatar: 'JW', role: 'Supplier Compliance Manager' },
  { email: 'a.chen@dow.com',      name: 'Angela Chen',     avatar: 'AC', role: 'Product Safety Officer' },
  { email: 'r.patel@dow.com',     name: 'Raj Patel',       avatar: 'RP', role: 'Regulatory Affairs Director' },
];

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('landing');
  const [signupForm,     setSignupForm]     = useState({ name:'', email:'', password:'', confirm:'', role:'Compliance Analyst' });
  const [emailLoginForm, setEmailLoginForm] = useState({ email:'', password:'' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleGooglePick = (acc) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ name: acc.name, email: acc.email, avatar: acc.avatar, role: acc.role, provider: 'google' });
    }, 1200);
  };

  const handleSignup = (e) => {
    e.preventDefault(); setError('');
    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirm) { setError('Please fill in all fields.'); return; }
    if (signupForm.password !== signupForm.confirm) { setError('Passwords do not match.'); return; }
    if (signupForm.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const initials = signupForm.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
      onLogin({ name: signupForm.name, email: signupForm.email, avatar: initials, role: signupForm.role, provider: 'email' });
    }, 1000);
  };

  const handleEmailLogin = (e) => {
    e.preventDefault(); setError('');
    if (!emailLoginForm.email || !emailLoginForm.password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const initials = emailLoginForm.email.slice(0,2).toUpperCase();
      onLogin({ name: emailLoginForm.email.split('@')[0], email: emailLoginForm.email, avatar: initials, role: 'Compliance Analyst', provider: 'email' });
    }, 900);
  };

  return (
    <div className="login-root">
      <div className="login-blob login-blob-1"/>
      <div className="login-blob login-blob-2"/>
      <div className="login-blob login-blob-3"/>

      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="login-logo">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <polygon points="25,3 46,14 46,36 25,47 4,36 4,14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
              <polygon points="25,9 40,17.5 40,32.5 25,41 10,32.5 10,17.5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <text x="25" y="30" textAnchor="middle" fill="white" fontSize="10" fontWeight="800" letterSpacing="0.5">DOW</text>
            </svg>
          </div>
          <div>
            <h1 className="login-title">Dow Chemical</h1>
            <p className="login-subtitle">Supplier SDS/MSDS Compliance Management System</p>
          </div>
        </div>

        {/* LANDING */}
        {mode === 'landing' && (
          <div className="login-body">
            <p className="login-welcome">Secure access to the Dow Chemical Supplier Compliance Portal. Sign in to continue.</p>
            <button className="btn-google" id="btn-google-signin" onClick={() => setMode('google-picker')}>
              <svg className="google-icon" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continue with Google
            </button>
            <div className="login-divider"><span>or</span></div>
            <button className="btn-login-email" id="btn-email-signin" onClick={() => setMode('email-login')}>
              Sign in with Email
            </button>
            <p className="login-register-prompt">
              New user?{' '}
              <button className="link-btn" onClick={() => { setMode('signup'); setError(''); }}>Create an account</button>
            </p>
          </div>
        )}

        {/* GOOGLE PICKER */}
        {mode === 'google-picker' && (
          <div className="login-body">
            <button className="back-btn" onClick={() => { setMode('landing'); setError(''); }}>← Back</button>
            <h2 className="login-form-title">Choose an account</h2>
            <p className="login-form-sub">Select your Dow Chemical Google account</p>
            <div className="google-accounts-list">
              {DOW_ACCOUNTS.map(acc => (
                <button key={acc.email} className="google-account-item" onClick={() => handleGooglePick(acc)} disabled={loading}>
                  <div className="ga-avatar">{acc.avatar}</div>
                  <div className="ga-info">
                    <span className="ga-name">{acc.name}</span>
                    <span className="ga-email">{acc.email}</span>
                    <span className="ga-role">{acc.role}</span>
                  </div>
                  <span className="ga-arrow">→</span>
                </button>
              ))}
              <button className="google-account-item google-account-other" onClick={() => { setMode('signup'); setError(''); }} disabled={loading}>
                <div className="ga-avatar ga-avatar-add">+</div>
                <div className="ga-info">
                  <span className="ga-name">Use another account</span>
                  <span className="ga-email">Sign up with a new account</span>
                </div>
              </button>
            </div>
            {loading && <div className="login-loader"><div className="spinner"/></div>}
          </div>
        )}

        {/* EMAIL LOGIN */}
        {mode === 'email-login' && (
          <div className="login-body">
            <button className="back-btn" onClick={() => { setMode('landing'); setError(''); }}>← Back</button>
            <h2 className="login-form-title">Sign In</h2>
            <p className="login-form-sub">Enter your Dow Chemical credentials</p>
            <form className="login-form" onSubmit={handleEmailLogin} id="form-email-login">
              <div className="form-group">
                <label htmlFor="el-email">Email Address</label>
                <input id="el-email" type="email" placeholder="you@dow.com" value={emailLoginForm.email} onChange={e => setEmailLoginForm(p=>({...p,email:e.target.value}))} autoComplete="email"/>
              </div>
              <div className="form-group">
                <label htmlFor="el-password">Password</label>
                <input id="el-password" type="password" placeholder="••••••••" value={emailLoginForm.password} onChange={e => setEmailLoginForm(p=>({...p,password:e.target.value}))} autoComplete="current-password"/>
              </div>
              {error && <div className="login-error">{error}</div>}
              <button type="submit" className="btn-submit" disabled={loading} id="btn-submit-email-login">
                {loading ? <span className="spinner-sm"/> : 'Sign In →'}
              </button>
            </form>
            <p className="login-register-prompt">
              Don't have an account?{' '}
              <button className="link-btn" onClick={() => { setMode('signup'); setError(''); }}>Create one</button>
            </p>
          </div>
        )}

        {/* SIGN UP */}
        {mode === 'signup' && (
          <div className="login-body">
            <button className="back-btn" onClick={() => { setMode('landing'); setError(''); }}>← Back</button>
            <h2 className="login-form-title">Create Account</h2>
            <p className="login-form-sub">Register your Dow Chemical compliance portal account</p>
            <form className="login-form" onSubmit={handleSignup} id="form-signup">
              <div className="form-group">
                <label htmlFor="su-name">Full Name</label>
                <input id="su-name" type="text" placeholder="John Williams" value={signupForm.name} onChange={e => setSignupForm(p=>({...p,name:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label htmlFor="su-email">Work Email</label>
                <input id="su-email" type="email" placeholder="you@dow.com" value={signupForm.email} onChange={e => setSignupForm(p=>({...p,email:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label htmlFor="su-role">Role</label>
                <select id="su-role" value={signupForm.role} onChange={e => setSignupForm(p=>({...p,role:e.target.value}))}>
                  <option>Compliance Analyst</option>
                  <option>Supplier Compliance Manager</option>
                  <option>Product Safety Officer</option>
                  <option>Regulatory Affairs Director</option>
                  <option>EHS Coordinator</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="su-password">Password</label>
                <input id="su-password" type="password" placeholder="Min. 6 characters" value={signupForm.password} onChange={e => setSignupForm(p=>({...p,password:e.target.value}))}/>
              </div>
              <div className="form-group">
                <label htmlFor="su-confirm">Confirm Password</label>
                <input id="su-confirm" type="password" placeholder="Repeat password" value={signupForm.confirm} onChange={e => setSignupForm(p=>({...p,confirm:e.target.value}))}/>
              </div>
              {error && <div className="login-error">{error}</div>}
              <button type="submit" className="btn-submit" disabled={loading} id="btn-submit-signup">
                {loading ? <span className="spinner-sm"/> : 'Create Account →'}
              </button>
            </form>
          </div>
        )}

        <footer className="login-footer">
          <span>© {new Date().getFullYear()} Dow Chemical · Global Supplier Compliance · Product Safety & Regulatory Affairs</span>
        </footer>
      </div>
    </div>
  );
}
