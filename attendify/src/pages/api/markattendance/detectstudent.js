import axios from 'axios';
import { verifyToken } from '../../middleware/verifytoken';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const decoded = verifyToken(req, res);
            try {

                const response = await axios.get('http://localhost:5001/stop-camera', {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = response.data;
                const ids = data.detected_student_ids
                res.status(200).json({ ids });
            } catch (error) {
                console.error('Error calling Python API:', error.message);
                if (error.response) {
                    console.error('Python API response:', error.response.data);
                }

                res.status(500).json({ error: 'Failed to call Python API' });
            }
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ error: "Unauthorized" });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
