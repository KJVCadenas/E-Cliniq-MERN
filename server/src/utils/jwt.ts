import jwt, { JwtPayload } from 'jsonwebtoken';

export interface JwtPayloadCustom extends JwtPayload {
  sub: string; // User ID
  role?: string;
  sessionId?: string;
}

// === ENVIRONMENT VALIDATION ===
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

// Token config
const JWT_EXPIRES_IN = '1h';

// === SIGN TOKEN ===
export const signToken = (
  payload: Omit<JwtPayloadCustom, 'iat' | 'exp'>
): string => {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// === VERIFY TOKEN ===
export const verifyToken = (token: string): JwtPayloadCustom => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);

    // Type guard: make sure 'sub' exists and is a string
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof decoded.sub !== 'string'
    ) {
      throw new Error('Invalid token payload');
    }

    return decoded as JwtPayloadCustom;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};
