import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { loadRazorpayScript } from '../../../lib/razorpay';
import { checkoutService } from '../services/checkout.service';

export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  academyUuid: string;
  courseUuid: string;
  courseTitle: string;
  academyName: string;
  price: number | string;
  isFree?: boolean;
  onSuccess?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  academyUuid,
  courseUuid,
  courseTitle,
  academyName,
  price,
  isFree = false,
  onSuccess,
}) => {
  const [statusState, setStatusState] = useState<
    'idle' | 'creating_order' | 'checkout_open' | 'verifying' | 'success' | 'failed'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const numericPrice = typeof price === 'number' ? price : parseFloat(price) || 0;

  const handleStartCheckout = async () => {
    setErrorMessage(null);

    // Free course path
    if (isFree || numericPrice === 0) {
      try {
        setStatusState('creating_order');
        const res = await checkoutService.createPaymentOrder(academyUuid, courseUuid);
        if (res.is_free || res.success) {
          setStatusState('success');
          if (onSuccess) onSuccess();
        }
      } catch (err: any) {
        setStatusState('failed');
        setErrorMessage(err.response?.data?.message || 'Failed to process free enrollment.');
      }
      return;
    }

    // Paid course Razorpay path
    try {
      setStatusState('creating_order');

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setStatusState('failed');
        setErrorMessage('Failed to load Razorpay SDK. Please check your network connection.');
        return;
      }

      // Create Razorpay Order on backend
      const orderRes = await checkoutService.createPaymentOrder(academyUuid, courseUuid, undefined, numericPrice);
      if (!orderRes.success || !orderRes.order) {
        setStatusState('failed');
        setErrorMessage('Could not generate secure payment order.');
        return;
      }

      const safeOrder = orderRes.order;

      // Open Razorpay SDK
      setStatusState('checkout_open');

      const options = {
        key: safeOrder.razorpay_key_id,
        order_id: safeOrder.razorpay_order_id,
        amount: safeOrder.amount,
        currency: safeOrder.currency,
        name: safeOrder.academy_name || academyName,
        description: safeOrder.course_name || courseTitle,
        handler: async (response: any) => {
          try {
            setStatusState('verifying');
            const verifyRes = await checkoutService.verifyPaymentSignature({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setStatusState('success');
              if (onSuccess) onSuccess();
            } else {
              setStatusState('failed');
              setErrorMessage(verifyRes.message || 'Payment signature verification failed.');
            }
          } catch (verifyErr: any) {
            setStatusState('failed');
            setErrorMessage(verifyErr.response?.data?.message || 'Verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            if (statusState !== 'success' && statusState !== 'verifying') {
              setStatusState('idle');
            }
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setStatusState('failed');
        setErrorMessage(resp.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err: any) {
      setStatusState('failed');
      setErrorMessage(err.response?.data?.message || 'Error initializing secure payment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] max-w-md w-full p-6 space-y-6 shadow-2xl text-left">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {statusState === 'success' ? 'Enrollment Active' : 'Secure Checkout'}
            </h3>
          </div>
          {statusState !== 'creating_order' && statusState !== 'verifying' && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-[#F8FAFC] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ORDER SUMMARY */}
        <div className="bg-slate-50 dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-[#263244] space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider block">
              Course
            </span>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">{courseTitle}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-[#263244] text-xs">
            <span className="text-slate-500 dark:text-[#94A3B8]">Academy</span>
            <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{academyName}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-[#94A3B8]">Total Amount</span>
            <span className="text-base font-semibold text-[#2563EB] dark:text-[#60A5FA]">
              {isFree || numericPrice === 0 ? 'Free' : `₹${numericPrice.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* MESSAGES & STATES */}
        {statusState === 'creating_order' && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-3">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-[#2563EB]" />
            <span>Preparing secure payment order...</span>
          </div>
        )}

        {statusState === 'verifying' && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-amber-600" />
            <span>Verifying payment signature with backend... Please wait.</span>
          </div>
        )}

        {statusState === 'success' && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)] text-emerald-800 dark:text-[#6EE7B7] text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#6EE7B7]" />
              <span>Payment Successful!</span>
            </div>
            <p className="text-[11px] font-normal leading-relaxed">
              Your payment has been verified and your course enrollment is now active.
            </p>
          </div>
        )}

        {statusState === 'failed' && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[#DC2626] dark:text-[#F87171] text-xs space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Payment Failed</span>
            </div>
            <p className="text-[11px] font-normal leading-relaxed">
              {errorMessage || 'Your payment could not be completed. You can try again.'}
            </p>
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div className="pt-2 flex items-center justify-end gap-2">
          {statusState === 'success' ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Start Learning
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={statusState === 'creating_order' || statusState === 'verifying'}
                className="px-4 py-2.5 border border-slate-200 dark:border-[#263244] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-[#172033] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartCheckout}
                disabled={statusState === 'creating_order' || statusState === 'checkout_open' || statusState === 'verifying'}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {statusState === 'creating_order'
                    ? 'Preparing...'
                    : statusState === 'verifying'
                    ? 'Verifying...'
                    : statusState === 'failed'
                    ? 'Try Again'
                    : 'Proceed to Payment'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
