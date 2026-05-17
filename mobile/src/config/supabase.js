import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://qrwmzwoejenrvyygugaq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyd216d29lamVucnZ5eWd1Z2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTkzMzksImV4cCI6MjA5NDU3NTMzOX0.AVdX9omWpiITnIB1m_4bvFx-VAcIyEyoo_II2AnTNaw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
