
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import RegisterForm from './RegisterForm';

interface RegisterCardProps {
  onRegisterSuccess: () => void;
}

const RegisterCard: React.FC<RegisterCardProps> = ({ onRegisterSuccess }) => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-mps-primary">Inscription</CardTitle>
      </CardHeader>
      <CardContent>
        <RegisterForm onRegisterSuccess={onRegisterSuccess} />
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-mps-text">
          Déjà un compte ? <Link to="/login" className="text-mps-primary font-semibold">Se connecter</Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterCard;
