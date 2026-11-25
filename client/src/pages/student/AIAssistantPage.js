import React from 'react';
import AIChatbot from '../../components/ai/AIChatbot';
import {
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const AIAssistantPage = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
            🤖 AI Feature
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-xs text-slate-500 font-semibold">Conversational Ticket Intake</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
          AI Complaint Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Report maintenance and campus infrastructure problems naturally. The AI Assistant gathers location and problem specifics, then drafts your ticket automatically.
        </p>
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Information & Guidelines Panel */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  CampusResolve AI Assistant
                </h2>
                <p className="text-xs text-brand-600 font-semibold">
                  Intelligent Issue Intake Engine
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Describe your campus issue naturally in the chat window. The assistant will collect the location and problem details, filter non-college requests, and prepare your ticket.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                How It Works
              </span>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>State your campus maintenance problem in everyday words.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>AI clarifies missing location or symptoms if needed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Review the Complaint Summary Card and submit instantly.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* College Issues Policy & Fraud Detection Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Campus Issue Protection & Policy</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              CampusResolve AI is strictly dedicated to college campus issues:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Permitted:</span> Electrical faults, plumbing leaks, campus WiFi issues, cleanliness/garbage, broken furniture, classroom projectors, hostel amenities, security, and campus shuttle.
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Prohibited / Flagged:</span> Spam, non-college topics, commercial promotions, financial fraud, exam cheating, and personal off-campus matters.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chatbot Interface with Embedded Prompts */}
        <div className="lg:col-span-7">
          <AIChatbot />
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
