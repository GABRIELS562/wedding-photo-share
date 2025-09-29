# 📸 Wedding Photo Share

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-blue.svg)](https://tailwindcss.com/)

A professional, production-ready React application for wedding photo sharing that allows guests to easily upload photos via QR code scanning, with a comprehensive admin panel for photo management.

![Wedding Photo Share Demo](docs/assets/demo-screenshot.png)

## ✨ Features

### 🎯 Core Features
- **📱 Mobile-First Design** - Optimized for phones with responsive layouts
- **📤 Advanced Photo Upload** - Drag-and-drop with compression and progress tracking
- **🖼️ Smart Gallery** - Masonry layout with lazy loading and virtual scrolling
- **👨‍💼 Admin Dashboard** - Complete management suite with analytics
- **📊 Real-time Analytics** - Upload tracking, guest metrics, and insights
- **🔍 Advanced Search** - Fuzzy search with filters and sorting options
- **📦 Batch Operations** - Bulk download with ZIP generation
- **🔐 Security** - Photo moderation, rate limiting, and content filtering

### 🎨 User Experience
- **Beautiful UI** - Modern design with smooth animations
- **♿ Accessibility** - WCAG compliant with keyboard navigation
- **📱 Touch Optimized** - Swipe gestures and mobile interactions
- **🌐 Social Sharing** - Multi-platform sharing capabilities
- **🎭 Customizable** - Event-specific branding and theming

### ⚡ Performance
- **🚀 Fast Loading** - Code splitting and lazy loading
- **📸 Image Optimization** - Automatic compression and CDN delivery
- **💾 Efficient Storage** - Cloudinary integration with smart caching
- **🔄 Offline Support** - Progressive web app capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Cloudinary account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/wedding-photo-share.git
cd wedding-photo-share
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your Cloudinary credentials and event details
```

4. **Start development server**
```bash
npm run dev
```

5. **Generate QR codes**
```bash
npm run generate-qr
```

Visit `http://localhost:3000` to see your wedding photo sharing app!

## 📚 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Complete setup instructions
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment options
- **[Configuration](docs/CONFIGURATION.md)** - Customization and settings
- **[API Documentation](docs/API.md)** - Cloudinary integration details
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Maintenance](docs/MAINTENANCE.md)** - Ongoing maintenance procedures
- **[Security](docs/SECURITY.md)** - Security best practices

## 🔧 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and interactions
- **React Router** - Client-side routing

### Backend/Services
- **Cloudinary** - Image storage, optimization, and delivery
- **Vercel/Netlify** - Serverless deployment platform
- **Chart.js** - Analytics and data visualization

### Development Tools
- **Vite** - Fast build tool and development server
- **ESLint** - Code linting and quality checks
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality gates

## 📱 Usage

### For Guests
1. Scan the QR code with your phone camera
2. Enter your name and optional message
3. Upload photos by dragging & dropping or selecting files
4. View the gallery and download favorite photos

### For Administrators
1. Navigate to `/admin` and enter the admin password
2. Use the dashboard to monitor uploads and guest activity
3. Moderate photos with approve/reject workflow
4. Download all photos in organized ZIP files
5. Generate new QR codes and customize settings

## 🎨 Customization

### Event Configuration
```env
VITE_EVENT_NAME=Sarah & Michael's Wedding
VITE_EVENT_DATE=2024-09-15
VITE_EVENT_LOCATION=Rosewood Manor, Beverly Hills
```

### Theme Colors
Edit `tailwind.config.js` to match your wedding colors:
```javascript
colors: {
  primary: {
    500: '#your-primary-color',
  },
  secondary: {
    500: '#your-secondary-color',
  }
}
```

### Custom Messages
Modify welcome messages and instructions in the upload component or through the admin configuration panel.

## 🚀 Deployment

### Quick Deploy with Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/wedding-photo-share)

### Manual Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Configure environment variables on your platform
4. Set up custom domain and SSL certificate

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🔒 Security

- **Input Validation** - All user inputs are sanitized
- **Rate Limiting** - Upload limits to prevent abuse
- **Content Moderation** - Admin approval workflow
- **Secure Authentication** - Password-protected admin access
- **HTTPS Only** - SSL encryption for all connections

## 📊 Analytics & Monitoring

Track your wedding photo sharing with built-in analytics:
- Upload trends and guest activity
- Popular uploaders and peak times
- Storage usage and file size distribution
- Real-time monitoring dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Powered by Cloudinary for image management
- Styled with Tailwind CSS
- Icons by Lucide React
- Charts by Chart.js

## 📞 Support

For support, email support@yourwedding.com or open an issue on GitHub.

---

<div align="center">
  <sub>Built with ❤️ for capturing wedding memories</sub>
</div>