import {firebaseConfig} from './firebase-config.js';
import {NAMES,WEEKS} from './data.js';
export async function connect({onData,onStatus,setPersist}){
 const [{initializeApp},{getFirestore,collection,doc,onSnapshot,setDoc,arrayUnion,arrayRemove,serverTimestamp}]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js')]);
 const db=getFirestore(initializeApp(firebaseConfig,'pizza-crew'));
 const root=collection(db,'pizzaCrew2026Weeks');
 let connected=false, latest={};
 const save=async(id,field,name,add)=>{
  onStatus('Saving…');
  try{await setDoc(doc(root,id),{[field]:add?arrayUnion(name):arrayRemove(name),updatedAt:serverTimestamp()},{merge:true});onStatus('Saved to Firebase');}
  catch(e){onStatus('Save failed · try again',true);throw e;}
 };
 onStatus('Connecting to Firebase…');
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{if(!connected){unsubscribe();reject(Error('Connection timed out'));}},15000);
  const unsubscribe=onSnapshot(root,{includeMetadataChanges:true},snapshot=>{
   // Do not replace saved data with an empty offline cache on first load.
   if(!connected&&snapshot.metadata.fromCache)return;
   const result={};snapshot.forEach(d=>{
    if(!WEEKS.some(w=>w.id===d.id&&w.date))return;
    const data=d.data();result[d.id]={crew:NAMES.filter(n=>Array.isArray(data.crew)&&data.crew.includes(n)),attended:NAMES.filter(n=>Array.isArray(data.attended)&&data.attended.includes(n))};
   });
   latest=result;onData(result);try{localStorage.setItem('voyageur-pizza-2026-cloud-cache',JSON.stringify(result));}catch{}
   onStatus(snapshot.metadata.hasPendingWrites?'Saving…':snapshot.metadata.fromCache?'Offline · waiting to sync':'Saved to Firebase',snapshot.metadata.fromCache);
   if(!connected){connected=true;clearTimeout(timer);setPersist(save);resolve();}
  },error=>{clearTimeout(timer);onStatus('Cloud unavailable',true);if(!connected)reject(error);else setPersist(async()=>{throw Error('Cloud unavailable. Reload to reconnect.');});});
 });
}
