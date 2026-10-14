import type { APIRoute } from 'astro';
import { buildClearCookie } from '../../../lib/auth.ts';

export const prerender = false;

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': buildClearCookie()
    }
  });
};

export const GET: APIRoute = async () => {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/admin',
      'Set-Cookie': buildClearCookie()
    }
  });
};
