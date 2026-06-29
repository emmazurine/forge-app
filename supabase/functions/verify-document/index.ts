import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' },
    });
  }

  try {
    const payload = await req.json();
    // Supabase DB webhooks wrap the row under `record`
    const record = payload.record ?? payload;

    // Only process new pending document uploads
    if (record.method !== 'id' || record.status !== 'pending' || !record.storage_key) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Download the uploaded file from Storage
    const { data: fileData, error: downloadErr } = await supabase.storage
      .from('verification-docs')
      .download(record.storage_key);

    if (downloadErr || !fileData) {
      console.error('Download failed:', downloadErr);
      await supabase.from('verifications').update({ status: 'rejected' }).eq('id', record.id);
      return new Response(JSON.stringify({ error: 'download_failed' }), { status: 200 });
    }

    // Convert file to base64
    const bytes = new Uint8Array(await fileData.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);

    const fileName = (record.file_name ?? '').toLowerCase();
    const isPdf = fileName.endsWith('.pdf');
    const mediaType = isPdf ? 'application/pdf'
      : fileName.match(/\.(jpg|jpeg)$/) ? 'image/jpeg'
      : 'image/png';

    // Build the document/image block for Claude
    const fileBlock = isPdf
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
      : { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } };

    // Ask Claude to validate the document
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: [
            fileBlock,
            {
              type: 'text',
              text: `Does this document appear to be a legitimate student academic record?
Acceptable documents: official transcript, grade report, enrollment letter, student ID card, report card from a school or university.
Not acceptable: blank/empty files, obviously fake documents, unrelated files.

Reply with ONLY valid JSON (no other text): {"isValid": true, "reason": "one sentence"}`,
            },
          ],
        }],
      }),
    });

    if (!claudeRes.ok) {
      // Claude unavailable — leave as pending for manual fallback
      console.error('Claude API error:', await claudeRes.text());
      return new Response(JSON.stringify({ error: 'ai_unavailable' }), { status: 200 });
    }

    const claude = await claudeRes.json();
    const text = claude.content?.[0]?.text ?? '{}';

    let isValid = false;
    try {
      const result = JSON.parse(text);
      isValid = result.isValid === true;
    } catch {
      // Unparseable response — leave as pending
      console.error('Could not parse Claude response:', text);
      return new Response(JSON.stringify({ error: 'parse_failed' }), { status: 200 });
    }

    await supabase
      .from('verifications')
      .update({ status: isValid ? 'verified' : 'rejected' })
      .eq('id', record.id);

    return new Response(JSON.stringify({ verified: isValid }), { status: 200 });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
