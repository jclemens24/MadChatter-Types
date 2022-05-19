declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      PORT?: string;
      DATABASE: string;
      DATABASE_PASSWORD: string;
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      GOOGLE_API_KEY: string;
    }
  }
}

export {};
