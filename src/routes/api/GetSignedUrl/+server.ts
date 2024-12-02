import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const token = cookies.get('moksa-token');

    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { videoUri } = await request.json();

        const response = await fetch(`https://dev.api.moksa.ai/stream?key=${videoUri}`, {
            method: 'GET',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log(response)
        if (!response.ok) {
            throw new Error('Failed to get signed URL');
        }

        const blob = await response.blob();
        console.log(blob)
        const contentType = response.headers.get('content-type');

        // Check if the content type is a valid video type
        if (!contentType.startsWith('video/')) {
            throw new Error('Invalid content type for video');
        }

        const videoBlob = new Blob([blob], { type: contentType });

        return json(videoBlob);
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }
};
