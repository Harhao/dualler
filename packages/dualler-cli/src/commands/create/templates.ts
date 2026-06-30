export interface TemplateOption {
  name: string;
  description: string;
  value: string;
}

export const TEMPLATES: TemplateOption[] = [
  {
    name: 'basic',
    description: '最简 Hello World',
    value: 'basic',
  },
  {
    name: 'todo-list',
    description: '多页面 + 路由示例',
    value: 'todo-list',
  },
  {
    name: 'with-store',
    description: '带状态管理示例',
    value: 'with-store',
  },
];
