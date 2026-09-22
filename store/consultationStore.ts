import { create } from 'zustand';
import { ConsultationData, PreferredTime } from '@/types/consultation';

interface ConsultationStore extends ConsultationData {
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setInterestedProduct: (product: string) => void;
  setRegion: (region: string) => void;
  setPreferredTime: (time: PreferredTime) => void;
  setPrivacyConsent: (consent: boolean) => void;
  reset: () => void;
}

// In-memory only — never persist form PII to browser storage.
const initialState: ConsultationData = {
  customerName: '',
  customerPhone: '',
  interestedProduct: '',
  region: '',
  preferredTime: 'ANYTIME',
  privacyConsent: false,
};

export const useConsultationStore = create<ConsultationStore>((set) => ({
  ...initialState,
  setCustomerName: (customerName) => set({ customerName }),
  setCustomerPhone: (customerPhone) => set({ customerPhone }),
  setInterestedProduct: (interestedProduct) => set({ interestedProduct }),
  setRegion: (region) => set({ region }),
  setPreferredTime: (preferredTime) => set({ preferredTime }),
  setPrivacyConsent: (privacyConsent) => set({ privacyConsent }),
  reset: () => set(initialState),
}));
