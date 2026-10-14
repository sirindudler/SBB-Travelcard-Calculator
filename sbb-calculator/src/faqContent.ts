import { Language } from './translations';

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqSection {
  title: string;
  items: FaqItem[];
}

// Placeholders in {braces} are filled from pricing.ts in components/Faq.tsx, so those answers
// stay correct after a price update. Everything else is a dated fact (Stand Oktober 2026;
// sources: sbb.ch, Preisüberwacher, BLS/ZVV, Medienberichte). Review after each timetable change.

const de: FaqSection = {
  title: 'Häufige Fragen',
  items: [
    {
      q: 'Lohnt sich das GA 2027 noch?',
      a: 'Für Vielfahrende meist ja, aber die Schwelle steigt. Ab dem 13. Dezember 2026 kostet das GA für Erwachsene in der 2. Klasse CHF 4’095 statt CHF 3’995. Das Halbtax wird laut Medienberichten um rund CHF 5 teurer. Rechnerisch lag die Schwelle, ab der das GA günstiger ist als Halbtax plus reguläre Billette, bisher bei gut CHF 7’600 Fahrkosten pro Jahr. Neu liegt sie voraussichtlich bei rund CHF 7’800. Der Zusatznutzen des GA (je nach Region z. B. Stadtverkehr, Schiffe, Postauto) ist darin nicht eingerechnet. Rechne am besten mit deinen eigenen Fahrten im Rechner oben.',
    },
    {
      q: 'Was ändert sich bei den SBB-Preisen am 13. Dezember 2026?',
      a: 'Mit dem Fahrplanwechsel steigen die Preise im Nationalen Direkten Verkehr (u. a. GA und Halbtax) im Schnitt um 3,6 Prozent. Die Branche hatte zuerst 3,9 Prozent geplant. Nach einer Intervention des Preisüberwachers fällt die Erhöhung beim GA geringer aus: GA Erwachsene 2. Klasse kostet CHF 4’095 (geplant waren CHF 4’195), in der 1. Klasse CHF 6’770 statt CHF 6’520. Kinder, Jugendliche und Familien sollen nicht oder nur wenig belastet werden. Regionale Tarifverbünde legen ihre Preise selbst fest. Verbindlich ist immer der Preis, der beim Kauf auf sbb.ch steht.',
    },
    {
      q: 'Soll ich mein Abo vor der Preiserhöhung noch erneuern?',
      a: 'Massgebend ist der Tarif zum Zeitpunkt des Kaufs. Ob sich ein früher Kauf für dich lohnt, hängt davon ab, wann dein aktuelles Abo ausläuft und ob die SBB eine Erneuerung so früh zulassen. Das prüfst du am besten direkt bei den SBB. Wichtiger als der Zeitpunkt ist die Frage, welches Abo überhaupt zu dir passt. Lass dafür zuerst den Rechner laufen.',
    },
    {
      q: 'Ab welchen Fahrkosten lohnt sich das Halbtax?',
      a: 'Das Halbtax kostet für Erwachsene aktuell CHF {htPrice} (Neukauf) und gibt dir 50 % Rabatt auf die meisten Billette. Es lohnt sich daher, sobald du pro Jahr für mehr als etwa CHF {htBreakeven} reguläre Billette kaufen würdest.',
    },
    {
      q: 'Was kostet das Halbtax für Jugendliche und Erwachsene?',
      a: 'Jugendliche von 16 bis 24 Jahren zahlen aktuell CHF {htYouth} (Neukauf) oder CHF {htYouthLoyal} zum Treuepreis, Erwachsene ab 25 Jahren CHF {htPrice} oder CHF {htLoyal}. Den Treuepreis bekommst du, wenn sich dein Halbtax automatisch verlängert oder du direkt von einem GA wechselst. Das Halbtax verlängert sich jedes Jahr automatisch, bis du es kündigst.',
    },
    {
      q: 'Ab wann lohnt sich das GA gegenüber dem Halbtax?',
      a: 'Mit Halbtax zahlst du CHF {htPrice} plus die Hälfte deiner Fahrkosten. Das GA 2. Klasse für Erwachsene kostet aktuell CHF {gaPrice}. Rechnerisch lohnt sich das GA deshalb ab etwa CHF {gaBreakeven} Fahrkosten pro Jahr (gemessen an den regulären Billettpreisen ohne Abo). Der Zusatznutzen des GA ist dabei nicht eingerechnet und senkt die Schwelle in der Praxis.',
    },
    {
      q: 'Kann ich das GA auch monatlich bezahlen?',
      a: 'Ja. Das GA Erwachsene 2. Klasse kostet bei monatlicher Zahlung aktuell CHF {gaMonthly} pro Monat. Die Mindestvertragsdauer beträgt sechs Monate, danach kannst du mit einem Monat Frist auf das Ende jedes Abomonats kündigen. Aufs ganze Jahr gerechnet ist die Jahreszahlung günstiger. Brauchst du das GA nur {gaMonthsBreakeven} Monate oder weniger, fährst du mit der Monatszahlung besser. Der Rechner berücksichtigt das, wenn du bei deinen Strecken eine kürzere Dauer angibst.',
    },
    {
      q: 'Kann ich mein GA pausieren, zum Beispiel in den Ferien?',
      a: 'Ja, das nennt sich «GA hinterlegen». Du kannst dein GA pro Abojahr für mindestens 5 und höchstens 30 Tage kostenlos online auf swisspass.ch hinterlegen. Während dieser Zeit ist es gesperrt, und der Betrag wird dir auf der nächsten Rechnung gutgeschrieben. Nicht alle GA-Arten lassen sich hinterlegen, das GA für Lernende zum Beispiel nicht.',
    },
    {
      q: 'Gibt es Halbtax PLUS auch für Erwachsene?',
      a: 'Ja, Halbtax PLUS gibt es für Jugendliche und für Erwachsene. Erwachsene zahlen CHF {hp1000} für CHF 1’000 Guthaben, CHF {hp2000} für CHF 2’000 oder CHF {hp3000} für CHF 3’000. Jugendliche bekommen einen grösseren Bonus. Mit dem Guthaben bezahlst du deine Billette zum Halbtax-Preis. Wichtig: Das Halbtax selbst ist nicht enthalten und muss separat gekauft werden. Ist das Guthaben aufgebraucht, lädt es sich automatisch wieder auf. Bleibt am Ende des Jahres etwas übrig, bekommst du den Rest bis zur Höhe deiner Einzahlung zurück, der Bonus verfällt. Der Rechner berücksichtigt all das und vergleicht die drei Pakete.',
    },
    {
      q: 'Was ist das GA Night?',
      a: 'Das GA Night ist für junge Menschen unter 25 Jahren. Es kostet CHF {gaNight} pro Jahr und gilt in der 2. Klasse für Fahrten zwischen 19 Uhr und 5 Uhr, am Wochenende bis 7 Uhr. Der Nachtzuschlag ist nicht inbegriffen, und das Abo verlängert sich nicht automatisch. Im Rechner kannst du bei einer Strecke angeben, dass du sie nur zu GA-Night-Zeiten fährst.',
    },
    {
      q: 'Bis zu welchem Alter fährt mein Kind gratis mit?',
      a: 'Kinder unter 6 Jahren reisen in der Schweiz gratis, auch ohne Begleitung. Von 6 Jahren bis zum 16. Geburtstag zahlen Kinder den halben Preis. Mit der Junior-Karte für CHF 30 pro Jahr fahren sie gratis, wenn sie mit einem Elternteil unterwegs sind. Für Grosseltern, Gotti, Götti oder andere Begleitpersonen gibt es die Kinder-Mitfahrkarte, ebenfalls für CHF 30 pro Jahr und Kind. Beide Karten werden auf dem SwissPass des Kindes gespeichert. Die Begleitperson braucht selbst ein gültiges Billett oder Abo.',
    },
    {
      q: 'Ab welchem Alter gibt es das GA Senior?',
      a: 'Das GA Senior gibt es heute für Frauen ab 64 und für Männer ab 65 Jahren. In der 2. Klasse kostet es aktuell CHF {gaSenior} statt CHF {gaPrice} für das GA Erwachsene. Mit der AHV-Reform steigt das Rentenalter der Frauen schrittweise auf 65. Ob sich das auf das GA Senior auswirkt, prüfst du am besten bei den SBB.',
    },
    {
      q: 'Was kostet mein Hund im Zug?',
      a: 'Kleine Hunde bis 30 cm Schulterhöhe reisen gratis, wenn sie in einer Tasche oder einem Korb mitfahren. Grössere Hunde brauchen ein Billett zum halben Preis der 2. Klasse oder eine Hunde-Tageskarte für CHF 25. Wer oft mit Hund unterwegs ist, nimmt den Hunde-Pass für CHF 60 pro Monat oder CHF 350 pro Jahr. Den Jahres-Pass kannst du im Rechner bei den zusätzlichen Einstellungen auswählen.',
    },
    {
      q: 'Was kostet mein Velo im Zug?',
      a: 'Für einen Tag brauchst du eine Velo-Tageskarte für CHF 15. Mit dem Velo-Pass für CHF 260 pro Jahr nimmst du dein Velo so oft mit, wie du willst. Den Velo-Pass kannst du im Rechner bei den zusätzlichen Einstellungen auswählen.',
    },
    {
      q: 'Woher kenne ich meine jährlichen Fahrkosten?',
      a: 'Du kannst deine Strecken einzeln eingeben oder direkt einen Jahresbetrag eintragen. Am genauesten ist die Bestellhistorie auf sbb.ch: Dort lädst du deine Käufe für einen Zeitraum, etwa ein Jahr, als PDF herunter und lädst sie im Rechner hoch. Die PDF wird in deinem Browser ausgewertet.',
    },
    {
      q: 'Was berücksichtigt der Rechner nicht?',
      a: 'Der Rechner arbeitet mit regulären Billettpreisen und bildet Sparbillette und Sonderangebote nicht ab. Wenn du häufig Sparbillette nutzt, sind deine echten Fahrkosten tiefer, und ein Halbtax oder gar kein Abo kann besser sein, als der Rechner zeigt. Auch der Zusatznutzen des GA fliesst nicht in die Rechnung ein.',
    },
    {
      q: 'Gilt der Rechner auch für Jugendliche und Seniorinnen und Senioren?',
      a: 'Ja. Du wählst die Altersgruppe (Kind, Jugend, 25-Jährige, Erwachsene, Senioren, Reisende mit Behinderung) und die Klasse. Die Preise werden entsprechend angepasst.',
    },
    {
      q: 'Werden meine Daten gespeichert?',
      a: 'Nein. Alle Berechnungen laufen in deinem Browser. Deine Strecken und hochgeladenen PDFs werden nicht an einen Server gesendet. Für eine anonyme Besuchsstatistik wird Umami ohne Cookies eingesetzt.',
    },
    {
      q: 'Ist das ein offizielles Angebot der SBB?',
      a: 'Nein. Travelcards.ch ist ein unabhängiges, kostenloses Projekt von Sirin Dudler und nicht mit den SBB verbunden. Die Ergebnisse sind Schätzungen. Prüfe die verbindlichen Preise und Bedingungen immer auf sbb.ch.',
    },
  ],
};

