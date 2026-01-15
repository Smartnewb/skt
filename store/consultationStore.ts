import { create } from 'zustand';
import { ConsultationData, ConsultationProduct } from '@/types/consultation';

interface ConsultationStore extends ConsultationData {
  setProduct: (product: ConsultationProduct) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setPrivacyConsent: (consent: boolean) => void;
  reset: () => void;
}

const initialState: ConsultationData = {
  product: null,
  customerName: '',
  customerPhone: '',
  privacyConsent: false,
};

export const useConsultationStore = create<ConsultationStore>((set) => ({
  ...initialState,
  setProduct: (product) => set({ product }),
  setCustomerName: (name) => set({ customerName: name }),
  setCustomerPhone: (phone) => set({ customerPhone: phone }),
  setPrivacyConsent: (consent) => set({ privacyConsent: consent }),
  reset: () => set(initialState),
}));
