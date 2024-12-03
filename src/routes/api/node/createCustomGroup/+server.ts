import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { cameraIds, session, nodeName } = await request.json();

        console.log(session)
        console.log(cameraIds)
        console.log(nodeName)

        const newGroup = await locals.pb?.collection('node').create({
            session: session,
            name: nodeName,
            camera: cameraIds,
            mobileLayout: 1,
            maxStreamsPerPage: 0,

        });
        await locals.pb?.collection('session').update(session, {
            'node+': [newGroup?.id]
        });

        for (const cameraId of cameraIds) {
            try {
                const camera = await locals.pb?.collection('camera').getOne(cameraId);
                if (camera) {
                    await locals.pb?.collection('camera').update(cameraId, {
                        'node+': [newGroup?.id]
                    });
                }
            } catch (cameraError) {
                console.error(`Error updating camera ${cameraId}:`, cameraError);
                // Continue with the next camera even if one fails
            }
        }
        return json({ success: true, group: newGroup });
    } catch (error) {
        console.error('Error creating custom group:', error);
        return json({ success: false, error: 'Failed to create custom group' }, { status: 500 });
    }
};