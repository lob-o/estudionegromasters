export default async function handler(req, res) {
  const DB_ID = process.env.NOTION_MASTERS_DB_ID;
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
          filter: {
            property: 'Activo',
            checkbox: { equals: true }
          },
          sorts: [{ property: 'Orden', direction: 'ascending' }]
        })
      }
    );

    const data = await response.json();
    const covers = data.results.map(page => ({
      a: page.properties['Artista']?.title?.[0]?.plain_text || '',
      t: page.properties['\u00c1lbum']?.rich_text?.[0]?.plain_text || '',
      y: page.properties['A\u00f1o']?.number || '',
      i: page.properties['Car\u00e1tula URL']?.url || ''
    })).filter(c => c.a && c.i);

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.json(covers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
