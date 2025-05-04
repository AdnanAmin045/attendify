import jwt from 'jsonwebtoken';
import cookie from 'cookie';

export const verifyToken = (req) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error('Error verifying token:', err.message);
    throw new Error('Invalid or expired token');
  }
};
