import { json } from '@sveltejs/kit';

export async function POST({ request,locals }) {
    
    try {
        const data = await request.json();
        const record = await locals.pb?.collection('events').create(data);
        return json({ success: true, record }, { status: 201 });
    } catch (error) {
        return json({ success: false, error: error }, { status: 400 });
    }
}
