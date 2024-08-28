import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const token = cookies.get('moksa-token');

    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const today = new Date();
    const weekAgo = new Date(today.setDate(today.getDate() - 7));

    try {
        const { storeId } = await request.json();
        const responses = await Promise.all(storeId.map(async (store:any) => {
            const response = await fetch(`https://api.moksa.ai/people/getPeopleCount/${store.id}/${formatDate(weekAgo)}/${formatDate(today)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch employees for store ${store.id}`);
            }
            return response.json();
        }));

        const combinedResponse = responses.flat();
        return json(combinedResponse);

    } catch (error) {
        console.error('Error fetching employees:', error);
        return json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
};