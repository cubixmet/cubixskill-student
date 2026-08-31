import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { apiClient } from '../../../services/apiClient';

export const FeesPage: React.FC = () => {
  const { courseUuid } = useParams<{ courseUuid: string }>();
  const [feeAccount, setFeeAccount] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchFees = async () => {
      try {
        const params = courseUuid ? { course_id: courseUuid } : {};
        const res: any = await apiClient.get('/api/v1/fee-accounts/my-fee-accounts/', { params });
        const data = res?.data || res;
        const list = Array.isArray(data) ? data : data?.results || [];
        if (isMounted) {
          setFeeAccount(list[0] || null);
        }
      } catch {
        if (isMounted) {
          setError("Failed to load fee collection account.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFees();

    return () => {
      isMounted = false;
    };
  }, [courseUuid]);

  return (
    <div className="space-y-6 font-sans text-xs text-left max-w-4xl mx-auto w-full">
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs rounded-2xl space-y-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#2563EB]" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">Fees &amp; Payments</h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">
          View your course fee balance, payment installments, and payment history.
        </p>
      </Card>

      {isLoading ? (
        <Card padding="md" className="space-y-3 bg-white border border-slate-200">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
        </Card>
      ) : error ? (
        <Card padding="lg" className="text-center text-rose-600 font-semibold bg-white border border-rose-200">
          {error}
        </Card>
      ) : feeAccount ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] space-y-1 rounded-2xl">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Total Amount</span>
              <p className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
                {feeAccount.currency || 'INR'} {feeAccount.total_amount || 0}
              </p>
            </Card>

            <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] space-y-1 rounded-2xl">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Paid Amount</span>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {feeAccount.currency || 'INR'} {feeAccount.paid_amount || 0}
              </p>
            </Card>

            <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] space-y-1 rounded-2xl">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Due Amount</span>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {feeAccount.currency || 'INR'} {feeAccount.due_amount || 0}
              </p>
            </Card>
          </div>

          <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] space-y-3 rounded-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-[#F8FAFC]">Fee Account Status</h3>
              <Badge variant={feeAccount.status === 'PAID' ? 'success' : 'warning'}>
                {feeAccount.status || 'ACTIVE'}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-[#CBD5E1] text-xs">
              Fee Plan: <strong className="text-slate-900 dark:text-[#F8FAFC]">{feeAccount.fee_plan_name || 'Standard Plan'}</strong>
            </p>
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
