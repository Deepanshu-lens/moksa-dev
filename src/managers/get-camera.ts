import type { Camera } from "@/types";
import pb from "@/lib/pb";

export const getCameras = async (nodeId: string,session:string) => {
  console.log("nodeId", nodeId)
  let filter;
    if(nodeId === "all")
    filter = `session ?= "${session}" && save = true`
     else
    filter = `node.id ?= "${nodeId}" && save = true`

  try {
    pb.autoCancellation(false);
    const localCameras = await pb.collection("camera").getFullList<Camera>({
      fields: "id,name",
      filter,
      sort: "created",
    });
    return localCameras;
  } catch (error) {
    console.error("Error initializing Camera Manager:", error);
  }
};
