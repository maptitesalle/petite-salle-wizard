
import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,                     // Réduire pour éviter trop de tentatives qui ralentissent
        retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 5000), // Linéaire avec max de 5s (réduit)
        refetchOnWindowFocus: false,  // Désactiver pour éviter des appels inutiles
        staleTime: 60000,             // Considérer les données comme fraîches pendant 60 secondes (augmenté)
        gcTime: 5 * 60 * 1000,        // Garder en cache pendant 5 minutes (anciennement cacheTime)
        refetchOnMount: false,        // Ne pas refetch automatiquement à chaque montage pour éviter les surcharges
      },
    },
  });
};
