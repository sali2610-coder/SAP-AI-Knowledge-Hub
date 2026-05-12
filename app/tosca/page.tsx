import { TopBar } from "@/components/site/topbar";
import { SiteFooter } from "@/components/site/footer";
import { ToscaFxBuilder } from "@/components/tosca/tosca-fx";

export const dynamic = "force-static";

export default function ToscaPage() {
  return (
    <div className="flex flex-1 flex-col">
      <TopBar />
      <main className="flex-1">
        <ToscaFxBuilder />
      </main>
      <SiteFooter />
    </div>
  );
}
