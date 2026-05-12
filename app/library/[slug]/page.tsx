import { notFound } from "next/navigation";
import { TopBar } from "@/components/site/topbar";
import { BookReader } from "@/components/library/book-reader";
import { loadBook } from "@/lib/book-loader";
import { kbIndex } from "@/lib/kb";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return kbIndex.books.map((b) => ({ slug: b.slug }));
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await loadBook(slug);
  if (!doc) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <BookReader document={doc} />
    </div>
  );
}
