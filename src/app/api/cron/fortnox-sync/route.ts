import{NextRequest,NextResponse}from"next/server";import{createAdminClient}from"@/lib/supabase/admin";import{getFortnoxInvoice,isFortnoxConfigured}from"@/lib/fortnox";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 if(request.headers.get("authorization")!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!isFortnoxConfigured())return NextResponse.json({error:"Fortnox not configured"},{status:503});
 const admin=createAdminClient();const{data:contracts}=await admin.from("partner_contracts").select("id,organization_id,status,due_at,grace_period_days,fortnox_invoice_number,partner_contract_items(id,placement_id,status)").in("status",["pending_payment","overdue"]).not("fortnox_invoice_number","is",null);
 let activated=0,released=0,errors=0;
 for(const contract of contracts??[]){try{
  const result=await getFortnoxInvoice(contract.fortnox_invoice_number!);const items=contract.partner_contract_items??[];const placementIds=items.filter(item=>item.status==="sold").map(item=>item.placement_id);
  if(Number(result.Invoice.Balance)===0&&!result.Invoice.Cancelled){
   await Promise.all([admin.from("partner_contracts").update({status:"active",paid_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",contract.id),admin.from("partner_contract_items").update({status:"active"}).eq("contract_id",contract.id).eq("status","sold"),admin.from("partner_placements").update({status:"active",reserved_until:null,internal_notes:"Betald och aktiverad automatiskt",updated_at:new Date().toISOString()}).in("id",placementIds),admin.from("partner_organizations").update({status:"active",profile_published:true,updated_at:new Date().toISOString()}).eq("id",contract.organization_id)]);activated++;
  }else{const releaseDate=new Date(contract.due_at);releaseDate.setDate(releaseDate.getDate()+contract.grace_period_days);if(new Date()>releaseDate){
    await Promise.all([admin.from("partner_contracts").update({status:"cancelled",updated_at:new Date().toISOString()}).eq("id",contract.id),admin.from("partner_contract_items").update({status:"released",released_at:new Date().toISOString(),release_reason:"Obetald 14 dagar efter förfallodatum"}).eq("contract_id",contract.id).eq("status","sold"),admin.from("partner_placements").update({status:"ended",reserved_until:null,internal_notes:"Frisläppt automatiskt efter utebliven betalning",updated_at:new Date().toISOString()}).in("id",placementIds)]);released++;
   }else if(new Date()>new Date(contract.due_at)&&contract.status!=="overdue")await admin.from("partner_contracts").update({status:"overdue",updated_at:new Date().toISOString()}).eq("id",contract.id);
  }
 }catch{errors++;}}
 return NextResponse.json({checked:contracts?.length??0,activated,released,errors});
}