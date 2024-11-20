import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get('moksa-token');

  if (!token) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { storeId } = await request.json();
    console.log(storeId)
    const response = await fetch(`https://dev.api.moksa.ai/store/storeEmployee/getAllEmployeeByStoreId/${storeId}`, {
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

// https://dev.api.moksa.ai/store/storeEmployee/getEmployeeEfficiencyByStoreid/31/2024-08-06/1/3/2024-08-13
