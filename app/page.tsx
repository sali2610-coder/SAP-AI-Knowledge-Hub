import { Hero } from "@/components/landing/hero";
import { PersonaGrid } from "@/components/landing/persona-grid";
import { LibrarySection } from "@/components/landing/library-section";
import { KpiStrip } from "@/components/landing/kpi-strip";
import { S4Backdrop } from "@/components/landing/s4-backdrop";
import { SiteFooter } from "@/components/site/footer";
import { TopBar } from "@/components/site/topbar";
import { getCorpusStats } from "@/lib/rag-public";

export default function Home() {
  const stats = getCorpusStats();
  return (
    <div className="relative flex flex-1 flex-col">
      <S4Backdrop />
      <div className="relative z-10 flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1">
          <Hero />
          <KpiStrip stats={stats} />
          <PersonaGrid />
          <LibrarySection />
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
