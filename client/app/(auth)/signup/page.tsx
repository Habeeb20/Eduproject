'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="w-full max-w-md">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-10 text-center">
          <h1 className="text-3xl font-bold text-white">Join SchoolHub</h1>
          <p className="mt-3 text-emerald-100">Create your account and start managing</p>
        </div>

        <div className="px-8 py-10">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email & Password fields similar to login, but with emerald focus */}
            {/* ... copy email + password inputs, change focus to emerald-500 / emerald-200 */}

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition"
            >
              Create account
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}