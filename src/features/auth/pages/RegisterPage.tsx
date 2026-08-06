import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserPlus, GraduationCap } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAuthStore } from '../store/auth.store';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [fullName, setFullName] = useState('Alex Student');
  const [email, setEmail] = useState('alex.student@gmail.com');
  const [phone, setPhone] = useState('+91 98765 00000');
  const [password, setPassword] = useState('password123');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password, rememberMe: true });
    navigate('/student/academies', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-xs text-left">
      <Card padding="lg" className="max-w-md w-full bg-white space-y-6 shadow-2xl rounded-3xl border border-slate-800">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto text-white shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Student Account</h1>
          <p className="text-xs text-slate-500 font-medium">
            Register once to access courses across all partner academies.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Full Name *</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Email Address *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Phone Number *</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Password *</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-blue-600 text-white font-extrabold text-sm shadow-md mt-2" leftIcon={<UserPlus className="w-4 h-4" />}>
            Create Global Account
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-slate-500 font-medium">
            Already registered? <Link to="/login" className="font-extrabold text-blue-600 hover:underline">Sign In</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
