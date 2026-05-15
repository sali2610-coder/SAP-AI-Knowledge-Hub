import { notFound } from "next/navigation";
import { TopBar } from "@/components/site/topbar";
import { BookReader } from "@/components/library/book-reader";
import { loadBook } from "@/lib/book-loader";
import { kbIndex } from "@/lib/kb";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return kbIndex.books.map((b) => ({ slug: b.slug }));
}

// Force-light reading surface. The reader has its own premium iPad-style
// theme regardless of the global dark toggle. We override the shadcn CSS
// vars only for this subtree, so the rest of the app still respects the
// user's theme preference.
const READER_LIGHT_THEME: React.CSSProperties & Record<string, string> = {
  ["--background"]: "oklch(0.985 0.003 250)",
  ["--foreground"]: "oklch(0.18 0.02 250)",
  ["--card"]: "oklch(1 0 0)",
  ["--card-foreground"]: "oklch(0.18 0.02 250)",
  ["--popover"]: "oklch(1 0 0)",
  ["--popover-foreground"]: "oklch(0.18 0.02 250)",
  ["--muted"]: "oklch(0.96 0.005 250)",
  ["--muted-foreground"]: "oklch(0.45 0.02 250)",
  ["--border"]: "oklch(0.91 0.01 250)",
  ["--input"]: "oklch(0.92 0.01 250)",
  ["--primary"]: "oklch(0.55 0.18 251)",
  ["--primary-foreground"]: "oklch(0.985 0 0)",
  ["--accent"]: "oklch(0.74 0.16 60)",
  colorScheme: "light",
};

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await loadBook(slug);
  if (!doc) notFound();

  return (
    <div className="flex flex-1 flex-col" style={READER_LIGHT_THEME}>
      <TopBar />
      <BookReader document={doc} />
    </div>
  );
}
