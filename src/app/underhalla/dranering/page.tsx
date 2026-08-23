import type { Metadata } from "next";
import { TechnicalClusterHub } from "@/components/technical-cluster-hub";
export const metadata: Metadata = { title: "Dränering – skydda huset mot mark- och dagvatten", description: "Guider om dränering, dagvatten, kostnader, offerter och kontroll efter markarbetet.", alternates: { canonical: "/underhalla/dranering" } };
export default function Page() { return <TechnicalClusterHub clusterSlug="dranering" />; }
