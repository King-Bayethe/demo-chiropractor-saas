import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { AuthGuard } from "@/components/AuthGuard";

const Index = () => {
  return (
    <AuthGuard>
      <Layout>
        <Dashboard />
      </Layout>
    </AuthGuard>
  );
};

export default Index;
