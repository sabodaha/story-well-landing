import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  BookOpen, 
  Globe, 
  Heart, 
  Download, 
  Moon, 
  Accessibility, 
  Smartphone,
  Star,
  Languages,
  Shield,
  Zap,
  Users
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Story Well
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-700 hover:text-purple-600 transition">
                Features
              </Link>
              <Link href="#languages" className="text-gray-700 hover:text-purple-600 transition">
                Languages
              </Link>
              <Link href="#faq" className="text-gray-700 hover:text-purple-600 transition">
                FAQ
              </Link>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Download App
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                ✨ Multilingual Stories for Kids
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                A World of{" "}
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Stories
                </span>{" "}
                at Your Fingertips
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Immerse your children in beautifully illustrated stories available in 8 languages. 
                Read offline, switch languages instantly, and create lasting memories.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg h-14 px-8">
                  <Download className="mr-2 h-5 w-5" />
                  Download for Free
                </Button>
                <Button size="lg" variant="outline" className="text-lg h-14 px-8 border-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Loved by families</span> worldwide
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-200">
                <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-2xl flex items-center justify-center">
                  <BookOpen className="h-32 w-32 text-purple-400" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
              ✨ Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need for{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Story Time
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Designed with love for children and families
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-purple-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Immersive Reading</CardTitle>
                <CardDescription>
                  Swipeable page-by-page experience with beautiful illustrations that captivate young minds
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-pink-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>8 Languages</CardTitle>
                <CardDescription>
                  English, German, Russian, Ukrainian, Italian, French, Turkish, and Spanish support
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Download className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Offline Reading</CardTitle>
                <CardDescription>
                  Download stories and read them anywhere, anytime - perfect for road trips and flights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-green-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Favorites</CardTitle>
                <CardDescription>
                  Save beloved stories for quick access and build your child's personal library
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-indigo-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <Moon className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle>Dark Mode</CardTitle>
                <CardDescription>
                  Comfortable reading in any lighting condition with beautiful dark theme
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-orange-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Accessibility className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Accessibility</CardTitle>
                <CardDescription>
                  Full screen reader support and accessibility features for all children
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-teal-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Cross-Platform</CardTitle>
                <CardDescription>
                  Available on Android, iOS, and Web - use on any device your family owns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-rose-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-rose-600" />
                </div>
                <CardTitle>Safe & Ad-Free</CardTitle>
                <CardDescription>
                  No ads, no in-app purchases, no tracking - just pure storytelling joy
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-violet-300 transition-all hover:shadow-xl">
              <CardHeader>
                <div className="h-12 w-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-violet-600" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Optimized performance ensures smooth page turns and instant loading
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                👪 For Parents
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold">
                Build Lifelong{" "}
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Reading Habits
                </span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Languages className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Language Learning</h3>
                    <p className="text-gray-600">
                      Help your children learn new languages naturally through engaging stories they love
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Family Bonding</h3>
                    <p className="text-gray-600">
                      Create special moments with bedtime stories that bring families closer together
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Screen Time Well Spent</h3>
                    <p className="text-gray-600">
                      Quality content that educates and entertains - guilt-free screen time
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl blur-3xl opacity-20"></div>
              <Card className="relative border-4 border-green-200 shadow-2xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Stories Read</p>
                        <p className="text-3xl font-bold text-purple-600">127</p>
                      </div>
                      <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">8</p>
                        <p className="text-xs text-gray-600">Languages</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">45</p>
                        <p className="text-xs text-gray-600">Favorites</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">12</p>
                        <p className="text-xs text-gray-600">Offline</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">
              🌍 Languages
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Stories in{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                8 Languages
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Switch between languages instantly - perfect for multilingual families
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { name: "English", flag: "🇬🇧", native: "English" },
              { name: "German", flag: "🇩🇪", native: "Deutsch" },
              { name: "Russian", flag: "🇷🇺", native: "Русский" },
              { name: "Ukrainian", flag: "🇺🇦", native: "Українська" },
              { name: "Italian", flag: "🇮🇹", native: "Italiano" },
              { name: "French", flag: "🇫🇷", native: "Français" },
              { name: "Turkish", flag: "🇹🇷", native: "Türkçe" },
              { name: "Spanish", flag: "🇪🇸", native: "Español" },
            ].map((lang) => (
              <Card key={lang.name} className="border-2 hover:border-purple-300 transition-all hover:shadow-lg cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-3">{lang.flag}</div>
                  <p className="font-semibold text-gray-900">{lang.native}</p>
                  <p className="text-sm text-gray-600">{lang.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-pink-100 text-pink-700 hover:bg-pink-200">
              ❓ FAQ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                Is Story Well really free?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes! Story Well is completely free with no ads, no in-app purchases, and no hidden costs. 
                We believe every child deserves access to quality stories.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                Can I use Story Well offline?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Absolutely! Download your favorite stories and read them anywhere without an internet connection. 
                Perfect for long flights, road trips, or areas with limited connectivity.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                How do I switch between languages?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Simply tap the language button (🌐) in the app to switch between available languages instantly. 
                You can set a default language in Settings and still browse stories in other languages temporarily.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                What age group is Story Well designed for?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Story Well is perfect for children ages 3-10, but readers of all ages enjoy our beautifully 
                illustrated stories. The simple interface makes it easy for young children to navigate independently.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                Are new stories added regularly?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes! We regularly add new stories in multiple languages. Enable notifications in the app 
                to be notified when new content becomes available.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-white rounded-lg px-6 border-2">
              <AccordionTrigger className="text-left font-semibold hover:text-purple-600">
                Which devices are supported?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Story Well works on Android phones and tablets, iOS devices (iPhone and iPad), and web browsers. 
                Your favorites and settings sync across all your devices.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Your Story Time Adventure Today
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Join thousands of families already enjoying multilingual stories
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg h-14 px-8">
              <Download className="mr-2 h-5 w-5" />
              Download for Android
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white/10 text-lg h-14 px-8">
              <Download className="mr-2 h-5 w-5" />
              Download for iOS
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">Story Well</span>
              </div>
              <p className="text-gray-400 mb-4">
                Beautiful, multilingual children's stories for families everywhere.
              </p>
              <p className="text-sm text-gray-500">
                © 2024 Story Well. Made with ❤️ for children and families everywhere.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="#features" className="hover:text-purple-400 transition">Features</Link></li>
                <li><Link href="#languages" className="hover:text-purple-400 transition">Languages</Link></li>
                <li><Link href="#faq" className="hover:text-purple-400 transition">FAQ</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">Download</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:admin@dartim-media.com" className="hover:text-purple-400 transition">
                    admin@dartim-media.com
                  </a>
                </li>
                <li><Link href="/privacy" className="hover:text-purple-400 transition">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-purple-400 transition">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
