import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calculator, Train, CreditCard, ToggleLeft, ToggleRight, Plus, Trash2, Globe, User, MapPin, Clock, Banknote, ExternalLink, ChevronDown, ChevronUp, Star, Linkedin, Github, Link, FileText, Upload, Download } from 'lucide-react';
import { Language, useTranslation } from './translations';
import { getPricing, AgeGroup as PricingAgeGroup, PriceStructure, getHalbtaxPrice, getGAPrice, getMonthlyGAPrice, getHalbtaxPlusOptions, getGANightPrice, isGANightEligible, calculateMyRideAnnualCost, compareMyRideAgainstBest, MyRideCalculationResult, MyRideComparison, calculateMyRideMonthlyBill } from './pricing';
import { PurchaseLinks, getStoredLinks } from './links';
import * as pdfjs from 'pdfjs-dist';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// Import new utilities (keeping existing functionality)
import { RouteColorScheme, routeColorSchemes, getColorScheme } from './utils/colorSchemes';
import { formatCurrency } from './utils/formatters';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ''}/pdf.worker.min.js`;

// Types for better TypeScript
type AgeGroup = PricingAgeGroup; // Use the same type from pricing
type InputMode = 'simple' | 'direct' | 'pdf';

// RouteColorScheme now imported from utils

interface Route {
  id: number;
  name: string;
  from: string;
  to: string;
  trips: number | '';
  cost: number | '';
  isHalbtaxPrice: boolean;
  colorScheme: RouteColorScheme;
  durationMonths: number;
  frequencyType: 'weekly' | 'monthly';
  isGANightEligible: boolean;
}

interface CalculationResults {
  yearlySpendingFull: number;
  halbtaxTicketCosts: number;
  noAboTotal: number;
  halbtaxTotal: number;
  halbtaxPlusOptions: any[];
  gaTotal: number;
  gaMonthsUsed?: number;
  gaIsMonthlyPricing?: boolean;
  streckenabos: { route: Route, annualPrice: number, monthlyCost: number, isWorthwhile: boolean, isInValidRange: boolean }[];
  myRide: { total: number, comparison: MyRideComparison, details: MyRideCalculationResult } | null;
  options: any[];
  bestOption: any;
}

// Remove duplicate interfaces - now imported from pricing.ts

const SBBCalculator: React.FC = () => {
  // Use imported color schemes (refactored)
  const getColorSchemeForRoute = useCallback((routeIndex: number): RouteColorScheme => {
    return getColorScheme(routeIndex);
  }, []);

  const [age, setAge] = useState<AgeGroup>('erwachsene');
  const [inputMode, setInputMode] = useState<InputMode>('simple');
  // Detect browser language with English fallback
  const detectBrowserLanguage = (): Language => {
    // Get browser language preferences
    const browserLanguages = navigator.languages || [navigator.language];
    
    // Supported languages in your app
    const supportedLanguages: Language[] = ['en', 'de', 'fr', 'it', 'rm'];
    
    for (const browserLang of browserLanguages) {
      // Extract language code (e.g., 'de-CH' -> 'de')
      const langCode = browserLang.split('-')[0].toLowerCase() as Language;
      
      // Check if we support this language
      if (supportedLanguages.includes(langCode)) {
        return langCode;
      }
    }
    
    // Fallback to English if no supported language found
    return 'en';
  };

  const [language, setLanguage] = useState<Language>(detectBrowserLanguage());
  const [isFirstClass, setIsFirstClass] = useState<boolean>(false);
  const [hasExistingHalbtax, setHasExistingHalbtax] = useState<boolean>(false);
  const [getFreeHalbtax, setGetFreeHalbtax] = useState<boolean>(false);
  const [hasHundePass, setHasHundePass] = useState<boolean>(false);
  const [hasVeloPass, setHasVeloPass] = useState<boolean>(false);
  const [isHalbtaxSettingsExpanded, setIsHalbtaxSettingsExpanded] = useState<boolean>(false);
  const [allowHalbtaxPlusReload, setAllowHalbtaxPlusReload] = useState<boolean>(true);
  const [purchaseLinks, setPurchaseLinks] = useState<PurchaseLinks>(() => getStoredLinks());
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isAdditionalInfoExpanded, setIsAdditionalInfoExpanded] = useState<boolean>(false);
  
  // Simple input - Strecken (Array)
  const [routes, setRoutes] = useState<Route[]>([
    { id: 1, name: 'Route 1', from: '', to: '', trips: 2, cost: 20, isHalbtaxPrice: false, colorScheme: getColorScheme(0), durationMonths: 12, frequencyType: 'weekly', isGANightEligible: false }
  ]);
  
  // Direct input
  const [yearlySpendingDirect, setYearlySpendingDirect] = useState<number | ''>(2500);
  const [directIsHalbtaxPrice, setDirectIsHalbtaxPrice] = useState<boolean>(false);
  
  // PDF input
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTotal, setPdfTotal] = useState<number | null>(null);
  const [pdfIsHalbtaxPrice, setPdfIsHalbtaxPrice] = useState<boolean>(false);
  const [pdfProcessing, setPdfProcessing] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  // Additional travel budget (for route-based input)
  const [additionalBudget, setAdditionalBudget] = useState<number | ''>(0);
  const [additionalBudgetFrequency, setAdditionalBudgetFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('yearly');
  const [additionalBudgetExpanded, setAdditionalBudgetExpanded] = useState<boolean>(false);
  const [additionalBudgetIsHalbtax, setAdditionalBudgetIsHalbtax] = useState<boolean>(false);
  const [additionalBudgetIsGANight, setAdditionalBudgetIsGANight] = useState<boolean>(false);
  
  const [results, setResults] = useState<CalculationResults | null>(null);

  // Use translation hook
  const t = useTranslation(language);

  // Get pricing data from external pricing file
  const prices: PriceStructure = getPricing();

  // Format currency helper
  const formatCurrency = useCallback((amount: number): string => {
    return `CHF ${Math.round(amount).toLocaleString('de-CH')}`;
  }, []);

  // Export results to PDF using html2canvas
  const exportToPDF = useCallback(async () => {
    if (!results) return;

    try {
      // Scroll to top to ensure we capture from the beginning
      window.scrollTo(0, 0);
      
      // Wait for scroll and any animations to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the main app container
      const appElement = document.getElementById('root') || document.body;
      
      // Create canvas with Full HD quality settings
      const canvas = await html2canvas(appElement, {
        scale: 2.5, // Full HD quality - good balance of size vs quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: true, // Better text rendering
        removeContainer: false,
        imageTimeout: 0,
        ignoreElements: (element: Element) => {
          // Skip any problematic elements that might cause issues
          return element.tagName === 'IFRAME' || element.tagName === 'SCRIPT';
        },
        onclone: (clonedDoc: Document) => {
          // Ensure all content is visible in the cloned document
          const clonedBody = clonedDoc.body;
          clonedBody.style.height = 'auto';
          clonedBody.style.overflow = 'visible';
          clonedBody.style.transform = 'none';
          
          // Fix any elements that might be cut off
          const allElements = clonedBody.querySelectorAll('*');
          allElements.forEach((el: Element) => {
            const element = el as HTMLElement;
            if (element.style) {
              element.style.overflow = 'visible';
              element.style.height = 'auto';
              element.style.maxHeight = 'none';
              element.style.transform = 'none';
            }
          });
        }
      } as any);

      // Create PDF with margins
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 10; // 10mm margin
      const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
      const pdfHeight = pdf.internal.pageSize.getHeight() - (margin * 2);
      
      // Scale image to fit PDF width with margins
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height / canvas.width) * pdfWidth;

      // Convert canvas to optimized image for reasonable file size
      const imgData = canvas.toDataURL('image/jpeg', 0.92); // High quality JPEG with compression

      // Calculate pages needed
      const totalPages = Math.ceil(imgHeight / pdfHeight);
      
      // Add content to PDF pages
      for (let page = 0; page < totalPages && page < 8; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const yPosition = margin - (page * pdfHeight);
        pdf.addImage(imgData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
      }

      // Save the PDF
      const fileName = `SBB_Subscription_Comparison_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(t('exportPdfError') || 'Error generating PDF. Please try again.');
    }
  }, [results, t]);

  // Get purchase link for option type
  const getPurchaseLink = useCallback((optionType: string): string => {
    switch (optionType) {
      case 'halbtax':
        return purchaseLinks.halbtax;
      case 'halbtaxplus':
        return purchaseLinks.halbtaxPlus;
      case 'ga':
        return purchaseLinks.ga;
      default:
        return '';
    }
  }, [purchaseLinks]);

  // Toggle card expansion
  const toggleCardExpansion = useCallback((cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);


  // Process PDF file to extract total cost using PDF.js
  const processPdfFile = useCallback(async (file: File) => {
    setPdfProcessing(true);
    try {
      // Convert file to array buffer
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      // Load PDF document with PDF.js
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }

      console.log('Extracted PDF text:', fullText); // Debug logging

      // Blacklist of subscription types to exclude (in all languages)
      const subscriptionBlacklist = [
        // German
        'HALBTAX', 'HALBTAX PLUS', 'GA TRAVELCARD', 'GENERALABONNEMENT', 
        'STRECKENABONNEMENT', 'GLEIS 7', 'TAGESKARTE GEMEINDE',
        // French  
        'DEMI-TARIF', 'DEMI-TARIF PLUS', 'AG VOYAGEUR', 'ABONNEMENT GENERAL',
        'ABONNEMENT DE PARCOURS', 'CARTE JOURNALIERE COMMUNE',
        // Italian
        'METÀ-PREZZO', 'METÀ-PREZZO PLUS', 'AG VIAGGIATORI', 'ABBONAMENTO GENERALE',
        'ABBONAMENTO TRATTA', 'BIGLIETTO GIORNALIERO COMUNALE',
        // English (just in case)
        'HALF-FARE', 'HALF-FARE PLUS', 'GENERAL ABONNEMENT', 'GA TRAVEL CARD'
      ];

      // Find all ticket entries with their prices
      // Pattern: any text followed by amount and CHF
      const allTicketMatches = Array.from(fullText.matchAll(/^(.+?)\s+(\d+(?:\.\d{1,2})?)\s+CHF\s*$/gm));
      
      if (allTicketMatches.length === 0) {
        // Fallback pattern for different formatting
        const fallbackMatches = Array.from(fullText.matchAll(/(.+?)\s+(\d+(?:\.\d{1,2})?)\s+CHF/g));
        if (fallbackMatches.length === 0) {
          throw new Error('Could not find any ticket entries in PDF. Please ensure this is a valid SBB receipt.');
        }
        allTicketMatches.push(...fallbackMatches);
      }

      console.log('Found ticket matches:', allTicketMatches.map(m => `${m[1].trim()} - ${m[2]} CHF`));

      let validTicketPrices: number[] = [];
      let excludedItems: string[] = [];

      for (const match of allTicketMatches) {
        const ticketDescription = match[1].trim().toUpperCase();
        const price = parseFloat(match[2]);

        // Skip if price is 0 or invalid
        if (isNaN(price) || price <= 0) continue;

        // Check if this ticket should be excluded
        const isExcluded = subscriptionBlacklist.some(blacklistedItem => 
          ticketDescription.includes(blacklistedItem)
        );

        // Also exclude "Total" lines in any language
        const isTotalLine = /\b(TOTAL|TOTALE|SOMME|SUMA)\b/i.test(ticketDescription);

        if (isExcluded || isTotalLine) {
          excludedItems.push(`${ticketDescription} (${price} CHF)`);
          console.log('Excluding:', ticketDescription, price, 'CHF');
        } else {
          validTicketPrices.push(price);
          console.log('Including:', ticketDescription, price, 'CHF');
        }
      }

      if (validTicketPrices.length === 0) {
        throw new Error('No valid travel tickets found in PDF. All entries appear to be subscriptions or invalid items.');
      }

      const total = validTicketPrices.reduce((sum, price) => sum + price, 0);
      
      console.log('Valid ticket prices:', validTicketPrices);
      console.log('Excluded items:', excludedItems);
      console.log('Calculated total:', total);

      setPdfTotal(total);
      return total;

    } catch (error) {
      console.error('Error processing PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error processing PDF';
      setPdfError(errorMessage);
      setPdfTotal(null);
      return null;
    } finally {
      setPdfProcessing(false);
    }
  }, []);

  // Calculate Streckenabo using linear regression formula
  const calculateStreckenabo = (roundTripPrice: number): number => {
    // Formula: AnnualPass(p) ≈ 173.5 * p - 2.44 * p²
    // Valid for 4 ≤ p ≤ 50 CHF with ±5-10% accuracy
    return Math.max(0, 173.5 * roundTripPrice - 2.44 * Math.pow(roundTripPrice, 2));
  };

  // useCallback for functions passed to child components or used in effects
  const calculate = useCallback(() => {
    // Calculate costs for the actual duration, not extrapolated to full year
    let yearlySpendingFull: number;
    if (inputMode === 'simple') {
      yearlySpendingFull = routes.reduce((total, route) => {
        const trips = typeof route.trips === 'number' ? route.trips : 0;
        const cost = typeof route.cost === 'number' ? route.cost : 0;
        // Calculate for actual duration based on frequency type
        let actualRouteCost: number;
        if (route.frequencyType === 'weekly') {
          actualRouteCost = trips * cost * (route.durationMonths * 4.33); // 4.33 weeks per month average
        } else {
          actualRouteCost = trips * cost * route.durationMonths; // monthly frequency
        }
        return total + (route.isHalbtaxPrice ? actualRouteCost * 2 : actualRouteCost);
      }, 0);
      
      // Add additional budget if present
      if (additionalBudget && typeof additionalBudget === 'number' && additionalBudget > 0) {
        let additionalCost: number;
        const longestDuration = Math.max(...routes.map(route => route.durationMonths));
        
        switch (additionalBudgetFrequency) {
          case 'weekly':
            additionalCost = additionalBudget * (longestDuration * 4.33);
            break;
          case 'monthly':
            additionalCost = additionalBudget * longestDuration;
            break;
          case 'yearly':
            additionalCost = additionalBudget;
            break;
          default:
            additionalCost = 0;
        }
        
        yearlySpendingFull += additionalBudgetIsHalbtax ? additionalCost * 2 : additionalCost;
      }
    } else if (inputMode === 'direct') {
      const directAmount = typeof yearlySpendingDirect === 'number' ? yearlySpendingDirect : 0;
      yearlySpendingFull = directIsHalbtaxPrice ? directAmount * 2 : directAmount;
    } else if (inputMode === 'pdf') {
      const pdfAmount = pdfTotal || 0;
      yearlySpendingFull = pdfIsHalbtaxPrice ? pdfAmount * 2 : pdfAmount;
    } else {
      yearlySpendingFull = 0;
    }
    
    const halbtaxPrice = getFreeHalbtax ? 0 : getHalbtaxPrice(age, !hasExistingHalbtax);
    const gaPrice = getGAPrice(age, isFirstClass);
    
    // Additional pass costs
    const additionalPassCosts = (hasHundePass ? 350 : 0) + (hasVeloPass ? 260 : 0);
    
    // Option 1: Kein Abo
    const noAboTotal = yearlySpendingFull + additionalPassCosts;
    
    // Option 2: Nur Halbtax
    let halbtaxTicketCosts: number;
    if (inputMode === 'simple') {
      halbtaxTicketCosts = routes.reduce((total, route) => {
        const trips = typeof route.trips === 'number' ? route.trips : 0;
        const cost = typeof route.cost === 'number' ? route.cost : 0;
        // Calculate for actual duration based on frequency type
        let actualRouteCost: number;
        if (route.frequencyType === 'weekly') {
          actualRouteCost = trips * cost * (route.durationMonths * 4.33); // 4.33 weeks per month average
        } else {
          actualRouteCost = trips * cost * route.durationMonths; // monthly frequency
        }
        return total + (route.isHalbtaxPrice ? actualRouteCost : actualRouteCost / 2);
      }, 0);
      
      // Add additional budget halbtax costs if present
      if (additionalBudget && typeof additionalBudget === 'number' && additionalBudget > 0) {
        let additionalCost: number;
        const longestDuration = Math.max(...routes.map(route => route.durationMonths));
        
        switch (additionalBudgetFrequency) {
          case 'weekly':
            additionalCost = additionalBudget * (longestDuration * 4.33);
            break;
          case 'monthly':
            additionalCost = additionalBudget * longestDuration;
            break;
          case 'yearly':
            additionalCost = additionalBudget;
            break;
          default:
            additionalCost = 0;
        }
        
        halbtaxTicketCosts += additionalBudgetIsHalbtax ? additionalCost : additionalCost / 2;
      }
    } else if (inputMode === 'direct') {
      const directAmount = typeof yearlySpendingDirect === 'number' ? yearlySpendingDirect : 0;
      halbtaxTicketCosts = directIsHalbtaxPrice ? directAmount : directAmount / 2;
    } else if (inputMode === 'pdf') {
      const pdfAmount = pdfTotal || 0;
      halbtaxTicketCosts = pdfIsHalbtaxPrice ? pdfAmount : pdfAmount / 2;
    } else {
      halbtaxTicketCosts = 0;
    }
    const halbtaxTotal = halbtaxTicketCosts + halbtaxPrice + additionalPassCosts;
    
    // Option 3: Halbtax Plus (alle Varianten) - mit Nachladung
    // Map all age groups to Halbtax PLUS categories: 'jugend' (6-24.99 years) or 'erwachsene' (25+ years)
    const getHalbtaxPlusCategory = (ageGroup: AgeGroup): 'jugend' | 'erwachsene' | null => {
      switch (ageGroup) {
        case 'kind':           // 6-16 years -> jugend category
        case 'jugend':         // 16-25 years -> jugend category
          return 'jugend';
        case 'fuenfundzwanzig': // 25 years -> erwachsene category
        case 'erwachsene':      // 26-64/65 years -> erwachsene category
        case 'senior':          // 64+/65+ years -> erwachsene category
        case 'behinderung':     // disability -> erwachsene category
          return 'erwachsene';
        default:
          return null;
      }
    };
    
    const halbtaxPlusCategory = getHalbtaxPlusCategory(age);
    const halbtaxPlusAvailable = halbtaxPlusCategory !== null;
    const halbtaxPlusOptions = halbtaxPlusAvailable 
      ? Object.entries(getHalbtaxPlusOptions(halbtaxPlusCategory!)).map(([credit, data]) => {
      const creditAmount = data.credit;
      const packageCost = data.cost;
      
      if (halbtaxTicketCosts <= creditAmount) {
        // All costs covered by initial credit
        const total = packageCost + halbtaxPrice + additionalPassCosts;
        return {
          credit: parseInt(credit),
          cost: packageCost,
          total: total,
          coveredByCredit: halbtaxTicketCosts,
          remainingCosts: 0,
          reloadCount: 0,
          reloadCost: 0,
          halbtaxTicketsAfterCredit: 0
        };
      } else {
        // More costs than initial credit
        const remainingAfterFirst = halbtaxTicketCosts - creditAmount;
        
        if (allowHalbtaxPlusReload) {
          // Original logic: reload Halbtax PLUS packages
          const reloadCount = Math.ceil(remainingAfterFirst / creditAmount);
          const lastReloadUsage = remainingAfterFirst % creditAmount || creditAmount;
          
          let totalReloadCost = 0;
          for (let i = 0; i < reloadCount; i++) {
            if (i === reloadCount - 1) {
              const usageRatio = lastReloadUsage / creditAmount;
              totalReloadCost += packageCost * usageRatio;
            } else {
              totalReloadCost += packageCost;
            }
          }
          
          const total = packageCost + halbtaxPrice + totalReloadCost + additionalPassCosts;
          
          return {
            credit: parseInt(credit),
            cost: packageCost,
            total: total,
            coveredByCredit: creditAmount,
            remainingCosts: remainingAfterFirst,
            reloadCount: reloadCount,
            reloadCost: totalReloadCost,
            lastReloadUsage: lastReloadUsage,
            lastReloadRatio: lastReloadUsage / creditAmount,
            halbtaxTicketsAfterCredit: 0
          };
        } else {
          // New logic: use initial credit + regular Halbtax tickets for remaining
          const total = packageCost + halbtaxPrice + remainingAfterFirst + additionalPassCosts;
          
          return {
            credit: parseInt(credit),
            cost: packageCost,
            total: total,
            coveredByCredit: creditAmount,
            remainingCosts: remainingAfterFirst,
            reloadCount: 0,
            reloadCost: 0,
            halbtaxTicketsAfterCredit: remainingAfterFirst
          };
        }
      }
    })
      : [];
    
    // Option 4: GA - Compare annual vs monthly pricing based on longest route duration
    let gaTotal = gaPrice + additionalPassCosts;
    let gaMonthsUsed: number | undefined;
    let gaIsMonthlyPricing = false;
    
    if (inputMode === 'simple' && routes.length > 0) {
      // Find the longest duration route
      const longestDuration = Math.max(...routes.map(route => route.durationMonths));
      const monthlyGAPrice = getMonthlyGAPrice(age, isFirstClass);
      const monthlyTotal = monthlyGAPrice * longestDuration;
      
      // Use monthly pricing if it's cheaper than annual
      if (monthlyTotal < gaPrice) {
        gaTotal = monthlyTotal + additionalPassCosts;
        gaMonthsUsed = longestDuration;
        gaIsMonthlyPricing = true;
      }
    }
    
    // Option 5: GA Night calculation with best complementary option
    let gaNightBestOption = null;
    
    if (inputMode === 'simple' && isGANightEligible(age, isFirstClass)) {
      // Check if any routes or additional budget are GA Night eligible
      const hasGANightRoutes = routes.some(route => route.isGANightEligible);
      const hasGANightBudget = additionalBudget && typeof additionalBudget === 'number' && additionalBudget > 0 && additionalBudgetIsGANight;
      
      if (hasGANightRoutes || hasGANightBudget) {
        // Calculate costs not covered by GA Night (full price)
        const nonCoveredFullCosts = routes.reduce((total, route) => {
          if (route.isGANightEligible) {
            return total; // Covered by GA Night, costs 0
          } else {
            const trips = typeof route.trips === 'number' ? route.trips : 0;
            const cost = typeof route.cost === 'number' ? route.cost : 0;
            let actualRouteCost: number;
            if (route.frequencyType === 'weekly') {
              actualRouteCost = trips * cost * (route.durationMonths * 4.33);
            } else {
              actualRouteCost = trips * cost * route.durationMonths;
            }
            return total + (route.isHalbtaxPrice ? actualRouteCost * 2 : actualRouteCost);
          }
        }, 0);
        
        // Add non-covered additional budget costs
        let nonCoveredAdditionalCosts = 0;
        if (additionalBudget && typeof additionalBudget === 'number' && additionalBudget > 0 && !additionalBudgetIsGANight) {
          const longestDuration = Math.max(...routes.map(route => route.durationMonths));
          switch (additionalBudgetFrequency) {
            case 'weekly':
              nonCoveredAdditionalCosts = additionalBudget * (longestDuration * 4.33);
              break;
            case 'monthly':
              nonCoveredAdditionalCosts = additionalBudget * longestDuration;
              break;
            case 'yearly':
              nonCoveredAdditionalCosts = additionalBudget;
              break;
          }
          nonCoveredAdditionalCosts = additionalBudgetIsHalbtax ? nonCoveredAdditionalCosts * 2 : nonCoveredAdditionalCosts;
        }
        
        const totalNonCoveredCosts = nonCoveredFullCosts + nonCoveredAdditionalCosts;
        const gaNightPrice = getGANightPrice();
        
        if (totalNonCoveredCosts > 0) {
          // Test different options for non-covered costs
          const gaNightOptions = [];
          
          // Option A: GA Night + Full price for non-covered
          gaNightOptions.push({
            total: gaNightPrice + totalNonCoveredCosts + additionalPassCosts,
            name: `${t('ganight')}`,
            complementary: null,
            nonCoveredCosts: totalNonCoveredCosts
          });
          
          // Option B: GA Night + Halbtax
          const halbtaxPrice = getFreeHalbtax ? 0 : getHalbtaxPrice(age, !hasExistingHalbtax);
          gaNightOptions.push({
            total: gaNightPrice + halbtaxPrice + (totalNonCoveredCosts / 2) + additionalPassCosts,
            name: `${t('ganight')} + ${t('halbtaxOnly')}`,
            complementary: 'halbtax',
            halbtaxPrice: halbtaxPrice,
            nonCoveredCosts: totalNonCoveredCosts / 2
          });
          
          // Option C: GA Night + Halbtax + Halbtax Plus variants (most optimal)
          if (age === 'jugend' || age === 'erwachsene') {
            const halbtaxPlusOptions = getHalbtaxPlusOptions(age);
            Object.entries(halbtaxPlusOptions).forEach(([credit, option]) => {
              const creditAmount = parseInt(credit);
              // Include base Halbtax for 50% discount on all non-covered costs
              let totalCost = gaNightPrice + halbtaxPrice + option.cost + additionalPassCosts;
              let coveredByCredit = Math.min(totalNonCoveredCosts / 2, creditAmount);
              let remainingCosts = (totalNonCoveredCosts / 2) - coveredByCredit;
              
              let reloadCost = 0;
              let reloadCount = 0;
              let lastReloadRatio = 0;
              
              if (remainingCosts > 0 && allowHalbtaxPlusReload) {
                reloadCount = Math.floor(remainingCosts / creditAmount);
                const finalRemainder = remainingCosts % creditAmount;
                if (finalRemainder > 0) {
                  reloadCount += 1;
                  lastReloadRatio = finalRemainder / creditAmount;
                }
                reloadCost = (reloadCount - (finalRemainder > 0 ? 1 : 0)) * option.cost + 
                           (finalRemainder > 0 ? option.cost * lastReloadRatio : 0);
                totalCost += reloadCost;
              } else if (remainingCosts > 0) {
                totalCost += remainingCosts;
              }
              
              gaNightOptions.push({
                total: totalCost,
                name: `${t('ganight')} + ${t('halbtaxOnly')} + ${t('halbtaxPlus', { credit })}`,
                complementary: 'halbtaxplus',
                credit: creditAmount,
                halbtaxPrice: halbtaxPrice,
                halbtaxPlusCost: option.cost,
                coveredByCredit,
                reloadCost,
                reloadCount,
                lastReloadRatio,
                remainingCosts: allowHalbtaxPlusReload ? 0 : remainingCosts
              });
            });
          }
          
          // Find the best option
          gaNightBestOption = gaNightOptions.reduce((best, current) => 
            current.total < best.total ? current : best
          );
        } else {
          // No non-covered costs, just GA Night
          gaNightBestOption = {
            total: gaNightPrice + additionalPassCosts,
            name: t('ganight'),
            complementary: null,
            nonCoveredCosts: 0
          };
        }
      }
    }
    
    // Option 6: Streckenabo calculations (only for simple input mode with individual routes)
    const streckenabos = inputMode === 'simple' ? routes.map(route => {
      const cost = typeof route.cost === 'number' ? route.cost : 0;
      const trips = typeof route.trips === 'number' ? route.trips : 0;
      const actualCost = route.isHalbtaxPrice ? cost * 2 : cost;
      const annualPrice = calculateStreckenabo(actualCost);
      const monthlyCost = annualPrice / 12;
      const actualRouteSpending = route.frequencyType === 'weekly' 
        ? trips * actualCost * (route.durationMonths * 4.33) 
        : trips * actualCost * route.durationMonths;
      const isWorthwhile = annualPrice < actualRouteSpending && actualCost >= 4 && actualCost <= 50;
      const isInValidRange = actualCost >= 4 && actualCost <= 50;
      
      return {
        route,
        annualPrice,
        monthlyCost,
        isWorthwhile,
        isInValidRange
      };
    }) : [];
    
    // Calculate duration information for point-to-point tickets
    const longestDuration = inputMode === 'simple' && routes.length > 0 
      ? Math.max(...routes.map(route => route.durationMonths))
      : undefined;
    
    // Beste Option finden (needed for MyRide comparison)
    const options = [
      { name: t('noSubscription'), total: noAboTotal, type: 'none' },
      { name: t('halbtaxOnly'), total: halbtaxTotal, type: 'halbtax' },
      ...halbtaxPlusOptions.map(opt => ({ 
        name: t('halbtaxPlus', { credit: opt.credit }), 
        total: opt.total, 
        type: 'halbtaxplus',
        credit: opt.credit,
        details: opt
      })),
      ...(gaNightBestOption !== null ? [{ 
        name: gaNightBestOption.name, 
        total: gaNightBestOption.total, 
        type: 'ganight',
        gaNightDetails: gaNightBestOption
      }] : []),
      { 
        name: gaIsMonthlyPricing && gaMonthsUsed ? `${t('ga')} (${gaMonthsUsed} months)` : t('ga'), 
        total: gaTotal, 
        type: 'ga' 
      }
    ];
    
    const bestOption = options.reduce((best, current) => 
      current.total < best.total ? current : best
    );
    
    // Option 7: MyRide.ch Smart-Abo calculation (after bestOption is known)
    const myRide = (() => {
      const annualCost = calculateMyRideAnnualCost(yearlySpendingFull, isFirstClass, hasExistingHalbtax || getFreeHalbtax);
      const comparison = compareMyRideAgainstBest(annualCost, bestOption.total);
      const monthlyDetails = calculateMyRideMonthlyBill(yearlySpendingFull / 12, isFirstClass, hasExistingHalbtax || getFreeHalbtax);
      
      return {
        total: annualCost,
        comparison,
        details: monthlyDetails
      };
    })();
    
    setResults({
      yearlySpendingFull,
      halbtaxTicketCosts,
      noAboTotal,
      halbtaxTotal,
      halbtaxPlusOptions,
      gaTotal,
      gaMonthsUsed,
      gaIsMonthlyPricing,
      streckenabos,
      myRide,
      options,
      bestOption
    });
  }, [age, inputMode, routes, yearlySpendingDirect, directIsHalbtaxPrice, hasExistingHalbtax, getFreeHalbtax, hasHundePass, hasVeloPass, t, allowHalbtaxPlusReload, isFirstClass, pdfTotal, pdfIsHalbtaxPrice, additionalBudget, additionalBudgetFrequency, additionalBudgetIsHalbtax, additionalBudgetIsGANight]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Initialize purchase links on mount
  useEffect(() => {
    const links = getStoredLinks();
    setPurchaseLinks(links);
  }, []);

  // Strecken-Management Funktionen
  const addRoute = useCallback(() => {
    const newId = Math.max(...routes.map(r => r.id)) + 1;
    const newColorScheme = getColorSchemeForRoute(routes.length);
    setRoutes(prev => [...prev, { id: newId, name: `Route ${newId}`, from: '', to: '', trips: 1, cost: 20, isHalbtaxPrice: false, colorScheme: newColorScheme, durationMonths: 12, frequencyType: 'weekly', isGANightEligible: false }]);
  }, [routes, getColorSchemeForRoute]);

  const removeRoute = useCallback((id: number) => {
    if (routes.length > 1) {
      setRoutes(prev => prev.filter(r => r.id !== id));
    }
  }, [routes.length]);

  const updateRoute = useCallback((id: number, field: keyof Omit<Route, 'id'>, value: any) => {
    setRoutes(prev => prev.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  }, []);

  const doublePriceForRoute = useCallback((id: number) => {
    setRoutes(prev => prev.map(r => {
      if (r.id === id) {
        const currentCost = typeof r.cost === 'number' ? r.cost : parseFloat(r.cost as string) || 0;
        if (currentCost > 0) {
          return { ...r, cost: currentCost * 2 };
        }
      }
      return r;
    }));
  }, []);

  const generateSBBUrl = useCallback((from: string, to: string): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const stops = [
      {
        value: "",
        type: "ID",
        label: from
      },
      {
        value: "",
        type: "ID", 
        label: to
      }
    ];
    
    const stopsParam = encodeURIComponent(JSON.stringify(stops));
    const dateParam = encodeURIComponent(`"${dateStr}"`);
    
    return `https://www.sbb.ch/de?stops=${stopsParam}&date=${dateParam}&time=%2212:00%22&moment=%22DEPARTURE%22`;
  }, []);

  const handleCheckSBBPrices = useCallback((from: string, to: string) => {
    if (from?.trim() && to?.trim()) {
      const url = generateSBBUrl(from.trim(), to.trim());
      window.open(url, '_blank');
    }
  }, [generateSBBUrl]);

  const getOptionColor = useCallback((option: any, bestOptionTotal: number): string => {
    if (option.total === bestOptionTotal) {
      return 'bg-green-50 border-green-200 text-green-800';
    }
    
    // Calculate percentage increase from best option
    const percentageIncrease = ((option.total - bestOptionTotal) / bestOptionTotal) * 100;
    
    if (percentageIncrease <= 5) {
      // 0-5% more expensive: Light green (very good)
      return 'bg-green-50 border-green-200 text-green-800';
    } else if (percentageIncrease <= 15) {
      // 5-15% more expensive: Yellow-green (good)
      return 'bg-lime-50 border-lime-200 text-lime-800';
    } else if (percentageIncrease <= 30) {
      // 15-30% more expensive: Yellow (okay)
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    } else if (percentageIncrease <= 50) {
      // 30-50% more expensive: Orange (not great)
      return 'bg-orange-50 border-orange-200 text-orange-800';
    } else if (percentageIncrease <= 75) {
      // 50-75% more expensive: Red-orange (bad)
      return 'bg-red-50 border-red-200 text-red-800';
    } else {
      // 75%+ more expensive: Dark red (very bad)
      return 'bg-red-100 border-red-300 text-red-900';
    }
  }, []);

  return (
    <>
      {/* Custom slider styles */}
      <style>
        {`
          input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid currentColor;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
          }
          
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ffffff;
            border: 3px solid currentColor;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
          }
          
          input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
        `}
      </style>
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-red-600 rounded-full blur-sm opacity-20"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-red-700 p-2 rounded-full shadow-lg">
              <Train className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">{t('title')}</h1>
        </div>
        
        {/* Language Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Globe className="w-4 h-4 text-gray-600" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="p-2 sm:p-3 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors min-w-[120px]"
            title={t('selectLanguage')}
          >
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="it">Italiano</option>
            <option value="rm">Rumantsch</option>
          </select>
        </div>
      </div>


      <div className="space-y-6 sm:space-y-8 pb-8">
        {/* Passenger Category and Travel Class */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <label className="text-base sm:text-lg font-semibold text-blue-900">
                  {t('ageGroup')}
                </label>
              </div>
              <select 
                value={age} 
                onChange={(e) => setAge(e.target.value as AgeGroup)}
                className="w-full p-3 sm:p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-800 font-medium transition-all hover:border-blue-300 text-sm sm:text-base"
              >
                <option value="kind">{t('child')}</option>
                <option value="jugend">{t('youth')}</option>
                <option value="fuenfundzwanzig">{t('twentyFive')}</option>
                <option value="erwachsene">{t('adult')}</option>
                <option value="senior">{t('senior')}</option>
                <option value="behinderung">{t('disability')}</option>
              </select>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <label className="text-base sm:text-lg font-semibold text-blue-900">
                  {t('travelClass')}
                </label>
              </div>
              <select 
                value={isFirstClass ? 'first' : 'second'} 
                onChange={(e) => setIsFirstClass(e.target.value === 'first')}
                className="w-full p-3 sm:p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-gray-800 font-medium transition-all hover:border-blue-300 text-sm sm:text-base"
              >
                <option value="second">
                  {t('secondClass')}
                </option>
                <option value="first">
                  {t('firstClass')}
                </option>
              </select>
            </div>
          </div>

          {/* Additional Halbtax Settings and Subscriptions */}
          <div className="mt-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 shadow-sm">
            <button
              onClick={() => setIsHalbtaxSettingsExpanded(!isHalbtaxSettingsExpanded)}
              className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-gray-100/50 rounded-xl transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <span className="text-sm sm:text-base font-semibold text-gray-800">
                  {t('halbtaxSettingsTitle')}
                </span>
                {(hasExistingHalbtax || getFreeHalbtax || hasHundePass || hasVeloPass) && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {[hasExistingHalbtax, getFreeHalbtax, hasHundePass, hasVeloPass].filter(Boolean).length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isHalbtaxSettingsExpanded ? (
                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                )}
              </div>
            </button>

            {isHalbtaxSettingsExpanded && (
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {/* Existing Halbtax Checkbox */}
                  <div className="bg-white p-3 sm:p-4 rounded-xl border-2 border-blue-300 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <input
                        type="checkbox"
                        id="existing-halbtax"
                        checked={hasExistingHalbtax}
                        onChange={(e) => setHasExistingHalbtax(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-2 border-blue-400 rounded-md focus:ring-blue-500 transition-all"
                        disabled={getFreeHalbtax}
                      />
                      <label htmlFor="existing-halbtax" className={`text-xs sm:text-sm font-medium cursor-pointer flex-1 ${
                        getFreeHalbtax ? 'text-blue-400' : 'text-blue-800'
                      }`}>
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">{t('hasExistingHalbtax')}</span>
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Free Halbtax Checkbox */}
                  <div className="bg-white p-3 sm:p-4 rounded-xl border-2 border-green-300 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <input
                        type="checkbox"
                        id="free-halbtax"
                        checked={getFreeHalbtax}
                        onChange={(e) => {
                          setGetFreeHalbtax(e.target.checked);
                          if (e.target.checked) {
                            setHasExistingHalbtax(false);
                          }
                        }}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-2 border-green-400 rounded-md focus:ring-green-500 transition-all"
                      />
                      <label htmlFor="free-halbtax" className="text-xs sm:text-sm font-medium text-green-800 cursor-pointer flex-1">
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">{t('getFreeHalbtax')}</span>
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Hunde-Pass Checkbox */}
                  <div className="bg-white p-3 sm:p-4 rounded-xl border-2 border-amber-300 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <input
                        type="checkbox"
                        id="hunde-pass"
                        checked={hasHundePass}
                        onChange={(e) => setHasHundePass(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 border-2 border-amber-400 rounded-md focus:ring-amber-500 transition-all"
                      />
                      <label htmlFor="hunde-pass" className="text-xs sm:text-sm font-medium text-amber-800 cursor-pointer flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm">{t('hundePass')} (CHF 350)</span>
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Velo-Pass Checkbox */}
                  <div className="bg-white p-3 sm:p-4 rounded-xl border-2 border-purple-300 shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 w-full">
                      <input
                        type="checkbox"
                        id="velo-pass"
                        checked={hasVeloPass}
                        onChange={(e) => setHasVeloPass(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 border-2 border-purple-400 rounded-md focus:ring-purple-500 transition-all"
                      />
                      <label htmlFor="velo-pass" className="text-xs sm:text-sm font-medium text-purple-800 cursor-pointer flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm">{t('veloPass')} (CHF 260)</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Eingabemodus Toggle */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <label className="text-base sm:text-lg font-semibold text-blue-900">
              {t('costEstimation')}
            </label>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 mb-4 sm:mb-6">
            <button
              onClick={() => setInputMode('simple')}
              className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 min-h-[48px] text-sm sm:text-base ${
                inputMode === 'simple' 
                  ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-200'
              }`}
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {inputMode === 'simple' ? <ToggleRight className="w-4 h-4 flex-shrink-0" /> : <ToggleLeft className="w-4 h-4 flex-shrink-0" />}
              <span className="font-medium">{t('simpleInput')}</span>
            </button>
            <button
              onClick={() => setInputMode('direct')}
              className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 min-h-[48px] text-sm sm:text-base ${
                inputMode === 'direct' 
                  ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-200'
              }`}
            >
              <Banknote className="w-4 h-4 flex-shrink-0" />
              {inputMode === 'direct' ? <ToggleRight className="w-4 h-4 flex-shrink-0" /> : <ToggleLeft className="w-4 h-4 flex-shrink-0" />}
              <span className="font-medium">{t('directInput')}</span>
            </button>
            <button
              onClick={() => setInputMode('pdf')}
              className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-3 rounded-xl border-2 transition-all transform hover:scale-105 active:scale-95 min-h-[48px] text-sm sm:text-base ${
                inputMode === 'pdf' 
                  ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-200'
              }`}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              {inputMode === 'pdf' ? <ToggleRight className="w-4 h-4 flex-shrink-0" /> : <ToggleLeft className="w-4 h-4 flex-shrink-0" />}
              <span className="font-medium">{t('pdfInput')}</span>
            </button>
          </div>

          {inputMode === 'simple' ? (
            <div className="space-y-4">
              {/* Dynamische Strecken */}
              {routes.map((route, index) => (
                <div key={route.id} className={`bg-gradient-to-br ${route.colorScheme.bg} p-4 sm:p-6 rounded-xl border-2 ${route.colorScheme.border} shadow-sm hover:shadow-md transition-all`}>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 ${route.colorScheme.buttonBg} text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm`}>
                        {index + 1}
                      </div>
                      <div className={`flex items-center gap-2 flex-1 min-w-0`}>
                        <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${route.colorScheme.accent} flex-shrink-0`} />
                        <input
                          type="text"
                          value={route.name}
                          onChange={(e) => updateRoute(route.id, 'name', e.target.value)}
                          className={`bg-transparent border-b-2 border-dashed ${route.colorScheme.border200} hover:${route.colorScheme.border300} focus:border-solid focus:${route.colorScheme.focusRing} outline-none font-semibold ${route.colorScheme.text} text-base sm:text-lg placeholder-gray-400 min-w-0 flex-1 px-1 transition-all`}
                          placeholder={`${t('route')} ${index + 1}`}
                        />
                      </div>
                    </div>
                    {routes.length > 1 && (
                      <button
                        onClick={() => removeRoute(route.id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all transform hover:scale-110 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title={t('removeRoute')}
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>

                  {/* From/To Station Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${route.colorScheme.text} mb-2 sm:mb-3`}>
                        <Train className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('fromStation')}
                      </label>
                      <input 
                        type="text" 
                        value={route.from || ''}
                        onChange={(e) => updateRoute(route.id, 'from', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-3 border-2 ${route.colorScheme.border200} rounded-xl focus:ring-2 ${route.colorScheme.focusRing} bg-white shadow-sm transition-all hover:${route.colorScheme.border300} text-sm sm:text-base`}
                        placeholder="e.g. Zürich HB"
                      />
                    </div>
                    <div>
                      <label className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${route.colorScheme.text} mb-2 sm:mb-3`}>
                        <Train className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('toStation')}
                      </label>
                      <input 
                        type="text" 
                        value={route.to || ''}
                        onChange={(e) => updateRoute(route.id, 'to', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-3 border-2 ${route.colorScheme.border200} rounded-xl focus:ring-2 ${route.colorScheme.focusRing} bg-white shadow-sm transition-all hover:${route.colorScheme.border300} text-sm sm:text-base`}
                        placeholder="e.g. Bern"
                      />
                    </div>
                  </div>

                  {/* SBB URL Button */}
                  {route.from?.trim() && route.to?.trim() && (
                    <div className="flex justify-end mb-4">
                      <button
                        type="button"
                        onClick={() => handleCheckSBBPrices(route.from, route.to)}
                        className={`px-4 py-2 ${route.colorScheme.buttonBg} text-white rounded-lg hover:brightness-110 flex items-center gap-2 text-sm font-medium transition-all`}
                        title={t('checkSBBPricesTooltip')}
                      >
                        <Train className="w-4 h-4" />
                        {t('checkSBBPrices')}
                      </button>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4">
                    <div className="relative">
                      <label className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${route.colorScheme.text} mb-2 sm:mb-3`}>
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {route.frequencyType === 'weekly' ? t('tripsPerWeek') : t('tripsPerMonth')}
                      </label>
                      <input 
                        type="number" 
                        value={route.trips || ''}
                        onChange={(e) => updateRoute(route.id, 'trips', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                        onWheel={(e) => e.currentTarget.blur()}
                        className={`w-full px-3 sm:px-4 py-3 border-2 ${route.colorScheme.border200} rounded-xl focus:ring-2 ${route.colorScheme.focusRing} bg-white shadow-sm transition-all hover:${route.colorScheme.border300} text-sm sm:text-base`}
                        placeholder={t('placeholderTrips')}
                        step="0.5"
                        min="0"
                      />
                      
                      {/* Frequency Toggle */}
                      <div className="mt-2">
                        <div className="flex rounded-lg border-2 ${route.colorScheme.border200} overflow-hidden bg-white h-12">
                          <button
                            onClick={() => updateRoute(route.id, 'frequencyType', 'weekly')}
                            className={`flex-1 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all flex items-center justify-center ${
                              route.frequencyType === 'weekly'
                                ? `${route.colorScheme.buttonBg} text-white`
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {t('weekly')}
                          </button>
                          <button
                            onClick={() => updateRoute(route.id, 'frequencyType', 'monthly')}
                            className={`flex-1 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium transition-all border-l-2 ${route.colorScheme.border200} flex items-center justify-center ${
                              route.frequencyType === 'monthly'
                                ? `${route.colorScheme.buttonBg} text-white`
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {t('monthly')}
                          </button>
                        </div>
                      </div>
                      
                      <div className={`text-xs ${route.colorScheme.accent} mt-1 sm:mt-2 flex items-center gap-1`}>
                        <span>ℹ️</span>
                        <span className="text-xs">{route.frequencyType === 'weekly' ? t('tripsPerWeekHelp') : t('tripsPerMonthHelp')}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <label className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${route.colorScheme.text} mb-2 sm:mb-3`}>
                        <Banknote className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('costPerTrip')}
                      </label>
                      <div className="relative">
                        <span className={`absolute left-3 top-3 ${route.colorScheme.accent} font-medium text-sm sm:text-base`}>CHF</span>
                        <input 
                          type="number" 
                          value={route.cost || ''}
                          onChange={(e) => updateRoute(route.id, 'cost', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                          onWheel={(e) => e.currentTarget.blur()}
                          className={`w-full pl-11 sm:pl-12 pr-20 sm:pr-24 py-3 border-2 ${route.colorScheme.border200} rounded-xl focus:ring-2 ${route.colorScheme.focusRing} bg-white shadow-sm transition-all hover:${route.colorScheme.border300} text-sm sm:text-base`}
                        placeholder={t('placeholderCost')}
                        step="0.10"
                        min="0"
                      />
                        <div className="absolute right-0 top-0 w-1/4 h-full">
                          <button
                            type="button"
                            onClick={() => doublePriceForRoute(route.id)}
                            disabled={!route.cost || (typeof route.cost === 'string' && route.cost === '') || Number(route.cost) === 0}
                            className={`w-full h-full rounded-r-xl ${route.colorScheme.buttonBg} text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm sm:text-base relative transition-all duration-200`}
                            title={t('doublePriceTooltip')}
                          >
                            ×2
                          </button>
                        </div>
                      </div>
                      <div className={`text-xs ${route.colorScheme.accent} mt-1 sm:mt-2 flex items-center gap-1`}>
                        <span>ℹ️</span>
                        <span className="text-xs">{t('costPerTripHelp')}</span>
                      </div>
                      
                      <div className={`bg-white p-3 sm:p-4 rounded-lg border ${route.colorScheme.border200} mt-2 sm:mt-3`}>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <input
                            type="checkbox"
                            id={`halbtax-price-${route.id}`}
                            checked={route.isHalbtaxPrice}
                            onChange={(e) => updateRoute(route.id, 'isHalbtaxPrice', e.target.checked)}
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${route.colorScheme.accent} border-2 ${route.colorScheme.border300} rounded-md ${route.colorScheme.focusRing.split(' ')[0]} transition-all`}
                          />
                          <label htmlFor={`halbtax-price-${route.id}`} className={`text-xs sm:text-sm font-medium ${route.colorScheme.text} cursor-pointer flex-1`}>
                            <span className="flex items-center gap-2">
                              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">{t('priceAlreadyHalbtax')}</span>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <label className={`flex items-center gap-2 text-xs sm:text-sm font-semibold ${route.colorScheme.text} mb-2 sm:mb-3`}>
                        <Link className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('duration')}
                      </label>
                      <div className="relative">
                        {/* Value Display */}
                        <div className={`flex items-center justify-center mb-2 px-3 sm:px-4 py-3 border-2 ${route.colorScheme.border200} rounded-xl bg-white shadow-sm text-sm sm:text-base h-12`}>
                          <span className={`font-bold ${route.colorScheme.text}`}>
                            {route.durationMonths} {t('months')}
                          </span>
                        </div>
                        
                        {/* Slider */}
                        <input
                          type="range"
                          min="1"
                          max="12"
                          value={route.durationMonths}
                          onChange={(e) => updateRoute(route.id, 'durationMonths', parseInt(e.target.value))}
                          className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${route.colorScheme.buttonBg.split('-')[1]} bg-gradient-to-r ${route.colorScheme.bg.replace('from-', 'from-').replace('to-', 'to-')} focus:outline-none focus:ring-2 ${route.colorScheme.focusRing.split(' ')[0]} transition-all`}
                          style={{
                            background: `linear-gradient(to right, rgb(${route.colorScheme.buttonBg.includes('green') ? '34, 197, 94' : 
                              route.colorScheme.buttonBg.includes('blue') ? '59, 130, 246' :
                              route.colorScheme.buttonBg.includes('purple') ? '168, 85, 247' :
                              route.colorScheme.buttonBg.includes('orange') ? '249, 115, 22' :
                              route.colorScheme.buttonBg.includes('rose') ? '244, 63, 94' : '20, 184, 166'}) 0%, rgb(${route.colorScheme.buttonBg.includes('green') ? '34, 197, 94' : 
                              route.colorScheme.buttonBg.includes('blue') ? '59, 130, 246' :
                              route.colorScheme.buttonBg.includes('purple') ? '168, 85, 247' :
                              route.colorScheme.buttonBg.includes('orange') ? '249, 115, 22' :
                              route.colorScheme.buttonBg.includes('rose') ? '244, 63, 94' : '20, 184, 166'}) ${(route.durationMonths - 1) / 11 * 100}%, #e5e7eb ${(route.durationMonths - 1) / 11 * 100}%, #e5e7eb 100%)`
                          }}
                        />
                        
                        {/* Month Labels */}
                        <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                          <span>1</span>
                          <span>3</span>
                          <span>6</span>
                          <span>9</span>
                          <span>12</span>
                        </div>
                      </div>
                      <div className={`text-xs ${route.colorScheme.accent} mt-1 sm:mt-2 flex items-center gap-1`}>
                        <span>ℹ️</span>
                        <span className="text-xs">{t('durationHelp')}</span>
                      </div>
                    </div>
                  </div>


                  {/* GA Night Checkbox - only show if eligible */}
                  {isGANightEligible(age, isFirstClass) && (
                    <div className={`bg-white p-3 sm:p-4 rounded-lg border ${route.colorScheme.border200} mb-3 sm:mb-4`}>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="checkbox"
                          id={`ganight-${route.id}`}
                          checked={route.isGANightEligible}
                          onChange={(e) => updateRoute(route.id, 'isGANightEligible', e.target.checked)}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${route.colorScheme.accent} border-2 ${route.colorScheme.border300} rounded-md ${route.colorScheme.focusRing.split(' ')[0]} transition-all`}
                        />
                        <label htmlFor={`ganight-${route.id}`} className={`text-xs sm:text-sm font-medium ${route.colorScheme.text} cursor-pointer flex-1`}>
                          <span className="flex items-center gap-2">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">{t('ganightCheckbox')}</span>
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className={`${route.colorScheme.summaryBg} p-3 rounded-lg border ${route.colorScheme.border200}`}>
                    <div className={`text-xs sm:text-sm font-semibold ${route.colorScheme.text}`}>
                      {t('routeNamedCost', {
                        name: (route.from && route.to) ? t('routeFromTo', { from: route.from, to: route.to }) : (route.name?.trim() || `${t('route')} ${index + 1}`),
                        months: route.durationMonths.toString(),
                        cost: formatCurrency(
                          route.frequencyType === 'weekly' 
                            ? (typeof route.trips === 'number' ? route.trips : 0) * (typeof route.cost === 'number' ? route.cost : 0) * (route.durationMonths * 4.33)
                            : (typeof route.trips === 'number' ? route.trips : 0) * (typeof route.cost === 'number' ? route.cost : 0) * route.durationMonths
                        )
                      })}
                      {route.isHalbtaxPrice && <span className="text-orange-700 ml-2 block sm:inline mt-1 sm:mt-0">✨ {t('alreadyHalbtaxPrice')}</span>}
                    </div>
                  </div>
                </div>
              ))}

              {/* Strecke hinzufügen Button */}
              <button
                onClick={addRoute}
                className="w-full p-3 sm:p-4 border-2 border-dashed border-green-300 rounded-xl text-green-700 hover:border-green-500 hover:text-green-800 hover:bg-green-50 flex items-center justify-center gap-2 sm:gap-3 transition-all transform hover:scale-105 shadow-sm hover:shadow-md min-h-[48px] text-sm sm:text-base"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <span className="font-semibold">{t('addRoute')}</span>
              </button>

              {/* Additional Travel Budget Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-200 shadow-sm">
                <button
                  onClick={() => setAdditionalBudgetExpanded(!additionalBudgetExpanded)}
                  className="w-full p-3 sm:p-4 flex items-center justify-between text-left hover:bg-blue-50/50 transition-all rounded-xl"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center">
                      <Banknote className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-indigo-900 text-sm sm:text-base">{t('additionalBudget')}</span>
                      <div className="text-xs text-indigo-700">{t('additionalBudgetHelp')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {additionalBudget && typeof additionalBudget === 'number' && additionalBudget > 0 && (
                      <span className="text-sm font-medium text-indigo-700">
                        {formatCurrency(additionalBudget)}
                      </span>
                    )}
                    {additionalBudgetExpanded ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    )}
                  </div>
                </button>

                {additionalBudgetExpanded && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-indigo-200/50 space-y-4">
                    {/* Budget Amount Input */}
                    <div className="relative">
                      <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-800 mb-2 sm:mb-3">
                        <Banknote className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('additionalBudgetAmount')}
                      </label>
                      <div className="relative max-w-sm">
                        <span className="absolute left-3 sm:left-4 top-3 sm:top-4 text-indigo-600 font-bold text-base sm:text-lg">CHF</span>
                        <input 
                          type="number" 
                          value={additionalBudget || ''}
                          onChange={(e) => setAdditionalBudget(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="w-full pl-12 sm:pl-16 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-indigo-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-base sm:text-lg font-semibold transition-all hover:border-indigo-400"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Frequency Toggle */}
                    <div className="relative">
                      <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-indigo-800 mb-2 sm:mb-3">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('frequencyToggle')}
                      </label>
                      <div className="flex rounded-lg border-2 border-indigo-300 overflow-hidden bg-white h-12 max-w-sm">
                        <button
                          onClick={() => setAdditionalBudgetFrequency('weekly')}
                          className={`flex-1 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all flex items-center justify-center ${
                            additionalBudgetFrequency === 'weekly'
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t('weekly')}
                        </button>
                        <button
                          onClick={() => setAdditionalBudgetFrequency('monthly')}
                          className={`flex-1 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all border-l-2 border-indigo-300 flex items-center justify-center ${
                            additionalBudgetFrequency === 'monthly'
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t('monthly')}
                        </button>
                        <button
                          onClick={() => setAdditionalBudgetFrequency('yearly')}
                          className={`flex-1 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all border-l-2 border-indigo-300 flex items-center justify-center ${
                            additionalBudgetFrequency === 'yearly'
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {t('yearly')}
                        </button>
                      </div>
                    </div>

                    {/* Halbtax Checkbox */}
                    <div className="bg-white/70 p-3 sm:p-4 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="checkbox"
                          id="additional-budget-halbtax"
                          checked={additionalBudgetIsHalbtax}
                          onChange={(e) => setAdditionalBudgetIsHalbtax(e.target.checked)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 border-2 border-indigo-400 rounded-md focus:ring-indigo-500 transition-all"
                        />
                        <label htmlFor="additional-budget-halbtax" className="text-xs sm:text-sm font-medium text-indigo-800 cursor-pointer flex-1">
                          <span className="flex items-center gap-2">
                            <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm">{t('additionalBudgetAlreadyHalbtax')}</span>
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* GA Night Checkbox - only show if eligible */}
                    {isGANightEligible(age, isFirstClass) && (
                      <div className="bg-white/70 p-3 sm:p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <input
                            type="checkbox"
                            id="additional-budget-ganight"
                            checked={additionalBudgetIsGANight}
                            onChange={(e) => setAdditionalBudgetIsGANight(e.target.checked)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 border-2 border-indigo-400 rounded-md focus:ring-indigo-500 transition-all"
                          />
                          <label htmlFor="additional-budget-ganight" className="text-xs sm:text-sm font-medium text-indigo-800 cursor-pointer flex-1">
                            <span className="flex items-center gap-2">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">{t('additionalBudgetGANight')}</span>
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Gesamtkosten Anzeige */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 sm:p-5 rounded-xl border-2 border-amber-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 text-white rounded-full flex items-center justify-center">
                    <Calculator className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                  <span className="font-bold text-amber-900 text-base sm:text-lg">
                    {t('totalTravelCosts', { cost: formatCurrency((() => {
                      const routesCost = routes.reduce((total, route) => {
                        const trips = typeof route.trips === 'number' ? route.trips : 0;
                        const cost = typeof route.cost === 'number' ? route.cost : 0;
                        return total + (route.frequencyType === 'weekly' 
                          ? trips * cost * (route.durationMonths * 4.33)
                          : trips * cost * route.durationMonths);
                      }, 0);
                      
                      // Add additional budget if present
                      let additionalCost = 0;
                      if (additionalBudget && typeof additionalBudget === 'number' && additionalBudget > 0) {
                        const longestDuration = Math.max(...routes.map(route => route.durationMonths));
                        switch (additionalBudgetFrequency) {
                          case 'weekly':
                            additionalCost = additionalBudget * (longestDuration * 4.33);
                            break;
                          case 'monthly':
                            additionalCost = additionalBudget * longestDuration;
                            break;
                          case 'yearly':
                            additionalCost = additionalBudget;
                            break;
                        }
                      }
                      
                      return routesCost + additionalCost;
                    })()) })}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-amber-700">
                  {routes.filter(r => r.isHalbtaxPrice).length > 0 && (
                    <div className="flex items-start gap-1 mt-2 p-2 sm:p-3 bg-orange-100 rounded-lg border border-orange-200">
                      <span className="flex-shrink-0">⚠️</span>
                      <span className="font-medium text-orange-800 text-xs sm:text-sm">
                        {t('routesWithHalbtax', { 
                          count: routes.filter(r => r.isHalbtaxPrice).length,
                          routes: routes.filter(r => r.isHalbtaxPrice).length === 1 ? 
                            (language === 'de' ? 'Strecke' : language === 'fr' ? 'trajet' : language === 'it' ? 'tratta' : 'route') :
                            (language === 'de' ? 'Strecken' : language === 'fr' ? 'trajets' : language === 'it' ? 'tratte' : 'routes')
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : inputMode === 'direct' ? (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 sm:p-6 rounded-xl border-2 border-orange-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                <label className="text-base sm:text-lg font-semibold text-orange-900">
                  {t('yearlyTravelCosts')}
                </label>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="relative max-w-full sm:max-w-sm">
                  <span className="absolute left-3 sm:left-4 top-3 sm:top-4 text-orange-600 font-bold text-base sm:text-lg">CHF</span>
                  <input 
                    type="number" 
                    value={yearlySpendingDirect || ''}
                    onChange={(e) => setYearlySpendingDirect(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full pl-12 sm:pl-16 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-orange-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm text-base sm:text-lg font-semibold transition-all hover:border-orange-400"
                    placeholder={t('placeholderYearly')}
                  />
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-xl border-2 border-orange-300 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      id="direct-halbtax"
                      checked={directIsHalbtaxPrice}
                      onChange={(e) => setDirectIsHalbtaxPrice(e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 border-2 border-orange-400 rounded-md focus:ring-orange-500 transition-all"
                    />
                    <label htmlFor="direct-halbtax" className="text-xs sm:text-sm font-medium text-orange-800 cursor-pointer flex-1">
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{t('priceAlreadyHalbtax')}</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : inputMode === 'pdf' ? (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 rounded-xl border-2 border-purple-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <label className="text-base sm:text-lg font-semibold text-purple-900">
                  Upload SBB PDF Receipt
                </label>
              </div>
              
              {/* Instructions */}
              <div className="bg-purple-100 p-4 rounded-lg mb-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">{t('pdfInstructions')}</h4>
                <div className="text-sm text-purple-700 space-y-1">
                  <div>
                    {language === 'en' ? '1. Log in to ' :
                     language === 'de' ? '1. Loggen Sie sich auf ' :
                     language === 'fr' ? '1. Connectez-vous sur ' :
                     language === 'it' ? '1. Accedere a ' :
                     '1. S\'annunziar sin '}
                    <a 
                      href={t('pdfStep1Link')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline font-medium"
                    >
                      {language === 'en' ? 'SBB.ch' : 
                       language === 'de' ? 'SBB.ch' : 
                       language === 'fr' ? 'CFF.ch' : 
                       language === 'it' ? 'FFS.ch' : 'VFF.ch'}
                    </a>
                    {language === 'de' ? ' ein' : ''}
                  </div>
                  <div>{t('pdfStep2')}</div>
                  <div>{t('pdfStep3')}</div>
                  <div>{t('pdfStep4')}</div>
                  <div>{t('pdfStep5')}</div>
                </div>
                <div className="mt-3">
                  <a
                    href="https://www.sbb.ch/de/kaufen/pages/bestellung/bestellungen.xhtml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{t('pdfSbbLink')}</span>
                  </a>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* File Upload */}
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPdfFile(file);
                        setPdfError(null); // Clear previous errors
                        await processPdfFile(file);
                      }
                    }}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label
                    htmlFor="pdf-upload"
                    className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      pdfFile 
                        ? 'border-purple-400 bg-purple-100 text-purple-800' 
                        : 'border-purple-300 bg-white text-purple-600 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-medium flex-1 text-center">
                      {pdfFile ? pdfFile.name : 'Click to upload PDF'}
                    </span>
                  </label>
                  
                  {/* Delete button - only show when file is uploaded */}
                  {pdfFile && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setPdfFile(null);
                        setPdfTotal(null);
                        setPdfError(null);
                        setPdfIsHalbtaxPrice(false);
                        // Reset file input
                        const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800 p-1 rounded-lg hover:bg-purple-200 transition-all transform hover:scale-110 min-h-[28px] min-w-[28px] flex items-center justify-center"
                      title="Clear PDF"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Processing Status */}
                {pdfProcessing && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="text-sm">Processing PDF...</span>
                  </div>
                )}

                {/* Error Message */}
                {pdfError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg">
                    <div className="text-sm font-medium">
                      ❌ PDF Processing Error: {pdfError}
                    </div>
                    <div className="text-xs mt-1">
                      Please upload a valid SBB receipt PDF.
                    </div>
                  </div>
                )}

                {/* Extracted Total */}
                {pdfTotal !== null && !pdfError && (
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <div className="text-sm text-purple-700 font-medium">
                      ✅ Extracted Total: <span className="text-lg font-bold">{formatCurrency(pdfTotal)}</span>
                    </div>
                  </div>
                )}

                {/* Halbtax Checkbox */}
                <div className="bg-white p-3 sm:p-4 rounded-xl border-2 border-purple-300 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      id="pdf-halbtax"
                      checked={pdfIsHalbtaxPrice}
                      onChange={(e) => setPdfIsHalbtaxPrice(e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 border-2 border-purple-400 rounded-md focus:ring-purple-500 transition-all"
                    />
                    <label htmlFor="pdf-halbtax" className="text-xs sm:text-sm font-medium text-purple-800 cursor-pointer flex-1">
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm">{t('pdfAlreadyHalbtax')}</span>
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Ergebnisse */}
        {results && (
          <div data-results-section className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 leading-tight">
                  {t('costComparison', { cost: formatCurrency(results.yearlySpendingFull) })}
                </h2>
              </div>
              
              {/* Halbtax PLUS Reload Toggle */}
              {results.halbtaxPlusOptions.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200 w-full lg:w-auto">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{t('halbtaxPlusReload')}</span>
                  <button
                    onClick={() => setAllowHalbtaxPlusReload(!allowHalbtaxPlusReload)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all min-h-[36px] ${
                      allowHalbtaxPlusReload 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {allowHalbtaxPlusReload ? <ToggleRight className="w-3 h-3 sm:w-4 sm:h-4" /> : <ToggleLeft className="w-3 h-3 sm:w-4 sm:h-4" />}
                    {allowHalbtaxPlusReload ? t('enabled') : t('disabled')}
                  </button>
                </div>
              )}
            </div>

            {/* Alle Optionen anzeigen */}
            <div className="space-y-3 sm:space-y-4">
              {results.options.map((option, index) => {
                const isBest = option.total === results.bestOption.total;
                const cardId = `option-${index}`;
                const isExpanded = expandedCards.has(cardId);
                
                return (
                  <div 
                    key={index}
                    className={`rounded-lg border-2 ${getOptionColor(option, results.bestOption.total)} transition-all duration-200`}
                  >
                    <div 
                      className="p-3 sm:p-4 cursor-pointer hover:bg-black/5 transition-colors"
                      onClick={() => toggleCardExpansion(cardId)}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-semibold flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                            <span className="truncate">{option.name}</span>
                            {isBest && <span className="text-xs bg-green-600 text-white px-2 py-1 rounded whitespace-nowrap">{t('bestOption')}</span>}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                          <div className="text-base sm:text-lg font-bold">
                            {formatCurrency(option.total)}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200/50">
                        <div className="pt-2 sm:pt-3 text-xs sm:text-sm space-y-1 sm:space-y-2">
                          {/* Purchase Link */}
                          {getPurchaseLink(option.type) && (
                            <div className="mb-3 pb-2 border-b border-gray-200/50">
                              <a
                                href={getPurchaseLink(option.type)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-xs sm:text-sm font-medium"
                              >
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{t('purchaseSubscription')}</span>
                              </a>
                            </div>
                          )}
                          
                          {option.type === 'none' && (
                            <>
                              <div>{t('fullTicketPrices', { cost: formatCurrency(results.yearlySpendingFull) })}</div>
                              {hasHundePass && <div>{t('hundePassCost')}: {formatCurrency(350)}</div>}
                              {hasVeloPass && <div>{t('veloPassCost')}: {formatCurrency(260)}</div>}
                            </>
                          )}
                          
                          {option.type === 'halbtax' && (
                            <>
                              <div>{t('halbtaxLabel')} {formatCurrency(getFreeHalbtax ? 0 : getHalbtaxPrice(age, !hasExistingHalbtax))}</div>
                              <div>{t('ticketsDiscount', { cost: formatCurrency(results.halbtaxTicketCosts) })}</div>
                              {hasHundePass && <div>{t('hundePassCost')}: {formatCurrency(350)}</div>}
                              {hasVeloPass && <div>{t('veloPassCost')}: {formatCurrency(260)}</div>}
                            </>
                          )}
                          
                          {option.type === 'halbtaxplus' && (
                            <>
                              <div>{t('halbtaxPlus', { credit: option.credit })}: {formatCurrency(option.details.cost)}</div>
                              <div>{t('halbtaxLabel')} {formatCurrency(getFreeHalbtax ? 0 : getHalbtaxPrice(age, !hasExistingHalbtax))}</div>
                              <div>{t('creditCovered', { cost: formatCurrency(option.details.coveredByCredit) })}</div>
                              
                              {option.details.reloadCount > 0 && allowHalbtaxPlusReload && (
                                <>
                                  <div className="text-orange-600 font-medium">{t('reloads')}</div>
                                  {option.details.reloadCount > 1 && (
                                    <div>{t('reloadFull', { count: option.details.reloadCount - 1, cost: formatCurrency((option.details.reloadCount - 1) * option.details.cost) })}</div>
                                  )}
                                  <div>{t('reloadPartial', { percent: Math.round(option.details.lastReloadRatio * 100), cost: formatCurrency(option.details.cost * option.details.lastReloadRatio) })}</div>
                                  <div className="font-medium">{t('reloadTotal', { cost: formatCurrency(option.details.reloadCost) })}</div>
                                </>
                              )}
                              
                              {option.details.halbtaxTicketsAfterCredit > 0 && !allowHalbtaxPlusReload && (
                                <>
                                  <div className="text-blue-600 font-medium">Regular Halbtax Tickets</div>
                                  <div>Remaining ticket costs (already with Halbtax discount): {formatCurrency(option.details.halbtaxTicketsAfterCredit)}</div>
                                </>
                              )}
                              {hasHundePass && <div>{t('hundePassCost')}: {formatCurrency(350)}</div>}
                              {hasVeloPass && <div>{t('veloPassCost')}: {formatCurrency(260)}</div>}
                            </>
                          )}
                          
                          {option.type === 'ga' && (
                            <>
                              {results.gaIsMonthlyPricing && results.gaMonthsUsed ? (
                                <>
                                  <div>GA ({isFirstClass ? t('firstClass') : t('secondClass')}): {formatCurrency(getMonthlyGAPrice(age, isFirstClass))} × {results.gaMonthsUsed} months</div>
                                  <div className="text-green-600 font-medium">✓ Monthly pricing (valid for {results.gaMonthsUsed} months)</div>
                                  <div className="text-gray-600 text-xs">Annual price would be: {formatCurrency(getGAPrice(age, isFirstClass))}</div>
                                </>
                              ) : (
                                <>
                                  <div>GA ({isFirstClass ? t('firstClass') : t('secondClass')}): {formatCurrency(getGAPrice(age, isFirstClass))}</div>
                                  <div className="text-blue-600 font-medium">{t('annualSubscription')}</div>
                                </>
                              )}
                              <div>{t('unlimitedTravel')}</div>
                              {hasHundePass && <div>{t('hundePassCost')}: {formatCurrency(350)}</div>}
                              {hasVeloPass && <div>{t('veloPassCost')}: {formatCurrency(260)}</div>}
                            </>
                          )}
                          
                          {option.type === 'ganight' && (
                            <>
                              <div>GA Night (2nd Class): {formatCurrency(getGANightPrice())}</div>
                              <div className="text-purple-600 font-medium">{t('ganightDescription')}</div>
                              
                              {option.gaNightDetails.complementary === 'halbtax' && (
                                <>
                                  <div className="mt-2 pt-2 border-t border-gray-200/50">
                                    <div className="text-blue-600 font-medium">Plus Halbtax for non-covered routes:</div>
                                    <div>Halbtax: {formatCurrency(option.gaNightDetails.halbtaxPrice)}</div>
                                    <div>Non-covered costs (with Halbtax discount): {formatCurrency(option.gaNightDetails.nonCoveredCosts)}</div>
                                  </div>
                                </>
                              )}
                              
                              {option.gaNightDetails.complementary === 'halbtaxplus' && (
                                <>
                                  <div className="mt-2 pt-2 border-t border-gray-200/50">
                                    <div className="text-blue-600 font-medium">Plus Halbtax + Halbtax Plus for non-covered routes:</div>
                                    <div>Halbtax: {formatCurrency(option.gaNightDetails.halbtaxPrice)}</div>
                                    <div>Halbtax Plus {option.gaNightDetails.credit}: {formatCurrency(option.gaNightDetails.halbtaxPlusCost)}</div>
                                    <div>Credit covered: {formatCurrency(option.gaNightDetails.coveredByCredit)}</div>
                                    
                                    {option.gaNightDetails.reloadCount > 0 && allowHalbtaxPlusReload && (
                                      <>
                                        <div className="text-orange-600 font-medium mt-1">{t('reloads')}</div>
                                        {option.gaNightDetails.reloadCount > 1 && option.gaNightDetails.lastReloadRatio === 0 && (
                                          <div>{t('reloadFull', { count: option.gaNightDetails.reloadCount, cost: formatCurrency(option.gaNightDetails.reloadCost) })}</div>
                                        )}
                                        {option.gaNightDetails.reloadCount > 1 && option.gaNightDetails.lastReloadRatio > 0 && (
                                          <>
                                            <div>{t('reloadFull', { count: option.gaNightDetails.reloadCount - 1, cost: formatCurrency((option.gaNightDetails.reloadCount - 1) * option.gaNightDetails.halbtaxPlusCost) })}</div>
                                            <div>{t('reloadPartial', { percent: Math.round(option.gaNightDetails.lastReloadRatio * 100), cost: formatCurrency(option.gaNightDetails.halbtaxPlusCost * option.gaNightDetails.lastReloadRatio) })}</div>
                                          </>
                                        )}
                                        {option.gaNightDetails.reloadCount === 1 && option.gaNightDetails.lastReloadRatio > 0 && (
                                          <div>{t('reloadPartial', { percent: Math.round(option.gaNightDetails.lastReloadRatio * 100), cost: formatCurrency(option.gaNightDetails.halbtaxPlusCost * option.gaNightDetails.lastReloadRatio) })}</div>
                                        )}
                                        <div className="font-medium">Total reloads: {formatCurrency(option.gaNightDetails.reloadCost)}</div>
                                      </>
                                    )}
                                    
                                    {option.gaNightDetails.remainingCosts > 0 && !allowHalbtaxPlusReload && (
                                      <div className="text-gray-600 mt-1">Remaining costs (Halbtax price): {formatCurrency(option.gaNightDetails.remainingCosts)}</div>
                                    )}
                                  </div>
                                </>
                              )}
                              
                              {option.gaNightDetails.complementary === null && option.gaNightDetails.nonCoveredCosts > 0 && (
                                <>
                                  <div className="mt-2 pt-2 border-t border-gray-200/50">
                                    <div className="text-gray-600 font-medium">Plus full-price tickets:</div>
                                    <div>Non-covered costs: {formatCurrency(option.gaNightDetails.nonCoveredCosts)}</div>
                                  </div>
                                </>
                              )}
                              {hasHundePass && <div>{t('hundePassCost')}: {formatCurrency(350)}</div>}
                              {hasVeloPass && <div>{t('veloPassCost')}: {formatCurrency(260)}</div>}
                            </>
                          )}

                          {option.total !== results.bestOption.total && (
                            <div className="text-orange-600 font-medium pt-1 sm:pt-2 border-t border-gray-200/50 text-xs sm:text-sm">
                              {t('moreExpensive', { cost: formatCurrency(option.total - results.bestOption.total) })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Streckenabo cards */}
              {results.streckenabos.length > 0 && results.streckenabos.map((streckenabo, index) => {
                const routeIndex = routes.findIndex(r => r.id === streckenabo.route.id) + 1;
                const statusInfo = !streckenabo.isInValidRange 
                  ? { badge: t('outsideRange'), badgeColor: 'bg-red-100 text-red-700', cardColor: 'border-red-200 bg-red-50' }
                  : streckenabo.isWorthwhile 
                  ? { badge: t('worthwhile'), badgeColor: 'bg-green-100 text-green-700', cardColor: 'border-purple-200 bg-purple-50' }
                  : { badge: t('notWorthwhile'), badgeColor: 'bg-orange-100 text-orange-700', cardColor: 'border-purple-200 bg-purple-50' };
                
                const cardId = `streckenabo-${index}`;
                const isExpanded = expandedCards.has(cardId);
                
                return (
                  <div 
                    key={`streckenabo-${index}`}
                    className={`rounded-lg border-2 ${statusInfo.cardColor} transition-all duration-200`}
                  >
                    <div 
                      className="p-3 sm:p-4 cursor-pointer hover:bg-black/5 transition-colors"
                      onClick={() => toggleCardExpansion(cardId)}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <h3 className="font-semibold flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                            <span className="flex items-center gap-1">
                              🚂 <span className="truncate">{t('streckenabo')} - {(streckenabo.route.from && streckenabo.route.to) ? t('routeFromTo', { from: streckenabo.route.from, to: streckenabo.route.to }) : (streckenabo.route.name?.trim() || `${t('route')} ${routeIndex}`)}{streckenabo.route.durationMonths !== 12 ? ` (${streckenabo.route.durationMonths} months)` : ''}</span>
                            </span>
                            <div className={`text-xs px-2 py-1 rounded-full ${statusInfo.badgeColor} whitespace-nowrap`}>
                              {t('estimate')}
                            </div>
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                          <div className="text-base sm:text-lg font-bold text-purple-700">
                            {formatCurrency(streckenabo.monthlyCost * streckenabo.route.durationMonths)}
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className={`text-xs mt-2 sm:mt-3 px-2 py-1 rounded ${statusInfo.badgeColor} inline-block`}>
                        {statusInfo.badge}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200/50">
                        <div className="pt-2 sm:pt-3 text-xs sm:text-sm space-y-1 sm:space-y-2">
                          {/* Purchase Link */}
                          {purchaseLinks.streckenabo && (
                            <div className="mb-3 pb-2 border-b border-gray-200/50">
                              <a
                                href={purchaseLinks.streckenabo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-xs sm:text-sm font-medium"
                              >
                                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{t('purchaseRoutePass')}</span>
                              </a>
                            </div>
                          )}
                          
                          <div className="text-green-600 font-medium">✓ Pass for {streckenabo.route.durationMonths} months: {formatCurrency(streckenabo.monthlyCost * streckenabo.route.durationMonths)}</div>
                          <div>{t('monthlyPass', { cost: formatCurrency(streckenabo.monthlyCost) })}</div>
                          <div className="text-gray-600 text-xs">Annual price would be: {formatCurrency(streckenabo.annualPrice)}</div>
                          <div className="pt-1 sm:pt-2 border-t border-gray-200/50">
                            <div className="font-medium text-purple-700 mb-1 text-xs sm:text-sm">{t('streckenabosInfo')}</div>
                            <div className="text-gray-600 text-xs sm:text-sm">{t('streckenabosExplanation')}</div>
                            <div className="text-gray-500 italic text-xs mt-1">{t('streckenabosFormula')}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* MyRide.ch Smart-Abo card */}
              {results.myRide && (() => {
                const getColorScheme = (status: string) => {
                  switch (status) {
                    case 'worthwhile':
                      return { border: 'border-green-200', bg: 'bg-green-50', badge: 'bg-green-100 text-green-700', price: 'text-green-700', chevron: 'text-green-500' };
                    case 'close':
                      return { border: 'border-yellow-200', bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', price: 'text-yellow-700', chevron: 'text-yellow-500' };
                    case 'expensive':
                      return { border: 'border-red-200', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', price: 'text-red-700', chevron: 'text-red-500' };
                    default:
                      return { border: 'border-gray-200', bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-700', price: 'text-gray-700', chevron: 'text-gray-500' };
                  }
                };
                const colors = getColorScheme(results.myRide.comparison.status);
                
                return (
                  <div 
                    className={`rounded-lg border-2 transition-all duration-200 ${colors.border} ${colors.bg}`}
                >
                  <div 
                    className="p-3 sm:p-4 cursor-pointer hover:bg-black/5 transition-colors"
                    onClick={() => toggleCardExpansion('myride')}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <h3 className="font-semibold flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                          <span className="flex items-center gap-1">
                            🚀 <span className="truncate">{t('myRideSmartAbo')}</span>
                          </span>
                          <div className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${colors.badge}`}>
                            {t('estimate')}
                          </div>
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                        <div className={`text-base sm:text-lg font-bold ${colors.price}`}>
                          {formatCurrency(results.myRide.total)}
                        </div>
                        {expandedCards.has('myride') ? (
                          <ChevronUp className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.chevron}`} />
                        ) : (
                          <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.chevron}`} />
                        )}
                      </div>
                    </div>
                    
                    <div className={`text-xs mt-2 sm:mt-3 px-2 py-1 rounded inline-block ${colors.badge}`}>
                      {results.myRide.comparison.status === 'worthwhile' ? t('worthwhile') : 
                       results.myRide.comparison.status === 'close' ? t('closeToBest') : 
                       t('expensive')}
                    </div>
                  </div>

                  {expandedCards.has('myride') && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-200/50">
                      <div className="pt-2 sm:pt-3 text-xs sm:text-sm space-y-1 sm:space-y-2">
                        {/* Purchase Link */}
                        {purchaseLinks.myride && (
                          <div className="mb-3 pb-2 border-b border-gray-200/50">
                            <a
                              href={purchaseLinks.myride}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md text-xs sm:text-sm font-medium"
                            >
                              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{t('visitMyRide')}</span>
                            </a>
                          </div>
                        )}
                        
                        <div className="text-teal-600 font-medium">✓ {t('annualCost')}: {formatCurrency(results.myRide.total)}</div>
                        <div>{t('monthlyBill')}: {formatCurrency(results.myRide.details.monthlyBill)}</div>
                        <div className="text-gray-600 text-xs">{t('monthlyTravelCosts')}: {formatCurrency(results.myRide.details.totalTravelCosts)}</div>
                        
                        {/* Progressive bonus breakdown */}
                        <div className="pt-1 sm:pt-2 border-t border-gray-200/50">
                          <div className="font-medium text-teal-700 mb-1 text-xs sm:text-sm">{t('progressiveBonusBreakdown')}</div>
                          {results.myRide.details.secondClassBonus > 0 && (
                            <div className="text-green-600 text-xs">{t('secondClassBonus')}: -{formatCurrency(results.myRide.details.secondClassBonus)}/month</div>
                          )}
                          {results.myRide.details.firstClassBonus > 0 && (
                            <div className="text-green-600 text-xs">{t('firstClassUpgradeBonus')}: -{formatCurrency(results.myRide.details.firstClassBonus)}/month</div>
                          )}
                          <div className="text-gray-600 text-xs">{t('smartAboFee')}: +{formatCurrency(results.myRide.details.smartAboFee)}/month</div>
                          {results.myRide.details.halbtaxCredit > 0 && (
                            <div className="text-green-600 text-xs">{t('halbtaxCredit')}: -{formatCurrency(results.myRide.details.halbtaxCredit)}/month</div>
                          )}
                          
                          <div className="pt-1 mt-1 border-t border-gray-200/50">
                            <div className="text-gray-600 text-xs">{t('myRideDescription')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                );
              })()}
            </div>

            {/* Halbtax Plus Erklärung wenn relevant */}
            {results.halbtaxPlusOptions.some(opt => opt.reloadCount > 0) && (
              <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 shadow-sm">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-orange-100 rounded-lg flex-shrink-0 mt-0.5">
                    🔄
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-orange-900 mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <span>{t('halbtaxPlusInfo')}</span>
                      <div className="px-2 py-0.5 bg-orange-200 rounded-full text-xs text-orange-800 whitespace-nowrap">{t('autoReload')}</div>
                    </div>
                    <div className="text-xs sm:text-sm text-orange-800 leading-relaxed">
                      {t('halbtaxPlusExplanation')}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Zusätzliche Insights - Collapsible */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-200 shadow-sm">
              <button 
                onClick={() => setIsAdditionalInfoExpanded(!isAdditionalInfoExpanded)}
                className="w-full flex items-center justify-between gap-2 mb-3 sm:mb-4 hover:bg-blue-100/50 -m-2 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    💡
                  </div>
                  <h3 className="font-semibold text-blue-900 text-base sm:text-lg">{t('additionalInfo')}</h3>
                </div>
                {isAdditionalInfoExpanded ? (
                  <ChevronUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                )}
              </button>
              
              {isAdditionalInfoExpanded && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{t('breakEvenPoints')}</div>
                  </div>
                  <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                    {/* Halbtax Break-even */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium text-xs sm:text-sm">{t('halbtaxLabel')}</span>
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm">{formatCurrency(getHalbtaxPrice(age, !hasExistingHalbtax) * 2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (results.noAboTotal / (getHalbtaxPrice(age, !hasExistingHalbtax) * 2)) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('yourCostsLabel')} {formatCurrency(results.noAboTotal)} ({Math.round((results.noAboTotal / (getHalbtaxPrice(age, !hasExistingHalbtax) * 2)) * 100)}%)
                      </div>
                    </div>
                    
                    {/* GA Break-even */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium text-xs sm:text-sm">{t('gaLabel')}</span>
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm">{formatCurrency(results.gaTotal)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (results.noAboTotal / results.gaTotal) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('yourCostsLabel')} {formatCurrency(results.noAboTotal)} ({Math.round((results.noAboTotal / results.gaTotal) * 100)}%)
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actual Break-even Calculation */}
                <div className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{t('actualBreakEvenPoints')}</div>
                  </div>
                  <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                    {(() => {
                      // Calculate actual breakeven by testing different annual travel costs
                      // to find when each option becomes the best
                      
                      const calculateTotalForTravelCost = (annualTravelCost: number) => {
                        const halbtaxPrice = getFreeHalbtax ? 0 : getHalbtaxPrice(age, !hasExistingHalbtax);
                        const gaPrice = getGAPrice(age, isFirstClass);
                        
                        // No subscription
                        const noAboTotal = annualTravelCost;
                        
                        // Halbtax
                        const halbtaxTicketCosts = annualTravelCost * 0.5;
                        const halbtaxTotal = halbtaxPrice + halbtaxTicketCosts;
                        
                        // Halbtax Plus options - use same mapping as main app
                        const getHalbtaxPlusCategory = (ageGroup: AgeGroup): 'jugend' | 'erwachsene' | null => {
                          switch (ageGroup) {
                            case 'kind':           // 6-16 years -> jugend category
                            case 'jugend':         // 16-25 years -> jugend category
                              return 'jugend';
                            case 'fuenfundzwanzig': // 25 years -> erwachsene category
                            case 'erwachsene':      // 26-64/65 years -> erwachsene category
                            case 'senior':          // 64+/65+ years -> erwachsene category
                            case 'behinderung':     // disability -> erwachsene category
                              return 'erwachsene';
                            default:
                              return null;
                          }
                        };
                        const halbtaxPlusCategory = getHalbtaxPlusCategory(age);
                        const halbtaxPlusOptions = halbtaxPlusCategory 
                          ? Object.entries(getHalbtaxPlusOptions(halbtaxPlusCategory)).map(([credit, data]) => ({
                              credit: parseInt(credit),
                              cost: data.cost
                            }))
                          : [];
                        const halbtaxPlusResults = halbtaxPlusOptions.map((option: {credit: number, cost: number}) => {
                          if (halbtaxTicketCosts <= option.credit) {
                            // All costs covered by initial credit
                            const totalCost = option.cost + halbtaxPrice;
                            return { ...option, totalCost };
                          } else {
                            // More costs than initial credit
                            const remainingAfterFirst = halbtaxTicketCosts - option.credit;
                            
                            if (allowHalbtaxPlusReload) {
                              // Use same logic as main app
                              const reloadCount = Math.ceil(remainingAfterFirst / option.credit);
                              const lastReloadUsage = remainingAfterFirst % option.credit || option.credit;
                              
                              let totalReloadCost = 0;
                              for (let i = 0; i < reloadCount; i++) {
                                if (i === reloadCount - 1) {
                                  const usageRatio = lastReloadUsage / option.credit;
                                  totalReloadCost += option.cost * usageRatio;
                                } else {
                                  totalReloadCost += option.cost;
                                }
                              }
                              
                              const totalCost = option.cost + halbtaxPrice + totalReloadCost;
                              return { ...option, totalCost };
                            } else {
                              // Use initial credit + regular Halbtax tickets for remaining
                              const totalCost = option.cost + halbtaxPrice + remainingAfterFirst;
                              return { ...option, totalCost };
                            }
                          }
                        });
                        
                        // GA
                        const gaTotal = gaPrice;
                        
                        // Find best option
                        const allOptions = [
                          { name: 'No Subscription', total: noAboTotal, type: 'none' },
                          { name: 'Halbtax', total: halbtaxTotal, type: 'halbtax' },
                          ...halbtaxPlusResults.map((hp: {credit: number, totalCost: number}) => ({ name: `Halbtax Plus ${hp.credit}`, total: hp.totalCost, type: 'halbtaxplus' })),
                          { name: 'GA', total: gaTotal, type: 'ga' }
                        ];
                        
                        return allOptions.reduce((best, current) => 
                          current.total < best.total ? current : best
                        );
                      };
                      
                      // Binary search to find breakeven points
                      const findBreakevenPoint = (targetType: string, maxCost = 20000, precision = 10) => {
                        let low = 0, high = maxCost;
                        let bestPoint = null;
                        
                        while (high - low > precision) {
                          const mid = Math.floor((low + high) / 2);
                          const bestOption = calculateTotalForTravelCost(mid);
                          
                          if (bestOption.type === targetType) {
                            bestPoint = mid;
                            high = mid;
                          } else {
                            low = mid;
                          }
                        }
                        
                        // Fine-tune to find exact point
                        for (let cost = Math.max(0, (bestPoint || low) - precision); cost <= Math.min(maxCost, (bestPoint || high) + precision); cost += 1) {
                          const bestOption = calculateTotalForTravelCost(cost);
                          if (bestOption.type === targetType) {
                            return cost;
                          }
                        }
                        
                        return bestPoint;
                      };
                      
                      const actualHalbtaxBreakeven = findBreakevenPoint('halbtax');
                      const actualGABreakeven = findBreakevenPoint('ga');
                      
                      return (
                        <div className="space-y-4">
                          {/* Actual Halbtax Break-even */}
                          {actualHalbtaxBreakeven && (
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 sm:p-4 rounded-xl border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <div className="font-semibold text-blue-900 text-sm">{t('actualHalbtaxBreakEven')}</div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                                  {formatCurrency(actualHalbtaxBreakeven)}
                                </div>
                                <div className="text-xs sm:text-sm text-blue-600 font-medium">
                                  {t('annualTravelCost')}
                                </div>
                              </div>
                              <div className="mt-2 text-xs text-blue-600">
                                💡 {t('halbtaxBestChoice')}
                              </div>
                            </div>
                          )}
                          
                          {/* Actual GA Break-even */}
                          {actualGABreakeven && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl border border-purple-200 relative overflow-hidden">
                              {/* Animated background pattern */}
                              <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-2 left-2 w-4 h-4 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                <div className="absolute bottom-3 left-1/3 w-3 h-3 bg-purple-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                              </div>
                              
                              <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                                  <div className="font-semibold text-purple-900 text-sm">{t('actualGABreakEven')}</div>
                                  <div className="ml-auto">
                                    <div className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-xs font-medium text-purple-700 border border-purple-200">
                                      🚄 {t('unlimitedTravelBadge')}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mb-3">
                                  <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                    {formatCurrency(actualGABreakeven)}
                                  </div>
                                  <div className="text-xs sm:text-sm text-purple-600 font-medium">
                                    {t('annualTravelCost')}
                                  </div>
                                </div>
                                
                                {/* Progress bar showing how far current costs are */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs text-purple-600">
                                    <span>{t('yourCurrentCosts')}</span>
                                    <span>{t('gaBreakeven')}</span>
                                  </div>
                                  <div className="w-full bg-purple-100 rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                                      style={{
                                        width: `${Math.min(100, (results.noAboTotal / actualGABreakeven) * 100)}%`
                                      }}
                                    ></div>
                                  </div>
                                  <div className="text-center text-xs text-purple-600">
                                    {Math.round((results.noAboTotal / actualGABreakeven) * 100)}% {t('percentageOfWayThere')}
                                    {results.noAboTotal >= actualGABreakeven && (
                                      <span className="ml-2 text-green-600 font-bold">🎉 {t('gaIsOptimal')}</span>
                                    )}
                                  </div>
                                </div>
                                
                              </div>
                            </div>
                          )}
                          
                          {!actualHalbtaxBreakeven && !actualGABreakeven && (
                            <div className="text-center p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                              <div className="text-4xl mb-2">🤔</div>
                              <div className="text-gray-500 text-xs sm:text-sm italic">
                                No clear breakeven points found in typical range
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Try adjusting your travel patterns or settings
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div className="font-semibold text-gray-800 text-sm sm:text-base">{t('yourCosts')}</div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Savings Visualization */}
                    <div className="relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm text-gray-600">{t('withoutSubscription')}</span>
                        <span className="font-medium text-gray-800 text-xs sm:text-sm">{formatCurrency(results.noAboTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs sm:text-sm text-gray-600 truncate pr-2">{t('bestOptionLabel', { option: results.bestOption.name })}</span>
                        <span className="font-medium text-emerald-700 text-xs sm:text-sm whitespace-nowrap">{formatCurrency(results.bestOption.total)}</span>
                      </div>
                      
                      {/* Visual Savings Bar */}
                      <div className="space-y-2">
                        <div className="w-full bg-red-100 rounded-lg h-5 sm:h-6 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-200 to-red-300 rounded-lg"></div>
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg transition-all duration-700"
                            style={{
                              width: `${(results.bestOption.total / results.noAboTotal) * 100}%`
                            }}
                          ></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-white drop-shadow-sm">
                              {t('percentageSaved', { percent: Math.round((1 - results.bestOption.total / results.noAboTotal) * 100) })}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span className="truncate pr-2">{t('savedAmount', { amount: formatCurrency(results.noAboTotal - results.bestOption.total) })}</span>
                          <span className="whitespace-nowrap">{t('totalCostLabel')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Summary Badge */}
                    <div className="text-center">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-full shadow-sm text-xs sm:text-sm">
                          <span>💰</span>
                          <span className="font-semibold truncate">{t('saveAnnually', { amount: formatCurrency(results.noAboTotal - results.bestOption.total) })}</span>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          Monthly: {formatCurrency((results.noAboTotal - results.bestOption.total) / 12)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* PDF Export Button */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <button
                  onClick={exportToPDF}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                >
                  <Download className="w-5 h-5" />
                  <span>{t('exportPdf')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer with disclaimer */}
        <div className="mt-8 mb-4 px-4 py-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="max-w-4xl mx-auto text-xs sm:text-sm text-gray-600 leading-relaxed">
            <div className="whitespace-pre-line text-left">
              {t('disclaimer').split('\n').map((line, index) => {
                // Handle full-line bold headings (start and end with **)
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <div key={index} className="font-bold text-gray-800 mt-3 mb-2">{line.replace(/^\*\*|\*\*$/g, '')}</div>;
                } 
                // Handle bullet points
                else if (line.startsWith('•')) {
                  // Parse inline bold text in bullet points
                  const parts = line.split(/(\*\*[^*]+\*\*)/);
                  return (
                    <div key={index} className="ml-4 mb-1">
                      {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <span key={i} className="font-bold">{part.replace(/^\*\*|\*\*$/g, '')}</span>;
                        }
                        return part;
                      })}
                    </div>
                  );
                } 
                // Handle "Created by" line with social icons
                else if (line.includes('Created by') || line.includes('Erstellt von') || line.includes('Créé par') || line.includes('Creato da')) {
                  return (
                    <div key={index} className="mt-4 pt-3 border-t border-gray-300 flex items-center justify-center gap-3">
                      <span className="text-gray-600 text-xs sm:text-sm">{line}</span>
                      <div className="flex items-center gap-2">
                        <a
                          href="https://www.linkedin.com/in/sirindudler/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="LinkedIn"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                        <a
                          href="https://github.com/sirindudler"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 hover:text-gray-900 transition-colors"
                          title="GitHub"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                }
                // Handle URLs (simple detection for https://)
                else if (line.startsWith('https://')) {
                  return (
                    <div key={index} className="mt-2">
                      <a 
                        href={line.trim()} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 underline font-medium"
                      >
                        {line.trim()}
                      </a>
                    </div>
                  );
                }
                // Handle regular text with inline bold formatting and URLs
                else if (line.trim()) {
                  const parts = line.split(/(\*\*[^*]+\*\*|https:\/\/[^\s]+)/);
                  return (
                    <div key={index} className="mb-2">
                      {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <span key={i} className="font-bold">{part.replace(/^\*\*|\*\*$/g, '')}</span>;
                        } else if (part.startsWith('https://')) {
                          return (
                            <a 
                              key={i}
                              href={part.trim()} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 underline font-medium"
                            >
                              {part.trim()}
                            </a>
                          );
                        }
                        return part;
                      })}
                    </div>
                  );
                } 
                // Handle empty lines
                else {
                  return <div key={index} className="mb-2"></div>;
                }
              })}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default SBBCalculator;