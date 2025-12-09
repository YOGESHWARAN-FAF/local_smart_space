
/**
 * Simple toast notification
 * Types: success, error, info
 */
const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.zIndex = '10000';
  toast.style.transition = 'opacity 0.5s';
  toast.style.color = 'white';
  toast.style.fontWeight = '500';

  // Type-based styling
  if (type === 'success') {
    toast.style.backgroundColor = '#4CAF50'; // Green
  } else if (type === 'error') {
    toast.style.backgroundColor = '#F44336'; // Red
  } else {
    toast.style.backgroundColor = 'rgba(0,0,0,0.8)'; // Default dark
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 500);
  }, 3000);
};

/**
 * Safe fetch wrapper
 */
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    console.warn("Network request failed: ", error);
    showToast("ESP device not connected", "error");
    return null;
  }
}

/**
 * Check connection to ESP32
 * GET /ping
 */
export const checkConnection = async (ip, port) => {
  // Sanitize IP: remove http://, https://, and trailing slashes
  const cleanIP = ip.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const cleanPort = port.toString().replace(/[^0-9]/g, '');

  // Construct URL - ensure http:// is present
  const baseUrl = `http://${cleanIP}:${cleanPort}`;
  const url = `${baseUrl}/ping`;
  console.log(`Checking connection to: ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const text = await response.text();
    if (text.trim() !== 'pong') {
      throw new Error(`Unexpected response: "${text}"`);
    }

    showToast("Connected Successfully", "success");
    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Connection check failed:', error);
    showToast(`Connection Failed: ${error.message}`, "error");
    throw error;
  }
};

/**
 * Control a device
 * GET /device?venue=<venueId>&name=<deviceName>&state=<on|off>
 * GET /device?venue=<venueId>&name=<deviceName>&value=<0-100>
 */
export const controlDevice = async (ip, port, venueId, deviceName, params) => {
  if (!ip || !port) {
    throw new Error('ESP32 not connected');
  }

  const cleanIP = ip.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const cleanPort = port.toString().replace(/[^0-9]/g, '');

  const queryParams = new URLSearchParams({
    venue: venueId,
    name: deviceName,
    ...params,
  });

  const url = `http://${cleanIP}:${cleanPort}/device?${queryParams.toString()}`;
  console.log(`Sending command: ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  const response = await safeFetch(url, {
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response) {
    throw new Error('Network request failed');
  }

  if (!response.ok) {
    throw new Error(`Device control failed: ${response.statusText}`);
  }
  return await response.json();
};
