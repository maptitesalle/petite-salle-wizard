import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  isLoading: boolean;
}

const LoginForm = ({ onLogin, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const [formSubmitting, setFormSubmitting] = useState(false);
  
  useEffect(() => {
    if (!isLoading) {
      setFormSubmitting(false);
    }
  }, [isLoading]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
      });
      return;
    }
    
    setFormSubmitting(true);
    try {
      await onLogin(email, password);
    } catch (error) {
      console.error('Login form error:', error);
    } finally {
      if (!isLoading) {
        setFormSubmitting(false);
      }
    }
  };

  const disabled = isLoading || formSubmitting;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="votre@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={disabled}
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
            disabled={disabled}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-mps-primary hover:bg-mps-primary/80"
          disabled={disabled}
        >
          {disabled ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
