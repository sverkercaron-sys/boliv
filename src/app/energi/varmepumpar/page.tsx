import type { Metadata } from "next";
import { TechnicalClusterHub } from "@/components/technical-cluster-hub";
export const metadata: Metadata = { title: "Värmepumpar – val, offert och drift", description: "Jämför bergvärme, luft-vatten och luft-luft och lär dig granska kalkyl, dimensionering och drift.", alternates: { canonical: "/energi/varmepumpar" } };
export default function Page() { return <TechnicalClusterHub clusterSlug="varmepumpar" />; }
