import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Album, Foto } from "@/lib/types";
import { FotosView } from "./FotosView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FotosPage({ params }: Props) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: album }, { data: fotos }] = await Promise.all([
    admin.from("albuns").select("*").eq("id", id).single(),
    admin.from("fotos").select("*").eq("album_id", id).order("created_at", { ascending: true }),
  ]);

  if (!album) notFound();

  return <FotosView album={album as Album} fotos={(fotos ?? []) as Foto[]} />;
}
