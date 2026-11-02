import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const roles = ["CEO", "Research", "Sales", "Developer", "Marketing", "Finance", "Support"] as const;
type AgentRole = (typeof roles)[number];
type ContextItem = { section:string; title:string; description:string|null; status:string; content:unknown; updated_at:string };

async function loadCompanyContext(userId:string) {
  const {data,error}=await getSupabaseAdmin().from("workspace_items")
    .select("section,title,description,status,content,updated_at")
    .eq("user_id",userId).in("section",["projects","crm","documents"])
    .order("updated_at",{ascending:false}).limit(30);
  if(error) throw error;
  return ((data??[]) as ContextItem[]).map(item=>{
    const record:Record<string,unknown>={section:item.section,title:item.title,description:item.description,status:item.status};
    if(item.section==="crm"&&item.content&&typeof item.content==="object"){
      const c=item.content as Record<string,unknown>;
      record.deal={company:typeof c.company==="string"?c.company:undefined,stage:typeof c.stage==="string"?c.stage:undefined,dealValue:typeof c.dealValue==="number"?c.dealValue:undefined,nextFollowUp:typeof c.nextFollowUp==="string"?c.nextFollowUp:undefined};
    }
    return record;
  });
}
async function runModel(client:OpenAI,role:AgentRole,task:string,context:unknown,extra="") {
  const response=await client.responses.create({
    model:process.env.OPENAI_MODEL||"gpt-5-mini",max_output_tokens:role==="CEO"?3600:2200,
    instructions:role==="CEO"
      ? "You are the CEO and chief-of-staff orchestrator of AI Company OS. You lead a team of specialist agents. Delegate work to relevant specialists, reconcile their findings, set priorities, identify dependencies and risks, and return one decisive executive brief. Never claim external actions were taken. All real-world actions require human approval."
      : `You are the ${role} specialist reporting to the CEO of AI Company OS. Deliver concise, evidence-aware work. Be practical, state assumptions, never invent facts, and never claim external actions were taken.`,
    input:`PRIVATE COMPANY WORKSPACE SNAPSHOT (JSON):\\n${JSON.stringify(context)}\\n\\nTASK FROM THE USER:\\n${task}\\n\\n${extra}`
  });
  return response.output_text||"No response was generated.";
}

export async function GET(){
  const {userId}=await auth();
  if(!userId)return NextResponse.json({error:"Authentication required"},{status:401});
  try{
    const {data,error}=await getSupabaseAdmin().from("agent_runs").select("id,agent_role,task,result,status,created_at").eq("user_id",userId).order("created_at",{ascending:false}).limit(20);
    if(error)throw error;
    return NextResponse.json({runs:data??[]});
  }catch(error){console.error("Agent history load failed",error);return NextResponse.json({error:"Could not load agent history. Check database configuration."},{status:503});}
}

export async function POST(request:Request){
  const {userId}=await auth();
  if(!userId)return NextResponse.json({error:"Authentication required"},{status:401});
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"AI provider is not configured. Add OPENAI_API_KEY to the server environment."},{status:503});
  try{
    const body:unknown=await request.json().catch(()=>null);
    if(!body||typeof body!=="object"||Array.isArray(body))return NextResponse.json({error:"A JSON object is required."},{status:400});
    const payload=body as Record<string,unknown>;
    const role=payload.role as AgentRole;
    const task=typeof payload.task==="string"?payload.task.trim():"";
    if(!roles.includes(role))return NextResponse.json({error:"Unknown agent role"},{status:400});
    if(!task||task.length>12000)return NextResponse.json({error:"Task must be between 1 and 12000 characters"},{status:400});
    const context=await loadCompanyContext(userId);
    const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY,timeout:60000,maxRetries:1});
    let result:string;
    const delegated:Array<{role:AgentRole;result:string}>=[];
    if(role==="CEO"){
      const lower=task.toLowerCase();
      const selected:AgentRole[]=[];
      const add=(r:AgentRole)=>{if(!selected.includes(r)&&selected.length<3)selected.push(r);};
      if(/sales|lead|customer|client|crm|بيع|مبيعات|عميل|زبون/.test(lower))add("Sales");
      if(/market|compet|research|customer segment|سوق|منافس|بحث/.test(lower))add("Research");
      if(/code|build|bug|technical|app|software|develop|برمج|تطبيق|تقني/.test(lower))add("Developer");
      if(/marketing|growth|brand|campaign|تسويق|نمو|حملة/.test(lower))add("Marketing");
      if(/budget|revenue|cost|price|finance|profit|ميزانية|تكلفة|سعر|ربح/.test(lower))add("Finance");
      if(selected.length===0){add("Research");add("Finance");add("Marketing");}
      const specialistResults=await Promise.all(selected.map(async specialist=>({role:specialist,result:await runModel(client,specialist,task,context,"Prepare findings for the CEO. Focus on evidence, options, risks, and recommended next actions.")})));
      delegated.push(...specialistResults);
      const teamBrief=delegated.map(x=>`## ${x.role} Agent\\n${x.result}`).join("\\n\\n");
      result=await runModel(client,"CEO",task,context,`You have delegated this request to your specialist team. Their reports follow. Synthesize them into an executive decision brief with: Executive summary; decisions; prioritized action plan (owner, sequence, success metric); dependencies; risks; and items that require the user's explicit approval. Do not invent agent work beyond these reports.\\n\\nSPECIALIST REPORTS:\\n${teamBrief}`);
    }else{
      result=await runModel(client,role,task,context);
    }
    const supabase=getSupabaseAdmin();
    const saved:unknown[]=[];
    for(const entry of [...delegated,{role,result}]){
      const {data,error}=await supabase.from("agent_runs").insert({user_id:userId,agent_role:entry.role.toLowerCase(),task:role==="CEO"?`[CEO delegation] ${task}`:task,result:entry.result,status:"completed"} as never).select("id,agent_role,task,result,status,created_at").single();
      if(error)throw error;
      saved.push(data);
      await supabase.from("activity_logs").insert({user_id:userId,event_type:"agent.completed",description:`${entry.role} agent completed a task`,metadata:{agent_role:entry.role.toLowerCase(),orchestrated_by:role==="CEO"?"ceo":null}} as never);
    }
    return NextResponse.json({role,result,run:saved[saved.length-1],delegated:delegated.map(x=>x.role),teamRuns:saved});
  }catch(error){console.error("Agent execution failed",error);return NextResponse.json({error:"The agent team could not complete or save this task."},{status:500});}
}
