// Type declarations
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
    type: string;
  };
  mozConnection?: any;
  webkitConnection?: any;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  }>;
}

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export async function getUserSystemDetails() {
  if (typeof window === 'undefined') return null;
  
  const systemInfo = {
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      resolution: `${window.screen.width}x${window.screen.height}`,
    },
    hardware: {
      cores: navigator.hardwareConcurrency || "Not available",
      memory: (navigator as NavigatorWithMemory)?.deviceMemory 
        ? `${(navigator as NavigatorWithMemory).deviceMemory} GB`
        : "Not available",
      platform: navigator.platform,
    },
    network: await getNetworkDetails(),
    battery: await getBatteryDetails(),
    locale: {
      languages: navigator.languages ? navigator.languages : [navigator.language],
      primaryLanguage: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    system: {
      os: getOperatingSystem(),
      browser: getBrowser(),
      userAgent: navigator.userAgent,
    },
    page: {
      referrer: document.referrer || "No referrer or direct access",
      url: window.location.href,
      title: document.title,
    },
    ipAddress: await getIPAddress(),
    timestamp: new Date().toISOString(),
  };

  return systemInfo;
}

async function getInternetSpeed(): Promise<{ downloadSpeed: string }> {
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) {
      return { downloadSpeed: 'Not available' };
    }

    const downloadSize = navigation.transferSize;
    const downloadTime = navigation.responseEnd - navigation.requestStart;
    const speedInMbps = ((downloadSize * 8) / downloadTime / 1000).toFixed(2);

    return {
      downloadSpeed: `${speedInMbps} Mbps`
    };
  } catch (error) {
    return { downloadSpeed: 'Not available' };
  }
}

async function getNetworkDetails() {
  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
  const speedInfo = await getInternetSpeed();

  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
      type: connection.type,
      online: navigator.onLine,
      downloadSpeed: speedInfo.downloadSpeed
    };
  }
  return {
    online: navigator.onLine,
    details: "Network API not supported",
    downloadSpeed: speedInfo.downloadSpeed
  };
}

async function getBatteryDetails() {
  const nav = navigator as NavigatorWithBattery;
  if (nav.getBattery) {
    try {
      const battery = await nav.getBattery();
      return {
        level: battery.level * 100 + "%",
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      };
    } catch (error) {
      return "Battery API failed";
    }
  }
  return "Battery API not supported";
}

async function getIPAddress() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return "Unable to fetch IP";
  }
}

function getOperatingSystem() {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "MacOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS")) return "iOS";
  return "Unknown";
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Opera")) return "Opera";
  return "Unknown";
}
