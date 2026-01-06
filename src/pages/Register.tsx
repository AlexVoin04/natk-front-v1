import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const namePattern = /^[A-Za-zА-Яа-яЁё-]+$/;

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    patronymic: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false        
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.surname.trim())
      newErrors.surname = 'Surname is required';
    else if (!namePattern.test(formData.surname))
      newErrors.surname = 'Only letters allowed';

    if (!formData.name.trim())
      newErrors.name = 'Name is required';
    else if (!namePattern.test(formData.name))
      newErrors.name = 'Only letters allowed';

    if (formData.patronymic.trim() && !namePattern.test(formData.patronymic))
      newErrors.patronymic = 'Only letters allowed';

    if (!formData.email.trim())
      newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (!formData.terms)
      newErrors.terms = 'You must accept the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const clean = value.replace(/[^A-Za-zА-Яа-яЁё-]/g, ''); // маска — только буквы/дефис

    setFormData(prev => ({ ...prev, [name]: clean }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const { success, error } = await register(
      formData.name,
      formData.surname,
      formData.patronymic,
      formData.email,
      formData.password
    );
    if (success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      setErrors(prev => ({ ...prev, email: error || 'Registration failed' }));
      toast.error(error || 'Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

   const inputClass = (field: string) =>
    `w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none 
     ${errors[field]
       ? 'border-red-500 focus:ring-red-400'
       : 'border-gray-300 focus:ring-2 focus:ring-[#4B67F5] focus:border-transparent'
     }`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#4B67F5] rounded-xl flex items-center justify-center mb-4">
            <div className="text-white font-bold text-sm">
              <img src='/logo.svg'></img>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-[#3A3A3C]">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[#4B67F5] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Surname */}
            <div>
              <label className="block text-sm font-medium mb-2">Surname</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  name="surname"
                  value={formData.surname}
                  onChange={handleNameInput}
                  className={inputClass("surname")}
                  placeholder="Enter your surname"
                />
              </div>
              {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleNameInput}
                  className={inputClass("name")}
                  placeholder="Enter your name"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Patronymic */}
            <div>
              <label className="block text-sm font-medium mb-2">Patronymic (optional)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  name="patronymic"
                  value={formData.patronymic}
                  onChange={handleNameInput}
                  className={inputClass("patronymic")}
                  placeholder="Enter your patronymic"
                />
              </div>
              {errors.patronymic && <p className="text-red-500 text-sm mt-1">{errors.patronymic}</p>}
            </div>

            {/* EMAIL */}
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
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass("email")}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3A3A3C] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass("password")}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3A3A3C]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* CONFIRM PASSWORD */}
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
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass("confirmPassword")}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3A3A3C]"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={() =>
                  setFormData(prev => ({ ...prev, terms: !prev.terms }))
                }
                className="h-4 w-4 text-[#4B67F5] focus:ring-[#4B67F5] border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-[#3A3A3C]">
                I agree to the{' '}
                <a href="#" className="text-[#4B67F5] hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#4B67F5] hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {errors.terms && (
              <p className="text-center text-red-500 text-sm mt-1">{errors.terms}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#4B67F5] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B67F5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;