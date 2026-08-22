-- BoLiv SEO cluster: Tak
-- Seeds a complete first topic cluster into the editorial content engine.

with roof_category as (
  select id from public.taxonomy_terms where term_type = 'category' and slug = 'renovera' limit 1
),
roof_guides(slug, title, excerpt, reading_time, body, seo_title, seo_description) as (
  values
  (
    'byta-tak',
    'Byta tak – kostnad, material och arbetsgång',
    'En komplett guide till takbyte: livslängd, kostnader, materialval, offerter och vad du behöver kontrollera.',
    12,
    '{"intro":"Ett takbyte är en av husets största investeringar. Med rätt förarbete blir det enklare att jämföra offerter, undvika överraskningar och välja en lösning som håller länge.","sections":[{"heading":"När behöver taket bytas?","paragraphs":["Takets ålder är bara en del av bedömningen. Spruckna pannor, rost, sliten papp, fukt på vinden och missfärgningar kring genomföringar är signaler som ska undersökas.","Gör en visuell kontroll vår och höst. Misstänker du läckage bör en fackman bedöma yttertak, underlag och ventilation."],"bullets":["Betongpannor håller ofta 30–50 år","Tegelpannor kan hålla 50 år eller mer","Takpapp håller ofta 20–30 år","Plåttak håller ofta 40–60 år"]},{"heading":"Planera hela entreprenaden","paragraphs":["Be om en specificerad offert där rivning, ställning, plåt, avfall, material och tillägg framgår. Kontrollera också garantier, betalningsplan och vem som ansvarar för väderskydd."],"bullets":["Kontrollera moms och ROT-avdrag","Begär fast pris eller tydliga enhetspriser","Avsätt reserv för skadat virke","Skriv alltid avtal"]},{"heading":"Dokumentera arbetet","paragraphs":["Fotografera underlaget och alla dolda moment. Spara garantier, produktblad, besiktningsprotokoll och fakturor i Mitt BoLiv."]}]}'::jsonb,
    'Byta tak 2026 – komplett guide till pris och material',
    'Planerar du att byta tak? Läs om kostnad, material, livslängd, offerter och arbetsgång för svenska villor.'
  ),
  (
    'kostnad-byta-tak',
    'Vad kostar det att byta tak?',
    'Så räknar du på priset för takbyte och jämför offerter på rätt grunder.',
    9,
    '{"intro":"Priset på ett takbyte styrs av betydligt mer än takets yta. Lutning, material, åtkomlighet och underlagets skick påverkar slutkostnaden.","sections":[{"heading":"Kostnader som ska ingå","paragraphs":["En komplett kalkyl omfattar rivning, ställning, väderskydd, underlag, läkt, taktäckning, plåtarbeten och bortforsling."],"bullets":["Material och leverans","Arbete och ställning","Plåt och genomföringar","Avfall och slutstädning"]},{"heading":"Undvik missvisande kvadratmeterpris","paragraphs":["Två lika stora tak kan kräva helt olika arbetsinsats. Kupor, skorstenar, brant lutning och många anslutningar ökar tiden och materialåtgången."]},{"heading":"Reserv och betalningsplan","paragraphs":["Lägg in en reserv för rötskador som upptäcks först när taket öppnas. Koppla betalningar till kontrollerbara delmoment och slutbesiktning."]}]}'::jsonb,
    'Kostnad för takbyte – pris och budget',
    'Se vad som påverkar kostnaden för ett takbyte och hur du granskar offerter, reserv och betalningsplan.'
  ),
  (
    'valja-takmaterial',
    'Välja takmaterial – tegel, betong, plåt eller papp',
    'Jämför vanliga takmaterial utifrån vikt, lutning, livslängd, underhåll och husets uttryck.',
    10,
    '{"intro":"Det bästa takmaterialet är det som passar husets konstruktion, taklutning, klimat och arkitektur. Börja med de tekniska kraven innan du väljer utseende.","sections":[{"heading":"Tegel och betong","paragraphs":["Tegel har lång livslängd och åldras naturligt. Betongpannor är ofta billigare men tyngre och kan kräva mer rengöring över tid."]},{"heading":"Plåt och papp","paragraphs":["Plåt är lätt och fungerar på många lutningar. Takpapp används ofta på låglutande tak och kräver noggrant utförda skarvar och anslutningar."]},{"heading":"Kontrollera konstruktionen","paragraphs":["Byt inte till ett tyngre material utan att kontrollera bärigheten. Säkerställ också att materialet är godkänt för takets lutning."],"bullets":["Taklutning","Bärighet","Vind- och snölast","Detaljer kring skorstenar och takfönster"]}]}'::jsonb,
    'Välja takmaterial – jämför tegel, betong, plåt och papp',
    'Jämför takmaterialens egenskaper, livslängd och krav innan du väljer nytt tak.'
  ),
  (
    'tegeltak-livslangd-underhall',
    'Tegeltak – livslängd, underhåll och vanliga skador',
    'Så tar du hand om ett tegeltak och upptäcker problem innan de orsakar följdskador.',
    8,
    '{"intro":"Ett väl lagt tegeltak kan hålla mycket länge, men pannorna är bara det yttersta skyddet. Underlag, läkt och plåtdetaljer måste också vara i gott skick.","sections":[{"heading":"Kontrollera hela taksystemet","paragraphs":["Byt spruckna pannor och kontrollera nock, ränndalar, genomföringar och plåt. På vinden letar du efter fukt, lukt och missfärgningar."]},{"heading":"Mossa och rengöring","paragraphs":["Mossa innebär inte automatiskt att taket måste bytas. Undvik aggressiva metoder som skadar pannornas yta och anlita hjälp om taket är brant."]},{"heading":"När räcker reparation?","paragraphs":["Enstaka pannor och mindre plåtdetaljer kan ofta repareras. Är underlagspappen spröd eller läkten skadad kan omläggning vara mer ekonomisk."]}]}'::jsonb,
    'Tegeltak – livslängd, skador och underhåll',
    'Lär dig kontrollera tegeltak, byta skadade pannor och avgöra när hela taket behöver läggas om.'
  ),
  (
    'betongpannor-tak',
    'Betongpannor på tak – fördelar, nackdelar och skötsel',
    'En praktisk guide till betongpannornas vikt, livslängd, ytbehandling och underhåll.',
    7,
    '{"intro":"Betongpannor är vanliga på svenska villor och finns i många profiler och färger. De är robusta men väger mer än flera alternativa material.","sections":[{"heading":"Fördelar och begränsningar","paragraphs":["Betongpannor har ofta ett konkurrenskraftigt pris och är enkla att ersätta styckvis. Ytan förändras med tiden och kan få påväxt."]},{"heading":"Kontrollera vikt och läkt","paragraphs":["Vid byte från ett lätt material måste takkonstruktionens bärighet bedömas. Kontrollera också dimensioner och avstånd på läkten."]},{"heading":"Löpande skötsel","paragraphs":["Håll rännor och ränndalar fria, byt trasiga pannor och följ upp nockband och genomföringar efter stormar."]}]}'::jsonb,
    'Betongpannor – livslängd, pris och underhåll',
    'Allt du behöver veta om betongpannor: vikt, livslängd, fördelar och rätt underhåll.'
  ),
  (
    'plattak-guide',
    'Plåttak – typer, livslängd och underhåll',
    'Jämför bandtäckt plåt och profilerad plåt och lär dig vad som avgör takets hållbarhet.',
    9,
    '{"intro":"Plåttak är lätta, täta och användbara på många taklutningar. Detaljerna och montaget har stor betydelse för resultatet.","sections":[{"heading":"Olika typer av plåttak","paragraphs":["Bandtäckning ger ett traditionellt uttryck och kräver kvalificerat hantverk. Profilerad plåt monteras i större skivor och kan vara ett mer kostnadseffektivt alternativ."]},{"heading":"Kondens och ventilation","paragraphs":["Rätt underlag och ventilation minskar risken för kondens. Konstruktionen ska utformas efter uppvärmning, isolering och takets geometri."]},{"heading":"Underhåll","paragraphs":["Kontrollera färgskikt, skruvar, falsar, plåtdetaljer och repor. Små skador bör åtgärdas innan korrosion sprider sig."]}]}'::jsonb,
    'Plåttak – pris, livslängd och olika typer',
    'Jämför plåttak och läs om montage, kondens, målning, livslängd och underhåll.'
  ),
  (
    'papptak-lagluttande-tak',
    'Papptak och låglutande tak – det här behöver du veta',
    'Material, avvattning och detaljer som avgör om ett låglutande tak håller tätt.',
    8,
    '{"intro":"På låglutande tak rinner vatten bort långsammare. Därför blir tätskikt, brunnar, skarvar och genomföringar särskilt viktiga.","sections":[{"heading":"Rätt produkt för lutningen","paragraphs":["Kontrollera materialleverantörens krav på minsta lutning och underlag. Alla produkter som kallas takpapp är inte avsedda som färdigt ytskikt."]},{"heading":"Avvattning och detaljer","paragraphs":["Brunnar, sargar, kanter och genomföringar är vanliga riskpunkter. Taket ska ha fungerande fall och inga långvariga vattensamlingar."]},{"heading":"Kontroll och underhåll","paragraphs":["Rensa brunnar och kontrollera blåsor, sprickor och öppna skarvar minst två gånger per år. Anlita fackman för reparation av tätskikt."]}]}'::jsonb,
    'Papptak och låglutande tak – material och underhåll',
    'Guide till papptak, tätskikt, taklutning, avvattning och vanliga riskpunkter.'
  ),
  (
    'taklackage-akuta-atgarder',
    'Takläckage – akuta åtgärder och nästa steg',
    'Så begränsar du skadan, dokumenterar rätt och hittar orsaken till ett läckande tak.',
    7,
    '{"intro":"Vid ett takläckage är första målet att skydda människor och begränsa följdskadan. Därefter behöver orsaken hittas och åtgärden dokumenteras.","sections":[{"heading":"Gör detta direkt","paragraphs":["Flytta känsliga föremål, samla upp vatten och bryt strömmen om vatten når elinstallationer. Gå inte upp på ett halt eller stormskadat tak."],"bullets":["Begränsa vattnet inomhus","Fotografera skadan","Kontakta försäkringsbolaget","Beställ säker skadebesiktning"]},{"heading":"Hitta orsaken","paragraphs":["Vattnet kan färdas långt i konstruktionen. Skadan kan ligga vid en genomföring, ränndal, skruv, panna eller anslutning trots att droppet syns på en annan plats."]},{"heading":"Torka och följ upp","paragraphs":["Fuktiga material måste torka och ibland bytas. Följ upp med fuktmätning och spara rapporter, foton och fakturor."]}]}'::jsonb,
    'Takläckage – vad gör man när taket läcker?',
    'Akuta råd vid takläckage: begränsa skadan, dokumentera, kontakta försäkringsbolaget och hitta orsaken.'
  ),
  (
    'underhalla-tak-checklista',
    'Underhålla taket – checklista vår och höst',
    'En återkommande kontroll som hjälper dig upptäcka små fel innan de blir dyra skador.',
    6,
    '{"intro":"En enkel takkontroll två gånger per år kan förlänga livslängden och minska risken för vatten- och stormskador.","sections":[{"heading":"Kontroll från marken","paragraphs":["Använd kikare eller fotografera från säkert avstånd. Leta efter förskjutna pannor, rost, skadad plåt och hängrännor som lutar fel."]},{"heading":"Rensa och kontrollera","paragraphs":["Ta bort löv från rännor och brunnar när det kan göras säkert. Kontrollera vindskivor, stuprör och att vattnet leds bort från huset."],"bullets":["Pannor och nock","Plåt och genomföringar","Rännor och stuprör","Vind och undertak"]},{"heading":"Efter oväder","paragraphs":["Gör en extra kontroll efter storm, kraftigt snöfall eller hagel. Dokumentera datum och observationer i underhållsplanen."]}]}'::jsonb,
    'Underhålla tak – komplett checklista',
    'Använd BoLivs checklista för takkontroll vår, höst och efter oväder.'
  ),
  (
    'jamfora-takofferter',
    'Jämföra offerter för takbyte',
    'Frågorna och avtalsdelarna som gör takofferter möjliga att jämföra.',
    8,
    '{"intro":"Den billigaste takofferten är inte alltid billigast när omfattning, material och riskfördelning jämförs. Kräv samma underlag från alla entreprenörer.","sections":[{"heading":"Samma omfattning i alla offerter","paragraphs":["Beskriv takyta, material, plåtarbeten, ställning, avfall och önskad dokumentation. Be om reservationer och undantag skriftligt."]},{"heading":"Kontrollera företaget","paragraphs":["Kontrollera F-skatt, försäkring, referenser och vem som faktiskt utför arbetet. Begär produkt- och utförandegarantier."],"bullets":["Ansvarsförsäkring","Referensprojekt","Tidsplan","Garantier","Underentreprenörer"]},{"heading":"Skriv tydligt avtal","paragraphs":["Använd konsumentanpassat avtal. Reglera betalningsplan, ändringar, förseningar, väderskydd, besiktning och hantering av rötskador."]}]}'::jsonb,
    'Jämföra takofferter – checklista före avtal',
    'Så jämför du offerter för takbyte och granskar omfattning, företag, garantier och betalningsplan.'
  ),
  (
    'bygglov-byta-tak',
    'Behövs bygglov för att byta tak?',
    'När material- eller färgbyte kan kräva lov och vad du bör kontrollera med kommunen.',
    6,
    '{"intro":"Ett takbyte med samma utseende kräver ofta inte bygglov, men reglerna beror på byggnaden, detaljplanen och hur takets utformning ändras.","sections":[{"heading":"När lov kan krävas","paragraphs":["Byte av material eller kulör kan påverka byggnadens yttre utseende. Särskilda regler kan gälla inom detaljplan, kulturmiljö eller för en särskilt värdefull byggnad."]},{"heading":"Kontakta kommunen tidigt","paragraphs":["Skicka bilder och en tydlig beskrivning till kommunens bygglovsenhet innan material beställs. Be om ett skriftligt besked när förutsättningarna är oklara."]},{"heading":"Andra krav finns kvar","paragraphs":["Även utan bygglov ska konstruktionen uppfylla tekniska krav. Taksäkerhet, brandskydd och bärighet kan behöva kontrolleras."]}]}'::jsonb,
    'Bygglov för takbyte – när behövs det?',
    'Läs när ett takbyte kan kräva bygglov och vad som gäller vid ändrat material, färg eller kulturvärde.'
  ),
  (
    'rotavdrag-takbyte',
    'ROT-avdrag vid takbyte',
    'Vilket takarbete som normalt kan ge ROT-avdrag och hur du planerar faktura och betalning.',
    6,
    '{"intro":"ROT-avdrag kan minska arbetskostnaden vid takarbete på en bostad du äger och använder. Material, resor och utrustning ger normalt inte avdrag.","sections":[{"heading":"Arbete och material ska skiljas åt","paragraphs":["Be entreprenören specificera arbetskostnaden tydligt. Avdragets storlek beror på aktuella regler, din skatt och hur mycket avdrag du redan har använt."]},{"heading":"Kontrollera villkoren","paragraphs":["Du behöver uppfylla Skatteverkets krav på ägande, bostad och betalning. Företaget ska ha F-skatt och ansöker normalt om utbetalningen."]},{"heading":"Planera före start","paragraphs":["Kontrollera alltid aktuella procentsatser och tak hos Skatteverket innan avtal. Reglera i avtalet vad som händer om hela avdraget inte medges."]}]}'::jsonb,
    'ROT-avdrag för takbyte – regler och arbetskostnad',
    'Så fungerar ROT-avdrag vid takbyte och takreparation. Kontrollera arbetskostnad, faktura och aktuella villkor.'
  )
)
insert into public.content_items (
  status, content_type, title, slug, excerpt, body, primary_category_id,
  seo_title, seo_description, reading_time_minutes, published_at, updated_at
)
select
  'published'::public.content_status, 'guide', g.title, g.slug, g.excerpt, g.body,
  c.id, g.seo_title, g.seo_description, g.reading_time, now(), now()
from roof_guides g cross join roof_category c
on conflict (slug) do update set
  status = excluded.status,
  title = excluded.title,
  excerpt = excluded.excerpt,
  body = excluded.body,
  primary_category_id = excluded.primary_category_id,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  reading_time_minutes = excluded.reading_time_minutes,
  published_at = coalesce(public.content_items.published_at, excluded.published_at),
  updated_at = now();
