"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, Mic, MicOff, Phone, Volume2, VolumeX, LoaderCircle, Sparkles } from "lucide-react";
import { useDashboardLanguage } from "@/lib/useDashboardLanguage";

type Message = { role: "user" | "assistant"; content: string };
type SpeechRecognitionResultLike = { 0: { transcript: string }; isFinal: boolean };
type SpeechRecognitionEventLike = { results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start: () => void; stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const copy = {
 en: { badge:"Your AI executive", subtitle:"Your personal AI Company OS executive assistant", end:"End voice session", start:"Start voice chat", company:"Company-aware", companyDesc:"Reviews projects and agent activity for your account.", voice:"Voice conversation", voiceDesc:"Speak using your microphone and hear replies from your device.", free:"Free-first", freeDesc:"No phone number or additional calling subscription.", conversation:"Arasko conversation", listening:"Listening...", speaking:"Arasko is speaking...", thinking:"Arasko is thinking...", ready:"Ready to chat", mute:"Mute voice", unmute:"Enable voice", you:"You", thinkingReply:"Arasko is preparing a reply...", unsupported:"Voice input is not supported in this browser. Try typing instead.", micError:"Could not hear you. Check microphone permission and try again.", busyMic:"Microphone is busy. Try again.", placeholder:"Message Arasko or use the microphone...", stop:"Stop listening", speak:"Speak", foot:"Voice depends on browser support and microphone permission. Voice chat works only while this page is open; there are no phone calls or background listening. AI replies use the configured provider and may consume API credits.", starters:["Give me a quick company health check.","What should I focus on today?","Review my recent agent activity."] },
 sv: { badge:"Din AI-chef", subtitle:"Din personliga AI-assistent för företaget", end:"Avsluta röstsamtal", start:"Starta röstsamtal", company:"Företagsmedveten", companyDesc:"Granskar projekt och agentaktivitet för ditt konto.", voice:"Röstsamtal", voiceDesc:"Prata via mikrofonen och hör svar från din enhet.", free:"Börja kostnadsfritt", freeDesc:"Inget telefonnummer eller extra samt abonnemang behövs.", conversation:"Arasko-konversation", listening:"Lyssnar...", speaking:"Arasko pratar...", thinking:"Arasko tänker...", ready:"Redo att chatta", mute:"Stäng av rösten", unmute:"Aktivera röst", you:"Du", thinkingReply:"Arasko förbereder ett svar...", unsupported:"Röstinmatning stöds inte i den här webbläsaren. Skriv i stället.", micError:"Jag kunde inte höra dig. Kontrollera mikrofonbehörigheten och försök igen.", busyMic:"Mikrofonen används redan. Försök igen.", placeholder:"Skriv till Arasko eller använd mikrofonen...", stop:"Sluta lyssna", speak:"Prata", foot:"Röstfunktionen kräver webbläsarstöd och mikrofonbehörighet. Röstchatten fungerar bara när sidan är öppen; inga telefonsamtal eller bakgrundslyssning sker. AI-svar använder vald leverantör och kan förbruka API-krediter.", starters:["Ge mig en snabb hälsokontroll av företaget.","Vad bör jag fokusera på idag?","Granska min senaste agentaktivitet."] },
 ar: { badge:"مساعدك التنفيذي الذكي", subtitle:"مساعدك الشخصي لمتابعة AI Company OS", end:"إنهاء جلسة الصوت", start:"بدء محادثة صوتية", company:"يفهم نشاط الشركة", companyDesc:"يراجع المشاريع ونشاط الوكلاء الخاص بحسابك.", voice:"محادثة صوتية", voiceDesc:"احچي باستخدام المايك واسمع الرد من جهازك.", free:"ابدأ بدون تكاليف إضافية", freeDesc:"ما تحتاج رقم هاتف أو اشتراك اتصالات إضافي.", conversation:"محادثة Arasko", listening:"أسمعك هسه...", speaking:"Arasko يحچي...", thinking:"Arasko يفكر...", ready:"جاهز للمحادثة", mute:"كتم الصوت", unmute:"تشغيل الصوت", you:"أنت", thinkingReply:"Arasko يجهز الجواب...", unsupported:"الإدخال الصوتي غير مدعوم بهذا المتصفح. تگدر تكتب بداله.", micError:"ما كدرت أسمعك. تأكد من صلاحية المايكروفون وحاول مرة ثانية.", busyMic:"المايكروفون مشغول. حاول مرة ثانية.", placeholder:"اكتب لـ Arasko أو استخدم المايك...", stop:"إيقاف الاستماع", speak:"تحدث", foot:"الصوت يعتمد على دعم المتصفح وصلاحية المايكروفون. المحادثة الصوتية تعمل فقط والصفحة مفتوحة؛ ماكو مكالمات هاتفية أو استماع بالخلفية. الردود الذكية تستخدم مزود AI الحالي وقد تستهلك رصيد API.", starters:["اعطني فحص سريع لوضع الشركة.","شنو أهم شي أركز عليه اليوم؟","راجع آخر نشاط للوكلاء."] }
} as const;

export default function AraskoPage() {
  const language = useDashboardLanguage();
  const t = copy[language];
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: language === "sv" ? "Hej! Jag är Arasko, din AI-chef i AI Company OS. Jag kan granska företagets aktivitet, projekt och agentuppgifter och hjälpa dig prioritera. Vad ska vi börja med?" : language === "en" ? "Hi, I’m Arasko, your AI executive in AI Company OS. I can review company activity, projects, and agent tasks and help you set priorities. Where should we start?" : "هلا بيك، أني Arasko. مساعدك التنفيذي في AI Company OS. أگدر أراجع نشاط الشركة ومشاريعك ومهام الوكلاء، وأساعدك ترتب أولوياتك. شنو نبدأ بيه؟" }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [callMode, setCallMode] = useState(false);
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = window as SpeechWindow;
    setVoiceSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition) && "speechSynthesis" in window);
    return () => { recognition.current?.stop(); window.speechSynthesis?.cancel(); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  function speak(text: string) {
    if (!voiceEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar";
    utterance.rate = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next); setInput(""); setBusy(true); setVoiceError("");
    try {
      const response = await fetch("/api/arasko", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Arasko could not respond.");
      const answer = String(data.reply || "ما عندي جواب حالياً.");
      setMessages(current => [...current, { role: "assistant", content: answer }]);
      speak(answer);
    } catch (error) {
      setVoiceError(error instanceof Error ? error.message : "Connection failed.");
    } finally { setBusy(false); }
  }

  function startListening() {
    const w = window as SpeechWindow;
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) { setVoiceError(t.unsupported); return; }
    window.speechSynthesis?.cancel();
    const instance = new Recognition();
    recognition.current = instance;
    instance.lang = "ar-IQ";
    instance.continuous = false;
    instance.interimResults = false;
    instance.onresult = event => {
      const transcript = Array.from(event.results).map(item => item[0].transcript).join(" ").trim();
      if (transcript) void sendMessage(transcript);
    };
    instance.onerror = () => { setListening(false); setVoiceError(t.micError); };
    instance.onend = () => setListening(false);
    setVoiceError(""); setListening(true);
    try { instance.start(); } catch { setListening(false); setVoiceError(t.busyMic); }
  }

  function endCall() {
    recognition.current?.stop();
    window.speechSynthesis?.cancel();
    setListening(false); setSpeaking(false); setCallMode(false);
  }

  return <main className="min-h-screen px-4 py-6 text-white sm:px-8 lg:px-10">
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"><Bot size={25}/></div>
          <div><div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Arasko</h1><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-300">{t.badge}</span></div><p className="mt-1 text-xs text-zinc-500">{t.subtitle}</p></div>
        </div>
        {callMode ? <button onClick={endCall} className="flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-200"><Phone size={16}/> {t.end}</button> : <button onClick={() => { setCallMode(true); startListening(); }} disabled={!voiceSupported || busy} className="flex items-center gap-2 rounded-full bg-cyan-200 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-40"><Phone size={16}/> {t.start}</button>}
      </header>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><Sparkles size={17} className="mb-2 text-cyan-200"/><p className="text-sm font-medium">{t.company}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{t.companyDesc}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><Mic size={17} className="mb-2 text-cyan-200"/><p className="text-sm font-medium">{t.voice}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{t.voiceDesc}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><Volume2 size={17} className="mb-2 text-cyan-200"/><p className="text-sm font-medium">{t.free}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{t.freeDesc}</p></div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><p className="text-sm font-medium">{t.conversation}</p><p className="mt-1 text-[11px] text-zinc-500">{listening ? t.listening : speaking ? t.speaking : busy ? t.thinking : t.ready}</p></div><button onClick={() => { setVoiceEnabled(v => !v); if (voiceEnabled) window.speechSynthesis.cancel(); }} className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white" title={voiceEnabled ? t.mute : t.unmute}>{voiceEnabled ? <Volume2 size={17}/> : <VolumeX size={17}/>}</button></div>
        <div className="h-[min(55vh,520px)] space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.map((message, index) => <div key={index} className={message.role === "user" ? "ml-auto max-w-[88%]" : "mr-auto max-w-[92%]"}><div className={message.role === "user" ? "rounded-2xl rounded-br-md bg-cyan-200 px-4 py-3 text-sm leading-7 text-slate-950" : "rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.05] px-4 py-3 text-sm leading-7 text-zinc-200"}>{message.content}</div><p className="mt-1 px-1 text-[10px] text-zinc-600">{message.role === "user" ? t.you : "Arasko"}</p></div>)}
          {busy && <div className="flex items-center gap-2 text-xs text-zinc-500"><LoaderCircle size={15} className="animate-spin"/> {t.thinkingReply}</div>}
          <div ref={bottomRef}/>
        </div>
        {voiceError && <p role="alert" className="mx-4 mb-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-xs text-amber-200">{voiceError}</p>}
        <div className="border-t border-white/10 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap gap-2">{t.starters.map(s => <button key={s} onClick={() => void sendMessage(s)} disabled={busy} className="rounded-full border border-white/10 px-3 py-2 text-[11px] text-zinc-400 hover:border-white/25 hover:text-white disabled:opacity-40">{s}</button>)}</div>
          <form onSubmit={e => { e.preventDefault(); void sendMessage(input); }} className="flex items-end gap-2">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }} rows={2} maxLength={4000} placeholder={t.placeholder} className="min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-cyan-200/40"/>
            <button type="button" onClick={listening ? () => recognition.current?.stop() : startListening} disabled={!voiceSupported || busy} title={listening ? t.stop : t.speak} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${listening ? "border-red-300/40 bg-red-300/10 text-red-200" : "border-white/10 bg-white/[0.06] text-zinc-200"} disabled:opacity-40`}>{listening ? <MicOff size={19}/> : <Mic size={19}/>}</button>
            <button disabled={busy || !input.trim()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-200 text-slate-950 disabled:opacity-40"><ArrowUp size={20}/></button>
          </form>
          <p className="mt-3 text-[10px] leading-5 text-zinc-600">{t.foot}</p>
        </div>
      </section>
    </div>
  </main>;
}
