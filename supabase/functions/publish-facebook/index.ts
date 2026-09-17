import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacebookPublishPayload {
  message: string;
  mediaUrls?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, mediaUrls } = await req.json() as FacebookPublishPayload;

    if (!message) {
      throw new Error("Message is required for a Facebook post.");
    }

    const FACEBOOK_PAGE_ACCESS_TOKEN = Deno.env.get('FACEBOOK_PAGE_ACCESS_TOKEN');
    const FACEBOOK_PAGE_ID = Deno.env.get('FACEBOOK_PAGE_ID');

    if (!FACEBOOK_PAGE_ACCESS_TOKEN || !FACEBOOK_PAGE_ID) {
      throw new Error("Facebook credentials missing in Edge Function secrets.");
    }

    const version = 'v19.0';
    let attachedMediaParams = '';

    // If there are media URLs, we upload them as unpublished photos first to get their Graph IDs.
    if (mediaUrls && mediaUrls.length > 0) {
      const mediaIds: string[] = [];

      for (const url of mediaUrls) {
        const photoRes = await fetch(`https://graph.facebook.com/${version}/${FACEBOOK_PAGE_ID}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url,
            published: false,
            access_token: FACEBOOK_PAGE_ACCESS_TOKEN
          })
        });

        const photoData = await photoRes.json();
        if (photoData.error) {
          throw new Error(`Failed to upload photo to Facebook: ${photoData.error.message}`);
        }
        if (photoData.id) {
          mediaIds.push(photoData.id);
        }
      }

      // Format attached media params for the feed request
      if (mediaIds.length > 0) {
          const params = new URLSearchParams();
          mediaIds.forEach((id, index) => {
            params.append(`attached_media[${index}]`, JSON.stringify({ media_fbid: id }));
          });
          attachedMediaParams = '&' + params.toString();
      }
    }

    // Now, publish the final feed post
    const feedRes = await fetch(`https://graph.facebook.com/${version}/${FACEBOOK_PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `message=${encodeURIComponent(message)}&access_token=${FACEBOOK_PAGE_ACCESS_TOKEN}${attachedMediaParams}`
    });

    const feedData = await feedRes.json();
    if (feedData.error) {
      throw new Error(`Failed to publish feed post to Facebook: ${feedData.error.message}`);
    }

    return new Response(JSON.stringify({ success: true, id: feedData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
