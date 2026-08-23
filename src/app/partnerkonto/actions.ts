"use server";
import{revalidatePath}from"next/cache";import{redirect}from"next/navigation";import{createClient}from"@/lib/supabase/server";
function safeName(name:string){return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]/g,"-").replace(/-+/g,"-");}
async function partnerContext(){const supabase=await createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)redirect("/logga-in");const{data:membership}=await supabase.from("partner_members").select("organization_id").eq("user_id",user.id).limit(1).single();if(!membership)redirect("/");return{supabase,user,organizationId:membership.organization_id};}
export async function updatePartnerProfile(formData:FormData){
 const{supabase,organizationId}=await partnerContext();const name=String(formData.get("name")??"").trim();const description=String(formData.get("description")??"").trim();const publicEmail=String(formData.get("publicEmail")??"").trim();const phone=String(formData.get("phone")??"").trim();const websiteUrl=String(formData.get("websiteUrl")??"").trim();const address=String(formData.get("address")??"").trim();const postalCode=String(formData.get("postalCode")??"").trim();const city=String(formData.get("city")??"").trim();const openingHours=String(formData.get("openingHours")??"").trim();
 if(name.length<2)redirect("/partnerkonto?error=Ange+företagsnamn");
 const{error}=await supabase.from("partner_organizations").update({name,description:description||null,public_email:publicEmail||null,phone:phone||null,website_url:websiteUrl||null,address:address||null,postal_code:postalCode||null,city:city||null,opening_hours:openingHours||null,updated_at:new Date().toISOString()}).eq("id",organizationId);
 if(error)redirect(`/partnerkonto?error=${encodeURIComponent(error.message)}`);revalidatePath("/partnerkonto");redirect("/partnerkonto?success=Företagssidan+är+uppdaterad");
}
export async function uploadPartnerLogo(formData:FormData){
 const{supabase,organizationId}=await partnerContext();const file=formData.get("logo");if(!(file instanceof File)||file.size===0)redirect("/partnerkonto?error=Välj+en+logotyp");
 if(!["image/jpeg","image/png","image/webp","image/svg+xml"].includes(file.type)||file.size>5*1024*1024)redirect("/partnerkonto?error=Logotypen+måste+vara+JPG,+PNG,+WebP+eller+SVG+och+högst+5+MB");
 const path=`${organizationId}/logo-${crypto.randomUUID()}-${safeName(file.name)}`;const{error:uploadError}=await supabase.storage.from("partner-assets").upload(path,file,{contentType:file.type});if(uploadError)redirect("/partnerkonto?error=Logotypen+kunde+inte+laddas+upp");
 const{error}=await supabase.from("partner_organizations").update({logo_path:path,updated_at:new Date().toISOString()}).eq("id",organizationId);if(error){await supabase.storage.from("partner-assets").remove([path]);redirect("/partnerkonto?error=Logotypen+kunde+inte+sparas");}
 revalidatePath("/partnerkonto");redirect("/partnerkonto?success=Logotypen+är+sparad");
}