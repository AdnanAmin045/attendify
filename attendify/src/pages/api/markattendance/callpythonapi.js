import axios from 'axios';
import { verifyToken } from '../../middleware/verifytoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const decoded = verifyToken(req, res);
      const { students } = req.body;

      try {
        await axios.post(
          'http://localhost:5001/start-camera',
          { students },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        res.status(200).json({ message: 'Camera started successfully' });
      } catch (error) {
        console.error('Error starting camera:', error.message);
        res.status(500).json({ error: 'Failed to start camera' });
      }
    } catch (error) {
      console.error("Token verification failed:", err);
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
