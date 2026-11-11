# QELVION — Produktguide för företag

**Version:** 1.0  
**Produkt:** AF QELVION  
**Kategori:** AI Workforce Platform  
**Målgrupp:** Företag, grundare och operativa team  
**Status:** Produkt- och användarguide för den nuvarande utvecklingsversionen

---

## 1. Vad är QELVION?

QELVION är en plattform där ett företag kan samla sitt arbetsflöde och samarbeta med AI-assistenter. Plattformens mål är att hjälpa team att planera arbete, strukturera information, analysera affärsfrågor och följa upp uppgifter från en gemensam arbetsyta.

Arasko är plattformens centrala AI-assistent. Arasko kan analysera en instruktion, använda relevant företagskontext och vid behov be specialiserade AI-agenter om underlag.

**Viktigt:** QELVION är under aktiv utveckling. Den här guiden skiljer mellan funktioner som finns i den nuvarande kodbasen och funktioner som är planerade. Tillgängligheten i en driftsatt miljö beror även på korrekt konfiguration av Clerk, Supabase och OpenAI.

## 2. Plattformens huvuddelar

### Arasko — Executive AI Assistant
Arasko är den centrala ingången för frågor och uppgifter. Assistenten kan:
- ta emot instruktioner på företagets valda applikationsspråk,
- använda en begränsad översikt av företagets projekt, CRM, dokument, inställningar och senaste aktivitet,
- sammanfatta tidigare agentarbete och väntande godkännanden,
- delegera lämpliga uppgifter till specialistagenter,
- sammanställa resultat till en övergripande rekommendation.

Arasko ska redovisa vad som är analys och förslag. Den får inte påstå att en extern åtgärd har genomförts om den inte faktiskt har utförts.

### Specialistagenter
Den nuvarande agentkoden innehåller följande roller:

| Agent | Huvudområde |
|---|---|
| CEO | Samordning, prioritering och ledningsbrief |
| Research | Marknads- och informationsanalys |
| Sales | Försäljning och kundarbete |
| Developer | Teknisk analys och utvecklingsförslag |
| Marketing | Marknadsföring och tillväxt |
| Finance | Ekonomiska analyser och planering |
| Support | Kundsupport och serviceunderlag |

Agenternas faktiska åtkomst och åtgärder begränsas av vad som är implementerat och konfigurerat. En agentroll innebär inte automatiskt att externa system är anslutna.

### Företagets arbetsyta
Arbetsytans datamodell och API stöder dessa sektioner:
- **Projects:** projektinformation och status.
- **CRM:** kund- och affärsinformation.
- **Documents:** dokumentposter och beskrivningar.
- **Agents:** agenthistorik och godkännandeförfrågningar.
- **Settings:** företagsrelaterade inställningar.

### Godkännandecentral
Känsliga eller externa åtgärder ska hanteras genom ett mänskligt godkännande. Den nuvarande godkännandefunktionen kan skapa en begäran och spara ett beslut som godkänd eller avvisad.

**Ett godkännande är inte samma sak som att åtgärden utförs.** API:t sparar beslutet men exekverar inte automatiskt den föreslagna åtgärden.

## 3. Så använder du plattformen

1. Logga in via företagets konfigurerade autentisering.
2. Öppna företagets arbetsyta.
3. Lägg in eller uppdatera projekt, CRM-poster och annan relevant information.
4. Beskriv uppgiften tydligt för Arasko: mål, bakgrund, önskat resultat och eventuella begränsningar.
5. Läs Araskos sammanfattning och specialistagenternas underlag.
6. Kontrollera fakta, antaganden, risker och rekommenderade nästa steg.
7. Skapa en godkännandeförfrågan när ett arbetsflöde kräver mänskligt beslut.

### Exempel på instruktioner

- “Analysera våra tre viktigaste projekt och föreslå vad teamet bör prioritera den här veckan.”
- “Granska CRM-pipelinen och identifiera affärer som behöver uppföljning.”
- “Undersök den här marknaden och sammanfatta konkurrenter, risker och möjligheter.”
- “Granska den tekniska lösningen och skriv en prioriterad lista över förbättringar.”

