import { Link, useLocation } from "react-router-dom";
import { Plus, Upload, Search, Package, BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg md:text-xl font-semibold text-foreground">FreightFlow</span>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center gap-1">
            <Link to="/">
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 transition-all ${isActive("/")
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/import">
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 transition-all ${isActive("/import")
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Import Data
              </Button>
            </Link>
            <Link to="/export">
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 transition-all ${isActive("/export")
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                Export Data
              </Button>
            </Link>
            <Link to="/analytics">
              <Button
                variant="ghost"
                className={`rounded-none border-b-2 transition-all ${isActive("/analytics")
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </div>

          {/* Desktop Search and Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Add Record</span>
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden lg:inline">Upload Excel</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Access different sections of the application.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/" onClick={() => document.querySelector('[data-state="open"]')?.parentElement?.click()}>
                  <Button
                    variant={isActive("/") ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link to="/import" onClick={() => document.querySelector('[data-state="open"]')?.parentElement?.click()}>
                  <Button
                    variant={isActive("/import") ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    Import Data
                  </Button>
                </Link>
                <Link to="/export" onClick={() => document.querySelector('[data-state="open"]')?.parentElement?.click()}>
                  <Button
                    variant={isActive("/export") ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    Export Data
                  </Button>
                </Link>
                <Link to="/analytics" onClick={() => document.querySelector('[data-state="open"]')?.parentElement?.click()}>
                  <Button
                    variant={isActive("/analytics") ? "default" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Button>
                </Link>

                <div className="border-t pt-4 mt-4 space-y-2">
                  <Button size="sm" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Record
                  </Button>
                  <Button size="sm" variant="outline" className="w-full gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Excel
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
