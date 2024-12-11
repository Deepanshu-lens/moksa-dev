import PocketBase from "pocketbase";

const getPocketBaseURL = () => {
  if (typeof window === "undefined") {
    //vercel
    return import.meta.env.PUBLIC_POCKETBASE_URL;
  } else if (window && window.api?.navigate) {
    //electron
    return import.meta.env.PRIVATE_OFFLINE_DB;
  } else {
    const isProduction = import.meta.env.PUBLIC_ENV === "production";
    return isProduction
      ? import.meta.env.PUBLIC_POCKETBASE_URL
      : import.meta.env.PRIVATE_POCKETBASE_URL;
  }
};

const pb = new PocketBase(getPocketBaseURL());

export default pb;
