import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const payload = await request.json();
    let token = cookies.get('moksa-token');
    console.log(token, 'tokennn')

    // Here you would handle the logic to send the payload to the Moksa API
    const response = await fetch(`http://dev.api.moksa.ai/store/updateCustomerVars/${payload.storeId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${cookies.get('moksa-token')}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    console.log(response, 'response from')

    if (!response.ok) {
        return json({ error: 'Failed to update customer variables' }, { status: 500 });
    }

    const data = await response.json();
    return json(data);
};