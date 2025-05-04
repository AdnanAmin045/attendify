import cookie from 'cookie';

export default async function handler(req, res) {
    if (!req.method === "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }
    res.setHeader('Set-Cookie', cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        maxAge: 0,
        path: '/',
    }));
    res.status(200).json({ message: 'Logout successful' });
};
