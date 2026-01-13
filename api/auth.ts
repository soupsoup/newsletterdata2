import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    const correctPassword = process.env.SITE_PASSWORD;

    if (!correctPassword) {
      console.error('SITE_PASSWORD environment variable not set');
      return res.status(500).json({ success: false, error: 'Server configuration error' });
    }

    if (password === correctPassword) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ success: false, error: 'Authentication failed' });
  }
}
