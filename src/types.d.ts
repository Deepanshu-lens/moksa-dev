export type User = {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  session: string;
  role;
  features;
};


export type Camera = {
  name: string;
  id: string;
  url: string;
  subUrl: string;
  hovered?: boolean;
  active?: boolean;
  face: boolean;
  vehicle: boolean;
  save: boolean;
  saveFolder: string;
  saveDuration: string;
  faceDetThresh: number;
  faceMatchThresh: number;
  vehicleDetThresh: number;
  vehiclePlateThresh: number;
  vehicleOCRThresh: number;
  motionThresh: number;
  priority: boolean;
  maskDetection: boolean;
  helmetDetection: boolean;
  weaponDetection: boolean;
  roiData: any;
  cameraTamperDetection: boolean;
  guardMissingDetection: boolean
  lineData: any;
  lineCrossing: boolean;
  intrusionDetection: boolean;
  linePerson: boolean;
  lineVehicle: boolean;
  linePersonThresh: number;
  lineVehicleThresh: number;
  intrusionPersonThresh: number;
  intrusionVehicleThresh: number;
  intrusionPerson: boolean;
  intrusionVehicle: boolean;
  sparshID:number
  personCount: boolean;
  personCounter: any;
  ptz: boolean;
  preset: any[];
  lastCords: any[]
  theft: boolean;
  safety: boolean;
  person: boolean;
  employeEE: boolean;
  theftDetectionThresh: number;
};

export type Playback = {
  id: string;
  url: string;
  startTime: Date;
  endTime?: Date;
};

export type Event = {
  nodeId: string;
  sessionId: string;
  camera: string;
  score: number;
  title: string;
  description: string;
  frameImage: string;
  videoUrl: string;
  frameId: number;
  created: Date;
  severity: "critical" | "high" | "medium" | "low" | "info";
};

export type Node = {
  name: string;
  id: string;
  session: string;
  camera: Camera[];
  maxStreamsPerPage: number;
  live_mode: number;
  live_resolution: number;
  recording_mode: number;
  recording_quality: number;
  recording_buffer: number;
  recording_sound: boolean;
  mobileLayout: number;
};

export type SelectedNode = Node;

export type Gallery = {
  name: string;
  images: string[];
  created: Date;
  updated: Date;
  lastSeen: Date;
};

export type LoginEvent = {
  id: string;
  email: string;
  created: Date;
};

export type UserLog = {
  id: string;
  emaiL: string;
  created: Date;
  event: string;
};
