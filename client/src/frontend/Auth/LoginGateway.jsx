import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import styles from './LoginGateway.module.css';
import NavBar from '../../components/Navbar/NavBar';
import { useAuth } from '../../context/authContext/authContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


export default function LoginGateway() {
  const navigate = useNavigate();
  const { saveUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await res.json();

      if(!data.success) {
        alert('User Not Found');
        return;
      }

      saveUser(data.user, data.token);

      const role = data.user.role;
      if (role === 'alumni') navigate('/alumini/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'coordinator') navigate('/coordinator/dashboard');
    } catch (error) {
      setError('Unable to connect to server');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Login failed');
        return;
      }

      saveUser(data.user, data.token);

      const role = data.user.role;

      if (role === 'alumni') navigate('/alumini/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'coordinator') navigate('/coordinator/dashboard');
    } catch (error) {
      setError('Unable to connect to server');
    }
  };


  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className={styles.container}>
      {/* Navigation Bar */}
      <NavBar isLanding={false } />
      
      {/* Particles Background */}
      <div className={styles.particlesContainer}>
        <div className={styles.particle} style={{ top: '10%', left: '15%' }}></div>
        <div className={styles.particle} style={{ top: '25%', left: '80%' }}></div>
        <div className={styles.particle} style={{ top: '60%', left: '5%' }}></div>
        <div className={styles.particle} style={{ top: '85%', left: '40%' }}></div>
        <div className={styles.particle} style={{ top: '45%', left: '90%' }}></div>
        <div className={styles.particle} style={{ top: '70%', left: '75%' }}></div>
        <div className={styles.particle} style={{ top: '20%', left: '30%' }}></div>
        <div className={styles.particle} style={{ top: '55%', left: '25%' }}></div>
        <div className={styles.particle} style={{ top: '15%', left: '60%' }}></div>
        <div className={styles.particle} style={{ top: '90%', left: '10%' }}></div>
        
        {/* Gradient Blurs */}
        <div className={styles.blurBlue}></div>
        <div className={styles.blurOrange}></div>
      </div>

      {/* Login Card */}
      <div className={styles.contentWrapper}>
        <br />
        <br />
        <div className={styles.glassCard}>
          
          {/* Logo & Header */}
          <div className={styles.headerSection}>
            <div className={styles.headerText}>
              <h1 className={styles.title}>Login Gateway</h1>
              <p className={styles.subtitle}>K.S.R. College of Engineering</p>
            </div>
          </div>

          {/* Login Form */}
          <form className={styles.form} onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email or Username</label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconBox}>
                  <span className="material-symbols-outlined">person</span>
                </div>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="alumni@ksrce.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className={styles.inputGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>Password</label>
                <button 
                  type="button"
                  onClick={handleForgotPassword} 
                  className={styles.forgotPassword}
                >
                  Forgot Password?
                </button>
              </div>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconBox}>
                  <span className="material-symbols-outlined">lock</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className={styles.loginButton}>
              <span>Log In</span>
              <span>→</span>
            </button>

          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>OR CONTINUE WITH</span>
            <div className={styles.dividerLine}></div>
          </div>

          {/* Google Login */}
          <div className={styles.googleButtonWrapper}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
