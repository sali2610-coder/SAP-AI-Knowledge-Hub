import { TopBar } from "@/components/site/topbar";
import { SiteFooter } from "@/components/site/footer";
import { LibraryGrid } from "@/components/library/library-grid";
import { kbIndex } from "@/lib/kb";

export const dynamic = "force-static";

export default function LibraryIndexPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <LibraryGrid books={kbIndex.books} />
      </main>
      <SiteFooter />
    </div>
  );
}
