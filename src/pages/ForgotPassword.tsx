import React, { useState } from 'react';
import { forgotPassword } from '../services/password';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);
  
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await forgotPassword(email);
      toast.success('If the account exists, a reset email has been sent');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-form">
      <h2>Reset password</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button disabled={loading}>Send reset link</button>
      </form>
      <Link to="/login">Back to login</Link>
    </div>
  );
};

export default ForgotPassword;
