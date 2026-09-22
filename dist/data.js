export const NAMES=['Nicolas','Raelle','Maryam','Joshua','Samual','Thomas','Ethan','Vivianne','Ellianna','Lachlan','Eric'];
export const SOURCE='https://voyageur.centreest.ca/wp-content/uploads/2026/08/Calendrier-Voyageur-2026-2027-FR.pdf';
const changes={
 '2026-10-09':['2026-10-08','Friday: professional development'],
 '2026-11-13':[null,'Fall break · Thursday & Friday off'],
 '2026-11-27':['2026-11-26','Friday: school closed'],
 '2026-12-25':[null,'Winter break'],
 '2027-01-01':[null,'Winter break'],
 '2027-01-29':['2027-01-28','Friday: organizational day'],
 '2027-02-05':[null,'Teachers’ convention · Thursday & Friday off'],
 '2027-03-26':[null,'Thursday & Friday off'],
 '2027-04-02':[null,'Spring break'],
 '2027-04-23':['2027-04-22','Friday: professional development'],
 '2027-05-21':[null,'Thursday & Friday off']
};
export const WEEKS=[];
for(let d=new Date('2026-10-02T12:00:00Z');d<=new Date('2027-06-11T12:00:00Z');d.setUTCDate(d.getUTCDate()+7)){
 const friday=d.toISOString().slice(0,10), change=changes[friday];
 WEEKS.push({id:friday,date:change?change[0]:friday,reason:change?.[1]||'',month:(change?.[0]||friday).slice(0,7)});
}
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Edmonton',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
export function counts(data,day=today()){
 return Object.fromEntries(NAMES.map(name=>[name,{done:WEEKS.filter(w=>w.date&&w.date<day&&data[w.id]?.attended?.includes(name)).length,planned:WEEKS.filter(w=>w.date&&w.date>=day&&data[w.id]?.crew?.includes(name)).length}]));
}
export function average(stats){return NAMES.reduce((sum,n)=>sum+stats[n].planned,0)/NAMES.length;}
export function isBelowAverage(planned,avg){return avg-planned>=4;}
