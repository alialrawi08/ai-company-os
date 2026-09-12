"use client";

import { FormEvent, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "مرحبًا! كيف أستطيع مساعدتك اليوم؟",
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();

    if (!message.trim() || loading) return;

    const text = message;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: text,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "لم يتم استلام رد.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "حدث خطأ أثناء الاتصال بـ OpenAI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090B] text-white">
      <div className="mx-auto flex h-screen max-w-5xl flex-col p-6">
        <h1 className="mb-6 text-3xl font-bold">
          AI Assistant
        </h1>

        <Card className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-600"
                    : "bg-zinc-800"
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="max-w-[80%] rounded-2xl bg-zinc-800 p-4">
                AI is typing...
              </div>
            )}
          </div>
        </Card>

        <form
          onSubmit={sendMessage}
          className="mt-6 flex gap-4"
        >
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب رسالتك..."
          />

          <Button
            type="submit"
            disabled={loading}
          >
            إرسال
          </Button>
        </form>
      </div>
    </main>
  );
}