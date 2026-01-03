'use client';

import React, { useState, useEffect, useRef } from 'react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  // Focus username input when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setError(null);
      setTimeout(() => usernameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess(data.token);
      } else {
        setError(data.error || 'Authentication failed');
        setPassword('');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95"
        onClick={onClose}
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          )`
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[#0a0f0a] border-2 border-emerald-800 rounded-lg overflow-hidden shadow-2xl shadow-emerald-900/50">
        {/* Header */}
        <div className="bg-[#0d120d] border-b border-emerald-900/50 p-6 text-center">
          <div className="text-5xl mb-3">🔐</div>
          <h2 className="text-emerald-400 font-mono text-xl tracking-widest">
            ADMIN ACCESS
          </h2>
          <p className="text-emerald-700 font-mono text-xs mt-2">
            Underground Lab Authentication
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-emerald-600 font-mono text-sm mb-2">
              USERNAME
            </label>
            <input
              ref={usernameRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#050805] border-2 border-emerald-900 rounded px-4 py-3 text-emerald-300 font-mono placeholder:text-emerald-800 focus:outline-none focus:border-emerald-600 transition-colors"
              placeholder="Enter username"
              required
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-emerald-600 font-mono text-sm mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050805] border-2 border-emerald-900 rounded px-4 py-3 text-emerald-300 font-mono placeholder:text-emerald-800 focus:outline-none focus:border-emerald-600 transition-colors"
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-400 font-mono text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-900/30 disabled:text-emerald-800 text-emerald-100 font-mono font-bold rounded transition-colors border border-emerald-600 disabled:border-emerald-900 mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                AUTHENTICATING...
              </span>
            ) : (
              '⚡ LOGIN'
            )}
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-emerald-700 hover:text-emerald-500 font-mono text-sm transition-colors"
          >
            [ESC] Cancel
          </button>
        </form>

        {/* Footer */}
        <div className="bg-[#0d120d] border-t border-emerald-900/50 p-2 text-center">
          <span className="text-emerald-800 font-mono text-xs">
            🔒 SECURE SERVER-SIDE AUTHENTICATION
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
