import WorkspaceSection from "@/components/dashboard/WorkspaceSection";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <WorkspaceSection section={section} />;
}
