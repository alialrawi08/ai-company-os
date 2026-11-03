"use client";
import { useEffect, useState } from "react";
import { CreditCard, ShieldCheck, RefreshCw } from "lucide-react";
import { useDashboardLanguage } from "@/lib/useDashboardLanguage";

const words = {
  en: { title: "Billing & subscription", intro: "Choose your AF QELVION plan and manage payment details.", plan: "Current plan", free: "Free / not subscribed", status: "Status", manage: "Manage subscription", start: "Subscribe", loading: "Loading billing details...", note: "Payments are processed by Stripe. Card details are never stored in this app.", success: "Checkout completed. Your subscription will appear after Stripe confirms it.", cancel: "Checkout was canceled.", pro: "Pro", business: "Business", monthly: "/ month", error: "Billing is not configured yet." },
  sv: { title: "Fakturering och prenumeration", intro: "Välj din AF QELVION-plan och hantera betalningsuppgifter.", plan: "Nuvarande plan", free: "Gratis / ingen prenumeration", status: "Status", manage: "Hantera prenumeration", start: "Prenumerera", loading: "Läser in faktureringsuppgifter...", note: "Betalningar hanteras av Stripe. Kortuppgifter lagras inte i appen.", success: "Betalningen slutfördes. Prenumerationen visas när Stripe har bekräftat den.", cancel: "Betalningen avbröts.", pro: "Pro", business: "Business", monthly: "/ månad", error: "Fakturering är inte konfigurerad ännu." },
  ar: { title: "الاشتراك والفوترة", intro: "اختر خطة AF QELVION وأدر بيانات الدفع.", plan: "الخطة الحالية", free: "مجاني / لا يوجد اشتراك", status: "الحالة", manage: "إدارة الاشتراك", start: "اشترك الآن", loading: "جاري تحميل معلومات الفوترة...", note: "Stripe يعالج المدفوعات. التطبيق لا يخزن بيانات بطاقتك.", success: "اكتملت عملية الدفع، وسيظهر الاشتراك بعد تأكيد Stripe.", cancel: "تم إلغاء الدفع.", pro: "Pro", business: "Business", monthly: "/ شهرياً", error: "الفوترة غير مهيأة بعد." },
};

export default function BillingPage() {
  const lang = useDashboardLanguage();
  const t = words[lang];
  const [sub, setSub] = useState<{ status: string; plan: string | null; canManage: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.has("success")) setNotice(t.success);
    if (q.has("canceled")) setNotice(t.cancel);
    fetch("/api/billing", { cache: "no-store" }).then(async r => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSub(d.subscription);
    }).catch(e => setError(e instanceof Error ? e.message : t.error));
  }, [t.error, t.success, t.cancel]);

  async function go(action: "checkout" | "portal", plan?: "pro" | "business") {
    setBusy(true); setError("");
    try {
      const r = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...(plan ? { plan } : {}) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      window.location.assign(d.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.error);
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 text-white sm:px-8 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[.06] p-3"><CreditCard size={22}/></div>
          <div><h1 className="text-3xl font-semibold">{t.title}</h1><p className="mt-2 text-sm text-zinc-400">{t.intro}</p></div>
        </div>
        <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-7">
          <p className="text-xs uppercase tracking-wider text-zinc-500">{t.plan}</p>
          <h2 className="mt-2 text-2xl font-semibold">{sub?.plan || t.free}</h2>
          <p className="mt-3 text-sm text-zinc-400">{t.status}: {sub?.status || t.loading}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-sm text-zinc-400">{t.pro}</p><p className="mt-2 text-2xl font-semibold">3,990 kr <span className="text-sm text-zinc-400">{t.monthly}</span></p>
              <button disabled={busy || !!sub?.canManage} onClick={() => void go("checkout", "pro")} className="mt-4 w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{busy ? <RefreshCw className="inline animate-spin" size={15}/> : null} {t.start}</button>
            </div>
            <div className="rounded-xl border border-white/10 p-4">
              <p className="text-sm text-zinc-400">{t.business}</p><p className="mt-2 text-2xl font-semibold">7,990 kr <span className="text-sm text-zinc-400">{t.monthly}</span></p>
              <button disabled={busy || !!sub?.canManage} onClick={() => void go("checkout", "business")} className="mt-4 w-full rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{busy ? <RefreshCw className="inline animate-spin" size={15}/> : null} {t.start}</button>
            </div>
          </div>
          {sub?.canManage && <button disabled={busy} onClick={() => void go("portal")} className="mt-4 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold disabled:opacity-50">{t.manage}</button>}
          {error && <p role="alert" className="mt-4 text-sm text-amber-300">{error}</p>}
          {notice && <p className="mt-4 text-sm text-emerald-300">{notice}</p>}
          <p className="mt-6 flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-6 text-zinc-500"><ShieldCheck size={16} className="shrink-0"/>{t.note}</p>
        </section>
      </div>
    </main>
  );
}
