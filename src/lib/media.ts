const VIDEO_EXTS = /\.(mp4|webm|mov|ogg|quicktime|x-msvideo|x-matroska)(\?.*)?$/i;

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  // Backend names all video files as video__<uuid>.<ext>
  if (/\/video__[^/]+$/i.test(url)) return true;
  return VIDEO_EXTS.test(url);
}
