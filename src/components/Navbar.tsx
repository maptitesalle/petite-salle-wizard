
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navbarClasses = `fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
    isScrolled ? 'bg-white shadow-soft py-3' : 'bg-transparent py-5'
  }`;

  return (
    <header className={navbarClasses}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-mps-primary font-bold text-2xl">Ma P'tite Salle</span>
        </Link>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={`font-medium transition-colors hover:text-mps-primary ${location.pathname === '/' ? 'text-mps-primary' : 'text-mps-text'}`}>
            Accueil
          </Link>
          <Link to="/wizard" className={`font-medium transition-colors hover:text-mps-primary ${location.pathname === '/wizard' ? 'text-mps-primary' : 'text-mps-text'}`}>
            Mes Données
          </Link>
          <Link to="/dashboard" className={`font-medium transition-colors hover:text-mps-primary ${location.pathname === '/dashboard' ? 'text-mps-primary' : 'text-mps-text'}`}>
            Dashboard
          </Link>
          <Link to="/login">
            <Button className="bg-mps-primary hover:bg-mps-primary/90 text-white flex items-center space-x-2">
              <User size={18} />
              <span>Connexion</span>
            </Button>
          </Link>
        </nav>
        
        {/* Mobile menu button */}
        <button className="md:hidden text-mps-primary" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-md animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link to="/" className={`font-medium transition-colors hover:text-mps-primary py-2 ${location.pathname === '/' ? 'text-mps-primary' : 'text-mps-text'}`} onClick={toggleMenu}>
              Accueil
            </Link>
            <Link to="/wizard" className={`font-medium transition-colors hover:text-mps-primary py-2 ${location.pathname === '/wizard' ? 'text-mps-primary' : 'text-mps-text'}`} onClick={toggleMenu}>
              Mes Données
            </Link>
            <Link to="/dashboard" className={`font-medium transition-colors hover:text-mps-primary py-2 ${location.pathname === '/dashboard' ? 'text-mps-primary' : 'text-mps-text'}`} onClick={toggleMenu}>
              Dashboard
            </Link>
            <Link to="/login" className="w-full" onClick={toggleMenu}>
              <Button className="bg-mps-primary hover:bg-mps-primary/90 text-white w-full flex items-center justify-center space-x-2">
                <User size={18} />
                <span>Connexion</span>
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
