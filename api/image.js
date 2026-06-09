export default async function handler(req, res) {
  const { url } = req.query;

  // solo permite imágenes del dominio de estudionegro
  if (!url || !url.startsWith('https://estudionegro.io/')) {
    return res.status(400).end();
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://estudionegro.io/',
        'User-Agent': 'Mozilla/5.0 (compatible; estudionegro-site/1.0)'
      }
    });

    if (!response.ok) return res.status(response.status).end();

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 días
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).end();
  }
}
