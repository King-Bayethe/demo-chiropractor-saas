import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Edit, 
  Mail, 
  Phone,
  Languages,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface CommunicationsCardProps {
  patient: any;
  isEditing: boolean;
  onEdit: () => void;
  form?: any;
}

export const CommunicationsCard: React.FC<CommunicationsCardProps> = ({
  patient,
  isEditing,
  onEdit,
  form
}) => {
  const hasCommunicationData = patient.preferred_language || patient.alternative_communication ||
                              patient.email_consent || patient.release_information ||
                              patient.consent_acknowledgement || patient.patient_signature;

  const renderConsentStatus = (consent: any) => {
    if (consent === true || consent === 'yes' || consent === 'granted') {
      return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">Granted</Badge>;
    } else if (consent === false || consent === 'no' || consent === 'denied') {
      return <Badge variant="destructive">Denied</Badge>;
    } else if (consent) {
      return <Badge variant="outline">{consent}</Badge>;
    }
    return <Badge variant="secondary">Not specified</Badge>;
  };

  const renderReleaseInfo = (releaseInfo: any) => {
    if (!releaseInfo || typeof releaseInfo !== 'object') return null;
    
    return Object.entries(releaseInfo).map(([key, value]) => {
      if (value && value !== '') {
        return (
          <div key={key} className="bg-blue-50 p-3 rounded-md border border-blue-200 mb-2">
            <span className="text-xs font-medium text-blue-600">
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </span>
            <p className="text-sm text-blue-700 mt-1">
              {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
            </p>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Communications & Legal
        </CardTitle>
        <Button 
          onClick={onEdit} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasCommunicationData ? (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No communication preferences recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Language Preferences */}
            {patient.preferred_language && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Languages className="h-4 w-4 text-blue-500" />
                  Language Preferences
                </h4>
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-700">{patient.preferred_language}</p>
                </div>
              </div>
            )}

            {/* Alternative Communication */}
            {patient.alternative_communication && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  Alternative Communication
                </h4>
                <p className="text-sm bg-green-50 p-3 rounded-md border border-green-200 text-green-700">
                  {patient.alternative_communication}
                </p>
              </div>
            )}

            {/* Email Consent */}
            {patient.email_consent && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-purple-500" />
                  Email Communication Consent
                </h4>
                <div className="flex items-center gap-2">
                  {renderConsentStatus(patient.email_consent)}
                  {patient.email_consent === 'yes' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {patient.email_consent === 'no' && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            )}

            {/* Release Information */}
            {patient.release_information && Object.keys(patient.release_information).length > 0 && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Release Information
                </h4>
                <div className="space-y-2">
                  {renderReleaseInfo(patient.release_information)}
                </div>
              </div>
            )}

            {/* Consent Acknowledgement */}
            {patient.consent_acknowledgement !== null && patient.consent_acknowledgement !== undefined && (
              <div className="space-y-3 pb-4 border-b">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  General Consent
                </h4>
                <div className="flex items-center gap-2">
                  {renderConsentStatus(patient.consent_acknowledgement)}
                  {patient.consent_acknowledgement && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            )}

            {/* Patient Signature */}
            {(patient.patient_signature || patient.signature_date) && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  Signature Information
                </h4>
                <div className="space-y-2">
                  {patient.patient_signature && (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <span className="text-xs font-medium text-gray-600">Signature:</span>
                      <p className="text-sm text-gray-700 mt-1 font-serif italic">
                        {patient.patient_signature}
                      </p>
                    </div>
                  )}
                  {patient.signature_date && (
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <span className="text-xs font-medium text-gray-600">Date Signed:</span>
                      <p className="text-sm text-gray-700 mt-1">
                        {new Date(patient.signature_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};