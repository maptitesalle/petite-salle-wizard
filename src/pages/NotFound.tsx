
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mps-secondary/30">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-mps-primary mb-4">404</h1>
        <p className="text-xl text-mps-text mb-8">Oops! Page non trouvée</p>
        <Link to="/">
          <Button className="bg-mps-primary hover:bg-mps-primary/90">
            <Home className="mr-2 h-4 w-4" /> Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
