import { getSupabaseServer } from './supabaseServer';
import {
    ApplicationData,
    CustomerType,
    DiscountType,
    Gender,
    PaymentMethod,
    ProductCategory,
    Relationship,
    ResidentType,
    Speed,
} from '@/types/application';

// Transform ApplicationData to flat database format
export function transformApplicationToDb(data: ApplicationData) {
    return {
        // Product
        product_id: data.product?.id,
        product_category: data.product?.category,
        product_discount_type: data.product?.discountType,
        product_speed: data.product?.speed,
        product_tv_type: data.product?.tvType,
        product_monthly_price: data.product?.monthlyPrice,
        product_cash_benefit: data.product?.cashBenefit,
        product_wifi_router: data.product?.wifiRouter,

        // Applicant
        applicant_customer_type: data.applicant?.customerType,
        applicant_name: data.applicant?.name,
        applicant_birth_date: data.applicant?.birthDate,
        applicant_gender: data.applicant?.gender,
        applicant_carrier: data.applicant?.contact.carrier,
        applicant_phone: data.applicant?.contact.phone,
        applicant_emergency_phone: data.applicant?.contact.emergencyPhone,
        applicant_email: data.applicant?.email,
        applicant_zipcode: data.applicant?.address.zipcode,
        applicant_address_basic: data.applicant?.address.basic,
        applicant_address_detail: data.applicant?.address.detail,
        applicant_referrer_name: data.applicant?.referrerName,

        // Payment
        payment_method: data.payment?.method,
        payment_bank_code: data.payment?.bankCode,
        payment_account_number: data.payment?.accountNumber,
        payment_card_company: data.payment?.cardCompany,
        payment_card_number: data.payment?.cardNumber,
        payment_card_expiry: data.payment?.cardExpiry,
        payment_card_birth_date: data.payment?.cardBirthDate,

        // Gift
        gift_relationship: data.giftRecipient?.relationship,
        gift_resident_type: data.giftRecipient?.residentType,
        gift_name: data.giftRecipient?.name,
        gift_birth_date_or_reg_number: data.giftRecipient?.birthDateOrRegNumber,
        gift_bank_code: data.giftRecipient?.bankCode,
        gift_account_number: data.giftRecipient?.accountNumber,
        gift_card_option: data.giftRecipient?.giftCardOption,

        // Additional
        customer_request: data.customerRequest,
        status: data.status || 'PENDING',
        submitted_at: data.submittedAt || new Date().toISOString(),
    };
}

interface ApplicationDbRecord {
    id: string;
    product_id?: string | null;
    product_category?: string | null;
    product_discount_type?: string | null;
    product_speed?: string | null;
    product_tv_type?: string | null;
    product_monthly_price?: number | null;
    product_cash_benefit?: number | null;
    product_wifi_router?: boolean | null;
    applicant_customer_type?: string | null;
    applicant_name?: string | null;
    applicant_birth_date?: string | null;
    applicant_gender?: string | null;
    applicant_carrier?: string | null;
    applicant_phone?: string | null;
    applicant_emergency_phone?: string | null;
    applicant_email?: string | null;
    applicant_zipcode?: string | null;
    applicant_address_basic?: string | null;
    applicant_address_detail?: string | null;
    applicant_referrer_name?: string | null;
    payment_method?: string | null;
    payment_bank_code?: string | null;
    payment_account_number?: string | null;
    payment_card_company?: string | null;
    payment_card_number?: string | null;
    payment_card_expiry?: string | null;
    payment_card_birth_date?: string | null;
    gift_relationship?: string | null;
    gift_resident_type?: string | null;
    gift_name?: string | null;
    gift_birth_date_or_reg_number?: string | null;
    gift_bank_code?: string | null;
    gift_account_number?: string | null;
    gift_card_option?: string | null;
    customer_request?: string | null;
    status?: string | null;
    submitted_at?: string | null;
}

