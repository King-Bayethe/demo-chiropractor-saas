import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Phone, Mail, Calendar } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formType = searchParams.get('type') || 'form';

  const getFormTypeDisplay = (type: string) => {
    switch (type) {
      case 'lop':
        return 'Letter of Protection (LOP) Form';
      case 'cash':
        return 'Cash Patient Intake Form';
      case 'pip':
        return 'PIP Intake Form';
      default:
        return 'Form';
    }
  };

  const getNextSteps = (type: string) => {
    switch (type) {
      case 'lop':
        return [
          "Our team will review your Letter of Protection submission",
          "We'll coordinate with your attorney's office",
          "A member of our staff will contact you within 24 hours to schedule your appointment",
          "Please ensure your attorney has sent the Letter of Protection to our office"
        ];
      case 'cash':
        return [
          "Our team will review your cash patient intake information",
          "A member of our staff will contact you within 24 hours to schedule your appointment",
          "Please have your insurance information ready for your visit",
          "Treatment plans and payment options will be discussed during your consultation"
        ];
      case 'pip':
        return [
          "Our team will review your PIP intake submission",
          "We'll coordinate with your insurance company",
          "A member of our staff will contact you within 24 hours to schedule your appointment",
          "Please have your auto insurance information and claim number ready"
        ];
      default:
        return [
          "Our team will review your submission",
          "A member of our staff will contact you within 24 hours",
          "Please keep an eye on your phone and email for updates"
        ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Thank You!
            </CardTitle>
            <p className="text-lg text-gray-600">
              Your {getFormTypeDisplay(formType).toLowerCase()} has been submitted successfully
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Confirmation Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Submission Confirmed</h3>
                  <p className="text-green-700 text-sm">
                    We've received your information and our team is already reviewing your case.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                What Happens Next?
              </h3>
              <ul className="space-y-2">
                {getNextSteps(formType).map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Need Immediate Assistance?</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-blue-800">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">Call us: (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-blue-800">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">Email: info@silvermancare.com</span>
                </div>
              </div>
              <p className="text-blue-700 text-xs mt-2">
                Our office hours: Monday - Friday, 8:00 AM - 6:00 PM
              </p>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">Important Reminders</h3>
              <ul className="text-amber-800 text-sm space-y-1">
                <li>• Please answer calls from our office number</li>
                <li>• Check your email (including spam folder) regularly</li>
                <li>• Bring a valid ID and insurance cards to your appointment</li>
                {formType === 'lop' && (
                  <li>• Ensure your attorney has sent the Letter of Protection</li>
                )}
                {(formType === 'pip' || formType === 'cash') && (
                  <li>• Have your auto insurance information ready</li>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={() => navigate('/')} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.print()}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Print Confirmation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThankYou;