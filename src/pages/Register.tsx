
import React from 'react';
import { useSessionRedirect } from '@/hooks/useSessionRedirect';
import RegisterCard from '@/components/auth/RegisterCard';

const Register = () => {
  const { redirectAttempted, setRedirectAttempted } = useSessionRedirect('/wizard');

  const handleRegisterSuccess = () => {
    setRedirectAttempted(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
      <RegisterCard onRegisterSuccess={handleRegisterSuccess} />
    </div>
  );
};

export default Register;
