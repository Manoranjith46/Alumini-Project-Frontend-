import React, { useState } from 'react';
import styles from './SmsOtpLogin.module.css';
import { Phone, Lock, ArrowRight, Loader } from 'lucide-react';

/**
 * SMS OTP Login Component
 * Two-step authentication flow:
 * Step 1: Phone number input
 * Step 2: OTP verification
 *
 * Note: Phone number must be in E.164 format: +91XXXXXXXXXX (for India)
 * API requests use environment variable REACT_APP_API_URL for base URL
 */
const SmsOtpLogin = ({ onLoginSuccess }) => {
  // Step 1: Phone input
  const [phoneNumber, setPhoneNumber] = useState('');

  // Step 2: OTP verification
  const [otp, setOtp] = useState('');

  // UI State
  const [currentStep, setCurrentStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer for resend
  const [resendCountdown, setResendCountdown] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  /**
   * Validate phone number format (E.164)
   * Must start with + and contain 1-15 digits
   */
  const validatePhone = (phone) => {
    return /^\+\d{1,15}$/.test(phone);
  };

  /**
   * Format phone input to E.164 format
   * User can enter: 919876543210 or 9876543210
   * Convert to: +919876543210 or +919876543210
   */
  const formatPhoneInput = (value) => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/\D/g, '');

    // If 10 digits (no country code), prepend 91 (India)
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    // Add + prefix
    if (cleaned && !cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  };

  /**
   * Step 1: Send OTP to phone number
   */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate phone format
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    const formattedPhone = formatPhoneInput(phoneNumber);

    if (!validatePhone(formattedPhone)) {
      setError('Please enter a valid phone number (10+ digits)');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('OTP sent successfully! Check your SMS.');
        setCurrentStep('otp');
        setPhoneNumber(formattedPhone); // Store formatted phone
        setResendCountdown(30); // Start 30-second countdown
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Verify OTP code
   */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate OTP format
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be exactly 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          code: otp,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('Login successful!');
        // Store token
        localStorage.setItem('token', data.token);
        // Call parent callback or redirect
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('OTP resent successfully!');
        setResendCountdown(30);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Go back to phone input
   */
  const handleGoBack = () => {
    setCurrentStep('phone');
    setOtp('');
    setError('');
    setSuccessMessage('');
    setResendCountdown(0);
  };

  // Resend countdown timer effect
  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Login with SMS</h2>
          <p>Fast and secure authentication</p>
        </div>

        {/* Error Message */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Success Message */}
        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

        {/* Step 1: Phone Number Input */}
        {currentStep === 'phone' && (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Phone Number</label>
              <div className={styles.inputWrapper}>
                <Phone size={18} className={styles.icon} />
                <input
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                  className={styles.input}
                  autoComplete="tel"
                />
              </div>
              <small className={styles.hint}>
                Format: 10 digits (e.g., 9876543210) or with country code (+91...)
              </small>
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading && <Loader size={18} className={styles.spinner} />}
              {loading ? 'Sending OTP...' : 'Send OTP'}
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 'otp' && (
          <form onSubmit={handleVerifyOtp} className={styles.form}>
            <div className={styles.phoneDisplay}>
              <p>OTP sent to:</p>
              <p className={styles.phoneNumber}>{phoneNumber}</p>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Enter OTP</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.icon} />
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={loading}
                  className={styles.input}
                  maxLength="6"
                  inputMode="numeric"
                />
              </div>
              <small className={styles.hint}>Enter the 6-digit code sent to your phone</small>
            </div>

            <button type="submit" disabled={loading} className={styles.button}>
              {loading && <Loader size={18} className={styles.spinner} />}
              {loading ? 'Verifying...' : 'Verify & Login'}
              <ArrowRight size={18} />
            </button>

            {/* Resend OTP Section */}
            <div className={styles.resendSection}>
              {resendCountdown > 0 ? (
                <p className={styles.resendCountdown}>
                  Resend OTP in {resendCountdown}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className={styles.resendButton}
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleGoBack}
              disabled={loading}
              className={styles.backButton}
            >
              ← Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SmsOtpLogin;
