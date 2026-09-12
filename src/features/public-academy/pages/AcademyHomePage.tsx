import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Shield, Users, Award, ArrowRight, Mail, Phone } from 'lucide-react';
import { usePublicAcademy } from '../layouts/PublicAcademyLayout';
import { resolveMediaUrl } from '../../../services/apiClient';
import { useAuthStore } from '../../auth/store/auth.store';
import { saveCheckoutIntent, buildLoginUrl } from '../../../lib/navigationIntent';
import { CoursePrice } from '../../../components/common/CoursePrice';

export const AcademyHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { academyUuid: paramUuid } = useParams<{ academyUuid: string }>();
  const context = usePublicAcademy();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const academyUuid = context?.academyUuid || paramUuid || '';

  const publicData = context?.publicData || {};
  const publicCourses = context?.publicCourses || [];
  const academyEntity = context?.academyEntity || {
    name: 'Academy',
    heroHeadline: 'Master Production Software Skills',
    heroSubheadline: 'Join official industry-accredited courses.',
    theme: { primaryColor: '#2563EB' },
  };

  const primaryStyle = { backgroundColor: academyEntity.theme?.primaryColor || '#2563EB' };

  const handleEnrollClick = (course: any) => {
    const targetCourseUuid = course.uuid || course.id || course.slug;
    if (!targetCourseUuid || !academyUuid) return;

    const checkoutPath = `/${academyUuid}/checkout/${targetCourseUuid}`;

    if (isAuthenticated) {
      navigate(checkoutPath);
    } else {
      saveCheckoutIntent({ academyUuid, courseUuid: targetCourseUuid });
      navigate(buildLoginUrl(academyUuid, checkoutPath));
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12 font-sans w-full min-w-0">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white dark:bg-[#111827] border-b border-slate-200/80 dark:border-[#263244] py-12 sm:py-16 md:py-20 px-4 md:px-8 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            {(academyEntity.tagline || (publicData.theme?.hero_badge)) && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA]">
                <Award className="w-3.5 h-3.5" />
                <span>{publicData.theme?.hero_badge || academyEntity.tagline}</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight leading-tight overflow-wrap-anywhere">
              {academyEntity.heroHeadline}
            </h1>

            <p className="text-xs sm:text-base text-slate-600 dark:text-[#94A3B8] font-normal leading-relaxed max-w-2xl overflow-wrap-anywhere">
              {academyEntity.heroSubheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full">
              <Link
                to={`/${academyUuid}/courses`}
                style={primaryStyle}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-xs text-white shadow-2xs hover:opacity-95 transition-opacity inline-flex items-center justify-center gap-2 min-h-[44px]"
              >
                <span>{publicData.theme?.hero_cta_label || 'Browse Course Catalog'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            {publicData.theme?.hero_image_url ? (
              <img
                src={resolveMediaUrl(publicData.theme.hero_image_url)}
                alt={academyEntity.name}
                className="w-full aspect-16/10 rounded-3xl object-cover border border-slate-200 dark:border-[#263244] shadow-xl"
              />
            ) : academyEntity.logoUrl ? (
              <img
                src={academyEntity.logoUrl}
                alt={academyEntity.name}
                className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl object-cover border border-slate-200 dark:border-[#263244] shadow-xl"
              />
            ) : (
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center font-bold text-4xl shadow-xl">
                {academyEntity.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES CATALOG */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-6 text-left">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">Featured Courses</h2>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">
              Official courses published by {academyEntity.name}.
            </p>
          </div>
          <Link
            to={`/${academyUuid}/courses`}
            className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline inline-flex items-center gap-1"
          >
            <span>View All Courses ({publicCourses.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {publicCourses.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] rounded-2xl p-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
            No public courses published yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicCourses.slice(0, 6).map((course: any) => {
              const isFree = course.price === 0 || course.is_free;
              const rawThumb = course.thumbnail || course.thumbnail_url || course.image_url;
              const resolvedThumb = resolveMediaUrl(rawThumb);

              return (
                <div
                  key={course.id || course.uuid || course.slug}
                  className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-[#0F172A]">
                      {resolvedThumb ? (
                        <img
                          src={resolvedThumb}
                          alt={course.title}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-full flex items-center justify-center bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA]';
                              fallback.innerHTML = '<svg class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>';
                              parent.appendChild(fallback);
                            }
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA]">
                          <BookOpen className="w-10 h-10" />
                        </div>
                      )}
                      {course.category && (
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#0F172A]/80 text-white backdrop-blur-xs">
                          {course.category}
                        </span>
                      )}
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1]">
                          {course.level || 'Masterclass'}
                        </span>
                        <CoursePrice course={course} size="sm" showDiscountBadge />
                      </div>

                      <h3 className="font-semibold text-sm text-slate-900 dark:text-[#F8FAFC] line-clamp-2 leading-snug">{course.title}</h3>
                      <p className="text-slate-500 dark:text-[#94A3B8] text-xs line-clamp-2 font-normal">{course.description || course.short_description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <Link
                      to={`/${academyUuid}/courses/${course.id || course.slug}`}
                      style={primaryStyle}
                      className="w-full font-semibold text-white py-2.5 rounded-xl inline-flex flex-row items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-2xs hover:opacity-95 transition-opacity text-xs"
                    >
                      <span className="whitespace-nowrap leading-none">View Details</span>
                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PUBLIC CONTACT & SUPPORT INFO SUMMARY */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-[#263244] rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#2563EB] dark:text-[#60A5FA]">
              <Mail className="w-4 h-4" />
              <span className="font-semibold text-xs">Email Support</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] font-mono">{academyEntity.supportEmail}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#2563EB] dark:text-[#60A5FA]">
              <Phone className="w-4 h-4" />
              <span className="font-semibold text-xs">Phone Assistance</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] font-mono">{academyEntity.supportPhone || '+91 98765 43210'}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-4 h-4" />
              <span className="font-semibold text-xs">Verified Platform</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Official CubixSkill Academy Portal</p>
          </div>
        </div>
      </section>
    </div>
  );
};
