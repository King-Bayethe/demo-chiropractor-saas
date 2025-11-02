import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LucideIcon } from "lucide-react";

interface FormTypeCardProps {
  title: string;
  description: string;
  url: string;
  icon: LucideIcon;
  color: string;
  borderColor: string;
}

export const FormTypeCard = ({ title, description, url, icon: Icon, color, borderColor }: FormTypeCardProps) => {
  const { toast } = useToast();

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Link Copied",
      description: "Form URL has been copied to clipboard"
    });
  };

  const handleOpenForm = () => {
    window.open(url, '_blank');
  };

  return (
    <Card className={`${borderColor} border-2 hover:shadow-lg transition-all duration-300 group`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`${color.replace('text-', 'bg-')}/10 p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className={`font-semibold text-lg ${color}`}>{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleOpenForm}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Form
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleCopyLink}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
