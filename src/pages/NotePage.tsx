/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Note, EditorMode } from '../types';
import { noteStorage } from '../services/noteStorage';
import { encryptionService } from '../services/encryptionService';
import { shareService } from '../services/shareService';
import { AppLayout } from '../components/AppLayout';
import { EditorToolbar } from '../components/EditorToolbar';
import { NoteEditor } from '../components/NoteEditor';
import { PasswordModal } from '../components/PasswordModal';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { VersionHistoryPanel } from '../components/VersionHistoryPanel';
import { QRShareModal } from '../components/QRShareModal';
import { extractWikiLinks } from '../utils/wikiLinkParser';
import { useTranslation } from '../i18n/i18n';
import { Lock, Unlock, Copy, Share2, Sparkles, X, Download, ShieldCheck, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

// Lazy load AI Assistant Panel for optimized performance and bundle size
const AIAssistantPanel = React.lazy(() =>
  import('../components/ai/AIAssistantPanel').then((m) => ({ default: m.AIAssistantPanel }))
);

export function NotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | 'idle'>('idle');

  // Wiki links tracking states
  const [backlinks, setBacklinks] = useState<Note[]>([]);
  const [outgoingLinks, setOutgoingLinks] = useState<string[]>([]);

  // Encryption session state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePassword, setActivePassword] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordMode, setPasswordMode] = useState<'lock' | 'unlock' | 'remove'>('unlock');

  // UI state
  const [editorMode, setEditorMode] = useState<EditorMode>('split');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [generatedShareUrl, setGeneratedShareUrl] = useState('');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // AI Integration state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [externalContentUpdate, setExternalContentUpdate] = useState<{
    text: string;
    mode: 'replace' | 'insert' | 'append' | 'replace-selection';
    timestamp: number;
  } | null>(null);

  // Keyboard shortcut Ctrl/Cmd + Shift + A to toggle AI Panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAiOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to command palette events for editor actions
  useEffect(() => {
    const handleTogglePreview = () => {
      setEditorMode(prev => prev === 'preview' ? 'edit' : 'preview');
    };
    const handleToggleAi = () => {
      setIsAiOpen(prev => !prev);
    };
    const handleExportNote = () => {
      handleExportMarkdown();
    };

    window.addEventListener('linknote-toggle-preview', handleTogglePreview);
    window.addEventListener('linknote-toggle-ai', handleToggleAi);
    window.addEventListener('linknote-export-note', handleExportNote);

    return () => {
      window.removeEventListener('linknote-toggle-preview', handleTogglePreview);
      window.removeEventListener('linknote-toggle-ai', handleToggleAi);
      window.removeEventListener('linknote-export-note', handleExportNote);
    };
  }, [decryptedText, note]);

  // AI modification handlers
  const handleReplaceContent = (newContent: string) => {
    setExternalContentUpdate({
      text: newContent,
      mode: 'replace',
      timestamp: Date.now()
    });
    toast('Note content replaced with AI output', 'success');
  };

  const handleInsertAtCursor = (textToInsert: string) => {
    setExternalContentUpdate({
      text: textToInsert,
      mode: 'insert',
      timestamp: Date.now()
    });
    toast('AI output inserted at cursor position', 'success');
  };

  const handleAppendContent = (textToAppend: string) => {
    setExternalContentUpdate({
      text: textToAppend,
      mode: 'append',
      timestamp: Date.now()
    });
    toast('AI output appended to note', 'success');
  };

  const handleSaveAsNewNote = async (title: string, content: string, tags?: string[]) => {
    try {
      const created = await noteStorage.createNote({
        title: title || 'AI Generated Note',
        content,
        tags: tags || []
      });
      toast(`Saved as new note: "${created.title}"`, 'success');
      navigate(`/note/${created.id}`);
    } catch (err) {
      toast('Failed to save as new note', 'error');
    }
  };

  const handleApplyTitleAndTags = async (title?: string, tags?: string[]) => {
    const updates: Partial<Note> = {};
    if (title !== undefined) updates.title = title;
    if (tags !== undefined) updates.tags = tags;
    await handleNoteChange(updates);
    toast('Title & Tags updated from AI output', 'success');
  };

  // Load note
  const loadNote = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const fetched = await noteStorage.getNote(id);
      if (fetched) {
        setNote(fetched);
        
        // Handle encryption states
        if (fetched.isEncrypted) {
          setIsUnlocked(false);
          setDecryptedText('');
          setActivePassword('');
          setPasswordMode('unlock');
          setIsPasswordModalOpen(true);
        } else {
          setIsUnlocked(true);
          setDecryptedText(fetched.content || '');
          setActivePassword('');
          setIsPasswordModalOpen(false);
        }
      } else {
        setNote(null);
      }
    } catch (err) {
      toast('Failed to load note', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  // Dynamically analyze bi-directional wiki-connections inside notes
  useEffect(() => {
    async function loadLinks() {
      if (!note) return;
      try {
        const bl = await noteStorage.getBacklinks(note.title);
        setBacklinks(bl);

        const ol = extractWikiLinks(decryptedText);
        setOutgoingLinks(ol);
      } catch (err) {
        console.error('Failed to calculate wiki-link networks', err);
      }
    }
    loadLinks();
  }, [note?.title, decryptedText]);

  // Handle unlocks
  const handleUnlockSubmit = async (password: string) => {
    if (!note || !note.encryptedContent || !note.salt || !note.iv) return;

    try {
      const plaintext = await encryptionService.decrypt(
        note.encryptedContent,
        password,
        note.salt,
        note.iv
      );
      setDecryptedText(plaintext);
      setActivePassword(password);
      setIsUnlocked(true);
      setIsPasswordModalOpen(false);
      toast('Note unlocked successfully!', 'success');
    } catch (err: any) {
      throw new Error('Incorrect password. Please try again.');
    }
  };

  // Handle locking a normal note
  const handleLockSubmit = async (password: string) => {
    if (!note) return;

    try {
      setSaveStatus('saving');
      const plainContent = decryptedText;
      
      const encrypted = await encryptionService.encrypt(plainContent, password);
      
      const updated = await noteStorage.updateNote(note.id, {
        isEncrypted: true,
        content: '', // wipe plain content from DB
        encryptedContent: encrypted.ciphertext,
        salt: encrypted.salt,
        iv: encrypted.iv,
      });

      setNote(updated);
      setActivePassword(password);
      setIsUnlocked(true);
      setIsPasswordModalOpen(false);
      setSaveStatus('saved');
      toast('Note encrypted and locked successfully!', 'success');
    } catch (err) {
      setSaveStatus('error');
      toast('Failed to lock note', 'error');
    }
  };

  // Handle permanent unlocking (removing password)
  const handleRemoveLockSubmit = async (password: string) => {
    if (!note || !note.encryptedContent || !note.salt || !note.iv) return;

    try {
      // First verify password
      const plaintext = await encryptionService.decrypt(
        note.encryptedContent,
        password,
        note.salt,
        note.iv
      );

      setSaveStatus('saving');
      const updated = await noteStorage.updateNote(note.id, {
        isEncrypted: false,
        content: plaintext,
        encryptedContent: undefined,
        salt: undefined,
        iv: undefined,
      });

      setNote(updated);
      setDecryptedText(plaintext);
      setActivePassword('');
      setIsUnlocked(true);
      setIsPasswordModalOpen(false);
      setSaveStatus('saved');
      toast('Password protection removed permanently', 'success');
    } catch (err) {
      throw new Error('Incorrect password. Failed to remove protection.');
    }
  };

  // Handles overall notes changes (Auto-save trigger)
  const handleNoteChange = async (updates: Partial<Note>) => {
    if (!note) return;

    setSaveStatus('saving');
    try {
      let finalUpdates: Partial<Note> = { ...updates };

      // If updates contain content, save to intermediate state
      if (updates.content !== undefined) {
        setDecryptedText(updates.content);
      }

      // If note is currently encrypted, content must be saved in ciphertext format
      if (note.isEncrypted) {
        const plainContent = updates.content !== undefined ? updates.content : decryptedText;
        
        // Re-encrypt plain content
        const encrypted = await encryptionService.encrypt(plainContent, activePassword);
        finalUpdates = {
          ...finalUpdates,
          content: '', // NEVER store plain text inside the plain content column for encrypted notes
          encryptedContent: encrypted.ciphertext,
          salt: encrypted.salt,
          iv: encrypted.iv,
        };
      }

      const updated = await noteStorage.updateNote(note.id, finalUpdates);
      setNote(updated);
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
      toast('Auto-save failed', 'error');
    }
  };

  // Mutator actions
  const handleLockToggleClick = () => {
    if (note?.isEncrypted) {
      setPasswordMode('remove');
    } else {
      setPasswordMode('lock');
    }
    setIsPasswordModalOpen(true);
  };

  const handleClearContentConfirm = async () => {
    setIsClearConfirmOpen(false);
    await handleNoteChange({ content: '' });
    toast('Note content cleared', 'success');
  };

  const handleDuplicate = async () => {
    if (!note) return;
    try {
      // If encrypted, the duplicated copy will also be duplicated in encrypted state,
      // which is extremely secure!
      const copy = await noteStorage.duplicateNote(note.id);
      toast(`Duplicated as "${copy.title}"`, 'success');
      navigate(`/note/${copy.id}`);
    } catch (err) {
      toast('Failed to duplicate note', 'error');
    }
  };

  const handleToggleCode = async () => {
    if (!note) return;
    await handleNoteChange({ isCode: !note.isCode });
    toast(note.isCode ? 'Disabled code layout' : 'Enabled code layout', 'success');
  };

  const handleCodeLanguageChange = async (lang: string) => {
    await handleNoteChange({ codeLanguage: lang });
  };

  const onCreateNewNote = async () => {
    try {
      const created = await noteStorage.createNote();
      toast('Created new note!', 'success');
      navigate(`/note/${created.id}`);
    } catch (err) {
      toast('Failed to create note', 'error');
    }
  };

  // EXPORTS
  const handleExportTxt = () => {
    if (!note) return;
    try {
      const blob = new Blob([decryptedText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.title || 'untitled'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast('Plain text document downloaded', 'success');
    } catch (err) {
      toast('Failed to download document', 'error');
    }
  };

  const handleExportMarkdown = () => {
    if (!note) return;
    try {
      // Prefix standard markdown frontmatter or title if wanted, or just clean content
      const blob = new Blob([decryptedText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.title || 'untitled'}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast('Markdown document downloaded', 'success');
    } catch (err) {
      toast('Failed to download document', 'error');
    }
  };

  const handleExportHtml = () => {
    if (!note) return;
    try {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${note.title || 'Untitled Note'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      background-color: #f8fafc;
    }
    h1 {
      font-size: 2.25rem;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
      margin-bottom: 2rem;
    }
    pre {
      background-color: #1e293b;
      color: #f8fafc;
      padding: 1rem;
      border-radius: 0.5rem;
      overflow-x: auto;
    }
    code {
      font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 0.875rem;
      background-color: #f1f5f9;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
    }
    pre code {
      background-color: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #6366f1;
      padding-left: 1rem;
      color: #64748b;
      font-style: italic;
      margin: 1.5rem 0;
    }
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #0f172a;
        color: #cbd5e1;
      }
      h1 {
        color: #f8fafc;
        border-bottom-color: #1e293b;
      }
      code {
        background-color: #1e293b;
        color: #f8fafc;
      }
    }
  </style>
</head>
<body>
  <h1>${note.title || 'Untitled Note'}</h1>
  <div>${decryptedText.replace(/\n/g, '<br>')}</div>
</body>
</html>
      `;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.title || 'untitled'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast('HTML document downloaded', 'success');
    } catch (err) {
      toast('Failed to export HTML', 'error');
    }
  };

  const handleExportDoc = () => {
    if (!note) return;
    try {
      const docContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><title>${note.title}</title>
<style>
  body { font-family: Arial, sans-serif; line-height: 1.5; }
  h1 { font-size: 24pt; border-bottom: 1px solid #ccc; padding-bottom: 6pt; }
</style>
</head>
<body>
<h1>${note.title}</h1>
<p>${decryptedText.replace(/\n/g, '<br>')}</p>
</body>
</html>
      `;
      const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${note.title || 'untitled'}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast('Word Document downloaded', 'success');
    } catch (err) {
      toast('Failed to export Word Document', 'error');
    }
  };

  const handlePresent = () => {
    if (!note) return;
    navigate(`/present/${note.id}`);
  };

  // IMPORTS
  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      await handleNoteChange({
        title: note?.title === 'Untitled Note' ? originalName : note?.title,
        content,
      });
      toast(`Successfully imported file "${file.name}"!`, 'success');
    };
    reader.onerror = () => {
      toast('Failed to read content file', 'error');
    };
    reader.readAsText(file);
  };

  // LINK COPIES
  const handleCopyLocalLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      toast('Local note URL copied to clipboard!', 'success');
    } catch (err) {
      toast('Failed to copy URL', 'error');
    }
  };

  const handleGenerateShareLink = () => {
    if (!note) return;
    try {
      // Build a full offline-safe copy note for snapshot compiling
      const snapshotNote: Note = {
        ...note,
        content: decryptedText, // must pass decrypted content to shared link
      };

      const shareUrl = shareService.createShareLink(snapshotNote);
      setGeneratedShareUrl(shareUrl);
      setIsShareModalOpen(true);

      // Auto copy
      navigator.clipboard.writeText(shareUrl);
      toast('Shareable snapshot URL copied to clipboard!', 'success');
    } catch (err: any) {
      toast('Failed to compress note content', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Render Note page
  if (loading) {
    return (
      <AppLayout>
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Opening workspace notes...</span>
        </div>
      </AppLayout>
    );
  }

  if (!note) {
    return (
      <AppLayout>
        <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Note Not Found</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6">
            The note workspace ID is missing or might have been deleted from local storage on this browser.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 cursor-pointer"
          >
            Go Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        
        {/* Editor Toolbar deck */}
        {!isFocusMode && (
          <EditorToolbar
            note={note}
            saveStatus={saveStatus}
            editorMode={editorMode}
            setEditorMode={setEditorMode}
            isFocusMode={isFocusMode}
            setIsFocusMode={setIsFocusMode}
            onLockToggle={handleLockToggleClick}
            onClearContent={() => setIsClearConfirmOpen(true)}
            onDuplicate={handleDuplicate}
            onToggleCode={handleToggleCode}
            onCodeLanguageChange={handleCodeLanguageChange}
            onExportMarkdown={handleExportMarkdown}
            onExportTxt={handleExportTxt}
            onExportHtml={handleExportHtml}
            onExportDoc={handleExportDoc}
            onImportFile={handleImportFile}
            onCopyLocalLink={handleCopyLocalLink}
            onGenerateShareLink={handleGenerateShareLink}
            onPrint={handlePrint}
            onPresent={handlePresent}
            onCreateNewNote={onCreateNewNote}
            isAiOpen={isAiOpen}
            setIsAiOpen={setIsAiOpen}
            isHistoryOpen={isHistoryOpen}
            onToggleHistory={() => setIsHistoryOpen(prev => !prev)}
          />
        )}

        {/* Locked Overlay Card - displayed if note is locked and not unlocked in session */}
        {!isUnlocked ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center flex flex-col items-center">
              <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full mb-4">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display">
                This Note is Encrypted
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6 leading-relaxed">
                This note content was encrypted locally with AES-GCM (256-bit). Enter the PBKDF2 password signature to decrypt and write.
              </p>
              <button
                onClick={() => {
                  setPasswordMode('unlock');
                  setIsPasswordModalOpen(true);
                }}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Decrypt & Open
              </button>
            </div>
          </div>
        ) : (
          /* Editor workspace panel with responsive side-panel layout */
          <div className="flex-1 flex flex-col md:flex-row min-h-0 relative gap-4 overflow-hidden">
            {/* If Focus Mode is active, floating exit focus button is visible */}
            {isFocusMode && (
              <button
                onClick={() => setIsFocusMode(false)}
                className="absolute top-4 right-4 z-10 px-3.5 py-2 bg-zinc-900/90 dark:bg-zinc-100/90 backdrop-blur-md text-white dark:text-zinc-950 text-xs font-semibold rounded-xl hover:scale-105 transition-transform flex items-center gap-1 shadow-md cursor-pointer select-none"
              >
                <X className="h-3.5 w-3.5" />
                Exit Focus
              </button>
            )}

            <div className="flex-1 flex flex-col min-h-0 relative">
              <NoteEditor
                note={note}
                onNoteChange={handleNoteChange}
                editorMode={editorMode}
                isFocusMode={isFocusMode}
                onSelectionChange={setSelectedText}
                externalContentUpdate={externalContentUpdate}
              />

              {/* Backlinks & Outgoing connections panel (only visible if not in Focus Mode) */}
              {!isFocusMode && (
                <div id="wiki-connections-panel" className="mt-4 shrink-0 bg-white/60 dark:bg-slate-900/30 border border-slate-200/50 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-xs select-none">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
                      Wiki-Connection Network
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Backlinks */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                        {t('backlinks')} ({backlinks.length})
                      </span>
                      {backlinks.length === 0 ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500 block italic">No incoming backlinks</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {backlinks.map(bl => (
                            <button
                              id={`backlink-note-${bl.id}`}
                              key={bl.id}
                              onClick={() => navigate(`/note/${bl.id}`)}
                              className="text-xs font-semibold px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 rounded-lg cursor-pointer transition-colors"
                            >
                              {bl.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Outgoing Links */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                        {t('outgoingLinks')} ({outgoingLinks.length})
                      </span>
                      {outgoingLinks.length === 0 ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500 block italic">No outgoing wiki-links parsed</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {outgoingLinks.map((title, idx) => (
                            <button
                              id={`outgoing-link-${idx}`}
                              key={idx}
                              onClick={() => navigate(`/note-title/${encodeURIComponent(title)}`)}
                              className="text-xs font-semibold px-2.5 py-1 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 rounded-lg cursor-pointer transition-colors"
                            >
                              [[{title}]]
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isHistoryOpen && (
              <div className="w-full md:w-[320px] shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col h-[400px] md:h-full">
                <VersionHistoryPanel
                  noteId={note.id}
                  onRestoreComplete={loadNote}
                  onClose={() => setIsHistoryOpen(false)}
                />
              </div>
            )}

            {isAiOpen && (
              <React.Suspense fallback={
                <div className="w-full md:w-[380px] shrink-0 border-l border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/10 backdrop-blur-md flex flex-col h-full items-center justify-center gap-2">
                  <div className="h-6 w-6 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">Loading AI Copilot...</span>
                </div>
              }>
                <AIAssistantPanel
                  isOpen={isAiOpen}
                  onClose={() => setIsAiOpen(false)}
                  noteContent={decryptedText}
                  selectedText={selectedText}
                  onReplaceContent={handleReplaceContent}
                  onInsertAtCursor={handleInsertAtCursor}
                  onAppendContent={handleAppendContent}
                  onSaveAsNewNote={handleSaveAsNewNote}
                  onApplyTitleAndTags={handleApplyTitleAndTags}
                />
              </React.Suspense>
            )}
          </div>
        )}

        {/* Clear Content dialog confirmation */}
        <ConfirmDialog
          isOpen={isClearConfirmOpen}
          title="Clear Note Workspace"
          message="Are you sure you want to clear all written content inside this note? The note title and tags will be retained, but your workspace text will be completely emptied. This operation is auto-saved."
          confirmText="Yes, Clear Content"
          cancelText="Cancel"
          onConfirm={handleClearContentConfirm}
          onCancel={() => setIsClearConfirmOpen(false)}
        />

        {/* Security Password prompt lock modaling */}
        <PasswordModal
          isOpen={isPasswordModalOpen}
          mode={passwordMode}
          onClose={() => {
            // If they are trying to unlock but close, we push them back to dashboard
            if (passwordMode === 'unlock') {
              navigate('/');
            } else {
              setIsPasswordModalOpen(false);
            }
          }}
          onSubmit={async (pw) => {
            if (passwordMode === 'unlock') {
              await handleUnlockSubmit(pw);
            } else if (passwordMode === 'lock') {
              await handleLockSubmit(pw);
            } else if (passwordMode === 'remove') {
              await handleRemoveLockSubmit(pw);
            }
          }}
        />

        {/* Share Snapshot QR modal */}
        <QRShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          shareUrl={generatedShareUrl}
          note={note}
          onExportMarkdown={handleExportMarkdown}
          onExportTxt={handleExportTxt}
        />
      </div>
    </AppLayout>
  );
}
