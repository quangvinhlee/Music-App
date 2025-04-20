// pages/api/soundcloud.js
export default async function handler(req, res) {
  const { searchQuery } = req.query;
  const clientId = "EjkRJG0BLNEZquRiPZYdNtJdyGtTuHdp";

  try {
    const response = await fetch(
      `https://api-v2.soundcloud.com/search/tracks?q=${encodeURIComponent(
        searchQuery
      )}&client_id=${clientId}&limit=10`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching from SoundCloud:", error);
    res.status(500).json({ error: "Error fetching data" });
  }
}
