# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ⚠️ CRITICAL RULES - READ FIRST ⚠️

## 🚫 GIT COMMIT RULES - MANDATORY 🚫
**NEVER mention Claude, AI, or add AI co-authorship in git commits**
- NO "Generated with Claude Code" 
- NO "Co-Authored-By: Claude"
- NO AI references of any kind
- Use clean, professional commit messages only
- This rule applies to ALL git operations without exception

## 📋 BEFORE ANY ACTION CHECKLIST
1. ✅ Have I read the Git Commit Rules above?
2. ✅ Am I about to perform a git operation? → Double-check no AI references
3. ✅ Have I reviewed the User Preferences section?
4. ✅ Have I checked the Development Commands section?

## Project Overview

This is a React-based SBB (Swiss Federal Railways) subscription calculator that helps users compare different public transport subscription options in Switzerland. The application calculates the most cost-effective subscription based on user travel patterns and preferences.

## Key Architecture

### Core Components
- **App.tsx**: Main application component containing all calculator logic, state management, and UI
- **pricing.ts**: Swiss railway pricing data and utility functions - acts as the single source of truth for all SBB pricing
- **translations.ts**: Multi-language support (English, German, French, Italian) with translation utilities

### Data Flow
The application follows a centralized pricing model:
1. All SBB pricing data is stored in `pricing.ts` with type-safe interfaces
2. `App.tsx` imports pricing functions and performs calculations based on user inputs
3. Results are displayed with color-coded comparison showing percentage-based cost differences

### Key Features
- **Route-based calculation**: Users can input multiple travel routes with frequency and costs
- **Direct cost input**: Alternative input method for users who know their annual travel costs
- **Multi-language support**: Full localization for Switzerland's official languages
- **Subscription comparison**: Compares No Subscription, Halbtax, Halbtax Plus variants, and GA options
- **Dynamic pricing**: Supports different age groups, travel classes, and customer types (new vs. loyalty pricing)

## Development Commands

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Build and verify (no separate lint/typecheck commands available)
npm run build
```

## ⚠️ IMPORTANT BUILD RULE
**DO NOT run `npm run build` or `npm start` unless explicitly asked by the user**
- The user is already manually testing the application
- Do not waste time suggesting or running build/start commands
- Only run build commands when the user specifically requests it

## Git Commit Guidelines

**CRITICAL**: This section is repeated at the top of this file for emphasis. When creating git commits:
- ❌ NEVER mention Claude, AI, or make Claude/AI a co-author
- ❌ NO "Generated with Claude Code"
- ❌ NO "Co-Authored-By: Claude" 
- ✅ Write clean, professional commit messages without any AI attribution
- ✅ Follow conventional commit format: `type: description`

## User Preferences

**Auto-accept changes**: The user prefers to auto-accept file changes and edits without confirmation prompts.

## Code Architecture Notes

### State Management
- Uses React hooks (useState, useEffect, useCallback) for state management
- No external state management library - all state is local to the main component
- Key state includes: routes, age group, travel class, input mode, language preferences

### Pricing Logic
- All pricing calculations happen in `App.tsx` using utility functions from `pricing.ts`
- Supports complex Halbtax Plus calculations with reload logic and proportional billing
- Age group mapping from user-friendly categories to internal pricing categories

### Styling
- Uses Tailwind CSS for styling
- Color-coded route cards with unique color schemes per route
- Percentage-based color coding for subscription option comparison (green = best, red = most expensive)

### Type Safety
- Full TypeScript implementation with strict mode enabled
- Shared types between components for age groups, pricing structures, and UI components
- Type-safe translation system with parameterized strings

## Important Implementation Details

### Halbtax Plus Logic
The application implements complex Halbtax Plus calculations:
- Initial credit usage calculation
- Automatic reload logic when usage exceeds credit
- Proportional billing for partial reloads
- Toggle between reload mode and regular Halbtax ticket mode for remaining costs

### Color Scheme System
Dynamic color assignment for routes using predefined color schemes that rotate based on route index, ensuring visual distinction between multiple routes.

### Multi-language Translation System
- Parameter-based translation system supporting dynamic values
- Consistent terminology across all Swiss languages
- Context-aware translations for complex pricing scenarios