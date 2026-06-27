'use client';
import { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';
import { getPublicCourseUrl } from '../lib/courseLinks';

interface Props {
  courseId: string;
  isPublic: boolean;
  onMakePublic?: () => Promise<void>;
  variant?: 'icon' | 'button';
  className?: string;
}

export function ShareCourseButton({ courseId, isPublic, onMakePublic, variant = 'button', className = '' }: Props) {
  const [copied, setCopied] = useState(false);
  const [makingPublic, setMakingPublic] = useState(false);

  const copyLink = async () => {
    const url = getPublicCourseUrl(courseId);
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!isPublic && onMakePublic) {
      setMakingPublic(true);
      try {
        await onMakePublic();
      } finally {
        setMakingPublic(false);
      }
    }
    await copyLink();
  };

  const label = copied ? 'Link copied!' : makingPublic ? 'Making public…' : isPublic ? 'Copy link' : 'Share';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleShare}
        disabled={makingPublic}
        title={isPublic ? 'Copy share link' : 'Make public and copy link'}
        className={`text-ink-faint hover:text-accent p-1.5 rounded-lg hover:bg-accent/10 transition-all disabled:opacity-40 ${className}`}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-status-ready" /> : <Share2 className="w-3.5 h-3.5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={makingPublic}
      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-40 ${
        copied
          ? 'text-status-ready bg-status-ready/10'
          : 'text-ink-muted hover:text-accent hover:bg-accent/10'
      } ${className}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