const en: FaqSection = {
  title: 'Frequently asked questions',
  items: [
    {
      q: 'Is the GA Travelcard still worth it in 2027?',
      a: 'For frequent travellers usually yes, but the break-even point is rising. From 13 December 2026 the adult GA in 2nd class costs CHF 4’095 instead of CHF 3’995, and according to media reports the Half Fare Card (Halbtax) rises by about CHF 5. Until now the GA beat a Halbtax plus regular tickets from just over CHF 7’600 of travel per year; it is expected to move to around CHF 7’800. The extra benefits of the GA (depending on the region, e.g. city transport, boats, PostBus) are not included. The best way to know is to run your own trips through the calculator above.',
    },
    {
      q: 'What changes in SBB prices on 13 December 2026?',
      a: 'With the timetable change, prices in national direct transport (including GA and Halbtax) rise by 3.6 percent on average. The industry had first planned 3.9 percent. After the Swiss Price Supervisor intervened, the GA increase is smaller: the adult GA in 2nd class costs CHF 4’095 (CHF 4’195 had been planned), in 1st class CHF 6’770 instead of CHF 6’520. Children, young people and families are meant to be spared or only slightly affected. Regional fare networks set their own prices. The price shown on sbb.ch at the time of purchase is the binding one.',
    },
    {
      q: 'Should I renew my subscription before the price increase?',
      a: 'The tariff at the time of purchase applies. Whether buying early pays off depends on when your current subscription ends and whether SBB allows a renewal that early, so check directly with SBB. More important than timing is which subscription suits you at all. Run the calculator first.',
    },
    {
      q: 'At what travel costs does the Halbtax pay off?',
      a: 'The Halbtax currently costs adults CHF {htPrice} (new purchase) and gives you 50% off most tickets. It pays off as soon as you would buy more than about CHF {htBreakeven} of regular tickets per year.',
    },
    {
      q: 'How much is the Halbtax for young people and adults?',
      a: 'Young people aged 16 to 24 currently pay CHF {htYouth} (new purchase) or CHF {htYouthLoyal} at the loyalty price; adults from 25 pay CHF {htPrice} or CHF {htLoyal}. You get the loyalty price when your Halbtax renews automatically or when you switch directly from a GA. The Halbtax renews automatically every year until you cancel it.',
    },
    {
      q: 'When is the GA cheaper than the Halbtax?',
      a: 'With a Halbtax you pay CHF {htPrice} plus half of your travel costs. The adult GA in 2nd class currently costs CHF {gaPrice}. On paper the GA therefore pays off from about CHF {gaBreakeven} of travel per year (measured at regular ticket prices without a subscription). The extra benefits of the GA are not included and lower the threshold in practice.',
    },
    {
      q: 'Can I pay for the GA monthly?',
      a: 'Yes. The adult GA in 2nd class currently costs CHF {gaMonthly} per month with monthly payment. The minimum term is six months; after that you can cancel at the end of any month with one month’s notice. Over a full year, paying annually is cheaper. If you only need the GA for {gaMonthsBreakeven} months or fewer, monthly payment is the better deal. The calculator takes this into account when you enter a shorter duration for your routes.',
    },
    {
      q: 'Can I pause my GA, for example during holidays?',
      a: 'Yes, this is called depositing your GA. You can deposit it free of charge online at swisspass.ch for at least 5 and at most 30 days per subscription year. During that time it is blocked, and the amount is credited on your next invoice. Not every GA type can be deposited; the GA for apprentices, for example, cannot.',
    },
    {
      q: 'Is the Halbtax PLUS also available for adults?',
      a: 'Yes, the Halbtax PLUS is available for young people and for adults. Adults pay CHF {hp1000} for CHF 1’000 of credit, CHF {hp2000} for CHF 2’000 or CHF {hp3000} for CHF 3’000. Young people get a larger bonus. You use the credit to pay for tickets at the Halbtax price. Important: the Halbtax itself is not included and must be bought separately. When the credit runs out it tops up automatically. If some is left at the end of the year, you get the rest back up to the amount you paid in; the bonus expires. The calculator takes all of this into account and compares the three packages.',
    },
    {
      q: 'What is the GA Night?',
      a: 'The GA Night is for young people under 25. It costs CHF {gaNight} per year and is valid in 2nd class for journeys between 7 pm and 5 am, at weekends until 7 am. The night supplement is not included, and the pass does not renew automatically. In the calculator you can mark a route as travelled only during GA Night hours.',
    },
    {
      q: 'Up to what age does my child travel for free?',
      a: 'Children under 6 travel free in Switzerland, even on their own. From 6 until their 16th birthday, children pay half price. With the Junior Travelcard for CHF 30 per year they travel free when accompanied by a parent. For grandparents, godparents or other companions there is the Children’s Co-Travel Card, also CHF 30 per year and child. Both cards are stored on the child’s SwissPass. The accompanying adult needs a valid ticket or travelcard.',
    },
    {
      q: 'From what age can I get the GA Senior?',
      a: 'The GA Senior is currently available to women from 64 and men from 65. In 2nd class it currently costs CHF {gaSenior} instead of CHF {gaPrice} for the adult GA. With the AHV pension reform, the retirement age for women is gradually rising to 65. Check with SBB whether this affects the GA Senior.',
    },
    {
      q: 'How much does my dog cost on the train?',
      a: 'Small dogs up to 30 cm shoulder height travel free in a bag or basket. Larger dogs need a ticket at half the 2nd-class fare or a Dog Day Pass for CHF 25. If you often travel with your dog, the Dog Pass costs CHF 60 per month or CHF 350 per year. You can select the annual pass in the calculator’s additional settings.',
    },
    {
      q: 'How much does my bike cost on the train?',
      a: 'For one day you need a Bike Day Pass for CHF 15. With the Bike Pass for CHF 260 per year you can take your bike as often as you like. You can select the Bike Pass in the calculator’s additional settings.',
    },
    {
      q: 'How do I find out my yearly travel costs?',
      a: 'You can enter your routes one by one or type in a yearly amount directly. The most accurate source is the order history on sbb.ch: download your purchases for a period, for example one year, as a PDF and upload it to the calculator. The PDF is processed in your browser.',
    },
    {
      q: 'What does the calculator not take into account?',
      a: 'The calculator uses regular ticket prices and does not model saver tickets or special offers. If you often use saver tickets, your real travel costs are lower, and a Halbtax or no subscription at all can be better than the calculator shows. The extra benefits of the GA are not part of the calculation either.',
    },
    {
      q: 'Does it work for young people and seniors too?',
      a: 'Yes. You choose the age group (child, youth, 25-year-olds, adults, seniors, travellers with a disability) and the travel class. Prices are adjusted accordingly.',
    },
    {
      q: 'Is my data stored?',
      a: 'No. All calculations run in your browser. Your routes and uploaded PDFs are not sent to a server. Anonymous visit statistics are collected with Umami, without cookies.',
    },
    {
      q: 'Is this an official SBB service?',
      a: 'No. Travelcards.ch is an independent, free project by Sirin Dudler and is not affiliated with SBB. Results are estimates. Always check binding prices and conditions on sbb.ch.',
    },
  ],
};

