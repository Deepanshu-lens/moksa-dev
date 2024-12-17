import pb from "../pb";
import { getUserSystemDetails } from "./userDetails";

export const addAuthLogs = async (eventString: string, email: string) => {
  let event;
  switch (eventString) {
    case "login":
      event = "Successfully signed in";
      break;
    case "logout":
      event = "Signed out successfully";
      break;
    case "register":
      event = "Account created successfully";
      break;
    case "forgot_password_request":
      event = "Password reset link sent to your email";
      break;
    case "forgot_password_success":
      event = "Password reset completed successfully";
      break;
    case "forgot_password_expired":
      event = "Password reset link has expired. Please request a new one";
      break;
    case "password_changed":
      event = "Password updated successfully";
      break;
    default:
      break;
  }

  try {
    const userDetails = await getUserSystemDetails();

    const res = await pb.collection("loginEvents").create({
      events: event,
      email: email,
      userDetails: userDetails,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log("Error logging auth event:", error);
  }
};
