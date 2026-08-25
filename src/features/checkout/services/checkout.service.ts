import { apiClient } from '../../../services/apiClient';

export interface CreateOrderResponse {
  success: boolean;
  is_free?: boolean;
  enrollment_id?: string;
  order?: {
    internal_order_id: string;
    transaction_uuid: string;
    razorpay_order_id: string;
    razorpay_key_id: string;
    amount: number;
    currency: string;
    academy_name: string;
    course_name: string;
  };
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  order_number?: string;
  code?: string;
}

export const checkoutService = {
  async createPaymentOrder(
    academyUuid: string,
    courseUuid: string,
    couponCode?: string,
    expectedFinalAmount?: number
  ): Promise<CreateOrderResponse> {
    const res = await apiClient.post<any>('/api/v1/payments/orders/', {
      academy_uuid: academyUuid,
      course_uuid: courseUuid,
      coupon_code: couponCode,
      expected_final_amount: expectedFinalAmount !== undefined ? expectedFinalAmount : undefined,
    });
    return res?.data || res;
  },

  async verifyPaymentSignature(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
    const res = await apiClient.post<any>('/api/v1/payments/verify/', payload);
    return res?.data || res;
  },
};
