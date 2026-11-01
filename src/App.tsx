import { LegacyAuth } from "./pages/LegacyAuth";
import { LegacyCart, LegacyCheckout } from "./pages/LegacyBooking";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RouteScroll } from "@/components/RouteScroll";
import NotFound from "./pages/NotFound";

import { LanguageProvider } from "@/contexts/LanguageContext";
import BankPayment from "./pages/BankPayment";
import { ManagedPage } from "./components/ManagedPage";
import { LegacyRedirect, LegacyLanguageRoute } from "./components/LegacyRoute";
import { LegacyHome, LegacyAbout, LegacyContact } from "./pages/LegacyPages";
import { LegacySearch, LegacyRoom, LegacyAccommodation } from "./pages/LegacyCatalog";
import { StudentDashboard } from "./pages/StudentDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteScroll />
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 pt-16">
                <Routes>
                  <Route path="/" element={<LegacyHome />} />
                  <Route path="/search" element={<LegacySearch />} />
                  <Route path="/room/:id" element={<LegacyRoom />} />
                  <Route path="/rooms/:slug" element={<LegacyRoom />} />
                  <Route path="/accommodations" element={<LegacySearch propertiesOnly />} />
                  <Route path="/accommodations/:slug" element={<LegacyAccommodation />} />
                  <Route path="/dormitory/:id" element={<LegacyAccommodation />} />
                  <Route path="/about" element={<LegacyAbout />} />
                  <Route path="/terms" element={<ManagedPage slug="terms" />} />
                  <Route path="/privacy" element={<ManagedPage slug="privacy" />} />
                  <Route path="/contact" element={<LegacyContact />} />
                  <Route path="/cart" element={<LegacyCart />} />
                  <Route path="/checkout" element={<LegacyCheckout />} />
                  <Route path="/auth" element={<LegacyAuth />} />
                  <Route path="/dashboard" element={<StudentDashboard />} />
                  <Route path="/pay/:id" element={<BankPayment />} />
                  <Route path="/faq" element={<ManagedPage slug="faq" />} />
                  <Route path="/about_us" element={<Navigate to="/about" replace />} />
                  <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
                  <Route path="/terms-condition" element={<Navigate to="/terms" replace />} />
                  <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
                  <Route path="/faqs" element={<Navigate to="/faq" replace />} />
                  <Route
                    path="/signin"
                    element={<LegacyRedirect to="/auth" params={{ tab: "signin" }} />}
                  />
                  <Route
                    path="/signup"
                    element={<LegacyRedirect to="/auth" params={{ tab: "signup" }} />}
                  />
                  <Route
                    path="/auth/forgot-password"
                    element={<LegacyRedirect to="/auth" params={{ mode: "forgot" }} />}
                  />
                  <Route
                    path="/auth/reset-password"
                    element={<LegacyRedirect to="/auth" params={{ mode: "reset" }} />}
                  />
                  <Route
                    path="/checkout/payment-return"
                    element={<LegacyRedirect to="/dashboard" />}
                  />
                  <Route path="/:locale/*" element={<LegacyLanguageRoute />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
