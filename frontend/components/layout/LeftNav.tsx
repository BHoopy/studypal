'use client';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen, Compass, LayoutGrid, MessageSquare, Plus, PanelLeft,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: null, icon: MessageSquare, label: 'Chat', match: /\/courses\/|\/chat\// },
] as const;

export function LeftNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const isActive = (href: string | null, match?: RegExp) => {
    if (match) return match.test(pathname);
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <motion.aside
      animate={{ width: expanded ? 200 : 56 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="shrink-0 bg-bg-base border-r border-bg-border flex flex-col py-3 gap-1 overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className={`h-9 rounded-xl flex items-center gap-3 text-ink-faint hover:text-ink hover:bg-bg-elevated transition-all mb-1 ${
          expanded ? 'px-3 mx-2' : 'w-9 justify-center mx-auto'
        }`}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <PanelLeft className="w-4 h-4 shrink-0" />
        {expanded && <span className="text-sm font-medium whitespace-nowrap">Collapse</span>}
      </button>

      <button
        type="button"
        onClick={() => router.push('/courses/new')}
        className={`h-9 rounded-xl flex items-center gap-3 text-ink-faint hover:text-secondary hover:bg-secondary-muted transition-all ${
          expanded ? 'px-3 mx-2' : 'w-9 justify-center mx-auto'
        }`}
        aria-label="New course"
        title="New course"
      >
        <Plus className="w-4 h-4 shrink-0" />
        {expanded && <span className="text-sm font-medium whitespace-nowrap">New course</span>}
      </button>

      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className={`h-9 rounded-xl flex items-center gap-3 text-secondary mb-2 ${
          expanded ? 'px-3 mx-2' : 'w-9 justify-center mx-auto'
        }`}
        aria-label="StudyPal home"
        title="StudyPal"
      >
        <BookOpen className="w-4 h-4 shrink-0" />
        {expanded && <span className="text-sm font-semibold whitespace-nowrap">StudyPal</span>}
      </button>

      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(item => {
          const { href, icon: Icon, label } = item;
          const match = 'match' in item ? item.match : undefined;
          const active = isActive(href, match);
          return (
            <button
              key={label}
              type="button"
              onClick={() => href && router.push(href)}
              title={label}
              className={`h-9 rounded-xl flex items-center gap-3 transition-all ${
                expanded ? 'px-3 mx-2' : 'w-9 justify-center mx-auto'
              } ${
                active
                  ? 'bg-secondary text-white shadow-lg shadow-secondary/25'
                  : 'text-ink-faint hover:text-ink hover:bg-bg-elevated'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {expanded && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
            </button>
          );
        })}
      </div>
    </motion.aside>
  );
}
