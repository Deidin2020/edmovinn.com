import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Calendar, CreditCard, Building, Banknote } from "lucide-react";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const checkoutSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  universityName: z.string().min(2, "University name is required"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  nationality: z.string().min(2, "Nationality is required"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyContactRelation: z.string().min(2, "Emergency contact relation is required"),
  paymentMethod: z.enum(["property", "bank", "credit"], {
    required_error: "Please select a payment method",
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { items, getTotal, clearCart } = useCart();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData | null>(null);
  const [termsAccepted, setTermsAccepted] = useState({
    rules: false,
    turkishLaw: false,
    paymentRules: false,
    createAccount: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [card, setCard] = useState({ holder: "", number: "", expiry: "", cvc: "" });
  const [selectedMethod, setSelectedMethod] = useState<"property" | "bank" | "credit" | undefined>(undefined);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setFormData(data);
    setShowTermsDialog(true);
  };

  const handleFinalSubmit = async () => {
    if (!formData || !termsAccepted.rules || !termsAccepted.turkishLaw || !termsAccepted.paymentRules || !termsAccepted.createAccount) {
      toast({
        title: "Terms Required",
        description: "Please accept all terms and conditions to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Demo mode: no network request
      await new Promise((r) => setTimeout(r, 500));

      toast({
        title: "Account Created & Booking Submitted!",
        description: "Your account has been created and booking submitted successfully. You are now logged in.",
      });

      // Clear cart and close dialog
      clearCart();
      setShowTermsDialog(false);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Checkout submit error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "There was an error submitting your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/">
            <Button>Browse Accommodations</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground font-medium">Checkout</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('checkout.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-muted-foreground text-xs">{item.location}</p>
                      <p className="text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price + item.deposit) * item.quantity}</p>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('checkout.total')}</span>
                    <span className="text-primary">${getTotal()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('checkout.paymentMethod')}</CardTitle>
                    <CardDescription>{t('checkout.choosePayment')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(val) => { field.onChange(val); setSelectedMethod(val as any); }}
                              value={selectedMethod}
                              className="space-y-4"
                            >
                              <div className="space-y-3 border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="property" id="property" />
                                  <Building className="w-5 h-5 text-muted-foreground" />
                                  <label htmlFor="property" className="flex-1 cursor-pointer">
                                    <div className="font-medium">{t('checkout.payAtProperty')}</div>
                                    <div className="text-sm text-muted-foreground">{t('checkout.payAtPropertyDesc')}</div>
                                  </label>
                                </div>
                                {selectedMethod === 'property' && (
                                  <div className="ml-8 pl-4 border-l-2 border-muted space-y-2">
                                    <Alert>
                                      <AlertTitle>Payment Instructions</AlertTitle>
                                      <AlertDescription>
                                        Please visit the accommodation and complete your payment within <strong>48 hours</strong> of booking. 
                                        Bring a valid ID and your booking confirmation email.
                                      </AlertDescription>
                                    </Alert>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-3 border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="bank" id="bank" />
                                  <Banknote className="w-5 h-5 text-muted-foreground" />
                                  <label htmlFor="bank" className="flex-1 cursor-pointer">
                                    <div className="font-medium">{t('checkout.bankTransfer')}</div>
                                    <div className="text-sm text-muted-foreground">{t('checkout.bankTransferDesc')}</div>
                                  </label>
                                </div>
                                {selectedMethod === 'bank' && (
                                  <div className="ml-8 pl-4 border-l-2 border-muted space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Bank Name</span>
                                        <div className="font-medium">Ziraat Bankası</div>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Account Name</span>
                                        <div className="font-medium">MovInn Accommodation LTD</div>
                                      </div>
                                      <div className="md:col-span-2">
                                        <span className="text-muted-foreground">IBAN</span>
                                        <div className="font-mono text-xs tracking-wide select-all bg-secondary/20 p-2 rounded">TR12 3456 7890 1234 5678 9012 34</div>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">SWIFT/BIC</span>
                                        <div className="font-medium">TCZBTR2A</div>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="receipt">Upload Transfer Receipt (JPG/PNG/PDF)</Label>
                                      <Input id="receipt" type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} />
                                      {receiptFile && <p className="text-xs text-muted-foreground">Selected: {receiptFile.name}</p>}
                                    </div>
                                    <Alert className="mt-2">
                                      <AlertTitle>Important Note</AlertTitle>
                                      <AlertDescription>
                                        Include your full name and booking email as the transfer reference. We will verify payment within 24 hours.
                                      </AlertDescription>
                                    </Alert>
                                  </div>
                                )}
                              </div>
                              
                              <div className="space-y-3 border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                  <RadioGroupItem value="credit" id="credit" />
                                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                                  <label htmlFor="credit" className="flex-1 cursor-pointer">
                                    <div className="font-medium">{t('checkout.creditCard')}</div>
                                    <div className="text-sm text-muted-foreground">{t('checkout.creditCardDesc')}</div>
                                  </label>
                                </div>
                                {selectedMethod === 'credit' && (
                                  <div className="ml-8 pl-4 border-l-2 border-muted space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="cc-holder">Cardholder Name</Label>
                                        <Input id="cc-holder" placeholder="Name on card" value={card.holder} onChange={(e) => setCard({ ...card, holder: e.target.value })} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cc-number">Card Number</Label>
                                        <Input id="cc-number" inputMode="numeric" placeholder="1234 5678 9012 3456" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cc-exp">Expiry (MM/YY)</Label>
                                        <Input id="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="cc-cvc">CVC</Label>
                                        <Input id="cc-cvc" inputMode="numeric" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
                                      </div>
                                    </div>
                                    <Alert variant="destructive">
                                      <AlertTitle>Demo Notice</AlertTitle>
                                      <AlertDescription>This form collects card details for demonstration only and does not process real payments.</AlertDescription>
                                    </Alert>
                                  </div>
                                )}
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('checkout.personalInfo')}</CardTitle>
                    <CardDescription>{t('checkout.fillDetails')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.firstName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={`Enter your ${t('checkout.firstName').toLowerCase()}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.lastName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={`Enter your ${t('checkout.lastName').toLowerCase()}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('checkout.emailAddress')}</FormLabel>
                          <FormControl>
                            <Input placeholder={`Enter your ${t('checkout.emailAddress').toLowerCase()}`} type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.mobileNumber')}</FormLabel>
                            <FormControl>
                              <Input placeholder={`Enter your ${t('checkout.mobileNumber').toLowerCase()}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>{t('dashboard.dateOfBirth')}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                  }
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="universityName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.universityName')}</FormLabel>
                            <FormControl>
                              <Input placeholder={`Enter your ${t('checkout.universityName').toLowerCase()}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('dashboard.nationality')}</FormLabel>
                            <FormControl>
                              <Input placeholder={`Enter your ${t('dashboard.nationality').toLowerCase()}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('dashboard.address')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={`Enter your full ${t('dashboard.address').toLowerCase()}`}
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('checkout.emergencyContact')}</CardTitle>
                    <CardDescription>{t('checkout.emergencyContactDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('checkout.emergencyName')}</FormLabel>
                          <FormControl>
                            <Input placeholder={`Enter ${t('checkout.emergencyName').toLowerCase()}`} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.emergencyPhone')}</FormLabel>
                            <FormControl>
                              <Input placeholder={`Enter ${t('checkout.emergencyPhone').toLowerCase()}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emergencyContactRelation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('checkout.relation')}</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Parent, Sibling, Friend" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full">
                  {t('checkout.continueTerms')}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
            <DialogDescription>
              Please read and accept the following terms to complete your booking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="rules"
                checked={termsAccepted.rules}
                onCheckedChange={(checked) =>
                  setTermsAccepted(prev => ({ ...prev, rules: checked as boolean }))
                }
              />
              <label htmlFor="rules" className="text-sm leading-relaxed cursor-pointer">
                I have read the rules and accepted all terms and conditions of the accommodation.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="turkishLaw"
                checked={termsAccepted.turkishLaw}
                onCheckedChange={(checked) =>
                  setTermsAccepted(prev => ({ ...prev, turkishLaw: checked as boolean }))
                }
              />
              <label htmlFor="turkishLaw" className="text-sm leading-relaxed cursor-pointer">
                I commit to behave under the Turkish law during my residency.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="paymentRules"
                checked={termsAccepted.paymentRules}
                onCheckedChange={(checked) =>
                  setTermsAccepted(prev => ({ ...prev, paymentRules: checked as boolean }))
                }
              />
              <label htmlFor="paymentRules" className="text-sm leading-relaxed cursor-pointer">
                I have read and agreed to the payment rules and penalties.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="createAccount"
                checked={termsAccepted.createAccount}
                onCheckedChange={(checked) =>
                  setTermsAccepted(prev => ({ ...prev, createAccount: checked as boolean }))
                }
              />
              <label htmlFor="createAccount" className="text-sm leading-relaxed cursor-pointer">
                I agree to create a new account on the platform/website.
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowTermsDialog(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFinalSubmit}
              className="flex-1"
              disabled={!termsAccepted.rules || !termsAccepted.turkishLaw || !termsAccepted.paymentRules || !termsAccepted.createAccount || isSubmitting}
            >
              {isSubmitting ? "Creating Account & Booking..." : "Complete Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Checkout;