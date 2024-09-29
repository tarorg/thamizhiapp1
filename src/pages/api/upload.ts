import type { APIRoute } from 'astro';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${import.meta.env.PUBLIC_CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.PUBLIC_R2_SECRET_ACCESS_KEY,
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.text(); // Fixed: Use request instead of Astro.request
    console.log('Received raw request body:', body);

    let parsedBody;
    try {
      parsedBody = JSON.parse(body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON in request body',
        receivedBody: body
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { filename, contentType } = parsedBody;
    console.log('Received request for file:', filename, 'Content-Type:', contentType);

    console.log('R2_BUCKET_NAME:', import.meta.env.PUBLIC_R2_BUCKET_NAME);
    console.log('PUBLIC_R2_DOMAIN:', import.meta.env.PUBLIC_R2_DOMAIN);
    console.log('CLOUDFLARE_ACCOUNT_ID:', import.meta.env.PUBLIC_CLOUDFLARE_ACCOUNT_ID);
    console.log('R2_ACCESS_KEY_ID:', import.meta.env.PUBLIC_R2_ACCESS_KEY_ID);
    console.log('R2_SECRET_ACCESS_KEY:', import.meta.env.PUBLIC_R2_SECRET_ACCESS_KEY ? '[REDACTED]' : 'Not set');

    if (!import.meta.env.PUBLIC_R2_BUCKET_NAME || !import.meta.env.PUBLIC_R2_DOMAIN) {
      throw new Error('Missing required environment variables');
    }

    const command = new PutObjectCommand({
      Bucket: import.meta.env.PUBLIC_R2_BUCKET_NAME,
      Key: filename,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
    const publicUrl = `https://${import.meta.env.PUBLIC_R2_DOMAIN}/${filename}`;

    console.log('Generated signed URL:', signedUrl);
    console.log('Public URL:', publicUrl);

    return new Response(JSON.stringify({ signedUrl, publicUrl }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Or specify your domain
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
    });
  } catch (error) {
    console.error('Error in /api/upload:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate signed URL', 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Or specify your domain
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
    });
  }
};

// Add OPTIONS handler for CORS preflight requests
export const OPTIONS: APIRoute = async ({ request }) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Or specify your domain
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};