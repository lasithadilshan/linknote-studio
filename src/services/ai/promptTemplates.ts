/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PromptTemplate } from './aiTypes';

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // 1. Summarize
  {
    id: 'summarize',
    name: 'Short Summary',
    description: 'Create a concise paragraph summary of the note contents.',
    icon: 'AlignLeft',
    category: 'summary',
    prompt: 'Please provide a concise and clear single-paragraph summary of the following note content, highlighting the main themes and key takeaways:\n\n'
  },
  {
    id: 'bullet_summary',
    name: 'Bullet Point Summary',
    description: 'Extract key points into a neat bulleted list.',
    icon: 'ListChecks',
    category: 'summary',
    prompt: 'Please review the following note and extract the most important points into a clean, concise bulleted list:\n\n'
  },
  {
    id: 'study_notes',
    name: 'Study Notes',
    description: 'Structure notes into organized, academic study study material.',
    icon: 'GraduationCap',
    category: 'summary',
    prompt: 'Please synthesize the following content into clean, structured study notes. Use headings, clear explanations of key concepts, bold terms, and a short summary of takeaways:\n\n'
  },

  // 2. Improve writing
  {
    id: 'fix_grammar',
    name: 'Fix Grammar & Spelling',
    description: 'Polishes wording, spelling, punctuation, and structural flow.',
    icon: 'CheckCheck',
    category: 'edit',
    prompt: 'Please proofread the following note. Fix any spelling, punctuation, and grammatical mistakes while preserving the original structure, voice, and meaning as closely as possible:\n\n'
  },
  {
    id: 'rewrite_professional',
    name: 'Rewrite Professionally',
    description: 'Convert tone into formal, articulate business-ready language.',
    icon: 'Briefcase',
    category: 'edit',
    prompt: 'Please rewrite the following note in a professional, formal, and articulate business tone, suitable for workplace communications, presentations, or official records:\n\n'
  },
  {
    id: 'rewrite_casual',
    name: 'Rewrite Casually',
    description: 'Relax the language into friendly, conversational style.',
    icon: 'Smile',
    category: 'edit',
    prompt: 'Please rewrite the following note in a casual, conversational, and warm tone. Keep the original ideas intact but make the language friendly, relaxed, and highly approachable:\n\n'
  },
  {
    id: 'make_shorter',
    name: 'Make Shorter',
    description: 'Condense content to be brief and to-the-point.',
    icon: 'Minimize2',
    category: 'edit',
    prompt: 'Please condense the following note. Make it brief, high-impact, and directly to-the-point by trimming redundant explanations or extra words, while retaining the essential core message:\n\n'
  },
  {
    id: 'make_detailed',
    name: 'Make More Detailed',
    description: 'Expand notes with extra depth, examples, and clarity.',
    icon: 'Maximize2',
    category: 'edit',
    prompt: 'Please expand on the following note. Elaborate on the concepts, add logical structure, flesh out any brief statements, and provide supportive detail or examples to make it thorough and comprehensive:\n\n'
  },
  {
    id: 'improve_clarity',
    name: 'Improve Clarity',
    description: 'Rewrite to make the points crystal clear and easy to understand.',
    icon: 'Sparkles',
    category: 'edit',
    prompt: 'Please rewrite the following note to maximize clarity, logical flow, and readability. Ensure explanations are simple, articulate, and highly cohesive:\n\n'
  },

  // 3. Markdown tools
  {
    id: 'convert_markdown',
    name: 'Convert to Markdown',
    description: 'Format contents using elegant Markdown headings, lists, and tables.',
    icon: 'FileText',
    category: 'edit',
    prompt: 'Please take the following text and convert it into beautiful, clean Markdown formatting. Use appropriate headings, bold/italic text, lists, code blocks, or tables to make it structured and highly readable:\n\n'
  },
  {
    id: 'generate_headings',
    name: 'Generate Headings',
    description: 'Insert logical headings throughout the note structure.',
    icon: 'Heading',
    category: 'edit',
    prompt: 'Please analyze the following content and insert appropriate, structured Markdown headings (#, ##, ###) at logical transition points to make the document highly readable and easy to scan:\n\n'
  },
  {
    id: 'generate_toc',
    name: 'Generate Table of Contents',
    description: 'Generate a hierarchical Table of Contents based on topics.',
    icon: 'ListOrdered',
    category: 'edit',
    prompt: 'Please generate an elegant Markdown Table of Contents (TOC) with bullet points and jump-links for the key topics or actual headings found in the following note content:\n\n'
  },
  {
    id: 'format_proj_doc',
    name: 'Format as Project Doc',
    description: 'Restructure the content as professional project documentation.',
    icon: 'FileCode',
    category: 'edit',
    prompt: 'Please format the following content as professional project documentation. Structure it with sections like Overview, Requirements, Implementation, and Next Steps as appropriate:\n\n'
  },
  {
    id: 'format_meeting_notes',
    name: 'Format as Meeting Notes',
    description: 'Structure notes as standard, executive meeting summaries.',
    icon: 'Calendar',
    category: 'edit',
    prompt: 'Please format the following text as clean, structured meeting notes. Organize it with sections for Date/Time, Attendees, Agenda, Key Discussion Points, and Action Items/Decisions:\n\n'
  },

  // 4. Productivity tools
  {
    id: 'action_items',
    name: 'Extract Action Items',
    description: 'Identify actionable tasks, decisions, and follow-ups.',
    icon: 'ClipboardList',
    category: 'summary',
    prompt: 'Please analyze the following note content and extract all action items, tasks, decisions, or follow-up milestones into a clean, actionable task list with checkboxes (- [ ]):\n\n'
  },
  {
    id: 'extract_key_points',
    name: 'Extract Key Points',
    description: 'Summarize core insights and takeaways.',
    icon: 'Lightbulb',
    category: 'summary',
    prompt: 'Please analyze the following content and extract the most valuable insights, core arguments, and critical takeaways as key points:\n\n'
  },
  {
    id: 'create_flashcards',
    name: 'Create Flashcards',
    description: 'Generate front/back flashcards for learning.',
    icon: 'CreditCard',
    category: 'general',
    prompt: 'Please read the following content and generate a set of educational flashcards. Format them clearly with "FRONT:" (for questions/concepts) and "BACK:" (for definitions/answers) for easy study:\n\n'
  },
  {
    id: 'create_quiz',
    name: 'Create Quiz Questions',
    description: 'Build multiple-choice or short-answer quiz questions.',
    icon: 'HelpCircle',
    category: 'general',
    prompt: 'Please analyze the following content and construct a high-quality quiz with 3-5 questions. Include multiple choice options (A, B, C, D) and specify the correct answers with explanations at the bottom:\n\n'
  },
  {
    id: 'create_checklist',
    name: 'Create Checklist',
    description: 'Build a logical sequence checklist from the note details.',
    icon: 'CheckSquare',
    category: 'general',
    prompt: 'Please convert the processes, steps, or details in the following note content into an organized, step-by-step checklist using Markdown checkboxes (- [ ]):\n\n'
  },

  // 5. Translation
  {
    id: 'translate_sinhala',
    name: 'Translate to Sinhala',
    description: 'Translate the entire note content into elegant Sinhala.',
    icon: 'Languages',
    category: 'translate',
    prompt: 'Please translate the following note text into natural, grammatically correct, and elegant Sinhala (සිංහල). Keep any code segments or technical terms in English if appropriate:\n\n'
  },
  {
    id: 'translate_english',
    name: 'Translate to English',
    description: 'Translate the entire note content into natural English.',
    icon: 'Globe',
    category: 'translate',
    prompt: 'Please translate the following note text into clear, fluent, and grammatically correct English. Keep the tone natural and professional:\n\n'
  },
  {
    id: 'translate_simple_english',
    name: 'Translate to Simple English',
    description: 'Translate/simplify into clear, simple English wording.',
    icon: 'FileText',
    category: 'translate',
    prompt: 'Please rewrite or translate the following note content into Simple English. Use basic, clear vocabulary, short sentences, and straightforward grammar suitable for non-native speakers or clear communications:\n\n'
  },

  // 6. Title and tags
  {
    id: 'generate_better_title',
    name: 'Generate Better Title',
    description: 'Generate descriptive and elegant title recommendations.',
    icon: 'Type',
    category: 'general',
    prompt: 'Based on the following note content, generate 3 highly descriptive, professional, and elegant title recommendations. Return ONLY the titles on separate lines, numbered 1, 2, and 3:\n\n'
  },
  {
    id: 'suggest_tags',
    name: 'Suggest Tags',
    description: 'Suggest relevant tags to organize the note.',
    icon: 'Tag',
    category: 'general',
    prompt: 'Please analyze the following note content and suggest 5-8 relevant, short tags for categorization. Output them ONLY as a comma-separated list of words (e.g. study, project, idea):\n\n'
  },

  // 7. Code tools
  {
    id: 'explain_code',
    name: 'Explain Code',
    description: 'Step-by-step breakdown of scripts, algorithms, or snippets.',
    icon: 'Code2',
    category: 'code',
    prompt: 'Please analyze the following code snippet or note. Provide a clear, step-by-step explanation of what it does, how it works, and point out any potential performance/security issues or improvements:\n\n'
  },
  {
    id: 'add_code_comments',
    name: 'Add Comments to Code',
    description: 'Insert comprehensive, helpful explanatory comments inside the code.',
    icon: 'MessageSquare',
    category: 'code',
    prompt: 'Please review the following code and add detailed, helpful, and standard explanatory comments inline. Do not change the logic of the code; only add comments to clarify what each part does:\n\n'
  },
  {
    id: 'detect_code_bugs',
    name: 'Detect Possible Bugs',
    description: 'Analyze potential bugs, errors, and memory or security flaws.',
    icon: 'Bug',
    category: 'code',
    prompt: 'Please review the following code for potential bugs, logical errors, edge cases, performance issues, or security vulnerabilities. Outline the issues found and suggest precise fixes:\n\n'
  },
  {
    id: 'format_code_doc',
    name: 'Format Code as Doc',
    description: 'Generate professional API or code documentation.',
    icon: 'BookOpen',
    category: 'code',
    prompt: 'Please analyze the following code and format it as professional API or technical reference documentation. Describe modules, functions, parameters, types, and return values clearly:\n\n'
  },
  {
    id: 'generate_readme',
    name: 'Generate README from Code',
    description: 'Generate a high-quality Markdown README section describing the code.',
    icon: 'BookOpen',
    category: 'code',
    prompt: 'Please analyze the following code or note content and write a high-quality, comprehensive README file section. Include a title, brief description, features, installation, usage example, and any code snippets inside formatting code blocks:\n\n'
  }
];

export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(t => t.id === id);
}
