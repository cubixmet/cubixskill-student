import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Star,
  Users,
  Award,
  ArrowRight,
  Mail,
  Phone,
} from 'lucide-react';
import { AcademyHeader } from '../../../components/layout/AcademyHeader';
import { AcademyFooter } from '../../../components/layout/AcademyFooter';
import { useAcademyStore } from '../../../stores/academy.store';
import { useCourseStore } from '../../../stores/course.store';

export const AcademyHomePage: React.FC = () => {
  const { academyUuid } = useParams<{ academyUuid: string }>();
  const getAcademyByUuid = useAcademyStore((state) => state.getAcademyByUuid);
  const loadAcademyThemeByUuid = useAcademyStore((state) => state.loadAcademyThemeByUuid);
  const getCoursesByAcademy = useCourseStore((state) => state.getCoursesByAcademy);

  useEffect(() => {
    if (academyUuid) {
      loadAcademyThemeByUuid(academyUuid);
    }
  }, [academyUuid, loadAcademyThemeByUuid]);

  const academy = getAcademyByUuid(academyUuid || '');
  const courses = getCoursesByAcademy(academyUuid || '');

  if (!academy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-xs bg-[#F8FAFC]">
        <h1 className="text-2xl font-bold text-slate-900">Academy Not Found</h1>
        <p className="text-slate-500">The requested academy UUID does not exist or has been removed.</p>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
          Return to Portal
        </Link>
      </div>
    );
  }

  const primaryStyle = { backgroundColor: academy.theme.primaryColor };
  const primarySoftStyle = { backgroundColor: academy.theme.primarySoft, color: academy.theme.primaryColor };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-xs text-slate-900">
      <AcademyHeader academy={academy} />

      <main className="flex-1 space-y-16 pb-20">
        {/* HERO BANNER */}
        <section className="bg-white border-b border-slate-200/80 py-16 md:py-24 px-4 md:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold" style={primarySoftStyle}>
                <Award className="w-4 h-4 shrink-0" />
                <span>{academy.tagline}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {academy.heroHeadline}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                {academy.heroSubheadline}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to={`/${academyUuid}/courses`} className="w-full sm:w-auto">
                  <button
                    type="button"
                    style={primaryStyle}
                    className="w-full font-semibold text-white px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 min-h-[48px] shadow-sm hover:opacity-95"
                  >
                    <span>Explore Courses</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <Link to={`/${academyUuid}/register`} className="w-full sm:w-auto">
                  <button
                    type="button"
                    className="w-full border border-slate-200 font-semibold text-slate-700 px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 min-h-[48px] hover:bg-slate-50"
                  >
                    Create Student Account
                  </button>
                </Link>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 aspect-video">
              <img src={academy.logoUrl} alt={academy.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* FEATURED COURSES CATALOG */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">Featured Academy Courses</h2>
              <p className="text-slate-500 text-xs">Curated curriculum taught by {academy.instructorName}.</p>
            </div>
            <Link to={`/${academyUuid}/courses`} className="font-semibold text-blue-600 flex items-center gap-1">
              View All Courses ({courses.length})
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course) => (
              <div key={course.uuid} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    {course.category && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {course.category}
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{course.rating || 4.9}</span>
                      <span className="text-slate-400 font-normal">({course.reviewsCount || 120})</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{course.title}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2">{course.subtitle || course.currentModuleTitle}</p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {course.studentCount || 850} students
                      </span>
                      <span className="font-bold text-slate-900">
                        {course.price === 0 ? 'FREE' : `${course.currency || '₹'}${course.price || 4999}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link to={`/${academyUuid}/courses/${course.uuid}`}>
                    <button
                      type="button"
                      style={primaryStyle}
                      className="w-full font-semibold text-white py-2.5 rounded-xl flex items-center justify-center gap-2"
                    >
                      Course Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT INSTRUCTOR SECTION */}
        <section className="bg-white border-y border-slate-200/80 py-16 px-4 md:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left space-y-4">
              <img src={academy.instructorAvatar} alt={academy.instructorName} className="w-32 h-32 rounded-3xl object-cover border-2 border-slate-200 mx-auto md:mx-0 shadow-md" />
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{academy.instructorName}</h3>
                <p className="text-xs font-semibold mt-0.5" style={{ color: academy.theme.primaryColor }}>
                  {academy.instructorTitle}
                </p>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4 text-slate-600 text-xs leading-relaxed">
              <h4 className="text-base font-bold text-slate-900">About {academy.name}</h4>
              <p>{academy.aboutText}</p>
              <p>{academy.instructorBio}</p>
              <div className="pt-2 flex flex-wrap gap-4 font-semibold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {academy.supportEmail}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {academy.supportPhone}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AcademyFooter academy={academy} />
    </div>
  );
};
