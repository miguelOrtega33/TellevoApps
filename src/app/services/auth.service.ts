import { Injectable } from '@angular/core';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
}

interface UserSession {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usersKey = 'tellevo.users';
  private readonly sessionKey = 'tellevo.session';

  get isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  get currentUser(): UserSession | null {
    const rawSession = localStorage.getItem(this.sessionKey);
    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as UserSession;
    } catch {
      this.logout();
      return null;
    }
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    const users = this.readUsers();

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error('Ya existe una cuenta con este correo electrónico.');
    }

    const salt = this.createSalt();
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      salt,
      passwordHash: await this.hashPassword(password, salt),
    };

    localStorage.setItem(this.usersKey, JSON.stringify([...users, profile]));
  }

  async login(email: string, password: string): Promise<boolean> {
    const user = this.readUsers().find((item) => item.email === this.normalizeEmail(email));
    if (!user || user.passwordHash !== await this.hashPassword(password, user.salt)) {
      return false;
    }

    this.saveSession(user);
    return true;
  }

  async resetPassword(email: string, password: string): Promise<boolean> {
    const normalizedEmail = this.normalizeEmail(email);
    const users = this.readUsers();
    const userIndex = users.findIndex((item) => item.email === normalizedEmail);

    if (userIndex === -1) {
      return false;
    }

    const salt = this.createSalt();
    users[userIndex] = {
      ...users[userIndex],
      salt,
      passwordHash: await this.hashPassword(password, salt),
    };
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return true;
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }

  private readUsers(): UserProfile[] {
    const rawUsers = localStorage.getItem(this.usersKey);
    if (!rawUsers) {
      return [];
    }

    try {
      return JSON.parse(rawUsers) as UserProfile[];
    } catch {
      localStorage.removeItem(this.usersKey);
      return [];
    }
  }

  private saveSession(user: UserProfile): void {
    const session: UserSession = { id: user.id, name: user.name, email: user.email };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private createSalt(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const encoded = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
