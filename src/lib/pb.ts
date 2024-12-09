import PocketBase from "pocketbase";

const getPocketBaseURL = () => {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      return import.meta.env.PUBLIC_POCKETBASE_URL;
    } else {
      const localIP = window.location.hostname;
      return `http://${localIP}:8090`;
    }
  };
  const pb = new PocketBase(getPocketBaseURL());
  
  export default pb;