# Swiss Travelcard Calculator

🚆 **A comprehensive calculator for Swiss Federal Railways subscription options**

## 🌐 Live Website
**Try it now:** [http://travelcards.ch](http://travelcards.ch)

## 📋 Overview

The Swiss Travelcard Calculator helps Swiss public transport users find the most cost-effective subscription option based on their travel patterns. Compare different Swiss subscription types and get personalized recommendations with detailed cost breakdowns.

## ✨ Features

### 🎯 Smart Calculation Modes
- **Route-based calculation**: Input specific travel routes with frequency and costs
- **Direct cost input**: Enter your annual travel expenses directly
- **Multi-route support**: Add unlimited travel routes for comprehensive analysis
- **Mixed calculation**: Combine route-based and direct cost inputs in one calculation

### 🎫 Subscription Options Compared
- **No Subscription** (regular tickets)
- **Halbtax** (50% discount card)
- **Halbtax Plus** (prepaid credit system with intelligent reload logic)
- **GA Travelcard** (unlimited travel for all ages and classes)
- **All age variants**: Youth, Adult, Senior pricing for each subscription type
- **All class variants**: 1st and 2nd class options with accurate price differences

### 🎨 User Experience
- **Multi-language support**: English, German, French, Italian with automatic browser detection
- **Age group pricing**: Comprehensive rates for youth, adults, seniors with smooth transitions
- **Travel class options**: 1st and 2nd class pricing with class-specific calculations
- **Color-coded results**: Dynamic visual comparison with percentage-based color coding
- **Responsive design**: Optimized for desktop, tablet, and mobile devices
- **Route color schemes**: Unique color identification for each travel route
- **Interactive UI**: Smooth animations and intuitive controls

### 🧮 Advanced Calculations
- **Halbtax Plus reload logic**: Intelligent credit management with automatic top-ups and proportional billing
- **Loyalty pricing**: Accurate new customer vs. existing customer rates for all subscription types
- **Percentage-based comparisons**: Precise savings calculations showing cost differences
- **Dynamic pricing**: Real-time Swiss railway pricing data with type-safe calculations
- **Complex route analysis**: Handles irregular travel patterns and seasonal variations
- **Cost optimization**: Automatically finds the most economical subscription combination

### 📊 Data Management & Export
- **PDF export**: Generate detailed calculation reports with all routes and comparisons
- **Screenshot capture**: Save visual summaries of your calculations
- **Data persistence**: Remember your routes and preferences across sessions
- **Import/Export**: Share calculation setups with others

### 🔧 Technical Features
- **Real-time calculations**: Instant updates as you modify inputs
- **Error handling**: Comprehensive validation and user-friendly error messages
- **Performance optimized**: Fast calculations even with many routes
- **Offline capable**: Core functionality works without internet connection
- **Browser compatibility**: Works across all modern browsers

## 🚀 Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development server
npm start
# Opens http://localhost:3000

# Run tests
npm test

# Build for production
npm run build
```

### Production Deployment
This project automatically deploys to GitHub Pages via GitHub Actions when changes are pushed to the main branch.

## 🏗️ Technical Architecture

### Frontend Stack
- **React 19** with TypeScript for type safety
- **Tailwind CSS** for responsive styling
- **Lucide React** for modern icons
- **Create React App** for development tooling

### Code Organization
- **`App.tsx`**: Main application logic and state management
- **`pricing.ts`**: Swiss railway pricing data and utility functions
- **`translations.ts`**: Multi-language support with parameterized strings
- **Centralized state**: React hooks without external state management
- **Type-safe**: Full TypeScript implementation with strict mode

### Key Features Implementation
- **Dynamic color schemes**: Unique colors for each travel route
- **Complex pricing logic**: Handles Halbtax Plus reload scenarios
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Internationalization**: Context-aware translations for all Swiss languages

## 🎨 Design Principles

- **User-centric**: Intuitive interface for comparing complex pricing options
- **Accurate calculations**: Based on official Swiss railway pricing structures
- **Performance**: Optimized React components and efficient state management
- **Accessibility**: Semantic HTML and keyboard navigation support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🇨🇭 About Swiss Railways

The Swiss Federal Railways is Switzerland's national railway company. This calculator uses official Swiss railway pricing structures to help travelers make informed decisions about their public transport subscriptions.

---

**🌐 Visit the live calculator:** [http://travelcards.ch](http://travelcards.ch)