import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-parchment bg-cream-dark/50 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2">
          <Image src="/lucas.jpg" alt="" width={20} height={20} className="w-5 h-5 rounded-full object-cover" />
          <span className="font-display font-semibold text-brown-light text-sm">
            Scott Forsey
          </span>
        </div>
      </div>
    </footer>
  );
}
