import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
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
        } catch (error) {
            console.error('Error calling Python API:', error.message);
            if (error.response) {
                console.error('Python API response:', error.response.data);
            }
            res.status(500).json({ error: 'Failed to call Python API' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
