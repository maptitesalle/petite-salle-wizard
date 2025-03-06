
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dumbbell, ChevronRight, BarChart, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-mps-secondary/30">
      {/* Hero Section */}
      <section className="bg-mps-primary text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Dumbbell size={64} />
          </div>
          <h1 className="text-5xl font-bold mb-4">Ma P'tite Salle</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Votre assistant personnel pour atteindre vos objectifs sportifs et bien-être
          </p>
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/wizard">
                <Button className="bg-white text-mps-primary hover:bg-white/90 px-6 py-3 text-lg">
                  Mettre à jour mes données
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button className="bg-mps-accent text-white hover:bg-mps-accent/90 px-6 py-3 text-lg">
                  Accéder à mon dashboard
                  <BarChart className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button className="bg-white text-mps-primary hover:bg-white/90 px-6 py-3 text-lg">
                  Se connecter
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-mps-accent text-white hover:bg-mps-accent/90 px-6 py-3 text-lg">
                  S'inscrire
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-mps-primary text-center mb-12">Comment ça fonctionne</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <ClipboardList className="h-12 w-12 text-mps-primary" />
                </div>
                <CardTitle className="text-mps-primary">1. Saisissez vos données</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-mps-text">
                  Renseignez vos données sportives, vos objectifs, régimes et contraintes santé dans notre assistant pas à pas.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <BarChart className="h-12 w-12 text-mps-primary" />
                </div>
                <CardTitle className="text-mps-primary">2. Analysez votre profil</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-mps-text">
                  Notre système analyse vos données pour créer un profil personnalisé et générer des recommandations adaptées.
                </p>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft hover:shadow-medium transition-shadow">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Dumbbell className="h-12 w-12 text-mps-primary" />
                </div>
                <CardTitle className="text-mps-primary">3. Suivez les recommandations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-mps-text">
                  Recevez des conseils personnalisés sur la nutrition, les compléments, la souplesse et vos séances à la salle.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-mps-primary text-white py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à commencer votre parcours personnalisé ?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Rejoignez Ma P'tite Salle et bénéficiez de conseils adaptés à vos besoins spécifiques
          </p>
          {isAuthenticated ? (
            <Link to="/wizard">
              <Button className="bg-white text-mps-primary hover:bg-white/90 px-6 py-3 text-lg">
                Commencer maintenant
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button className="bg-white text-mps-primary hover:bg-white/90 px-6 py-3 text-lg">
                S'inscrire gratuitement
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
