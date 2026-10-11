import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;

const urlValida = supabaseUrl && !/your-project|placeholder/i.test(supabaseUrl);
const claveValida = supabaseKey && !/your-supabase|placeholder/i.test(supabaseKey);

export const supabaseConfigurado = Boolean(urlValida && claveValida);
export const supabase = createClient(
	urlValida ? supabaseUrl : 'http://127.0.0.1:54321',
	claveValida ? supabaseKey : 'local-placeholder-anon-key'
);