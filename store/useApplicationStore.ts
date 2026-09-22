import { create } from 'zustand';
import { ApplicationData, ProductCategory, DiscountType, Speed, TVType } from '@/types/application';
import type { AgreementState } from '@/lib/termsData';

interface ApplicationStore extends ApplicationData {
    // Product selection state
    selectedCategory?: ProductCategory;
    selectedDiscountType?: DiscountType;
    selectedSpeed?: Speed;
    selectedTVType?: TVType;

    currentStep: number;
    agreements: AgreementState | null;
    setCurrentStep: (step: number) => void;

    // New setters for category and discount
    setCategory: (category: ProductCategory) => void;
    setDiscountType: (discountType: DiscountType) => void;
    setSpeed: (speed: Speed) => void;
    setTVType: (tvType: TVType) => void;

    setProduct: (product: ApplicationData['product']) => void;
    setApplicant: (applicant: ApplicationData['applicant']) => void;
    setPayment: (payment: ApplicationData['payment']) => void;
    setGiftRecipient: (gift: ApplicationData['giftRecipient']) => void;
    setTerms: (terms: ApplicationData['terms']) => void;
    setCustomerRequest: (request: string) => void;
    setAgreements: (agreements: AgreementState) => void;
    reset: () => void;
}

// In-memory only — account/card/birthdate PII must never be persisted to
// browser storage (no zustand `persist`, no localStorage/sessionStorage).
export const useApplicationStore = create<ApplicationStore>()((set) => ({
    // Initial state
    currentStep: 0,
    selectedCategory: undefined,
    selectedDiscountType: undefined,
    selectedSpeed: undefined,
    selectedTVType: undefined,
    product: undefined,
    applicant: undefined,
    payment: undefined,
    giftRecipient: undefined,
    terms: undefined,
    customerRequest: undefined,
    agreements: null,
    submittedAt: undefined,
    status: 'PENDING',

    // Actions
    setCurrentStep: (step) => set({ currentStep: step }),

    setCategory: (selectedCategory) => set({ selectedCategory }),

    setDiscountType: (selectedDiscountType) => set({ selectedDiscountType }),

    setSpeed: (selectedSpeed) => set({ selectedSpeed }),

    setTVType: (selectedTVType) => set({ selectedTVType }),

    setProduct: (product) => set({ product }),

    setApplicant: (applicant) => set({ applicant }),

    setPayment: (payment) => set({ payment }),

    setGiftRecipient: (giftRecipient) => set({ giftRecipient }),

    setTerms: (terms) => set({ terms }),

    setCustomerRequest: (customerRequest) => set({ customerRequest }),

    setAgreements: (agreements) => set({ agreements }),

    reset: () => set({
        currentStep: 0,
        selectedCategory: undefined,
        selectedDiscountType: undefined,
        selectedSpeed: undefined,
        selectedTVType: undefined,
        product: undefined,
        applicant: undefined,
        payment: undefined,
        giftRecipient: undefined,
        terms: undefined,
        customerRequest: undefined,
        agreements: null,
        submittedAt: undefined,
        status: 'PENDING',
    }),
}));
