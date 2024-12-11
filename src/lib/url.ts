const getStreamURL = () => {
  if (typeof window === "undefined") {
    // Server-side logic
    return import.meta.env.PUBLIC_STREAM_URL;
  } else if (window && (window as any).api?.navigate) {
    // Electron environment (client-side)
    return import.meta.env.PRIVATE_STREAM_URL;
  } else {
    // Regular client-side logic (browser)
    const isProduction = import.meta.env.PUBLIC_ENV === "production";
    return isProduction
      ? import.meta.env.PUBLIC_STREAM_URL
      : import.meta.env.PRIVATE_STREAM_URL;
  }
};

export default getStreamURL;
