import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/EnhancedLanguageContext";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Globe, MessageCircle, Calendar, FileText } from "lucide-react";

export const LanguageSettings = () => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const { settings: systemSettings, updateSetting: updateSystemSetting } = useSystemSettings();
  const { settings: userSettings, updateSetting: updateUserSetting } = useUserSettings();

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US Format)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (European Format)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO Format)' },
  ];

  const timeFormats = [
    { value: '12', label: '12-hour (3:30 PM)' },
    { value: '24', label: '24-hour (15:30)' },
  ];

  const numberFormats = [
    { value: 'US', label: '1,234.56 (US Format)' },
    { value: 'EU', label: '1.234,56 (European Format)' },
    { value: 'SPACE', label: '1 234,56 (Space Format)' },
  ];

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('language_preferences')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Interface Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Changes the language for all interface elements, forms, and notifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-patient-language">Default Patient Communication Language</Label>
              <Select 
                value={userSettings.default_patient_language || 'en'}
                onValueChange={(value) => updateUserSetting('default_patient_language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default language" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Default language for patient forms, emails, and communications
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Format Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Regional Formats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <Select 
                value={userSettings.date_format || 'MM/DD/YYYY'}
                onValueChange={(value) => updateUserSetting('date_format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-format">Time Format</Label>
              <Select 
                value={userSettings.time_format || '12'}
                onValueChange={(value) => updateUserSetting('time_format', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {timeFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="number-format">Number Format</Label>
            <Select 
              value={userSettings.number_format || 'US'}
              onValueChange={(value) => updateUserSetting('number_format', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select number format" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                {numberFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Affects how numbers, currencies, and measurements are displayed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-translate Patient Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically translate incoming patient messages to your language
                </p>
              </div>
              <Switch
                checked={userSettings.auto_translate_messages || false}
                onCheckedChange={(checked) => updateUserSetting('auto_translate_messages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Show Original Text</Label>
                <p className="text-sm text-muted-foreground">
                  Display original text alongside translations
                </p>
              </div>
              <Switch
                checked={userSettings.show_original_text || false}
                onCheckedChange={(checked) => updateUserSetting('show_original_text', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Medical Term Translations</Label>
                <p className="text-sm text-muted-foreground">
                  Use specialized medical terminology translations
                </p>
              </div>
              <Switch
                checked={userSettings.medical_translations || false}
                onCheckedChange={(checked) => updateUserSetting('medical_translations', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form & Document Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Forms & Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Multilingual Forms</Label>
                <p className="text-sm text-muted-foreground">
                  Enable patients to fill out forms in their preferred language
                </p>
              </div>
              <Switch
                checked={systemSettings.multilingual_forms || false}
                onCheckedChange={(checked) => updateSystemSetting('multilingual_forms', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Auto-detect Patient Language</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically detect and set patient's preferred language
                </p>
              </div>
              <Switch
                checked={systemSettings.auto_detect_language || false}
                onCheckedChange={(checked) => updateSystemSetting('auto_detect_language', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Translation Status</Label>
              <p className="text-sm text-muted-foreground">
                Current system translation coverage
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">English: 100%</div>
              <div className="text-sm text-muted-foreground">Spanish: 100%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};