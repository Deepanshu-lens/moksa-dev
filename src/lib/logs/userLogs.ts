import pb from "../pb";
import { getUserSystemDetails } from "./userDetails";

export const addUserLogs = async (eventString: string, email: string, userId: string) => {
  try {
    const userDetails = await getUserSystemDetails();

    await pb.collection("userLogs").create({
      event: eventString,
      email: email,
      userId: userId,
      userDetails: userDetails,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log("Error logging user event:", error);
  }
};
