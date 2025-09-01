import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, Eye, Trash2, FileText, Search, Plus, Loader2, FolderOpen, MoreVertical } from 'lucide-react';
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Define the document interface
interface Document {
  id: string;
  name: string;
  type: string;
  patient_id?: string;
  patient_name?: string;
  category: string;
  file_path: string;
  file_size?: number;
  file_type: string;
  description?: string;
  referral_source?: string;
  status: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

// Patient interface for select options
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState('All');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'General',
    category: 'General',
    description: '',
    referral_source: '',
    patient_id: ''
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Fetch documents and patients on component mount
  useEffect(() => {
    fetchDocuments();
    fetchPatients();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, email')
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  // Filter documents based on search term and document type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.patient_name && doc.patient_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedDocumentType === 'All' || doc.type === selectedDocumentType;
    const matchesPatient = selectedPatient === 'All' || doc.patient_name === selectedPatient;
    
    return matchesSearch && matchesType && matchesPatient;
  });

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadForm.name) {
        setUploadForm(prev => ({ ...prev, name: file.name }));
      }
    }
  };

  // Handle document upload
  const handleUploadDocument = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          name: uploadForm.name,
          type: uploadForm.type,
          patient_id: uploadForm.patient_id || null,
          patient_name: uploadForm.patient_id ? 
            patients.find(p => p.id === uploadForm.patient_id)?.first_name + ' ' + 
            patients.find(p => p.id === uploadForm.patient_id)?.last_name : null,
          category: uploadForm.category,
          file_path: filePath,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          description: uploadForm.description,
          referral_source: uploadForm.referral_source,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'active'
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Reset form and refresh documents
      setUploadModalOpen(false);
      setSelectedFile(null);
      setUploadForm({
        name: '',
        type: 'General',
        category: 'General',
        description: '',
        referral_source: '',
        patient_id: ''
      });
      await fetchDocuments();

    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle actions
  const handleDownload = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .download(doc.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Downloading ${doc.name}`,
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive"
      });
    }
  };

  const handleView = async (doc: Document) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 60);

      if (error) throw error;

      window.open(data.signedUrl, '_blank');
      toast({
        title: "Opening Document",
        description: `Opening ${doc.name} for viewing`,
      });
    } catch (error) {
      console.error('Error viewing document:', error);
      toast({
        title: "Error",
        description: "Failed to open document",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Are you sure you want to delete ${doc.name}?`)) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      toast({
        title: "Document Deleted",
        description: `${doc.name} has been deleted`,
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-full overflow-hidden">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-3">
              <FolderOpen className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-3xl font-bold text-foreground">Documents</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  Manage and organize all documents ({documents.length} total)
                </p>
              </div>
            </div>
            
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
              <DialogTrigger asChild>
                <Button size={isMobile ? "sm" : "default"} className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] mx-3 md:mx-0">
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                  <DialogDescription>
                    Upload a new document to the system. Fill in the details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Document Name</Label>
                    <Input 
                      id="name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter document name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="patient">Patient (Optional)</Label>
                    <Select value={uploadForm.patient_id} onValueChange={(value) => setUploadForm(prev => ({ ...prev, patient_id: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No patient</SelectItem>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="document-type">Document Type</Label>
                    <Select value={uploadForm.type} onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Insurance">Insurance</SelectItem>
                        <SelectItem value="Medical">Medical</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Treatment">Treatment</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={uploadForm.category} onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Claims">Claims</SelectItem>
                        <SelectItem value="Records">Records</SelectItem>
                        <SelectItem value="Correspondence">Correspondence</SelectItem>
                        <SelectItem value="Plans">Plans</SelectItem>
                        <SelectItem value="Referrals">Referrals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="referral-source">Referral Source (Optional)</Label>
                    <Input 
                      id="referral-source"
                      value={uploadForm.referral_source}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, referral_source: e.target.value }))}
                      placeholder="Enter referral source"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="file">File Upload</Label>
                    <Input 
                      id="file" 
                      type="file" 
                      className="cursor-pointer" 
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground break-words">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea 
                      id="description"
                      placeholder="Add any additional notes about this document..."
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                  <Button variant="outline" onClick={() => setUploadModalOpen(false)} disabled={uploading} className="w-full md:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleUploadDocument} disabled={uploading || !selectedFile} className="w-full md:w-auto">
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filter Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 flex-shrink-0" />
                <Input
                  placeholder="Search by document name or patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Patients</SelectItem>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={`${patient.first_name} ${patient.last_name}`}>
                          {patient.first_name} {patient.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Types</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Insurance">Insurance</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg">
                Documents ({filteredDocuments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mobile View */}
              {isMobile ? (
                <div className="space-y-3">
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-2">No documents found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <Card key={doc.id} className="border border-border">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between min-w-0">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-sm break-words">{doc.name}</h3>
                                {doc.description && (
                                  <p className="text-xs text-muted-foreground mt-1 break-words">{doc.description}</p>
                                )}
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 ml-2">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleView(doc)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(doc)} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="text-xs">{doc.type}</Badge>
                              <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div>
                                <span className="font-medium">Patient:</span>
                                <div className="break-words">{doc.patient_name || 'None'}</div>
                              </div>
                              <div>
                                <span className="font-medium">Size:</span>
                                <div>{formatFileSize(doc.file_size)}</div>
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium">Added:</span>
                                <div>{new Date(doc.created_at).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                /* Desktop Table View */
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center space-y-2">
                              <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
                              <p className="text-muted-foreground">No documents found</p>
                              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDocuments.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p>{doc.name}</p>
                                {doc.description && (
                                  <p className="text-sm text-muted-foreground">{doc.description}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{doc.type}</Badge>
                            </TableCell>
                            <TableCell>{doc.patient_name || '-'}</TableCell>
                            <TableCell>{doc.category}</TableCell>
                            <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleView(doc)}
                                  title="View document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(doc)}
                                  title="Download document"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(doc)}
                                  title="Delete document"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default Documents;