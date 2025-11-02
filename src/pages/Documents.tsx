import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentStatsCards } from "@/components/documents/DocumentStatsCards";
import { DocumentFilters } from "@/components/documents/DocumentFilters";
import { DocumentsTable } from "@/components/documents/DocumentsTable";
import { DocumentViewDialog } from "@/components/documents/DocumentViewDialog";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { useDocuments } from "@/hooks/useDocuments";
import { FileText, Plus, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const Documents = () => {
  const { documents, isLoading, filters, setFilters, stats } = useDocuments();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setViewDialogOpen(true);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-lg p-8 border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="h-8 w-8" />
                Document Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Organize, store, and manage patient documents securely
              </p>
            </div>
            <Button size="lg" onClick={() => setUploadDialogOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <DocumentStatsCards stats={stats} />
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
          </TabsList>

          {/* All Documents Tab */}
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-24" />
            ) : (
              <DocumentFilters filters={filters} onFiltersChange={setFilters} />
            )}

            {isLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <DocumentsTable documents={documents} onView={handleViewDocument} />
            )}
          </TabsContent>

          {/* Recent Uploads Tab */}
          <TabsContent value="recent" className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <DocumentsTable
                documents={documents.slice(0, 10)}
                onView={handleViewDocument}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* View Dialog */}
      <DocumentViewDialog
        document={selectedDocument}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      {/* Upload Dialog */}
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
      />
    </Layout>
  );
};

export default Documents;