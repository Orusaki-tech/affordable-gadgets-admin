export type FinancingInquiryRequestRequest = {
    name: string;
    phone: string;
    email: string;
    product_id: number;
    provider_id?: number | null;
    offer_id?: number | null;
};
