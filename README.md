# NWI B2B Platform

A comprehensive B2B wholesale-to-retail platform built with React, TypeScript, and Supabase.

## 🚀 Features

### For Retailers
- **Product Browsing**: Browse products from multiple wholesalers
- **Smart Cart**: Persistent shopping cart with promotion calculations
- **Multiple Payment Methods**: PayFast, Kazang, and Shop2Shop integration
- **Order Management**: Track orders from placement to completion
- **Support System**: Create and manage support tickets

### For Wholesalers
- **Product Management**: Add, edit, and manage product inventory
- **Order Processing**: Accept and fulfill retailer orders
- **Promotions**: Create and manage promotional campaigns
- **Analytics**: Track sales performance and customer metrics

### For Administrators
- **User Management**: Approve/reject user registrations
- **Platform Oversight**: Monitor all orders, products, and users
- **Analytics Dashboard**: Comprehensive platform analytics
- **Settings Management**: Configure platform-wide settings

### For Support Staff
- **Ticket Management**: Handle customer support requests
- **Return Processing**: Manage product returns and refunds
- **User Assistance**: Help users with platform issues

## 🛠 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Payments**: PayFast, Kazang, Shop2Shop
- **State Management**: React Context API
- **Build Tool**: Vite
- **Deployment**: Netlify ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nwi-b2b-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Enable Row Level Security (RLS) on all tables

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

The platform uses a comprehensive PostgreSQL schema with the following main tables:

- **users**: User accounts and profiles
- **pending_users**: User registration applications
- **products**: Product catalog
- **orders** & **order_items**: Order management
- **support_tickets**: Customer support system
- **promotions**: Marketing campaigns
- **return_requests** & **return_items**: Return management
- **platform_settings**: System configuration

## 🔐 Authentication & Security

- **Supabase Auth**: Secure user authentication
- **Row Level Security**: Database-level access control
- **Role-based Access**: Different permissions for each user type
- **Session Management**: Persistent login sessions

## 💳 Payment Integration

### PayFast
- Custom integration with form-based payments
- Signature validation and webhook handling
- Support for custom quantities and amounts

### Kazang
- Official Kazang payment gateway integration
- Vendor Cash Deposit (Product ID: 4503)
- Real-time payment status monitoring

### Shop2Shop
- Mobile payment solution integration
- SMS-based payment confirmations

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Manual Deployment
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 📱 Progressive Web App (PWA)

The platform includes PWA features:
- Service Worker for offline functionality
- Push notifications for real-time updates
- App-like experience on mobile devices
- Installable on desktop and mobile

## 🔄 Real-time Features

- **Live Updates**: Real-time data synchronization
- **Push Notifications**: Instant alerts for important events
- **Live Chat**: Real-time customer support
- **Order Tracking**: Live order status updates

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📊 Analytics & Monitoring

- **User Analytics**: Track user behavior and engagement
- **Sales Analytics**: Monitor revenue and order patterns
- **Performance Monitoring**: Track app performance metrics
- **Error Tracking**: Monitor and fix issues quickly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@nwi-b2b.com or create an issue in this repository.

## 🙏 Acknowledgments

- **Supabase** for the backend infrastructure
- **PayFast** for payment processing
- **Kazang** for mobile payments
- **Tailwind CSS** for the design system
- **React** team for the amazing framework

---

Built with ❤️ by New World Innovations