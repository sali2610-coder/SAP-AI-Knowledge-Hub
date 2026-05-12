import { Hero } from "@/components/landing/hero";
import { AgentGrid } from "@/components/landing/agent-grid";
import { LibrarySection } from "@/components/landing/library-section";
import { SiteFooter } from "@/components/site/footer";
import { TopBar } from "@/components/site/topbar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <main className="flex-1">
        <Hero />
        <AgentGrid />
        <LibrarySection />
      </main>
      <SiteFooter />
    </div>
  );
}
