import { Button } from "@/components/ui/button";
import { ChevronRight, Home, FileText, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SOAPNoteBreadcrumbProps {
  patientName?: string;
  patientId?: string;
  soapNoteId?: string;
  currentPage: 'list' | 'view' | 'edit' | 'new';
}

export function SOAPNoteBreadcrumb({ 
  patientName, 
  patientId, 
  soapNoteId,
  currentPage 
}: SOAPNoteBreadcrumbProps) {
  const navigate = useNavigate();

  const breadcrumbItems = [
    {
      label: "SOAP Notes",
      path: "/soap-notes",
      icon: Home,
      isActive: currentPage === 'list'
    }
  ];

  if (patientName && patientId) {
    breadcrumbItems.push({
      label: patientName,
      path: `/patients/${patientId}`,
      icon: User,
      isActive: false
    });
  }

  if (currentPage === 'view' && soapNoteId) {
    breadcrumbItems.push({
      label: "View Note",
      path: `/soap-notes/${soapNoteId}/view`,
      icon: FileText,
      isActive: true
    });
  }

  if (currentPage === 'edit' && soapNoteId) {
    breadcrumbItems.push({
      label: "Edit Note",
      path: `/soap-notes/${soapNoteId}/edit`,
      icon: FileText,
      isActive: true
    });
  }

  if (currentPage === 'new') {
    breadcrumbItems.push({
      label: "New Note",
      path: "/soap-notes/new",
      icon: FileText,
      isActive: true
    });
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {breadcrumbItems.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(item.path)}
            className={`h-auto p-1 ${item.isActive ? 'text-primary font-medium' : 'hover:text-foreground'}`}
          >
            <item.icon className="w-4 h-4 mr-1" />
            {item.label}
          </Button>
        </div>
      ))}
    </nav>
  );
}