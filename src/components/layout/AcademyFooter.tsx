import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone } from 'lucide-react';
import type { AcademyEntity } from '../../stores/academy.store';

interface AcademyFooterProps {
  academy: AcademyEntity;
}

export const AcademyFooter: React.FC<AcademyFooterProps> = ({ academy }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200/80 font-sans text-xs text-slate-600">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* BRAND COLUMN */}
          <div className="md:col-span-2 space-y-4">
            <Link to={`/${academy.uuid}`} className="flex items-center gap-3">
              <img src={academy.logoUrl} alt={academy.name} className="w-10 h-10 rounded-2xl object-cover border border-slate-200" />
              <span className="font-extrabold text-base text-slate-900">{academy.name}</span>
            </Link>
            <p className="text-slate-500 max-w-sm text-xs leading-relaxed">{academy.tagline}</p>
            <div className="flex items-center gap-2 text-slate-500 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Powered by CubixSkill Enterprise Platform</span>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to={`/${academy.uuid}`} className="hover:text-slate-900 transition-colors">
                  Academy Home
                </Link>
              </li>
              <li>
                <Link to={`/${academy.uuid}/courses`} className="hover:text-slate-900 transition-colors">
                  Course Catalog
                </Link>
              </li>
              <li>
                <Link to={`/${academy.uuid}/contact`} className="hover:text-slate-900 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to={`/${academy.uuid}/login`} className="hover:text-slate-900 transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Academy Support</h4>
            <div className="space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{academy.supportEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{academy.supportPhone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© {currentYear} {academy.name}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
