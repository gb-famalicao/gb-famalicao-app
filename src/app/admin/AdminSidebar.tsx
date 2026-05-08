"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Megaphone, Images, LayoutDashboard, LogOut, CalendarDays, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin",        label: "Dashboard", icon: LayoutDashboard, disabled: false, exact: true  },
  { href: "/admin/alunos", label: "Cadastros", icon: Users,           disabled: false, exact: false },
  { href: "/admin/turmas", label: "Turmas",    icon: CalendarDays,    disabled: false, exact: false },
  { href: "/admin/financeiro", label: "Financeiro", icon: DollarSign,  disabled: false, exact: false },
  { href: "/admin/avisos", label: "Avisos",    icon: Megaphone,       disabled: false, exact: false },
  { href: "/admin/albuns", label: "Galeria",   icon: Images,          disabled: false, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-56 bg-gb-black border-r border-white/10 z-30">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/logo.webp" alt="Gracie Barra" className="w-9 h-9 object-contain shrink-0" />
            <div>
              <p className="text-white font-black text-sm tracking-wide leading-tight">GRACIE BARRA FAMALICÃO</p>
              <p className="text-white/40 text-xs">Painel Admin</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, disabled, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={disabled ? "#" : href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-gb-blue text-white"
                    : disabled
                    ? "text-white/25 cursor-not-allowed"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                onClick={disabled ? (e) => e.preventDefault() : undefined}
              >
                <Icon size={18} />
                {label}
                {disabled && <span className="ml-auto text-xs text-white/25">Em breve</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="md:hidden sticky top-0 z-30 bg-gb-black border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.webp" alt="Gracie Barra" className="w-8 h-8 object-contain" />
          <span className="text-white font-bold text-sm tracking-wide">Admin</span>
        </div>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.filter((i) => !i.disabled).map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  active ? "bg-gb-blue text-white" : "text-white/50 hover:text-white"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
