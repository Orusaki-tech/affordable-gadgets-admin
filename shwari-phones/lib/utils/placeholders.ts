/**
 * Utility functions for placeholder images and videos
 */

/**
 * Get a placeholder image URL
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param text - Optional text to display on placeholder
 * @returns Placeholder image URL
 */
export function getPlaceholderImage(
  width: number = 400,
  height: number = 400,
  text: string = 'No Image'
): string {
  // Using placehold.co for reliable placeholder images
  const encodedText = encodeURIComponent(text);
  return `https://placehold.co/${width}x${height}/e5e7eb/6b7280?text=${encodedText}`;
}

/**
 * Get a placeholder product image
 * @param productName - Optional product name for the placeholder
 * @returns Placeholder product image URL
 */
export function getPlaceholderProductImage(productName?: string): string {
  const text = productName ? `Product: ${productName}` : 'Product Image';
  return getPlaceholderImage(400, 400, text);
}

/**
 * Get a placeholder banner/promotion image
 * @param title - Optional title for the placeholder
 * @returns Placeholder banner image URL
 */
export function getPlaceholderBannerImage(title?: string): string {
  const text = title ? `Promotion: ${title}` : 'Special Offer';
  return getPlaceholderImage(800, 400, text);
}

/**
 * Get a placeholder video thumbnail
 * @param videoTitle - Optional video title
 * @returns Placeholder video thumbnail URL
 */
export function getPlaceholderVideoThumbnail(videoTitle?: string): string {
  const text = videoTitle ? `Video: ${videoTitle}` : 'Video';
  return getPlaceholderImage(640, 360, text);
}

/**
 * Get a placeholder unit image
 * @param color - Optional color name
 * @returns Placeholder unit image URL
 */
export function getPlaceholderUnitImage(color?: string): string {
  const text = color ? `Unit: ${color}` : 'Unit Image';
  return getPlaceholderImage(400, 400, text);
}

/**
 * Check if an image URL is a placeholder
 * @param url - Image URL to check
 * @returns True if the URL is a placeholder
 */
export function isPlaceholderImage(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes('placehold.co') || 
         url.includes('placeholder') || 
         url.startsWith('/placeholder');
}

/**
 * Convert YouTube URL to embed format
 * @param url - YouTube URL (watch, short, or embed format)
 * @returns YouTube embed URL
 */
export function convertToYouTubeEmbed(url: string | null | undefined): string {
  if (!url) {
    return getPlaceholderVideoUrl();
  }
  
  // If already an embed URL, return as is
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Extract video ID from various YouTube URL formats
  let videoId: string | null = null;
  
  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  }
  
  // Format: https://youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) {
    videoId = shortMatch[1];
  }
  
  // Format: https://www.youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/embed\/([^?&]+)/);
  if (embedMatch) {
    videoId = embedMatch[1];
  }
  
  // If we found a video ID, convert to embed URL
  if (videoId) {
    // Remove any additional parameters from video ID
    videoId = videoId.split('&')[0].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // If we can't parse it, return placeholder
  return getPlaceholderVideoUrl();
}

/**
 * Get a dummy video URL for testing (YouTube placeholder)
 * @param videoTitle - Optional video title for context
 * @returns A placeholder YouTube video URL
 */
export function getPlaceholderVideoUrl(videoTitle?: string): string {
  // Using a short, reliable YouTube video as placeholder
  // This is a safe, short video that works well as a placeholder
  return 'https://www.youtube.com/embed/jNQXAC9IVRw';
}

/**
 * Get multiple dummy video URLs for showcasing
 * @param count - Number of dummy videos to return
 * @returns Array of placeholder YouTube video URLs
 */
export function getPlaceholderVideoUrls(count: number = 3): string[] {
  // Different short YouTube videos for variety
  const placeholderVideos = [
    'https://www.youtube.com/embed/jNQXAC9IVRw', // Short video
    'https://www.youtube.com/embed/dQw4w9WgXcQ', // Another short video
    'https://www.youtube.com/embed/9bZkp7q19f0', // Another option
  ];
  
  const videos: string[] = [];
  for (let i = 0; i < count; i++) {
    videos.push(placeholderVideos[i % placeholderVideos.length]);
  }
  return videos;
}

/**
 * Get a gradient background style for missing images
 * @param index - Optional index for color variation
 * @returns CSS gradient string
 */
export function getGradientBackground(index: number = 0): string {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];
  return gradients[index % gradients.length];
}

