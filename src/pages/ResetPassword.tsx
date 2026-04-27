import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/password';
import { toast } from 'react-toastify';

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => params.get('token'), [params]);

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <div>Invalid reset link</div>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(token, password);
      toast.success('Password changed successfully');
      navigate('/login');
    } catch (e: any) {
      toast.error('Link is invalid or expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-form">
      <h2>Set new password</h2>
      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button disabled={loading}>Change password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
