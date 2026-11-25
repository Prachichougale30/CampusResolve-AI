import React from 'react';
import {
  Zap,
  Droplets,
  Wifi,
  Sparkles,
  Building2,
  Home,
  GraduationCap,
  Shield,
  Bus,
  HelpCircle,
  Bot
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Electrical': { icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  'Plumbing': { icon: Droplets, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  'WiFi / Internet': { icon: Wifi, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  'Cleanliness': { icon: Sparkles, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  'Infrastructure': { icon: Building2, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  'Hostel': { icon: Home, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  'Classroom': { icon: GraduationCap, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  'Security': { icon: Shield, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  'Transport': { icon: Bus, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  'Other': { icon: HelpCircle, color: 'text-slate-600 bg-slate-100 border-slate-200' },
};

const CategoryBadge = ({ category, isAiDetected = false, size = 'md', showAiPill = true }) => {
  const conf = CATEGORY_ICONS[category] || CATEGORY_ICONS['Other'];
  const Icon = conf.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 rounded-md border ${conf.color} ${sizeClasses} shadow-sm`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{category}</span>
      </span>

      {isAiDetected && showAiPill && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-gradient-to-r from-brand-600 to-accent-600 text-white rounded-md shadow-sm tracking-wide"
          title="Category automatically analyzed and tagged by CampusResolve AI"
        >
          <Bot className="w-3 h-3 animate-pulse" />
          <span>AI Detected</span>
        </span>
      )}
    </div>
  );
};

export default CategoryBadge;
