'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Globe, FileText, Send,
  RotateCcw, AlertCircle, Layers, Hash,
} from 'lucide-react';
import { api, PublicCourse } from '../../../lib/api';
import { useCourseChat } from '../../../hooks/useCourseChat';
import { MessageBubble } from '../../../components/MessageBubble';

const SUGGESTIONS = [
  'Summarize the key topics in this course',
  'What are the main concepts covered?',
  'List important definitions or terms',
  'What questions might appear in an exam?',
];

export default function PublicCourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();

  const [course, setCourse] = useState<PublicCourse | null>(null);
  const [loading, setLoading] = useState(true);

  const { messages, streaming, error: chatError, sendMessage, clearChat } = useCourseChat(courseId, true);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.getPublicCourse(courseId)
      .then(setCourse)
      .catch(() => router.replace('/explore'))
      .finally(() => setLoading(false));
  }, [courseId, router]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || streaming) return;
    setInput('');
    sendMessage(q);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  if (loading) return (
    <div className="min-h-dvh bg-bg-base flex items-center justify-center">
      <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!course) return null;

  return (
    <div className="min-h-dvh bg-bg-base flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-bg-border bg-bg-base/90 backdrop-blur-md shrink-0">
        <div className="max-w-5xl mx-auto px-5 flex items-center gap-3" style={{ height: 52 }}>
          <button onClick={() => router.push('/explore')} className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-bg-elevated transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /><span className="hidden sm:block">Explore</span>
          </button>
          <div className="w-px h-4 bg-bg-border" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-sm font-medium text-ink truncate">{course.title}</span>
            <span className="text-xs text-accent/70 font-mono shrink-0">{course.code}</span>
          </div>
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="text-xs text-ink-faint">{course.level}</span>
            {course.documents.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-ink-faint">
                <Layers className="w-3 h-3" />{course.documents.length} {course.documents.length === 1 ? 'doc' : 'docs'}
              </span>
            )}
            {course.author && (
              <span className="flex items-center gap-1 text-xs text-ink-faint">
                by {course.author}
              </span>
            )}
          </div>
          <div className="w-px h-4 bg-bg-border shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <Globe className="w-3.5 h-3.5 text-status-ready" />
            <span className="hidden sm:block text-xs text-status-ready">Public</span>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden max-w-5xl w-full mx-auto">
        {/* Left: document list */}
        <div className="hidden md:flex w-64 shrink-0 border-r border-bg-border flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-bg-border shrink-0">
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Course Materials</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {course.documents.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <FileText className="w-7 h-7 text-ink-faint" />
                <p className="text-xs text-ink-faint">No materials added yet</p>
              </div>
            ) : (
              course.documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-bg-elevated transition-all">
                  <FileText className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-ink truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {doc.page_count && <span className="text-xs text-ink-faint flex items-center gap-0.5"><Layers className="w-2.5 h-2.5" />{doc.page_count}p</span>}
                      {doc.word_count && <span className="text-xs text-ink-faint flex items-center gap-0.5"><Hash className="w-2.5 h-2.5" />{(doc.word_count / 1000).toFixed(1)}k</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sign-up nudge */}
          <div className="px-4 py-4 border-t border-bg-border">
            <p className="text-xs text-ink-faint mb-2">Want to create your own course?</p>
            <button onClick={() => router.push('/register')} className="w-full text-xs font-medium text-accent border border-accent/30 rounded-lg py-2 hover:bg-accent/10 transition-all">
              Sign up free
            </button>
          </div>
        </div>

        {/* Right: chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border shrink-0">
            <div>
              <p className="text-sm font-medium text-ink">Ask the AI</p>
              <p className="text-xs text-ink-faint mt-0.5">
                {course.documents.length > 0
                  ? `Grounded in ${course.documents.length} course ${course.documents.length === 1 ? 'document' : 'documents'}`
                  : 'No documents in this course yet'
                }
              </p>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-bg-elevated transition-all">
                <RotateCcw className="w-3 h-3" />New chat
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
                <div className="text-center">
                  <p className="text-xl font-semibold text-ink mb-2">Ask anything</p>
                  <p className="text-sm text-ink-muted max-w-sm">
                    {course.documents.length === 0
                      ? 'The course owner hasn\'t added any materials yet.'
                      : `Questions are answered from ${course.title} (${course.code}) course materials.`
                    }
                  </p>
                </div>
                {course.documents.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                    {SUGGESTIONS.map(s => (
                      <button key={s} onClick={() => sendMessage(s)} className="text-left text-xs text-ink-muted border border-bg-border rounded-xl px-3.5 py-3 hover:border-accent/40 hover:text-ink hover:bg-bg-elevated transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              messages.map(msg => (
                <MessageBubble key={msg.id} role={msg.role} content={msg.content} sources={msg.sources} streaming={msg.streaming} />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {chatError && (
            <div className="mx-6 mb-2 flex items-center gap-2 text-xs text-status-failed bg-status-failed/10 border border-status-failed/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{chatError}
            </div>
          )}

          <div className="shrink-0 px-6 pb-6 pt-2">
            <div className="flex items-end gap-3 bg-bg-elevated border border-bg-border rounded-2xl px-4 py-3 focus-within:border-accent/40 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`; }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={course.documents.length === 0 ? 'No materials yet…' : 'Ask a question about this course…'}
                rows={1}
                disabled={streaming || course.documents.length === 0}
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint resize-none outline-none leading-relaxed disabled:opacity-50"
                style={{ minHeight: 24, maxHeight: 160 }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming || course.documents.length === 0}
                className="shrink-0 w-8 h-8 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
              >
                {streaming ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-center text-xs text-ink-faint mt-2">
              Answers are grounded in course materials. No sign-in required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
