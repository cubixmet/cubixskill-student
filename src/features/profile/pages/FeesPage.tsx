import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, ShieldCheck, CheckCircle2, Clock, CreditCard, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../services/apiClient';

interface FeeInstallment {
  id: string;
  sequence: number;
  label: string;
  due_date: string;
  amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: string;
}

interface FeePayment {
  id: string;
  receipt_number: string;
  amount: number;
  currency: string;
  payment_date: string;
  collection_mode: string;
  payment_method: string;
  reference_number: string;
  status: string;
}

interface StudentFeeAccount {
  fee_account_id: string;
  course_id: string;
  course_title: string;
  academy_name: string;
  total_fee: number;
  effective_fee: number;
  paid_amount: number;
  balance: number;
  status: string;
  next_due_date: string | null;
  next_installment_amount: number;
  currency: string;
  installments: FeeInstallment[];
  payments: FeePayment[];
}

export const FeesPage: React.FC = () => {
  const { courseUuid } = useParams<{ courseUuid: string }>();
  const [feeAccounts, setFeeAccounts] = useState<StudentFeeAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<StudentFeeAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  const fetchFees = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await apiClient.get('/api/v1/fees/my-accounts/');
      const data = res?.data?.data || res?.data || res;
      const list = Array.isArray(data) ? data : data?.results || [];
      setFeeAccounts(list);
      if (courseUuid) {
        const found = list.find((a: StudentFeeAccount) => a.course_id === courseUuid);
        setSelectedAccount(found || list[0] || null);
      } else {
        setSelectedAccount(list[0] || null);
      }
    } catch {
      setError("Failed to load your fee collection account.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [courseUuid]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async (payAmount?: number) => {
    if (!selectedAccount || isProcessingPayment) return;
    const amountToPay = payAmount || (selectedAccount.next_installment_amount > 0 ? selectedAccount.next_installment_amount : selectedAccount.balance);
    if (amountToPay <= 0) return;

    setIsProcessingPayment(true);
    setPaymentSuccessMsg(null);
    setError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Failed to load Razorpay payment SDK. Please check your network connection.');
        setIsProcessingPayment(false);
        return;
      }

      const orderRes: any = await apiClient.post(`/api/v1/fees/my-accounts/${selectedAccount.fee_account_id}/checkout/`, {
        amount: amountToPay,
      });

      const orderData = orderRes?.data?.data || orderRes?.data || orderRes;
      const { razorpay_order_id, razorpay_key_id, amount } = orderData;

      const options = {
        key: razorpay_key_id,
        amount: amount,
        currency: selectedAccount.currency || 'INR',
        name: selectedAccount.academy_name || 'CubixSkill Academy',
        description: `Fee Payment for ${selectedAccount.course_title}`,
        order_id: razorpay_order_id,
        handler: async function (response: any) {
          try {
            await apiClient.post(`/api/v1/fees/my-accounts/${selectedAccount.fee_account_id}/verify/`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: amountToPay,
            });
            setPaymentSuccessMsg(`Payment of ₹${amountToPay.toLocaleString('en-IN')} verified successfully!`);
            fetchFees();
          } catch (err: any) {
            setError('Payment verification failed server-side. Please contact support if debited.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
        prefill: {},
        theme: {
          color: '#2563EB',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err?.response?.data?.message || 'Failed to initiate online payment.');
      setIsProcessingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" className="px-2.5 py-1 text-xs font-semibold">Fully Paid</Badge>;
      case 'PARTIALLY_PAID':
      case 'PARTIAL':
        return <Badge variant="warning" className="px-2.5 py-1 text-xs font-semibold">Partially Paid</Badge>;
      case 'OVERDUE':
        return <Badge variant="danger" className="px-2.5 py-1 text-xs font-semibold">Overdue</Badge>;
      default:
        return <Badge variant="info" className="px-2.5 py-1 text-xs font-semibold">Unpaid</Badge>;
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto w-full px-2 sm:px-4 py-4 min-w-0">
      {/* Header Card */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs rounded-2xl space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-[#2563EB] shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">Course Fee Collection</h1>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">
                Track your course fee balance, upcoming installments, and payment receipts.
              </p>
            </div>
          </div>
          {feeAccounts.length > 1 && (
            <select
              value={selectedAccount?.fee_account_id || ''}
              onChange={(e) => {
                const found = feeAccounts.find((a) => a.fee_account_id === e.target.value);
                if (found) setSelectedAccount(found);
              }}
              className="h-9 px-3 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-slate-900 dark:text-[#F8FAFC] font-medium"
            >
              {feeAccounts.map((acc) => (
                <option key={acc.fee_account_id} value={acc.fee_account_id}>
                  {acc.course_title}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {paymentSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{paymentSuccessMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <Card padding="md" className="space-y-4 bg-white border border-slate-200">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-20 w-full" />
        </Card>
      ) : selectedAccount ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block">Course Fee Liability</span>
              <p className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
                {selectedAccount.currency} {selectedAccount.total_fee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-slate-400 dark:text-[#64748B] block">Canonical selling price</span>
            </Card>

            <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block">Total Amount Paid</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {selectedAccount.currency} {selectedAccount.paid_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block">Verified ledger payments</span>
            </Card>

            <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-1 border-l-4 border-l-amber-500">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block">Remaining Balance</span>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {selectedAccount.currency} {selectedAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 block">
                {selectedAccount.next_due_date ? `Next due: ${selectedAccount.next_due_date}` : 'No due date'}
              </span>
            </Card>
          </div>

          {/* Account Status Card & Actions */}
          <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 dark:border-[#263244] pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">{selectedAccount.course_title}</h3>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">{selectedAccount.academy_name}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedAccount.status)}
              </div>
            </div>

            {selectedAccount.balance > 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] block">
                    Next Due Amount: {selectedAccount.currency} {selectedAccount.next_installment_amount > 0 ? selectedAccount.next_installment_amount.toLocaleString('en-IN') : selectedAccount.balance.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">
                    Pay online instantly using CubixSkill Razorpay Payment Gateway.
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={() => handlePayNow()}
                  disabled={isProcessingPayment}
                  className="w-full sm:w-auto h-11 px-6 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-xl min-h-[44px] shadow-sm flex items-center justify-center gap-2 text-xs shrink-0 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessingPayment ? 'Initiating Checkout...' : 'Pay Now via Razorpay'}</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your course fee account is fully paid! No outstanding balance.</span>
              </div>
            )}
          </Card>

          {/* Installment Schedule Table */}
          {selectedAccount.installments && selectedAccount.installments.length > 0 && (
            <Card padding="none" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-[#263244] font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
                Installment Schedule ({selectedAccount.installments.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8]">
                      <th className="px-4 py-2.5">#</th>
                      <th className="px-4 py-2.5">Label</th>
                      <th className="px-4 py-2.5">Due Date</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Paid</th>
                      <th className="px-4 py-2.5">Remaining</th>
                      <th className="px-4 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#263244] text-xs">
                    {selectedAccount.installments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-[#172033]/50">
                        <td className="px-4 py-3 font-mono font-medium text-slate-500">{inst.sequence}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-[#F8FAFC]">{inst.label}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-[#CBD5E1]">{inst.due_date}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-[#F8FAFC]">₹{inst.amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-medium">₹{inst.paid_amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-amber-600 dark:text-amber-400 font-medium">₹{inst.remaining_amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            inst.status === 'PAID' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                            inst.status === 'PARTIALLY_PAID' || inst.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                            inst.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {inst.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Payment History Ledger */}
          <Card padding="none" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-[#263244] font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">
              Verified Payment Receipts ({selectedAccount.payments.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8]">
                    <th className="px-4 py-2.5">Receipt #</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Amount</th>
                    <th className="px-4 py-2.5">Collection Mode</th>
                    <th className="px-4 py-2.5">Method</th>
                    <th className="px-4 py-2.5">Reference ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#263244] text-xs">
                  {selectedAccount.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-[#172033]/50">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-[#F8FAFC]">{p.receipt_number}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-[#CBD5E1]">{p.payment_date}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-[#CBD5E1]">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px]">
                          {p.collection_mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-[#CBD5E1]">{p.payment_method}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{p.reference_number || 'N/A'}</td>
                    </tr>
                  ))}
                  {selectedAccount.payments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-slate-500 dark:text-[#94A3B8]">
                        No verified payment receipts found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <Card padding="lg" className="text-center space-y-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl">
          <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">No Outstanding Course Fees</h3>
          <p className="text-slate-500 dark:text-[#94A3B8] text-xs">Your fee status for this course is fully settled or complimentary.</p>
        </Card>
      )}
    </div>
  );
};

