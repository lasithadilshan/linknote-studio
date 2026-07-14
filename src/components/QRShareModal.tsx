/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Download, ExternalLink, AlertTriangle, Check, QrCode, AlertCircle } from 'lucide-react';
import { Note } from '../types';
import { useToast } from '../hooks/useToast';

interface QRShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  note: Note;
  onExportMarkdown: () => void;
  onExportTxt: () => void;
}

export function QRShareModal({
  isOpen,
  onClose,
  shareUrl,
  note,
  onExportMarkdown,
  onExportTxt
}: QRShareModalProps) {
  const { toast } = useToast();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && shareUrl) {
      // Generate QR Code with standard parameters to ensure 100% readability
      QRCode.toDataURL(
        shareUrl,
        {
          width: 320,
          margin: 1.5,
          color: {
            dark: '#0f172a', // Slate 900
            light: '#ffffff', // White backing
          },
        },
        (err, url) => {
          if (err) {
            console.error('QR Code generation failed', err);
            toast('Failed to generate offline QR code', 'error');
          } else {
            setQrCodeDataUrl(url);
          }
        }
      );
    }
  }, [isOpen, shareUrl, toast]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast('Share link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_qr_code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('QR Code PNG downloaded!', 'success');
  };

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isTooLarge = shareUrl.length > 2000;

  return (
    <AnimatePresence>
      <div id="qr-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-xs"
        />

        {/* Content Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-lg w-full overflow-hidden z-10 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Share Snapshot & QR Code
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* QR Code and warnings */}
          <div className="flex flex-col items-center space-y-4">
            {isTooLarge ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 rounded-2xl flex gap-3 text-xs leading-relaxed max-w-sm">
                <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Snapshot payload too large!</span>
                  This note contains {shareUrl.length} characters, which exceeds reliable URL size constraints (2,000 chars). Some browsers may truncate or fail to open this QR link. Use alternative file options below!
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 rounded-2xl flex gap-3 text-xs leading-relaxed max-w-sm">
                <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Link Compact & Valid ({shareUrl.length} chars)</span>
                  This snapshot payload fits safely into a standard QR code matrix. Perfect for offline sharing.
                </div>
              </div>
            )}

            {/* QR Code Graphic Frame (Guaranteed high contrast backing) */}
            {qrCodeDataUrl ? (
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-md">
                <img
                  src={qrCodeDataUrl}
                  alt="Share QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                />
              </div>
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse flex items-center justify-center">
                <span className="text-xs font-bold text-slate-400">Rendering Matrix...</span>
              </div>
            )}
          </div>

          {/* Share Url Input Box */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Shareable URL payload
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-xs rounded-xl focus:outline-hidden font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            {qrCodeDataUrl && (
              <button
                onClick={handleDownloadQR}
                className="flex-1 px-4 py-2.5 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download QR PNG</span>
              </button>
            )}
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-center transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open Share Preview</span>
            </a>
          </div>

          {/* Alternate File Exports */}
          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Alternative Offline Safe Exports
            </span>
            <div className="flex gap-2">
              <button
                onClick={onExportMarkdown}
                className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-indigo-500" />
                <span>Markdown (.md)</span>
              </button>
              <button
                onClick={onExportTxt}
                className="flex-1 px-3 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-emerald-500" />
                <span>Raw Text (.txt)</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
