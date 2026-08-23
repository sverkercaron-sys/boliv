import { housingGuides } from "@/data/housing";
import { technicalGuides } from "@/data/technical";

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
  sources?: { label: string; url: string }[];
};

import { lifestyleGuides } from "@/data/lifestyle";

export const categoryLabels: Record<string, string> = {
  bygga: "Bygga",
  renovera: "Renovera",
  underhalla: "Underhålla",
  "kopa-bostad": "Köpa & sälja",
  ekonomi: "Ekonomi",
  energi: "Energi",
  installationer: "El, VVS & teknik",
  tradgard: "Trädgård",
  fritidshus: "Fritidshus",
  juridik: "Juridik & trygghet",
};

export const guides: Guide[] = [
  ...housingGuides,
  ...lifestyleGuides,
  ...technicalGuides,
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
    updated: "23 augusti 2026",
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
    sources: [
      { label: "Skatteverket – så fungerar rotavdraget", url: "https://www.skatteverket.se/privat/fastigheterochbostad/rotarbeteochrutarbete/safungerarrotavdraget.4.5947400c11f47f7f9dd80004014.html" },
      { label: "Säker Vatten – branschregler 2026:1", url: "https://sakervatten.se/branschregler/branschregler-saker-vatteninstallation-20261/" },
    ],
  },
  {
    slug: "renovera-badrum",
    category: "renovera", categoryLabel: "Renovera",
    title: "Renovera badrum – komplett guide från idé till slutkontroll",
    description: "Planera badrumsrenoveringen steg för steg: krav, budget, entreprenörer, tätskikt, VVS, el och dokumentation.",
    readingTime: "15 min", updated: "23 augusti 2026",
    intro: "Ett bra badrum börjar långt före rivningen. När planlösning, ansvar, tekniska lösningar och kontroller är bestämda i förväg minskar risken för både förseningar och kostsamma vattenskador.",
    sections: [
      { heading: "1. Börja med behov och förutsättningar", paragraphs: ["Mät rummet och dokumentera befintliga installationer. Bestäm vilka funktioner som verkligen behövs och om toalett, golvbrunn och tappvatten kan ligga kvar. Flytt av avlopp och vatten påverkar ofta både pris och risk.", "I en bostadsrätt ska du tidigt kontrollera föreningens stadgar och rutiner. Ledningar, bjälklag och ventilation kan tillhöra föreningen även när ytskikten är ditt ansvar."], bullets: ["Planritning med mått och dörrslagning", "Placering av dusch, wc, kommod och förvaring", "Ventilation och möjlighet till service", "Tillgänglighet nu och på längre sikt"] },
      { heading: "2. Projektera innan du beställer", paragraphs: ["Välj ett sammanhängande system för golvbrunn och tätskikt och säkerställ att produkter och montage fungerar tillsammans. Tekniska beslut ska finnas i offert och avtal – inte tas löpande på byggplatsen.", "Badrummet ska uppfylla myndighetskrav. Branschregler från exempelvis Säker Vatten, BKR eller GVK används för att beskriva fackmässigt utförande och kan vara viktiga för försäkringen."], bullets: ["Fall mot golvbrunn", "Rörgenomföringar och serviceåtkomst", "Våtzoner och tätskiktssystem", "Elområden, belysning och golvvärme"] },
      { heading: "3. Skriv ett tydligt avtal", paragraphs: ["Ange omfattning, material, ansvar, start och sluttid, prisform och hur ändringar ska godkännas. Betalningsplanen bör följa kontrollerbara delmoment.", "Kontrollera företag, behörigheter, försäkring och referenser. Elinstallationsföretaget ska vara registrerat för rätt verksamhetstyp."], bullets: ["Vem samordnar alla yrkesgrupper?", "Vem köper och ansvarar för material?", "Vad ingår i återställning och städning?", "Vilka dokument ska lämnas vid slutbetalning?"] },
      { heading: "4. Följ kritiska moment", paragraphs: ["Dokumentera underlag, rördragningar, golvbrunn, tätskikt och el innan de byggs in. Fotona ersätter inte kvalitetsdokument men gör framtida service och skadeutredning enklare.", "Stoppa och utred avvikelser direkt. Ett felaktigt fall eller en olämplig genomföring blir betydligt dyrare att rätta efter plattsättning."], bullets: ["Kontroll efter rivning", "Kontroll före tätskikt", "Kontroll före ytskikt", "Funktions- och slutkontroll"] },
      { heading: "5. Ta emot badrummet ordentligt", paragraphs: ["Kontrollera funktion, finish, fall, avrinning, ventilation, fogar, luckor och att avtalat material är monterat. Samla fakturor, produktblad, garantier, foton och kvalitetsdokument.", "Betala inte sista delen innan avtalad leverans och dokumentation är klar. Spara allt tillsammans med datum, företag och kostnad i bostadens historik."] },
    ],
    sources: [
      { label: "Boverket – vatten- och avloppsinstallationer", url: "https://www.boverket.se/sv/PBL-kunskapsbanken/regler-om-byggande/hygien-halsa-och-miljo/vatten-avlopp/" },
      { label: "Säker Vatten – branschregler 2026:1", url: "https://sakervatten.se/branschregler/branschregler-saker-vatteninstallation-20261/" },
      { label: "Elsäkerhetsverket – el i bad- och duschrum", url: "https://www.elsakerhetsverket.se/privatpersoner/din-elanlaggning/bygga-och-renovera/installation-av-el-i-bad-och-duschrum/" },
    ],
  },
  {
    slug: "tatskikt-badrum", category: "renovera", categoryLabel: "Renovera",
    title: "Tätskikt i badrum – våtzoner, underlag och kontroll",
    description: "Förstå vad tätskiktet gör, hur systemet väljs och vilka moment som behöver dokumenteras.",
    readingTime: "10 min", updated: "23 augusti 2026",
    intro: "Tätskiktet är badrummets viktigaste skydd mot fukt. Ytskiktet kan se perfekt ut samtidigt som små fel bakom kakel eller matta orsakar stora följdskador.",
    sections: [
      { heading: "Ett system – inte lösa produkter", paragraphs: ["Tätskikt, manschetter, lim, hörn och golvbrunn måste vara avsedda att användas tillsammans. Följ systemleverantörens monteringsanvisning och den branschregel som entreprenören åtar sig att arbeta efter."] },
      { heading: "Underlaget avgör resultatet", paragraphs: ["Underlaget ska vara stabilt, rent och anpassat till valt system. Rörelser, fel skivmaterial eller bristande fall kan inte räddas av ett dyrt ytskikt."], bullets: ["Kontrollera fall före tätskikt", "Dokumentera golvbrunnens typ och ålder", "Undvik onödiga genomföringar", "Följ torktider och temperaturkrav"] },
      { heading: "Begär rätt dokumentation", paragraphs: ["Be om kvalitetsdokument, produktuppgifter och foton från kritiska detaljer. Dokumenten ska kunna kopplas till just ditt badrum, datum och utförande företag."] },
    ],
    sources: [{ label: "Säker Vatten – rörgenomföringar", url: "https://sakervatten.se/branschregler/online/3-2/" }],
  },
  {
    slug: "vvs-badrum", category: "renovera", categoryLabel: "Renovera",
    title: "VVS i badrum – rör, golvbrunn och säkra installationer",
    description: "Det viktigaste om tappvatten, avlopp, rörgenomföringar och dokumentation vid badrumsrenovering.",
    readingTime: "9 min", updated: "23 augusti 2026",
    intro: "VVS-installationerna ska både fungera i vardagen och begränsa skadan om något läcker. Därför behöver rördragning och serviceåtkomst planeras tillsammans med tätskiktet.",
    sections: [
      { heading: "Planera för upptäckbara läckage", paragraphs: ["Dolda tappvattenledningar bör utformas utan oåtkomliga fogar. Kopplingar och komponenter som kan behöva bytas ska gå att inspektera och serva."], bullets: ["Placera fördelare åtkomligt", "Led läckage till synlig plats", "Dokumentera rörens sträckning", "Kontrollera avstängningsmöjlighet"] },
      { heading: "Golvbrunn och genomföringar", paragraphs: ["Golvbrunnens placering och anslutning till tätskiktet är kritisk. I golv med tätskikt ska onödiga rörgenomföringar undvikas; i dusch- eller badplats är kraven särskilt stränga."] },
      { heading: "Välj auktoriserat företag", paragraphs: ["Be företaget ange vilket regelverk arbetet utförs enligt och vilket intyg som lämnas. För arbeten som startar 2026 är Säker Vattens aktuella regelversion 2026:1, med vissa övergångsbestämmelser."] },
    ],
    sources: [{ label: "Säker Vatten – branschregler 2026:1", url: "https://sakervatten.se/branschregler/branschregler-saker-vatteninstallation-20261/" }],
  },
  {
    slug: "el-badrum", category: "renovera", categoryLabel: "Renovera",
    title: "El i badrum – belysning, uttag och golvvärme",
    description: "Planera säker el i badrummet och förstå vad som måste utföras av ett registrerat elinstallationsföretag.",
    readingTime: "8 min", updated: "23 augusti 2026",
    intro: "Vatten och el kräver extra säkerhetsmarginal. Placering, kapslingsklass och skydd ska projekteras utifrån badrummets områdesindelning och den utrustning som ska användas.",
    sections: [
      { heading: "Ta elplanen tidigt", paragraphs: ["Bestäm belysning, uttag, spegel, handdukstork, golvvärme och eventuell tvättmaskin innan väggar och golv byggs. Efterhandslösningar kan bli både dyra och osäkra."], bullets: ["Allmänljus och spegelbelysning", "Uttag på rätt plats", "Jordfelsbrytare", "Styrning och termostat"] },
      { heading: "Anlita rätt företag", paragraphs: ["Elinstallationsarbete ska utföras av ett företag som är registrerat hos Elsäkerhetsverket för rätt typ av arbete. Kontrollera företaget före beställning och avtala om dokumentation och funktionsprovning."] },
      { heading: "Undvik tillfälliga lösningar", paragraphs: ["Dra inte in förlängningssladd från ett annat rum. Utrustning i badrummet ska anslutas till installationer som är avsedda och placerade för miljön."] },
    ],
    sources: [{ label: "Elsäkerhetsverket – installation av el i bad- och duschrum", url: "https://www.elsakerhetsverket.se/privatpersoner/din-elanlaggning/bygga-och-renovera/installation-av-el-i-bad-och-duschrum/" }],
  },
  {
    slug: "jamfora-badrumsofferter", category: "renovera", categoryLabel: "Renovera",
    title: "Jämföra offerter för badrum – checklista före avtal",
    description: "Jämför samma omfattning, hitta luckorna och skriv ett avtal som minskar risken för dyra tillägg.",
    readingTime: "9 min", updated: "23 augusti 2026",
    intro: "Den billigaste badrumsofferten är inte alltid billigast när arbetet är klart. En bra jämförelse börjar med att alla företag räknar på samma underlag.",
    sections: [
      { heading: "Skicka samma förfrågan", paragraphs: ["Bifoga ritning, produktlista och tydlig beskrivning av vad som ska rivas, flyttas, levereras och dokumenteras."], bullets: ["Fast pris och tydliga reservationer", "Arbete, material och resor separerade", "Ansvar för VVS, el och tätskikt", "Start, sluttid och betalningsplan"] },
      { heading: "Granska det som saknas", paragraphs: ["Kontrollera rivning, bortforsling, återställning, håltagning, målning, byggstädning och skydd av övriga bostaden. Be om pris eller enhetspris på sannolika tillägg."] },
      { heading: "Avtala om ändringar", paragraphs: ["Ändringar och tillägg ska godkännas skriftligt med pris- och tidseffekt innan arbetet utförs. Koppla slutbetalningen till godkänd leverans och överlämnad dokumentation."] },
    ],
  },
  {
    slug: "badrum-bostadsratt", category: "renovera", categoryLabel: "Renovera",
    title: "Renovera badrum i bostadsrätt – ansvar och tillstånd",
    description: "Så förbereder du föreningens godkännande och reder ut ansvar för ledningar, ventilation och återställning.",
    readingTime: "9 min", updated: "23 augusti 2026",
    intro: "I en bostadsrätt äger du inte byggnaden ensam. Därför behöver badrumsprojektet följa både lag, föreningens stadgar och de tekniska krav som styrelsen beslutat om.",
    sections: [
      { heading: "Läs stadgar och ansök i tid", paragraphs: ["Kontakta styrelsen innan beställning. Föreningar har ofta egna blanketter och krav på ritning, entreprenörer, tider, avstängning och besiktning."], bullets: ["Ändrad planlösning", "Ingrepp i avlopp eller tappvatten", "Ventilation", "Golvbrunn och bjälklag"] },
      { heading: "Klargör gränsen för ansvar", paragraphs: ["Vem som ansvarar för ledningar, golvbrunn, tätskikt och ytskikt framgår av lag och stadgar. Be styrelsen skriftligen bekräfta vad som gäller i just din förening."] },
      { heading: "Planera störningar och avstängning", paragraphs: ["Informera grannar, boka eventuell vattenavstängning och följ husets arbetstider. Dokumentera projektet så att både du och föreningen kan förstå vad som byggts in."] },
    ],
  },
  {
    slug: "litet-badrum-planering", category: "renovera", categoryLabel: "Renovera",
    title: "Planera ett litet badrum – mått, förvaring och smarta val",
    description: "Få ett litet badrum att fungera bättre utan att kompromissa med säkerhet, service eller städbarhet.",
    readingTime: "7 min", updated: "23 augusti 2026",
    intro: "I ett litet badrum måste varje centimeter arbeta. Börja med rörelseytor och tekniska krav; välj sedan inredning som gör rummet lätt att använda och hålla rent.",
    sections: [
      { heading: "Rita användningen – inte bara möblerna", paragraphs: ["Markera dörrslagning, duschyta, plats framför wc och kommod samt åtkomst till golvbrunn och installationer. Prova vardagliga rörelser på ritningen."] },
      { heading: "Skapa lugn och förvaring", paragraphs: ["Vägghängd eller grund inredning kan frigöra golvyta. Samla småsaker bakom spegel eller i lådor och håll öppna hyllor begränsade."], bullets: ["Skjut- eller utåtgående dörr när det passar", "Duschvägg som kan fällas", "Spegel med dold förvaring", "Sammanhållen färg- och materialskala"] },
      { heading: "Behåll serviceåtkomsten", paragraphs: ["Bygg inte bort golvbrunn, avstängningar eller inspektionsmöjligheter. En kompakt lösning ska fortfarande kunna underhållas och repareras."] },
    ],
  },
  {
    slug: "badrumsrenovering-dokumentation", category: "renovera", categoryLabel: "Renovera",
    title: "Dokumentation efter badrumsrenovering – det här ska du spara",
    description: "Samla rätt intyg, foton, produktuppgifter och avtal för försäkring, service och framtida försäljning.",
    readingTime: "7 min", updated: "23 augusti 2026",
    intro: "När ytskikten är klara går det inte längre att se hur badrummet är byggt. Bra dokumentation gör det möjligt att följa arbetet, hitta installationer och visa vad som utförts.",
    sections: [
      { heading: "Dokument från entreprenörerna", paragraphs: ["Avtala före start om vilka dokument varje yrkesgrupp ska lämna. Kraven varierar mellan regelverk och företag."], bullets: ["Kvalitetsdokument för tätskikt", "Intyg från VVS-företag", "Avtalad el-dokumentation och provning", "Garantier och skötselanvisningar"] },
      { heading: "Foton och produktregister", paragraphs: ["Fotografera rör, ledningar, förstärkningar, golvbrunn och tätskiktsdetaljer innan de täcks. Spara fabrikat, modell, kulör och artikelnummer på produkter som kan behöva kompletteras."] },
      { heading: "Spara allt på ett ställe", paragraphs: ["Koppla handlingarna till bostaden med renoveringsdatum, kostnad och utförande företag. Det förenklar garantiärenden, försäkringsfrågor och en framtida försäljning."] },
    ],
    sources: [{ label: "Elsäkerhetsverket – badrumsrenovering, utförande och intyg", url: "https://www.elsakerhetsverket.se/fragor-och-svar/arkiv-fragor/Badrumsrenovering-utforande-och-intyg/" }],
  },
  {
    slug: "slutkontroll-badrum", category: "renovera", categoryLabel: "Renovera",
    title: "Slutkontroll av badrum – checklista innan slutbetalning",
    description: "Kontrollera funktion, finish och dokumentation systematiskt innan badrummet lämnas över.",
    readingTime: "8 min", updated: "23 augusti 2026",
    intro: "Slutkontrollen ska fånga både synliga fel och sådant som saknas i leveransen. Gör den i dagsljus, med avtalet och produktlistan framför dig.",
    sections: [
      { heading: "Prova alla funktioner", paragraphs: ["Spola wc, fyll och töm handfat, prova dusch, blandare, golvvärme, belysning och ventilation. Kontrollera samtidigt läckage, avrinning och missljud."], bullets: ["Vatten rinner mot golvbrunn", "Dörrar och lådor går fria", "Fogar och anslutningar är hela", "Servicepunkter är åtkomliga"] },
      { heading: "Stäm av mot beställningen", paragraphs: ["Kontrollera modeller, placeringar, ytskikt och alla avtalade tillägg. Fotografera avvikelser och skriv en gemensam lista med ansvar och sista åtgärdsdatum."] },
      { heading: "Ta emot dokumentationen", paragraphs: ["Samla kvalitetsdokument, garantier, skötselanvisningar, produktblad, foton och slutfaktura. Slutbetalning bör ske först när avtalade fel är hanterade och leveransen är komplett."] },
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
  {
    slug: "vvs-i-hemmet", category: "underhalla", categoryLabel: "Underhålla",
    title: "VVS i hemmet – komplett guide till vatten, avlopp och värme",
    description: "Lär känna hemmets VVS-system, förebygg läckage och förstå när du behöver anlita ett auktoriserat VVS-företag.",
    readingTime: "14 min", updated: "23 augusti 2026",
    intro: "Husets VVS-system arbetar dygnet runt men blir ofta synligt först när något läcker eller slutar fungera. Med rätt överblick kan du förebygga skador, agera snabbare och beställa arbeten med tydligare krav.",
    sections: [
      { heading: "Lär känna installationerna", paragraphs: ["Ta reda på var inkommande vatten, huvudavstängning, vattenmätare, varmvattenberedare, golvbrunnar och rensmöjligheter finns. Märk upp ventiler och dokumentera systemet innan ett akut läge uppstår.", "I en bostadsrätt behöver du också veta var gränsen går mellan ditt och föreningens ansvar."], bullets: ["Tappvatten – kallt och varmt bruksvatten", "Spillvatten – avlopp från kök, badrum och tvätt", "Värmesystem – radiatorer eller golvvärme", "Dagvatten – regn- och smältvatten"] },
      { heading: "Förebygg läckage", paragraphs: ["Fogar och kopplingar ska vara placerade så att läckage kan upptäckas och åtgärdas. Titta regelbundet under diskbänk, vid diskmaskin, tvättmaskin, varmvattenberedare och synliga rör.", "Dropp, missfärgning, svällda skivor, avvikande lukt eller vattenförbrukning kan vara tidiga tecken."], bullets: ["Motionera avstängningsventiler", "Rensa golvbrunnar och vattenlås", "Kontrollera skydd och slangar", "Följ vattenmätaren när allt är avstängt"] },
      { heading: "Beställ VVS-arbetet tydligt", paragraphs: ["Beskriv problemet eller önskad funktion, inte bara den produkt du tror behövs. Be om omfattning, prisform, material, ansvar för följdarbeten och vilken dokumentation som lämnas.", "För arbeten som startar 2026 är Säker Vattens aktuella regelversion 2026:1, med angivna övergångsbestämmelser."], bullets: ["Kontrollera företagets auktorisation", "Avtala om branschregler", "Begär skriftliga ändringar", "Spara intyg, foton och fakturor"] },
      { heading: "Agera rätt när något händer", paragraphs: ["Vid ett pågående läckage: stäng vattnet om det kan göras säkert, begränsa skadan, bryt elen om vatten når elektrisk utrustning utan att utsätta dig för risk och kontakta VVS-jour samt försäkringsbolag.", "Dokumentera händelsen men vänta inte med skadebegränsningen för att ta bilder."] },
    ],
    sources: [
      { label: "Boverket – vatten- och avloppsinstallationers beständighet", url: "https://www.boverket.se/sv/PBL-kunskapsbanken/regler-om-byggande/hygien-halsa-och-miljo/vatten-avlopp/bestandighet/" },
      { label: "Säker Vatten – branschregler 2026:1", url: "https://sakervatten.se/branschregler/branschregler-saker-vatteninstallation-20261/" },
    ],
  },
  {
    slug: "vattenlacka-akut", category: "underhalla", categoryLabel: "Underhålla",
    title: "Vattenläcka hemma – gör så här direkt",
    description: "Steg för steg när ett rör, en anslutning eller en maskin läcker – från avstängning till skadeanmälan.",
    readingTime: "7 min", updated: "23 augusti 2026",
    intro: "De första minuterna kan avgöra hur stor vattenskadan blir. Prioritera säkerhet, stoppa vattenflödet och begränsa spridningen innan du börjar utreda orsaken.",
    sections: [
      { heading: "1. Stoppa och säkra", paragraphs: ["Stäng närmaste ventil eller huvudavstängningen. Om vatten når elcentral, uttag eller elektrisk utrustning ska du hålla avstånd och kontakta behörig hjälp; bryt bara strömmen om det kan göras säkert."], bullets: ["Flytta värdeföremål", "Samla upp och led bort vatten", "Kontakta VVS-jour vid fortsatt flöde", "Varna berörda grannar eller föreningen"] },
      { heading: "2. Begränsa följdskadan", paragraphs: ["Torka upp synligt vatten och skapa luftcirkulation när det är lämpligt. Riv inte konstruktioner eller starta kraftig uttorkning utan samordning när försäkringsbolag eller fackman behöver bedöma skadan."] },
      { heading: "3. Dokumentera och anmäl", paragraphs: ["Fotografera skadeplats, vattenväg och berörda föremål. Notera tidpunkt, vad du gjorde och vem du kontaktade. Anmäl skadan till försäkringsbolaget och i bostadsrätt även till föreningen."] },
    ],
    sources: [{ label: "Boverket – begränsning av läckage", url: "https://www.boverket.se/sv/PBL-kunskapsbanken/regler-om-byggande/hygien-halsa-och-miljo/vatten-avlopp/bestandighet/" }],
  },
  {
    slug: "upptacka-dolt-vattenlackage", category: "underhalla", categoryLabel: "Underhålla",
    title: "Dolt vattenläckage – tecken, kontroll och nästa steg",
    description: "Upptäck ovanlig vattenförbrukning, fukt och små läckage innan de utvecklas till stora skador.",
    readingTime: "8 min", updated: "23 augusti 2026",
    intro: "Ett dolt läckage kan pågå länge utan en synlig pöl. Förändrad förbrukning, lukt eller material är ofta de första ledtrådarna.",
    sections: [
      { heading: "Vanliga varningssignaler", paragraphs: ["Reagera på återkommande fuktlukt, missfärgning, bubblande färg, svällda skivor, varmt område i golv eller ljud av rinnande vatten när allt är avstängt."], bullets: ["Vattenmätaren rör sig utan förbrukning", "Oväntat hög vattenräkning", "Lågt eller varierande tryck", "Fukt vid schakt och genomföringar"] },
      { heading: "Gör en enkel mätarkontroll", paragraphs: ["Stäng alla tappställen och se till att maskiner inte tar vatten. Notera mätarställningen, vänta och kontrollera igen. En förändring bör utredas, men metoden visar inte var läckaget sitter."] },
      { heading: "Ta hjälp utan onödig rivning", paragraphs: ["En VVS- eller skadeutredare kan använda tryckprovning, fuktmätning, värmekamera eller annan läcksökning. Låt resultatet styra öppningen av konstruktionen."] },
    ],
  },
  {
    slug: "droppande-kran-rinnande-toalett", category: "underhalla", categoryLabel: "Underhålla",
    title: "Droppande kran eller rinnande toalett – hitta felet",
    description: "Så känner du igen vanliga fel, stänger av rätt och avgör om du kan göra något själv eller bör ringa VVS-företag.",
    readingTime: "7 min", updated: "23 augusti 2026",
    intro: "Små läckage slösar vatten och kan vara tecken på slitna packningar, ventiler eller felaktig montering. Börja med att fastställa var vattnet faktiskt passerar.",
    sections: [
      { heading: "Droppande blandare", paragraphs: ["Dropp från pipen beror ofta på slitdelar i blandaren. Läckage vid anslutning eller under diskbänk är mer brådskande eftersom vatten kan nå byggmaterial."], bullets: ["Stäng lokala ventiler", "Identifiera fabrikat och modell", "Kontrollera synliga kopplingar utan att överdra", "Byt inte delar innan du vet att de passar"] },
      { heading: "Rinnande wc", paragraphs: ["Lyssna och kontrollera vattenytan i cisternen. Fel kan finnas i inloppsventil, flottör eller bottenventil. Stäng wc-ventilen om flödet fortsätter och boka åtgärd."], bullets: ["Vatten rinner i skålen", "Cisternen fyller med jämna mellanrum", "Knappen fastnar", "Fukt syns vid anslutningen"] },
      { heading: "När fackman behövs", paragraphs: ["Ta hjälp om avstängningen inte fungerar, om det läcker vid dold anslutning eller om arbetet påverkar tätskikt och fasta installationer. Dokumentera utförd reparation."] },
    ],
  },
  {
    slug: "frusna-vattenror", category: "underhalla", categoryLabel: "Underhålla",
    title: "Frusna vattenrör – tina säkert och förebygg nya problem",
    description: "Vad du gör när vattnet fryser, vilka metoder du ska undvika och hur fritidshus skyddas inför vintern.",
    readingTime: "8 min", updated: "23 augusti 2026",
    intro: "Ett fruset rör kan spricka utan att läckaget syns förrän isen smälter. Stäng därför vattnet och planera för att upptäcka ett eventuellt brott under upptiningen.",
    sections: [
      { heading: "Börja med säkerheten", paragraphs: ["Lokalisera den kalla sträckan och stäng huvudvattnet. Använd aldrig öppen låga. Om röret är dolt, svårtillgängligt eller redan skadat bör VVS-företag anlitas."], bullets: ["Öppna tappstället försiktigt", "Värm långsamt med kontrollerad, mild värme", "Bevaka hela sträckan", "Kontrollera läckage när vattnet åter släpps på"] },
      { heading: "Förebygg frysning", paragraphs: ["Isolera utsatta rör och täta kalla luftläckor utan att skapa nya fuktproblem. Rör i fritidshus behöver antingen hållas frostfria eller tömmas enligt en dokumenterad vinterrutin."], bullets: ["Stäng och töm vatten", "Töm beredare och utomhusledningar enligt anvisning", "Lämna skåpluckor öppna vid kalla ytterväggar", "Använd temperatur- eller läckagelarm"] },
      { heading: "Utred varför det frös", paragraphs: ["En tillfällig upptining löser inte grundorsaken. Kontrollera isolering, placering, värmetillförsel och om förändrad ventilation eller ombyggnad har gjort utrymmet kallare."] },
    ],
  },
  {
    slug: "lagt-vattentryck", category: "underhalla", categoryLabel: "Underhålla",
    title: "Lågt vattentryck – felsökning i villa och lägenhet",
    description: "Avgör om problemet sitter i ett tappställe, bostaden, fastigheten eller det kommunala nätet.",
    readingTime: "7 min", updated: "23 augusti 2026",
    intro: "Lågt tryck kan bero på allt från en igensatt sil till en läcka eller störning i nätet. Felsök från det lilla till det stora innan delar byts.",
    sections: [
      { heading: "Avgränsa problemet", paragraphs: ["Kontrollera om både varmt och kallt vatten påverkas och om felet finns i ett eller alla tappställen. Fråga grannar och kontrollera information från VA-huvudman eller förening."], bullets: ["Ett tappställe: rengör sil eller duschmunstycke", "Bara varmvatten: kontrollera beredare och blandning", "Hela bostaden: kontrollera ventiler och filter", "Flera fastigheter: kontakta VA-huvudmannen"] },
      { heading: "Var uppmärksam på läckage", paragraphs: ["Tryckfall tillsammans med rinnande ljud, mätarrörelse eller fukt ska utredas snabbt. Stäng vatten vid misstänkt läcka och kontakta fackman."] },
      { heading: "Ändra inte trycket på chans", paragraphs: ["Tryckstegring och reduceringsventiler ska dimensioneras för installationen. Ett högre tryck kan öka belastningen på svaga komponenter och löser inte ett igensatt eller underdimensionerat system."] },
    ],
  },
  {
    slug: "avstangningsventiler-vattenmatare", category: "underhalla", categoryLabel: "Underhålla",
    title: "Avstängningsventiler och vattenmätare – husets viktigaste kontrollpunkter",
    description: "Hitta, märk och prova ventilerna så att vattnet snabbt kan stängas vid ett läckage.",
    readingTime: "7 min", updated: "23 augusti 2026",
    intro: "En avstängningsventil hjälper bara om du hittar den och den fungerar när olyckan är framme. Gör kontrollen till en del av bostadens årliga underhåll.",
    sections: [
      { heading: "Kartlägg avstängningarna", paragraphs: ["Identifiera huvudavstängning och lokala ventiler till wc, diskmaskin, tvättmaskin, utomhuskran och andra installationer. Märk dem och visa hushållet var de sitter."] },
      { heading: "Motionera utan att forcera", paragraphs: ["Prova ventiler försiktigt enligt tillverkarens eller VA-huvudmannens anvisning. En kärvande, korroderad eller läckande ventil ska bedömas av VVS-företag – använd inte överdriven kraft."], bullets: ["Ventilen stänger helt", "Ingen fukt uppstår runt spindel eller koppling", "Handtag och märkning är hela", "Åtkomsten är fri"] },
      { heading: "Använd mätaren som varningssignal", paragraphs: ["Följ normalförbrukningen och reagera på förändringar. Kontrollera att mätarplatsen är åtkomlig och frostskyddad enligt den lokala VA-huvudmannens krav."] },
    ],
  },
  {
    slug: "forebygga-vattenskada-kok", category: "underhalla", categoryLabel: "Underhålla",
    title: "Förebygg vattenskador i köket",
    description: "Kontrollera diskbänk, diskmaskin, kyl och vattenanslutna apparater innan ett droppläckage blir en byggskada.",
    readingTime: "8 min", updated: "23 augusti 2026",
    intro: "Köket har många vattenanslutningar men saknar ofta golvbrunn och tätskikt. Därför ska ett läckage snabbt bli synligt och kunna stoppas.",
    sections: [
      { heading: "Gör läckaget synligt", paragraphs: ["Installationer och fogar ska placeras och skyddas så att vatten inte obemärkt tränger in i skåp, vägg eller golv. Använd lösningar som leder fram läckage till synlig plats när regelverk och produktanvisning kräver det."], bullets: ["Kontrollera under diskbänken", "Se över slangar och anslutningar", "Håll avstängningen åtkomlig", "Överväg läckagedetektor eller vattenfelsbrytare"] },
      { heading: "Kontrollera maskinerna", paragraphs: ["Inspektera diskmaskin, kyl med vatten, kaffemaskin och andra anslutna produkter. Följ tillverkarens krav på skydd, slangbyte och avstängning."] },
      { heading: "Reagera på små förändringar", paragraphs: ["Lukt, svällda socklar, mörka fläckar eller återkommande fukt ska utredas direkt. Stäng vatten till berörd apparat och ta hjälp innan den används igen."] },
    ],
    sources: [{ label: "Boverket – begränsning och upptäckt av läckage", url: "https://www.boverket.se/sv/PBL-kunskapsbanken/regler-om-byggande/hygien-halsa-och-miljo/vatten-avlopp/bestandighet/" }],
  },
  {
    slug: "anlita-vvs-foretag", category: "underhalla", categoryLabel: "Underhålla",
    title: "Anlita VVS-företag – kontrollera offert, auktorisation och intyg",
    description: "En praktisk beställarguide för reparationer och installationer inom vatten, avlopp och värme.",
    readingTime: "9 min", updated: "23 augusti 2026",
    intro: "En tydlig beställning gör det enklare att jämföra företag och minskar risken för missförstånd när arbetet påverkar dolda installationer eller flera yrkesgrupper.",
    sections: [
      { heading: "Beskriv nuläge och önskat resultat", paragraphs: ["Skicka foton, mått och känd dokumentation. Ange om arbetet sker i villa, bostadsrätt eller fritidshus och om vatten måste stängas för fler än din bostad."] },
      { heading: "Jämför samma omfattning", paragraphs: ["Be om specificering av arbete, material, resor, eventuella jourpåslag och följdarbeten. Fråga vilka reservationer som kan ge tillägg."], bullets: ["Prisform och betalningsvillkor", "Starttid och beräknad sluttid", "Auktorisation och försäkring", "Regelverk och överlämningsdokument"] },
      { heading: "Skriv ändringar innan de utförs", paragraphs: ["Ändrings- och tilläggsarbeten ska beskrivas med pris- och tidseffekt. Spara offert, beställning, foton, intyg och faktura i bostadens historik."] },
    ],
    sources: [{ label: "Säker Vatten – om auktorisation och branschregler", url: "https://sakervatten.se/branschregler/" }],
  },
  {
    slug: "egen-brunn-vattenprov", category: "underhalla", categoryLabel: "Underhålla",
    title: "Egen brunn – vattenprov, underhåll och vanliga problem",
    description: "Så tar du ansvar för dricksvattnet, planerar provtagning och reagerar på förändrad smak, lukt eller tillgång.",
    readingTime: "10 min", updated: "23 augusti 2026",
    intro: "Med egen brunn ansvarar du själv för dricksvattnets kvalitet och anläggningens funktion. Regelbunden provtagning och dokumenterat underhåll ger ett bättre beslutsunderlag än smak och utseende.",
    sections: [
      { heading: "Provta regelbundet", paragraphs: ["Livsmedelsverket rekommenderar provtagning av vatten från egen brunn eller annan liten privat dricksvattenanläggning minst vart tredje år, och i vissa fall varje år. Använd ett ackrediterat laboratorium och följ provtagningsinstruktionen."], bullets: ["Provta vid förändrad smak, lukt eller färg", "Provta efter översvämning eller annan påverkan", "Spara analysresultat över tid", "Utöka analysen efter lokala risker"] },
      { heading: "Tolka orsaken före åtgärden", paragraphs: ["Ett analysresultat kan visa mikrobiologiska, kemiska eller estetiska problem. Utred brunnens konstruktion, omgivning och råvatten innan du väljer filter eller annan behandling."] },
      { heading: "Sköt och dokumentera anläggningen", paragraphs: ["Kontrollera brunnslock, tätning, marklutning, pumputrustning och vattennivå. Spara brunnsdata, service, provsvar och installerad behandling – särskilt inför en framtida försäljning."] },
    ],
    sources: [
      { label: "Livsmedelsverket – egen brunn", url: "https://www.livsmedelsverket.se/livsmedel-och-innehall/dricksvatten/egen-brunn2/" },
      { label: "Livsmedelsverket – vattenprov och analys", url: "https://www.livsmedelsverket.se/livsmedel-och-innehall/dricksvatten/egen-brunn2/vattenprov-och-analys-av-ditt-dricksvatten/" },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function getGuidesByCategory(category: string) {
  return guides.filter((guide) => guide.category === category);
}
