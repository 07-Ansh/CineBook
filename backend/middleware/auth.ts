import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import https from 'https';

let cachedCerts: Record<string, string> = {};
let certsExpiry = 0;

const fetchGoogleCerts = (): Promise<Record<string, string>> => {
  const now = Date.now();
  if (Object.keys(cachedCerts).length > 0 && now < certsExpiry) {
    return Promise.resolve(cachedCerts);
  }

  return new Promise((resolve, reject) => {
    https.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          cachedCerts = parsed;
          certsExpiry = Date.now() + 3600000;
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
};

const base64UrlDecode = (str: string): string => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
};

export async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];
  const parts = token.split('.');
  if (parts.length !== 3) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
  }

  try {
    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(base64UrlDecode(headerB64));
    const payload = JSON.parse(base64UrlDecode(payloadB64));

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!projectId || !adminEmail) {
      console.error('FIREBASE_PROJECT_ID or ADMIN_EMAIL environment variable is not set');
      return res.status(500).json({ error: 'Server auth configuration missing' });
    }

    if (payload.aud !== projectId || payload.iss !== `https://securetoken.google.com/${projectId}`) {
      return res.status(401).json({ error: 'Unauthorized: Token issuer mismatch' });
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: 'Unauthorized: Token expired' });
    }

    if (payload.email !== adminEmail) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const certs = await fetchGoogleCerts();
    const cert = certs[header.kid];
    if (!cert) {
      return res.status(401).json({ error: 'Unauthorized: Invalid certificate key' });
    }

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);

    const signatureBase64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const isValid = verifier.verify(cert, Buffer.from(signatureBase64, 'base64'));

    if (!isValid) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token signature' });
    }

    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

