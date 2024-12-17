import type { Camera } from "@/types";
import pb from "@/lib/pb";

export const getCameras = async (nodeId: string) => {
  try {
    console.log("Node:", nodeId);
    pb.autoCancellation(false);
    const localCameras = await pb.collection("camera").getFullList<Camera>({
      fields: "id,name",
      filter: `node.id ?= "${nodeId}" && save = true`,
      sort: "-created",
    });
    return localCameras;
  } catch (error) {
    console.error("Error initializing Camera Manager:", error);
  }
};
