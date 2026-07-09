/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helpers for base64 conversions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const encryptionService = {
  /**
   * Derive an AES-GCM key from a plain text password and salt using PBKDF2
   */
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);

    // Import password as raw key material
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      passwordBytes,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // Derive AES-GCM 256-bit key
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  /**
   * Encrypt a string with a password. Returns the ciphertext, salt, and IV as Base64 strings.
   */
  async encrypt(text: string, password: string): Promise<{ ciphertext: string; salt: string; iv: string }> {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(text);

    // Generate random 16-byte salt and 12-byte IV (nonce)
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Derive key
    const key = await this.deriveKey(password, salt);

    // Encrypt content
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      dataBytes
    );

    return {
      ciphertext: arrayBufferToBase64(encryptedBuffer),
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv),
    };
  },

  /**
   * Decrypt a string using the ciphertext, password, salt, and IV (all in Base64 where applicable).
   */
  async decrypt(ciphertextBase64: string, password: string, saltBase64: string, ivBase64: string): Promise<string> {
    try {
      const ciphertext = base64ToArrayBuffer(ciphertextBase64);
      const salt = new Uint8Array(base64ToArrayBuffer(saltBase64));
      const iv = new Uint8Array(base64ToArrayBuffer(ivBase64));

      // Derive key
      const key = await this.deriveKey(password, salt);

      // Decrypt content
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (err) {
      throw new Error('Incorrect password or corrupted encrypted content.');
    }
  },
};
