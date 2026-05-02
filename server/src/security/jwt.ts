import jwt from 'jsonwebtoken';

export interface JwtPayload {
  id?: string;
  role?: string;
  [key: string]: any;
}

export const generateToken = (payload: string | Buffer | object): string => {
  if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.verify(token, process.env.JWT_SECRET);
};
