export default async function handler(req, res) {
  const DB_ID = process.env.NOTION_LEGACY_DB_ID;
  const TOKEN = process.env.NOTION_TOKEN;

  if (!DB_ID || !TOKEN) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${DB_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sorts: [{ property: 'Orden', direction: 'ascending' }]
        })
      }
    );

    const data = await response.json();
    const credits = {};

    data.results.forEach(page => {
      const artist = page.properties['Artista']?.title?.[0]?.plain_text || '';
      const album  = page.properties['\u00c1lbum']?.rich_text?.[0]?.plain_text || '';
      const credit = page.properties['Cr\u00e9ditos']?.rich_text?.[0]?.plain_text || '';
      if (artist && album) {
        credits[`${artist}|${album}`] = credit || '';
      }
    });

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.json(credits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
