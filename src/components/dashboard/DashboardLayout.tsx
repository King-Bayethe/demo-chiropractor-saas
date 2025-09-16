import { Layout } from "@/components/Layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Layout>
      {children}
    </Layout>
  );
}