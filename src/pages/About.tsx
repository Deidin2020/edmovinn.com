import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { 
  MapPin, 
  Clock, 
  Train, 
  Bus, 
  ShoppingBag,
  GraduationCap,
  Bed,
  Laptop,
  Wifi,
  Thermometer,
  CreditCard,
  Shield,
  Sparkles,
  BookOpen,
  Gamepad2,
  Dumbbell,
  Waves,
  UtensilsCrossed,
  WashingMachine,
  Building,
  ChevronLeft,
  ChevronRight,
  Settings,
  Users,
  Home,
  CheckCircle,
  ShieldCheck,
  Star,
  Shirt,
  KeyRound,
  Circle
} from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-about-new.png";
import mallIstanbulHero from "@/assets/mall-istanbul-hero.webp";
import beykentLogo from "@/assets/logos/beykent-university.jpg";
import sabahattinZaimLogo from "@/assets/logos/sabahattin-zaim-university.jpg";
import nisantasiLogo from "@/assets/logos/nisantasi-university.jpg";
import istanbulAydinLogo from "@/assets/logos/istanbul-aydin-university.jpg";
import istanbulBilgiLogo from "@/assets/logos/istanbul-bilgi-university.jpg";
import cardAccessIcon from "@/assets/icons/card-access.png";
import studyDeskIcon from "@/assets/icons/study-desk.png";
import wardrobeIcon from "@/assets/icons/wardrobe.png";
import cleaningIcon from "@/assets/icons/cleaning.png";
import mosqueIcon from "@/assets/icons/mosque.png";
import istinyeLogo from "@/assets/logos/istinye-university.jpg";
import kulturLogo from "@/assets/logos/kultur-university.jpg";
import gelisimLogo from "@/assets/logos/gelisim-university.jpg";
import nisantasiLogoNew from "@/assets/logos/nisantasi-university-new.jpg";
import beykentLogoNew from "@/assets/logos/beykent-university-new.jpg";
import altinbasLogo from "@/assets/logos/altinbas-university.jpg";
import roomModern from "@/assets/room-modern.jpg";
import roomLight from "@/assets/room-light.jpg";
import room1 from "@/assets/room1.jpg";
import room2 from "@/assets/room2.jpg";
import accommodationRef from "@/assets/accommodation-reference.png";
import dormitoryRef from "@/assets/dormitory-reference.png";

const galleryImages = [
  roomModern,
  roomLight,
  room1,
  room2,
  accommodationRef,
  dormitoryRef
];

