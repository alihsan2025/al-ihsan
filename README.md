# Al-Ihsan Relief Website

A modern, responsive web application for Al-Ihsan Relief - a humanitarian organization dedicated to providing dignity, hope, and essential aid to communities in need.

## 🌟 About Al-Ihsan Relief

Al-Ihsan Relief is a faith-based humanitarian organization committed to:
- Providing emergency relief and humanitarian aid
- Facilitating Zakat and Sadaqah distributions
- Supporting community development initiatives
- Offering hope and dignity to those in need

## 🚀 Tech Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### Backend & Services
- **Firebase Authentication** - Admin sign-in
- **Cloud Firestore** - App content, submissions, and admin data
- **Cloudinary** - Media uploads and hosted image delivery
- **React Router DOM** - Client-side routing
- **React Helmet Async** - SEO optimization

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer, etc.)
│   └── ui/             # UI components (Buttons, Cards, etc.)
├── pages/              # Page components
│   ├── public/         # Public pages (Home, About, Donate, etc.)
│   └── admin/          # Admin pages (Dashboard, Login)
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── types/              # TypeScript type definitions
├── assets/             # Static assets
└── styles/             # Global styles
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd al-ihsan-relief
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Fill in your Firebase and Cloudinary configuration values in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_unsigned_upload_preset
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

6. **Configure the backend project**
   Copy `.firebaserc.example` to `.firebaserc` and replace the placeholder with your Firebase project id.

## 🌐 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code checks

## 🔧 Firebase Configuration

1. Create a Firebase project and choose a Europe West location for Firestore when prompted.
2. Enable Email/Password sign-in in Firebase Authentication.
3. Create a Firestore database and deploy the rules in [firestore.rules](/Users/sulaymaanabubakr/Desktop/Al-Ihsan/firestore.rules).
4. Create the collections used by the app as data is added:
   `admin_users`, `gallery`, `videos`, `projects`, `appeals`, `posts`, `contacts`, `applications`, `volunteer_applications`, `program_settings`, `teens_registrations`.
5. Add your Firebase web app config to `.env`.
6. Configure a Cloudinary unsigned upload preset and add the cloud name and preset values to `.env`.

To grant dashboard access, create a Firestore document in `admin_users` whose document ID matches the Firebase Auth user UID.

## 🧱 Backend Deployment

This app uses Firebase as its backend, so there is no separate Express or Node API to deploy.

1. Install the Firebase CLI:
   ```bash
   npm i -g firebase-tools
   ```
2. Log in and select your project:
   ```bash
   firebase login
   cp .firebaserc.example .firebaserc
   ```
3. Set the project id in `.firebaserc`.
4. Deploy the Firestore backend pieces:
   ```bash
   npm run firebase:deploy:firestore
   ```
5. For local backend testing, run:
   ```bash
   npm run firebase:emulators
   ```

Backend files in this repo:
- [firebase.json](/Users/sulaymaanabubakr/Desktop/Al-Ihsan/firebase.json)
- [firestore.rules](/Users/sulaymaanabubakr/Desktop/Al-Ihsan/firestore.rules)
- [firestore.indexes.json](/Users/sulaymaanabubakr/Desktop/Al-Ihsan/firestore.indexes.json)
- [.firebaserc.example](/Users/sulaymaanabubakr/Desktop/Al-Ihsan/.firebaserc.example)

## ☁️ Functions Backend

Firebase Cloud Functions are configured in [functions/src/index.ts](/Users/sulaymaanabubakr/Desktop/Al-Ihsan/functions/src/index.ts) and run in `europe-west1`.

Included admin functions:
- `bootstrapProgramSettings`
- `createAdminUser`
- `updateVolunteerApplicationStatus`
- `updateTeensRegistrationStatus`

Functions workspace files:
- [functions/package.json](/Users/sulaymaanabubakr/Desktop/Al-Ihsan/functions/package.json)
- [functions/tsconfig.json](/Users/sulaymaanabubakr/Desktop/Al-Ihsan/functions/tsconfig.json)

Useful commands:
```bash
npm run functions:build
npm run firebase:deploy:functions
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Automatic Deployment via Git**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import your repository on Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically

2. **Manual Deployment via CLI**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

### Environment Variables for Production
Set these in your deployment platform:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

## 📱 Features

### Public Features
- **Home** - Landing page with mission and impact
- **About** - Organization information and team
- **Donate** - Secure donation platform
- **Apply** - Volunteer and assistance applications
- **Gallery** - Photo gallery of relief work
- **Contact** - Contact information and form
- **Zakat Calculator** - Islamic charity calculations
- **Focus Areas** - Key humanitarian initiatives

### Admin Features
- **Secure Authentication** - Admin login system
- **Dashboard** - Content management interface
- **Content Management** - Update website content
- **Donation Management** - Track and manage donations

## 🎨 Design System

### Colors
- **Primary**: Emerald (`#059669`)
- **Secondary**: Various shades of green and blue
- **Accent**: Warm colors for CTAs

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

## 🔒 Security Considerations

- Firestore access rules live in [firestore.rules](/Users/sulaymaanabubakr/Desktop/Al-Ihsan/firestore.rules)
- Environment variables for sensitive data
- Input validation and sanitization
- Secure authentication flows
- XSS prevention measures

## 📈 SEO & Performance

- **Meta Tags**: Comprehensive SEO meta tags
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags
- **Sitemap**: XML sitemap for search engines
- **Robots.txt**: Search engine crawling instructions
- **Performance**: Optimized images and lazy loading
- **PWA Ready**: Progressive Web App capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

- Follow ESLint configuration
- Use TypeScript for type safety
- Component-based architecture
- Semantic HTML5
- Mobile-first responsive design
- Accessibility best practices

## 🐛 Bug Reporting

Report bugs via GitHub issues with:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

- **Website**: https://al-ihsan-relief.vercel.app/
- **Email**: info@al-ihsan-relief.org
- **Social Media**: [Add social media links]

## 🙏 Acknowledgments

- Firebase for auth and database services
- Cloudinary for media hosting
- Vercel for hosting
- Open source community
- Our generous donors and volunteers

---

**Built with ❤️ for humanity and service to others**
