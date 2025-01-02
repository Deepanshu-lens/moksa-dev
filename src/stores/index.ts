import { user } from "./user";
import {
  cameras,
  totalCameras,
  selectedCamera,
  captureRef,
  displayCameras,
} from "./camera";
import { selectedNode, nodes } from "./node";
import { activePanel, panels, isPanelLoading } from "./panels";
import { events } from "./events";
import { liveEvents } from "./live-events";
import {
  isAlertPanelOpen,
  selectedLayout,
  isRoiPanelOpen,
  customLayout,
} from "./ui";
import { personCount } from "./person-counter";
import { imageUrl } from "./heatMapimageUrl";
import { faceEvents } from "./face-events";
import { allEvents, totalAllEvent, isEventsLoading } from "./all-events";
import { gallery, totalFaceRegistered, isGalleryLoading } from "./gallery";
import { eventsManager, loadingEvents } from "./events-manager";

export {
  user,
  loadingEvents,
  eventsManager,
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
  isRoiPanelOpen,
  selectedLayout,
  personCount,
  imageUrl,
  allEvents,
  totalAllEvent,
  isEventsLoading,
  gallery,
  totalFaceRegistered,
  isGalleryLoading,
  displayCameras,
  customLayout,
  isPanelLoading,
};
