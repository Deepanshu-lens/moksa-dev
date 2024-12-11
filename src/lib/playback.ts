const getPlaybackURL = () => {
  if (typeof window === "undefined") {
    // Server-side logic
    return import.meta.env.PUBLIC_PLAYBACK_API_URL;
  } else if (window && (window as any).api?.navigate) {
    // Electron environment (client-side)
    return import.meta.env.PRIVATE_PLAYBACK_API_URL;
  } else {
    const isProduction = import.meta.env.PUBLIC_ENV === "production";
    return isProduction
      ? import.meta.env.PUBLIC_POCKETBASE_URL
      : import.meta.env.PRIVATE_PLAYBACK_API_URL;
  }
};

export default getPlaybackURL;
