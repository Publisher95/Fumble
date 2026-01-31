import { UserProfile } from '../types/user';
import usersData from '../data/users.json';

const users: UserProfile[] = usersData as UserProfile[];

export function getUserByAccessCode(code: string): UserProfile | null {
  const user = users.find(u => u.accessCode === code);
  return user || null;
}

export function getUserById(id: number): UserProfile | null {
  const user = users.find(u => u.id === id);
  return user || null;
}

export function getAllUsersExcept(id: number): UserProfile[] {
  return users.filter(u => u.id !== id);
}
