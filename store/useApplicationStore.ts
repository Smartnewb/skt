import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApplicationData } from '@/types/application';

interface ApplicationStore extends ApplicationData {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    setProduct: (product: ApplicationData['product']) => void;
    setApplicant: (applicant: ApplicationData['applicant']) => void;
    setPayment: (payment: ApplicationData['payment']) => void;
    setGiftRecipient: (gift: ApplicationData['giftRecipient']) => void;
    setTerms: (terms: ApplicationData['terms']) => void;
    setCustomerRequest: (request: string) => void;
    submit: () => void;
    reset: () => void;
}

export const useApplicationStore = create<ApplicationStore>()(
    persist(
        (set, get) => ({
            // Initial state
            currentStep: 0,
            product: undefined,
            applicant: undefined,
            payment: undefined,
            giftRecipient: undefined,
            terms: undefined,
            customerRequest: undefined,
            submittedAt: undefined,
            status: 'PENDING',

            // Actions
            setCurrentStep: (step) => set({ currentStep: step }),

            setProduct: (product) => set({ product }),

            setApplicant: (applicant) => set({ applicant }),

            setPayment: (payment) => set({ payment }),

            setGiftRecipient: (giftRecipient) => set({ giftRecipient }),

            setTerms: (terms) => set({ terms }),

            setCustomerRequest: (customerRequest) => set({ customerRequest }),

            submit: () => {
                const data = get();
                const submittedData: ApplicationData = {
                    product: data.product,
                    applicant: data.applicant,
                    payment: data.payment,
                    giftRecipient: data.giftRecipient,
                    terms: data.terms,
                    customerRequest: data.customerRequest,
                    submittedAt: new Date().toISOString(),
                    status: 'PENDING',
                };

                // In a real app, this would send to an API
                console.log('Submitting application:', submittedData);

                // Save to localStorage for admin panel to retrieve
                const applications = JSON.parse(localStorage.getItem('applications') || '[]');
                applications.push({ ...submittedData, id: Date.now().toString() });
                localStorage.setItem('applications', JSON.stringify(applications));

                set({ submittedAt: submittedData.submittedAt, status: 'PENDING' });
            },

            reset: () => set({
                currentStep: 0,
                product: undefined,
                applicant: undefined,
                payment: undefined,
                giftRecipient: undefined,
                terms: undefined,
                customerRequest: undefined,
                submittedAt: undefined,
                status: 'PENDING',
            }),
        }),
        {
            name: 'skt-application-storage',
        }
    )
);
