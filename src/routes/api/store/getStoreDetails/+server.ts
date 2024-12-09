import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const token = cookies.get('moksa-token');

    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };


    try {
        const { storeId } = await request.json();

        const responses = await Promise.all(storeId.map(async (store) => {
            // console.log(store.id)
            const response = await fetch(`https://api.moksa.ai/store/getStoreByStoreIdWithAllDetails/${store.id}/${formatDate(yearAgo)}/${formatDate(today)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch store details for store ${store.id}`);
            }
            return response.json();
        }));

        const combinedResponse = responses.flat();
        return json(combinedResponse);
    } catch (error) {
        console.error('Error fetching store details:', error);
        return json({ error: 'Failed to fetch store details' }, { status: 500 });
    }
};


