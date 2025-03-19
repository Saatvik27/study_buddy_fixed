
// Modified supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { getAuth} from 'firebase/auth';

const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
    accessToken: async () => {
        return await getAuth().currentUser?.getIdToken(/* forceRefresh */ false) ?? null;
    },
});
