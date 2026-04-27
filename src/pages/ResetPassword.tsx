import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { resetPassword } from '../services/password';

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const validatePassword = (password: string) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
};

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token'), [params]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <ShieldCheck className="text-red-500" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-[#3A3A3C] mb-2">
              Invalid reset link
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              The reset link is missing or invalid.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4B67F5] text-white hover:bg-blue-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Request new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = validatePassword(password);
    const confirmError =
      confirmPassword !== password ? 'Passwords do not match' : '';

    const nextErrors: FormErrors = {};
    if (passwordError) nextErrors.password = passwordError;
    if (confirmError) nextErrors.confirmPassword = confirmError;

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Password changed successfully');
      navigate('/login');
    } catch {
      toast.error('Link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field?: string) =>
    `w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5] focus:border-transparent ${
      field ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#4B67F5] rounded-xl flex items-center justify-center mb-4 overflow-hidden">
            <img src="/logo.svg" alt="Stratus" className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-[#3A3A3C]">
            Create new password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose a strong password for your account
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3A3A3C] mb-2">
                New password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErrors((prev) => ({
                      ...prev,
                      password: validatePassword(e.target.value),
                    }));
                  }}
                  className={inputClass(formErrors.password)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3A3A3C]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#3A3A3C] mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setFormErrors((prev) => ({
                      ...prev,
                      confirmPassword:
                        e.target.value !== password ? 'Passwords do not match' : undefined,
                    }));
                  }}
                  className={inputClass(formErrors.confirmPassword)}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3A3A3C]"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#4B67F5] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B67F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ShieldCheck size={18} />
              {loading ? 'Saving...' : 'Change password'}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-[#4B67F5] hover:underline"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;