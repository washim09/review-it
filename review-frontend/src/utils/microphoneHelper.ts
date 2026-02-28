/**
 * Helper to get the correct microphone device (excluding Stereo Mix and other loopback devices)
 */

/**
 * Gets a real microphone device, excluding audio loopback devices
 * @returns Promise<string | undefined> Device ID of a real microphone, or undefined if using default
 */
export async function getRealMicrophoneDevice(): Promise<string | undefined> {
  try {
    // Get list of all audio input devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(device => device.kind === 'audioinput');
    
    console.log('[MICROPHONE] Available audio input devices:', audioInputs.map(d => ({
      deviceId: d.deviceId,
      label: d.label,
      groupId: d.groupId
    })));
    
    // Filter out known loopback/virtual devices
    const loopbackKeywords = [
      'stereo mix',
      'wave out',
      'what u hear',
      'loopback',
      'virtual audio',
      'voicemeeter',
      'cable output'
    ];
    
    const realMicrophones = audioInputs.filter(device => {
      const label = device.label.toLowerCase();
      return !loopbackKeywords.some(keyword => label.includes(keyword));
    });
    
    console.log('[MICROPHONE] Real microphone devices (excluding loopback):', realMicrophones.map(d => ({
      deviceId: d.deviceId,
      label: d.label
    })));
    
    // Prefer devices with "microphone" or "mic" in the name
    const preferredMicrophone = realMicrophones.find(device => {
      const label = device.label.toLowerCase();
      return label.includes('microphone') || label.includes('mic');
    });
    
    if (preferredMicrophone) {
      console.log('[MICROPHONE] Selected preferred microphone:', preferredMicrophone.label);
      return preferredMicrophone.deviceId;
    }
    
    // Otherwise use the first real microphone
    if (realMicrophones.length > 0) {
      console.log('[MICROPHONE] Selected first real microphone:', realMicrophones[0].label);
      return realMicrophones[0].deviceId;
    }
    
    // If all else fails, let browser choose default (but warn about it)
    console.warn('[MICROPHONE] Could not find specific microphone, using browser default');
    return undefined;
    
  } catch (error) {
    console.error('[MICROPHONE] Error enumerating devices:', error);
    return undefined;
  }
}

/**
 * Creates audio constraints with the correct microphone device
 * @returns Promise<MediaTrackConstraints> Audio constraints with proper device selection
 */
export async function getAudioConstraintsWithRealMicrophone(): Promise<MediaTrackConstraints | boolean> {
  const deviceId = await getRealMicrophoneDevice();
  
  const constraints: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  };
  
  // If we found a specific device, use it
  if (deviceId) {
    return {
      ...constraints,
      deviceId: { exact: deviceId }
    };
  }
  
  // Otherwise use default constraints
  return constraints;
}
