import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return <main className="not-found-page"><Home /><span className="kicker">404</span><h1>Den här sidan är på väg</h1><p>BoLiv växer steg för steg. Sidan du sökte är ännu inte publicerad.</p><Link href="/" className="button"><ArrowLeft /> Till startsidan</Link></main>;
}
