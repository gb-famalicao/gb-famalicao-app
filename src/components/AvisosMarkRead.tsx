"use client";

import { useEffect } from "react";

export function AvisosMarkRead() {
  useEffect(() => {
    localStorage.setItem("avisos_last_seen", new Date().toISOString());
  }, []);
  return null;
}
