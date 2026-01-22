'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Later: handle real auth (Clerk / NextAuth / your backend)

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-10 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-3 text-indigo-100">Sign in to manage your school</p>
        </div>

        {/* Form */}
        <div className="px-8 py-10">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
                placeholder="you@school.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-2">Remember me</span>
              </label>
              <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
            >
              Sign in
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-emerald-600 hover:text-emerald-500 transition">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}