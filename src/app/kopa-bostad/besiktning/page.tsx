import type { Metadata } from "next";
import { HousingClusterHub } from "@/components/housing-cluster-hub";
export const metadata: Metadata = { title:"Besiktning av hus – guider om undersökningsplikt och risker", description:"Förstå besiktningen, protokollet, riskkonstruktioner, undersökningsplikt och besiktningsklausul.", alternates:{canonical:"/kopa-bostad/besiktning"} };
export default function Page(){ return <HousingClusterHub cluster="besiktning" />; }
