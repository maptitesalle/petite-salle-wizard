
import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-mps-primary">Ma P'tite Salle</h3>
            <p className="text-sm text-mps-text">
              Votre coach personnel intelligent pour atteindre vos objectifs de forme et de santé.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-mps-primary">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-mps-text hover:text-mps-primary transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/wizard" className="text-sm text-mps-text hover:text-mps-primary transition-colors">
                  Mes Données
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-sm text-mps-text hover:text-mps-primary transition-colors">
                  Dashboard
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-mps-primary">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-mps-text hover:text-mps-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mps-text hover:text-mps-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-mps-text hover:text-mps-primary transition-colors">
                  Confidentialité
                </a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-mps-primary">Contact</h4>
            <p className="text-sm text-mps-text">
              123 Rue du Sport<br />
              75001 Paris, France<br />
              contact@maptitesalle.fr<br />
              +33 1 23 45 67 89
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-mps-text">
            &copy; {new Date().getFullYear()} Ma P'tite Salle. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span className="text-sm text-mps-text">Créé avec</span>
            <Heart size={16} className="text-mps-primary" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
