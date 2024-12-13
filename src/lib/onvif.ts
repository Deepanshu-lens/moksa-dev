const getOnvifUrl = () => {
  if (typeof window === "undefined") {
    // Server-side logic
    return import.meta.env.PUBLIC_ONVIF_DEVICES_BASE_URL;
  } else if (window && (window as any).api?.navigate) {
    // Electron environment (client-side)
    return import.meta.env.PUBLIC_OFFLINE_ONVIF_URL;
  } else {
    // Regular client-side logic (browser)
    const hostname = window.location.hostname;
    const isProduction = import.meta.env.PUBLIC_ENV === "production";
    return isProduction
      ? import.meta.env.PUBLIC_ONVIF_DEVICES_BASE_URL
      // : import.meta.env.PUBLIC_OFFLINE_ONVIF_URL;
      : `http://${hostname}:2323`;
  }
};

export default getOnvifUrl;