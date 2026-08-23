import type { Metadata } from "next";
import { TechnicalClusterHub } from "@/components/technical-cluster-hub";
export const metadata: Metadata = { title: "Fukt i hus – upptäcka, mäta och åtgärda", description: "Guider om fukt i källare, krypgrund och vind samt professionell fuktmätning och utredning.", alternates: { canonical: "/underhalla/fukt" } };
export default function Page() { return <TechnicalClusterHub clusterSlug="fukt" />; }
