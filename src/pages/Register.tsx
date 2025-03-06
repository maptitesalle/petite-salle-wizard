
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { register, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      await register(email, password, name);
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès",
      });
      navigate('/wizard');
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      setErrorMsg(error.message || "Impossible de créer votre compte");
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message || "Impossible de créer votre compte",
      });
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/wizard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-mps-primary">Inscription</CardTitle>
        </CardHeader>
        <CardContent>
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorMsg}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="Jean Dupont" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="votre@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Le mot de passe doit contenir au moins 6 caractères</p>
              </div>
              <Button type="submit" className="w-full bg-mps-primary" disabled={isLoading}>
                {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-mps-text">
            Déjà un compte ? <Link to="/login" className="text-mps-primary font-semibold">Se connecter</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
