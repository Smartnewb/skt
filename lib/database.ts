import { supabase } from './supabase';
import { ApplicationData } from '@/types/application';

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
        applicant_business_name: data.applicant?.businessName,
        applicant_business_reg_number: data.applicant?.businessRegNumber,
        applicant_carrier: data.applicant?.contact.carrier,
        applicant_phone: data.applicant?.contact.phone,
        applicant_emergency_phone: data.applicant?.contact.emergencyPhone,
        applicant_email: data.applicant?.email,
        applicant_zipcode: data.applicant?.address.zipcode,
        applicant_address_basic: data.applicant?.address.basic,
        applicant_address_detail: data.applicant?.address.detail,
        applicant_referrer_name: data.applicant?.referrerName,

        // Payment
        payment_is_same_as_applicant: data.payment?.isSameAsApplicant,
        payment_relationship: data.payment?.relationship,
        payment_method: data.payment?.method,
        payment_bank_code: data.payment?.bankCode,
        payment_account_number: data.payment?.accountNumber,
        payment_card_company: data.payment?.cardCompany,
        payment_card_number: data.payment?.cardNumber,
        payment_card_expiry: data.payment?.cardExpiry,
        payment_card_birth_or_biz_number: data.payment?.cardBirthOrBizNumber,

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

// Transform database record back to ApplicationData
export function transformDbToApplication(dbRecord: any): ApplicationData & { id: string } {
    return {
        id: dbRecord.id,
        product: {
            id: dbRecord.product_id,
            category: dbRecord.product_category || 'INTERNET_TV', // Backward compatibility
            speed: dbRecord.product_speed,
            tvType: dbRecord.product_tv_type,
            discountType: dbRecord.product_discount_type || 'MOBILE_COMBO', // Backward compatibility
            monthlyPrice: dbRecord.product_monthly_price,
            cashBenefit: dbRecord.product_cash_benefit,
            isBest: false,
            description: '',
            wifiRouter: dbRecord.product_wifi_router,
        },
        applicant: {
            customerType: dbRecord.applicant_customer_type,
            name: dbRecord.applicant_name,
            birthDate: dbRecord.applicant_birth_date,
            gender: dbRecord.applicant_gender,
            businessName: dbRecord.applicant_business_name,
            businessRegNumber: dbRecord.applicant_business_reg_number,
            contact: {
                carrier: dbRecord.applicant_carrier,
                phone: dbRecord.applicant_phone,
                emergencyPhone: dbRecord.applicant_emergency_phone,
            },
            email: dbRecord.applicant_email,
            address: {
                zipcode: dbRecord.applicant_zipcode,
                basic: dbRecord.applicant_address_basic,
                detail: dbRecord.applicant_address_detail,
            },
            referrerName: dbRecord.applicant_referrer_name,
        },
        payment: {
            isSameAsApplicant: dbRecord.payment_is_same_as_applicant,
            relationship: dbRecord.payment_relationship,
            method: dbRecord.payment_method,
            bankCode: dbRecord.payment_bank_code,
            accountNumber: dbRecord.payment_account_number,
            cardCompany: dbRecord.payment_card_company,
            cardNumber: dbRecord.payment_card_number,
            cardExpiry: dbRecord.payment_card_expiry,
            cardBirthOrBizNumber: dbRecord.payment_card_birth_or_biz_number,
        },
        giftRecipient: {
            relationship: dbRecord.gift_relationship,
            residentType: dbRecord.gift_resident_type,
            name: dbRecord.gift_name,
            birthDateOrRegNumber: dbRecord.gift_birth_date_or_reg_number,
            bankCode: dbRecord.gift_bank_code,
            accountNumber: dbRecord.gift_account_number,
            giftCardOption: dbRecord.gift_card_option,
        },
        customerRequest: dbRecord.customer_request,
        status: dbRecord.status,
        submittedAt: dbRecord.submitted_at,
    };
}

// Create new application
export async function createApplication(data: ApplicationData) {
    const dbData = transformApplicationToDb(data);

    const { data: result, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
