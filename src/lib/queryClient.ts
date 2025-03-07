
import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,                     // Réduire pour éviter trop de tentatives qui ralentissent
        retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 10000), // Linéaire avec max de 10s
        refetchOnWindowFocus: false,  // Désactiver pour éviter des appels inutiles
        staleTime: 30000,             // Considérer les données comme fraîches pendant 30 secondes
        cacheTime: 5 * 60 * 1000,     // Garder en cache pendant 5 minutes
        refetchOnMount: true,         // Refetch à chaque montage de composant
      },
    },
  });
};
