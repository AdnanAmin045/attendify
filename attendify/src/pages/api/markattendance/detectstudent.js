import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const response = await axios.get('http://localhost:5001/stop-camera', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data;
            const ids = data.detected_student_ids
            console.log("Data: ",ids)
            res.status(200).json({ ids });
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
