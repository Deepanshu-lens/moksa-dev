import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { storeId, camId, feature } = await request.json();

    // Validate input
    if (!storeId || !camId || !feature) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }


    const updatedCamera = await fetch('https://api.moksa.ai/camera/updateFeatureEnabled', {
        method: 'POST',
      headers: {
        'Authorization': `Bearer ${cookies.get('moksa-token')}`,
        "Content-Type": "application/json",
      }, body: JSON.stringify({
        feature: feature, 
        cameraId: camId,
        storeId: storeId
      })
    });
    

    return json({ message: 'Camera features updated successfully', camera: updatedCamera });
  } catch (error) {
    console.error('Error updating camera features:', error);
    return json({ error: 'Failed to update camera features' }, { status: 500 });
  }
};