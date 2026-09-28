// Origine(s) autorisées à appeler l'API avec credentials, en HTTP comme en
// WebSocket. Le front et l'API sont servis derrière le même nginx : la
// référence est donc l'URL publique de l'app (ex: https://localhost:8443).
// main.ts refuse de démarrer si FRONTEND_URL n'est pas défini.
//
// En plus de FRONTEND_URL, on accepte toute origine https sur le même port
// dont l'hôte est une IP privée (192.168.x.x, 10.x.x.x, 172.16-31.x.x) : ça
// permet de tester l'app depuis un autre appareil du même wifi sans avoir à
// reconfigurer FRONTEND_URL à chaque fois que l'IP de la machine de test
// change (voir `make url` pour le lien à partager).
export const FRONTEND_URL = process.env.FRONTEND_URL;

const PRIVATE_LAN_HOST =
  /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$/;

export function isAllowedOrigin(origin: string): boolean {
  if (origin === FRONTEND_URL) return true;
  if (!FRONTEND_URL) return false;

  try {
    const configured = new URL(FRONTEND_URL);
    const candidate = new URL(origin);
    return (
      candidate.protocol === 'https:' &&
      candidate.port === configured.port &&
      PRIVATE_LAN_HOST.test(candidate.hostname)
    );
  } catch {
    return false;
  }
}

export const CORS_ORIGIN = FRONTEND_URL
  ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // callback(null, false) rather than an Error: a disallowed origin should
      // just come back without CORS headers (browser blocks it client-side),
      // not surface as a 500.
      callback(null, !origin || isAllowedOrigin(origin));
    }
  : undefined;
