import React from 'react';
import { Github, Heart } from 'lucide-react';
import { sounds } from '../sound';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-cat-border bg-cat-bg pt-12 pb-16 text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => sounds.playMeow()}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cat-primary to-cat-accent flex items-center justify-center text-sm shadow cursor-pointer active:scale-90 transition-transform"
              title="Meow!"
            >
              🐾
            </div>
            <div>
              <span className="font-brand font-bold text-white text-base">Neko Suite</span>
              <p className="text-[11px] text-gray-500">{t.footer.desc}</p>
            </div>
          </div>

          {/* Badges / Principles */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-cat-card border border-cat-border text-[11px] font-mono">
              🦀 Tauri v2 + Rust
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cat-card border border-cat-border text-[11px] font-mono">
              ⚡ Polars Engine
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cat-card border border-cat-border text-[11px] font-mono">
              ⚛️ React + Tailwind
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cat-card border border-cat-border text-[11px] font-mono text-emerald-400">
              🔒 100% Offline
            </span>
          </div>

          {/* Social / GitHub */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <span className="text-gray-600">|</span>
            <span>MIT License</span>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-gray-500">
          <p>{t.footer.allRights}</p>
          <p className="flex items-center justify-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>{t.footer.builtWith}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
