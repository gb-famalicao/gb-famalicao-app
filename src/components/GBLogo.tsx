import { cn } from "@/lib/utils";

interface GBLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GBLogo({ className, size = "md" }: GBLogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("font-black tracking-tight text-white", sizes[size])}>
        GRACIE BARRA VILA NOVA DE FAMALICÃO
      </div>
      <div className="h-0.5 w-full bg-white/40 my-1" />
      <div className="text-white/80 text-xs tracking-[0.3em] uppercase font-medium">
        Jiu-Jitsu
      </div>
    </div>
  );
}
