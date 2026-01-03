'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  masterKey?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  masterKey = '1234'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 100);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputValue === masterKey) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setInputValue('');
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKeyPress = (key: string) => {
    if (inputValue.length < 10) {
      setInputValue(prev => prev + key);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setInputValue(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setInputValue('');
    setError(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop with scan lines effect */}
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
      <div
        className={`relative w-full max-w-md mx-4 bg-[#0a0f0a] border-2 ${
          error ? 'border-red-600' : 'border-emerald-800'
        } rounded-lg overflow-hidden shadow-2xl shadow-emerald-900/50 ${
          shake ? 'animate-shake' : ''
        }`}
        style={{
          animation: shake ? 'shake 0.5s ease-in-out' : 'none'
        }}
      >
        {/* Header */}
        <div className="bg-[#0d120d] border-b border-emerald-900/50 p-4 text-center">
          <div className="text-5xl mb-2">🔐</div>
          <h2 className="text-emerald-400 font-mono text-lg tracking-widest">
            ACCESS RESTRICTED
          </h2>
          <p className="text-emerald-700 font-mono text-xs mt-1">
            Enter master key to continue
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Display */}
          <div className="mb-6">
            <div
              className={`bg-[#050805] border-2 ${
                error ? 'border-red-800' : 'border-emerald-900'
              } rounded-lg p-4 text-center font-mono`}
            >
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-10 h-12 flex items-center justify-center text-xl rounded border-2 ${
                      error
                        ? 'border-red-700 text-red-400'
                        : inputValue[i]
                        ? 'border-emerald-600 text-emerald-400'
                        : 'border-emerald-900/50 text-emerald-800'
                    }`}
                  >
                    {inputValue[i] ? '●' : '_'}
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-3 text-red-500 text-sm font-mono animate-pulse">
                  ⚠️ ACCESS DENIED - Invalid key
                </div>
              )}
            </div>
          </div>

          {/* Hidden input for keyboard */}
          <input
            ref={inputRef}
            type="password"
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              if (val.length <= 10) {
                setInputValue(val);
                setError(false);
              }
            }}
            className="sr-only"
            autoFocus
          />

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === '⌫') handleBackspace();
                  else if (key === 'C') handleClear();
                  else handleKeyPress(key);
                }}
                className={`p-4 rounded font-mono text-xl transition-all ${
                  key === 'C'
                    ? 'bg-amber-900/30 border border-amber-800 text-amber-500 hover:bg-amber-800/50'
                    : key === '⌫'
                    ? 'bg-red-900/30 border border-red-800 text-red-500 hover:bg-red-800/50'
                    : 'bg-emerald-900/30 border border-emerald-800 text-emerald-400 hover:bg-emerald-800/50 hover:border-emerald-600'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={inputValue.length === 0}
            className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 disabled:bg-emerald-900/30 disabled:text-emerald-800 text-emerald-100 font-mono font-bold rounded transition-colors border border-emerald-600 disabled:border-emerald-900"
          >
            ⚡ AUTHENTICATE
          </button>

          {/* Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-2 text-emerald-700 hover:text-emerald-500 font-mono text-sm transition-colors"
          >
            [ESC] Cancel
          </button>
        </form>

        {/* Footer */}
        <div className="bg-[#0d120d] border-t border-emerald-900/50 p-2 text-center">
          <span className="text-emerald-800 font-mono text-xs">
            🔒 UNDERGROUND LAB SECURITY SYSTEM
          </span>
        </div>
      </div>

      {/* CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PasswordModal;
