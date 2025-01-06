import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const payload = await request.json();
    let token = cookies.get('moksa-token');
    console.log(token, 'tokenmn');

    const response = await fetch(`https://api.moksa.ai/store/updateCustomerVars/${payload.storeId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${cookies.get('moksa-token')}`,
            "Content-Type": "application/json",
        }, body: JSON.stringify(payload),
    });

    const responseBody = await response.json();
    console.log(responseBody, 'response from');

    if (!response.ok) {
        return json({ error: responseBody?.error || 'Failed to update customer variables', details: responseBody }, { status: 500 });
    }

    return json(responseBody);
};