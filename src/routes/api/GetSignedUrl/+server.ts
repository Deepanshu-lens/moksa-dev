import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const token = cookies.get('moksa-token');

    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { videoUri } = await request.json();

        const response = await fetch('https://api.moksa.ai/generatePresignedUrl', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key: videoUri }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate signed URL');
        }

        const data = await response.json();
        return json(data);
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }
};