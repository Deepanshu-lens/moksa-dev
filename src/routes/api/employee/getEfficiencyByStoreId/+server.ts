import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const token = cookies.get('moksa-token');

    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 15);

    const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
    };


    try {
        const { storeId } = await request.json();
        console.log(storeId)
        const response = await fetch(`https://api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreidDynamic/${storeId}/${formatDate(weekAgo)}/1/100/${formatDate(today)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }

        const employees = await response.json();
        return json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
};


