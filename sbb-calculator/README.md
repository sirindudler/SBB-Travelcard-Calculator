# Swiss Travelcard Calculator

🚆 **A comprehensive calculator for Swiss Federal Railways subscription options**

## 🌐 Live Website
**Try it now:** [https://sirindudler.github.io/SBB-Travelcard-Calculator](https://sirindudler.github.io/SBB-Travelcard-Calculator)

## 📋 Overview

The Swiss Travelcard Calculator helps Swiss public transport users find the most cost-effective subscription option based on their travel patterns. Compare different Swiss subscription types and get personalized recommendations with detailed cost breakdowns.

## ✨ Features

### 🎯 Smart Calculation Modes
- **Route-based calculation**: Input specific travel routes with frequency and costs
- **Direct cost input**: Enter your annual travel expenses directly
- **Multi-route support**: Add multiple travel routes for comprehensive analysis

### 🎫 Subscription Options Compared
- **No Subscription** (regular tickets)
- **Halbtax** (50% discount card)
- **Halbtax Plus** (prepaid credit system with reload logic)
- **GA Travelcard** (unlimited travel)

### 🎨 User Experience
- **Multi-language support**: English, German, French, Italian
- **Age group pricing**: Different rates for adults, seniors, youth
- **Travel class options**: 1st and 2nd class pricing
- **Color-coded results**: Visual comparison of subscription costs
- **Responsive design**: Works on desktop and mobile

### 🧮 Advanced Calculations
- **Halbtax Plus reload logic**: Automatic credit top-ups and proportional billing
- **Loyalty pricing**: New customer vs. existing customer rates
- **Percentage-based comparisons**: See exactly how much you save or spend
- **Dynamic pricing**: Real Swiss railway pricing data with type-safe calculations

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

**🌐 Visit the live calculator:** [https://sirindudler.github.io/SBB-Travelcard-Calculator](https://sirindudler.github.io/SBB-Travelcard-Calculator)

## ⚠️ Important Notice

This is an **unofficial service** and is not operated by, affiliated with, endorsed by, or connected to Swiss Federal Railways (Schweizerische Bundesbahnen). Swiss railway trademarks and service marks are the property of Swiss Federal Railways.

**Disclaimer:**
• Prices and information as of January 2025
• Halbtax Plus includes additional travel credit as a bonus
• Prices, conditions, and offers may change without notice
• This calculator provides estimates for informational purposes only
• **Always verify current prices and conditions on the official Swiss railway website before purchasing**
• No responsibility is taken for the accuracy, completeness, or timeliness of the information provided
• No liability for decisions made based on this calculator

**Data Privacy:** This website does not collect, store, or transmit personal data.

**Official Information:** [https://www.sbb.ch](https://www.sbb.ch)