const fr: FaqSection = {
  title: 'Questions fréquentes',
  items: [
    {
      q: "L'AG vaut-il encore la peine en 2027 ?",
      a: "Pour les grands voyageurs, généralement oui, mais le seuil de rentabilité augmente. Dès le 13 décembre 2026, l'AG adulte en 2e classe coûte CHF 4’095 au lieu de CHF 3’995, et selon la presse le demi-tarif augmente d'environ CHF 5. Jusqu'ici, l'AG était plus avantageux qu'un demi-tarif avec des billets normaux à partir d'un peu plus de CHF 7’600 de frais de voyage par an ; le seuil devrait passer à environ CHF 7’800. Les avantages supplémentaires de l'AG (selon la région, p. ex. transports urbains, bateaux, CarPostal) ne sont pas inclus. Le mieux est de calculer vos propres trajets avec le calculateur ci-dessus.",
    },
    {
      q: 'Que changera dans les prix CFF le 13 décembre 2026 ?',
      a: "Avec le changement d'horaire, les prix du trafic direct national (dont l'AG et le demi-tarif) augmentent de 3,6 % en moyenne. La branche avait d'abord prévu 3,9 %. Après l'intervention du Surveillant des prix, la hausse de l'AG est plus faible : l'AG adulte en 2e classe coûte CHF 4’095 (CHF 4’195 étaient prévus), en 1re classe CHF 6’770 au lieu de CHF 6’520. Les enfants, les jeunes et les familles ne devraient pas ou peu être touchés. Les communautés tarifaires régionales fixent leurs propres prix. Le prix affiché sur cff.ch au moment de l'achat fait foi.",
    },
    {
      q: "Dois-je renouveler mon abonnement avant la hausse des prix ?",
      a: "C'est le tarif au moment de l'achat qui s'applique. Savoir si un achat anticipé vaut la peine dépend de la date d'expiration de votre abonnement actuel et de la possibilité de le renouveler si tôt auprès des CFF ; renseignez-vous directement auprès d'eux. Plus important que le moment : quel abonnement vous convient vraiment. Lancez d'abord le calculateur.",
    },
    {
      q: 'À partir de quels frais de voyage le demi-tarif est-il rentable ?',
      a: "Le demi-tarif coûte actuellement CHF {htPrice} pour les adultes (nouvel achat) et vous donne 50 % de réduction sur la plupart des billets. Il est rentable dès que vous achèteriez pour plus d'environ CHF {htBreakeven} de billets normaux par an.",
    },
    {
      q: 'Combien coûte le demi-tarif pour les jeunes et les adultes ?',
      a: "Les jeunes de 16 à 24 ans paient actuellement CHF {htYouth} (nouvel achat) ou CHF {htYouthLoyal} au prix de fidélité ; les adultes dès 25 ans CHF {htPrice} ou CHF {htLoyal}. Vous obtenez le prix de fidélité lorsque votre demi-tarif se renouvelle automatiquement ou si vous passez directement d'un AG au demi-tarif. Le demi-tarif se renouvelle automatiquement chaque année jusqu'à ce que vous le résiliiez.",
    },
    {
      q: "Quand l'AG est-il plus avantageux que le demi-tarif ?",
      a: "Avec un demi-tarif, vous payez CHF {htPrice} plus la moitié de vos frais de voyage. L'AG adulte en 2e classe coûte actuellement CHF {gaPrice}. Sur le papier, l'AG est donc rentable à partir d'environ CHF {gaBreakeven} de frais de voyage par an (au prix des billets normaux sans abonnement). Les avantages supplémentaires de l'AG ne sont pas inclus et abaissent ce seuil en pratique.",
    },
    {
      q: "Puis-je payer l'AG mensuellement ?",
      a: "Oui. L'AG adulte en 2e classe coûte actuellement CHF {gaMonthly} par mois en paiement mensuel. La durée minimale du contrat est de six mois ; ensuite, vous pouvez résilier pour la fin de chaque mois d'abonnement avec un mois de préavis. Sur une année complète, le paiement annuel est plus avantageux. Si vous n'avez besoin de l'AG que {gaMonthsBreakeven} mois ou moins, le paiement mensuel est plus intéressant. Le calculateur en tient compte si vous indiquez une durée plus courte pour vos trajets.",
    },
    {
      q: "Puis-je mettre mon AG en pause, par exemple pendant les vacances ?",
      a: "Oui, il s'agit du dépôt de l'AG. Vous pouvez déposer votre AG gratuitement en ligne sur swisspass.ch pendant au moins 5 et au plus 30 jours par année d'abonnement. Pendant cette période, il est bloqué et le montant est crédité sur votre prochaine facture. Tous les types d'AG ne peuvent pas être déposés, par exemple l'AG pour apprentis.",
    },
    {
      q: 'Le demi-tarif Plus existe-t-il aussi pour les adultes ?',
      a: "Oui, le demi-tarif Plus existe pour les jeunes et pour les adultes. Les adultes paient CHF {hp1000} pour CHF 1’000 de crédit, CHF {hp2000} pour CHF 2’000 ou CHF {hp3000} pour CHF 3’000. Les jeunes reçoivent un bonus plus élevé. Le crédit sert à payer vos billets au prix demi-tarif. Important : le demi-tarif lui-même n'est pas inclus et doit être acheté séparément. Quand le crédit est épuisé, il se recharge automatiquement. S'il en reste à la fin de l'année, le solde vous est remboursé jusqu'à concurrence du montant versé ; le bonus est perdu. Le calculateur tient compte de tout cela et compare les trois forfaits.",
    },
    {
      q: "Qu'est-ce que l'AG Night ?",
      a: "L'AG Night s'adresse aux jeunes de moins de 25 ans. Il coûte CHF {gaNight} par an et est valable en 2e classe pour les trajets entre 19 h et 5 h, le week-end jusqu'à 7 h. Le supplément de nuit n'est pas compris et l'abonnement ne se renouvelle pas automatiquement. Dans le calculateur, vous pouvez indiquer qu'un trajet est effectué uniquement pendant les heures AG Night.",
    },
    {
      q: "Jusqu'à quel âge mon enfant voyage-t-il gratuitement ?",
      a: "Les enfants de moins de 6 ans voyagent gratuitement en Suisse, même seuls. De 6 ans jusqu'à leur 16e anniversaire, ils paient demi-tarif. Avec la Carte Junior à CHF 30 par an, ils voyagent gratuitement lorsqu'ils sont accompagnés d'un parent. Pour les grands-parents, parrains, marraines ou autres accompagnants, il existe la Carte Enfant accompagné, également à CHF 30 par an et par enfant. Les deux cartes sont enregistrées sur le SwissPass de l'enfant. L'accompagnant doit lui-même avoir un billet ou un abonnement valable.",
    },
    {
      q: "À partir de quel âge peut-on obtenir l'AG Senior ?",
      a: "L'AG Senior est actuellement disponible pour les femmes dès 64 ans et pour les hommes dès 65 ans. En 2e classe, il coûte actuellement CHF {gaSenior} au lieu de CHF {gaPrice} pour l'AG adulte. Avec la réforme AVS, l'âge de la retraite des femmes passe progressivement à 65 ans. Renseignez-vous auprès des CFF pour savoir si cela concerne l'AG Senior.",
    },
    {
      q: 'Combien coûte mon chien dans le train ?',
      a: "Les petits chiens jusqu'à 30 cm au garrot voyagent gratuitement dans un sac ou un panier. Les chiens plus grands ont besoin d'un billet au demi-prix de la 2e classe ou d'une carte journalière Chien à CHF 25. Si vous voyagez souvent avec votre chien, l'abonnement Chien coûte CHF 60 par mois ou CHF 350 par an. Vous pouvez sélectionner l'abonnement annuel dans les paramètres supplémentaires du calculateur.",
    },
    {
      q: 'Combien coûte mon vélo dans le train ?',
      a: "Pour une journée, il vous faut une carte journalière Vélo à CHF 15. Avec l'abonnement Vélo à CHF 260 par an, vous emportez votre vélo aussi souvent que vous le souhaitez. Vous pouvez sélectionner l'abonnement Vélo dans les paramètres supplémentaires du calculateur.",
    },
    {
      q: 'Comment connaître mes frais de voyage annuels ?',
      a: "Vous pouvez saisir vos trajets un par un ou indiquer directement un montant annuel. La source la plus précise est l'historique des commandes sur cff.ch : téléchargez vos achats pour une période, par exemple un an, au format PDF et importez-le dans le calculateur. Le PDF est traité dans votre navigateur.",
    },
    {
      q: 'Que ne prend pas en compte le calculateur ?',
      a: "Le calculateur utilise les prix normaux des billets et ne tient pas compte des billets dégriffés ni des offres spéciales. Si vous utilisez souvent ces billets, vos frais réels sont plus bas, et un demi-tarif ou aucun abonnement peut être plus avantageux que ce que montre le calculateur. Les avantages supplémentaires de l'AG ne sont pas non plus pris en compte.",
    },
    {
      q: 'Le calculateur convient-il aussi aux jeunes et aux seniors ?',
      a: "Oui. Vous choisissez la catégorie d'âge (enfant, jeune, 25 ans, adulte, senior, voyageur en situation de handicap) et la classe. Les prix sont adaptés en conséquence.",
    },
    {
      q: 'Mes données sont-elles enregistrées ?',
      a: "Non. Tous les calculs s'effectuent dans votre navigateur. Vos trajets et les PDF importés ne sont pas envoyés à un serveur. Une statistique de visites anonyme est collectée avec Umami, sans cookies.",
    },
    {
      q: 'Est-ce une offre officielle des CFF ?',
      a: "Non. Travelcards.ch est un projet indépendant et gratuit de Sirin Dudler, sans lien avec les CFF. Les résultats sont des estimations. Vérifiez toujours les prix et conditions officiels sur cff.ch.",
    },
  ],
};

