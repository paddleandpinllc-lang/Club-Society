import assert from 'node:assert/strict';
import { buildConfirmation, eventDateLabel, sendConfirmation } from '../lib/paddle-pint-email.js';
import { onRequest } from '../functions/api/paddle-pint.js';

const payload = {type:'round_robin_event',first_name:'Emily',last_name:'Example',email:'EMILY@example.test',event_date:'2026-12-07',additional_players:[]};
const message = buildConfirmation(payload);
assert.equal(message.from,'Paddle + Pint <info@paddleandpin.com>');
assert.equal(message.reply_to,'craig@paddleandpin.com');
assert.deepEqual(message.to,['emily@example.test']);
assert.match(message.text,/Emily Example/);
assert.match(message.html,/Monday, December 7, 2026/);
assert.match(message.html,/6:00 PM \(Eastern Time\)/);
assert.match(message.html,/South Main Brewing Warehouse/);
assert.match(message.html,/PP_NEW_CREST.png/);
assert.equal(eventDateLabel('Monday, December 14, 2026'),'Monday, December 14, 2026');
assert.throws(()=>eventDateLabel('bad date'));
const escaped = buildConfirmation({...payload,first_name:'<img src=x onerror=alert(1)>',additional_players:[{first_name:'A&B',last_name:'<Guest>'}]});
assert.ok(!escaped.html.includes('<img src=x'));
assert.match(escaped.html,/&lt;img/);
assert.match(escaped.html,/A&amp;B &lt;Guest&gt;/);

function mockDb({failSave=false,previous={first_name:'Returning',last_name:'Player'}}={}) {
  const records = new Map(); const calls = [];
  return {records,calls,prepare(sql){return {bind(...args){return {
    async first(){
      if(sql.includes('SELECT first_name'))return previous;
      return records.get(args[0]) || null;
    },
    async run(){
      calls.push({sql,args});
      if(sql.includes('INSERT INTO paddle_pint_submissions')){
        if(failSave)throw Error('Database unavailable');
        return {success:true,meta:{last_row_id:42}};
      }
      if(sql.includes('INSERT OR IGNORE'))records.set(args[0],records.get(args[0]) || {status:'pending'});
      if(sql.includes("status = 'accepted'"))records.set(args[1],{status:'accepted',provider_id:args[0]});
      if(sql.includes("status = 'failed'"))records.set(args[1],{status:'failed',last_error:args[0]});
      return {success:true};
    }
  }; } }; } };
}
const DB = mockDb();
const env = {DB,RESEND_API_KEY:'test-placeholder',PADDLE_PINT_EMAIL_ENABLED:'true'};
let sends = [];
const accepted = async (url,options)=>{sends.push({url,options});return Response.json({id:'email-test-id'});};
assert.equal((await sendConfirmation(env,payload,42,accepted)).status,'accepted');
assert.equal(sends[0].options.headers['Idempotency-Key'],'paddle-pint-signup/42');
assert.equal(sends[0].url,'https://api.resend.com/emails');
assert.deepEqual(JSON.parse(sends[0].options.body).to,['emily@example.test']);
await sendConfirmation(env,payload,42,accepted);
assert.equal(sends.length,1,'persisted accepted receipt suppresses a duplicate');
assert.equal((await sendConfirmation({...env,PADDLE_PINT_EMAIL_ENABLED:'false'},payload,43,accepted)).status,'disabled');
assert.equal((await sendConfirmation({...env,RESEND_API_KEY:undefined},payload,43,accepted)).status,'disabled');
await assert.rejects(()=>sendConfirmation(env,payload,undefined,accepted));

let attempts=0;
const retryDb=mockDb();
await sendConfirmation({...env,DB:retryDb},payload,55,async ()=>{
  attempts++;
  return attempts===1 ? new Response('',{status:503}) : Response.json({id:'retry-id'});
});
assert.equal(attempts,2);
assert.equal(retryDb.records.get(55).status,'accepted');

const originalFetch=globalThis.fetch;
const originalError=console.error;
console.error=()=>{};
try {
  const failedDb=mockDb(); let failures=0;
  assert.equal((await sendConfirmation({...env,DB:failedDb},payload,56,async ()=>{failures++;return new Response('',{status:403});})).status,'failed');
  assert.equal(failures,1,'permanent provider errors do not retry');
  assert.equal(failedDb.records.get(56).last_error,'resend_http_403');
  async function signup(body,db=mockDb(),provider=accepted){
    globalThis.fetch=provider;
    const pending=[];
    const response=await onRequest({request:new Request('https://example.test/api/paddle-pint',{method:'POST',headers:{Origin:'https://www.paddleandpin.com','Content-Type':'application/json'},body:JSON.stringify(body)}),env:{...env,DB:db},waitUntil(promise){pending.push(promise);}});
    await Promise.all(pending);
    return {response,db};
  }
  sends=[];
  assert.equal((await signup(payload)).response.status,200);
  assert.equal(sends.length,1);
  assert.equal((await signup(payload,mockDb({failSave:true}))).response.status,500);
  assert.equal(sends.length,1,'no email when saving registration fails');
  assert.equal((await signup({...payload,website:'spam'})).response.status,400);
  assert.equal(sends.length,1,'spam submissions send no email');
  assert.equal((await signup({...payload,type:'free_shirt_claim',name:'Example',shirt_size:'M',selected_shirt:'Test'})).response.status,200);
  assert.equal(sends.length,1,'shirt claims do not trigger event confirmations');
  const returningDate=new Date();returningDate.setUTCMonth(returningDate.getUTCMonth()+1,1);
  while(returningDate.getUTCDay()!==1)returningDate.setUTCDate(returningDate.getUTCDate()+1);
  assert.equal((await signup({...payload,returning_player:true,event_date:returningDate.toISOString().slice(0,10)})).response.status,200);
  assert.match(JSON.parse(sends.at(-1).options.body).html,/Returning/);
  assert.equal((await signup(payload,mockDb(),async ()=>new Response('',{status:403}))).response.status,200,'email rejection never loses a saved signup');
} finally {globalThis.fetch=originalFetch;console.error=originalError;}
console.log('Confirmation template, escaping, dates, persistence, idempotency, retries, new/returning signup, spam, shirt exclusion, and save/provider failure checks passed. No live emails or signups created.');
