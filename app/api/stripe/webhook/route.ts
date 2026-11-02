import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime="nodejs";
function validSignature(raw:string,header:string,secret:string){
 const parts=header.split(",").map(x=>x.split("="));const timestamp=parts.find(x=>x[0]==="t")?.[1];const signatures=parts.filter(x=>x[0]==="v1").map(x=>x[1]);
 if(!timestamp||!signatures.length||Math.abs(Date.now()/1000-Number(timestamp))>300)return false;
 const expected=createHmac("sha256",secret).update(timestamp+"."+raw).digest("hex");
 return signatures.some(sig=>{try{const a=Buffer.from(sig,"hex"),b=Buffer.from(expected,"hex");return a.length===b.length&&timingSafeEqual(a,b);}catch{return false;}});
}
async function save(userId:string,customerId:string|null,subscriptionId:string|null,status:string,plan:string|null,periodEnd:number|null,cancelAtPeriodEnd:boolean){
 const db=getSupabaseAdmin();const content={customerId,subscriptionId,plan,currentPeriodEnd:periodEnd?new Date(periodEnd*1000).toISOString():null,cancelAtPeriodEnd};
 const {data,error}=await db.from("workspace_items").select("id").eq("user_id",userId).eq("section","settings").eq("title","Billing subscription").maybeSingle();if(error)throw error;
 const values={description:"Stripe subscription state synced by verified webhook.",content,status,updated_at:new Date().toISOString()};
 const result=data?await db.from("workspace_items").update(values as never).eq("id",data.id).eq("user_id",userId):await db.from("workspace_items").insert({user_id:userId,section:"settings",title:"Billing subscription",...values} as never);
 if(result.error)throw result.error;
}
export async function POST(request:NextRequest){
 const secret=process.env.STRIPE_WEBHOOK_SECRET;if(!secret)return NextResponse.json({error:"Webhook is not configured."},{status:503});
 const raw=await request.text();const signature=request.headers.get("stripe-signature")||"";
 if(!validSignature(raw,signature,secret))return NextResponse.json({error:"Invalid webhook signature."},{status:400});
 try{
  const event=JSON.parse(raw);const obj=event.data?.object;
  if(event.type==="checkout.session.completed"){
   const userId=obj?.metadata?.user_id||obj?.client_reference_id;
   if(userId&&obj?.customer)await save(userId,String(obj.customer),obj.subscription?String(obj.subscription):null,"active",null,null,false);
  }else if(event.type==="customer.subscription.updated"||event.type==="customer.subscription.deleted"){
   const userId=obj?.metadata?.user_id;
   if(userId)await save(userId,String(obj.customer),String(obj.id),obj.status||"inactive",obj.items?.data?.[0]?.price?.id||null,obj.current_period_end||null,Boolean(obj.cancel_at_period_end));
  }
  return NextResponse.json({received:true});
 }catch(error){console.error("[stripe:webhook]",error);return NextResponse.json({error:"Webhook processing failed."},{status:500});}
}
