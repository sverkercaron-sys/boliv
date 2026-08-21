import {
  Banknote,
  Bolt,
  BrickWall,
  Building2,
  Flame,
  Hammer,
  Home,
  KeyRound,
  Leaf,
  Paintbrush,
  ShieldCheck,
  ShowerHead,
} from "lucide-react";

export const categories = [
  { title: "Bygga nytt", description: "Från tomt och bygglov till inflyttning.", href: "/bygga", icon: Building2 },
  { title: "Renovera", description: "Planera rätt, undvik misstagen och håll budget.", href: "/renovera", icon: Hammer },
  { title: "Underhålla", description: "Årskalender och guider för ett friskt hus.", href: "/underhalla", icon: BrickWall },
  { title: "Energi & värme", description: "Sänk förbrukningen och förbättra klimatet.", href: "/energi", icon: Flame },
  { title: "El, VVS & teknik", description: "Trygga installationer och ett smartare hem.", href: "/installationer", icon: Bolt },
  { title: "Kök & badrum", description: "Material, kostnader, regler och inspiration.", href: "/rum/kok-badrum-tvattstuga", icon: ShowerHead },
  { title: "Inredning", description: "Färg, möblering, ljus och funktion.", href: "/inredning", icon: Paintbrush },
  { title: "Trädgård", description: "Odling, altan, pool och utemiljö.", href: "/tradgard", icon: Leaf },
  { title: "Köpa bostad", description: "Visning, besiktning, bolån och kontrakt.", href: "/kopa-bostad", icon: KeyRound },
  { title: "Sälja bostad", description: "Värdering, mäklare, styling och skatt.", href: "/salja-bostad", icon: Home },
  { title: "Boendeekonomi", description: "Lån, driftkostnader, avdrag och kalkyler.", href: "/ekonomi", icon: Banknote },
  { title: "Juridik & trygghet", description: "Regler, avtal, försäkring och säkerhet.", href: "/juridik", icon: ShieldCheck },
] as const;
