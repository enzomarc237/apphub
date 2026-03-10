import type { AIAgent } from '@/types';

export const AI_AGENTS: AIAgent[] = [
  {
    id: 'google_jules',
    name: 'Google Jules',
    description: "Google's AI coding agent that autonomously resolves issues, manages dependencies, and builds projects in a secure cloud environment.",
    supportedLanguages: ['Python', 'JavaScript', 'TypeScript', 'Go', 'Java', 'C++', 'Rust'],
  },
  {
    id: 'cursor_agent',
    name: 'Cursor Agent',
    description: "Cursor's AI-powered agent that understands your codebase context to intelligently set up environments and resolve build issues.",
    supportedLanguages: ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'C#'],
  },
  {
    id: 'codemagic',
    name: 'Codemagic',
    description: "Codemagic's cloud CI/CD platform specialized in mobile and web application builds with automated environment setup.",
    supportedLanguages: ['Dart/Flutter', 'Swift', 'Kotlin', 'React Native', 'JavaScript', 'TypeScript'],
  },
  {
    id: 'github_copilot',
    name: 'GitHub Copilot',
    description: "GitHub Copilot's agentic build system that leverages deep repository understanding for accurate dependency resolution and environment configuration.",
    supportedLanguages: ['JavaScript', 'TypeScript', 'Python', 'Ruby', 'Java', 'Go', 'C#', 'PHP'],
  },
  {
    id: 'amp_remote',
    name: 'AMP Remote',
    description: "AMP's distributed remote execution platform for scalable, parallel builds with intelligent dependency caching and environment management.",
    supportedLanguages: ['C', 'C++', 'Go', 'Rust', 'Java', 'Scala', 'Python'],
  },
];

export const getAgentById = (id: string) => AI_AGENTS.find((a) => a.id === id);
