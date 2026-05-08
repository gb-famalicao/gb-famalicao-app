"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mascararTelefonePT } from "@/lib/utils";

// ─── Palette ────────────────────────────────────────────────
const C = {
  red: "#FF0100",
  redDark: "#cc0100",
  blue: "#030A8C",
  navy: "#253659",
  navyDark: "#1a2740",
  bg: "#F2F2F2",
  ink: "#212121",
  ink2: "#52525a",
  ink3: "#9a9aa3",
  line: "#e4e4e8",
};

// ─── Shared primitives ───────────────────────────────────────

function PrimaryBtn({
  children,
  disabled,
  loading,
  onClick,
  type = "button",
  dark = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  dark?: boolean;
}) {
  const inactive = disabled || loading;
  return (
    <button
      type={type}
      disabled={!!inactive}
      onClick={onClick}
      style={{
        height: 56,
        borderRadius: 28,
        background: inactive ? (dark ? "rgba(255,255,255,0.15)" : C.line) : C.red,
        color: inactive ? (dark ? "rgba(255,255,255,0.45)" : C.ink3) : "#fff",
        border: "none",
        cursor: inactive ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "inherit",
        fontSize: 17,
        fontWeight: 600,
        letterSpacing: -0.2,
        width: "100%",
        boxShadow: inactive ? "none" : "0 8px 22px rgba(255,1,0,0.32)",
        transition: "opacity 0.15s",
      }}
    >
      {loading ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : children}
    </button>
  );
}