## 4. Säkerhet och mänsklig kontroll

QELVION använder Clerk för autentisering och organisationskontext samt Supabase för lagring. Serverfunktioner använder en privat Supabase-nyckel. Hemliga nycklar ska aldrig placeras i klientkod eller i miljövariabler med prefixet `NEXT_PUBLIC_`.

Följande åtgärder ska kräva uttryckligt mänskligt godkännande:
- skicka e-post eller meddelanden till externa mottagare,
- publicera material externt,
- genomföra betalningar eller överföringar,
- ingå juridiska åtaganden,
- fatta beslut om anställning eller uppsägning,
- radera viktig data eller göra andra destruktiva ändringar,
- slå samman kod till huvudgrenen eller driftsätta till Production.

Företagsdata ska hållas åtskilda per organisation. Administratörsroller och behörigheter måste kontrolleras innan användare får godkänna organisationsåtgärder.

## 5. Data, historik och AI-användning

Den nuvarande lösningen har datamodeller för:
- arbetsyteposter,
- agentkörningar och resultat,
- aktivitetsloggar,
- AI-tokenanvändning,
- organisationer och medlemskap,
- prenumerations- och Stripe-händelser.

AI-användning kan registreras i token. Monetär kostnadsberäkning ska inte betraktas som verifierad förrän modellpriser och beräkningsregler har konfigurerats och testats.

Arasko använder en begränsad mängd aktuell företagsinformation som arbetskontext. Det är inte en garanti för att all historik eller alla dokument alltid är inlästa.

## 6. Integrationer och konfiguration

En driftsatt miljö kan behöva följande serverkonfiguration:

| Tjänst | Syfte |
|---|---|
| Clerk | Inloggning och organisationer |
| Supabase | Databas och lagring |
| OpenAI | Arasko och specialistagenter |
| Vercel | Hosting och Preview/Production-deployments |
| Stripe | Betalnings- och prenumerationsflöden |

Exakta miljövariabler ska hämtas från respektive leverantörs kontrollpanel och lagras som säkra serverhemligheter. Dela aldrig nycklar i supportärenden eller dokumentation.

Stripe-integrationens förekomst i kodbasen betyder inte att betalningar är aktiverade eller redo för riktiga kunder.

## 7. Funktioner under utveckling

Följande områden är delar av produktens plan och ska inte betraktas som färdiga om de inte har verifierats i aktuell driftsättning:
- uthållig bakgrundskö för långa agentuppgifter,
- schemalagda uppgifter och automatiska återförsök,
- fullständiga Operations- och HR-arbetsflöden,
- externa integrationer med verifierade behörigheter,
- fullständig analys- och rapporteringspanel,
- automatiserad testsvit och säkerhetsgranskning,
- färdig kommersiell prenumerations- och faktureringsprocess.

## 8. Support och felsökning

Om Arasko inte svarar:
1. Kontrollera att du är inloggad.
2. Kontrollera att OpenAI-anslutningen och servernyckeln är konfigurerade.
3. Kontrollera att Supabase-projektet är aktivt och att databasnycklarna är korrekta.
4. Kontrollera applikationens serverloggar och senaste deployment.
5. Kontakta företagets administratör om problemet gäller åtkomst eller organisation.

Om arbetsytan inte visar data ska administratören kontrollera organisationskoppling, databasstatus och användarens behörighet.

## 9. Produktstatus och release

Den aktiva utvecklingsgrenen är `feat/agent-foundation`. Ändringar ska granskas och testas innan de förs till huvudgrenen. Production-release kräver uttryckligt godkännande från produktägaren.

**Den här guiden beskriver produktens nuvarande arkitektur och avsedda arbetssätt. Den är inte ett löfte om att varje planerad funktion är tillgänglig i den aktuella versionen.**
