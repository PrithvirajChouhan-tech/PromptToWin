import type {Express} from 'express';
import {SUPER_QUESTS,visitCheckError,demoTicketQuote} from './src/data/superCard';
type Store={records:(kind:string)=>any[];put:(kind:string,row:any)=>any;reward:(owner:string,points:number,reason:string,key:string)=>void;transaction:(fn:()=>void)=>void};
export function installSuperCard(app:Express,{records,put,reward,transaction}:Store){
 app.post('/api/platform/quest',(req,res)=>{
  const user=res.locals.user;
  if(user.role!=='tourist')return res.status(403).json({error:'Traveller membership required.'});
  const site=SUPER_QUESTS.find(q=>q.code===req.body.code);
  if(!site)return res.status(400).json({error:'Choose a place-visit quest. Quiz answers no longer complete quests.'});
  const key=`quest-${user.id}-${site.code}`;
  if(records('quest').some(r=>r.id===key))return res.status(400).json({error:'You have already completed this visit quest.'});
  const error=visitCheckError(site,req.body.location);
  if(error)return res.status(400).json({error});
  // Keep the site and completion time, not the traveller's precise device coordinates.
  transaction(()=>{put('quest',{id:key,owner:user.id,code:site.code,site:site.title,method:'device-location',createdAt:Date.now()});reward(user.id,site.points,`${site.title} · visit quest`,key);});
  res.json({ok:true,points:site.points});
 });
 app.post('/api/platform/super-wallet/:action',(req,res)=>{
  const user=res.locals.user,p=req.body,action=req.params.action;
  if(user.role!=='tourist')return res.status(403).json({error:'Traveller membership required.'});
  if(!['recharge','book'].includes(String(action)))return res.status(404).json({error:'Unknown demo wallet action.'});
  if(typeof p.requestId!=='string'||! /^[a-zA-Z0-9-]{16,80}$/.test(p.requestId))return res.status(400).json({error:'A valid transaction reference is required.'});
  const key=`super-wallet-${user.id}-${p.requestId}`;
  const owned=records('super-wallet').filter(r=>r.owner===user.id);
  const old=owned.find(r=>r.id===key);
  const fingerprint=JSON.stringify(action==='recharge'?[action,p.amount,p.method]:[action,p.siteId,p.visitor,p.quantity,p.date]);
  if(old)return old.fingerprint===fingerprint?res.json(old):res.status(409).json({error:'This transaction reference was used for different details.'});
  const balance=owned.reduce((sum,r)=>sum+r.amountPaise,0);
  let details:any;
  if(action==='recharge'){
   if(!Number.isInteger(p.amount)||p.amount<100||p.amount>20000||!['international-card','cash-desk'].includes(p.method))return res.status(400).json({error:'Choose a demo recharge of ₹100–₹20,000 and a recharge method.'});
   if(balance+p.amount*100>5000000)return res.status(400).json({error:'The demo wallet limit is ₹50,000.'});
   details={amountPaise:p.amount*100,method:p.method,title:'Demo wallet recharge'};
  }else{
   const quote=demoTicketQuote(p.siteId,p.visitor,p.quantity);
   const date=typeof p.date==='string'?p.date:'';
   const parsed=new Date(date+'T00:00:00Z');
   if(!quote||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||date<new Date().toISOString().slice(0,10))return res.status(400).json({error:'Choose a valid site, visitor category, quantity and date from today onward.'});
   if(balance<quote.total)return res.status(400).json({error:'Insufficient demo wallet balance. Recharge before booking.'});
   details={amountPaise:-quote.total,title:`Demo booking · ${quote.site.name}`,siteId:p.siteId,visitor:p.visitor,quantity:p.quantity,date,subtotalPaise:quote.subtotal,discountPaise:quote.discount,status:'demo-confirmed'};
  }
  const entry={id:key,owner:user.id,action,demo:true,...details,fingerprint,createdAt:Date.now()};
  put('super-wallet',entry);res.json(entry);
 });
}
