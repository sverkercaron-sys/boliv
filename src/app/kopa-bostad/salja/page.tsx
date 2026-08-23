import type { Metadata } from "next";
import { HousingClusterHub } from "@/components/housing-cluster-hub";
export const metadata: Metadata = { title:"Sälja bostad – guider om mäklare, kostnader och deklaration", description:"Planera en trygg bostadsförsäljning från värdering och mäklarval till tillträde och deklaration.", alternates:{canonical:"/kopa-bostad/salja"} };
export default function Page(){ return <HousingClusterHub cluster="salja" />; }
