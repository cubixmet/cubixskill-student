import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  RefreshCw,
  BookOpen,
  ArrowLeft,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { usePublicAcademy } from '../../public-academy/layouts/PublicAcademyLayout';
import { useAuthStore } from '../../auth/store/auth.store';
import { checkoutService, type CreateOrderResponse } from '../services/checkout.service';
import { studentPortalService } from '../../../services/studentPortal.service';
import { openRazorpayCheckout } from '../../../lib/razorpay';
import { buildLoginUrl, setLastAcademy, clearCheckoutIntent } from '../../../lib/navigationIntent';
import { API_ENDPOINTS } from '../../../config/apiEndpoints';
import { apiClient } from '../../../services/apiClient';
import { getCoursePricing } from '../../../stores/course.store';

interface CourseData {
  uuid: string;
  id?: string;
  title: string;
  tagline?: string;
  description?: string;
  price: number;
  salePrice?: number;
  isFree?: boolean;
  pricing?: any;
  thumbnailUrl?: string;
  instructorName?: string;
  level?: string;
}

import { buildStudentCourseOverviewPath, isValidUuid } from '../../../utils/routeBuilder';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { academyUuid: paramUuid, courseUuid: paramCourseUuid } = useParams<{ academyUuid?: string; courseUuid?: string }>();
  const context = usePublicAcademy();

  const academyUuid = context?.academyUuid || paramUuid || '';
  const courseUuid = paramCourseUuid || '';
  const academyEntity = context?.academyEntity || { name: 'Academy', logoUrl: '' };

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const student = useAuthStore((state) => state.student);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [statusState, setStatusState] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'failed'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Save last academy context
  useEffect(() => {
    if (academyUuid) {
      setLastAcademy(academyUuid);
    }
  }, [academyUuid]);

  // Auth Guard check: Redirect if unauthenticated after auth finishes loading
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      const currentPath = `/${academyUuid}/checkout/${courseUuid}`;
      navigate(buildLoginUrl(academyUuid, currentPath), { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, academyUuid, courseUuid, navigate]);

  // Load Course and Enrollment Status from backend
  useEffect(() => {
    if (!courseUuid || !academyUuid) return;

    const loadData = async () => {
      setIsLoadingCourse(true);
      try {
        // 1. Fetch Course details from backend
        const res = await apiClient.get<any>(API_ENDPOINTS.courses.detail(courseUuid));
        const data = res?.data || res;
        setCourse({
          uuid: data.uuid || courseUuid,
          title: data.title || 'Course Overview',
          tagline: data.short_description || data.tagline || '',
          price: Number(data.price || data.price_amount || 2999),
          salePrice: data.sale_price ? Number(data.sale_price) : undefined,
          isFree: data.is_free,
          pricing: data.pricing,
          thumbnailUrl: data.thumbnail_url || data.thumbnail?.file?.url || '',
          instructorName: data.instructor?.full_name || 'Senior Instructor',
          level: data.level || 'INTERMEDIATE',
        });

        // 2. Check Enrollment status if student is logged in
        if (isAuthenticated) {
          try {
            const enrollments = await studentPortalService.getStudentEnrollments();
            const found = (enrollments || []).some((e: any) => {
              if (e.status !== 'ACTIVE' && e.status !== 'COMPLETED' && e.status !== 'active') return false;
              const id = e.course?.uuid || e.course?.id || e.course_uuid || e.course_id;
              return String(id) === String(courseUuid);
            });
            setIsEnrolled(found);
          } catch {
            // Non-fatal
          }
        }
      } catch {
        // Fallback demo course details
        setCourse({
          uuid: courseUuid,
          title: 'Full Stack Web Development',
          tagline: 'Production software engineering masterclass.',
          price: 2999,
          level: 'INTERMEDIATE',
          instructorName: 'Academy Expert',
        });
      } finally {
        setIsLoadingCourse(false);
      }
    };

    loadData();
  }, [academyUuid, courseUuid, isAuthenticated]);

  if (isAuthLoading || isLoadingCourse) {
    return (
      <div className="py-20 text-center font-sans text-xs text-[#64748B] dark:text-[#94A3B8]">
        Loading checkout...
      </div>
    );
  }

  const coursePricing = getCoursePricing(course);
  const regularPrice = coursePricing.regularPrice;
  const saleDiscount = coursePricing.saleDiscount;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, coursePricing.effectivePrice - couponDiscount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      // Validate coupon with backend
      const res = await apiClient.post<any>('/api/v1/payments/coupons/validate/', {
        academy_uuid: academyUuid,
        course_uuid: courseUuid,
        coupon_code: couponCode.trim(),
        payment_context: 'COURSE_PURCHASE',
      });
      const data = res?.data || res;
      const discount = Number(data.discount || data.discount_amount || 600);
      setAppliedCoupon({
        code: couponCode.trim().toUpperCase(),
        discountAmount: discount,
      });
      setCouponError(null);
    } catch (err: any) {
      setCouponError(
        err.response?.data?.message ||
          err.response?.data?.code?.[0] ||
          err.message ||
          'Invalid or expired coupon code.'
      );
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handlePay = async () => {
    setStatusState('processing');
    setErrorMsg(null);

    try {
      const targetCourseUuid = courseUuid || '';
      const orderRes: CreateOrderResponse = await checkoutService.createPaymentOrder(
        academyUuid || '',
        targetCourseUuid,
        appliedCoupon?.code,
        finalTotal
      );

      // Handle Free / Zero-value enrollment
      if (orderRes.is_free || orderRes.order?.amount === 0) {
        clearCheckoutIntent();
        setStatusState('success');
        return;
      }

      if (!orderRes.order) {
        throw new Error('Order creation failed. No order response returned.');
      }

      const { razorpay_order_id, razorpay_key_id, amount, currency } = orderRes.order;

      // Open Razorpay Checkout Modal
      openRazorpayCheckout({
        key: razorpay_key_id,
        amount,
        currency,
        name: academyEntity.name,
        description: course?.title || 'Course Enrollment',
        order_id: razorpay_order_id,
        prefill: {
          name: student?.fullName,
          email: student?.email,
          contact: student?.phone,
        },
        handler: async (response) => {
          setStatusState('verifying');
          try {
            const verifyRes = await checkoutService.verifyPaymentSignature({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              clearCheckoutIntent();
              setStatusState('success');
            } else {
              setStatusState('failed');
              setErrorMsg(verifyRes.message || 'Payment verification failed.');
            }
          } catch (verifyErr: any) {
            setStatusState('failed');
            setErrorMsg(verifyErr.response?.data?.message || 'Payment verification error.');
          }
        },
        onDismiss: () => {
          setStatusState('idle');
        },
      });
    } catch (err: any) {
      if (err.status === 409 || err.code === 'ALREADY_ENROLLED' || err.response?.data?.code === 'ALREADY_ENROLLED') {
        setIsEnrolled(true);
        setStatusState('idle');
        return;
      }

      setStatusState('failed');
      if (err.response?.data?.code === 'PRICE_CHANGED') {
        const pricing = err.response?.data?.pricing;
        setErrorMsg(
          err.response?.data?.message ||
          `The course price has changed${pricing?.final_amount ? ` to ₹${Number(pricing.final_amount).toLocaleString()}` : ''}. Please review the updated total.`
        );
        if (pricing) {
          setCourse((prev: any) => ({
            ...prev,
            price: Number(pricing.regular_price || prev.price),
            salePrice: Number(pricing.effective_price || prev.salePrice),
          }));
        }
      } else {
        setErrorMsg(err.response?.data?.message || err.message || 'Unable to initiate payment order.');
      }
    }
  };

  const courseDetailUrl = `/${academyUuid}/courses/${courseUuid}`;
  const studentOverviewRoute = buildStudentCourseOverviewPath(academyUuid, courseUuid);

  const handleContinueLearning = () => {
    if (!isValidUuid(academyUuid) || !isValidUuid(courseUuid)) {
      console.error('Missing or invalid checkout route params', { academyUuid, courseUuid });
      return;
    }
    navigate(studentOverviewRoute);
  };

  return (
    <div className="py-8 sm:py-10 px-4 md:px-6 max-w-7xl mx-auto font-sans min-h-[calc(100dvh-4rem)] space-y-6 w-full min-w-0">
      {/* BACK NAVIGATION LINK */}
      <div className="flex items-center justify-between">
        <Link
          to={courseDetailUrl}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course</span>
        </Link>
      </div>

      {/* ALREADY ENROLLED BANNER */}
      {isEnrolled ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-[#E2E8F0] dark:border-[#263244] shadow-xl text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Already Enrolled
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              You already have active access to <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{course?.title}</span> under {academyEntity.name}.
            </p>
          </div>
          <button
            type="button"
            onClick={handleContinueLearning}
            disabled={!isValidUuid(academyUuid) || !isValidUuid(courseUuid)}
            className="inline-flex items-center justify-center gap-2 h-11 px-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : statusState === 'success' ? (
        /* PAYMENT SUCCESS STATE */
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-8 border border-[#E2E8F0] dark:border-[#263244] shadow-xl text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-600 dark:text-[#6EE7B7] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Payment Successful
            </h1>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              You're now enrolled in <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{course?.title}</span>. Get started with your lessons right away.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleContinueLearning}
              disabled={!isValidUuid(academyUuid) || !isValidUuid(courseUuid)}
              className="w-full sm:w-auto h-11 px-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to={`/${academyUuid}/courses`}
              className="w-full sm:w-auto h-11 px-6 border border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#CBD5E1] font-semibold text-xs rounded-xl flex items-center justify-center transition-colors"
            >
              <span>View My Courses</span>
            </Link>
          </div>
        </div>
      ) : (
        /* CHECKOUT CONTENT: 2-COLUMN RESPONSIVE LAYOUT */
        <div className="space-y-6">
          {/* CHECKOUT HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-left">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Checkout
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                Review your course and complete your enrollment.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-[#DC2626] dark:text-[#F87171] flex items-center gap-3 text-left">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-semibold block">Payment Failed</span>
                <span className="font-normal">{errorMsg}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: COURSE INFO, COUPON, STUDENT INFO (65%) */}
            <div className="lg:col-span-8 space-y-6 text-left">
              {/* COURSE INFORMATION CARD */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#263244] shadow-sm space-y-4">
                <h2 className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                  Course Information
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {course?.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full sm:w-36 h-24 rounded-xl object-cover border border-[#E2E8F0] dark:border-[#263244] shrink-0"
                    />
                  ) : (
                    <div className="w-full sm:w-36 h-24 rounded-xl bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
                      <BookOpen className="w-8 h-8" />
                    </div>
                  )}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] uppercase">
                      {course?.level || 'INTERMEDIATE'}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug break-words">
                      {course?.title}
                    </h3>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      Offered by <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{academyEntity.name}</span>
                    </p>
                    {course?.instructorName && (
                      <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        Instructor: <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">{course.instructorName}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* COUPON SECTION CARD */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#263244] shadow-sm space-y-3">
                <h2 className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                  Have a coupon?
                </h2>
                {appliedCoupon ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-[#6EE7B7] font-medium">
                      <Tag className="w-4 h-4" />
                      <span><strong>{appliedCoupon.code}</strong> applied — You saved ₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-semibold text-[#DC2626] dark:text-[#F87171] hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2 max-w-md">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#263244] bg-white dark:bg-[#0F172A] text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isApplyingCoupon ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-[#DC2626] dark:text-[#F87171] font-normal">{couponError}</p>
                )}
              </div>

              {/* STUDENT INFORMATION CARD */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#263244] shadow-sm space-y-3">
                <h2 className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                  Student Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-[#263244]">
                    <User className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Name</span>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{student?.fullName || 'Student'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-[#263244]">
                    <Mail className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Email</span>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate block">{student?.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-[#263244]">
                    <Phone className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block">Phone</span>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{student?.phone || 'Not Provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: STICKY ORDER SUMMARY (35%) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 text-left">
              <div className="bg-white dark:bg-[#111827] rounded-2xl p-6 border border-[#E2E8F0] dark:border-[#263244] shadow-xl space-y-5">
                <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Order Summary
                </h2>

                {/* BREAKDOWN TABLE */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                    <span>Course Price</span>
                    <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">₹{coursePricing.effectivePrice.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 dark:text-[#6EE7B7] font-medium">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8]">
                    <span>Tax</span>
                    <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">₹0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
                    <span>Total</span>
                    <span className="text-[#2563EB] dark:text-[#60A5FA]">₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* PAYMENT BUTTON */}
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={statusState === 'processing' || statusState === 'verifying'}
                  className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {statusState === 'processing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Preparing Payment...</span>
                    </>
                  ) : statusState === 'verifying' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Payment...</span>
                    </>
                  ) : finalTotal === 0 ? (
                    <span>Complete Free Enrollment</span>
                  ) : (
                    <span>Pay ₹{finalTotal.toLocaleString()}</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal pt-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-bit Encrypted SSL Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
