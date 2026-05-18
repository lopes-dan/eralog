import { type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

export default function NavShell({ children, className = '' }: Props) {
  return (
    <header className={`sticky top-0 z-40 bg-ink-950/90 backdrop-blur-md border-b border-ink-800 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {children}
      </div>
    </header>
  );
}
