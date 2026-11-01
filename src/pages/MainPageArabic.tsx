import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Shield, Star, Users, Clock } from "lucide-react";
import heroImage from "@/assets/mall-istanbul-hero.webp";

const MainPageArabic = () => {
  const features = [
    {
      icon: <Search className="w-8 h-8 text-accent" />,
      title: "بحث سهل",
      description: "نظام تصفية متقدم للعثور بسهولة على السكن الطلابي المناسب لك."
    },
    {
      icon: <MapPin className="w-8 h-8 text-accent" />,
      title: "موقع مثالي",
      description: "خيارات سكن قريبة من الجامعات مع إمكانيات نقل عالية."
    },
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: "بيئة آمنة",
      description: "أمان 24/7، نظام دخول بالبطاقة ومساحات معيشة آمنة."
    },
    {
      icon: <Star className="w-8 h-8 text-accent" />,
      title: "خدمة عالية الجودة",
      description: "مرافق حديثة، خدمة تنظيف ومساحات معيشة مريحة."
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "حياة اجتماعية",
      description: "مساحات مشتركة وأنشطة وفعاليات للحياة الجامعية النشطة."
    },
    {
      icon: <Clock className="w-8 h-8 text-accent" />,
      title: "دعم 24/7",
      description: "خدمات دعم ومساعدة مهنية متوفرة دائماً بجانبك."
    }
  ];

  const stats = [
    { number: "500+", label: "طالب راضٍ" },
    { number: "50+", label: "خيار سكن" },
    { number: "15+", label: "جامعة شريكة" },
    { number: "24/7", label: "خدمة الدعم" }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-primary/70"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            السكن الطلابي المثالي
            <br />
            <span className="text-accent">يبدأ من هنا</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            حلول سكن آمنة ومريحة وحديثة لحياتك الجامعية
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white">
              <Link to="/search">
                اكتشف أماكن السكن
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
              <Link to="/about">
                عن الشركة
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              لماذا تختارنا؟
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              مرافق حديثة وخدمات مهنية لتسهيل حياتك الطلابية
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-border">
                <CardContent className="p-0">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            هل أنت مستعد لبدء حياتك الجامعية؟
          </h2>
          <p className="text-xl mb-8 text-white/90">
            اعثر على خيار السكن الأنسب لك وقم بحجز آمن
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white">
              <Link to="/search">
                ابدأ الآن
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
              <Link to="/about">
                المزيد من المعلومات
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Movinn</h3>
              <p className="text-white/80">
                نوفر حلول سكن طلابي آمنة ومريحة وحديثة.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <div className="space-y-2">
                <Link to="/search" className="block text-white/80 hover:text-white">
                  البحث عن سكن
                </Link>
                <Link to="/about" className="block text-white/80 hover:text-white">
                  عن الشركة
                </Link>
                <Link to="/cart" className="block text-white/80 hover:text-white">
                  السلة
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الاتصال</h4>
              <div className="space-y-2 text-white/80">
                <p>البريد الإلكتروني: info@movinn.com</p>
                <p>الهاتف: +90 (212) 555 0123</p>
                <p>العنوان: إسطنبول، تركيا</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 Movinn. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPageArabic;