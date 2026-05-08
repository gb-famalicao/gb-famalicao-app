import Image from "next/image";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gb-gray flex flex-col items-center justify-center gap-6 px-4">
      <Image
        src="/logo.webp"
        alt="Gracie Barra"
        width={120}
        height={120}
        className="rounded-xl"
      />
      <p className="text-gb-black text-center text-lg font-medium">
        Sem conexão. Volte a tentar quando estiver online.
      </p>
    </div>
  );
}
