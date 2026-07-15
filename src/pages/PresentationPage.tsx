/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { noteStorage } from '../services/noteStorage';
import { shareService } from '../services/shareService';
import { Note } from '../types';
import { useToast } from '../hooks/useToast';
import { useTranslation } from '../i18n/i18n';
import QRCode from 'qrcode';
import ReactMarkdown from 'react-markdown';
import { 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon, 
  QrCode, 
  Copy, 
  X, 
  Maximize, 
  Minimize,
  ArrowLeft
} from 'lucide-react';

export function PresentationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [note, setNote] = useState<Note | null>(null);
  const [fontSize, setFontSize] = useState<number>(24); // default large font size (in pixels)
  const [isDark, setIsDark] = useState<boolean>(true); // default dark for presentation comfort
  const [showQR, setShowQR] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Note
  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await noteStorage.getNote(id);
        if (data) {
          setNote(data);
          // Generate QR Code URL from share link
          const shareUrl = shareService.createShareLink(data);
          QRCode.toDataURL(
            shareUrl,
            {
              width: 250,
              margin: 2,
              color: {
                dark: '#0f172a',
                light: '#ffffff',
              },
            },
            (err, url) => {
              if (!err) setQrCodeUrl(url);
            }
          );
        } else {
          toast('Note not found', 'error');
          navigate('/');
        }
      } catch (err) {
        toast('Failed to load note', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate, toast]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        setFontSize(prev => Math.min(prev + 2, 64));
        toast('Font size increased', 'info');
      } else if (e.key === '-') {
        setFontSize(prev => Math.max(prev - 2, 14));
        toast('Font size decreased', 'info');
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'q') {
        setShowQR(prev => !prev);
      } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          handleExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [note]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleCopyShareLink = () => {
    if (!note) return;
    const shareUrl = shareService.createShareLink(note);
    navigator.clipboard.writeText(shareUrl);
    toast('Snapshot link copied!', 'success');
  };

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    if (note) {
      navigate(`/note/${note.id}`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs uppercase font-bold tracking-widest text-slate-500">
          Entering Presentation Workspace...
        </span>
      </div>
    );
  }

  if (!note) return null;

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-200 select-text ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Floating Toolbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-white/10 dark:bg-slate-900/40 border border-slate-200/20 dark:border-white/5 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl transition-opacity duration-300 hover:opacity-100 opacity-90">
        <button
          onClick={() => setFontSize(prev => Math.max(prev - 2, 14))}
          title="Decrease Font Size (-)"
          className="p-2 hover:bg-slate-500/10 rounded-xl cursor-pointer transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400">
          {fontSize}px
        </span>
        <button
          onClick={() => setFontSize(prev => Math.min(prev + 2, 64))}
          title="Increase Font Size (+)"
          className="p-2 hover:bg-slate-500/10 rounded-xl cursor-pointer transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-slate-500/20" />

        <button
          onClick={() => setIsDark(!isDark)}
          title="Toggle Background (T)"
          className="p-2 hover:bg-slate-500/10 rounded-xl cursor-pointer transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={() => setShowQR(!showQR)}
          title="Toggle Share QR Code (Q)"
          className={`p-2 rounded-xl cursor-pointer transition-colors ${
            showQR ? 'bg-indigo-600/20 text-indigo-400' : 'hover:bg-slate-500/10'
          }`}
        >
          <QrCode className="h-4 w-4" />
        </button>

        <button
          onClick={handleCopyShareLink}
          title="Copy Snapshot Link"
          className="p-2 hover:bg-slate-500/10 rounded-xl cursor-pointer transition-colors"
        >
          <Copy className="h-4 w-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen (F)"
          className="p-2 hover:bg-slate-500/10 rounded-xl cursor-pointer transition-colors"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </button>

        <div className="w-px h-5 bg-slate-500/20" />

        <button
          onClick={handleExit}
          title="Exit Presentation Mode (Esc)"
          className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
        >
          Exit
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-start py-24 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto w-full">
        {/* Title */}
        <h1 
          className="w-full font-extrabold tracking-tight font-display mb-12 border-b border-slate-500/10 pb-6 text-center leading-tight"
          style={{ fontSize: `${fontSize * 1.5}px` }}
        >
          {note.title}
        </h1>

        {/* Markdown Render */}
        <div 
          className="w-full prose dark:prose-invert max-w-none break-words leading-relaxed select-text"
          style={{ fontSize: `${fontSize}px` }}
        >
          <ReactMarkdown>{note.content || '*No content available*'}</ReactMarkdown>
        </div>
      </div>

      {/* Overlay QR Code Card */}
      {showQR && qrCodeUrl && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-4 rounded-2xl shadow-2xl flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-slate-100 dark:border-white/5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Scan to view
            </span>
            <button
              onClick={() => setShowQR(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="p-2 bg-white rounded-xl">
            <img src={qrCodeUrl} alt="Presentation share Link QR" className="w-40 h-40" />
          </div>
          <span className="mt-2 text-[9px] text-slate-500 font-medium">
            LinkNote Snapshot QR
          </span>
        </div>
      )}
    </div>
  );
}
