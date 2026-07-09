/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function generateId(): string {
  // Generates a random string of 12 alphanumeric characters
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `note_${result}`;
}
