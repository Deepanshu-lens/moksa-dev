import { user } from "./user";
import { cameras, totalCameras, selectedCamera, captureRef } from "./camera";
import { selectedNode, nodes } from "./node";
import { activePanel, panels } from "./panels";
import { events } from "./events";
import { liveEvents } from "./live-events";
import { isAlertPanelOpen, selectedLayout } from "./ui";
import { personCount } from "./person-counter";
import { imageUrl } from "./heatMapimageUrl";
import { faceEvents } from "./face-events";
import { allEvents,totalAllEvent,isEventsLoading } from "./all-events";
import { gallery, totalFaceRegistered } from "./gallery";

export {
  user,
  cameras,
  totalCameras,
  selectedCamera,
  captureRef,
  selectedNode,
  nodes,
  activePanel,
  panels,
  events,
  liveEvents,
  faceEvents,
  isAlertPanelOpen,
  selectedLayout,
  personCount,
  imageUrl,
  allEvents,
  totalAllEvent,
  isEventsLoading,
  gallery,
  totalFaceRegistered,
};
