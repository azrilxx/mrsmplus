import { useMockFirestore } from './useMockFirestore';

export const useFirebaseWithFallback = () => {
  const mockFirestore = useMockFirestore();
  
  return {
    getDashboardData: mockFirestore.getDashboardData,
    isUsingMockData: true // For MVP, always use mock data
  };
};