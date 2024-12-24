import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Invalid email address." }),
  session: z.array(z.string()),
});

// export const cameraSchema = z.lazy(() =>
//   z.object({
//     id: z.string(),
//     name: z.string().min(1, "Camera name is required."),
//     url: z.string().url("Invalid URL"),
//     subUrl: z.any(),
//     save: z.boolean(),
//     // subUrl: z.string().url("Invalid URL").nullable().optional(),
//     // node: nodeSchema,
//   })
// );

// export const nodeSchema = z.lazy(() =>
//   z.object({
//     id: z.string(),
//     name: z.string().min(1, "Camera name is required."),
//     cameras: z.array(z.string()).optional(),
//   })
// );

// export type User = z.infer<typeof userSchema>;
// export type Camera = z.infer<typeof cameraSchema>;
// export type Node = z.infer<typeof nodeSchema>;

export const validateUser = (data: any): User | null => {
  if (!data) return null;
  if (!data.name && data.firstName && data.lastName) {
    data.name = `${data.firstName} ${data.lastName}`;
  }
  const parsed = userSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }

  console.error("User validation error: ", parsed.error.errors);
  return null;
};

export const validateCamera = (data: unknown): Camera | null => {
  const parsed = cameraSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }
  console.error("Invalid Camera Data: ", parsed.error.errors);
  return null;
};

export const validateCameras = (data: unknown[]): Camera[] => {
  return data
    .map(validateCamera)
    .filter((camera): camera is Camera => camera !== null);
};

export const validateNode = (data: unknown): Node | null => {
  const parsed = nodeSchema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }
  console.error("Invalid Node Data: ", parsed.error.errors);
  return null;
};

export const validateNodes = (data: unknown[]): Node[] => {
  return data.map(validateNode).filter((node): node is Node => node !== null);
};

export const cameraSchema = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string().min(1, "Camera name is required."),
    url: z.string().url("Invalid URL"),
    subUrl: z.any(),
    save: z.boolean(),
    saveDuration: z.number().optional(),
    created: z.string(),
    node: z.array(z.string()),
    fps: z.number().optional(),
    motionThresh: z.number().optional(),
    face: z.boolean().optional(),
    person: z.boolean().optional(),
    faceDetThresh: z.number().optional(),
    faceMatchThresh: z.number().optional(),
    personDetThreshold: z.number().optional(),
    timeZone: z.string().optional(),
    streamType: z
      .enum(["", "Default", "Mainstream", "Substream"])
      .transform((val) => (val === "" ? "Default" : val)),
    recordQuality: z
      .enum(["", "Default", "Mainstream", "Substream"])
      .transform((val) => (val === "" ? "Default" : val)),
  })
);

export const gallerySchema = z.lazy(() =>
  z.object({
    name: z.string(),
    images: z.array(z.string()),
    created: z.date(),
    updated: z.date(),
    lastSeen: z.date(),
  })
);

export const nodeSchema = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string().min(1, "Camera name is required."),
    cameras: z.array(z.string()).optional(),
  })
);

export const eventSchema = z.lazy(() =>
  z.object({
    camera: z.string(),
    score: z.number().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    frameImage: z.string().optional(), // Assuming this might be a URL or base64 string for the image
    frameId: z.string().optional(),
    severity: z
      .enum(["critical", "high", "medium", "low", "information"])
      .optional(),
    type: z.enum(["face", "fire", "person"]).optional(),
    feature: z.record(z.any()).optional(),
    matchScore: z.number().optional(),
    sparshID: z.string().optional(),
    boxes: z.record(z.any()).optional(),
    videoUrl: z.string().optional(),
  })
);

export type User = z.infer<typeof userSchema>;
export type Camera = z.infer<typeof cameraSchema>;
export type Node = z.infer<typeof nodeSchema>;
export type Event = z.infer<typeof eventSchema>;
export type Gallery = z.infer<typeof gallerySchema>;
