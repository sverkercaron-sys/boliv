type InvoiceItem = { service_name: string; municipality_name: string; price_ex_vat: number };
type ContractForInvoice = {
  id: string; company_name: string; organization_number: string; contact_name: string;
  email: string; phone: string | null; billing_address: string; billing_postal_code: string;
  billing_city: string; payment_terms_days: number; items: InvoiceItem[];
};

const apiBase="https://api.fortnox.se/3";
function configuration(){const clientId=process.env.FORTNOX_CLIENT_ID;const clientSecret=process.env.FORTNOX_CLIENT_SECRET;const tenantId=process.env.FORTNOX_TENANT_ID;return clientId&&clientSecret&&tenantId?{clientId,clientSecret,tenantId}:null;}
export function isFortnoxConfigured(){return configuration()!==null;}

async function accessToken(){
 const c=configuration(); if(!c)throw new Error("FORTNOX_NOT_CONFIGURED");
 const response=await fetch("https://apps.fortnox.se/oauth-v1/token",{method:"POST",headers:{Authorization:`Basic ${Buffer.from(`${c.clientId}:${c.clientSecret}`).toString("base64")}`,"Content-Type":"application/x-www-form-urlencoded",TenantId:c.tenantId},body:new URLSearchParams({grant_type:"client_credentials",scope:"customer invoice"}),cache:"no-store"});
 if(!response.ok)throw new Error(`FORTNOX_AUTH_${response.status}`);return(await response.json() as{access_token:string}).access_token;
}
async function request<T>(token:string,path:string,init:RequestInit){
 const response=await fetch(`${apiBase}${path}`,{...init,headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",Accept:"application/json",...(init.headers??{})},cache:"no-store"});
 const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(`FORTNOX_API_${response.status}: ${JSON.stringify(body).slice(0,500)}`);return body as T;
}
export async function createAnnualPartnerInvoice(contract:ContractForInvoice){
 const token=await accessToken();
 const customer=await request<{Customer:{CustomerNumber:string}}>(token,"/customers",{method:"POST",body:JSON.stringify({Customer:{Name:contract.company_name,OrganisationNumber:contract.organization_number,Email:contract.email,Phone1:contract.phone||undefined,Address1:contract.billing_address,ZipCode:contract.billing_postal_code,City:contract.billing_city,CountryCode:"SE",Type:"COMPANY"}})});
 const customerNumber=customer.Customer.CustomerNumber;
 const invoice=await request<{Invoice:{DocumentNumber:string}}>(token,"/invoices",{method:"POST",body:JSON.stringify({Invoice:{CustomerNumber:customerNumber,InvoiceDate:new Date().toISOString().slice(0,10),DueDate:new Date(Date.now()+contract.payment_terms_days*86400000).toISOString().slice(0,10),YourReference:contract.contact_name,Remarks:`BoLiv Partner årsavtal. Avtals-ID ${contract.id}`,InvoiceRows:contract.items.map(item=>({Description:`BoLiv Partner – ${item.service_name} i ${item.municipality_name}, år 1`,DeliveredQuantity:1,Price:item.price_ex_vat,VAT:25}))}})});
 const invoiceNumber=invoice.Invoice.DocumentNumber;
 await request(token,`/invoices/${invoiceNumber}/email`,{method:"GET"});
 return{customerNumber,invoiceNumber};
}
export async function getFortnoxInvoice(invoiceNumber:string){
 const token=await accessToken();
 return request<{Invoice:{DocumentNumber:string;Balance:number;DueDate:string;Cancelled:boolean}}>(token,`/invoices/${invoiceNumber}`,{method:"GET"});
}
