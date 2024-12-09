import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const token = cookies.get('moksa-token');

    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };


    try {
        const { storeId } = await request.json();
        console.log(storeId)
        // const response = await fetch(`https://api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${storeId}/1/20/${formatDate(weekAgo)}/${formatDate(today)}`, {
        //     method: 'GET',
        //     headers: {
        //         'Authorization': `Bearer ${token}`,
        //         'Content-Type': 'application/json'
        //     },
        // });

        // if (!response.ok) {
        //     throw new Error('Failed to fetch employees');
        // }
        const responses = await Promise.all(storeId.map(async (store: any) => {
            const response = await fetch(`https://api.moksa.ai/store/storeEmployee/getSafetyDetailsOfAllEmployeesByStore/${store.id}/1/20/${formatDate(weekAgo)}/${formatDate(today)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch employees for store ${store.id}`);
            }
            const data = await response.json();
            return { storeId: store.id, employees: data };
        }));

        const combinedResponse = responses.flat();
        return json(combinedResponse);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
};


