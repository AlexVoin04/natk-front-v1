import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { forgotPassword } from '../services/password';

interface FormErrors {
  email?: string;
}

const validateEmail = (email: string) => {
  if (!email) return 'Email is required';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Email is invalid';
  return '';
};

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    if (emailError) {
      setFormErrors({ email: emailError });
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success('If the account exists, a reset email has been sent');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#4B67F5] rounded-xl flex items-center justify-center mb-4 overflow-hidden">
            <img src="/logo.svg" alt="Stratus" className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-[#3A3A3C]">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and we will send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <Send className="text-[#4B67F5]" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-[#3A3A3C]">
                Check your email
              </h3>
              <p className="text-sm text-gray-600 leading-6">
                If an account with <span className="font-medium">{email}</span> exists,
                we have sent a password reset link.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-[#4B67F5] hover:underline"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#3A3A3C] mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFormErrors({ email: validateEmail(e.target.value) });
                    }}
                    className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4B67F5] focus:border-transparent ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#4B67F5] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B67F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
                {loading ? 'Sending...' : 'Send reset link'}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;