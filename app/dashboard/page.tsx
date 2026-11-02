import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return <DashboardOverview firstName={user.firstName || ""}/>;
}