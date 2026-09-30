"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  autenticar,
  mensagemErroLogin,
  guardarErroLogin,
  consumirErroLogin,
} from "@/lib/login-client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const erroParam = searchParams.get("erro");
    if (erroParam === "confirmacao") {
      setErro("Link inválido ou expirado. Tenta iniciar sessão ou solicita um novo link.");
      return;
    }
    // Erro guardado antes de uma navegação/recarregamento anterior
    const anterior = consumirErroLogin();
    if (anterior) setErro(anterior);
  }, [searchParams]);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const res = await autenticar(email, senha);

      if (!res.ok) {
        setErro(mensagemErroLogin(res.tipoErro));
        return;
      }

      // Navegação dura: garante que o browser reenvia os cookies recém-criados
      // antes do middleware decidir. router.push() não servia em Safari antigo.
      window.location.assign("/perfil");
    } catch (e) {
      const mensagem = e instanceof Error ? e.message : "Erro inesperado ao entrar.";
      setErro(mensagem);
      guardarErroLogin(mensagem);
    } finally {
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
            placeholder="teu@email.com"
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
        <div className="flex items-center justify-between">
          <Label htmlFor="senha">Senha</Label>
          <Link
            href="/esqueci-senha"
            className="text-xs text-gb-blue hover:underline"
          >
            Esqueci a senha
          </Link>
        </div>
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
            A entrar…
          </>
        ) : (
          "Entrar"
        )}
      </Button>

      <p className="text-center text-sm text-gray-500">
        Não tem conta?{" "}
        <Link href="/cadastro" className="text-gb-blue font-semibold hover:underline">
          Registe-se
        </Link>
      </p>

      <p className="text-center text-sm text-gray-500">
        <Link href="/aula-experimental" className="text-gb-blue font-semibold hover:underline">
          Agende sua aula experimental grátis
        </Link>
      </p>
    </form>
  );
}
