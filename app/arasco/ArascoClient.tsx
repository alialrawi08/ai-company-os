"use client";

import "./arasco.css";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Activity, ArrowUp, AudioLines, Bot, BrainCircuit, Check, ChevronDown,
  Command, Cpu, Globe2, LayoutDashboard, Menu, Mic, MicOff, Monitor,
  Plus, Radio, Settings2, ShieldCheck, Sparkles, Volume2, VolumeX, X,
} from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };
type SpeechRecognitionResultLike = { transcript: string };
type SpeechRecognitionEventLike = { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>> };
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

const starterMessages: Message[] = [
  {
    role: "assistant",
    content: "Good evening. I'm ARASCO, your personal intelligence system. I can help you think, research, plan, and work through your tasks. What should we focus on?",
  },
];

const quickActions = [
  { label: "Plan my day", prompt: "Help me plan my day. Ask only for details you truly need.", icon: Activity },
  { label: "Research a topic", prompt: "Help me research a topic and give me a structured, evidence-aware summary.", icon: Globe2 },
  { label: "Build something", prompt: "Act as my technical co-founder. Help me plan and build the next feature step by step.", icon: Cpu },
];

export default function ArascoClient() {
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [apiReady, setApiReady] = useState<boolean | null>(null);
  const [notice, setNotice] = useState("");
  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const w = window as SpeechWindow;
    setVoiceSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    fetch("/api/arasco", { method: "GET" })
      .then((r) => setApiReady(r.ok))
      .catch(() => setApiReady(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  function stopListening() {
    recognition.current?.stop();
    recognition.current = null;
    setListening(false);
  }

  function toggleListening() {
    if (listening) {
      stopListening();
      return;
    }
    const w = window as SpeechWindow;
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setNotice("Voice input is not supported in this browser. You can still type, or open ARASCO in a supported desktop browser.");
      return;
    }
    const instance = new SpeechRecognitionCtor();
    instance.lang = "en-US";
    instance.interimResults = true;
    instance.continuous = false;
    instance.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join("");
      setInput(transcript);
    };
    instance.onerror = () => {
      setListening(false);
      setNotice("Microphone access was interrupted. Check your browser permissions and try again.");
    };
    instance.onend = () => {
      setListening(false);
      recognition.current = null;
    };
    recognition.current = instance;
    setNotice("");
    setListening(true);
    instance.start();
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) {
      setNotice("Text-to-speech is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/arasco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-16) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ARASCO could not complete that request.");
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setNotice(message);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function resetConversation() {
    window.speechSynthesis?.cancel();
    stopListening();
    setMessages(starterMessages);
    setNotice("");
  }

  return (
    <main className="arasco-shell">
      <aside className={`arasco-sidebar ${mobileMenu ? "is-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><AudioLines size={22} strokeWidth={1.8} /></div>
          <div><div className="brand-name">ARASCO</div><div className="brand-subtitle">PERSONAL INTELLIGENCE</div></div>
          <button className="icon-button sidebar-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={18} /></button>
        </div>

        <button className="new-session" onClick={resetConversation}><Plus size={17} /> New conversation <span>⌘ K</span></button>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="side-nav">
          <a className="nav-item active" href="#overview"><LayoutDashboard size={17} /> Overview</a>
          <a className="nav-item" href="#assistant"><Bot size={17} /> AI Assistant <span className="nav-live" /></a>
          <a className="nav-item" href="#systems"><Cpu size={17} /> Systems</a>
          <a className="nav-item" href="#activity"><Activity size={17} /> Activity</a>
        </nav>

        <div className="sidebar-bottom">
          <div className="secure-card">
            <div className="secure-icon"><ShieldCheck size={17} /></div>
            <div><strong>Your command center</strong><p>Actions stay under your control.</p></div>
          </div>
          <button className="profile-row"><div className="avatar">A</div><div className="profile-copy"><strong>Personal workspace</strong><span>Owner access</span></div><Settings2 size={17} /></button>
        </div>
      </aside>

      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}

      <section className="arasco-main" id="overview">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button menu-trigger" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={20} /></button>
            <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          </div>
          <div className="topbar-right">
            <div className="system-status"><span className="status-dot" /> SYSTEM READY</div>
            <button className="icon-button" onClick={() => setNotice("Settings will be available in a later build.")} aria-label="Settings"><Settings2 size={18} /></button>
            <div className="avatar top-avatar">A</div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> PERSONAL AI SYSTEM <span className="eyebrow-line" /></div>
              <h1>Your world,<br /><span>in command.</span></h1>
              <p className="welcome-copy">One intelligent workspace for ideas, decisions, and action.</p>
            </div>
            <div className="core-visual" aria-label="ARASCO intelligence core">
              <div className="core-orbit orbit-one" /><div className="core-orbit orbit-two" />
              <div className="core-center"><AudioLines size={36} strokeWidth={1.4} /></div>
              <span className="core-label">ARASCO CORE</span>
            </div>
          </section>

          <section className="metrics-grid" id="systems">
            <article className="metric-card"><div className="metric-top"><span>INTELLIGENCE</span><BrainCircuit size={17} /></div><div className="metric-value">ONLINE</div><div className="metric-foot"><span className="tiny-green" /> Conversation engine ready</div></article>
            <article className="metric-card"><div className="metric-top"><span>VOICE INTERFACE</span><Radio size={17} /></div><div className="metric-value">{voiceSupported ? "AVAILABLE" : "LIMITED"}</div><div className="metric-foot">{voiceSupported ? "Browser speech input detected" : "Text input always available"}</div></article>
            <article className="metric-card"><div className="metric-top"><span>SECURITY</span><ShieldCheck size={17} /></div><div className="metric-value">CONTROLLED</div><div className="metric-foot">No device actions without approval</div></article>
          </section>

          <section className="assistant-section" id="assistant">
            <div className="section-heading"><div><div className="section-kicker">INTERFACE 01</div><h2>Talk to ARASCO</h2></div><div className="session-label"><span className="status-dot" /> LIVE SESSION</div></div>
            <div className="assistant-panel">
              <div className="chat-header"><div className="assistant-identity"><div className="assistant-avatar"><AudioLines size={20} /></div><div><strong>ARASCO Intelligence</strong><span><span className="status-dot" /> Ready to assist</span></div></div><button className="text-button" onClick={resetConversation}>New session <Plus size={14} /></button></div>
              <div className="chat-body">
                {messages.map((message, index) => (
                  <div className={`message-row ${message.role === "user" ? "user-row" : ""}`} key={index}>
                    {message.role === "assistant" && <div className="message-avatar"><AudioLines size={15} /></div>}
                    <div className={`message-bubble ${message.role === "user" ? "user-bubble" : ""}`}>
                      <div className="message-author">{message.role === "assistant" ? "ARASCO" : "YOU"}</div>
                      <p>{message.content}</p>
                      {message.role === "assistant" && <button className="speak-button" onClick={() => speak(message.content)}><Volume2 size={13} /> Listen</button>}
                    </div>
                  </div>
                ))}
                {busy && <div className="message-row"><div className="message-avatar"><AudioLines size={15} /></div><div className="message-bubble typing-bubble"><span /><span /><span /></div></div>}
                <div ref={bottomRef} />
              </div>
              <div className="chat-compose">
                {notice && <div className="notice-bar"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={14} /></button></div>}
                <form className="composer" onSubmit={handleSubmit}>
                  <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(input); } }} placeholder="Give ARASCO an instruction..." rows={1} aria-label="Message ARASCO" />
                  <div className="composer-actions">
                    <div className="composer-hint"><span className="composer-lock"><ShieldCheck size={12} /></span> You stay in control</div>
                    <div className="composer-buttons">
                      <button type="button" className={`mic-button ${listening ? "listening" : ""}`} onClick={toggleListening} aria-label={listening ? "Stop voice input" : "Start voice input"} title={listening ? "Stop listening" : "Speak to ARASCO"}>{listening ? <MicOff size={17} /> : <Mic size={17} />}</button>
                      <button type="submit" className="send-button" disabled={!input.trim() || busy} aria-label="Send message"><ArrowUp size={18} /></button>
                    </div>
                  </div>
                </form>
                <div className="composer-disclaimer">ARASCO can make mistakes. Review important actions before you approve them.</div>
              </div>
            </div>
          </section>

          <section className="quick-section" id="activity">
            <div className="section-heading compact-heading"><div><div className="section-kicker">QUICK COMMANDS</div><h2>Where should we begin?</h2></div><Sparkles size={19} className="heading-spark" /></div>
            <div className="quick-grid">
              {quickActions.map(({ label, prompt, icon: Icon }) => <button className="quick-card" key={label} onClick={() => void sendMessage(prompt)}><div className="quick-icon"><Icon size={18} /></div><div><strong>{label}</strong><span>Start with ARASCO</span></div><ArrowUp size={15} className="quick-arrow" /></button>)}
            </div>
          </section>

          <footer className="footer-line"><span>ARASCO <span className="footer-muted">/ PERSONAL INTELLIGENCE SYSTEM</span></span><span>BUILT FOR CLARITY. DESIGNED FOR CONTROL.</span></footer>
        </div>
      </section>
    </main>
  );
}
