/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Note } from '../types';
import { generateId } from './idGenerator';
import { noteStorage } from '../services/noteStorage';

export const DEMO_NOTES_KEY = 'linknote-demo-notes-created';

export const demoNotesData = [
  {
    title: 'Welcome to LinkNote Studio 🚀',
    folder: 'Personal',
    tags: ['welcome', 'guide', 'tutorial'],
    content: `# Welcome to LinkNote Studio!

Your ultimate **private, secure, and local-first** workspace.

### Key Highlights
1. **100% Client-Side Encryption**: Notes are secured right inside your browser. No remote database can peek at your content.
2. **Interactive Markdown Support**: Enjoy standard editing, lists, headings, and a real-time responsive split-screen preview.
3. **No Login Required**: Launch the app and write immediately. Zero friction.
4. **Rich Metadata**: Categorize notes using folders/collections, favorites, and tags.

### Quick Shortcuts to Try:
- **Cmd/Ctrl + K**: Open the Command Palette to navigate anywhere instantly.
- **Cmd/Ctrl + S**: Manually snapshot a local version of your note.
- **Cmd/Ctrl + N**: Instantly create a new scratchpad.
- **Cmd/Ctrl + Shift + A**: Summon the optional AI writing assistant!

*Get exploring and start writing!*`
  },
  {
    title: 'Markdown Example Cheat Sheet 📝',
    folder: 'Study',
    tags: ['markdown', 'guide', 'cheatsheet'],
    content: `# Interactive Markdown Cheat Sheet

Here's a quick guide of the rich Markdown styles you can use inside **LinkNote Studio**.

## Text Formatting
You can make text **Bold** with \`**Bold**\`, *Italic* with \`*Italic*\`, and ~~Strikethrough~~ using \`~~Strikethrough~~\`.

## Headers
# Header 1
## Header 2
### Header 3

## Lists
### Bulleted List
- Clean typography and line heights
- Built-in list-spacing
- Dynamic margins

### Numbered List
1. First point
2. Second point
3. Final point

## Code Blocks
Include elegant syntax highlighted boxes:
\`\`\`typescript
interface UserWorkspace {
  name: string;
  isLocalFirst: boolean;
}

const studio: UserWorkspace = {
  name: 'LinkNote Studio',
  isLocalFirst: true
};
\`\`\`

## Blockquotes
> "True digital privacy is not a feature, it is an absolute architecture requirement."

---
*Created dynamically for your local study guide.*`
  },
  {
    title: 'Local-first Privacy Guide 🔒',
    folder: 'Personal',
    tags: ['privacy', 'security', 'indexeddb'],
    content: `# Local-first Privacy: How it Works

**LinkNote Studio** is built on a "local-first" philosophy. Your data is your own, and it never leaves your machine unless you choose to share it.

## Where is my data?
Your notes, folders, custom tags, and complete backup history are stored using **IndexedDB**, a powerful sandbox storage system built directly into your browser.

## The Encryption Layer
When you choose to lock/encrypt a note:
1. You provide a personal secret password.
2. The browser generates a cryptographic key using PBKDF2 with salt.
3. Your note content is encrypted locally using **AES-GCM (256-bit)** before writing to the database.
4. *We never know your password, and there is no "Forgot Password" option, so keep it safe!*

## Safety & Backup Guidelines
- **No Remote Servers**: Clearing browser cache/cookies or using guest windows may erase local storage.
- **Recommendation**: Go to settings and click **Download Backup** regularly.
- **Portability**: Your JSON backup file can be imported into LinkNote Studio on any browser or device.`
  },
  {
    title: 'AI Assistant Integration Guide ✨',
    folder: 'Ideas',
    tags: ['ai', 'tutorial', 'prompting'],
    content: `# Getting Started with the AI Assistant

LinkNote Studio features a completely server-side **Gemini API** integration to enrich your notes while protecting your API keys.

## Features
- **Summarization**: Convert long lecture notes, requirements, or transcripts into elegant bullet points.
- **Improve Writing**: Fix grammar, adjust tone (professional, casual, creative), or expand brief bullets.
- **Translation**: Translate note snapshots instantly.

## Setup Requirements
1. Click the ✨ icon or press \`Cmd/Ctrl + Shift + A\` to open the AI Panel.
2. Provide your own **Gemini API Key** in Settings.
3. Your key is stored locally in the secure environment and never sent to third-parties.

*No subscription is required to run LinkNote Studio's assistant.*`
  },
  {
    title: 'Backup & Restore Guidelines 💾',
    folder: 'Projects',
    tags: ['backup', 'guide', 'import'],
    content: `# The Golden Rules of Local Backup

Because LinkNote Studio values absolute privacy, we do not host a cloud database. This means **you** control your data's lifecycle. Follow these golden rules of safety:

## 1. Export Backups Regularly
If you have written important meeting notes, journals, or coursework:
- Export a portable **LinkNote Backup JSON** file.
- Keep it in a safe folder on your desktop, iCloud, Google Drive, or external drive.

## 2. Smart Import & Duplicate Management
Our advanced backup system includes intelligent imports:
- **Stats Preview**: View how many notes and version histories are in a file before merging.
- **De-duplication**: LinkNote automatically warns you if notes match existing ones.
- **Safety Renaming**: Choose to skip duplicates entirely, or import them as renamed copies to safeguard against overriding.

*Protect your digital workspace — keep backups!*`
  }
];

export async function createDemoNotes(): Promise<void> {
  const alreadyCreated = localStorage.getItem(DEMO_NOTES_KEY);
  if (alreadyCreated) return;

  for (const demo of demoNotesData) {
    await noteStorage.createNote({
      title: demo.title,
      folder: demo.folder,
      tags: demo.tags,
      content: demo.content,
      isFavorite: demo.title.includes('Welcome'),
    });
  }

  localStorage.setItem(DEMO_NOTES_KEY, 'true');
}
