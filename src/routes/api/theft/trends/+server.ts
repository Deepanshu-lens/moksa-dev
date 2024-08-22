

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const token = cookies.get('moksa-token');

    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const today = new Date();
    const monthago = new Date(today);
    monthago.setDate(monthago.getMonth() - 1);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };


    try {
        const { storeId } = await request.json();
        console.log(storeId)
        const response = await fetch(`https://dev.api.moksa.ai/theft/theftTrendsOfAllTime/${storeId}/${formatDate(monthago)}/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        // console.log(response)
        if (!response.ok) {
            throw new Error('Failed to fetch theft trends');
        }

        const trends = await response.json();
        console.log(trends)
        return json(trends);
    } catch (error) {
        console.error('Error fetching theft trends:', error);
        return json({ error: 'Failed to fetch theft trends' }, { status: 500 });
    }
};


