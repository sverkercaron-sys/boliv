# Anslut Supabase till BoLiv

## 1. Skapa projektet

Skapa ett nytt Supabase-projekt för BoLiv. Välj region nära svenska användare och spara databaslösenordet i en lösenordshanterare.

## 2. Kör migrationen

Öppna SQL Editor i Supabase och kör innehållet i:

`supabase/migrations/202608210001_initial_schema.sql`

Migrationen skapar profiler, roller, innehåll, fastigheter, projekt, underhåll, dokument, kommuner, tjänster och partnerplatser samt grundläggande Row Level Security.

## 3. Hämta API-uppgifter

I Supabase Project Settings → API behövs:

- Project URL
- anon/public key
- service_role key

Service role-nyckeln är hemlig och får aldrig exponeras i webbläsaren eller committas till GitHub.

## 4. Lägg in variabler i Vercel

I Vercel → BoLiv → Settings → Environment Variables:

```text
NEXT_PUBLIC_SUPABASE_URL=<Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
NEXT_PUBLIC_SITE_URL=https://boliv-olive.vercel.app
```

Lägg dem i Production, Preview och Development.

## 5. Konfigurera Auth

I Supabase → Authentication → URL Configuration:

- Site URL: `https://boliv-olive.vercel.app`
- Redirect URL: `https://boliv-olive.vercel.app/auth/callback`

Lägg senare till `https://boliv.se/auth/callback` när domänen är ansluten.

Aktivera e-postinloggning. E-postbekräftelse rekommenderas i produktion.

## 6. Deploya på nytt

Gör en ny Vercel-deployment efter att variablerna sparats.

## 7. Funktionstest

1. Skapa ett konto.
2. Bekräfta e-postadressen.
3. Logga in.
4. Lägg till en fastighet.
5. Lägg till en underhållsuppgift.
6. Logga ut och in igen.
7. Kontrollera att en annan användare inte kan se fastigheten.

## Säkerhet före extern lansering

- Skapa privata Storage-buckets för dokument.
- Lägg till Storage policies.
- Aktivera rate limiting och spamskydd.
- Bestäm gallringspolicy för leads och dokument.
- Verifiera säkerhetskopiering och återställning.
