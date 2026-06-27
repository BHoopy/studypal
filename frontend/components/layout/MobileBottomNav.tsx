'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen, Compass, LayoutGrid, LogIn, MessageSquare, Plus,
} from 'lucide-react';
import { useAccount } from '../../hooks/useAccount';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Home' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: null, icon: MessageSquare, label: 'Chat', match: /\/courses\/|\/chat\/|\/explore\// },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAccount();

  const isActive = (href: string | null, match?: RegExp) => {
    if (match) return match.test(pathname);
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-bg-border bg-bg-base/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-1 pt-1.5 pb-1.5">
        {NAV_ITEMS.map(item => {
          const { href, icon: Icon, label } = item;
          const match = 'match' in item ? item.match : undefined;
          const active = isActive(href, match);
          const isExplore = href === '/explore';
          return (
            <button
              key={label}
              type="button"
              onClick={() => href && router.push(href)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[4rem] py-1 rounded-xl transition-all ${
                active
                  ? 'text-secondary'
                  : isExplore
                    ? 'text-accent/80'
                    : 'text-ink-faint'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => router.push('/courses/new')}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[4rem] py-1 rounded-xl text-ink-faint"
        >
          <Plus className="w-5 h-5" />
          <span className="text-[10px] font-medium">New</span>
        </button>

        <button
          type="button"
          onClick={() => router.push(user ? '/dashboard' : '/login')}
          className="flex flex-col items-center justify-center gap-0.5 min-w-[4rem] py-1 rounded-xl text-secondary"
        >
          {user ? <BookOpen className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
          <span className="text-[10px] font-medium">{user ? 'StudyPal' : 'Sign in'}</span>
        </button>
      </div>
    </nav>
  );
}
