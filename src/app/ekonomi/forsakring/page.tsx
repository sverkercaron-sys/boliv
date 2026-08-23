import type { Metadata } from "next";
import { HousingClusterHub } from "@/components/housing-cluster-hub";
export const metadata: Metadata = { title:"Försäkring för bostaden – villa, bostadsrätt och fritidshus", description:"Jämför bostadsförsäkringar och lär dig vad du ska göra när en skada inträffar.", alternates:{canonical:"/ekonomi/forsakring"} };
export default function Page(){ return <HousingClusterHub cluster="forsakring" />; }
