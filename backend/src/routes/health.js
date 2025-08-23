import { Router } from 'express';
const r = Router();
r.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));
export default r;
