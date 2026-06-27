'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Globe, Lock, Plus, X, Send,
  RotateCcw, AlertCircle, Settings, Trash2, FileText,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useCourseChat } from '../../../hooks/useCourseChat';
import { api, Course, Document } from '../../../lib/api';
import { DocumentCard } from '../../../components/DocumentCard';
import { DocumentUpload } from '../../../components/DocumentUpload';
import { MessageBubble } from '../../../components/MessageBubble';
import { Button } from '../../../components/ui/Button';

const LEVELS = ['Level 100','Level 200','Level 300','Level 400','Level 500','Level 600','Level 700'];

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', code: '', level: '', description: '', is_public: false });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { messages, streaming, error: chatError, sendMessage, clearChat } = useCourseChat(courseId, false);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadData = async () => {
    try {
      const [c, docs] = await Promise.all([api.getCourse(courseId), api.getCourseDocuments(courseId)]);
      setCourse(c);
      setDocuments(docs);
      setEditData({ title: c.title, code: c.code, level: c.level, description: c.description ?? '', is_public: c.is_public });
    } catch {
      router.replace('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (!authLoading) loadData(); }, [courseId, authLoading]);

  // Poll while docs are processing
  useEffect(() => {
    const hasActive = documents.some(d => d.status === 'pending' || d.status === 'processing');
    if (!hasActive) return;
    const id = setInterval(() => api.getCourseDocuments(courseId).then(setDocuments).catch(() => {}), 3000);
    return () => clearInterval(id);
  }, [documents, courseId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSave = async () => {
    if (!course) return;
    setSaving(true);
    try {
      const updated = await api.updateCourse(courseId, editData);
      setCourse(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this course? Documents will remain in your library.')) return;
    setDeleting(true);
    await api.deleteCourse(courseId).catch(() => {});
    router.replace('/dashboard');
  };

  const handleDeleteDoc = async (docId: string) => {
    await api.deleteDocument(docId).catch(() => {});
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleSend = () => {
    const q = input.trim();
    if (!q || streaming) return;
    setInput('');
    sendMessage(q);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const togglePublic = async () => {
    if (!course) return;
    const updated = await api.updateCourse(courseId, { is_public: !course.is_public }).catch(() => null);
    if (updated) setCourse(updated);
  };

  if (authLoading || loading) return (
    <div className="min-h-dvh bg-bg-base flex items-center justify-center">
      <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!course) return null;

  const readyDocs = documents.filter(d => d.status === 'ready');

  return (
    <div className="min-h-dvh bg-bg-base flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-bg-border bg-bg-base/90 backdrop-blur-md shrink-0">
        <div className="max-w-6xl mx-auto px-5 flex items-center gap-3" style={{ height: 52 }}>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-bg-elevated transition-all">
            <ArrowLeft className="w-3.5 h-3.5" /><span className="hidden sm:block">Dashboard</span>
          </button>
          <div className="w-px h-4 bg-bg-border" />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <BookOpen className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-sm font-medium text-ink truncate">{course.title}</span>
            <span className="text-xs text-accent/70 font-mono shrink-0">{course.code}</span>
            <span className="text-xs text-ink-faint shrink-0">{course.level}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={togglePublic} className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all ${course.is_public ? 'text-status-ready hover:bg-status-ready/10' : 'text-ink-faint hover:text-ink hover:bg-bg-elevated'}`}>
              {course.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden sm:block">{course.is_public ? 'Public' : 'Private'}</span>
            </button>
            <button onClick={() => setEditing(v => !v)} className="text-ink-faint hover:text-ink p-1.5 rounded-lg hover:bg-bg-elevated transition-all">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleDelete} disabled={deleting} className="text-ink-faint hover:text-status-failed p-1.5 rounded-lg hover:bg-status-failed/10 transition-all disabled:opacity-40">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Edit panel */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-bg-border bg-bg-surface"
          >
            <div className="max-w-6xl mx-auto px-5 py-5 grid sm:grid-cols-4 gap-4">
              <input value={editData.title} onChange={e => setEditData(p => ({ ...p, title: e.target.value }))} placeholder="Title" className="sm:col-span-2 bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent/40" />
              <input value={editData.code} onChange={e => setEditData(p => ({ ...p, code: e.target.value }))} placeholder="Code" className="bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent/40" />
              <select value={editData.level} onChange={e => setEditData(p => ({ ...p, level: e.target.value }))} className="bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent/40 cursor-pointer">
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
              <input value={editData.description} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))} placeholder="Description (optional)" className="sm:col-span-3 bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent/40" />
              <div className="flex items-center gap-2">
                <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split layout: docs | chat */}
      <div className="flex-1 flex overflow-hidden max-w-6xl w-full mx-auto">
        {/* Left: documents */}
        <div className="w-80 shrink-0 border-r border-bg-border flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border shrink-0">
            <div>
              <p className="text-sm font-medium text-ink">Materials</p>
              <p className="text-xs text-ink-faint mt-0.5">{documents.length} {documents.length === 1 ? 'file' : 'files'}</p>
            </div>
            <button onClick={() => setShowUpload(v => !v)} className="flex items-center gap-1 text-xs text-ink-muted hover:text-accent px-2 py-1.5 rounded-lg hover:bg-accent/10 transition-all">
              {showUpload ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showUpload ? 'Cancel' : 'Add'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            <AnimatePresence>
              {showUpload && user && (
                <motion.div key="upload" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <DocumentUpload
                    userId={user.id}
                    courseId={courseId}
                    onDocumentQueued={() => {
                      setShowUpload(false);
                      setTimeout(() => api.getCourseDocuments(courseId).then(setDocuments), 500);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {documents.length === 0 && !showUpload && (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <FileText className="w-8 h-8 text-ink-faint" />
                <div>
                  <p className="text-xs font-medium text-ink">No materials yet</p>
                  <p className="text-xs text-ink-faint mt-1">Add PDFs, DOCX, or images</p>
                </div>
              </div>
            )}

            {documents.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onChat={id => router.push(`/chat/${id}`)}
                onDelete={handleDeleteDoc}
              />
            ))}
          </div>
        </div>

        {/* Right: chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border shrink-0">
            <div>
              <p className="text-sm font-medium text-ink">Chat with {course.title}</p>
              <p className="text-xs text-ink-faint mt-0.5">Searches across all {readyDocs.length} ready documents</p>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink px-2.5 py-1.5 rounded-lg hover:bg-bg-elevated transition-all">
                <RotateCcw className="w-3 h-3" />New chat
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
                <div className="text-center">
                  <p className="text-xl font-semibold text-ink mb-2">Ready to answer</p>
                  <p className="text-sm text-ink-muted max-w-xs">
                    {readyDocs.length === 0
                      ? 'Add documents to this course first, then ask questions.'
                      : `Ask anything about ${course.title} (${course.code})`
                    }
                  </p>
                </div>
                {readyDocs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                    {['Summarize the key topics', 'What are the main concepts?', 'List important definitions', 'What does this course cover?'].map(s => (
                      <button key={s} onClick={() => sendMessage(s)} className="text-left text-xs text-ink-muted border border-bg-border rounded-xl px-3.5 py-3 hover:border-accent/40 hover:text-ink hover:bg-bg-elevated transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                placeholder={readyDocs.length === 0 ? 'Add documents first…' : 'Ask about this course…'}
                rows={1}
                disabled={streaming || readyDocs.length === 0}
                className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint resize-none outline-none leading-relaxed disabled:opacity-50"
                style={{ minHeight: 24, maxHeight: 160 }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || streaming || readyDocs.length === 0}
                className="shrink-0 w-8 h-8 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
              >
                {streaming ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
