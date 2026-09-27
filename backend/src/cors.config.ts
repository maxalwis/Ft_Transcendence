// Seule origine autorisée à appeler l'API avec credentials, en HTTP comme en
// WebSocket. Le front et l'API sont servis derrière le même nginx : c'est
// donc l'URL publique de l'app (ex: https://localhost:8443).
// main.ts refuse de démarrer si FRONTEND_URL n'est pas défini.
export const CORS_ORIGIN = process.env.FRONTEND_URL;
