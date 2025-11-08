/**
 * Secure Storage using WebCrypto API
 * AES-GCM encryption with PBKDF2 key derivation
 */

const STORAGE_KEY = 'yt_consultant_api_key_encrypted';
const SALT_KEY = 'yt_consultant_salt';
const IV_KEY = 'yt_consultant_iv';

// Generate a device-specific key from browser fingerprint
async function getDeviceKey(): Promise<CryptoKey> {
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.colorDepth,
    screen.width + 'x' + screen.height,
  ].join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  
  // Get or create salt
  let salt = localStorage.getItem(SALT_KEY);
  if (!salt) {
    const saltArray = crypto.getRandomValues(new Uint8Array(16));
    salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(SALT_KEY, salt);
  }
  
  const saltArray = new Uint8Array(salt.match(/.{2}/g)!.map(byte => parseInt(byte, 16)));
  
  // Import key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    data,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltArray,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const secureStorage = {
  async saveApiKey(apiKey: string): Promise<boolean> {
    try {
      const key = await getDeviceKey();
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        data
      );
      
      // Store encrypted data and IV
      const encryptedArray = Array.from(new Uint8Array(encrypted));
      const ivArray = Array.from(iv);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedArray));
      localStorage.setItem(IV_KEY, JSON.stringify(ivArray));
      
      return true;
    } catch (error) {
      console.error('Failed to save API key:', error);
      return false;
    }
  },

  async getApiKey(): Promise<string | null> {
    try {
      const encryptedStr = localStorage.getItem(STORAGE_KEY);
      const ivStr = localStorage.getItem(IV_KEY);
      
      if (!encryptedStr || !ivStr) return null;
      
      const encrypted = new Uint8Array(JSON.parse(encryptedStr));
      const iv = new Uint8Array(JSON.parse(ivStr));
      
      const key = await getDeviceKey();
      
      // Decrypt
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encrypted
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      return null;
    }
  },

  clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(IV_KEY);
    // Keep salt for future use
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(IV_KEY);
    localStorage.removeItem(SALT_KEY);
  },
};
