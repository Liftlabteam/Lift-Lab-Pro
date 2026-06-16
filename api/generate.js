export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const formData = req.body;

  res.json({
    success: true,
    message: 'API is working',
    received: formData
  });
};
