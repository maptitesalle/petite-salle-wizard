
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { register, isLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    // Basic validation
    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit contenir au moins 6 caractères");
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log('RegisterForm - Attempting registration with:', { email, name });
      await register(email, password, name);
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès. Un email de confirmation a été envoyé.",
      });
      
      console.log('RegisterForm - Registration successful');
      
      // Call the success callback
      onRegisterSuccess();
    } catch (error: any) {
      console.error("RegisterForm - Erreur d'inscription:", error);
      
      // More specific error message based on the error
      let errorMessage = "Impossible de créer votre compte";
      if (error.message?.includes('email already in use') || error.message?.includes('email_exists')) {
        errorMessage = "Cette adresse email est déjà utilisée";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Format d'email invalide";
      } else if (error.message?.includes('weak password')) {
        errorMessage = "Mot de passe trop faible. Utilisez au moins 6 caractères.";
      }
      
      setErrorMsg(errorMessage);
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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
          <Button 
            type="submit" 
            className="w-full bg-mps-primary hover:bg-mps-primary/80"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;
