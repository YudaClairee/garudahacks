import {
  ArrowRight,
  BarChart3,
  Bot,
  Database,
  DollarSign,
  FileSpreadsheet,
  Lightbulb,
  PieChart,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logo from "/public/nabunglogo.png";
import Image from "next/image";
import Link from "next/link";
import dashboard from "/public/dashboardpreview.png";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image src={logo} alt="NABUNG Logo" width={50} height={50} />
              <span className="text-xl font-bold text-foreground">
                NABUNG.AI
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Benefits
              </a>
              <a
                href="#technology"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Technology
              </a>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="default" className="mb-4">
              <Zap className="w-4 h-4 mr-1" />
              AI-Powered Business Intelligence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Smart Analytics for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#225AFB] to-[#4F3AF7]/80">
                {" "}
                Modern Businesses
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              NABUNG.AI combines real-time sales analytics, inventory
              management, and AI-powered insights to help small and medium
              businesses make data-driven decisions and thrive in competitive
              markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
            <Image
              src={dashboard}
              alt="NABUNG Dashboard Preview"
              className="w-full rounded-xl shadow-2xl border border-border"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Grow Your Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive business intelligence tools designed specifically
              for food & beverage and retail businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow bg-card">
              <CardHeader>
                <div className="w-12 h-12 bg-[#E0E7FF] rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-[#6B5AF7]" />
                </div>
                <CardTitle>Dashboard Analytics</CardTitle>
                <CardDescription>
                  Real-time revenue tracking, sales metrics, and AI-analyzed
                  cashflow status with forecasting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow bg-card">
              <CardHeader>
                <div className="w-12 h-12 bg-[#E0E7FF] rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-[#6B5AF7]" />
                </div>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Bulk CSV import, inventory tracking, production costs, and
                  direct POS integration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow bg-card">
              <CardHeader>
                <div className="w-12 h-12 bg-[#E0E7FF] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-[#6B5AF7]" />
                </div>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>
                  Comprehensive sales performance metrics, historical data
                  analysis, and product performance insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow bg-card">
              <CardHeader>
                <div className="w-12 h-12 bg-[#E0E7FF] rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-[#6B5AF7]" />
                </div>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  2-month revenue predictions, AI chatbot for business queries,
                  and automated pattern analysis.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Your Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored solutions for different business needs and industries.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Restaurant/F&B Owners */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#E0E7FF] rounded-lg flex items-center justify-center mr-3">
                    <Smartphone className="w-5 h-5 text-[#6B5AF7]" />
                  </div>
                  <CardTitle className="text-xl">
                    For Restaurant & F&B Owners
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-[#6B5AF7] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Revenue Optimization
                    </h4>
                    <p className="text-muted-foreground">
                      Identify peak sales periods and optimize pricing
                      strategies.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileSpreadsheet className="w-5 h-5 text-[#6B5AF7] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Inventory Management
                    </h4>
                    <p className="text-muted-foreground">
                      Prevent stockouts and reduce waste with smart tracking.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <PieChart className="w-5 h-5 text-[#6B5AF7] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Cost Analysis
                    </h4>
                    <p className="text-muted-foreground">
                      Track production costs vs. selling prices for better
                      margins.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-[#6B5AF7] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Growth Insights
                    </h4>
                    <p className="text-muted-foreground">
                      AI-powered recommendations for business expansion.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Small Business Owners */}
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-[#E0E7FF] rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-[#6B5AF7]" />
                  </div>
                  <CardTitle className="text-xl">
                    For Small Business Owners
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-[#6B5AF7] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Simple Analytics
                    </h4>
                    <p className="text-muted-foreground">
                      Easy-to-understand business metrics and dashboards.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-[#6B5AF7] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Forecasting
                    </h4>
                    <p className="text-muted-foreground">
                      Plan for future inventory and staffing needs with
                      confidence.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <PieChart className="w-5 h-5 text-[#6B5AF7] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Trend Analysis
                    </h4>
                    <p className="text-muted-foreground">
                      Identify seasonal patterns and market opportunities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bot className="w-5 h-5 text-[#6B5AF7] mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Automated Reporting
                    </h4>
                    <p className="text-muted-foreground">
                      Generate insights without manual data analysis.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by cutting-edge technologies for performance, reliability,
              and scalability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border text-center bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Frontend</CardTitle>
                <CardDescription>
                  Next.js 15.4.3 • React 19.1.0 • Tailwind CSS • Shadcn UI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border text-center bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Backend</CardTitle>
                <CardDescription>
                  Go 1.24.3 • Gin-Gonic • RESTful API • CORS Enabled
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border text-center bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Tools</CardTitle>
                <CardDescription>
                  Bun • ESLint • PostCSS • Recharts • Lucide Icons
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#5D58FF] text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of businesses already using NABUNG.AI to make smarter
            decisions and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="default"
              className="text-lg bg-[#302E51] text-[#ffffff] px-8 py-4 rounded-lg hover:bg-[#302E51]/80"
            >
              Try Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-primary-foreground/20 text-[#302e51] hover:bg-[#ffffff]/10 hover:text-[#ffffff]"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#101828] text-foreground py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image src={logo} alt="NABUNG Logo" width={50} height={50} />
                <span className="text-xl font-bold text-[#ffffff]">
                  NABUNG.AI
                </span>
              </div>
              <p className="text-[#B3B5BA]">
                Smart analytics for modern businesses. Make data-driven
                decisions with confidence.
              </p>
            </div>

            <div>
              <h3 className="text-[#ffffff] font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-[#B3B5BA]">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    API
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#ffffff] font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-[#B3B5BA]">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[#ffffff] font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-[#B3B5BA]">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Status
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-border mt-8 pt-8 text-center text-[#B3B5BA]">
            <p>&copy; 2025 NABUNG.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
