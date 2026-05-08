"use client";

import dynamic from "next/dynamic";

const TabletScanner = dynamic(() => import("./TabletScanner"), { ssr: false });

export function TabletScannerWrapper() {
  return <TabletScanner />;
}
