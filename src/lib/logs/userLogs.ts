import pb from "../pb";

export const addUserLogs = async (eventString: string, email: string, userId: string) => {

  try {
    const res = await pb.collection("userLogs").create({
      event: eventString,
      email: email,
      userId: userId,
    });
  } catch (error) {
    console.log("Error logging user event:", error);
  }
};
