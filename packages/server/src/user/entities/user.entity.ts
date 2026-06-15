export class User {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Date;
}
