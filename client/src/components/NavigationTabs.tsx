import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    "Live Map",
    "Flight Status",
    "Airports",
    "Routes",
    "Aircraft",
    "Statistics",
    "Weather"
  ];

  return (
    <div className="border-b border-neutral-200 bg-white">
      <div className="max-w-8xl mx-auto px-4 md:px-8">
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
          <TabsList className="h-10 bg-transparent overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
