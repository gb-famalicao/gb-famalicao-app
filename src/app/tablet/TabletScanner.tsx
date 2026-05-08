"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FaixaBJJ, inferCategoria } from "@/components/FaixaBJJ";
import type { CorFaixa } from "@/lib/types";

type Estado = "camera" | "processando" | "sucesso" | "erro";

interface AlunoInfo {
  nome_completo: string;
  foto_url: string | null;
  cor_faixa: CorFaixa | null;
  graus: number;
}

interface ErroInfo {
  titulo: string;
  mensagem: string;
}

export default function TabletScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const processandoRef = useRef(false);

  const [estado, setEstado] = useState<Estado>("camera");
  const [cameraOk, setCameraOk] = useState(false);
  const [cameraErro, setCameraErro] = useState("");
  const [alunoInfo, setAlunoInfo] = useState<AlunoInfo | null>(null);
  const [erroInfo, setErroInfo] = useState<ErroInfo | null>(null);

  const voltarCamera = useCallback(() => {
    processandoRef.current = false;
    setEstado("camera");
    setAlunoInfo(null);
    setErroInfo(null);
  }, []);

  const processarToken = useCallback(
    async (token: string) => {
      if (processandoRef.current) return;
      processandoRef.current = true;
      setEstado("processando");

      try {
        const supabase = createClient();
        const { data, error } = await supabase.rpc("registrar_presenca_por_token", {
          p_token: token,
        });

        if (error) {
          const msg = (error.message ?? "").toLowerCase();
          const code = error.code ?? "";

          let titulo = "Não Registrado";
          let mensagem = "Não foi possível registrar a presença.";

          if (msg.includes("expir") || msg.includes("expired")) {
            titulo = "QR Code Expirado";
            mensagem = "O código expirou. Peça ao aluno gerar um novo.";
          } else if (
            code === "23505" ||
            msg.includes("já registr") ||
            msg.includes("already") ||
            msg.includes("duplicate")
          ) {
            titulo = "Já Registrado";
            mensagem = "Presença já registrada hoje para este aluno.";
          } else if (
            msg.includes("inválid") ||
            msg.includes("invalid") ||
            msg.includes("não encontr") ||
            msg.includes("not found")
          ) {
            titulo = "QR Code Inválido";
            mensagem = "Código não reconhecido. Peça ao aluno gerar um novo.";
          }

          setErroInfo({ titulo, mensagem });
          setEstado("erro");
          setTimeout(voltarCamera, 3000);
          return;
        }

        // RPC returns TABLE → array; pick first row
        const row = Array.isArray(data) ? data[0] : data;
        if (row?.sucesso && row.aluno_nome) {
          setAlunoInfo({
            nome_completo: row.aluno_nome,
            foto_url:      row.aluno_foto  ?? null,
            cor_faixa:     row.aluno_faixa ?? null,
            graus:         row.aluno_graus ?? 0,
          });
        }

        setEstado("sucesso");
        setTimeout(voltarCamera, 5000);
      } catch {
        setErroInfo({ titulo: "Erro", mensagem: "Erro inesperado. Tente novamente." });
        setEstado("erro");
        setTimeout(voltarCamera, 3000);
      }
    },
    [voltarCamera]
  );

  useEffect(() => {
    let mounted = true;

    async function iniciarCamera() {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (!mounted || !videoRef.current) return;

        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (result && !processandoRef.current) {
              processarToken(result.getText());
            }
          }
        );

        if (mounted) {
          controlsRef.current = controls;
          setCameraOk(true);
        } else {
          controls.stop();
        }
      } catch (err) {
        if (mounted) {
          const msg = err instanceof Error ? err.message : "";
          setCameraErro(
            msg.includes("Permission") || msg.includes("NotAllowed")
              ? "Permissão de câmera negada. Verifique as configurações do navegador."
              : "Não foi possível iniciar a câmera."
          );
        }
      }
    }

    iniciarCamera();

    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
  }, [processarToken]);

  return (
    <div className="fixed inset-0 bg-gb-black overflow-hidden">
      {/* Camera feed — always mounted so @zxing keeps the stream alive */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          estado === "camera" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── CAMERA STATE ── */}
      {estado === "camera" && (
        <div className="absolute inset-0 flex flex-col">
          {/* Top bar */}
          <div className="bg-gradient-to-b from-black/80 to-transparent px-8 pt-8 pb-16">
            <div className="flex items-center gap-3">
              <img src="/logo.webp" alt="Gracie Barra" className="w-12 h-12 object-contain" />
              <div>
                <p className="text-white font-bold text-xl tracking-wide">GRACIE BARRA</p>
                <p className="text-white/50 text-sm">Leitor de Presença</p>
              </div>
            </div>
          </div>

          {/* Scan frame */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-72 h-72">
              {/* Frame border */}
              <div className="absolute inset-0 border-2 border-white/20 rounded-2xl" />
              {/* Corners */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-gb-blue rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-gb-blue rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-gb-blue rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-gb-blue rounded-br-2xl" />
              {/* Scan line */}
              {cameraOk && (
                <div className="absolute left-4 right-4 h-0.5 bg-gb-blue shadow-[0_0_8px_#CC0000] animate-scan-line" />
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="bg-gradient-to-t from-black/80 to-transparent px-8 pt-16 pb-10 text-center">
            {cameraErro ? (
              <p className="text-red-400 font-medium">{cameraErro}</p>
            ) : !cameraOk ? (
              <div className="flex items-center justify-center gap-2 text-white/50">
                <Loader2 size={18} className="animate-spin" />
                <span>Iniciando câmera...</span>
              </div>
            ) : (
              <p className="text-white/60 text-lg">
                Aponte a câmera para o QR Code do aluno
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── PROCESSANDO ── */}
      {estado === "processando" && (
        <div className="absolute inset-0 bg-gb-black/95 flex flex-col items-center justify-center gap-6">
          <Loader2 size={72} className="animate-spin text-gb-blue" />
          <p className="text-white text-2xl font-bold">Registrando presença...</p>
        </div>
      )}

      {/* ── SUCESSO ── */}
      {estado === "sucesso" && (
        <div className="absolute inset-0 bg-green-600 flex flex-col items-center justify-center p-10">
          <CheckCircle2 size={96} className="text-white mb-6 drop-shadow-lg" />
          <h1 className="text-white font-black text-5xl tracking-tight mb-1">PRESENÇA</h1>
          <h2 className="text-white font-black text-5xl tracking-tight mb-10">REGISTRADA!</h2>

          {alunoInfo ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 flex flex-col items-center gap-5 w-full max-w-md border border-white/30">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-full overflow-hidden bg-white/30 border-4 border-white/50 flex items-center justify-center">
                {alunoInfo.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={alunoInfo.foto_url}
                    alt={alunoInfo.nome_completo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-black text-4xl">
                    {alunoInfo.nome_completo
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-white font-bold text-3xl text-center leading-tight">
                {alunoInfo.nome_completo}
              </p>
              {alunoInfo.cor_faixa && (
                <FaixaBJJ faixa={alunoInfo.cor_faixa} graus={alunoInfo.graus} categoria={inferCategoria(alunoInfo.cor_faixa)} tamanho="lg" showLabel />
              )}
            </div>
          ) : (
            <div className="bg-white/20 rounded-3xl px-10 py-6 text-center border border-white/30">
              <p className="text-white text-2xl font-semibold">Bom treino! 🥋</p>
            </div>
          )}

          <p className="text-white/50 text-base mt-8">Voltando em instantes...</p>
        </div>
      )}

      {/* ── ERRO ── */}
      {estado === "erro" && (
        <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center p-10">
          <XCircle size={96} className="text-white mb-6 drop-shadow-lg" />
          <h1 className="text-white font-black text-5xl tracking-tight mb-4 text-center">
            {erroInfo?.titulo ?? "Erro"}
          </h1>
          <p className="text-white/80 text-2xl text-center leading-snug max-w-md">
            {erroInfo?.mensagem}
          </p>
          <p className="text-white/40 text-base mt-10">Voltando automaticamente...</p>
        </div>
      )}
    </div>
  );
}
