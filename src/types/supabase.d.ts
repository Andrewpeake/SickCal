// Temporary type declarations for Supabase
declare module '@supabase/supabase-js' {
  export interface User {
    id: string;
    email?: string;
    [key: string]: any;
  }

  export interface Session {
    access_token: string;
    refresh_token: string;
    user: User;
    [key: string]: any;
  }

  export interface AuthResponse {
    data: {
      user: User | null;
      session: Session | null;
    };
    error: any;
  }

  export interface AuthStateChangeEvent {
    event: string;
    session: Session | null;
  }

  export interface SupabaseClient {
    auth: {
      signUp: (credentials: { email: string; password: string; options?: any }) => Promise<AuthResponse>;
      signInWithPassword: (credentials: { email: string; password: string }) => Promise<AuthResponse>;
      signOut: () => Promise<{ error: any }>;
      getSession: () => Promise<{ data: { session: Session | null }; error: any }>;
      getUser: () => Promise<{ data: { user: User | null }; error: any }>;
      onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        data: { subscription: { unsubscribe: () => void } };
      };
      resetPasswordForEmail: (email: string, options?: any) => Promise<{ data: any; error: any }>;
      updateUser: (updates: { password?: string }) => Promise<{ data: any; error: any }>;
    };
    from: (table: string) => any;
  }

  export function createClient(url: string, key: string, options?: any): SupabaseClient;
}

