import { Router } from 'express';
const r = Router();

/** POST /chat  Body: { message }  → { reply } */
r.post('/chat', async (req, res) => {
  try {
    const { message } = req.body ?? {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }
    const reply = `AIDA (MVP): you said -> ${message.trim()}`;
    res.json({ reply });
  } catch (err) {
    console.error('POST /chat', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

export default r;
