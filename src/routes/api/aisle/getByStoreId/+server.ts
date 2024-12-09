import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    console.log('Received POST request to /api/aisle/getByStoreId');
    const token = cookies.get('moksa-token');

    if (!token) {
        console.log('Unauthorized: No token found');
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const today = new Date();
    const newToday = new Date(today.setDate(today.getDate() + 1));
    const weekAgo = new Date(today.setDate(today.getDate() - 7));

    try {
        const { storeId } = await request.json();
        // console.log(`Fetching aisle counts for ${storeId.length} stores`);

        const responses = await Promise.all(storeId.map(async (store: any) => {
            // console.log(`Fetching aisle count for store ${store.id}`);
            const response = await fetch(`https://api.moksa.ai/people/aisleCount/getAisleCountbyStoreid/${store.id}/${formatDate(weekAgo)}/${formatDate(newToday)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                console.error(`Failed to fetch aisle count for store ${store.id}: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch aisle count for store ${store.id}`);
            }
            const data = await response.json();
            return { storeId: store.id, data };
        }));

        const combinedResponse = responses.flat();
        console.log(`Successfully fetched aisle counts for ${storeId.length} stores`);
        return json(combinedResponse);

    } catch (error) {
        console.error('Error fetching aisle counts:', error);
        return json({ error: 'Failed to fetch aisle counts' }, { status: 500 });
    }
};