const it: FaqSection = {
  title: 'Domande frequenti',
  items: [
    {
      q: "Conviene ancora l'AG nel 2027?",
      a: "Per chi viaggia molto di solito sì, ma la soglia di convenienza sale. Dal 13 dicembre 2026 l'AG per adulti in 2ª classe costa CHF 4’095 invece di CHF 3’995 e, secondo i media, il metà-prezzo aumenta di circa CHF 5. Finora l'AG conveniva rispetto al metà-prezzo con biglietti normali da poco più di CHF 7’600 di spese di viaggio all'anno; la soglia dovrebbe salire a circa CHF 7’800. I vantaggi aggiuntivi dell'AG (a seconda della regione, ad es. trasporti urbani, battelli, AutoPostale) non sono inclusi. Il modo migliore è calcolare i propri viaggi con il calcolatore qui sopra.",
    },
    {
      q: 'Cosa cambia nei prezzi FFS il 13 dicembre 2026?',
      a: "Con il cambio d'orario i prezzi del traffico diretto nazionale (tra cui AG e metà-prezzo) aumentano in media del 3,6 per cento. Il settore aveva previsto inizialmente il 3,9 per cento. Dopo l'intervento del Sorvegliante dei prezzi, l'aumento dell'AG è inferiore: l'AG per adulti in 2ª classe costa CHF 4’095 (erano previsti CHF 4’195), in 1ª classe CHF 6’770 invece di CHF 6’520. Bambini, giovani e famiglie non dovrebbero essere toccati o solo in misura ridotta. Le comunità tariffali regionali stabiliscono i propri prezzi. Fa fede il prezzo indicato su ffs.ch al momento dell'acquisto.",
    },
    {
      q: "Devo rinnovare l'abbonamento prima dell'aumento dei prezzi?",
      a: "Vale la tariffa al momento dell'acquisto. Se un acquisto anticipato convenga dipende da quando scade il tuo abbonamento attuale e se le FFS permettono un rinnovo così in anticipo: verifica direttamente con loro. Più importante del momento è capire quale abbonamento fa davvero per te. Usa prima il calcolatore.",
    },
    {
      q: 'Da quali spese di viaggio conviene il metà-prezzo?',
      a: "Il metà-prezzo costa attualmente CHF {htPrice} per gli adulti (primo acquisto) e ti dà il 50 % di sconto sulla maggior parte dei biglietti. Conviene non appena acquisteresti più di circa CHF {htBreakeven} di biglietti normali all'anno.",
    },
    {
      q: 'Quanto costa il metà-prezzo per giovani e adulti?',
      a: "I giovani dai 16 ai 24 anni pagano attualmente CHF {htYouth} (primo acquisto) o CHF {htYouthLoyal} al prezzo fedeltà; gli adulti dai 25 anni CHF {htPrice} o CHF {htLoyal}. Ottieni il prezzo fedeltà quando il tuo metà-prezzo si rinnova automaticamente o se passi direttamente da un AG. Il metà-prezzo si rinnova automaticamente ogni anno finché non lo disdici.",
    },
    {
      q: "Quando l'AG conviene più del metà-prezzo?",
      a: "Con il metà-prezzo paghi CHF {htPrice} più la metà delle tue spese di viaggio. L'AG per adulti in 2ª classe costa attualmente CHF {gaPrice}. Sulla carta l'AG conviene quindi da circa CHF {gaBreakeven} di spese di viaggio all'anno (ai prezzi normali dei biglietti senza abbonamento). I vantaggi aggiuntivi dell'AG non sono inclusi e in pratica abbassano la soglia.",
    },
    {
      q: "Posso pagare l'AG mensilmente?",
      a: "Sì. L'AG per adulti in 2ª classe costa attualmente CHF {gaMonthly} al mese con pagamento mensile. La durata minima del contratto è di sei mesi; dopo puoi disdire per la fine di ogni mese d'abbonamento con un mese di preavviso. Su un anno intero il pagamento annuale è più conveniente. Se ti serve l'AG solo per {gaMonthsBreakeven} mesi o meno, il pagamento mensile conviene di più. Il calcolatore ne tiene conto se indichi una durata più breve per i tuoi percorsi.",
    },
    {
      q: "Posso sospendere il mio AG, ad esempio durante le vacanze?",
      a: "Sì, si chiama deposito dell'AG. Puoi depositare il tuo AG gratuitamente online su swisspass.ch per almeno 5 e al massimo 30 giorni per anno d'abbonamento. Durante questo periodo è bloccato e l'importo ti viene accreditato sulla fattura successiva. Non tutti i tipi di AG si possono depositare, ad esempio l'AG per apprendisti.",
    },
    {
      q: 'Il metà-prezzo Plus esiste anche per gli adulti?',
      a: "Sì, il metà-prezzo Plus esiste per giovani e adulti. Gli adulti pagano CHF {hp1000} per CHF 1’000 di credito, CHF {hp2000} per CHF 2’000 o CHF {hp3000} per CHF 3’000. I giovani ricevono un bonus maggiore. Con il credito paghi i biglietti al prezzo metà-prezzo. Importante: il metà-prezzo stesso non è incluso e va acquistato separatamente. Quando il credito si esaurisce, si ricarica automaticamente. Se a fine anno ne rimane una parte, ti viene rimborsata fino all'importo versato; il bonus decade. Il calcolatore tiene conto di tutto questo e confronta i tre pacchetti.",
    },
    {
      q: "Cos'è l'AG Notte?",
      a: "L'AG Notte è pensato per i giovani sotto i 25 anni. Costa CHF {gaNight} all'anno ed è valido in 2ª classe per i viaggi tra le 19 e le 5, nel fine settimana fino alle 7. Il supplemento notturno non è incluso e l'abbonamento non si rinnova automaticamente. Nel calcolatore puoi indicare che un percorso viene fatto solo negli orari dell'AG Notte.",
    },
    {
      q: 'Fino a che età mio figlio viaggia gratis?',
      a: "I bambini sotto i 6 anni viaggiano gratis in Svizzera, anche da soli. Dai 6 anni fino al 16° compleanno pagano metà prezzo. Con la Carta Junior a CHF 30 all'anno viaggiano gratis se accompagnati da un genitore. Per nonni, padrini, madrine o altri accompagnatori c'è la Carta accompagnamento per bambini, anch'essa a CHF 30 all'anno per bambino. Entrambe le carte vengono salvate sullo SwissPass del bambino. L'accompagnatore deve avere a sua volta un biglietto o un abbonamento valido.",
    },
    {
      q: "Da che età si può avere l'AG Senior?",
      a: "L'AG Senior è attualmente disponibile per le donne dai 64 anni e per gli uomini dai 65. In 2ª classe costa attualmente CHF {gaSenior} invece di CHF {gaPrice} dell'AG per adulti. Con la riforma AVS l'età di pensionamento delle donne sale gradualmente a 65 anni. Verifica con le FFS se questo ha effetti sull'AG Senior.",
    },
    {
      q: 'Quanto costa il mio cane in treno?',
      a: "I cani piccoli fino a 30 cm al garrese viaggiano gratis in una borsa o in un cesto. I cani più grandi hanno bisogno di un biglietto a metà prezzo della 2ª classe o di una carta giornaliera per cani a CHF 25. Se viaggi spesso con il cane, l'abbonamento cani costa CHF 60 al mese o CHF 350 all'anno. Puoi selezionare l'abbonamento annuale nelle impostazioni aggiuntive del calcolatore.",
    },
    {
      q: 'Quanto costa la mia bici in treno?',
      a: "Per un giorno ti serve una carta giornaliera bici a CHF 15. Con l'abbonamento bici a CHF 260 all'anno porti la bici con te tutte le volte che vuoi. Puoi selezionare l'abbonamento bici nelle impostazioni aggiuntive del calcolatore.",
    },
    {
      q: 'Come scopro le mie spese di viaggio annue?',
      a: "Puoi inserire i tuoi percorsi uno per uno oppure indicare direttamente un importo annuo. La fonte più precisa è lo storico degli ordini su ffs.ch: scarica i tuoi acquisti per un periodo, ad esempio un anno, in formato PDF e caricalo nel calcolatore. Il PDF viene elaborato nel tuo browser.",
    },
    {
      q: 'Cosa non considera il calcolatore?',
      a: "Il calcolatore usa i prezzi normali dei biglietti e non considera i biglietti risparmio né le offerte speciali. Se li usi spesso, le tue spese reali sono più basse e un metà-prezzo o nessun abbonamento può convenire più di quanto mostri il calcolatore. Anche i vantaggi aggiuntivi dell'AG non rientrano nel calcolo.",
    },
    {
      q: 'Vale anche per giovani e anziani?',
      a: "Sì. Scegli la fascia d'età (bambino, giovane, 25 anni, adulto, senior, persona con disabilità) e la classe. I prezzi vengono adattati di conseguenza.",
    },
    {
      q: 'I miei dati vengono salvati?',
      a: "No. Tutti i calcoli avvengono nel tuo browser. I tuoi percorsi e i PDF caricati non vengono inviati a un server. Le statistiche anonime delle visite sono raccolte con Umami, senza cookie.",
    },
    {
      q: "È un'offerta ufficiale delle FFS?",
      a: "No. Travelcards.ch è un progetto indipendente e gratuito di Sirin Dudler e non è collegato alle FFS. I risultati sono stime. Verifica sempre i prezzi e le condizioni ufficiali su ffs.ch.",
    },
  ],
};

// Romansh falls back to German for now.
export const faqContent: Record<Language, FaqSection> = { de, en, fr, it, rm: de };
