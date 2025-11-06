// src/pages/api/checkEnvs.ts
export const GET = () => {
    return new Response(JSON.stringify({
        supabase_url: import.meta.env.SUPABASE_URL ? 'SET' : 'MISSING',
        supabase_key: import.meta.env.SUPABASE_KEY ? 'SET' : 'MISSING',
        openrouter_key: import.meta.env.OPENROUTER_API_KEY ? 'SET' : 'MISSING',
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
};