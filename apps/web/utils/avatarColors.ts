// Predefined color palette for avatars (similar to Google's Material Design colors)
const AVATAR_COLORS = [
  "#F44336", // Red
  "#E91E63", // Pink
  "#9C27B0", // Purple
  "#673AB7", // Deep Purple
  "#3F51B5", // Indigo
  "#2196F3", // Blue
  "#03A9F4", // Light Blue
  "#00BCD4", // Cyan
  "#009688", // Teal
  "#4CAF50", // Green
  "#8BC34A", // Light Green
  "#CDDC39", // Lime
  "#FFEB3B", // Yellow
  "#FFC107", // Amber
  "#FF9800", // Orange
  "#FF5722", // Deep Orange
  "#795548", // Brown
  "#9E9E9E", // Grey
  "#607D8B", // Blue Grey
];

/**
 * Generates a consistent color for an avatar based on the user's name
 * @param name - The user's name or identifier
 * @returns A hex color string
 */
export function getAvatarColor(name: string): string {
  if (!name) {
    return AVATAR_COLORS[0]; // Default to first color if no name
  }

  // Create a simple hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Use the absolute value and modulo to get a consistent index
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

/**
 * Generates a gradient background for avatars
 * @param name - The user's name or identifier
 * @returns CSS gradient string
 */
export function getAvatarGradient(name: string): string {
  const baseColor = getAvatarColor(name);

  // Create a slightly darker shade for the gradient
  const darkerColor = adjustColorBrightness(baseColor, -20);

  return `linear-gradient(135deg, ${baseColor} 0%, ${darkerColor} 100%)`;
}

/**
 * Adjusts the brightness of a hex color
 * @param hex - Hex color string
 * @param percent - Percentage to adjust brightness (-100 to 100)
 * @returns Adjusted hex color string
 */
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Adjust brightness
  const factor = 1 + percent / 100;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));

  // Convert back to hex
  const newHex =
    "#" +
    newR.toString(16).padStart(2, "0") +
    newG.toString(16).padStart(2, "0") +
    newB.toString(16).padStart(2, "0");

  return newHex;
}

/**
 * Gets initials from a name (first letter of each word)
 * @param name - The user's name
 * @returns Initials string (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return "";

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}
