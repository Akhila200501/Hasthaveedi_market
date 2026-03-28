import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const hasAttempted = useRef(false);
  const [status, setStatus] = useState('Verifying your email...');

  useEffect(() => {
    if (hasAttempted.current) return;

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/auth/verify-email?token=${token}`);
        const result = await response.json();
        
        if (response.ok) {
          setStatus('Verified');
          alert(result.message || 'Email verified successfully! You can now login.');
          navigate('/auth');
        } else {
          setStatus('Failed');
          alert(result.error || 'Verification failed');
          navigate('/auth');
        }

      } catch (err) {
        setStatus('Error');
        alert('Verification request failed. Please try again.');
        navigate('/auth');
      }
    };

    if (token) {
      hasAttempted.current = true;
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
      <h2>{status}</h2>
      <p>Redirecting to login...</p>
    </div>
  );
};

export default EmailVerificationPage;