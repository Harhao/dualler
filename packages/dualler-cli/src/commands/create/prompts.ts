export interface WizardQuestion {
  name: string;
  message: string;
  type: 'select' | 'text';
  choices?: string[];
}

export const TEMPLATE_CHOICES = ['basic', 'todo-list', 'with-store'] as const;

export function createProjectQuestions(): WizardQuestion[] {
  return [
    { name: 'projectName', message: 'Project name:', type: 'text' },
    {
      name: 'template',
      message: 'Choose a template:',
      type: 'select',
      choices: [...TEMPLATE_CHOICES],
    },
  ];
}
