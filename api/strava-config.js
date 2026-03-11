// api/strava-config.js
// Returns the public Strava client ID so the frontend doesn't hardcode it

module.exports = function handler(req, res) {
  const clientId = process.env.STRAVA_CLIENT_ID;

  if (!clientId) {
    return res.status(500).json({ error: 'STRAVA_CLIENT_ID not configured' });
  }

  return res.status(200).json({ client_id: clientId });
}
