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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-bma bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image src={logo} alt="NABUNG Logo" width={50} height={50} />
              <span className="text-xl font-bold text-gray-900">NABUNG.AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Benefits
              </a>
              <a
                href="#technology"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Technology
              </a>
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
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
            <Badge variant="secondary" className="mb-4">
              <Zap className="w-4 h-4 mr-1" />
              AI-Powered Business Intelligence
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Analytics for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {" "}
                Modern Businesses
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
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
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div className="mt-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
            <Image
              src={dashboard}
              alt="NABUNG Dashboard Preview"
              className="w-full rounded-xl shadow-2xl border"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Grow Your Business
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive business intelligence tools designed specifically
              for food & beverage and retail businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Dashboard Analytics</CardTitle>
                <CardDescription>
                  Real-time revenue tracking, sales metrics, and AI-analyzed
                  cashflow status with forecasting.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Database className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Bulk CSV import, inventory tracking, production costs, and
                  direct POS integration.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Sales Analytics</CardTitle>
                <CardDescription>
                  Comprehensive sales performance metrics, historical data
                  analysis, and product performance insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-indigo-600" />
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
      <section id="benefits" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Your Success
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tailored solutions for different business needs and industries.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Restaurant/F&B Owners */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">
                    For Restaurant & F&B Owners
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Revenue Optimization</h4>
                    <p className="text-gray-600">
                      Identify peak sales periods and optimize pricing
                      strategies.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Inventory Management</h4>
                    <p className="text-gray-600">
                      Prevent stockouts and reduce waste with smart tracking.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <PieChart className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Cost Analysis</h4>
                    <p className="text-gray-600">
                      Track production costs vs. selling prices for better
                      margins.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Growth Insights</h4>
                    <p className="text-gray-600">
                      AI-powered recommendations for business expansion.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Small Business Owners */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">
                    For Small Business Owners
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Simple Analytics</h4>
                    <p className="text-gray-600">
                      Easy-to-understand business metrics and dashboards.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Forecasting</h4>
                    <p className="text-gray-600">
                      Plan for future inventory and staffing needs with
                      confidence.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <PieChart className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Trend Analysis</h4>
                    <p className="text-gray-600">
                      Identify seasonal patterns and market opportunities.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Bot className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Automated Reporting</h4>
                    <p className="text-gray-600">
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
      <section id="technology" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by cutting-edge technologies for performance, reliability,
              and scalability.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <CardTitle className="text-lg">Frontend</CardTitle>
                <CardDescription>
                  Next.js 15.4.3 • React 19.1.0 • Tailwind CSS • Radix UI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg text-center">
              <CardHeader>
                <CardTitle className="text-lg">Backend</CardTitle>
                <CardDescription>
                  Go 1.24.3 • Gin-Gonic • RESTful API • CORS Enabled
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg text-center">
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
      <section className="py-20 bg-gradient-to-r from-indigo-500 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using NABUNG.AI to make smarter
            decisions and drive growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Try Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image src={logo} alt="NABUNG Logo" width={50} height={50} />
                <span className="text-xl font-bold">NABUNG.AI</span>
              </div>
              <p className="text-gray-400">
                Smart analytics for modern businesses. Make data-driven
                decisions with confidence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NABUNG.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
