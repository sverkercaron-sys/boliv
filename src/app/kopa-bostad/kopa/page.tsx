import type { Metadata } from "next";
import { HousingClusterHub } from "@/components/housing-cluster-hub";
export const metadata: Metadata = { title:"Köpa bostad – guider från lånelöfte till tillträde", description:"BoLivs samlade guider om bostadsköp, budgivning, kontrakt, bostadsrätt och fritidshus.", alternates:{canonical:"/kopa-bostad/kopa"} };
export default function Page(){ return <HousingClusterHub cluster="kopa" />; }
