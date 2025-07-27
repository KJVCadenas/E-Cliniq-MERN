interface Env {
  apiUrl: string;
  clientEnv: 'development' | 'production' | 'staging'; // optional
}

const env: Env = {
  apiUrl: import.meta.env.VITE_API_BASE_URL,
  clientEnv: import.meta.env.VITE_CLIENT_ENV,
};

export default env;