function BackBar({ progress, onBack }: { progress: number; onBack: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 22px 0" }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          background: "#fff",
          border: `1px solid ${C.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
          <path d="M9 2L2 9l7 7" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: C.line, overflow: "hidden" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: C.red,
            borderRadius: 2,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function Eyebrow({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, monospace",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1.6,
        textTransform: "uppercase",
        color: color ?? C.red,
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  focused,
  children,
}: {
  label: string;
  focused?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: focused ? C.red : C.ink2,
          letterSpacing: 0.3,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function TextInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  required,
  disabled,
  suffix,
  inputMode,
}: {
  id?: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  suffix?: React.ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        inputMode={inputMode}
        style={{
          height: 50,
          borderRadius: 12,
          background: "#fff",
          border: `${focused ? 2 : 1.5}px solid ${focused ? C.ink : C.line}`,
          padding: "0 14px",
          paddingRight: suffix ? 44 : 14,
          display: "flex",
          alignItems: "center",
          fontSize: 16,
          fontWeight: 500,
          width: "100%",
          boxSizing: "border-box",
          outline: "none",
          fontFamily: "inherit",
          color: C.ink,
        }}
      />
      {suffix && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {suffix}
        </div>
      )}
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(255,1,0,0.07)",
        border: `1px solid rgba(255,1,0,0.2)`,
        fontSize: 14,
        color: C.redDark,
        lineHeight: 1.45,
      }}
    >
      {msg}
    </div>
  );
}

// ─── Screen shell ────────────────────────────────────────────

function Shell({
  children,
  dark = false,
  bg,
}: {
  children: React.ReactNode;
  dark?: boolean;
  bg?: string;
}) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: bg ?? (dark ? C.ink : C.bg),
        display: "flex",
        flexDirection: "column",
        paddingBottom: 34,
        position: "relative",
        overflow: "hidden",
        fontFamily: "-apple-system, system-ui, sans-serif",
        color: dark ? "#fff" : C.ink,
      }}
    >
      {children}
    </div>
  );
}

// ─── Step 0 — Welcome ────────────────────────────────────────

function StepWelcome({ onCriar, onLogin }: { onCriar: () => void; onLogin: () => void }) {
  return (
    <Shell dark bg={C.ink}>
      {/* Facade background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/fachada.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.35,
          zIndex: 0,
        }}
      />
      {/* Dark gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(rgba(33,33,33,0.55) 0%, rgba(33,33,33,0.7) 50%, rgba(33,33,33,0.95) 100%)",
          zIndex: 1,
        }}
      />
      {/* Red glow */}
      <div
        style={{
          position: "absolute",
          top: -140,
          right: -160,
          width: 460,
          height: 460,
          borderRadius: "50%",
          background: C.red,
          opacity: 0.18,
          filter: "blur(60px)",
          zIndex: 1,
        }}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 32px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Logo row */}
        <div style={{ paddingTop: 64, display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src="/logo.webp"
            alt="Gracie Barra"
            width={44}
            height={44}
            style={{ borderRadius: 22, background: "#fff", objectFit: "contain" }}
          />
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 0.4,
                color: "#fff",
                textTransform: "uppercase",
              }}
            >
              Gracie Barra
            </span>
            <span
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: 1.2,
                color: "rgba(255,255,255,0.7)",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              Famalicão · Portugal
            </span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <Eyebrow>Brazilian Jiu-Jitsu</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(44px, 13vw, 54px)",
            fontWeight: 800,
            lineHeight: 0.96,
            letterSpacing: -2,
            margin: "14px 0 0",
            color: "#fff",
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        >
          Bem-vindo
          <br />à <span style={{ color: C.red }}>família.</span>
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.75)",
            margin: "20px 0 0",
            maxWidth: 320,
          }}
        >
          Marca aulas, segue a tua progressão e mantém-te ligado à academia.
        </p>

        <div style={{ height: 36 }} />

        <button
          type="button"
          onClick={onCriar}
          style={{
            height: 56,
            borderRadius: 28,
            background: C.red,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 17,
            fontWeight: 600,
            boxShadow: "0 8px 22px rgba(255,1,0,0.4)",
            fontFamily: "inherit",
            width: "100%",
          }}
        >
          Criar conta
        </button>
        <div style={{ height: 12 }} />
        <button
          type="button"
          onClick={onLogin}
          style={{
            height: 56,
            borderRadius: 28,
            border: "1.5px solid rgba(255,255,255,0.4)",
            color: "#fff",
            cursor: "pointer",
            fontSize: 17,
            fontWeight: 600,
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            fontFamily: "inherit",
            width: "100%",
          }}
        >
          Já tenho conta
        </button>

        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            margin: "20px 0 8px",
            lineHeight: 1.5,
          }}
        >
          Ao continuar aceita os Termos
          <br />e Política de Privacidade.
        </p>
      </div>
    </Shell>
  );
}

// ─── Step 1 — Email + senha ───────────────────────────────────

function StepEmail({
  email,
  senha,
  erro,
  loading,
  onEmail,
  onSenha,
  onBack,
  onSubmit,
}: {
  email: string;
  senha: string;
  erro: string;
  loading: boolean;
  onEmail: (v: string) => void;
  onSenha: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <Shell>
      <BackBar progress={33} onBack={onBack} />
      <div
        style={{
          padding: "32px 28px 0",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Eyebrow>Passo 1 de 3</Eyebrow>
        <h1
          style={{
            fontSize: 38,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1.2,
            margin: "12px 0 12px",
          }}
        >
          Qual é o teu
          <br />
          email?
        </h1>
        <p style={{ fontSize: 15, color: C.ink2, lineHeight: 1.5, margin: 0 }}>
          Vamos enviar-te um código para confirmar.
        </p>

        <div style={{ height: 36 }} />

        <Field label="Email" focused={email.length > 0}>
          <TextInput
            type="email"
            placeholder="joao.silva@gmail.com"
            value={email}
            onChange={onEmail}
            autoComplete="email"
            required
            disabled={loading}
          />
        </Field>

        <Field label="Criar senha" focused={senha.length > 0}>
          <TextInput
            type={showPwd ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            value={senha}
            onChange={onSenha}
            autoComplete="new-password"
            required
            disabled={loading}
            suffix={
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: C.ink3 }}
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
        </Field>

        {erro && <ErrorBanner msg={erro} />}

        <div style={{ flex: 1 }} />

        <PrimaryBtn
          loading={loading}
          disabled={!email || senha.length < 6}
          onClick={onSubmit}
        >
          Enviar código
        </PrimaryBtn>

        <div style={{ marginTop: 16, fontSize: 13, color: C.ink3, textAlign: "center", lineHeight: 1.5 }}>
          Usamos o teu email apenas para confirmar
          <br />a inscrição e avisos da academia.
        </div>
      </div>
    </Shell>
  );
}

// ─── Step 2 — OTP verification ───────────────────────────────

function StepOtp({
  email,
  erro,
  loading,
  onBack,
  onVerify,
  onReenviar,
  countdown,
}: {
  email: string;
  erro: string;
  loading: boolean;
  onBack: () => void;
  onVerify: (code: string) => void;
  onReenviar: () => void;
  countdown: number;
}) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");

  function handleChange(i: number, val: string) {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d) && char) {
      onVerify(next.join(""));
    }
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
    if (pasted.length === 6) onVerify(pasted);
  }

  return (
    <Shell>
      <BackBar progress={66} onBack={onBack} />
      <div style={{ padding: "32px 28px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <Eyebrow>Passo 2 de 3</Eyebrow>
        <h1
          style={{
            fontSize: 38,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1.2,
            margin: "12px 0 12px",
          }}
        >
          Vê o teu email
        </h1>
        <p style={{ fontSize: 15, color: C.ink2, lineHeight: 1.5, margin: 0 }}>
          Enviámos um código de 6 dígitos para
          <br />
          <span style={{ color: C.ink, fontWeight: 600 }}>{email}</span>
        </p>

        <div style={{ height: 28 }} />

        {/* Envelope illustration */}
        <div
          style={{
            alignSelf: "center",
            width: 76,
            height: 76,
            borderRadius: 18,
            background: "#fff",
            border: `1.5px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            position: "relative",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect x="4" y="9" width="28" height="20" rx="3" stroke={C.navy} strokeWidth="2" />
            <path d="M5 11l13 9 13-9" stroke={C.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              width: 20,
              height: 20,
              borderRadius: 10,
              background: C.red,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
            }}
          >
            1
          </div>
        </div>

        {/* OTP boxes - Tamanho ajustado */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              disabled={loading}
              style={{
                width: 45,
                height: 52,
                borderRadius: 12,
                background: "#fff",
                border: `2px solid ${i === digits.findIndex((x) => !x) && d === "" ? C.ink : d ? C.navy : C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: 24,
                fontWeight: 700,
                color: C.ink,
                outline: "none",
                fontFamily: "inherit",
                padding: 0,
              }}
            />
          ))}
        </div>

        <div style={{ height: 22 }} />

        {/* Resend countdown */}
        <div
          style={{
            padding: "14px 16px",
            borderRadius: 14,
            background: "#fff",
            border: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 15,
              background: "rgba(255,1,0,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke={C.red} strokeWidth="1.5" />
              <path d="M7 4v3l2 1.5" stroke={C.red} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ flex: 1, fontSize: 14, color: C.ink2 }}>
            Não recebeste?{" "}
            {countdown > 0 ? (
              <span style={{ color: C.red, fontWeight: 600 }}>
                Reenviar em 0:{countdown.toString().padStart(2, "0")}
              </span>
            ) : (
              <button
                type="button"
                onClick={onReenviar}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: C.red,
                  fontWeight: 600,
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              >
                Reenviar código
              </button>
            )}
          </div>
        </div>

        {erro && (
          <div style={{ marginTop: 12 }}>
            <ErrorBanner msg={erro} />
          </div>
        )}

        <div style={{ flex: 1 }} />

        <PrimaryBtn loading={loading} disabled={code.length < 6} onClick={() => onVerify(code)}>
          Verificar
        </PrimaryBtn>
      </div>
    </Shell>
  );
}

// ─── Step 3 — Personal data ──────────────────────────────────

function StepDados({
  nome,
  telefone,
  dataNasc,
  contactoEmergencia,
  erro,
  loading,
  onNome,
  onTelefone,
  onDataNasc,
  onContacto,
  onBack,
  onSubmit,
}: {
  nome: string;
  telefone: string;
  dataNasc: string;
  contactoEmergencia: string;
  erro: string;
  loading: boolean;
  onNome: (v: string) => void;
  onTelefone: (v: string) => void;
  onDataNasc: (v: string) => void;
  onContacto: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const initials = nome
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <Shell>
      <BackBar progress={100} onBack={onBack} />
      <div style={{ padding: "24px 28px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <Eyebrow>Passo 3 de 3</Eyebrow>
        <h1
          style={{
            fontSize: 38,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -1.2,
            margin: "10px 0 10px",
          }}
        >
          Os teus dados
        </h1>
        <p style={{ fontSize: 15, color: C.ink2, lineHeight: 1.5, margin: 0 }}>
          Para a tua ficha de aluno na academia.
        </p>

        <div style={{ height: 24 }} />

        {/* Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 34,
              background: C.navy,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              position: "relative",
              flexShrink: 0,
            }}
          >
            {initials || "?"}
            <div
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 26,
                height: 26,
                borderRadius: 13,
                background: C.red,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2.5px solid ${C.bg}`,
              }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Adicionar foto</div>
            <div style={{ fontSize: 12, color: C.ink3, marginTop: 2 }}>Opcional</div>
          </div>
        </div>

        <Field label="Nome completo" focused>
          <TextInput
            type="text"
            placeholder="João Silva"
            value={nome}
            onChange={onNome}
            autoComplete="name"
            required
            disabled={loading}
          />
        </Field>

        <Field label="Telemóvel">
          <TextInput
            type="tel"
            placeholder="+351 912 345 678"
            value={telefone}
            onChange={(v) => onTelefone(mascararTelefonePT(v))}
            autoComplete="tel"
            disabled={loading}
            inputMode="tel"
          />
        </Field>

        <Field label="Data de nascimento">
          <input
            type="date"
            value={dataNasc}
            onChange={(e) => onDataNasc(e.target.value)}
            disabled={loading}
            max={new Date().toISOString().split("T")[0]}
            style={{
              height: 50,
              borderRadius: 12,
              background: "#fff",
              border: `1.5px solid ${C.line}`,
              padding: "0 14px",
              fontSize: 16,
              fontWeight: 500,
              width: "100%",
              boxSizing: "border-box",
              outline: "none",
              fontFamily: "inherit",
              color: C.ink,
            }}
          />
        </Field>

        <Field label="Contacto de emergência">
          <TextInput
            type="text"
            placeholder="Nome · +351 919 876 543"
            value={contactoEmergencia}
            onChange={onContacto}
            disabled={loading}
          />
        </Field>

        {/* Privacy note */}
        <div
          style={{
            marginTop: 8,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(3,10,140,0.06)",
            border: `1px solid rgba(3,10,140,0.15)`,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="8" cy="8" r="6.5" stroke={C.blue} strokeWidth="1.4" />
            <path d="M8 5v3.5M8 11h.01" stroke={C.blue} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 12, color: C.navy, lineHeight: 1.45 }}>
            Os teus dados ficam visíveis apenas para a equipa da Gracie Barra Famalicão.
          </span>
        </div>

        {erro && (
          <div style={{ marginTop: 12 }}>
            <ErrorBanner msg={erro} />
          </div>
        )}

        <div style={{ flex: 1, minHeight: 12 }} />

        <PrimaryBtn loading={loading} disabled={nome.trim().split(" ").filter(Boolean).length < 2} onClick={onSubmit}>
          Concluir inscrição
        </PrimaryBtn>
      </div>
    </Shell>
  );
}

// ─── Step 4 — Success ────────────────────────────────────────

function StepPronto({ nome, onLogin }: { nome: string; onLogin: () => void }) {
  const firstName = nome.trim().split(" ")[0] || "Atleta";
  return (
    <Shell dark bg={C.navy}>
      {/* Background glows */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: C.blue,
            opacity: 0.5,
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: -150,
            width: 460,
            height: 460,
            borderRadius: "50%",
            background: C.red,
            opacity: 0.35,
            filter: "blur(70px)",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "0 32px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ paddingTop: 64 }} />

        {/* Logo with checkmark */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                overflow: "hidden",
              }}
            >
              <img src="/logo.webp" alt="Gracie Barra" width={120} height={120} style={{ objectFit: "contain" }} />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -4,
                right: -4,
                width: 44,
                height: 44,
                borderRadius: 22,
                background: C.red,
                border: `4px solid ${C.navy}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10l3 3 7-8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <Eyebrow color="#ff5a59">Conta criada</Eyebrow>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: -1.6,
            margin: "14px 0 0",
            color: "#fff",
          }}
        >
          Tudo pronto,
          <br />
          {firstName}.
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.78)",
            margin: "14px 0 0",
          }}
        >
          A tua conta foi criada com sucesso. Inicia sessão para começar a usar a aplicação.
        </p>

        <div style={{ height: 28 }} />

        <button
          type="button"
          onClick={onLogin}
          style={{
            height: 56,
            borderRadius: 28,
            background: C.red,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 17,
            fontWeight: 600,
            boxShadow: "0 8px 22px rgba(255,1,0,0.4)",
            fontFamily: "inherit",
            width: "100%",
          }}
        >
          Iniciar sessão
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </Shell>
  );
}

// ─── Orchestrator ────────────────────────────────────────────

export function CadastroForm() {
  const router = useRouter();
  const [passo, setPasso] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  // Form state
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [contactoEmergencia, setContactoEmergencia] = useState("");
  const [countdown, setCountdown] = useState(0);

  function startCountdown() {
    setCountdown(30);
    const iv = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) { clearInterval(iv); return 0; }
        return n - 1;
      });
    }, 1000);
  }

  async function handleEnviarCodigo() {
    setErro("");
    if (!email || senha.length < 6) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          setErro("Este email já está registado. Tenta iniciar sessão.");
        } else {
          setErro("Erro ao enviar código. Tenta novamente.");
        }
        return;
      }
      setPasso(2);
      startCountdown();
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(code: string) {
    setErro("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "email",
      });
      if (error) {
        setErro("Código incorreto ou expirado. Tenta novamente.");
        return;
      }
      setPasso(3);
    } finally {
      setLoading(false);
    }
  }

  async function handleReenviar() {
    setErro("");
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.resend({ type: "signup", email: email.trim() });
      startCountdown();
    } finally {
      setLoading(false);
    }
  }

  async function handleConcluir() {
    setErro("");
    if (nome.trim().split(" ").filter(Boolean).length < 2) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErro("Sessão expirada. Começa o registo novamente.");
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          nome_completo: nome.trim(),
          telefone: telefone || null,
          data_nascimento: dataNasc || null,
        })
        .eq("id", user.id);
      if (error) {
        setErro("Erro ao guardar dados. Tenta novamente.");
        return;
      }
      setPasso(4);
    } finally {
      setLoading(false);
    }
  }

  switch (passo) {
    case 0:
      return (
        <StepWelcome
          onCriar={() => setPasso(1)}
          onLogin={() => router.push("/login")}
        />
      );
    case 1:
      return (
        <StepEmail
          email={email}
          senha={senha}
          erro={erro}
          loading={loading}
          onEmail={setEmail}
          onSenha={setSenha}
          onBack={() => { setErro(""); setPasso(0); }}
          onSubmit={handleEnviarCodigo}
        />
      );
    case 2:
      return (
        <StepOtp
          email={email}
          erro={erro}
          loading={loading}
          onBack={() => { setErro(""); setPasso(1); }}
          onVerify={handleVerify}
          onReenviar={handleReenviar}
          countdown={countdown}
        />
      );
    case 3:
      return (
        <StepDados
          nome={nome}
          telefone={telefone}
          dataNasc={dataNasc}
          contactoEmergencia={contactoEmergencia}
          erro={erro}
          loading={loading}
          onNome={setNome}
          onTelefone={setTelefone}
          onDataNasc={setDataNasc}
          onContacto={setContactoEmergencia}
          onBack={() => { setErro(""); setPasso(2); }}
          onSubmit={handleConcluir}
        />
      );
    case 4:
      return <StepPronto nome={nome} onLogin={() => router.push("/login")} />;
  }
}
