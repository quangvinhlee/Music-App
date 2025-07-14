/**
 * Utility functions for formatting various data types
 */

/**
 * Format duration in seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted time string (e.g., "3:45")
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";

  const totalSeconds = Math.round(seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format time in seconds to MM:SS format (alias for formatDuration)
 * @param time - Time in seconds
 * @returns Formatted time string (e.g., "3:45")
 */
export function formatTime(time: number): string {
  return formatDuration(time);
}

/**
 * Format large numbers with K/M suffixes
 * @param count - The number to format
 * @returns Formatted count string (e.g., "1.2K", "2.5M")
 */
export function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

/**
 * Format number to locale string with commas
 * @param num - The number to format
 * @returns Formatted number string (e.g., "1,234,567")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format file size in bytes to human readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.2 MB", "500 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format percentage with specified decimal places
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string (e.g., "85.5%")
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a date to relative time string
 * @param dateString - ISO date string or Date object
 * @returns Relative time string (e.g., "2 days ago", "1 week ago")
 */
export function getReleaseDate(
  dateString: string | Date | null | undefined
): string {
  if (!dateString) return "Unknown date";

  const createdDate = new Date(dateString);
  if (isNaN(createdDate.getTime())) return "Unknown date";

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }

  const years = Math.floor(diffDays / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

/**
 * Format a played date to relative time string
 * @param dateString - ISO date string or Date object
 * @returns Relative time string (e.g., "Played 2 days ago", "Played 1 week ago")
 */
export function getPlayedDate(
  dateString: string | Date | null | undefined
): string {
  if (!dateString) return "Unknown";

  const playedDate = new Date(dateString);
  if (isNaN(playedDate.getTime())) return "Unknown";

  const now = new Date();

  // Compare dates by day (ignoring time)
  const playedDay = new Date(
    playedDate.getFullYear(),
    playedDate.getMonth(),
    playedDate.getDate()
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = today.getTime() - playedDay.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Played today";
  if (diffDays === 1) return "Played yesterday";
  if (diffDays > 1 && diffDays < 7) return `Played ${diffDays} days ago`;
  if (diffDays >= 7 && diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? "Played 1 week ago" : `Played ${weeks} weeks ago`;
  }
  if (diffDays >= 30 && diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "Played 1 month ago" : `Played ${months} months ago`;
  }
  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? "Played 1 year ago" : `Played ${years} years ago`;
  }

  return "Played today";
}
