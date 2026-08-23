"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAnnualPartnerInvoice, isFortnoxConfigured } from "@/lib/fortnox";

type PurchaseResult = { contract_id: string; placement_id: string; price_ex_vat: number };

function checkoutError(municipality: string, message: string): never {
  redirect(`/partner/ansok?kommun=${encodeURIComponent(municipality)}&error=${encodeURIComponent(message)}`);
}

export async function purchasePartnerMarket(formData: FormData) {
  const service = String(formData.get("service") ?? "").trim();
  const municipality = String(formData.get("municipality") ?? "").trim();
  const companyName = String(formData.get("companyName") ?? "").trim();
  const organizationNumber = String(formData.get("organizationNumber") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const billingAddress = String(formData.get("billingAddress") ?? "").trim();
  const billingPostalCode = String(formData.get("billingPostalCode") ?? "").trim();
  const billingCity = String(formData.get("billingCity") ?? "").trim();
  const termsAccepted = formData.get("termsAccepted") === "yes";
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");

  if (!isFortnoxConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    checkoutError(municipality, "Kassan öppnar så snart Fortnox-kopplingen är aktiverad.");
  }
  if (!service || !municipality || !companyName || !organizationNumber || !contactName ||
      !email.includes("@") || !billingAddress || !billingPostalCode || !billingCity ||
      !termsAccepted || !idempotencyKey) {
    checkoutError(municipality, "Fyll i samtliga obligatoriska uppgifter och godkänn avtalsvillkoren.");
  }

  const headerStore = await headers();
  const acceptedIp = (headerStore.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("purchase_partner_market", {
    p_service_slug: service,
    p_municipality_slug: municipality,
    p_company_name: companyName,
    p_organization_number: organizationNumber,
    p_contact_name: contactName,
    p_email: email,
    p_phone: phone,
    p_billing_address: billingAddress,
    p_billing_postal_code: billingPostalCode,
    p_billing_city: billingCity,
    p_terms_version: "partner-2026-01",
    p_idempotency_key: idempotencyKey,
    p_accepted_ip: acceptedIp,
  });

  if (error || !data?.[0]) {
    const unavailable = error?.message?.includes("MARKET_UNAVAILABLE");
    checkoutError(municipality, unavailable ? "Platsen hann tyvärr bokas av ett annat företag." : "Avtalet kunde inte skapas. Försök igen.");
  }

  const purchase = data[0] as PurchaseResult;
  const admin = createAdminClient();
  const { data: contract, error: contractError } = await admin
    .from("partner_contracts")
    .select("id,company_name,organization_number,contact_name,email,phone,billing_address,billing_postal_code,billing_city,price_ex_vat,payment_terms_days,organization_id")
    .eq("id", purchase.contract_id)
    .single();

  if (contractError || !contract) checkoutError(municipality, "Avtalet skapades men faktureringen kunde inte startas.");

  try {
    const invoice = await createAnnualPartnerInvoice(contract);
    await Promise.all([
      admin.from("partner_contracts").update({
        status: "active",
        fortnox_customer_number: invoice.customerNumber,
        fortnox_invoice_number: invoice.invoiceNumber,
        invoice_created_at: new Date().toISOString(),
        invoice_error: null,
        updated_at: new Date().toISOString(),
      }).eq("id", purchase.contract_id),
      admin.from("partner_placements").update({
        status: "active",
        reserved_until: null,
        internal_notes: `Automatiskt årsavtal. Fortnox-faktura ${invoice.invoiceNumber}`,
        updated_at: new Date().toISOString(),
      }).eq("id", purchase.placement_id),
      admin.from("partner_organizations").update({ status: "active", updated_at: new Date().toISOString() }).eq("id", contract.organization_id),
    ]);
  } catch (invoiceError) {
    const message = invoiceError instanceof Error ? invoiceError.message.slice(0, 500) : "Okänt Fortnox-fel";
    await Promise.all([
      admin.from("partner_contracts").update({ status: "invoice_failed", invoice_error: message, updated_at: new Date().toISOString() }).eq("id", purchase.contract_id),
      admin.from("partner_placements").update({ status: "ended", reserved_until: null, internal_notes: "Automatisk fakturering misslyckades", updated_at: new Date().toISOString() }).eq("id", purchase.placement_id),
    ]);
    checkoutError(municipality, "Fakturan kunde inte skapas. Ingen partnerplats aktiverades.");
  }

  redirect(`/partner/klart?avtal=${purchase.contract_id}`);
}
