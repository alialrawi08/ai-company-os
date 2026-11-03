import type { Metadata } from "next";
import ArascoClient from "./ArascoClient";

export const metadata: Metadata = {
  title: "ARASCO — Personal Intelligence",
  description: "Your personal AI command center.",
};

export default function ArascoPage() {
  return <ArascoClient />;
}
