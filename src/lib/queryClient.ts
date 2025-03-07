
import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,                     // Augmenter le nombre de tentatives
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponentiel avec max de 30s
        refetchOnWindowFocus: true,   // Changé à true pour recharger les données lors du retour sur la page
        staleTime: 10000,             // Considérer les données comme fraîches pendant 10 secondes
      },
    },
  });
};
