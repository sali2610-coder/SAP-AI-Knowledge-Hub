import { TopBar } from "@/components/site/topbar";
import { SiteFooter } from "@/components/site/footer";
import { BookmarksList } from "@/components/library/bookmarks-list";

export const dynamic = "force-static";

export default function BookmarksPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <main className="flex-1">
        <BookmarksList />
      </main>
      <SiteFooter />
    </div>
  );
}
