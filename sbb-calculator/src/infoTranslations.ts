import { Language } from './translations';

export interface InfoTranslations {
  [key: string]: {
    [key: string]: string;
  };
}

export const infoTranslations: InfoTranslations = {
  en: {
    // Navigation
    backToCalculator: "Back to Calculator",
    aboutTitle: "About Travelcards.ch",
    aboutSubtitle: "Your comprehensive Swiss public transport subscription calculator",

    // What is section
    whatIsTitle: "What is Travelcards.ch?",
    whatIsPara1: "Travelcards.ch is a free, comprehensive calculator designed to help Swiss residents and visitors find the most cost-effective public transport subscription for their travel needs. Our tool compares all major Swiss railway and public transport options including Halbtax, Halbtax Plus, GA Travelcard, and individual tickets.",
    whatIsPara2: "Whether you're a daily commuter, occasional traveler, or tourist exploring Switzerland, our calculator analyzes your specific travel patterns to recommend the optimal subscription that saves you money.",

    // How it works
    howItWorksTitle: "How Does It Work?",
    step1Title: "Enter Routes",
    step1Description: "Add your regular travel routes with frequency and current costs",
    step2Title: "Calculate",
    step2Description: "Our algorithm compares all subscription options for your specific needs",
    step3Title: "Save Money",
    step3Description: "Get personalized recommendations to minimize your transport costs",

    // Subscriptions section
    subscriptionsTitle: "Swiss Public Transport Subscriptions We Compare",
    halbtaxTitle: "Halbtax (Half-Fare Card)",
    halbtaxPoint1: "50% discount on most Swiss public transport",
    halbtaxPoint2: "Valid for one year",
    halbtaxPoint3: "Different prices for youth, adults, and seniors",
    halbtaxPoint4: "New customer and loyalty pricing available",

    gaTitle: "GA Travelcard (General Abonnement)",
    gaPoint1: "Unlimited travel on most Swiss public transport",
    gaPoint2: "1st and 2nd class options",
    gaPoint3: "Monthly and yearly subscriptions",
    gaPoint4: "Age-based pricing tiers",

    halbtaxPlusTitle: "Halbtax Plus",
    halbtaxPlusPoint1: "Combines Halbtax with credit for tickets",
    halbtaxPlusPoint2: "Automatic reload options",
    halbtaxPlusPoint3: "Flexible credit amounts",
    halbtaxPlusPoint4: "Perfect for moderate travelers",

    individualTitle: "Individual Tickets",
    individualPoint1: "Pay-per-trip option",
    individualPoint2: "No subscription commitment",
    individualPoint3: "Best for infrequent travelers",
    individualPoint4: "Full-price tickets",

    // Features section
    featuresTitle: "Features & Benefits",
    comprehensiveTitle: "Comprehensive Analysis",
    comprehensivePoint1: "Compares all major Swiss transport subscriptions",
    comprehensivePoint2: "Includes age-specific pricing",
    comprehensivePoint3: "Considers travel frequency and patterns",
    comprehensivePoint4: "Accounts for seasonal variations",

    userFriendlyTitle: "User-Friendly",
    userFriendlyPoint1: "Multilingual support (DE, EN, FR, IT)",
    userFriendlyPoint2: "Intuitive interface",
    userFriendlyPoint3: "Mobile-responsive design",
    userFriendlyPoint4: "No registration required",

    accurateTitle: "Accurate & Updated",
    accuratePoint1: "Current Swiss railway pricing data",
    accuratePoint2: "Regular price updates",
    accuratePoint3: "Swiss transport authority compliance",
    accuratePoint4: "Reliable calculations",

    freeTitle: "Free & Private",
    freePoint1: "Completely free to use",
    freePoint2: "No data collection",
    freePoint3: "No cookies or tracking",
    freePoint4: "Privacy-focused",

    // Who should use
    whoShouldUseTitle: "Who Should Use Travelcards.ch?",
    commutersTitle: "Daily Commuters",
    commutersDescription: "Find the most cost-effective subscription for regular work commutes and daily travel.",
    studentsTitle: "Students & Young Adults",
    studentsDescription: "Discover youth discounts and student-friendly transport options across Switzerland.",
    touristsTitle: "Tourists & Visitors",
    touristsDescription: "Plan your Swiss travel budget with optimal transport passes for your itinerary.",
    familiesTitle: "Families",
    familiesDescription: "Calculate family transport costs and find group discounts and family-friendly options.",
    businessTitle: "Business Travelers",
    businessDescription: "Optimize corporate travel expenses with the most suitable business transport solutions.",
    seniorsTitle: "Seniors",
    seniorsDescription: "Take advantage of senior pricing and find the best value for retirement travel needs.",

    // Swiss transport system
    swissTransportTitle: "Swiss Public Transport System",
    swissTransportPara1: "Switzerland boasts one of the world's most efficient and comprehensive public transport networks. Swiss Federal Railways operates an extensive rail network connecting cities, towns, and villages across the country, complemented by buses, trams, and boats.",
    swissTransportPara2: "The Swiss transport system operates on a integrated ticketing system, allowing seamless travel across different operators and transport modes. This integration makes subscription cards like the GA Travelcard and Halbtax particularly valuable for regular travelers.",
    keyFactsTitle: "Key Facts:",
    keyFact1: "Over 5,100 km of railway network",
    keyFact2: "99.3% punctuality rate (among the best globally)",
    keyFact3: "Integrated with buses, trams, and boats",
    keyFact4: "Covers all 26 Swiss cantons",
    keyFact5: "Eco-friendly transport option",

    // Footer CTA
    ctaTitle: "Start Saving on Your Swiss Travel Today",
    ctaDescription: "Use our free calculator to find your optimal Swiss transport subscription and start saving money.",
    ctaButton: "Calculate Your Optimal Travelcard"
  },

  de: {
    // Navigation
    backToCalculator: "Zurück zum Rechner",
    aboutTitle: "Über Travelcards.ch",
    aboutSubtitle: "Ihr umfassender Schweizer ÖV-Abonnement-Rechner",

    // What is section
    whatIsTitle: "Was ist Travelcards.ch?",
    whatIsPara1: "Travelcards.ch ist ein kostenloser, umfassender Rechner, der Schweizer Einwohnern und Besuchern dabei hilft, das kostengünstigste öffentliche Verkehrsabonnement für ihre Reisebedürfnisse zu finden. Unser Tool vergleicht alle wichtigen Optionen der Schweizerischen Bundesbahnen und des öffentlichen Verkehrs, einschließlich Halbtax, Halbtax Plus, GA-Travelcard und Einzeltickets.",
    whatIsPara2: "Egal, ob Sie ein täglicher Pendler, gelegentlicher Reisender oder Tourist sind, der die Schweiz erkundet - unser Rechner analysiert Ihre spezifischen Reisemuster, um das optimale Abonnement zu empfehlen, das Ihnen Geld spart.",

    // How it works
    howItWorksTitle: "Wie funktioniert es?",
    step1Title: "Routen eingeben",
    step1Description: "Fügen Sie Ihre regelmäßigen Reiserouten mit Häufigkeit und aktuellen Kosten hinzu",
    step2Title: "Berechnen",
    step2Description: "Unser Algorithmus vergleicht alle Abonnement-Optionen für Ihre spezifischen Bedürfnisse",
    step3Title: "Geld sparen",
    step3Description: "Erhalten Sie personalisierte Empfehlungen zur Minimierung Ihrer Transportkosten",

    // Subscriptions section
    subscriptionsTitle: "Schweizer ÖV-Abonnemente, die wir vergleichen",
    halbtaxTitle: "Halbtax",
    halbtaxPoint1: "50% Rabatt auf die meisten Schweizer ÖV-Verbindungen",
    halbtaxPoint2: "Ein Jahr gültig",
    halbtaxPoint3: "Verschiedene Preise für Jugendliche, Erwachsene und Senioren",
    halbtaxPoint4: "Neukunden- und Treuepreise verfügbar",

    gaTitle: "GA Travelcard (General-Abonnement)",
    gaPoint1: "Unbegrenzte Fahrten im Schweizer ÖV",
    gaPoint2: "1. und 2. Klasse Optionen",
    gaPoint3: "Monats- und Jahresabonnemente",
    gaPoint4: "Altersbasierte Preisstufen",

    halbtaxPlusTitle: "Halbtax Plus",
    halbtaxPlusPoint1: "Kombiniert Halbtax mit Guthaben für Tickets",
    halbtaxPlusPoint2: "Automatische Auflade-Optionen",
    halbtaxPlusPoint3: "Flexible Guthabenbeträge",
    halbtaxPlusPoint4: "Perfekt für Gelegenheitsreisende",

    individualTitle: "Einzeltickets",
    individualPoint1: "Pro-Fahrt-Option",
    individualPoint2: "Keine Abonnement-Verpflichtung",
    individualPoint3: "Am besten für seltene Reisende",
    individualPoint4: "Vollpreis-Tickets",

    // Features section
    featuresTitle: "Funktionen & Vorteile",
    comprehensiveTitle: "Umfassende Analyse",
    comprehensivePoint1: "Vergleicht alle wichtigen Schweizer Verkehrsabonnemente",
    comprehensivePoint2: "Berücksichtigt altersspezifische Preise",
    comprehensivePoint3: "Berücksichtigt Reisehäufigkeit und -muster",
    comprehensivePoint4: "Berücksichtigt saisonale Schwankungen",

    userFriendlyTitle: "Benutzerfreundlich",
    userFriendlyPoint1: "Mehrsprachiger Support (DE, EN, FR, IT)",
    userFriendlyPoint2: "Intuitive Benutzeroberfläche",
    userFriendlyPoint3: "Mobil-responsives Design",
    userFriendlyPoint4: "Keine Registrierung erforderlich",

    accurateTitle: "Genau & Aktuell",
    accuratePoint1: "Aktuelle Schweizer Bahn-Preisdaten",
    accuratePoint2: "Regelmäßige Preis-Updates",
    accuratePoint3: "Schweizer Verkehrsbehörden-konform",
    accuratePoint4: "Zuverlässige Berechnungen",

    freeTitle: "Kostenlos & Privat",
    freePoint1: "Vollständig kostenlos",
    freePoint2: "Keine Datensammlung",
    freePoint3: "Keine Cookies oder Tracking",
    freePoint4: "Datenschutz-fokussiert",

    // Who should use
    whoShouldUseTitle: "Wer sollte Travelcards.ch nutzen?",
    commutersTitle: "Tägliche Pendler",
    commutersDescription: "Finden Sie das kostengünstigste Abonnement für regelmäßige Arbeitsfahrten und tägliche Reisen.",
    studentsTitle: "Studenten & junge Erwachsene",
    studentsDescription: "Entdecken Sie Jugendrabatte und studentenfreundliche Verkehrsoptionen in der ganzen Schweiz.",
    touristsTitle: "Touristen & Besucher",
    touristsDescription: "Planen Sie Ihr Schweizer Reisebudget mit optimalen Verkehrspässen für Ihre Reiseroute.",
    familiesTitle: "Familien",
    familiesDescription: "Berechnen Sie Familienverkehrskosten und finden Sie Gruppenrabatte und familienfreundliche Optionen.",
    businessTitle: "Geschäftsreisende",
    businessDescription: "Optimieren Sie Firmenreisekosten mit den passendsten Geschäftsverkehrslösungen.",
    seniorsTitle: "Senioren",
    seniorsDescription: "Nutzen Sie Seniorenpreise und finden Sie das beste Preis-Leistungs-Verhältnis für Reisen im Ruhestand.",

    // Swiss transport system
    swissTransportTitle: "Schweizer ÖV-System",
    swissTransportPara1: "Die Schweiz verfügt über eines der effizientesten und umfassendsten öffentlichen Verkehrsnetze der Welt. Die Schweizerischen Bundesbahnen betreiben ein ausgedehntes Schienennetz, das Städte, Gemeinden und Dörfer im ganzen Land verbindet, ergänzt durch Busse, Straßenbahnen und Boote.",
    swissTransportPara2: "Das Schweizer Verkehrssystem arbeitet mit einem integrierten Ticketsystem, das nahtlose Reisen zwischen verschiedenen Betreibern und Verkehrsmitteln ermöglicht. Diese Integration macht Abonnementskarten wie die GA Travelcard und Halbtax besonders wertvoll für Vielreisende.",
    keyFactsTitle: "Wichtige Fakten:",
    keyFact1: "Über 5.100 km Eisenbahnnetz",
    keyFact2: "99,3% Pünktlichkeitsrate (eine der besten weltweit)",
    keyFact3: "Integriert mit Bussen, Straßenbahnen und Booten",
    keyFact4: "Deckt alle 26 Schweizer Kantone ab",
    keyFact5: "Umweltfreundliche Transportoption",

    // Footer CTA
    ctaTitle: "Sparen Sie noch heute bei Ihren Schweizer Reisen",
    ctaDescription: "Nutzen Sie unseren kostenlosen Rechner, um Ihr optimales Schweizer Verkehrsabonnement zu finden und Geld zu sparen.",
    ctaButton: "Berechnen Sie Ihre optimale Travelcard"
  },

  fr: {
    // Navigation
    backToCalculator: "Retour au calculateur",
    aboutTitle: "À propos de Travelcards.ch",
    aboutSubtitle: "Votre calculateur complet d'abonnements de transport public suisse",

    // What is section
    whatIsTitle: "Qu'est-ce que Travelcards.ch ?",
    whatIsPara1: "Travelcards.ch est un calculateur gratuit et complet conçu pour aider les résidents suisses et les visiteurs à trouver l'abonnement de transport public le plus rentable pour leurs besoins de voyage. Notre outil compare toutes les principales options des chemins de fer fédéraux suisses et des transports publics, y compris le demi-tarif, le demi-tarif Plus, l'abonnement général et les billets individuels.",
    whatIsPara2: "Que vous soyez un pendulaire quotidien, un voyageur occasionnel ou un touriste explorant la Suisse, notre calculateur analyse vos habitudes de voyage spécifiques pour recommander l'abonnement optimal qui vous fait économiser de l'argent.",

    // How it works
    howItWorksTitle: "Comment ça marche ?",
    step1Title: "Saisir les itinéraires",
    step1Description: "Ajoutez vos itinéraires de voyage réguliers avec la fréquence et les coûts actuels",
    step2Title: "Calculer",
    step2Description: "Notre algorithme compare toutes les options d'abonnement pour vos besoins spécifiques",
    step3Title: "Économiser",
    step3Description: "Obtenez des recommandations personnalisées pour minimiser vos coûts de transport",

    // Subscriptions section
    subscriptionsTitle: "Abonnements de transport public suisse que nous comparons",
    halbtaxTitle: "Demi-tarif",
    halbtaxPoint1: "50% de réduction sur la plupart des transports publics suisses",
    halbtaxPoint2: "Valable une année",
    halbtaxPoint3: "Prix différents pour jeunes, adultes et seniors",
    halbtaxPoint4: "Tarifs nouveaux clients et fidélité disponibles",

    gaTitle: "Abonnement général (AG)",
    gaPoint1: "Voyages illimités sur la plupart des transports publics suisses",
    gaPoint2: "Options 1ère et 2ème classe",
    gaPoint3: "Abonnements mensuels et annuels",
    gaPoint4: "Niveaux de prix basés sur l'âge",

    halbtaxPlusTitle: "Demi-tarif Plus",
    halbtaxPlusPoint1: "Combine le demi-tarif avec un crédit pour les billets",
    halbtaxPlusPoint2: "Options de rechargement automatique",
    halbtaxPlusPoint3: "Montants de crédit flexibles",
    halbtaxPlusPoint4: "Parfait pour les voyageurs modérés",

    individualTitle: "Billets individuels",
    individualPoint1: "Option paiement par voyage",
    individualPoint2: "Aucun engagement d'abonnement",
    individualPoint3: "Idéal pour les voyageurs occasionnels",
    individualPoint4: "Billets plein tarif",

    // Features section
    featuresTitle: "Fonctionnalités et avantages",
    comprehensiveTitle: "Analyse complète",
    comprehensivePoint1: "Compare tous les principaux abonnements de transport suisses",
    comprehensivePoint2: "Inclut les prix spécifiques à l'âge",
    comprehensivePoint3: "Considère la fréquence et les habitudes de voyage",
    comprehensivePoint4: "Tient compte des variations saisonnières",

    userFriendlyTitle: "Convivial",
    userFriendlyPoint1: "Support multilingue (DE, EN, FR, IT)",
    userFriendlyPoint2: "Interface intuitive",
    userFriendlyPoint3: "Design adaptatif mobile",
    userFriendlyPoint4: "Aucune inscription requise",

    accurateTitle: "Précis et à jour",
    accuratePoint1: "Données tarifaires ferroviaires suisses actuelles",
    accuratePoint2: "Mises à jour régulières des prix",
    accuratePoint3: "Conforme aux autorités de transport suisses",
    accuratePoint4: "Calculs fiables",

    freeTitle: "Gratuit et privé",
    freePoint1: "Complètement gratuit",
    freePoint2: "Aucune collecte de données",
    freePoint3: "Aucun cookie ni suivi",
    freePoint4: "Axé sur la confidentialité",

    // Who should use
    whoShouldUseTitle: "Qui devrait utiliser Travelcards.ch ?",
    commutersTitle: "Pendulaires quotidiens",
    commutersDescription: "Trouvez l'abonnement le plus rentable pour les trajets domicile-travail réguliers et les voyages quotidiens.",
    studentsTitle: "Étudiants et jeunes adultes",
    studentsDescription: "Découvrez les réductions jeunes et les options de transport favorables aux étudiants à travers la Suisse.",
    touristsTitle: "Touristes et visiteurs",
    touristsDescription: "Planifiez votre budget voyage suisse avec des passes de transport optimaux pour votre itinéraire.",
    familiesTitle: "Familles",
    familiesDescription: "Calculez les coûts de transport familial et trouvez des réductions de groupe et des options familiales.",
    businessTitle: "Voyageurs d'affaires",
    businessDescription: "Optimisez les frais de voyage d'entreprise avec les solutions de transport professionnel les plus adaptées.",
    seniorsTitle: "Seniors",
    seniorsDescription: "Profitez des tarifs seniors et trouvez le meilleur rapport qualité-prix pour vos voyages de retraite.",

    // Swiss transport system
    swissTransportTitle: "Système de transport public suisse",
    swissTransportPara1: "La Suisse possède l'un des réseaux de transport public les plus efficaces et les plus complets au monde. Les chemins de fer fédéraux suisses exploitent un vaste réseau ferroviaire reliant villes, communes et villages à travers le pays, complété par des bus, trams et bateaux.",
    swissTransportPara2: "Le système de transport suisse fonctionne avec un système de billetterie intégré, permettant des voyages fluides entre différents opérateurs et modes de transport. Cette intégration rend les cartes d'abonnement comme l'AG et le demi-tarif particulièrement précieuses pour les voyageurs réguliers.",
    keyFactsTitle: "Faits clés :",
    keyFact1: "Plus de 5 100 km de réseau ferroviaire",
    keyFact2: "99,3% de ponctualité (parmi les meilleurs au monde)",
    keyFact3: "Intégré avec bus, trams et bateaux",
    keyFact4: "Couvre les 26 cantons suisses",
    keyFact5: "Option de transport écologique",

    // Footer CTA
    ctaTitle: "Commencez à économiser sur vos voyages suisses aujourd'hui",
    ctaDescription: "Utilisez notre calculateur gratuit pour trouver votre abonnement de transport suisse optimal et commencez à économiser de l'argent.",
    ctaButton: "Calculez votre Travelcard optimale"
  },

  it: {
    // Navigation
    backToCalculator: "Torna al calcolatore",
    aboutTitle: "Chi siamo - Travelcards.ch",
    aboutSubtitle: "Il tuo calcolatore completo di abbonamenti per i trasporti pubblici svizzeri",

    // What is section
    whatIsTitle: "Cos'è Travelcards.ch?",
    whatIsPara1: "Travelcards.ch è un calcolatore gratuito e completo progettato per aiutare residenti e visitatori svizzeri a trovare l'abbonamento ai trasporti pubblici più conveniente per le loro esigenze di viaggio. Il nostro strumento confronta tutte le principali opzioni delle ferrovie federali svizzere e dei trasporti pubblici, inclusi metà-prezzo, metà-prezzo Plus, abbonamento generale e biglietti singoli.",
    whatIsPara2: "Che tu sia un pendolare quotidiano, un viaggiatore occasionale o un turista che esplora la Svizzera, il nostro calcolatore analizza i tuoi modelli di viaggio specifici per raccomandare l'abbonamento ottimale che ti fa risparmiare denaro.",

    // How it works
    howItWorksTitle: "Come funziona?",
    step1Title: "Inserisci percorsi",
    step1Description: "Aggiungi i tuoi percorsi di viaggio regolari con frequenza e costi attuali",
    step2Title: "Calcola",
    step2Description: "Il nostro algoritmo confronta tutte le opzioni di abbonamento per le tue esigenze specifiche",
    step3Title: "Risparmia",
    step3Description: "Ottieni raccomandazioni personalizzate per minimizzare i tuoi costi di trasporto",

    // Subscriptions section
    subscriptionsTitle: "Abbonamenti trasporti pubblici svizzeri che confrontiamo",
    halbtaxTitle: "Metà-prezzo",
    halbtaxPoint1: "50% di sconto sulla maggior parte dei trasporti pubblici svizzeri",
    halbtaxPoint2: "Valido per un anno",
    halbtaxPoint3: "Prezzi diversi per giovani, adulti e anziani",
    halbtaxPoint4: "Tariffe nuovi clienti e fedeltà disponibili",

    gaTitle: "Abbonamento generale (AG)",
    gaPoint1: "Viaggi illimitati sulla maggior parte dei trasporti pubblici svizzeri",
    gaPoint2: "Opzioni 1a e 2a classe",
    gaPoint3: "Abbonamenti mensili e annuali",
    gaPoint4: "Livelli di prezzo basati sull'età",

    halbtaxPlusTitle: "Metà-prezzo Plus",
    halbtaxPlusPoint1: "Combina metà-prezzo con credito per biglietti",
    halbtaxPlusPoint2: "Opzioni di ricarica automatica",
    halbtaxPlusPoint3: "Importi di credito flessibili",
    halbtaxPlusPoint4: "Perfetto per viaggiatori moderati",

    individualTitle: "Biglietti singoli",
    individualPoint1: "Opzione pagamento per viaggio",
    individualPoint2: "Nessun impegno di abbonamento",
    individualPoint3: "Ideale per viaggiatori occasionali",
    individualPoint4: "Biglietti a prezzo pieno",

    // Features section
    featuresTitle: "Caratteristiche e vantaggi",
    comprehensiveTitle: "Analisi completa",
    comprehensivePoint1: "Confronta tutti i principali abbonamenti trasporti svizzeri",
    comprehensivePoint2: "Include prezzi specifici per età",
    comprehensivePoint3: "Considera frequenza e modelli di viaggio",
    comprehensivePoint4: "Tiene conto delle variazioni stagionali",

    userFriendlyTitle: "Facile da usare",
    userFriendlyPoint1: "Supporto multilingue (DE, EN, FR, IT)",
    userFriendlyPoint2: "Interfaccia intuitiva",
    userFriendlyPoint3: "Design responsive mobile",
    userFriendlyPoint4: "Nessuna registrazione richiesta",

    accurateTitle: "Preciso e aggiornato",
    accuratePoint1: "Dati tariffari ferroviari svizzeri attuali",
    accuratePoint2: "Aggiornamenti regolari dei prezzi",
    accuratePoint3: "Conforme alle autorità trasporti svizzere",
    accuratePoint4: "Calcoli affidabili",

    freeTitle: "Gratuito e privato",
    freePoint1: "Completamente gratuito",
    freePoint2: "Nessuna raccolta dati",
    freePoint3: "Nessun cookie o tracciamento",
    freePoint4: "Focalizzato sulla privacy",

    // Who should use
    whoShouldUseTitle: "Chi dovrebbe usare Travelcards.ch?",
    commutersTitle: "Pendolari quotidiani",
    commutersDescription: "Trova l'abbonamento più conveniente per spostamenti casa-lavoro regolari e viaggi quotidiani.",
    studentsTitle: "Studenti e giovani adulti",
    studentsDescription: "Scopri sconti giovani e opzioni trasporti favorevoli agli studenti in tutta la Svizzera.",
    touristsTitle: "Turisti e visitatori",
    touristsDescription: "Pianifica il tuo budget viaggio svizzero con pass trasporti ottimali per il tuo itinerario.",
    familiesTitle: "Famiglie",
    familiesDescription: "Calcola i costi trasporti familiari e trova sconti gruppo e opzioni adatte alle famiglie.",
    businessTitle: "Viaggiatori d'affari",
    businessDescription: "Ottimizza le spese viaggi aziendali con le soluzioni trasporti business più adatte.",
    seniorsTitle: "Anziani",
    seniorsDescription: "Approfitta dei prezzi per anziani e trova il miglior rapporto qualità-prezzo per viaggi in pensione.",

    // Swiss transport system
    swissTransportTitle: "Sistema trasporti pubblici svizzero",
    swissTransportPara1: "La Svizzera vanta una delle reti di trasporti pubblici più efficienti e complete al mondo. Le ferrovie federali svizzere gestiscono un'estesa rete ferroviaria che collega città, comuni e villaggi in tutto il paese, completata da autobus, tram e battelli.",
    swissTransportPara2: "Il sistema trasporti svizzero opera con un sistema di bigliettazione integrato, permettendo viaggi fluidi tra diversi operatori e modalità di trasporto. Questa integrazione rende le carte abbonamento come l'AG e il metà-prezzo particolarmente preziose per i viaggiatori regolari.",
    keyFactsTitle: "Fatti chiave:",
    keyFact1: "Oltre 5.100 km di rete ferroviaria",
    keyFact2: "99,3% di puntualità (tra i migliori al mondo)",
    keyFact3: "Integrato con autobus, tram e battelli",
    keyFact4: "Copre tutti i 26 cantoni svizzeri",
    keyFact5: "Opzione trasporto eco-friendly",

    // Footer CTA
    ctaTitle: "Inizia a risparmiare sui tuoi viaggi svizzeri oggi",
    ctaDescription: "Usa il nostro calcolatore gratuito per trovare il tuo abbonamento trasporti svizzero ottimale e iniziare a risparmiare denaro.",
    ctaButton: "Calcola la tua Travelcard ottimale"
  },

  rm: {
    // Navigation
    backToCalculator: "Enavos al calculader",
    aboutTitle: "Davart Travelcards.ch",
    aboutSubtitle: "Voss calculader cumplain per abonnamaints dal traffic public svizzer",

    // What is section
    whatIsTitle: "Tge è Travelcards.ch?",
    whatIsPara1: "Travelcards.ch è in calculader gratuit e cumplain ch'è concepì per gidar a habitants svizzers e visitadurs da chattar l'abonnament dal traffic public il pli avantagius per lur basegns da viadi. Noss utensil cumparegescha tut las opziuns principalas da las Viafiers federalas svizras (VFS) ed il traffic public, inclus mesa taxa, mesa taxa Plus, abonnament general e bigliets singuls.",
    whatIsPara2: "Schebain Vus essai in pendular dal di, in viagiadur occasiunal u in turist che exploreschai la Svizra, noss calculader analisei Voss models da viadi specifics per recumandar l'abonnament optimal che Vus spargnia daners.",

    // How it works
    howItWorksTitle: "Co funcziunai quai?",
    step1Title: "Endatar percurs",
    step1Description: "Agiuntai Voss percurs da viadi regulars cun frequenza e custs actuals",
    step2Title: "Calcular",
    step2Description: "Noss algoritmus cumparegescha tut las opziuns d'abonnament per Voss basegns specifics",
    step3Title: "Spargnar daners",
    step3Description: "Survegnii recumandaziuns persunalisadas per minimisar Voss custs da transport",

    // Subscriptions section
    subscriptionsTitle: "Abonnamaints dal traffic public svizzer che nus cumparegien",
    halbtaxTitle: "Mesa taxa",
    halbtaxPoint1: "50% reducziun sin la gronda part dal traffic public svizzer",
    halbtaxPoint2: "Valaivel per in onn",
    halbtaxPoint3: "Pretschs differents per giuvens, creschids e seniurs",
    halbtaxPoint4: "Pretschs per novs clients e fidelitad disponibels",

    gaTitle: "Abonnament general (AG)",
    gaPoint1: "Viadi nunlimitai sin la gronda part dal traffic public svizzer",
    gaPoint2: "Opziuns 1avla e 2avla classa",
    gaPoint3: "Abonnamaints mensils ed annuals",
    gaPoint4: "Stadis da pretsch basads sin l'etad",

    halbtaxPlusTitle: "Mesa taxa Plus",
    halbtaxPlusPoint1: "Combinescha mesa taxa cun credit per bigliets",
    halbtaxPlusPoint2: "Opziuns da rechargiar automatic",
    halbtaxPlusPoint3: "Imports da credit flexibels",
    halbtaxPlusPoint4: "Perfect per viagiadurs moderads",

    individualTitle: "Bigliets singuls",
    individualPoint1: "Opziun pajar per viadi",
    individualPoint2: "Nagina obligaziun d'abonnament",
    individualPoint3: "Il meglier per viagiadurs rars",
    individualPoint4: "Bigliets cun pretsch cumplain",

    // Features section
    featuresTitle: "Funcziuns e avantatgs",
    comprehensiveTitle: "Analisa cumpleta",
    comprehensivePoint1: "Cumparegescha tut ils abonnamaints principals dal transport svizzer",
    comprehensivePoint2: "Includa pretschs specifics per etad",
    comprehensivePoint3: "Consideregescha frequenza e models da viadi",
    comprehensivePoint4: "Tegn quint da variaziuns saisunalas",

    userFriendlyTitle: "Simpel d'utilisar",
    userFriendlyPoint1: "Support pluriling (DE, EN, FR, IT)",
    userFriendlyPoint2: "Interfatscha intuitiva",
    userFriendlyPoint3: "Design responsiv per mobils",
    userFriendlyPoint4: "Nagina registraziun necessaria",

    accurateTitle: "Precis & actualisà",
    accuratePoint1: "Datas da pretschs da las viafiers svizras actuals",
    accuratePoint2: "Actualisaziuns regularas dals pretschs",
    accuratePoint3: "Conform a las autoritads da transport svizras",
    accuratePoint4: "Calculaziuns fidaivlas",

    freeTitle: "Gratuit & privat",
    freePoint1: "Cumplettamain gratuit",
    freePoint2: "Nagina collecziun da datas",
    freePoint3: "Nagins cookies u tracking",
    freePoint4: "Focussà sin la protecziun da datas",

    // Who should use
    whoShouldUseTitle: "Tgi duessi duvrar Travelcards.ch?",
    commutersTitle: "Pendulars dal di",
    commutersDescription: "Chattai l'abonnament il pli avantagius per viadi regulars da casa a la lavur e viadi dal di.",
    studentsTitle: "Students & giuvens creschids",
    studentsDescription: "Scuvrai reducziuns per giuvens e opziuns da transport amicaivlas per students en tut la Svizra.",
    touristsTitle: "Turistas & visitadurs",
    touristsDescription: "Planisai Voss budget da viadi svizzer cun pass da transport optimals per Voss itinerari.",
    familiesTitle: "Famiglias",
    familiesDescription: "Calculai custs da transport per famiglias e chattai reducziuns da gruppa e opziuns adattadas per famiglias.",
    businessTitle: "Viagiadurs d'affars",
    businessDescription: "Optimisai las spesas da viadi da l'interpresa cun las soluziuns da transport commercial las pli adattadas.",
    seniorsTitle: "Seniurs",
    seniorsDescription: "Profitai dals pretschs per seniurs e chattai la meglra relaziun pretsch-prestaziun per viadi da pensiun.",

    // Swiss transport system
    swissTransportTitle: "Sistema dal traffic public svizzer",
    swissTransportPara1: "La Svizra po sa vantarsi d'avair ina da las reets dal traffic public las pli efficientas e cumpletas dal mund. Las viafiers federalas svizras manegeschan ina rait extensa da viafier che colligia citads, vischnancas e vitgs en tut il pajais, cumplettada da bus, trams e batels.",
    swissTransportPara2: "Il sistem da transport svizzer funcziunescha cun in sistem da bigliettaria integrada, che pussibilitescha viadi senza problems tranter differents operaturs e modos da transport. Questa integraziun fa che cartas d'abonnament sco l'AG ed la mesa taxa èn particularmain valorusas per viagiadurs regulars.",
    keyFactsTitle: "Fatgs clav:",
    keyFact1: "Passa 5.100 km da rait da viafier",
    keyFact2: "99,3% da puntualitad (tranter las meglras mundanmain)",
    keyFact3: "Integrà cun bus, trams e batels",
    keyFact4: "Cuvra tut ils 26 chantuns svizzers",
    keyFact5: "Opziun da transport ecologica",

    // Footer CTA
    ctaTitle: "Cumenzai a spargnar sin Voss viadi svizzers oz",
    ctaDescription: "Duvrai noss calculader gratuit per chattar Voss abonnament da transport svizzer optimal e cumenzar a spargnar daners.",
    ctaButton: "Calculai Vossa Travelcard optimala"
  }
};

// Translation helper function for Info page
export const useInfoTranslation = (language: Language) => {
  return {
    t: (key: string) => {
      return infoTranslations[language][key] || key;
    }
  };
};