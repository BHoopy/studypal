/** Canonical public URL for a course — shareable without sign-in. */
export function getPublicCourseUrl(courseId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/explore/${courseId}`;
  }
  return `/explore/${courseId}`;
}

/** Short share link that redirects to the public course page. */
export function getShortCourseUrl(courseId: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/c/${courseId}`;
  }
  return `/c/${courseId}`;
}
