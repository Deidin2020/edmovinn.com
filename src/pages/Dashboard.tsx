import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Edit, FileText, CreditCard, MapPin, Phone, Mail, Calendar, GraduationCap, Globe, Home, DollarSign, Eye, Printer, Save, X, Upload, Camera } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import ProcessFlow from "@/components/ProcessFlow";
import InvoiceModal from "@/components/InvoiceModal";
// Demo data — the dashboard renders local demo content, no backend connection
const DEMO_PROFILE: any = {
  first_name: 'Ahmed',
  last_name: 'Mohamed',
  email: 'ahmed.mohamed@example.com',
  mobile: '+90 555 123 4567',
  university_name: 'Istanbul University',
  nationality: 'Egyptian',
  address: 'Kadikoy, Istanbul, Turkey',
  date_of_birth: '1999-05-14',
  avatar_url: '',
};

const DEMO_BOOKINGS: any[] = [
  {
    id: 'demo-booking-1',
    created_at: '2026-09-20T10:00:00Z',
    booking_status: 'confirmed',
    payment_status: 'paid',
    payment_method: 'Credit Card',
    total_amount: 1620,
    university_name: 'Istanbul University',
    cart_items: [
      { title: 'Student Accommodation 1 - Room 3', location: 'Adana, Turkey', quantity: 1, price: 1620, deposit: 405 },
    ],
  },
  {
    id: 'demo-booking-2',
    created_at: '2026-09-10T14:30:00Z',
    booking_status: 'pending',
    payment_status: 'pending',
    payment_method: 'Bank Transfer',
    total_amount: 1129,
    university_name: 'Istanbul University',
    cart_items: [
      { title: 'Student Accommodation 8 - Room 5', location: 'Adana, Turkey', quantity: 1, price: 1129, deposit: 282 },
    ],
  },
  {
    id: 'demo-booking-3',
    created_at: '2026-08-25T09:15:00Z',
    booking_status: 'paid',
    payment_status: 'paid',
    payment_method: 'Credit Card',
    total_amount: 1450,
    university_name: 'Istanbul University',
    cart_items: [
      { title: 'Student Accommodation 9 - Room 2', location: 'Adana, Turkey', quantity: 1, price: 1450, deposit: 362 },
    ],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    university_name: '',
    address: '',
    nationality: '',
    date_of_birth: ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Demo mode: render demo data immediately, no backend calls
    setUser({ id: 'demo-user', email: DEMO_PROFILE.email });
    setProfile(DEMO_PROFILE);
    setBookings(DEMO_BOOKINGS);
    setLoading(false);
  }, []);

  const handleSignOut = async () => {
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'paid': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'refunded': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const handleViewInvoice = (booking: any) => {
    setSelectedInvoice(booking);
    setIsInvoiceModalOpen(true);
  };

  const handleCloseInvoice = () => {
    setIsInvoiceModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleEditProfile = () => {
    setEditFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || user?.email || '',
      mobile: profile?.mobile || '',
      university_name: profile?.university_name || '',
      address: profile?.address || '',
      nationality: profile?.nationality || '',
      date_of_birth: profile?.date_of_birth || ''
    });
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditFormData({
      first_name: '',
      last_name: '',
      email: '',
      mobile: '',
      university_name: '',
      address: '',
      nationality: '',
      date_of_birth: ''
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Demo mode: update local state only
    setProfile({ ...(profile || DEMO_PROFILE), ...editFormData });
    setIsEditingProfile(false);

    toast({
      title: "Success",
      description: "Profile updated successfully! (Demo)",
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Demo mode: show the selected image locally without uploading
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev: any) => ({ ...(prev || DEMO_PROFILE), avatar_url: reader.result as string }));
      setUploadingAvatar(false);
      toast({
        title: "Success",
        description: "Profile photo updated successfully! (Demo)",
      });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('dashboard.overview')}</TabsTrigger>
            <TabsTrigger value="bookings">{t('dashboard.bookings')}</TabsTrigger>
            <TabsTrigger value="payments">{t('dashboard.payments')}</TabsTrigger>
            <TabsTrigger value="profile">{t('dashboard.profile')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.totalBookings')}</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.activeBookings')}</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'paid').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.totalSpent')}</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${bookings.reduce((sum, booking) => sum + Number(booking.total_amount), 0).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.recentBookings')}</CardTitle>
                <CardDescription>{t('dashboard.latestBookings')}</CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.slice(0, 3).map((booking) => {
                  const firstItem = Array.isArray(booking.cart_items) ? (booking.cart_items as any[])[0] : null;
                  return (
                    <div key={booking.id} className="py-3 border-b last:border-b-0">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">Booking #{booking.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(booking.booking_status)}>
                            {booking.booking_status}
                          </Badge>
                          <span className="font-medium">${booking.total_amount}</span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Home className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Room:</span>
                          <span className="font-medium">{firstItem?.title || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{firstItem?.location || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Payment:</span>
                          <span className="font-medium capitalize">{booking.payment_status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{t('checkout.total')}</span>
                          <span className="font-medium">${booking.total_amount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {bookings.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">{t('dashboard.noBookings')}</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.allBookings')}</CardTitle>
                <CardDescription>{t('dashboard.viewManageBookings')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">Booking #{booking.id.slice(0, 8)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {t('dashboard.createdOn')} {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(booking.booking_status)}>
                            {booking.booking_status}
                          </Badge>
                          <Badge className={getPaymentStatusColor(booking.payment_status)}>
                            {t('dashboard.payment')}: {booking.payment_status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">{t('dashboard.paymentMethod')}</p>
                          <p className="text-muted-foreground capitalize">{booking.payment_method}</p>
                        </div>
                        <div>
                          <p className="font-medium">{t('dashboard.totalAmount')}</p>
                          <p className="text-muted-foreground">${booking.total_amount}</p>
                        </div>
                        <div>
                          <p className="font-medium">{t('dashboard.university')}</p>
                          <p className="text-muted-foreground">{booking.university_name}</p>
                        </div>
                        <div>
                          <p className="font-medium">{t('dashboard.items')}</p>
                          <p className="text-muted-foreground">
                            {Array.isArray(booking.cart_items) ? booking.cart_items.length : 0} {t('dashboard.rooms')}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-4" />
                      <div>
                        <p className="font-medium mb-2">{t('dashboard.accommodationDetails')}</p>
                        <div className="space-y-2">
                          {Array.isArray(booking.cart_items) && booking.cart_items.map((item: any, index: number) => (
                            <div key={index} className="bg-secondary/20 p-3 rounded-lg">
                              <div className="flex justify-between">
                                <div>
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-sm text-muted-foreground">{item.location}</p>
                                  <p className="text-sm">{t('dashboard.quantity')}: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${(item.price + item.deposit) * item.quantity}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ${item.price}/{t('dashboard.month')} + ${item.deposit} {t('dashboard.deposit')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="my-4" />
                      <div className="mt-4">
                        <ProcessFlow booking={booking} cartItem={Array.isArray(booking.cart_items) ? (booking.cart_items as any[])[0] : null} />
                      </div>
                    </Card>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('dashboard.noBookings')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.paymentHistory')}</CardTitle>
                <CardDescription>{t('dashboard.trackPayments')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <CreditCard className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Booking #{booking.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.created_at).toLocaleDateString()} • {booking.payment_method}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">${booking.total_amount}</p>
                          <Badge className={getPaymentStatusColor(booking.payment_status)}>
                            {booking.payment_status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewInvoice(booking)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            {t('dashboard.viewInvoice')}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(booking);
                              setIsInvoiceModalOpen(true);
                              setTimeout(() => window.print(), 100);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Printer className="w-4 h-4" />
                            {t('dashboard.print')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">{t('dashboard.noPayments')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.personalInfo')}</CardTitle>
                <CardDescription>
                  {isEditingProfile ? t('dashboard.editPersonalDetails') : t('dashboard.viewManagePersonalDetails')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="text-lg">
                          {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        {uploadingAvatar ? t('dashboard.uploading') : t('dashboard.changePhoto')}
                      </Button>
                      <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>

                  <Separator />

                  {isEditingProfile ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">{t('checkout.firstName')}</Label>
                          <Input
                            id="first_name"
                            value={editFormData.first_name}
                            onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">{t('checkout.lastName')}</Label>
                          <Input
                            id="last_name"
                            value={editFormData.last_name}
                            onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">{t('dashboard.email')}</Label>
                          <Input
                            id="email"
                            type="email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mobile">{t('dashboard.mobile')}</Label>
                          <Input
                            id="mobile"
                            value={editFormData.mobile}
                            onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="university_name">{t('dashboard.university')}</Label>
                          <Input
                            id="university_name"
                            value={editFormData.university_name}
                            onChange={(e) => setEditFormData({ ...editFormData, university_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nationality">{t('dashboard.nationality')}</Label>
                          <Input
                            id="nationality"
                            value={editFormData.nationality}
                            onChange={(e) => setEditFormData({ ...editFormData, nationality: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date_of_birth">{t('dashboard.dateOfBirth')}</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={editFormData.date_of_birth}
                            onChange={(e) => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">{t('dashboard.address')}</Label>
                          <Input
                            id="address"
                            value={editFormData.address}
                            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleSaveProfile} className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          {t('dashboard.saveChanges')}
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} className="flex items-center gap-2">
                          <X className="w-4 h-4" />
                          {t('dashboard.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-end">
                        <Button onClick={handleEditProfile} className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          {t('dashboard.editProfile')}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{t('dashboard.fullName')}</p>
                              <p className="text-muted-foreground">
                                {profile?.first_name} {profile?.last_name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{t('dashboard.email')}</p>
                              <p className="text-muted-foreground">{profile?.email || user?.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{t('dashboard.mobile')}</p>
                              <p className="text-muted-foreground">{profile?.mobile || t('dashboard.notProvided')}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{t('dashboard.dateOfBirth')}</p>
                              <p className="text-muted-foreground">
                                {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : t('dashboard.notProvided')}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{t('dashboard.university')}</p>
                              <p className="text-muted-foreground">{profile?.university_name || t('dashboard.notProvided')}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{t('dashboard.nationality')}</p>
                              <p className="text-muted-foreground">{profile?.nationality || t('dashboard.notProvided')}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{t('dashboard.address')}</p>
                              <p className="text-muted-foreground">{profile?.address || t('dashboard.notProvided')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoice}
        booking={selectedInvoice}
      />
    </div>
  );
};

export default Dashboard;
