interface Env {
  apiUrl: string;
  clientEnv: 'development' | 'production' | 'staging'; // optional
  recaptchaSiteKey: string;
}

const env: Env = {
  apiUrl: import.meta.env.VITE_API_BASE_URL,
  clientEnv: import.meta.env.VITE_CLIENT_ENV,
  recaptchaSiteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
};

export default env;
