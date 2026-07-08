import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'missing_auth' }), { status: 401 });
    }

    // Identify the caller from their own JWT (anon-key client, not admin)
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'invalid_session' }), { status: 401 });
    }

    // `verifications`/`ambassador_applications` are keyed by the app's local
    // onboarding device id, not the Supabase auth user id — only the client knows it.
    let onboardingUserId: string | undefined;
    try {
      const body = await req.json();
      onboardingUserId = body?.onboardingUserId;
    } catch {
      // no body sent — fine, just skip those tables
    }

    // Everything below needs elevated privileges
    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (onboardingUserId) {
      await admin.from('verifications').delete().eq('user_id', onboardingUserId);
      await admin.from('ambassador_applications').delete().eq('user_id', onboardingUserId);
    }
    await admin.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error('deleteUser failed:', deleteError);
      return new Response(JSON.stringify({ error: 'delete_failed' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
