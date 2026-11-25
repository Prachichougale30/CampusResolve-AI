import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import RegisterModal from '../../components/auth/RegisterModal';
import {
  Sparkles,
  Bot,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Activity,
  PhoneCall,
  LogOut,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import CategoryBadge from '../../components/common/CategoryBadge';

const LandingPage = () => {
  const { isAuthenticated, currentRole, logout } = useAuth();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Banner */}
      

      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-accent-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900">
                  CampusResolve
                </span>
                <span className="text-xs font-black uppercase px-2 py-0.5 bg-gradient-to-r from-brand-600 to-accent-600 text-white rounded-md shadow-xs">
                  AI
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Smart Campus Complaint System
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
              How It Works
            </a>
            <a href="#ai-benefits" className="hover:text-brand-600 transition-colors">
              AI Capabilities
            </a>
            <a href="#about" className="hover:text-brand-600 transition-colors">
              About
            </a>
          </nav>

          {/* Auth & CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={
                    currentRole === 'admin'
                      ? '/admin/dashboard'
                      : currentRole === 'staff'
                      ? '/staff/dashboard'
                      : '/student/dashboard'
                  }
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 px-3.5 sm:px-5 py-2.5 rounded-xl shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02]"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-600 hover:text-rose-600 px-2.5 py-2 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-600 px-3.5 sm:px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(true)}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:scale-[1.02]"
                >
                  <span>Register</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-accent-600" />
              <span>Smarter Campus. Faster Resolutions.</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Next-Gen Campus Complaint & Resource Management{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CampusResolve AI simplifies campus complaint reporting, connects students with campus support teams, and enables faster issue resolution with AI-assisted complaint reporting and automatic categorization.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to={
                  !isAuthenticated
                    ? '/login'
                    : currentRole === 'student'
                    ? '/student/complaints?create=true'
                    : `/${currentRole}/dashboard`
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:-translate-y-0.5"
              >
                <span>
                  {isAuthenticated
                    ? currentRole === 'student'
                      ? 'Report an Issue'
                      : 'Go to Dashboard'
                    : 'Report an Issue (Login)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to={
                  !isAuthenticated
                    ? '/login'
                    : currentRole === 'student'
                    ? '/student/ai-assistant'
                    : `/${currentRole}/dashboard`
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200/90 shadow-soft transition-all hover:-translate-y-0.5"
              >
                <Bot className="w-4 h-4 text-brand-600" />
                <span>
                  {isAuthenticated
                    ? currentRole === 'student'
                      ? 'Talk to AI Assistant'
                      : 'Open Workspace'
                    : 'Talk to AI Assistant'}
                </span>
              </Link>
            </div>

            {/* Trust points */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Automatic AI Categorization
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                End-to-End Workflow Tracking
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Student Resolution Verification
              </span>
            </div>
          </div>

          {/* Interactive Mockup Preview Card */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-600 rounded-3xl blur-xl opacity-20" />
            
            <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Fake Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs font-bold text-slate-400">
                    campusresolve-ai.edu/student/dashboard
                  </span>
                </div>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                  Live Enterprise Preview
                </span>
              </div>

              {/* Sample Ticket Preview Inside Mockup */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-brand-600">
                        #CR-1042
                      </span>
                      <StatusBadge status="In Progress" size="sm" />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">
                        Ceiling Fan Not Working and Making Squeaking Noise
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Academic Block A, Room 204 • Reported by Prachi Sharma
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <CategoryBadge category="Electrical" isAiDetected={true} size="sm" />
                      <span className="text-xs text-slate-400">• Assigned to Rajesh Kumar (Electrical Dept)</span>
                    </div>
                  </div>

                  {/* Horizontal visual stepper preview */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Complaint Lifecycle Progress
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold pt-2">
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Pending
                      </span>
                      <span className="text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Assigned
                      </span>
                      <span className="text-brand-700 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 animate-pulse" /> In Progress
                      </span>
                      <span className="text-slate-400">Resolved</span>
                      <span className="text-slate-400">Verified</span>
                    </div>
                  </div>
                </div>

                {/* Right Mini AI Chatbot Callout */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-brand-950 text-white flex flex-col justify-between space-y-4 shadow-md">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-bold text-xs">AI Assistant Live</span>
                    </div>
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      "I detected this issue belongs to the Electrical Department. Would you like me to dispatch it immediately?"
                    </p>
                  </div>

                  <Link
                    to={
                      !isAuthenticated
                        ? '/login'
                        : currentRole === 'student'
                        ? '/student/ai-assistant'
                        : `/${currentRole}/dashboard`
                    }
                    className="w-full text-center py-2 text-xs font-bold bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    Try AI Chatbot
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Enterprise Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Complete Campus Operations
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              From instant reporting to final student resolution verification, CampusResolve AI orchestrates every step with precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-soft hover:border-brand-200 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                1. Easy Complaint Reporting
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students can file complaints in seconds with title, detailed description, campus building/room location, and visual proof images.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white border border-brand-200/80 hover:shadow-soft transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md shadow-brand-500/30">
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-bold text-slate-900">
                  2. AI Complaint Assistant
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-600 text-white rounded-full">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Talk to an intelligent conversational chatbot that extracts missing campus locations, formulates structured summaries, and auto-submits tickets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-soft hover:border-brand-200 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-bold text-slate-900">
                  3. Automatic AI Categorization
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-600 text-white rounded-full">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Smart natural-language detection analyzes the problem text and tags it under Electrical, Plumbing, WiFi, Infrastructure, or 6 other departments.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-soft hover:border-brand-200 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                4. Real-Time Status Tracking
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transparent 5-stage timeline from Pending to Verified. Receive real-time staff progress updates, part requisitions, and resolution alerts.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-soft hover:border-brand-200 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                5. Staff Management & Assignment
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Admins balance staff workloads, dispatch complaints to qualified technicians, monitor active tasks, and oversee maintenance turnaround.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:shadow-soft hover:border-brand-200 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                6. Campus Analytics & Reports
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Executive metrics, SLA compliance, department resolution efficiency charts, and monthly incident trends with one-click report export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
              Seamless Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How CampusResolve AI Works
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A transparent, accountable lifecycle connecting Students, Staff, and Campus Administrators.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
              {/* Step 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 font-black text-sm flex items-center justify-center mx-auto border border-brand-200">
                  1
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Student Reports</h4>
                <p className="text-xs text-slate-500">
                  Submit via quick form or talk naturally with the AI Assistant.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 font-black text-sm flex items-center justify-center mx-auto border border-purple-200">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-sm">AI Categorizes</h4>
                <p className="text-xs text-slate-500">
                  AI automatically detects the department (Electrical, Plumbing, etc.).
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center mx-auto border border-blue-200">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Admin Assigns</h4>
                <p className="text-xs text-slate-500">
                  Administrator checks staff workload and assigns the technician.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 font-black text-sm flex items-center justify-center mx-auto border border-amber-200">
                  4
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Staff Resolves</h4>
                <p className="text-xs text-slate-500">
                  Staff logs progress remarks, repairs the issue, and marks resolved.
                </p>
              </div>

              {/* Step 5 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-black text-sm flex items-center justify-center mx-auto border border-emerald-200">
                  5
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Student Verifies</h4>
                <p className="text-xs text-slate-500">
                  Student rates 1-5 stars, provides feedback, and closes ticket.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      {/* Footer */}
      <footer id="about" className="bg-white border-t border-slate-200 py-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-slate-900">
                  CampusResolve AI
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                Smart Campus Resource & Complaint Management System with AI Assistance. Final Year MERN Stack Project.
              </p>
              <p className="text-xs font-bold text-brand-700">
                "Smarter Campus. Faster Resolutions."
              </p>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
                Quick Navigation
              </h5>
              <ul className="space-y-2">
                <li><Link to="/student/dashboard" className="hover:text-brand-600">Student Dashboard</Link></li>
                <li><Link to="/student/complaints?create=true" className="hover:text-brand-600">Report Issue</Link></li>
                <li><Link to="/student/ai-assistant" className="hover:text-brand-600">AI Complaint Assistant</Link></li>
                <li><Link to="/staff/dashboard" className="hover:text-brand-600">Staff Technician Portal</Link></li>
                <li><Link to="/admin/dashboard" className="hover:text-brand-600">Admin Control Center</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
                Supported Departments
              </h5>
              <ul className="space-y-1.5 text-slate-500">
                <li>• Electrical & Lighting</li>
                <li>• Plumbing & Sanitation</li>
                <li>• Campus WiFi & IT Network</li>
                <li>• Cleanliness & Waste Disposal</li>
                <li>• Infrastructure & Classroom AV</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">
                Campus Support
              </h5>
              <div className="space-y-2 text-slate-500">
                <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
                  Helpline: +91 (0) 80-2345-6789
                </p>
                <p>D.Y.Patil College of Engineering & Technology,Kolhapur</p>
                <p>Central Maintenance & Operations Facility</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} CampusResolve AI. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-800 cursor-pointer">Campus Safety SLA</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Registration Popup Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
