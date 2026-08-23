import type { Metadata } from "next";
import { ContentClusterHub } from "@/components/content-cluster-hub";
import { guides } from "@/data/guides";
import { lifestyleClusters } from "@/data/lifestyle";

const cluster = lifestyleClusters.fritidshus;
export const metadata: Metadata = { title: cluster.title, description: cluster.description, alternates: { canonical: cluster.href } };
export default function Page() { return <ContentClusterHub cluster={cluster} guides={guides} />; }
