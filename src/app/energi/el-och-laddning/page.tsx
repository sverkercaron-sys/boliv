import type { Metadata } from "next";
import { TechnicalClusterHub } from "@/components/technical-cluster-hub";
export const metadata: Metadata = { title: "El och laddning – säkra guider för hemmet", description: "Guider om elanläggning, jordfelsbrytare, elcentral, laddbox och att anlita elektriker.", alternates: { canonical: "/energi/el-och-laddning" } };
export default function Page() { return <TechnicalClusterHub clusterSlug="el-och-laddning" />; }
