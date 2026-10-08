export const CONFIG = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL || 'https://quartzitemanagementsystem.vercel.app',
  SUPABASE_URL:
    process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://admhfsnaxcjujtrdusij.supabase.co',
  SUPABASE_ANON_KEY:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_4sX56DyttaAl3Vs82dK5eg_wKNfJD5o',
  APP_NAME: 'Quartzite Management System',
  APP_SCHEME: 'qms',
  APP_VERSION: '1.0.0',
};
