import SubwayCanvas from "./components/SubwayCanvas";
import Overlay from "./components/Overlay";
import LineSwitcher from "./components/LineSwitcher";
import Bgm from "./components/Bgm";
import LineLegend from "./components/LineLegend";
import TamakiSprite from "./components/TamakiSprite";
import { resolveFocus, type UrlParams } from "@/lib/lines";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const params: UrlParams = { l: pickString(raw.l) };
  const focus = resolveFocus(params);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <SubwayCanvas focus={focus} />
      <LineLegend focus={focus} />
      <Overlay focus={focus} />
      <LineSwitcher active={focus} />
      <Bgm focus={focus} />
      <TamakiSprite />
    </main>
  );
}

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}
