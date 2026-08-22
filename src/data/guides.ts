export type GuideSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Guide = {
  slug: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  readingTime: string;
  updated: string;
  intro: string;
  sections: GuideSection[];
};

export const categoryLabels: Record<string, string> = {
  bygga: "Bygga",
  renovera: "Renovera",
  underhalla: "Underhålla",
  "kopa-bostad": "Köpa & sälja",
  ekonomi: "Ekonomi",
  energi: "Energi",
};

export const guides: Guide[] = [
  {
    slug: "byta-tak",
    category: "renovera",
    categoryLabel: "Renovera",
    title: "Byta tak – kostnad, material och arbetsgång",
    description: "En komplett guide till takbyte: livslängd, kostnader, materialval, offerter och vad du behöver kontrollera.",
    readingTime: "12 min",
    updated: "22 augusti 2026",
    intro: "Ett takbyte är en av husets största investeringar. Med rätt förarbete blir det enklare att jämföra offerter, undvika överraskningar och välja en lösning som håller länge.",
    sections: [
      {
        heading: "När behöver taket bytas?",
        paragraphs: ["Takets ålder är bara en del av bedömningen. Leta efter spruckna pannor, rost, sliten papp, fukt på vinden och missfärgningar kring genomföringar.", "Gör gärna en visuell kontroll vår och höst. Misstänker du läckage bör en fackman undersöka både yttertak, underlag och ventilation."],
        bullets: ["Betongpannor: ofta 30–50 år", "Tegelpannor: ofta 50 år eller mer", "Takpapp: ofta 20–30 år", "Plåttak: ofta 40–60 år"],
      },
      {
        heading: "Vad kostar ett takbyte?",
        paragraphs: ["Priset påverkas av takets storlek, lutning, material, åtkomlighet och hur mycket av underlaget som måste bytas. Räkna på hela entreprenaden – inte bara priset per kvadratmeter.", "Be om en specificerad offert där rivning, ställning, plåt, avfall, material och eventuella tillägg framgår."],
        bullets: ["Kontrollera om moms och ROT-avdrag är inkluderade", "Begär fast pris eller tydliga enhetspriser", "Avsätt en reserv för skadat virke", "Jämför garantier och betalningsplan"],
      },
      {
        heading: "Så går arbetet till",
        paragraphs: ["Arbetet börjar normalt med ställning och väderskydd. Därefter rivs det gamla taket, underlaget kontrolleras och ny papp, läkt, plåt och taktäckning monteras.", "Slutbesiktning och dokumentation är viktiga. Spara foton, garantier, produktblad och fakturor i Mitt BoLiv."],
      },
    ],
  },
  {
    slug: "renovera-badrum-kostnad",
    category: "renovera",
    categoryLabel: "Renovera",
    title: "Vad kostar det att renovera ett badrum?",
    description: "Så gör du en realistisk badrumsbudget och jämför offerter utan att missa de kostsamma detaljerna.",
    readingTime: "10 min",
    updated: "22 augusti 2026",
    intro: "Badrumsrenoveringar skiljer sig mycket i pris. Storlek, material, rördragning och underlagets skick påverkar mer än många räknar med.",
    sections: [
      {
        heading: "Det här styr priset",
        paragraphs: ["Arbetskostnaden är ofta den största posten. Att behålla planlösning och golvbrunnens placering är vanligtvis billigare än att flytta installationer."],
        bullets: ["Rivning och bortforsling", "VVS och el", "Tätskikt och plattsättning", "Inredning, porslin och blandare", "Eventuella fukt- eller konstruktionsskador"],
      },
      {
        heading: "Krav på utförandet",
        paragraphs: ["Anlita företag som arbetar enligt aktuella svenska branschregler och kontrollera behörigheter. Be om kvalitetsdokument och fotografering av dolda moment.", "Informera försäkringsbolaget om du är osäker på deras krav. Dokumentationen kan vara avgörande vid en framtida skada eller försäljning."],
      },
      {
        heading: "Bygg en trygg budget",
        paragraphs: ["Dela upp budgeten i arbete, material och reserv. En reserv på 10–15 procent ger bättre marginal för fel som upptäcks efter rivningen.", "Bestäm vem som ansvarar för material, samordning och förseningar innan avtalet skrivs."],
      },
    ],
  },
  {
    slug: "checklista-husvisning",
    category: "kopa-bostad",
    categoryLabel: "Köpa & sälja",
    title: "Checklista för husvisningen",
    description: "Kontrollera rätt saker på visningen och få ett bättre underlag inför besiktning och budgivning.",
    readingTime: "8 min",
    updated: "22 augusti 2026",
    intro: "På en visning är det lätt att fastna för planlösningen och känslan. Den här checklistan hjälper dig att också se husets skick, risker och framtida kostnader.",
    sections: [
      {
        heading: "Utanför huset",
        paragraphs: ["Börja med tomten och klimatskalet. Titta på marklutning, dagvatten, grund, fasad, fönster och tak från flera vinklar."],
        bullets: ["Lutar marken bort från huset?", "Finns sprickor eller missfärgningar?", "Hur gamla är tak och fönster?", "Finns stående vatten eller fuktig mark?"],
      },
      {
        heading: "Invändigt",
        paragraphs: ["Använd syn, lukt och känsel. Instängd lukt, nyligen målade begränsade ytor eller sviktande golv kan motivera fler frågor."],
        bullets: ["Våtutrymmen och golvbrunnar", "Vind och krypgrund om de är åtkomliga", "Elcentral och synliga installationer", "Ventilation och uppvärmningssystem"],
      },
      {
        heading: "Efter visningen",
        paragraphs: ["Läs besiktningsprotokoll, energideklaration och frågelista i lugn och ro. Som köpare har du undersökningsplikt och kan behöva beställa en egen fördjupad undersökning.", "Gör en fem- eller tioårsbudget för väntat underhåll innan du sätter ditt högsta bud."],
      },
    ],
  },
  {
    slug: "underhallsplan-villa",
    category: "underhalla",
    categoryLabel: "Underhålla",
    title: "Skapa en underhållsplan för villan",
    description: "Planera återkommande kontroller och större åtgärder så att kostnaderna inte kommer som en överraskning.",
    readingTime: "9 min",
    updated: "22 augusti 2026",
    intro: "En enkel underhållsplan ger kontroll över både huset och ekonomin. Börja med nuläget och lägg sedan in återkommande kontroller.",
    sections: [
      {
        heading: "Inventera huset",
        paragraphs: ["Lista byggnadsdelarnas ålder, skick och förväntade livslängd. Börja med tak, fasad, grund, fönster, våtrum, värme och ventilation."],
      },
      {
        heading: "Prioritera rätt",
        paragraphs: ["Åtgärder som skyddar huset från vatten, brand och följdskador ska gå före kosmetiska förbättringar."],
        bullets: ["Akut: risk för person- eller vattenskada", "Inom ett år: tydligt slitage eller brist", "På sikt: planerad förnyelse", "Återkommande: rengöring, service och kontroll"],
      },
      {
        heading: "Följ upp varje år",
        paragraphs: ["Gå igenom planen en gång per år och efter större oväder eller renoveringar. Registrera utförda åtgärder, kostnader och dokument i Mitt BoLiv."],
      },
    ],
  },
  {
    slug: "valja-varmepump",
    category: "energi",
    categoryLabel: "Energi",
    title: "Välja värmepump till huset",
    description: "Jämför bergvärme, luft-vatten och luft-luft utifrån husets behov, system och förutsättningar.",
    readingTime: "11 min",
    updated: "22 augusti 2026",
    intro: "Rätt värmepump beror på husets energibehov, befintliga värmesystem, tomten och klimatet. Börja med en energiberäkning – inte med en viss produkt.",
    sections: [
      {
        heading: "Tre vanliga alternativ",
        paragraphs: ["Bergvärme passar ofta hus med vattenburen värme och stort energibehov. Luft-vatten kräver ingen borrning. Luft-luft är billigare att installera men värmer normalt inte tappvarmvatten."],
      },
      {
        heading: "Dimensionering är avgörande",
        paragraphs: ["En för liten anläggning ger hög tillskottsel när det är kallt. En onödigt stor anläggning kan bli dyrare utan motsvarande besparing."],
        bullets: ["Årlig energianvändning", "Husets isolering och boyta", "Radiatorernas temperaturbehov", "Klimatzon och dimensionerande utetemperatur"],
      },
      {
        heading: "Jämför hela kalkylen",
        paragraphs: ["Räkna på investering, uppskattad besparing, service, livslängd och finansiering. Be installatören redovisa antaganden och förväntad mängd tillskottsel."],
      },
    ],
  },
  {
    slug: "budget-for-renovering",
    category: "ekonomi",
    categoryLabel: "Ekonomi",
    title: "Så gör du en hållbar renoveringsbudget",
    description: "Planera kostnader, reserv och betalningar innan projektet startar.",
    readingTime: "7 min",
    updated: "22 augusti 2026",
    intro: "En bra budget är mer än summan i offerten. Den visar vilka beslut som driver kostnaden och hur mycket marginal projektet behöver.",
    sections: [
      {
        heading: "Dela upp kostnaderna",
        paragraphs: ["Separera arbete, material, projektering, lov, transporter och oförutsett. Då blir offerter enklare att jämföra."],
      },
      {
        heading: "Sätt en reserv",
        paragraphs: ["Äldre hus och arbeten bakom ytskikt innebär större osäkerhet. Lägg normalt undan 10–20 procent beroende på projektets risk."],
      },
      {
        heading: "Koppla betalning till resultat",
        paragraphs: ["Undvik stora förskott. Använd en betalningsplan kopplad till tydliga, kontrollerbara delmoment och håll inne en rimlig del till godkänd slutkontroll."],
        bullets: ["Skriftlig omfattning", "Start- och slutdatum", "Regler för ändringar och tillägg", "Dokumentation och garantier"],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function getGuidesByCategory(category: string) {
  return guides.filter((guide) => guide.category === category);
}
