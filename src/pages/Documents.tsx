import { useState } from "react";
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Upload,
  Search,
  FileText,
  Download,
  Eye,
  Trash2,
  Filter,
  FolderOpen,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Document {
  id: string;
  name: string;
  type: string;
  patient: string;
  referralSource: string;
  uploadDate: string;
  addedBy: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "MRI_Results_Johnson.pdf",
    type: "MRI/Imaging Files",
    patient: "Maria Johnson",
    referralSource: "Rodriguez & Associates",
    uploadDate: "2024-01-15",
    addedBy: "Front Desk",
  },
  {
    id: "2",
    name: "Treatment_Report_Smith.pdf",
    type: "Treatment Report",
    patient: "John Smith",
    referralSource: "Legal Partners LLC",
    uploadDate: "2024-01-14",
    addedBy: "Dr. Silverman",
  },
  {
    id: "3",
    name: "PIP_Billing_Garcia.pdf",
    type: "PIP Billing Form",
    patient: "Ana Garcia",
    referralSource: "Johnson Law Firm",
    uploadDate: "2024-01-13",
    addedBy: "Billing Dept",
  },
];

const documentTypes = [
  "Treatment Report",
  "PIP Billing Form",
  "MRI/Imaging Files",
  "Attorney Correspondence",
  "Consent Form",
  "General File",
];

const mockPatients = [
  "Maria Johnson",
  "John Smith",
  "Ana Garcia",
  "Carlos Rodriguez",
  "Lisa Williams",
];

export default function Documents() {
  const [documents] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadNotes, setUploadNotes] = useState("");

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedDocumentType === "all" || !selectedDocumentType || doc.type === selectedDocumentType;
    
    return matchesSearch && matchesType;
  });

  const handleUploadDocument = () => {
    // Here you would integrate with GoHighLevel API
    toast({
      title: "Document Uploaded",
      description: "Document has been successfully uploaded and linked to patient.",
    });
    setUploadModalOpen(false);
    setSelectedPatient("");
    setSelectedDocumentType("");
    setUploadNotes("");
  };

  const handleDownload = (docName: string) => {
    toast({
      title: "Downloading",
      description: `Downloading ${docName}...`,
    });
  };

  const handleView = (docName: string) => {
    toast({
      title: "Opening Document",
      description: `Opening ${docName} for preview...`,
    });
  };

  const handleDelete = (docName: string) => {
    toast({
      title: "Document Deleted",
      description: `${docName} has been removed from the system.`,
      variant: "destructive",
    });
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FolderOpen className="h-8 w-8 text-[#007BFF]" />
            <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          </div>
          
          <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#4DA8FF] hover:bg-[#007BFF] text-white">
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient-select">Patient</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockPatients.map((patient) => (
                        <SelectItem key={patient} value={patient}>
                          {patient}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file-upload">Upload File</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-[#4DA8FF] transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop your file here, or click to browse
                    </p>
                    <input type="file" className="hidden" id="file-upload" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes about this document..."
                    value={uploadNotes}
                    onChange={(e) => setUploadNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleUploadDocument}
                  className="w-full bg-[#4DA8FF] hover:bg-[#007BFF] text-white"
                  disabled={!selectedPatient || !selectedDocumentType}
                >
                  Upload Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by patient name, file name, or case ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="md:w-64">
                <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Documents ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Referral Source</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Added By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-[#007BFF]" />
                          <span className="text-[#007BFF] hover:underline cursor-pointer">
                            {doc.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#007BFF] hover:underline cursor-pointer">
                          {doc.patient}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.referralSource}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.uploadDate}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {doc.addedBy}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleView(doc.name)}
                            className="h-8 w-8 text-muted-foreground hover:text-[#007BFF]"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(doc.name)}
                            className="h-8 w-8 text-muted-foreground hover:text-[#007BFF]"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc.name)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No documents found matching your search criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </Layout>
    </AuthGuard>
  );
}