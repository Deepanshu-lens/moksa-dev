import PocketBase from "pocketbase";

const getPocketBaseURL = () => {
  if (typeof window === "undefined") {
    //vercel
    return import.meta.env.PUBLIC_POCKETBASE_URL;
  } else if (window && window.api?.navigate) {
    //electron
    return import.meta.env.PUBLIC_POCKETBASE_URL;
  } else {
    const hostname = window.location.hostname;
    const isProduction = import.meta.env.PUBLIC_ENV === "production";
    return isProduction
      ? import.meta.env.PUBLIC_POCKETBASE_URL
      : `http://${hostname}:8090`;
  }
};

const pb = new PocketBase(getPocketBaseURL());

export default pb;