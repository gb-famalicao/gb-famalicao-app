import { createAdminClient } from "@/lib/supabase/admin";
import type { Album } from "@/lib/types";
import { AlbunsView } from "./AlbunsView";

export default async function AlbunsPage() {
  const admin = createAdminClient();

  const { data: albuns } = await admin
    .from("albuns")
    .select("*, fotos_count:fotos(count)")
    .order("created_at", { ascending: false });

  const normalized: Album[] = (albuns ?? []).map((a: Record<string, unknown>) => ({
    ...a,
    fotos_count: Array.isArray(a.fotos_count)
      ? (a.fotos_count[0] as { count: number })?.count ?? 0
      : 0,
  })) as Album[];

  const semCapa = normalized.filter((a) => !a.capa_url).map((a) => a.id);

  const covers: Record<string, string> = {};
  if (semCapa.length > 0) {
    const { data: fotos } = await admin
      .from("fotos")
      .select("album_id, url")
      .in("album_id", semCapa)
      .order("created_at", { ascending: true });

    for (const f of fotos ?? []) {
      if (!covers[f.album_id]) covers[f.album_id] = f.url;
    }
  }

  return <AlbunsView albuns={normalized} covers={covers} />;
}
