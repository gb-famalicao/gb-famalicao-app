"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./auth-actions";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const res = await login(email, senha);

    if (res.ok) {
      router.refresh();
      router.push("/perfil");
    } else {
      setErro("Email ou senha incorretos.");
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={carregando}
            className="pl-10"
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="senha">Senha</Label>
        <div className="relative">
          <Input
            id="senha"
            type="password"
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={carregando}
            className="pl-10"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      {erro && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={carregando}>
        {carregando ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Não tem conta?{" "}
        <Link href="/cadastro" className="text-gb-blue font-semibold hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
