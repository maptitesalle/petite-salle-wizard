
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, isLoading, sessionChecked } = useAuth();
  const { toast } = useToast();
  const [showContent, setShowContent] = useState(false);
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [forcedDisplay, setForcedDisplay] = useState(false);

  // Force display of content after 5 seconds regardless of loading state
  useEffect(() => {
    const contentTimer = setTimeout(() => {
      if (!showContent) {
        console.log("Index - Forcing content display after timeout");
        setShowContent(true);
        setForcedDisplay(true);
        
        toast({
          title: "Affichage forcé",
          description: "L'affichage a été forcé suite à un délai trop long de chargement",
          variant: "default",
        });
      }
    }, 5000);

    // Show refresh button after 3 seconds if still loading
    const refreshTimer = setTimeout(() => {
      if (isLoading) {
        setShowRefreshButton(true);
      }
    }, 3000);

    // We should see content as soon as authentication is checked
    if (sessionChecked) {
      setShowContent(true);
    }

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(refreshTimer);
    };
  }, [isLoading, sessionChecked, showContent, toast]);

  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    window.location.reload();
  };

  // If user is authenticated, redirect to dashboard from the main Index component
  // instead of waiting for the router to do it
  useEffect(() => {
    if (isAuthenticated && !isLoading && sessionChecked) {
      console.log("Index - User authenticated, redirecting to dashboard");
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, isLoading, sessionChecked]);

  // Show loading and refresh button if needed
  if (!showContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-mps-secondary/20 to-mps-secondary/10 p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mps-primary/30 border-t-mps-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-mps-text mb-6">Chargement de votre expérience personnalisée...</p>
          
          {showRefreshButton && (
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              className="mt-4 flex items-center gap-2"
            >
              <RefreshCw size={16} /> Rafraîchir la page
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Here's the actual Index page content
  return (
    <div className="min-h-screen bg-gradient-to-b from-mps-secondary/20 to-mps-secondary/10">
      {forcedDisplay && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mx-4 mt-4 rounded-md">
          <p className="text-amber-700">
            La page a été affichée malgré un problème de chargement. Certaines fonctionnalités pourraient être limitées.
            <Button 
              variant="link" 
              onClick={handleRefresh}
              className="ml-2 p-0 h-auto text-amber-700 underline"
            >
              Rafraîchir la page
            </Button>
          </p>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-12 flex flex-col min-h-screen">
        <main className="flex-grow">
          <section className="py-12 md:py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-mps-primary mb-6">
              Ma Petite Salle
            </h1>
            <p className="text-xl md:text-2xl text-mps-text max-w-3xl mx-auto mb-8">
              Votre coach personnel pour atteindre vos objectifs sportifs
            </p>
            <div className="space-x-4">
              <Button asChild size="lg" className="bg-mps-primary hover:bg-mps-primary/90">
                <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "Accéder à mon espace" : "Se connecter"}
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">
                    Créer un compte
                  </Link>
                </Button>
              )}
            </div>
          </section>

          <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-mps-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-mps-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-mps-text">Plan personnalisé</h3>
              <p className="text-mps-text/80">
                Obtenez un programme d'entraînement sur mesure basé sur vos objectifs et votre condition physique.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-mps-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-mps-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-mps-text">Suivi de progression</h3>
              <p className="text-mps-text/80">
                Visualisez votre progression et recevez des ajustements réguliers pour maximiser vos résultats.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-16 h-16 bg-mps-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-mps-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-mps-text">Conseils d'experts</h3>
              <p className="text-mps-text/80">
                Accédez à des conseils nutritionnels et d'entraînement adaptés à vos besoins spécifiques.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
