import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '@/client/assets/logo-fifa-il.png';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => navigate('/manager'), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a1628] overflow-hidden">
      {/* רקע גלים */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-blue-900/30 animate-ping"
          style={{ animationDuration: '3s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-900/20 animate-ping"
          style={{ animationDuration: '4s', animationDelay: '0.5s' }}
        />
      </div>

      {/* תוכן */}
      <div
        className="relative z-10 text-center flex flex-col items-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 1.5s ease, transform 1.5s ease',
        }}
      >
        <div className="relative mb-6 fifa-shimmer">
          <img
            src={logoImage}
            alt="FIFA IL"
            className="logo-brand w-[min(70vw,24rem)] h-auto object-contain"
          />
        </div>

        <h1 className="font-display text-8xl font-bold text-white tracking-wide mb-2 fifa-flash">
          FIFA <span className="text-[#c6ff2e]">IL</span>
        </h1>
        <p className="font-heading text-2xl text-blue-200 tracking-wider mb-10">
          ליגת העל הישראלית
        </p>

        <div className="flex items-center gap-3 mb-10">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#c6ff2e]" />
          <span className="font-heading uppercase text-xs tracking-[0.35em] text-[#c6ff2e]">
            Manager Edition
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#c6ff2e]" />
        </div>

        {/* פס טעינה */}
        <div className="w-64 h-1 bg-[#131c27] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#c6ff2e] to-[#e6ff8f] rounded-full"
            style={{
              animation: 'splash-load 3.2s ease-out forwards',
            }}
          />
        </div>
        <p className="mt-3 text-[#5d738c] text-sm">טוען את מערכת הניהול...</p>
      </div>

      <p className="absolute bottom-6 text-[#2c3e52] text-xs">
        © 2024 FIFA IL · Israeli Premier League Manager
      </p>

      <style>{`
        @keyframes splash-load {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>
    </div>
  );
}
