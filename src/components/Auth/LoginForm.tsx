import React, { useState } from 'react';
import { User, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRegistrationForm } from '../UserManagement/UserRegistrationForm';

export function LoginForm() {
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for admin login
    if (email === 'Aadamabdurahman1974@gmail.com' && password === 'Aa0605023') {
      const adminUser = state.users.find(u => u.email === email && u.role === 'admin');
      if (adminUser) {
        dispatch({ type: 'SET_USER', payload: adminUser });
        return;
      }
    }
    
    // Check for other users (you can add password validation here later)
    const user = state.users.find(u => u.email === email && u.role !== 'admin');
    if (user && password) { // Basic password check - you should implement proper authentication
      dispatch({ type: 'SET_USER', payload: user });
    } else {
      alert('Invalid email or password');
    }
  };

  const quickLogin = (userEmail: string) => {
    const user = state.users.find(u => u.email === userEmail);
    if (user) {
      dispatch({ type: 'SET_USER', payload: user });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8 w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">NWI B2B</h1>
          <p className="text-gray-600 mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg font-bold">NEW WORLD INNOVATIONS</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6 lg:space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 lg:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm lg:text-base"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 lg:py-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm lg:text-base"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 lg:py-4 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            Sign In
          </button>
        </form>


        {/* Registration Option */}
        <div className="mt-6 sm:mt-8 lg:mt-10 border-t pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Don't have an account?</p>
            <button
              onClick={() => setShowRegistration(true)}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 lg:py-4 rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm lg:text-base mb-3"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Sign Up
            </button>
            <p className="text-xs text-gray-500">
              Applications require admin approval
            </p>
          </div>
        </div>
      </div>
      
      <UserRegistrationForm 
        isOpen={showRegistration} 
        onClose={() => setShowRegistration(false)} 
      />
    </div>
  );
}