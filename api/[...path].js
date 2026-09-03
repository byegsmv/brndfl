/**
 * Vercel catch-all: /api/** butun yollar bura yonelir.
 * req.url orijinal yolu saxlayir, ona gore Express oz marsrutlarini
 * (/api/auth, /api/admin, /api/...) duzgun taniyir.
 */
import app from '../backend/src/app.js';
export default app;