export default function About() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Updated icons for better representation
  const facilities = [
    { icon: Shield, text: "7/24 güvenlik ve elektronik giriş kartları" },
    { icon: Sparkles, text: "Düzenli oda ve tesis temizliği" },
    { icon: BookOpen, text: "Kütüphane" },
    { icon: Gamepad2, text: "Etkinlik odası: PlayStation, bilardo, masa tenisi" },
    { icon: Dumbbell, text: "Spor salonu" },
    { icon: Waves, text: "Sauna ve Türk hamamı" },
    { icon: UtensilsCrossed, text: "Yemekhane (günlük açık büfe)" },
    { icon: WashingMachine, text: "Çamaşırhane" },
    { icon: Building, text: "Mescit" }
  ];

  const roomFeatures = [
    { icon: Bed, text: "Yatak" },
    { icon: Laptop, text: "Çalışma masası" },
    { icon: Shirt, text: "Kişisel dolap" },
    { icon: Wifi, text: "Yüksek hızlı internet" },
    { icon: Thermometer, text: "Merkezi ısıtma-soğutma" },
    { icon: CreditCard, text: "Elektronik öğrenci kartı ile giriş sistemi" }
  ];

  const walkingDistances = [
    { icon: ShoppingBag, place: "Mall of Istanbul", time: "9 dk" },
    { icon: Train, place: "Bahriye Metro İstasyonu", time: "12 dk" },
    { icon: Train, place: "Masko Metro İstasyonu", time: "7 dk" },
    { icon: Bus, place: "Otobüs durağı", time: "3 dk" }
  ];

  const universities = [
    { name: "Altınbaş Üniversitesi", time: "7 dk", transport: "otobüs", logo: altinbasLogo },
    { name: "Sabahattin Zaim Üniversitesi", time: "21 dk", transport: "otobüs/metro", logo: sabahattinZaimLogo },
    { name: "İstanbul Özel Üniversitesi", time: "22 dk", transport: "metro", logo: null },
    { name: "İstanbul Aydın Üniversitesi", time: "36 dk", transport: "metro", logo: istanbulAydinLogo },
    { name: "Kültür Üniversitesi", time: "29 dk", transport: "metro", logo: kulturLogo },
    { name: "Beykent Üniversitesi", time: "1 saat", transport: "metro + otobüs", logo: beykentLogoNew },
    { name: "Bilgi Üniversitesi", time: "55 dk", transport: "metro", logo: istanbulBilgiLogo },
    { name: "Nişantaşı Üniversitesi", time: "1 saat 27 dk", transport: "metro + otobüs", logo: nisantasiLogoNew },
    { name: "İstinye Üniversitesi", time: "41 dk", transport: "otobüs", logo: istinyeLogo },
    { name: "Gelişim Üniversitesi", time: "50 dk", transport: "metro + otobüs", logo: gelisimLogo }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="relative mb-8">
            <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-gradient-to-br from-green-primary/10 to-gold-primary/10 border-2 border-gold-primary/20">
              <img 
                src={heroImage} 
                alt="Movinn Öğrenci Yurdu Hero" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-green-primary">
              Movinn Öğrenci Yurdu
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Movinn, İstanbul'da modern otel konseptiyle tasarlanmış bir öğrenci yurdudur. Sadece bir konaklama alanı değil, aynı zamanda ikinci evinizdir. Stratejik konumu, kapsamlı hizmetleri ve uzman kadrosuyla sizlere konfor, güvenlik, akademik ve sosyal destek sunar.
            </p>
          </div>
        </section>

        {/* Why Choose Movinn */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">
            Neden Movinn'i Tercih Etmelisiniz?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3 text-green-primary">
                  <Settings className="h-6 w-6 text-gold-primary" />
                  Kapsamlı Hizmetler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Eşyalı odalar, yüksek hızlı internet, merkezi ısıtma-soğutma. Kayıt işlemleri hızlı ve basittir.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3 text-green-primary">
                  <MapPin className="h-6 w-6 text-gold-primary" />
                  Stratejik Konum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Mall of Istanbul'un karşısında, metro ve otobüs duraklarına birkaç dakika yürüme mesafesinde.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3 text-green-primary">
                  <Users className="h-6 w-6 text-gold-primary" />
                  Aktif Öğrenci Hayatı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Farklı üniversitelerden öğrencilerle sosyal aktiviteler ve etkinlikler sayesinde yeni arkadaşlıklar.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3 text-green-primary">
                  <Home className="h-6 w-6 text-gold-primary" />
                  Destek ve Özel Alan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tek kişilik ya da paylaşımlı oda tercih edin, her zaman yanınızda olan 7/24 idari ve güvenlik ekibimizle kendinizi güvende ve rahat hissedin.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3 text-green-primary">
                  <ShieldCheck className="h-6 w-6 text-gold-primary" />
                  Güvenlik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Modern güvenlik sistemleri, elektronik giriş kartları ve düzenli bakım ile güvenli konaklama.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-3 text-green-primary">
                  <Star className="h-6 w-6 text-gold-primary" />
                  Düzenli Hizmetler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Düzenli temizlik, yemekhane, kütüphane, spor salonu, sauna ve Türk hamamı, mescit.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Transportation Hero */}
        <section className="space-y-6">
          <div className="relative">
            <div className="aspect-[3/1] rounded-xl overflow-hidden bg-gradient-to-br from-green-primary/10 to-gold-primary/10 border border-gold-primary/20">
              <img 
                src={mallIstanbulHero} 
                alt="Mall of Istanbul ve Çevre - Kolay Ulaşım" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Transportation */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Kolay Ulaşım</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Movinn, Küçükçekmece Belediyesi sınırları içinde, Mall of Istanbul'un karşısında yer almaktadır. Basın Ekspres Caddesi ile TEM otoyolunun kesişiminde bulunan bu bölge, İstanbul'un önemli ulaşım ağlarının merkezindedir.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-primary">
                  <Clock className="h-5 w-5 text-gold-primary" />
                  Yürüme Mesafesinde
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {walkingDistances.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-green-primary/5 border border-green-primary/10">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-gold-primary" />
                      <span className="font-medium text-green-primary">{item.place}</span>
                    </div>
                     <Badge className="bg-green-primary/10 text-green-primary border-green-primary/20">{item.time}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-primary">
                  <GraduationCap className="h-5 w-5 text-gold-primary" />
                  Üniversitelere Kolay Ulaşım
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {universities.map((uni, index) => {
                  const getTransportIcon = () => {
                    if (uni.transport.includes('metro')) {
                      return (
                        <div className="relative">
                          <Circle className="h-4 w-4 text-gold-primary" fill="currentColor" />
                          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">M</span>
                        </div>
                      );
                    }
                    return <Bus className="h-4 w-4 text-gold-primary" />;
                  };

                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-green-primary/5 border border-green-primary/10">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-green-primary/20 overflow-hidden">
                          {uni.logo ? (
                            <img 
                              src={uni.logo} 
                              alt={`${uni.name} logo`} 
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <GraduationCap className="h-5 w-5 text-green-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-green-primary">{uni.name}</p>
                          <p className="text-xs text-muted-foreground">{uni.transport}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        {getTransportIcon()}
                        <Badge className="bg-green-primary/10 text-green-primary border-green-primary/20">{uni.time}</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Rooms and Equipment */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Farklı Oda Seçenekleri</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Movinn, farklı tercih ve bütçelere uygun çeşitli oda tipleri sunar: tek kişilik, çift kişilik, üç kişilik ve dört kişilik. Her oda, rahat ve verimli bir çalışma ortamı sunacak şekilde tasarlanmıştır.
            </p>
          </div>

          <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
            <CardHeader>
              <CardTitle className="text-green-primary">Oda Özellikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-green-primary/5 border border-green-primary/10 hover:border-green-primary/30 transition-colors">
                    <feature.icon className="h-5 w-5 text-gold-primary flex-shrink-0" />
                    <span className="font-medium text-green-primary">{feature.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Services and Facilities */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Konforlu Yaşam</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map((facility, index) => (
              <Card key={index} className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <facility.icon className="h-6 w-6 text-gold-primary flex-shrink-0" />
                    <span className="font-medium text-green-primary">{facility.text}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Image Gallery */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Galeri</h2>
          </div>

          <Card className="border-green-primary/20 bg-gradient-to-br from-green-primary/5 to-green-secondary/5 hover:shadow-lg transition-all duration-300 hover:border-green-primary/40">
            <CardContent className="p-6">
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted border-2 border-gold-primary/20">
                  <img 
                    src={galleryImages[currentImageIndex]} 
                    alt={`Movinn Gallery ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-green-primary/80 border-gold-primary/30 text-gold-primary backdrop-blur-sm hover:bg-green-primary hover:text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-primary/80 border-gold-primary/30 text-gold-primary backdrop-blur-sm hover:bg-green-primary hover:text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {galleryImages.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-colors border-2 ${
                        index === currentImageIndex 
                          ? 'bg-gold-primary border-gold-primary' 
                          : 'bg-transparent border-white/50 hover:border-gold-primary/50'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}