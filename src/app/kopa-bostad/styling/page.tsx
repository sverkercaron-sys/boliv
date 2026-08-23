import type { Metadata } from "next";
import { HousingClusterHub } from "@/components/housing-cluster-hub";
export const metadata: Metadata = { title:"Styling inför bostadsförsäljning – guider och checklistor", description:"Styla, fotografera och förbered villa eller bostadsrätt inför visning utan onödiga projekt.", alternates:{canonical:"/kopa-bostad/styling"} };
export default function Page(){ return <HousingClusterHub cluster="styling" />; }
