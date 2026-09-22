import {NAMES,WEEKS,today,counts,average,isBelowAverage} from './data.js';
const $=s=>document.querySelector(s), KEY='voyageur-pizza-2026-v1';
let state={}, selected='', past=false, month='2026-10', activeWeek=null, busy=true;
try{state=JSON.parse(localStorage.getItem('voyageur-pizza-2026-cloud-cache')||'{}');}catch{}
try{selected=localStorage.getItem(KEY+'-name')||'';}catch{}
if(!NAMES.includes(selected))selected='';
state=Object.fromEntries(WEEKS.filter(w=>w.date).map(w=>[w.id,{crew:NAMES.filter(n=>Array.isArray(state?.[w.id]?.crew)&&state[w.id].crew.includes(n)),attended:NAMES.filter(n=>Array.isArray(state?.[w.id]?.attended)&&state[w.id].attended.includes(n))}]));
let persist=async()=>{throw Error('Firebase is not connected. Please reload to try again.');};
function notice(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>$('#toast').classList.remove('show'),3200);}
function status(s,error=false){if(error)notice(s);}
function fmt(date,options){return new Intl.DateTimeFormat('en-CA',{...options,timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));}
function availableMonths(){return [...new Set(WEEKS.filter(w=>past?(w.date||w.id)<today():(w.date||w.id)>=today()).map(w=>w.month))];}
function normalizeMonth(){const months=availableMonths();if(!months.includes(month))month=months[0]||'2026-10';}
function render(){
 const day=today(), stats=counts(state,day), avg=average(stats), upcoming=WEEKS.filter(w=>w.date&&w.date>=day), next=upcoming[0];
 $('#next-date').textContent=next?fmt(next.date,{month:'short',day:'numeric'}):'All done!';
 const nextN=next?(state[next.id]?.crew||[]).length:0;
 $('#next-crew').textContent=next?(nextN>=3?`${nextN} people · ready to go`:`${3-nextN} ${3-nextN===1?'person':'people'} needed`):'Thanks for helping this year';
 $('#covered').innerHTML=`${upcoming.filter(w=>(state[w.id]?.crew||[]).length>=3).length} <em>/ ${upcoming.length}</em>`;
 $('#mine').innerHTML=selected?`${stats[selected].planned} <em>planned</em>`:'—';
 $('#mine-sub').textContent=selected?`${stats[selected].done} done · ${selected}`:'Choose your name to get started';
 $('#people').innerHTML=NAMES.map(name=>`<div class="person-row ${name===selected?'me':''}"><div class="person-name"><span class="avatar">${name.slice(0,2).toUpperCase()}</span><span class="name">${name}</span>${isBelowAverage(stats[name].planned,avg)?`<span class="warning" role="img" aria-label="At least 4 planned weeks below average" title="${(avg-stats[name].planned).toFixed(1)} planned weeks below average">⚠</span>`:''}</div><span>${stats[name].done}</span><span>${stats[name].planned}</span></div>`).join('');
 $('#average').textContent=`Class average: ${avg.toFixed(1)} planned weeks`;
 $('#upcoming').classList.toggle('active',!past);$('#history').classList.toggle('active',past);
 $('#upcoming').setAttribute('aria-pressed',String(!past));$('#history').setAttribute('aria-pressed',String(past));
 normalizeMonth(); const months=availableMonths(), index=months.indexOf(month);
 $('#prev').disabled=index<=0;$('#next').disabled=index<0||index===months.length-1;
 $('#month-title').innerHTML=`${fmt(month+'-01',{month:'long'})} <span>${month.slice(0,4)}</span>`;
 const weeks=WEEKS.filter(w=>w.month===month&&(past?(w.date||w.id)<day:(w.date||w.id)>=day));
 $('#weeks').innerHTML=weeks.length?weeks.map(w=>{
 const date=w.date||w.id,crew=state[w.id]?.crew||[],joined=crew.includes(selected),attended=state[w.id]?.attended||[];
 return `<article class="week ${!w.date?'skip':''} ${joined?'joined':''}"><div class="date"><strong>${Number(date.slice(8))}</strong><span>${fmt(date,{weekday:'short'}).toUpperCase()}</span></div><div class="week-body"><div class="week-status ${crew.length>=3?'full':''}">${w.date?`<span class="dot"></span>${past?`${attended.length} confirmed · ${crew.length} signed up`:crew.length>=3?`${crew.length} people · crew ready`:`${crew.length} of 3 · ${3-crew.length} needed`}`:'No fundraiser'}</div>${w.date?`<div class="crew-names"><button class="crew-detail" data-detail="${w.id}" aria-label="View crew for ${date}">${crew.length?crew.join(', '):'Be the first to join'}</button></div>${w.reason?`<div class="shifted">↳ ${w.reason}</div>`:''}`:`<div class="skip-note">${w.reason}</div>`}</div>${w.date?`<button class="join ${past?'past':joined?'selected':''}" data-${past?'detail':'join'}="${w.id}" ${busy?'disabled':''}>${past?'Attendance':joined?'✓ Joined':'+ Join'}</button>`:''}</article>`;
 }).join(''):`<div class="empty">${past?'No past weeks yet.<br>After each fundraiser, confirm who helped here.':'All fundraiser weeks are finished. Thank you, crew!'}</div>`;
}
async function change(id,field,name,add){
 if(busy)throw Error('Please wait for the current save.');
 const week=WEEKS.find(w=>w.id===id&&w.date);if(!week||!NAMES.includes(name)||!['crew','attended'].includes(field))throw Error('Invalid signup.');
 if(field==='attended'&&week.date>=today())throw Error('Attendance can be confirmed after the fundraiser date.');
 if(field==='crew'&&week.date<today())throw Error('Past signups cannot be changed. Use attendance instead.');
 busy=true;render();try{await persist(id,field,name,add);render();if(activeWeek)renderDialog();}catch(e){notice('Could not save. Check your connection and reload.');throw e;}finally{busy=false;render();}
}
function renderDialog(){const w=WEEKS.find(w=>w.id===activeWeek);if(!w)return;const isPast=w.date<today(),crew=state[w.id]?.crew||[],attended=state[w.id]?.attended||[];
 $('#dialog-title').textContent=fmt(w.date,{weekday:'long',month:'long',day:'numeric'});
 $('#dialog-eyebrow').textContent=isPast?'CONFIRM WHO HELPED':'THIS WEEK’S CREW';
 $('#dialog-help').textContent=isPast?'Check everyone who actually helped. Only confirmed attendance counts as done. Changes save automatically.':'Select your name at the top of the page, then join this week. Everyone is welcome, even after we reach three.';
 $('#crew-list').innerHTML=isPast?NAMES.map(n=>`<label>${n}${crew.includes(n)?' · signed up':''}<input type="checkbox" data-attend="${n}" ${attended.includes(n)?'checked':''} aria-label="${n} helped"></label>`).join(''):crew.length?crew.map(n=>`<label>${n}<span class="attended-label">Signed up ✓</span></label>`).join(''):'<p>No one has signed up yet.</p>';
}
$('#person').insertAdjacentHTML('beforeend',NAMES.map(n=>`<option>${n}</option>`).join(''));$('#person').value=selected;
function chooseName(name){
 if(!NAMES.includes(name))return;
 selected=name;$('#person').value=name;
 try{localStorage.setItem(KEY+'-name',name);}catch{notice('Your browser could not remember your name. You may need to choose again next visit.');}
 render();
}
$('#person').onchange=e=>{if(NAMES.includes(e.target.value))chooseName(e.target.value);else{$('#person').value=selected;$('#welcome-name').value='';$('#welcome-continue').disabled=true;$('#welcome').showModal();}};
$('#welcome-name').insertAdjacentHTML('beforeend',NAMES.map(n=>`<option>${n}</option>`).join(''));
$('#welcome-name').onchange=e=>{$('#welcome-continue').disabled=!NAMES.includes(e.target.value);};
$('#welcome-form').onsubmit=e=>{e.preventDefault();const name=$('#welcome-name').value;if(!NAMES.includes(name))return;chooseName(name);$('#welcome').close();};
$('#welcome').addEventListener('cancel',e=>e.preventDefault());
if(!selected)$('#welcome').showModal();
$('#weeks').onclick=async e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.detail){activeWeek=b.dataset.detail;renderDialog();$('#picker').showModal();return;}if(b.dataset.join){if(!selected){$('#person').focus();notice('Choose your name first.');return;}const add=!(state[b.dataset.join]?.crew||[]).includes(selected);try{await change(b.dataset.join,'crew',selected,add);notice(add?`You're on the crew, ${selected}!`:'You left this week’s crew.');}catch{}}};
$('#crew-list').onchange=async e=>{if(e.target.dataset.attend){try{await change(activeWeek,'attended',e.target.dataset.attend,e.target.checked);}catch{renderDialog();}}};
$('#picker').addEventListener('close',()=>activeWeek=null);
$('#upcoming').onclick=()=>{past=false;normalizeMonth();render();};$('#history').onclick=()=>{past=true;normalizeMonth();render();};
for(const [id,delta] of [['prev',-1],['next',1]])$('#'+id).onclick=()=>{const months=availableMonths();month=months[months.indexOf(month)+delta]||month;render();};
let lastDay=today();setInterval(()=>{if(today()!==lastDay){lastDay=today();render();}},60000);
normalizeMonth();render();status('Connecting…');
// Enable cloud writes only after the first server snapshot succeeds.
try{const {connect}=await import('./firebase.js');await connect({onData(data){state=data;render();if(activeWeek)renderDialog();},onStatus:status,setPersist(fn){persist=fn;}});}catch(e){status('Cloud unavailable · reload to retry',true);console.warn('Cloud sync unavailable:',e.code||e.message);}finally{busy=false;render();}
if(document.modelContext?.registerTool){try{document.modelContext.registerTool({name:'get_pizza_schedule',description:'Read fundraiser dates, crews, confirmed attendance, and participation totals.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>({weeks:WEEKS.map(w=>({...w,...state[w.id]})),totals:counts(state)})});document.modelContext.registerTool({name:'set_pizza_signup',description:'Join or leave an upcoming fundraiser for one named classmate.',inputSchema:{type:'object',properties:{weekId:{type:'string'},name:{type:'string',enum:NAMES},join:{type:'boolean'}},required:['weekId','name','join'],additionalProperties:false},execute:async input=>{if(typeof input.join!=='boolean')throw Error('join must be boolean');await change(input.weekId,'crew',input.name,input.join);return {weekId:input.weekId,crew:state[input.weekId]?.crew||[]};}});}catch{}}
