import { Search, Command, Bell, User, ChevronDown, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Navigation = () => {
  const { toast } = useToast();

  const handleNotification = () => {
    toast({
      title: "Új értesítés",
      description: "Új statisztikai adatok érhetők el",
    });
  };

  const handleProfile = (action: string) => {
    toast({
      title: `Profil ${action}`,
      description: "Művelet végrehajtva",
    });
  };

  return (
    <nav className="winmix-nav w-full">
      <div className="flex items-center justify-between w-full">
        {/* WinMix Brand Logo */}
        <div className="flex items-center gap-4 lg:gap-8 min-w-0">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden winmix-btn-glass size-9 p-0 winmix-focus"
                aria-label="Menü megnyitása"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-xs glass-card border-r border-border">
              <div className="mt-8 flex flex-col gap-1">
                <a href="#" className="winmix-nav-item active px-3 py-3 text-base font-medium rounded-lg">Mérkőzések</a>
                <a href="#" className="winmix-nav-item px-3 py-3 text-base font-medium text-muted-foreground rounded-lg">Statisztikák</a>
                <a href="#" className="winmix-nav-item px-3 py-3 text-base font-medium text-muted-foreground rounded-lg">Eredmények</a>
              </div>
              <div className="relative mt-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                <Input placeholder="Keresés..." className="pl-10 w-full glass-input winmix-focus border-0" />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="size-9 sm:size-10 shrink-0 rounded-lg bg-gradient-violet flex items-center justify-center shadow-glow-violet">
              <span className="text-white font-bold text-lg sm:text-xl">W</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-base sm:text-lg leading-tight">WinMix</span>
              <span className="hidden xs:block text-xs text-muted-foreground truncate">Sports Analytics</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-1">
            <a 
              href="#" 
              className="winmix-nav-item active px-4 py-2 text-sm font-medium rounded-lg transition-all"
            >
              Mérkőzések
            </a>
            <a 
              href="#" 
              className="winmix-nav-item px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all"
            >
              Statisztikák
            </a>
            <a 
              href="#" 
              className="winmix-nav-item px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all"
            >
              Eredmények
            </a>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              placeholder="Keresés..."
              className="pl-10 w-40 lg:w-64 glass-input winmix-focus border-0"
            />
          </div>

          {/* Command Shortcut */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center gap-2 text-muted-foreground winmix-btn-glass px-3"
          >
            <Command className="size-4" />
            <span className="text-xs">⌘K</span>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotification}
              className="winmix-btn-glass size-9 p-0 winmix-focus"
            >
              <Bell className="size-4" />
            </Button>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-winmix-violet rounded-full border-2 border-background animate-pulse" />
          </div>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 winmix-btn-glass px-3 winmix-focus"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-violet flex items-center justify-center">
                  <User className="size-4 text-white" />
                </div>
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 glass-card border-0 mt-2"
            >
              <DropdownMenuItem 
                onClick={() => handleProfile("beállítások")}
                className="winmix-focus cursor-pointer"
              >
                Profil beállítások
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleProfile("kijelentkezés")}
                className="winmix-focus cursor-pointer"
              >
                Kijelentkezés
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;