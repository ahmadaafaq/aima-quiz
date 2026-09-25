import React from 'react';
import {
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  FileText,
  Users
} from 'lucide-react';

export const BootcampBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1528] via-[#112240] to-[#1E3A8A] text-white shadow-2xl border border-blue-900/60 p-6 sm:p-10 lg:p-12 mb-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar inside Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-md">
            <img
              src="https://www.aima.in/img/logo.png"
              alt="AIMA Logo"
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              All India Management Association (AIMA) • ICRC
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Centre for Management Development & CSR Excellence
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Executive Registrations Open
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            National Executive Credential
          </span>
        </div>
      </div>

      {/* Main Banner Hero Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Flagship 2-Day Executive Masterclass
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Certified <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400">CSR Leader</span> Bootcamp
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            Master Section 135 Companies Act statutory mandates, strategic CSR project cycle design, SROI impact assessments, and ESG integration in a hands-on executive boot camp with industry practitioners.
          </p>

          {/* Key Event Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-300">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Dates & Schedule</div>
                <div className="text-sm font-bold text-white">27–28 October 2026</div>
                <div className="text-[11px] text-slate-300">09:30 AM – 05:30 PM IST (2 Full Days)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Bootcamp Venue</div>
                <div className="text-sm font-bold text-white">AIMA Management House</div>
                <div className="text-[11px] text-slate-300">14 Institutional Area, Lodhi Road / Lajpat Nagar, New Delhi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Executive Highlight Card */}
        <div className="lg:col-span-4 bg-white/10 border border-white/15 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Key Takeaways & Benefits</div>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>

          <ul className="space-y-2.5 text-xs text-slate-200">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Certified CSR Leader</strong> digital credential awarded by AIMA upon completion.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Section 135 compliance frameworks & Schedule VII project due diligence toolkit.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Social Return on Investment (SROI) & BRSR Core ESG metrics clinic.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>High-level networking with CSR Heads from PSUs, Corporates & Higher Ed.</span>
            </li>
          </ul>

          <div className="pt-3 border-t border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
            <span>Course materials & lunches included</span>
            <span className="font-semibold text-amber-300">16 Contact Hours</span>
          </div>
        </div>
      </div>

      {/* Bottom Secretariat Info Ribbon */}
      <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-blue-400" />
          <span>Organised by <strong>All India Management Association</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="mailto:enayyar@aima.in"
            className="inline-flex items-center gap-1.5 hover:text-amber-300 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Ms Ekta Nayyar: enayyar@aima.in</span>
          </a>
          <a
            href="tel:+911147673000"
            className="inline-flex items-center gap-1.5 hover:text-amber-300 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>+91 11 47673000 Extn: 732</span>
          </a>
        </div>
      </div>
    </div>
  );
};
