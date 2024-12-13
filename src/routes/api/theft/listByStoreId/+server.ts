

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const token = cookies.get('moksa-token');

    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getMonth() - 1);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };


    try {
        const { storeId } = await request.json();
        console.log(storeId)
        const response = await fetch(`https://dev.api.moksa.ai/theft/theftListBasedOnStoreId/${storeId}/${formatDate(weekAgo)}/${formatDate(today)}/1/100`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch theft data');
        }

        const employees = await response.json();
        return json(employees);
    } catch (error) {
        console.error('Error fetching theft data:', error);
        return json({ error: 'Failed to fetch theft data' }, { status: 500 });
    }
};


