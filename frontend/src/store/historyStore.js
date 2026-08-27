import { create } from 'zustand';
import { getLoanHistory } from '../api/loans';
import { getCardHistory } from '../api/cards';

const useApplicationHistoryStore = create((set) => ({
  history: [],
  isLoading: false,
  fetchHistory: async () => {
    set({ isLoading: true });
    try {
      const [loanApps, cardApps] = await Promise.all([
        getLoanHistory(),
        getCardHistory()
      ]);
      
      const formattedLoans = loanApps.map(app => ({
        id: `loan-${app.id}`,
        date: app.created_at,
        type: 'loan',
        result: app.prediction,
        confidence: Math.round((app.confidence_score || 0) * 100),
        score: Math.round((app.confidence_score || 0) * 100)
      }));

      const formattedCards = cardApps.map(app => ({
        id: `card-${app.id}`,
        date: app.created_at,
        type: 'card',
        result: app.prediction,
        confidence: Math.round((app.confidence_score || 0) * 100),
        score: Math.round((app.confidence_score || 0) * 100)
      }));

      const merged = [...formattedLoans, ...formattedCards].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      set({ history: merged, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch history:", error);
      set({ isLoading: false });
    }
  },
  addApplication: () => {
    // Handled by backend directly during prediction. 
    // State will refresh on next dashboard mount.
  },
  clearHistory: () => set({ history: [] })
}));

export const useApplicationHistory = () => {
  const store = useApplicationHistoryStore();
  
  return {
    history: store.history,
    isLoading: store.isLoading,
    fetchHistory: store.fetchHistory,
    addApplication: store.addApplication,
    clearHistory: store.clearHistory
  };
};
