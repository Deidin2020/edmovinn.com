import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type Session } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, ShoppingCart, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { MobileFilterSheet } from "./MobileFilterSheet";
import { useLanguage } from "@/contexts/LanguageContext";
const movinnLogo = "/img/edmovinn-logo-Main.png";

interface HeaderProps {
  onToggleFilters?: () => void;
  showFilters?: boolean;
}

export const Header = ({ onToggleFilters, showFilters }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const cartItemCount = getTotalItems();
  const navigate = useNavigate();
  const session = useQuery({
    queryKey: ["student-session"],
    queryFn: () => api<Session>("/tenant/me"),
    retry: false,
    staleTime: 30000,
  });
  const menuLabel =
    language === "ar" ? "القائمة الرئيسية" : language === "tr" ? "Ana menü" : "Main menu";
  const accountLabel = language === "ar" ? "حسابي" : language === "tr" ? "Hesabım" : "My account";

  const handleLanguageSwitch = (lang: "en" | "ar" | "tr") => {
    setLanguage(lang);
    if (window.location.pathname === "/ar") navigate("/");
  };

  return (
    <header
      className={`bg-white shadow-sm border-b border-border fixed top-0 left-0 right-0 z-50 ${isRTL ? "rtl" : "ltr"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img src={movinnLogo} alt="Movinn Logo" className="h-[50px] w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-4">
            <Link
              to="/"
              className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
            >
              {t("header.home")}
            </Link>
            <Link
              to="/accommodations"
              className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
            >
              {t("labels.accommodations")}
            </Link>
            <Link
              to="/search"
              className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
            >
              {t("labels.rooms")}
            </Link>
            <Link
              to="/about"
              className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
            >
              {t("header.about")}
            </Link>
            <Link
              to="/contact"
              className="text-muted-foreground hover:text-primary transition-colors px-3 py-2 text-sm font-medium"
            >
              {t("header.contact")}
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden xl:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{t("header.language")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
                <DropdownMenuItem onClick={() => handleLanguageSwitch("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleLanguageSwitch("tr")}
                  className="cursor-pointer hover:bg-muted"
                >
                  🇹🇷 Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleLanguageSwitch("ar")}
                  className="cursor-pointer hover:bg-muted"
                >
                  🇸🇦 العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              to="/cart"
              className="relative"
              aria-label={language === "ar" ? "السلة" : language === "tr" ? "Sepet" : "Cart"}
            >
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            {session.data ? (
              <Button asChild size="sm">
                <Link to="/dashboard">{accountLabel}</Link>
              </Button>
            ) : (
              <>
                <Link to="/auth?tab=signin">
                  <Button variant="outline" size="sm">
                    {t("header.signin")}
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {t("header.signup")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label={t("header.language")}>
                  <Globe className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border border-border shadow-lg z-50">
                <DropdownMenuItem onClick={() => handleLanguageSwitch("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleLanguageSwitch("tr")}
                  className="cursor-pointer hover:bg-muted"
                >
                  🇹🇷 Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleLanguageSwitch("ar")}
                  className="cursor-pointer hover:bg-muted"
                >
                  🇸🇦 العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link
              to="/cart"
              className="relative"
              aria-label={language === "ar" ? "السلة" : language === "tr" ? "Sepet" : "Cart"}
            >
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" aria-label={menuLabel}>
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isRTL ? "left" : "right"}
                className="w-80 max-w-full overflow-y-auto"
              >
                <SheetTitle className="sr-only">{menuLabel}</SheetTitle>
                <SheetDescription className="sr-only">{t("header.language")}</SheetDescription>
                <div className="flex flex-col space-y-4 mt-6">
                  <Link
                    to="/"
                    className="text-foreground hover:text-primary transition-colors px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("header.home")}
                  </Link>
                  <Link
                    to="/accommodations"
                    className="text-foreground hover:text-primary transition-colors px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("labels.accommodations")}
                  </Link>
                  <Link
                    to="/search"
                    className="text-foreground hover:text-primary transition-colors px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("labels.rooms")}
                  </Link>
                  <Link
                    to="/about"
                    className="text-foreground hover:text-primary transition-colors px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("header.about")}
                  </Link>
                  <Link
                    to="/contact"
                    className="text-foreground hover:text-primary transition-colors px-3 py-2 text-base font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("header.contact")}
                  </Link>
                  <div className="pt-4 border-t border-border space-y-2">
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">{t("header.language")}</p>
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => {
                            handleLanguageSwitch("tr");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          🇹🇷 Türkçe
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => {
                            handleLanguageSwitch("ar");
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          🇸🇦 العربية
                        </Button>
                      </div>
                    </div>
                    {session.data ? (
                      <Button asChild className="w-full">
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                          {accountLabel}
                        </Link>
                      </Button>
                    ) : (
                      <>
                        <Link to="/auth?tab=signin">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {t("header.signin")}
                          </Button>
                        </Link>
                        <Link to="/auth?tab=signup">
                          <Button
                            className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {t("header.signup")}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button - Only show on main page */}
      {onToggleFilters && (
        <div className="xl:hidden bg-secondary/10 px-4 py-2 border-t border-border">
          <MobileFilterSheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen} />
        </div>
      )}
    </header>
  );
};
