import type { Metadata } from "next";
import { TechnicalClusterHub } from "@/components/technical-cluster-hub";
export const metadata: Metadata = { title: "Radon – mätning, källor och åtgärder", description: "Guider om radonmätning, markradon, blåbetong och åtgärder för en säkrare bostad.", alternates: { canonical: "/underhalla/radon" } };
export default function Page() { return <TechnicalClusterHub clusterSlug="radon" />; }