// Transform database record back to ApplicationData
export function transformDbToApplication(dbRecord: ApplicationDbRecord): ApplicationData & { id: string } {
    return {
        id: dbRecord.id,
        product: {
            id: dbRecord.product_id ?? '',
            category: (dbRecord.product_category as ProductCategory) || 'INTERNET_TV', // Backward compatibility
            speed: (dbRecord.product_speed as Speed) ?? '100M',
            tvType: dbRecord.product_tv_type ?? undefined,
            discountType: (dbRecord.product_discount_type as DiscountType) || 'MOBILE_COMBO', // Backward compatibility
            monthlyPrice: dbRecord.product_monthly_price ?? 0,
            cashBenefit: dbRecord.product_cash_benefit ?? 0,
            isBest: false,
            description: '',
            wifiRouter: dbRecord.product_wifi_router ?? undefined,
        },
        applicant: {
            customerType: (dbRecord.applicant_customer_type as CustomerType) ?? 'PERSONAL',
            name: dbRecord.applicant_name ?? '',
            birthDate: dbRecord.applicant_birth_date ?? '',
            gender: (dbRecord.applicant_gender as Gender) ?? 'MALE',
            contact: {
                carrier: dbRecord.applicant_carrier ?? '',
                phone: dbRecord.applicant_phone ?? '',
                emergencyPhone: dbRecord.applicant_emergency_phone ?? undefined,
            },
            email: dbRecord.applicant_email ?? undefined,
            address: {
                zipcode: dbRecord.applicant_zipcode ?? '',
                basic: dbRecord.applicant_address_basic ?? '',
                detail: dbRecord.applicant_address_detail ?? '',
            },
            referrerName: dbRecord.applicant_referrer_name ?? undefined,
        },
        payment: {
            method: (dbRecord.payment_method as PaymentMethod) ?? 'BANK_TRANSFER',
            bankCode: dbRecord.payment_bank_code ?? undefined,
            accountNumber: dbRecord.payment_account_number ?? undefined,
            cardCompany: dbRecord.payment_card_company ?? undefined,
            cardNumber: dbRecord.payment_card_number ?? undefined,
            cardExpiry: dbRecord.payment_card_expiry ?? undefined,
            cardBirthDate: dbRecord.payment_card_birth_date ?? undefined,
        },
        giftRecipient: {
            relationship: (dbRecord.gift_relationship as Relationship) ?? 'SELF',
            residentType: (dbRecord.gift_resident_type as ResidentType) ?? 'DOMESTIC',
            name: dbRecord.gift_name ?? '',
            birthDateOrRegNumber: dbRecord.gift_birth_date_or_reg_number ?? '',
            bankCode: dbRecord.gift_bank_code ?? '',
            accountNumber: dbRecord.gift_account_number ?? '',
            giftCardOption: dbRecord.gift_card_option ?? undefined,
        },
        customerRequest: dbRecord.customer_request ?? undefined,
        status: (dbRecord.status as ApplicationData['status']) ?? 'PENDING',
        submittedAt: dbRecord.submitted_at ?? undefined,
    };
}

// Create new application
export async function createApplication(data: ApplicationData) {
    const dbData = transformApplicationToDb(data);

    const { data: result, error } = await getSupabaseServer()
        .from('applications')
        .insert([dbData])
        .select()
        .single();

    if (error) {
        console.error('Error creating application:', error);
        throw error;
    }

    return transformDbToApplication(result);
}

// Get all applications
export async function getApplications() {
    const { data, error } = await getSupabaseServer()
        .from('applications')
        .select('*')
        .order('submitted_at', { ascending: false });

    if (error) {
        console.error('Error fetching applications:', error);
        throw error;
    }

    return data.map(transformDbToApplication);
}

// Get single application by ID
export async function getApplication(id: string) {
    const { data, error } = await getSupabaseServer()
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching application:', error);
        throw error;
    }

    return transformDbToApplication(data);
}

// Update application status
export async function updateApplicationStatus(
    id: string,
    status: string
) {
    const { data, error } = await getSupabaseServer()
        .from('applications')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating application status:', error);
        throw error;
    }

    return transformDbToApplication(data);
}
