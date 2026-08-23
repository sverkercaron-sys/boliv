import type { Metadata } from "next";
import { HousingClusterHub } from "@/components/housing-cluster-hub";
export const metadata: Metadata = { title:"Bolån – guider om ränta, amortering och lånelöfte", description:"Förstå bolån, lånelöfte, amortering, bindningstid och hur du jämför banker.", alternates:{canonical:"/ekonomi/bolan"} };
export default function Page(){ return <HousingClusterHub cluster="bolan" />; }
