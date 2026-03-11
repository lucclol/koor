// api/strava-token.js
// Vercel serverless function — handles Strava OAuth code exchange
// Keeps client_secret off the frontend

module.exports = async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, grant_type, refresh_token } = req.body;

  const CLIENT_ID     = process.env.STRAVA_CLIENT_ID;
  const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ error: 'Strava credentials not configured on server.' });
  }

  try {
    const body = new URLSearchParams({
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type:    grant_type || 'authorization_code',
      ...(grant_type === 'refresh_token' ? { refresh_token } : { code }),
    });

    const stravaRes = await fetch('https://www.strava.com/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    const data = await stravaRes.json();

    if (!stravaRes.ok) {
      return res.status(stravaRes.status).json({ error: data.message || 'Strava auth failed' });
    }

    // Return only what the frontend needs — never expose client_secret
    return res.status(200).json({
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      expires_at:    data.expires_at,
      athlete:       data.athlete,
    });

  } catch (err) {
    console.error('Strava token error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
