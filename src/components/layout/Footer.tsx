import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-parchment bg-cream-dark/50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/lucas.jpg" alt="" width={20} height={20} className="w-5 h-5 rounded-full object-cover" />
            <span className="font-display font-semibold text-brown-light text-sm">
              Scott Forsey
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-brown-lighter">
              &copy; {new Date().getFullYear()} Scott Forsey. All rights reserved.
            </span>
            <a href="/admin" className="text-brown-lighter/40 hover:text-brown-lighter transition-colors" aria-label="Admin">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
