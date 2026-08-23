import type { Metadata } from "next";
import { TechnicalClusterHub } from "@/components/technical-cluster-hub";
export const metadata: Metadata = { title: "Solceller – kalkyl, tak, batteri och installation", description: "Oberoende guider om solceller, lönsamhet, takkontroll, batteri, offerter och säker installation.", alternates: { canonical: "/energi/solceller" } };
export default function Page() { return <TechnicalClusterHub clusterSlug="solceller" />; }
