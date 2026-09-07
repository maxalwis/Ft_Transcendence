declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      username: string;
      provider: string | null;
      avatar: string | null;
    }
  }
}

export {};
