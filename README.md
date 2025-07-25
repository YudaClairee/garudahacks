# NABUNG.AI - Product Requirements Document (PRD)

## 📋 Executive Summary

**NABUNG.AI** adalah platform business intelligence dan financial management yang dirancang khusus untuk usaha kecil dan menengah di sektor food & beverage serta retail. Platform ini menggabungkan analisis data real-time dengan AI-powered insights untuk membantu pemilik bisnis membuat keputusan yang lebih baik dan meningkatkan profitabilitas.

## 🎯 Problem Statement

Banyak pemilik usaha kecil dan menengah kesulitan untuk:

- Melacak performa bisnis secara real-time
- Memprediksi tren penjualan dan cashflow
- Mengelola inventory dan produk secara efisien
- Menganalisis data penjualan untuk optimization
- Mendapatkan insights bisnis yang actionable

## 💡 Solution Overview

NABUNG.AI menyediakan dashboard terpusat yang menggabungkan:

- **Real-time Analytics**: Dashboard comprehensive dengan metrics penting
- **AI-Powered Insights**: Prediksi revenue dan pattern analysis
- **Inventory Management**: Sistem manajemen produk terintegrasi
- **Sales Intelligence**: Analisis mendalam performa penjualan
- **Chatbot Assistant**: AI assistant untuk query bisnis

## 👥 Target Users

### Primary Users

- **Pemilik Restoran/Cafe**: Butuh tracking revenue, inventory, dan customer patterns
- **Retail Business Owners**: Perlu analisis sales performance dan inventory optimization
- **F&B Chain Operators**: Memerlukan multi-location analytics dan forecasting

### Secondary Users

- **Business Managers**: Tim yang handle operasional harian
- **Financial Analysts**: Yang butuh data untuk reporting dan planning

## ⭐ Core Features

### 1. Dashboard Analytics

- **Real-time Revenue Tracking**: Monitor pendapatan secara live
- **Sales Metrics Visualization**: Charts dan graphs untuk trend analysis
- **Cashflow Forecasting**: Prediksi cashflow berbasis AI
- **Performance KPIs**: Metrics penting seperti revenue growth, profit margins

### 2. Product Management

- **Bulk CSV Import**: Upload produk dalam jumlah besar
- **Inventory Tracking**: Monitor stock levels dan alerts
- **Production Cost Management**: Track biaya produksi per item
- **POS Integration**: Sinkronisasi langsung dengan sistem POS

### 3. Sales Analytics

- **Historical Data Analysis**: Tren penjualan dari waktu ke waktu
- **Product Performance Insights**: Produk terlaris dan underperform
- **Revenue Pattern Recognition**: Identifikasi pola seasonal dan cyclical
- **Best-Selling Product Charts**: Visualisasi produk top performer

### 4. AI-Powered Insights

- **2-Month Revenue Prediction**: Forecasting berbasis machine learning
- **Business Intelligence Chatbot**: Tanya jawab tentang performa bisnis
- **Automated Pattern Analysis**: Deteksi otomatis tren dan anomali
- **Opportunity Identification**: Saran untuk growth opportunities

## 🛠 Technical Architecture

### Frontend Stack

- **Framework**: Next.js 15.4.3 dengan React 19
- **Styling**: TailwindCSS dengan shadcn/ui components
- **Charts**: Recharts untuk data visualization
- **Drag & Drop**: @dnd-kit untuk interactive features
- **State Management**: React hooks dan context

### Backend Stack

- **Language**: Go (Golang)
- **Framework**: Gin web framework
- **Database**: PostgreSQL dengan sqlx
- **Architecture**: RESTful API dengan adapter pattern
- **CORS**: Configured untuk cross-origin requests

### Key Components

- **Data Tables**: Advanced sorting, filtering, dan pagination
- **Interactive Charts**: Revenue trends, best-selling products
- **Responsive Dashboard**: Mobile-first design approach
- **Real-time Updates**: Live data synchronization

## 📊 User Flow

### 1. Onboarding Flow

1. User signup/login
2. Business profile setup
3. POS system integration
4. Initial data import (products, historical sales)
5. Dashboard customization

### 2. Daily Usage Flow

1. Check dashboard for daily metrics
2. Review sales performance
3. Monitor inventory levels
4. Interact with AI chatbot for insights
5. Export reports if needed

### 3. Analysis Flow

1. Access detailed analytics sections
2. Compare performance across time periods
3. Review AI-generated insights
4. Implement recommended actions
5. Track improvement metrics

## 🎨 UI/UX Principles

- **Clean & Minimal**: Focus pada data yang penting
- **Mobile-Responsive**: Optimized untuk semua device sizes
- **Dark/Light Mode**: Theme switching untuk user preference
- **Intuitive Navigation**: Sidebar navigation dengan clear categorization
- **Data-First Design**: Charts dan metrics sebagai focal point

## 🚀 Success Metrics

### Business Metrics

- **User Adoption Rate**: Monthly active users growth
- **Feature Utilization**: Usage rate per core feature
- **Customer Retention**: Monthly/yearly retention rates
- **Business Impact**: Revenue improvement for client businesses

### Technical Metrics

- **Performance**: Page load times < 2s
- **Uptime**: 99.9% system availability
- **Data Accuracy**: Real-time sync accuracy > 99%
- **Mobile Usage**: Mobile traffic percentage

## 🛣 Roadmap

### Phase 1 (Current)

- ✅ Core dashboard functionality
- ✅ Basic analytics and charts
- ✅ Product management system
- ✅ AI chatbot integration

### Phase 2 (Next Quarter)

- 📱 Mobile app development
- 🔗 Additional POS integrations
- 📧 Email/SMS notifications
- 📈 Advanced forecasting models

### Phase 3 (Future)

- 🤝 Multi-location support
- 📊 Custom report builder
- 🔌 Third-party integrations (accounting software)
- 🎯 Marketing automation features

## 💻 Development Setup

### Prerequisites

- Node.js 18+ dan Bun/npm
- Go 1.21+
- PostgreSQL database
- Environment variables setup

### Local Development

```bash
# Frontend
cd /
bun install
bun dev

# Backend
cd backend/
go mod tidy
go run main.go
```

### Database Setup

- PostgreSQL dengan connection pooling
- Schema untuk products, orders, sales data
- Environment variable: `POSTGRES_DSN`

---

**Team**: Built with ❤️ for Indonesian SME businesses
**Contact**: [Your contact information]
**Version**: 0.1.0
