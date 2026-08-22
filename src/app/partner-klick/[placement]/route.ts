import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ placement: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { placement } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("partner_placements")
    .select("id,partner_organizations(website_url)")
    .eq("id", placement)
    .eq("status", "active")
    .single();
  const organization = data?.partner_organizations as unknown as { website_url: string | null } | null;
  if (!data || !organization?.website_url) return NextResponse.redirect(new URL("/hitta-foretag", request.url));

  await supabase.from("partner_events").insert({
    placement_id: data.id,
    event_type: "website_click",
    source_path: request.headers.get("referer"),
  });
  return NextResponse.redirect(organization.website_url);
}
