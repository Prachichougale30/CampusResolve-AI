import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import FieldValidation from '../../components/common/FieldValidation';

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

const RegisterPage = () => {
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

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setDepartment(DEPARTMENTS[newRole][0]);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

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
          : 'Staff / Employee ID is required'
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
        toast.success(`Welcome, ${result.user?.name || name}! Account registered successfully.`, {
          icon: '🎉',
          duration: 4000,
        });

        if (role === 'staff') {
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            CampusResolve <span className="text-brand-600">AI</span>
          </span>
        </Link>
        <h2 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Create Your Campus Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Connect directly with campus maintenance and track tickets seamlessly
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft rounded-3xl border border-slate-200/80 space-y-6">
          {formError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{formError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Role Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Select Campus Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
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
                  onClick={() => handleRoleChange('staff')}
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

            {/* Full Name & Campus Email */}
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
                  id="register-name-validation"
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
                  id="register-email-validation"
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
                  id="register-password-validation"
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
                  id="register-user-id-validation"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 shadow-md shadow-brand-500/20 transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
