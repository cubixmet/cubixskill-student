import React from 'react';
import { getCoursePricing, type CoursePricing } from '../../stores/course.store';

interface CoursePriceProps {
  course?: any;
  pricing?: CoursePricing;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showDiscountBadge?: boolean;
}

export const CoursePrice: React.FC<CoursePriceProps> = ({
  course,
  pricing: propPricing,
  size = 'md',
  className = '',
  showDiscountBadge = false,
}) => {
  const p = propPricing || getCoursePricing(course);

  if (p.isFree) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`font-bold text-emerald-400 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
          Free
        </span>
      </div>
    );
  }

  const symbol = p.currency === 'INR' || p.currency === '₹' ? '₹' : '$';
  const effectiveFormatted = `${symbol}${p.effectivePrice.toLocaleString('en-IN')}`;
  const regularFormatted = `${symbol}${p.regularPrice.toLocaleString('en-IN')}`;

  const discountPercent = p.isOnSale && p.regularPrice > 0
    ? Math.round(((p.regularPrice - p.effectivePrice) / p.regularPrice) * 100)
    : 0;

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      {p.isOnSale ? (
        <>
          <span className={`font-bold text-white ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
            {effectiveFormatted}
          </span>
          <span className={`text-slate-400 line-through ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
            {regularFormatted}
          </span>
          {showDiscountBadge && discountPercent > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </>
      ) : (
        <span className={`font-bold text-white ${size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
          {effectiveFormatted}
        </span>
      )}
    </div>
  );
};
