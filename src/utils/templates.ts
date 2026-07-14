/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NoteTemplate {
  name: string;
  title: string;
  tags: string[];
  folder: string;
  icon: string;
  content: string;
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    name: 'Blank Note',
    title: 'Untitled Note',
    tags: [],
    folder: 'Personal',
    icon: 'File',
    content: ''
  },
  {
    name: 'Meeting Notes',
    title: 'Meeting Notes: [Project Name] - [Date]',
    tags: ['meeting', 'notes', 'work'],
    folder: 'Work',
    icon: 'Users',
    content: `# Meeting Notes: [Topic]

**Date**: \`[Insert Date]\`  
**Time**: \`[Insert Time]\`  
**Attendees**: \`[List of Attendees]\`  

---

## 🎯 Objectives & Agenda
1. [Objective 1]
2. [Objective 2]

## 📝 Key Discussions & Notes
- [Discussion Point A]
- [Discussion Point B]

## ⚡ Action Items
- [ ] @Name - [Task Description] (Due: [Date])
- [ ] @Name - [Task Description] (Due: [Date])

## 📅 Next Steps & Next Meeting
- [Next Step] (Tentative Date: [Date])`
  },
  {
    name: 'Daily Journal',
    title: 'Daily Journal: [Date]',
    tags: ['journal', 'daily', 'personal'],
    folder: 'Personal',
    icon: 'BookOpen',
    content: `# Daily Journal: [Date]

## 🌅 Morning Reflection & Intentions
- **Focus of the Day**: [What is the single most important thing to accomplish?]
- **How I Want to Show Up**: [E.g., Calm, Focused, Energetic]
- **Three Things I Am Grateful For**:
  1. [Gratitude 1]
  2. [Gratitude 2]
  3. [Gratitude 3]

## 📖 Highlights & Notes
- [What happened today? Write freely...]

## 🌌 Evening Gratitude & Reflection
- **Wins of the Day**:
  - [Win 1]
- **Lessons Learned**:
  - [What could have gone better?]`
  },
  {
    name: 'Study Notes',
    title: 'Study Notes: [Topic Name]',
    tags: ['study', 'education', 'notes'],
    folder: 'Study',
    icon: 'GraduationCap',
    content: `# Study Notes: [Topic / Subject]

**Source/Lecture**: \`[Insert Source or Book]\`  
**Date**: \`[Insert Date]\`

---

## 🧠 Core Concept Summary
[Provide a 2-3 sentence high-level overview of the topic.]

## 🔑 Key Vocabulary & Definitions
- **[Term 1]**: [Definition 1]
- **[Term 2]**: [Definition 2]

## 📝 Detailed Breakdowns
### 1. Subtopic A
- [Key concept or rule]
- [Example code, formula, or case study]

### 2. Subtopic B
- [Key concept or rule]

## 💡 Practical Questions & Review
- **Question**: [Ask a self-review question]
- **Answer**: [Hidden or written answer]`
  },
  {
    name: 'Project Plan',
    title: 'Project Plan: [Project Name]',
    tags: ['project', 'planning', 'milestones'],
    folder: 'Projects',
    icon: 'Activity',
    content: `# Project Plan: [Project Title]

**Project Owner**: @[Name]  
**Target Completion Date**: \`[Date]\`  
**Current Status**: 🟢 Planning (Green)

---

## 🧭 Executive Summary
[A quick explanation of what this project accomplishes, who it is for, and why it is being built.]

## 🗺️ Scope & Boundaries
- **In Scope**:
  - [Feature A]
- **Out of Scope**:
  - [Feature B]

## 🗓️ Milestones & Timeline
- [ ] **Milestone 1**: Requirement Spec completed (Due: [Date])
- [ ] **Milestone 2**: Core Engine implementation (Due: [Date])
- [ ] **Milestone 3**: UI design & responsive polish (Due: [Date])

## ⚠️ Potential Risks & Mitigations
- **Risk**: [E.g., Storage limitations] → **Mitigation**: [E.g., Add backup exports]`
  },
  {
    name: 'Bug Report',
    title: 'Bug Report: [Issue Summary]',
    tags: ['bug', 'engineering', 'tracking'],
    folder: 'Projects',
    icon: 'Bug',
    content: `# Bug Report: [Short Description of Issue]

**Severity**: 🔴 Critical / 🟡 Moderate / 🔵 Minor  
**Environment**: Chrome, Mac Ventura, v1.0.0

---

## 📌 Description of Bug
[Provide a clear and concise description of what the bug is.]

## 🔄 Steps to Reproduce
1. Go to '[Page Name]'
2. Click on '[Button Name]'
3. See error '[Error Message]'

## 🎯 Expected Behavior
[What should have happened under normal circumstances.]

## 📸 Screenshots or Console Logs
\`\`\`text
[Paste error logs here]
\`\`\``
  },
  {
    name: 'Client Requirements',
    title: 'Client Requirements: [Client/Company Name]',
    tags: ['client', 'requirements', 'contract'],
    folder: 'Work',
    icon: 'Briefcase',
    content: `# Client Requirements: [Client / Company Name]

**Client Contact**: [Name / Email]  
**Primary Developer**: @[Name]  
**Date Initiated**: \`[Date]\`

---

## 🎯 Client Goals & Objectives
[Briefly outline what the client is trying to solve.]

## 📋 Functional Requirements
- [ ] **FR-01**: User must be able to export backups as JSON files.
- [ ] **FR-02**: Workspace must work fully offline on any desktop/mobile device.

## 🎨 Visual Styling & Branding Assets
- **Color Palettes**: [E.g., Deep Slate, Navy, White]
- **Brand Assets**: [E.g., Link to Figma mockup]

## 📅 Timeline & Deliverables
- [Deliverable 1] (Target: [Date])`
  },
  {
    name: 'SWOT Analysis',
    title: 'SWOT Analysis: [Subject/Strategy]',
    tags: ['swot', 'strategy', 'analysis'],
    folder: 'Ideas',
    icon: 'PieChart',
    content: `# SWOT Analysis: [Strategic Topic/Idea]

**Author**: @[Name]  
**Date**: \`[Date]\`

---

## 📈 Strengths (Internal, Positive)
- [Positive attribute or competitive advantage 1]
- [Positive attribute or competitive advantage 2]

## 📉 Weaknesses (Internal, Negative)
- [Disadvantage or resource gap 1]
- [Disadvantage or resource gap 2]

## 🚀 Opportunities (External, Positive)
- [Unmapped market need or new tech trend 1]
- [Unmapped market need or new tech trend 2]

## ⚠️ Threats (External, Negative)
- [Competitor speed or regulatory shifting risk 1]
- [Competitor speed or regulatory shifting risk 2]`
  },
  {
    name: 'README Template',
    title: 'README: [Repository/Product Name]',
    tags: ['readme', 'docs', 'readme-template'],
    folder: 'Projects',
    icon: 'FileText',
    content: `# [Repository / Application Name]

> [Provide a brief, compelling 1-2 sentence description of what this product/library does.]

## 🚀 Key Features
- **Feature A**: Description of why it is useful
- **Feature B**: Description of why it is useful

## 📦 Installation
\`\`\`bash
npm install my-project-name
\`\`\`

## 🛠️ Usage
\`\`\`typescript
import { myModule } from 'my-project-name';

myModule.initialize();
\`\`\`

## 📄 License
SPDX-License-Identifier: Apache-2.0`
  },
  {
    name: 'Task Checklist',
    title: 'Task Checklist: [Category/Sprint]',
    tags: ['tasks', 'checklist', 'to-do'],
    folder: 'Personal',
    icon: 'CheckSquare',
    content: `# Task Checklist: [Scope]

- [ ] **High Priority**
  - [ ] Task A (Due: [Date])
  - [ ] Task B (Due: [Date])
- [ ] **Medium Priority**
  - [ ] Task C
- [ ] **Low Priority/Nice-to-Have**
  - [ ] Task D`
  }
];
