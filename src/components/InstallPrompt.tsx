"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem("pwa-install-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem("pwa-install-dismissed", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3 shadow-lg">
      <Image
        src="/logo.webp"
        alt="Gracie Barra"
        width={40}
        height={40}
        className="shrink-0 rounded-lg"
      />
      <span className="flex-1 text-sm font-medium text-[#0A0A0A]">
        Instalar Gracie Barra Famalicão
      </span>
      <button
        onClick={handleInstall}
        className="shrink-0 rounded-lg bg-[#CC0000] px-3 py-1.5 text-sm font-medium text-white"
      >
        Instalar
      </button>
      <button
        onClick={handleDismiss}
        className="shrink-0 p-1 text-gray-400"
        aria-label="Fechar"
      >
        ✕
      </button>
    </div>
  );
}
