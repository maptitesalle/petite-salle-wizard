
import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,                     // Augmenter légèrement le nombre de tentatives
        retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 5000), // Linéaire avec max de 5s
        refetchOnWindowFocus: false,  // Désactiver pour éviter des appels inutiles
        staleTime: 2 * 60 * 1000,     // Considérer les données comme fraîches pendant 2 minutes
        gcTime: 10 * 60 * 1000,       // Garder en cache pendant 10 minutes
        refetchOnMount: true,         // Refetch à chaque montage pour assurer la fraîcheur des données
      },
      mutations: {
        retry: 1,                     // Une seule tentative pour les mutations
        retryDelay: 1000,             // Délai fixe de 1s
      }
    },
  });
};
