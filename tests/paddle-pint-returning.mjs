import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/paddle-pint.js';
// Choose the next first Monday, independent of when tests run.
const date = new Date(); date.setUTCMonth(date.getUTCMonth() + 1, 1); date.setUTCHours(12,0,0,0);
while (date.getUTCDay() !== 1) date.setUTCDate(date.getUTCDate() + 1);
const event_date = date.toLocaleDateString('en-US', {timeZone:'UTC',weekday:'long',month:'long',day:'numeric',year:'numeric'});
let saved, lookup;
async function request(payload, previous = {first_name:'Test',last_name:'Player'}) {
  saved = null; lookup = null;
  const DB = { prepare(sql) { return { bind(...args) { return {
    async first() { lookup = args; return previous; },
    async run() { saved = args; return {success:true}; }
  }; } }; } };
  const response = await onRequest({request:new Request('https://example.test/api/paddle-pint',{method:'POST',headers:{Origin:'https://www.paddleandpin.com','Content-Type':'application/json'},body:JSON.stringify(payload)}),env:{DB}});
  return {status:response.status,body:await response.json()};
}
const returning = {type:'round_robin_event',returning_player:true,email:'TEST@example.com',event_date,additional_players:[]};
assert.equal((await request(returning)).status,200);
assert.deepEqual(lookup,['test@example.com']);
assert.equal(saved[1],'Test'); assert.equal(saved[2],'Player'); assert.equal(saved[8],null);
assert.match(saved[12],/Returning player/);
assert.equal((await request({...returning,shirt_size:'XL',selected_shirt:'Do not claim'})).status,200);
assert.equal(saved[8],null); assert.equal(saved[10],null);
assert.equal((await request(returning,null)).status,422); assert.equal(saved,null);
assert.equal((await request({...returning,additional_players:[{first_name:'Guest',last_name:'One'}]})).status,200);
assert.equal(JSON.parse(saved[11])[0].last_name,'One');
assert.equal((await request({...returning,additional_players:[{first_name:'Guest'}]})).status,400);
assert.equal((await request({...returning,event_date:'Monday, January 1, 2001'})).status,400);
assert.equal((await request({...returning,event_date:'not a date'})).status,400);
assert.equal((await request({...returning,email:'invalid'})).status,400);
assert.equal((await request({...returning,website:'spam'})).status,400);
assert.equal((await request(null)).status,400);
assert.equal((await request({type:'round_robin_event',first_name:'New',last_name:'Player',email:'new@example.com',event_date})).status,200);
assert.equal(saved[1],'New'); assert.equal(lookup,null);
assert.equal((await request({type:'free_shirt_claim',name:'Test Player',email:'test@example.com',shirt_size:'M',selected_shirt:'Test shirt'})).status,200);
assert.equal(saved[8],'M');
console.log('12 API cases passed; mock database only. No live signups created.');

