import {WEEKS,normalizeNames,today} from './data.js';
let loading;
async function library(){
 if(window.PDFLib)return window.PDFLib;
 if(!loading)loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('./vendor/pdf-lib.min.js',import.meta.url).href;script.onload=()=>resolve(window.PDFLib);script.onerror=()=>{loading=null;script.remove();reject(Error('PDF library could not load.'));};document.head.append(script);});
 return loading;
}
const dateLabel=(date,options)=>new Intl.DateTimeFormat('en-CA',{...options,timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));
export async function buildCalendarPdf(PDFLib,data,exportDay=today()){
 const {PDFDocument,StandardFonts,rgb}=PDFLib, pdf=await PDFDocument.create();
 const regular=await pdf.embedFont(StandardFonts.Helvetica),bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const ink=rgb(.12,.17,.14), muted=rgb(.40,.45,.41), green=rgb(.25,.38,.23), line=rgb(.85,.88,.83),wash=rgb(.95,.97,.92),accent=rgb(.80,.90,.55);
 pdf.setTitle('Pizza Crew | Fundraiser calendar 2026-2027');pdf.setAuthor('Voyageur Pizza Crew');pdf.setSubject('Fundraiser dates and signup snapshot');
 const months=[...new Set(WEEKS.map(w=>w.month))];
 for(let group=0;group<3;group++){
  const page=pdf.addPage([612,792]);
  const text=(value,x,top,size=11,font=regular,color=ink)=>page.drawText(String(value),{x,y:792-top-size,size,font,color});
  const rect=(x,top,width,height,color)=>page.drawRectangle({x,y:792-top-height,width,height,color});
  const rule=top=>page.drawLine({start:{x:40,y:792-top},end:{x:572,y:792-top},thickness:.6,color:line});
  const sectionMonths=months.slice(group*3,group*3+3),eligible=WEEKS.filter(w=>sectionMonths.includes(w.month)&&w.date);
  rect(40,36,28,4,accent);text('VOYAGEUR  /  2026-2027',78,32,9,bold,green);
  text('Pizza calendar',40,56,30,bold);
  text(`${dateLabel(sectionMonths[0]+'-01',{month:'long'})} - ${dateLabel(sectionMonths[2]+'-01',{month:'long',year:'numeric'})}`,40,98,13,regular,muted);
  const covered=eligible.filter(w=>normalizeNames(data[w.id]?.crew).length>=3).length;
  text(`${covered} / ${eligible.length} weeks covered`,572-bold.widthOfTextAtSize(`${covered} / ${eligible.length} weeks covered`,10),102,10,bold,green);
  rule(128);
  sectionMonths.forEach((month,index)=>{
   const top=148+index*177;
   text(dateLabel(month+'-01',{month:'long'}),40,top,18,bold);text(month.slice(0,4),528,top+5,10,regular,muted);
   rect(40,top+30,532,22,wash);text('DATE',50,top+36,8,bold,muted);text('CREW',156,top+36,8,bold,muted);text('STATUS',482,top+36,8,bold,muted);
   WEEKS.filter(w=>w.month===month).forEach((week,row)=>{
    const y=top+59+row*23;
    const crew=normalizeNames(data[week.id]?.crew),date=week.date||week.id;
    text(dateLabel(date,{weekday:'short',month:'short',day:'numeric'}),50,y,10,week.date?bold:regular,week.date?ink:muted);
    if(!week.date){text('No fundraiser',156,y,10,regular,muted);text('School closed',482,y,9,regular,muted);}
    else{
     const names=crew.length?crew.join('  /  '):'No signups yet';
     const size=Math.min(10,310/regular.widthOfTextAtSize(names,1));text(names,156,y,size,regular,crew.length?ink:muted);
     const status=week.date<exportDay?'Past':crew.length>=3?'Full':`${3-crew.length} open`;
     text(status,482,y,10,bold,crew.length>=3?green:muted);
    }
    rule(y+18);
   });
  });
  rect(40,698,532,1,line);
  text('Three people per week. Thursday dates replace a Friday closure.',40,711,9,regular,muted);
  text(`Signup snapshot: ${dateLabel(exportDay,{month:'short',day:'numeric',year:'numeric'})}`,40,730,9,regular,muted);
  text(`${group+1} / 3`,546,730,9,bold,green);
  text('Live updates: n9464.github.io/pizza-crew',40,749,8,regular,muted);
 }
 return pdf.save();
}
export async function downloadCalendar(data){
 const bytes=await buildCalendarPdf(await library(),data);
 const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),a=document.createElement('a');
 a.href=url;a.download=`pizza-calendar-2026-2027-${today()}.pdf`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
