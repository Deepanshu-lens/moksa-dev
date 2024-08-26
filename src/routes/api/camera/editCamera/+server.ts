import { redirect } from "@sveltejs/kit";
import { VITE_POCKETBASE_URL } from "$env/static/private";
import type { RequestEvent, RequestHandler } from "./$types";
import type { Camera } from "@/types";

export const PUT: RequestHandler = async ({
  locals,
  request,
}: RequestEvent) => {
  console.log("Editing Camera");
  const data = await request.json();

  console.log(data)
  const old = await locals.pb
    ?.collection("camera")
    .getOne<Camera>(data.cameraId)

  await locals.pb?.collection("camera").update(data.cameraId, {
    name: data.name,
    url: data.url,
    subUrl: data.subUrl,
    save: data.save,
    saveDuration: data.saveDuration,
    saveFolder: data.saveFolder,
    personCount: data.personCount
  });

  await locals.pb?.collection("ai_inference").update(old.inference, {
    face: data.face,
    faceDetThresh: data.faceDetectionThreshold,
    faceMatchThresh: data.faceSearchThreshold,
    intrusionDetection: data.intrusionDetection,
    intrusionPerson: data.intrusionPerson,
    intrusionPersonThresh: data.intrusionPersonThresh,
    intrusionVehicle: data.intrusionVehicle,
    intrusionVehicleThresh: data.intrusionVehicleThresh,
    lineCrossing: data.lineCrossing,
    linePerson: data.linePerson,
    linePersonThresh: data.linePersonThresh,
    lineVehicle: data.lineVehicle,
    lineVehicleThresh: data.lineVehicleThresh,
    motionThresh: data.motionThresh,
    vehicle: data.vehicle,
    vehDetThresh: data.vehicleDetectionThreshold,
    vehPlateThresh: data.vehiclePlateThreshold,
    vehOCRThresh: data.vehicleOCRThreshold,
    priority: data.priority,
    running: data.running,
    runningThresh: data.runningThresh,
  })

  if (old.url !== data.url) {
    await fetch(VITE_POCKETBASE_URL + "/api/editStream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: old.url,
        newUrl: data.url,
        newName: data.name,
      }),
    });
  }

  return new Response(null, { status: 200 });
};
