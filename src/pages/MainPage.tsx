import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, MapPin, Shield, Star, Users, Clock } from "lucide-react";
import heroImage from "@/assets/mall-istanbul-hero.webp";

const MainPage = () => {
  const features = [
    {
      icon: <Search className="w-8 h-8 text-accent" />,
      title: "Kolay Arama",
      description: "Gelişmiş filtreleme sistemi ile size uygun öğrenci konaklama yerini kolayca bulun."
    },
    {
      icon: <MapPin className="w-8 h-8 text-accent" />,
      title: "İdeal Konum",
      description: "Üniversitelere yakın, ulaşım imkanları yüksek lokasyonlarda konaklama seçenekleri."
    },
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: "Güvenli Ortam",
      description: "24/7 güvenlik, kartlı giriş sistemi ve güvenli yaşam alanları."
    },
    {
      icon: <Star className="w-8 h-8 text-accent" />,
      title: "Kaliteli Hizmet",
      description: "Modern olanaklar, temizlik hizmeti ve konforlu yaşam alanları."
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: "Sosyal Yaşam",
      description: "Ortak alanlar, etkinlikler ve sosyal aktiviteler ile aktif kampüs yaşamı."
    },
    {
      icon: <Clock className="w-8 h-8 text-accent" />,
      title: "7/24 Destek",
      description: "Her zaman yanınızda olan profesyonel destek ve yardım hizmetleri."
    }
  ];

  const stats = [
    { number: "500+", label: "Memnun Öğrenci" },
    { number: "50+", label: "Konaklama Seçeneği" },
    { number: "15+", label: "Ortak Üniversite" },
    { number: "24/7", label: "Destek Hizmeti" }
  ];

  return (
    <div className="min-h-screen bg-background">
      
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
            İdeal Öğrenci Konaklama
            <br />
            <span className="text-accent">Burada Başlıyor</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/90">
            Üniversite yaşamınız için güvenli, konforlu ve modern konaklama çözümleri
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white">
              <Link to="/search">
                Konaklama Yerlerini Keşfet
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
              <Link to="/about">
                Hakkımızda
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
              Neden Bizi Tercih Etmelisiniz?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Öğrenci yaşamınızı kolaylaştıracak modern olanaklar ve profesyonel hizmetler
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
            Üniversite Yaşamınıza Başlamaya Hazır mısınız?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Size en uygun konaklama seçeneğini bulun ve güvenli rezervasyon yapın
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white">
              <Link to="/search">
                Hemen Başla
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-white/10 border-white text-white hover:bg-white hover:text-primary">
              <Link to="/about">
                Daha Fazla Bilgi
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
                Güvenli, konforlu ve modern öğrenci konaklama çözümleri sunuyoruz.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hızlı Bağlantılar</h4>
              <div className="space-y-2">
                <Link to="/search" className="block text-white/80 hover:text-white">
                  Konaklama Ara
                </Link>
                <Link to="/about" className="block text-white/80 hover:text-white">
                  Hakkımızda
                </Link>
                <Link to="/cart" className="block text-white/80 hover:text-white">
                  Sepet
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <div className="space-y-2 text-white/80">
                <p>Email: info@movinn.com</p>
                <p>Telefon: +90 (212) 555 0123</p>
                <p>Adres: İstanbul, Türkiye</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 Movinn. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;