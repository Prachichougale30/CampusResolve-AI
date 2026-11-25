import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import FieldValidation from '../../components/common/FieldValidation';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your email or admin ID');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      setIsLoading(false);

      if (res && res.success) {
        const role = res.user?.role;
        toast.success(`Logged in successfully as ${res.user?.name || role?.toUpperCase()}`);

        // Check if there was a previous redirect target
        const destination = location.state?.from?.pathname;
        if (destination) {
          navigate(destination, { replace: true });
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'staff') {
          navigate('/staff/dashboard');
        } else if (role === 'student') {
          navigate('/student/dashboard');
        } else {
          toast.error('This account has an unsupported role.');
        }
      } else {
        toast.error(res?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setIsLoading(false);
      toast.error(err.message || 'An error occurred during sign-in');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
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
          Sign In to Access Your Portal
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          "Smarter Campus. Faster Resolutions."
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-soft rounded-3xl border border-slate-200/80 space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Email or Admin ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your campus email or admin ID"
                  autoComplete="username"
                  required
                  className="w-full pl-10 rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <FieldValidation
                id="login-identifier-validation"
                message={identifier.trim() ? 'Identifier looks good' : ''}
                isValid
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  minLength={6}
                  className="w-full pl-10 rounded-xl border-slate-200 text-xs sm:text-sm py-2.5 focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <FieldValidation
                id="login-password-validation"
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-700 hover:to-accent-700 shadow-md shadow-brand-500/20 transition-all hover:scale-[1.01]"
            >
              <span>
                {isLoading
                  ? 'Authenticating...'
                  : 'Sign In'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
       
            <span>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
                Register
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
