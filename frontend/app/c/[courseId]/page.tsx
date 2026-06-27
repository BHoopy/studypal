import { redirect } from 'next/navigation';

/** Short share link — redirects to the public course page. */
export default async function ShortCourseLinkPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  redirect(`/explore/${courseId}`);
}
