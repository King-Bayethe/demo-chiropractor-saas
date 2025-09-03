import React from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Check } from 'lucide-react';

interface TabFormSectionProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (value: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    subtitle?: string;
    isCompleted?: boolean;
    row?: number;
  }>;
  className?: string;
}

export const TabFormSection: React.FC<TabFormSectionProps> = ({
  children,
  currentTab,
  onTabChange,
  tabs,
  className
}) => {
  // Group tabs by row
  const tabRows = tabs.reduce((acc, tab) => {
    const row = tab.row || 1;
    if (!acc[row]) acc[row] = [];
    acc[row].push(tab);
    return acc;
  }, {} as Record<number, typeof tabs>);

  const TabButton = ({ tab }: { tab: typeof tabs[0] }) => (
    <button
      type="button"
      onClick={() => onTabChange(tab.id)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
        currentTab === tab.id
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
      )}
    >
      {tab.isCompleted && (
        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
      )}
      <span className="text-center">
        {tab.label}
        {tab.subtitle && (
          <span className="block text-xs text-muted-foreground">
            {tab.subtitle}
          </span>
        )}
      </span>
    </button>
  );

  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className={cn("w-full", className)}>
      <div className="space-y-4 mb-8">
        {Object.entries(tabRows).map(([rowNum, rowTabs]) => (
          <div key={rowNum} className="flex flex-wrap justify-center gap-2 sm:gap-4 border-b border-border pb-2">
            {rowTabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} />
            ))}
          </div>
        ))}
      </div>
      
      {children}
    </Tabs>
  );
};

interface TabContentSectionProps {
  value: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const TabContentSection: React.FC<TabContentSectionProps> = ({
  value,
  title,
  subtitle,
  children,
  className
}) => {
  return (
    <TabsContent value={value} className={cn("mt-0", className)}>
      <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm border border-border/50">
        <div className="border-b border-border/50 pb-3">
          <h2 className="text-xl font-semibold text-foreground">
            {title}
            {subtitle && (
              <span className="text-muted-foreground ml-2">({subtitle})</span>
            )}
          </h2>
        </div>
        {children}
      </div>
    </TabsContent>
  );
};