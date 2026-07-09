/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './hooks/useToast';
import { DashboardPage } from './pages/DashboardPage';
import { NotePage } from './pages/NotePage';
import { SharePage } from './pages/SharePage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CommandPalette } from './components/CommandPalette';

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <CommandPalette />
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/note/:id" element={<NotePage />} />
          <Route path="/share" element={<SharePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}
