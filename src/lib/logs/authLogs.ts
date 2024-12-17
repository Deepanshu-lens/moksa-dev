import pb from "../pb";

async function getUserSystemDetails() {
  const systemInfo = {
    // Screen & Display Info
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      resolution: `${window.screen.width}x${window.screen.height}`,
    },

    // Hardware & Memory Info
    hardware: {
      cores: navigator.hardwareConcurrency || 'Not available',
      memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Not available',
      platform: navigator.platform,
    },

    // Network Info
    network: await getNetworkDetails(),

    // Battery Status
    battery: await getBatteryDetails(),

    // Locale, Language & Timezone
    locale: {
      languages: navigator.languages ? navigator.languages : [navigator.language],
      primaryLanguage: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },

    // System & Browser
    system: {
      os: getOperatingSystem(),
      browser: getBrowser(),
      userAgent: navigator.userAgent,
    },

    // Page Info
    page: {
      referrer: document.referrer || 'No referrer or direct access',
      url: window.location.href,
      title: document.title,
    },

    // IP Address
    ipAddress: await getIPAddress(),

    // Timestamp
    timestamp: new Date().toISOString(),
  };

  return systemInfo;
}

// Helper function for network details
async function getNetworkDetails() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (connection) {
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
      type: connection.type,
      online: navigator.onLine
    };
  }
  return {
    online: navigator.onLine,
    details: 'Network API not supported'
  };
}

// Helper function for battery details
async function getBatteryDetails() {
  if (navigator.getBattery) {
    try {
      const battery = await navigator.getBattery();
      return {
        level: (battery.level * 100) + '%',
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (error) {
      return 'Battery API failed';
    }
  }
  return 'Battery API not supported';
}

// Helper function for IP address
async function getIPAddress() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    return 'Unable to fetch IP';
  }
}

// Helper functions
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
    toast.error("Something went wrong. Please try again.");
  }
};
