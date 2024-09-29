declare module '@nhost/nhost-js' {
  export class NhostClient {
    constructor(config: { subdomain: string; region: string });
    auth: {
      isAuthenticatedAsync(): Promise<boolean>;
      signOut(): Promise<void>;
      signIn(options: { provider: string }): Promise<{
        session: any;
        error: Error | null;
      }>;
      onAuthStateChanged(callback: (event: 'SIGNED_IN' | 'SIGNED_OUT', session: any) => void): () => void;
      getUser(): Promise<any>; // Add this line
    };
  }
}