import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import FieldValidation from '../common/FieldValidation';

const DEPARTMENTS = {
  student: [
    'Computer Science & Engineering',
    'Information Technology',
    'Mechanical Engineering',
    'Electronics & Communication',
    'Electrical & Electronics',
    'Civil Engineering',
    'Biotechnology',
    'Business Administration',
  ],
  staff: [
    'Electrical',
    'Plumbing',
    'WiFi / Internet',
    'Cleanliness',
    'Infrastructure',
    'Classroom',
    'Hostel',
    'Security',
    'Transport',
  ],
};

const RegisterModal = ({ isOpen, onClose }) => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS.student[0]);
  const [division, setDivision] = useState('A');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Update default department when role switches
  useEffect(() => {
    setDepartment(DEPARTMENTS[role][0]);
    setFormError('');
  }, [role]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setUserId('');
    setRole('student');
    setDepartment(DEPARTMENTS.student[0]);
    setFormError('');
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!name.trim()) {
      setFormError('Please enter your full name');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setFormError('Please enter a valid campus email address');
      return;
    }

    if (!password || password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (!userId.trim()) {
      setFormError(
        role === 'student'
          ? 'Roll number / Student ID is required'
          : role === 'staff'
          ? 'Staff / Employee ID is required'
          : 'Administrator Registration ID is required'
      );
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      userId: userId.trim(),
      rollNo: userId.trim(),
      department,
      division,
    };

    try {
      const result = await register(payload);

      if (result && result.success) {
        toast.success(
          `Welcome, ${result.user?.name || name}! Account registered successfully.`,
          { icon: '🎉', duration: 4000 }
        );
        onClose();

        // Redirect to appropriate role dashboard
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      } else {
        setFormError(result?.message || 'Registration failed. Please check your details.');
        toast.error(result?.message || 'Registration failed');
      }
    } catch (err) {
      setFormError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div
          className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-xl border border-slate-200/90 animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Join CampusResolve <span className="text-brand-600">AI</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Create your unified campus maintenance & complaint account
                </p>
              </div>
            </div>

            <button
              type="button"
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Form */}
          <div className="px-6 py-5 max-h-[82vh] overflow-y-auto">
            {formError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{formError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Role Selection Tabs */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Select Campus Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2.5 px-2 rounded-2xl border text-center font-bold transition-all text-xs flex flex-col items-center gap-1 ${
                      role === 'student'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">🎓</span>
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('staff')}
                    className={`py-2.5 px-2 rounded-2xl border text-center font-bold transition-all text-xs flex flex-col items-center gap-1 ${
                      role === 'staff'
                        ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-200 shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base">🛠️</span>
                    <span>Staff</span>
                  </button>

                </div>
              </div>

              {/* Two Column Grid: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Prachi Sharma"
                      required
                      className="w-full pl-9 pr-3 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <FieldValidation
                    id="register-modal-name-validation"
                    message={name.trim() ? 'Name looks good' : ''}
                    isValid
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Campus Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@campus.edu"
                      required
                      className="w-full pl-9 pr-3 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <FieldValidation
                    id="register-modal-email-validation"
                    message={
                      email.trim()
                        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                          ? 'Email address looks valid'
                          : 'Enter a valid email address'
                        : ''
                    }
                    isValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}
                  />
                </div>
              </div>

              {/* Password & User ID / Registration ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-9 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldValidation
                    id="register-modal-password-validation"
                    message={
                      password
                        ? password.length >= 6
                          ? 'Password length is valid'
                          : 'Password must be at least 6 characters'
                        : ''
                    }
                    isValid={password.length >= 6}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {role === 'student'
                      ? 'Roll / Student ID'
                      : 'Staff / Employee ID'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder={
                        role === 'student'
                          ? 'CS2024-042'
                          : 'STAFF-209'
                      }
                      required
                      className="w-full pl-9 pr-3 rounded-xl border-slate-200 text-xs py-2.5 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>
                  <FieldValidation
                    id="register-modal-user-id-validation"
                    message={userId.trim() ? 'ID looks good' : ''}
                    isValid
                  />
                </div>
              </div>

              {/* Department & Division */}
              <div className={role === 'student' ? 'grid grid-cols-1 sm:grid-cols-3 gap-3' : ''}>
                <div className={role === 'student' ? 'sm:col-span-2' : ''}>
                  <label className="block font-bold text-slate-700 mb-1">
                    Department <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border-slate-200 text-xs py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500 font-medium"
                  >
                    {DEPARTMENTS[role].map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {role === 'student' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Division <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full rounded-xl border-slate-200 text-xs py-2.5 px-3 focus:ring-brand-500 focus:border-brand-500 font-medium"
                    >
                      <option value="A">Division A</option>
                      <option value="B">Division B</option>
                      <option value="C">Division C</option>
                      <option value="D">Division D</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Modal Action Buttons: Cancel and Submit */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 transition-all hover:scale-[1.01] disabled:opacity-60"
                >
                  <span>{isSubmitting ? 'Registering Account...' : 'Submit & Register'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
