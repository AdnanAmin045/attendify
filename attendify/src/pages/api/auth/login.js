import jwt from 'jsonwebtoken';
import pool from '../../../lib/db';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import cookie from 'cookie';

export default async function handler(req, res) {
  const { email, password } = req.body;

  // Check admin .env credentials
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email: email, role: "admin" }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set token in HttpOnly cookie
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    }));

    return res.status(200).json({ message: 'Login successful', status: 1 });
  }

  const client = await pool.connect();
  try {
    const query = `SELECT id, email, password FROM teachers WHERE email = $1`;
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    const secretKey = process.env.AES_SECRET_KEY || 'default_key';
    const bytes = AES.decrypt(user.password, secretKey);
    const decryptedPassword = bytes.toString(Utf8);
    if (decryptedPassword === password) {
      const token = jwt.sign({ userId: user.id, role: "teacher" }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Set token in HttpOnly cookie
      res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        sameSite: 'Strict',
        maxAge: 60 * 60 * 1000,
        path: '/',
      }));

      return res.status(200).json({ message: 'Login successful', status: 2 });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
}
