/* Jus Dictator features: notepad, text files, library, search, Hindi/Hinglish, modes.
   Loaded after index.html's main script (shares its globals). */
(function(){
  const st=document.createElement("style"); st.textContent="header h1{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}\n#tv{width:min(900px,calc(100vw - 24px));background:#fff;color:#1d1d1b;border-radius:6px;padding:16px 18px;line-height:1.55;font-size:18px;box-shadow:0 2px 12px rgba(0,0,0,.18);cursor:pointer;overflow-wrap:anywhere}\n#tv .w.hl{background:rgba(255,196,0,.55);border-radius:3px}\n.tools{display:flex;gap:6px}.tools .btn{flex:1}\n.sheet{position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 46px);bottom:calc(env(safe-area-inset-bottom,0px) + 8px);max-width:640px;margin:0 auto;z-index:30;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;box-shadow:0 8px 28px rgba(0,0,0,.4)}\n.sheet h2{margin:0;font-size:15px;display:flex;justify-content:space-between;align-items:center}\n.sheet input,.sheet textarea{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:7px 9px;color:inherit;font:inherit;min-width:0}\n.sheet textarea{flex:1;resize:none}\n#sq{flex:4}\n.list{flex:1;overflow:auto;display:flex;flex-direction:column;gap:6px}\n.item{display:flex;gap:8px;align-items:center;padding:8px;border:1px solid var(--line);border-radius:8px;cursor:pointer;font-size:14px}\n.item small,.note{color:var(--mute);font-size:12px}\n.rd #chunk{font-size:14px;font-weight:500;max-height:4.2em;overflow:auto}\n.bar{height:5px;border-radius:3px;background:var(--line);margin-top:4px;overflow:hidden}.bar i{display:block;height:100%;background:var(--acc)}\n"; document.head.appendChild(st);
  document.querySelector('label[for="file"]').textContent="Open";
  $("file").accept=".pdf,.txt,.md,.markdown,.html,.htm,.csv,.json,.rtf,.docx,text/*,application/pdf";
  $("dots").insertAdjacentHTML("beforebegin",'<button class="btn" id="modeBtn" title="Dictation / Reading mode">✍</button><button class="btn" id="sbtn" aria-label="Search" title="Search">🔍</button>');
  $("stats").insertAdjacentHTML("beforebegin","<div class=\"tools\"><button class=\"btn\" id=\"libBtn\">\ud83d\udcda Library</button><button class=\"btn\" id=\"npBtn\">\ud83d\udcdd Notepad</button></div><div class=\"tools\"><button class=\"btn\" id=\"bmAdd\">\ud83d\udd16 Add</button><button class=\"btn\" id=\"bmList\">\ud83d\udd16 List</button><button class=\"btn\" id=\"fsBtn\">\u26f6 Full</button></div>");
  $("menu").insertAdjacentHTML("beforeend","<label>Continuous scroll (text &amp; notes) <input type=\"checkbox\" id=\"cont\"></label>\n<label>Language <select id=\"lang\"><option value=\"en\">English</option><option value=\"hing\" selected>Hinglish</option><option value=\"hi\">Hindi</option></select></label>\n<label>Hindi voice <select id=\"voiceHi\"></select></label>\n<div class=\"sl\"><span>Pause after sentence</span><input type=\"range\" id=\"rdpR\" min=\"0\" max=\"10\" step=\"0.1\" value=\"0.6\"><input type=\"number\" id=\"rdp\" min=\"0\" step=\"0.1\" value=\"0.6\"><small>s</small></div>\n<div class=\"sl\"><span>Pitch</span><input type=\"range\" id=\"pitch\" min=\"0.5\" max=\"2\" step=\"0.05\" value=\"1\"></div>\n<div class=\"sl\"><span>Volume</span><input type=\"range\" id=\"vol\" min=\"0\" max=\"1\" step=\"0.05\" value=\"1\"></div>\n<label>Sleep timer <select id=\"sleep\"><option value=\"0\">Off</option><option value=\"5\">5 min</option><option value=\"10\">10 min</option><option value=\"20\">20 min</option><option value=\"30\">30 min</option><option value=\"60\">60 min</option></select></label>");
  $("wrap").insertAdjacentHTML("afterbegin",'<div id="tv" hidden></div>');
  document.body.insertAdjacentHTML("beforeend","<div id=\"lib\" class=\"sheet\" hidden><h2>Library <button class=\"btn\" data-close=\"lib\">\u2715</button></h2><div id=\"liblist\" class=\"list\"></div></div>\n<div id=\"np\" class=\"sheet\" hidden><h2>Notepad <button class=\"btn\" data-close=\"np\">\u2715</button></h2>\n  <input id=\"nptitle\" placeholder=\"Title (optional)\"><textarea id=\"nptext\" placeholder=\"Paste or type your notes here\u2026\"></textarea>\n  <div class=\"row\"><button class=\"btn pri\" id=\"npRead\">\u25b6 Read</button><button class=\"btn\" id=\"npSave\">Save</button></div></div>\n<div id=\"sr\" class=\"sheet\" hidden><h2>Search <button class=\"btn\" data-close=\"sr\">\u2715</button></h2>\n  <div class=\"row\"><input id=\"sq\" type=\"search\" placeholder=\"Word or sentence\"><button class=\"btn\" id=\"sgo\">Go</button></div>\n  <div id=\"scount\" class=\"note\"></div><div id=\"sres\" class=\"list\"></div></div>\n<div id=\"bm\" class=\"sheet\" hidden><h2>Bookmarks <button class=\"btn\" data-close=\"bm\">\u2715</button></h2><div id=\"bmlist\" class=\"list\"></div></div>");
  $("empty").innerHTML="Open a file (PDF, Word, text…), or paste notes in the Notepad.<br>Tap any word on the page to start from there.";
})();
function loadMammoth(){ return window.mammoth?Promise.resolve():new Promise(r=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"; s.onload=r; s.onerror=r; document.head.appendChild(s); }); }
Object.assign(S,{mode:"pdf",pw:{},tw:{},rmode:false});

// ---------- storage (library, history, session) ----------
const idb=new Promise(r=>{ try{ const q=indexedDB.open("jusdict",1);
  q.onupgradeneeded=()=>{ q.result.createObjectStore("meta",{keyPath:"id"}); q.result.createObjectStore("files"); };
  q.onsuccess=()=>r(q.result); q.onerror=()=>r(null); }catch(e){ r(null); } });
async function tx(st,mode,fn){ const d=await idb; if(!d) return null;
  return new Promise(res=>{ try{ const t=d.transaction(st,mode), q=fn(t.objectStore(st)); t.oncomplete=()=>res(q?q.result:null); t.onerror=t.onabort=()=>res(null); }catch(e){ res(null); } }); }
const putMeta=m=>tx("meta","readwrite",s=>s.put(m));
const putFile=(id,d)=>tx("files","readwrite",s=>s.put(d,id));
const getFile=id=>tx("files","readonly",s=>s.get(id));
const getMeta=id=>tx("meta","readonly",s=>s.get(id));
const allMeta=async()=>((await tx("meta","readonly",s=>s.getAll()))||[]).sort((a,b)=>b.updated-a.updated);

// ---------- text documents ----------
function paginate(text,max){
  const out=[]; let cur=[], n=0;
  for(const ln of text.replace(/\r/g,"").split("\n")){
    cur.push(ln); n+=(ln.match(/\S+/g)||[]).length;
    if(n>=max){ out.push(cur.join("\n")); cur=[]; n=0; }
  }
  if(cur.join("").trim()||!out.length) out.push(cur.join("\n"));
  return out;
}
async function showText(n,idx){
  S.page=n; S.idx=idx; S.words=[]; S.tels=[]; const tv=$("tv"); tv.innerHTML="";
  const frag=document.createDocumentFragment();
  S.tp[n-1].split("\n").forEach(ln=>{
    const d=document.createElement("div"), ws=ln.match(/\S+/g);
    if(!ws) d.innerHTML="&nbsp;";
    else ws.forEach((w,j)=>{ const sp=document.createElement("span"); sp.className="w"; sp.dataset.i=S.words.length; sp.textContent=w;
      S.words.push(w); S.tels.push(sp); d.appendChild(sp); if(j<ws.length-1) d.appendChild(document.createTextNode(" ")); });
    frag.appendChild(d);
  });
  tv.appendChild(frag); tv.style.fontSize=(18*S.zoom)+"px"; $("stage").scrollTop=0;
  S.hlr={i:S.idx,k:chunkLen(S.idx)}; hl();
  updatePg(); stats(); $("pgR").max=S.doc.numPages; $("pgR").value=n; $("goto").value=n; $("goto").max=S.doc.numPages;
  $("chunk").textContent=S.words.length?"":"No text on this page"; $("chunk").classList.toggle("hide",!S.words.length||!$("show").checked);
  save();
}
async function openDoc(m,data){
  stop(); S.cur=m; S.pw={}; S.tw={}; S.pwDone=false; S.docWords=0; S.boxes=null; $("empty").hidden=true;
  if(m.type==="pdf"){
    S.mode="pdf"; S.doc=await pdfjsLib.getDocument({data:data.slice(0)}).promise; m.pages=S.doc.numPages;
    $("tv").hidden=true; $("box").hidden=false; $("cv").hidden=false;
    const p=m.pos||{}; await showPage(p.p||1,p.i||0); countAll(S.doc);
  } else {
    S.mode="text"; S.pg=null; $("box").hidden=true; $("tv").hidden=false;
    S.tp=paginate(data,$("cont").checked?1e12:350); S.pre=[0];
    S.tp.forEach((t,i)=>S.pre.push(S.pre[i]+(t.match(/\S+/g)||[]).length));
    S.doc={numPages:S.tp.length,text:true}; S.docWords=S.pre[S.tp.length]; m.pages=S.tp.length; m.words=S.docWords;
    const g=(m.pos&&m.pos.g)||0; let p=1; while(p<S.tp.length&&S.pre[p]<=g) p++;
    await showPage(p,Math.max(0,g-S.pre[p-1]));
  }
  $("chunk").textContent=S.words.slice(S.idx,S.idx+chunkLen(S.idx)).join(" ");
  $("chunk").classList.toggle("hide",!$("show").checked);
}
async function readText(f,ext){
  if(ext==="docx"){ await loadMammoth(); if(!window.mammoth) throw 0; return (await mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()})).value; }
  if(["doc","odt","epub","pages"].includes(ext)||f.type.startsWith("image/")) throw 0;
  let t=await f.text();
  if(ext==="html"||ext==="htm") t=new DOMParser().parseFromString(t.replace(/<(script|style)[\s\S]*?<\/\1>/gi,"").replace(/<\/(p|div|h[1-6]|li|tr)>|<br\s*\/?>/gi,"$&\n"),"text/html").body.textContent;
  else if(ext==="rtf") t=t.replace(/\\par[d]?/g,"\n").replace(/\{\\\*[^}]*\}/g,"").replace(/\\'[0-9a-f]{2}/gi,"").replace(/\\[a-z]+-?\d* ?/gi,"").replace(/[{}]/g,"");
  else if(ext==="md"||ext==="markdown") t=t.replace(/^#{1,6}\s*/gm,"").replace(/\[([^\]]*)\]\([^)]*\)/g,"$1").replace(/[*_`>]+/g,"");
  return t;
}
async function intake(f){
  const ext=(f.name.split(".").pop()||"").toLowerCase(); let type, data;
  stop(); $("empty").hidden=false; $("empty").textContent="Loading…";
  try{ if(ext==="pdf"||f.type==="application/pdf"){ type="pdf"; data=await f.arrayBuffer(); } else { type="text"; data=await readText(f,ext); } }
  catch(e){ $("empty").textContent="That file type isn’t supported yet. Supported: PDF, Word (.docx), txt, md, html, rtf, csv, json."; return; }
  if(type==="text"&&!data.trim()){ $("empty").textContent="No readable text found in that file."; return; }
  const id=f.name+"|"+f.size, old=(await getMeta(id))||{};
  const m={id,name:f.name,type,kind:"file",pos:old.pos||{},updated:Date.now(),added:old.added||Date.now()};
  await putMeta(m); await putFile(id,data);
  try{ await openDoc(m,data); }catch(e){ $("empty").hidden=false; $("empty").textContent="Couldn’t open that file."; }
}
$("file").onchange=e=>{ const f=e.target.files[0]; e.target.value=""; if(f) intake(f); };
$("tv").addEventListener("click",e=>{ const i=e.target.dataset&&e.target.dataset.i; if(i!==undefined) jump(+i); });
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>{ $(b.dataset.close).hidden=true; });
try{ $("cont").checked=localStorage.getItem("dict:cont")==="1"; }catch(e){}
$("cont").onchange=async()=>{ try{ localStorage.setItem("dict:cont",$("cont").checked?"1":"0"); }catch(e){}
  if(S.mode==="text"&&S.cur){ S.cur.pos=posNow(); const d=await getFile(S.cur.id); if(d!=null) openDoc(S.cur,d); } };

// ---------- notepad ----------
async function npOpen(m){ S.np=m||null; $("nptitle").value=m?m.name:""; $("nptext").value=m?((await getFile(m.id))||""):""; $("np").hidden=false; }
async function npSave(read){
  const text=$("nptext").value; if(!text.trim()) return;
  const name=$("nptitle").value.trim()||("Note "+new Date().toLocaleString([],{dateStyle:"medium",timeStyle:"short"}));
  const id=S.np?S.np.id:"note|"+Date.now();
  const m={id,name,type:"text",kind:"note",pos:{},updated:Date.now(),added:S.np?S.np.added:Date.now()};
  await putMeta(m); await putFile(id,text); $("np").hidden=true; S.np=null;
  if(read) await openDoc(m,text);
}
$("npBtn").onclick=()=>{ $("menu").hidden=true; npOpen(null); };
$("npRead").onclick=()=>npSave(true); $("npSave").onclick=()=>npSave(false);

// ---------- library ----------
$("libBtn").onclick=libOpen;

// ---------- search ----------
function pageWords(p){ if(S.doc.text) return S.tw[p]||(S.tw[p]=S.tp[p-1].match(/\S+/g)||[]); return S.pw[p]||(p===S.page?S.words:null); }
function doSearch(){
  const q=$("sq").value.trim().toLowerCase(), box=$("sres"); S.sr=[]; box.innerHTML="";
  if(q.length<2||!S.doc){ $("scount").textContent=S.doc?"Type at least 2 letters":"Open a document first"; return; }
  const qn=q.split(/\s+/).length;
  for(let p=1;p<=S.doc.numPages&&S.sr.length<300;p++){
    const ws=pageWords(p); if(!ws) continue; const t=ws.join(" ").toLowerCase(); let k=0;
    while((k=t.indexOf(q,k))>=0&&S.sr.length<300){ const i=(t.slice(0,k).match(/ /g)||[]).length;
      S.sr.push({p,i,n:qn,s:ws.slice(Math.max(0,i-4),i+qn+6).join(" ")}); k+=q.length; }
  }
  $("scount").textContent=S.sr.length+" found"+(S.doc.text||S.pwDone?"":" (still indexing, search again in a moment)");
  S.sr.slice(0,100).forEach(r=>{ const d=document.createElement("div"); d.className="item"; d.innerHTML="<b>p"+r.p+"</b><span></span>"; d.lastChild.textContent=r.s;
    d.onclick=async()=>{ const was=S.playing; stop(); $("sr").hidden=true; await showPage(r.p,r.i); S.hlr={i:r.i,k:r.n}; hl(); $("chunk").textContent=r.s.length?S.words.slice(r.i,r.i+r.n).join(" "):""; if(was) play(); }; box.appendChild(d); });
}
$("sbtn").onclick=()=>{ $("sr").hidden=!$("sr").hidden; if(!$("sr").hidden) $("sq").focus(); };
$("sgo").onclick=doSearch; $("sq").onkeydown=e=>{ if(e.key==="Enter") doSearch(); };
let sdb; $("sq").oninput=()=>{ clearTimeout(sdb); sdb=setTimeout(doSearch,300); };

// ---------- swipe pages, resume last session ----------
let sx=null, sy=0;
$("stage").addEventListener("touchstart",e=>{ if(e.touches.length===1){ sx=e.touches[0].clientX; sy=e.touches[0].clientY; } else sx=null; },{passive:true});
$("stage").addEventListener("touchend",e=>{ if(sx==null||S.zoom>1.05||!S.doc) return; const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy; sx=null;
  if(Math.abs(dx)>90&&Math.abs(dy)<50) $(dx<0?"nextPg":"prevPg").click(); },{passive:true});


// ===== hooks into the core player =====
function posNow(){ return S.mode==="text" ? {g:S.pre[S.page-1]+S.idx} : {p:S.page,i:S.idx}; }
save=function(){ if(!S.cur) return; S.cur.pos=posNow(); S.cur.updated=Date.now(); clearTimeout(S.dbt); S.dbt=setTimeout(()=>putMeta(S.cur),400); };
const _showPage=showPage;
showPage=async function(n,idx=0){
  if(S.doc&&S.doc.text){ S.tok++; syn.cancel(); clearTimeout(S.timer); return showText(Math.max(1,Math.min(S.doc.numPages,n)),idx); }
  return _showPage(n,idx);
};
const _hl=hl;
hl=function(){
  if(S.mode!=="text") return _hl();
  (S.hv||[]).forEach(e=>e.classList.remove("hl")); S.hv=[];
  if(!S.hlr||!S.tels) return;
  for(let j=S.hlr.i;j<S.hlr.i+S.hlr.k&&j<S.tels.length;j++){ S.tels[j].classList.add("hl"); S.hv.push(S.tels[j]); }
  if(S.hv[0]&&!S.pinching){ const a=S.hv[0].getBoundingClientRect(), r=$("stage").getBoundingClientRect();
    if(a.top<r.top+30||a.bottom>r.bottom-30) S.hv[0].scrollIntoView({block:"center",behavior:"smooth"}); }
};
const _setZoom=setZoom;
setZoom=function(z){
  if(S.mode!=="text") return _setZoom(z);
  S.zoom=Math.max(0.2,Math.min(10,z)); $("zr").textContent=Math.round(S.zoom*100)+"%"; $("tv").style.fontSize=(18*S.zoom)+"px"; hl();
};
countAll=async function(doc){
  let tot=0; S.docWords=0;
  for(let p=1;p<=doc.numPages;p++){
    if(S.doc!==doc) return;
    try{ const pg=await doc.getPage(p), tc=await pg.getTextContent(); const ws=tc.items.map(i=>i.str).join(" ").split(/\s+/).filter(Boolean); S.pw[p]=ws; tot+=ws.length; }catch(e){}
  }
  S.docWords=tot; S.pwDone=true; stats();
};
["nptext","nptitle","sq"].forEach(id=>$(id).addEventListener("keydown",e=>e.stopPropagation()));

// ===== Hindi / Hinglish / English, dictation vs reading mode =====
const DEV=/[\u0900-\u097F]/, ENDS=/[.!?।॥…]["”'’)\]]*$/, SOFT=/[,;:]["”'’)\]]*$/;
const HM={",":"अल्पविराम",".":"पूर्ण विराम","।":"पूर्ण विराम","॥":"पूर्ण विराम",";":"अर्धविराम",":":"कोलन","?":"प्रश्नवाचक चिह्न","!":"विस्मयादिबोधक चिह्न",")":"ब्रैकेट बंद"};
chunkLen=function(i){
  const rd=S.rmode, k=rd?60:nWords(); let c=0;
  for(let j=i;j<S.words.length&&c<k;j++){
    c++; const w=S.words[j];
    if(ENDS.test(w)&&(rd||$("brk").checked)) break;
    if(!rd&&$("brk").checked&&c>=2&&SOFT.test(w)) break;
  }
  return c;
};
const _say=say;
say=function(w,i){
  if(S.rmode) return w;
  if(!DEV.test(w)) return _say(w,i);
  if(!$("punc").checked) return w;
  let core=w, tr=[], m;
  while((m=core.match(/[,.;:!?।॥)]$/))&&core.length>1){ tr.unshift(HM[m[0]]); core=core.slice(0,-1); }
  return [core,...tr].join(" ");
};
speak=function(text,done){
  const t=S.tok, segs=[];
  text.split(/\s+/).filter(Boolean).forEach(w=>{ const d=DEV.test(w), g=segs[segs.length-1]; if(g&&g.d===d) g.t+=" "+w; else segs.push({d,t:w}); });
  if(!segs.length){ done(); return; }
  const vs=syn.getVoices(), hi=$("lang").value==="hi";
  const vl=vs.find(x=>x.name===$("voice").value), vh=vs.find(x=>x.name===$("voiceHi").value)||vs.find(x=>x.lang.toLowerCase().startsWith("hi"));
  const rate=Math.max(0.1,Math.min(10,parseFloat($("rate").value)||1)), pitch=+$("pitch").value||1, vol=+$("vol").value;
  segs.forEach((g,i)=>{
    const u=new SpeechSynthesisUtterance(g.t), v=(g.d||hi)?vh:vl;
    if(v){ u.voice=v; u.lang=v.lang; } else if(g.d) u.lang="hi-IN";
    u.rate=rate; u.pitch=pitch; u.volume=isNaN(vol)?1:vol;
    if(i===segs.length-1) u.onend=u.onerror=()=>{ if(t===S.tok) done(); };
    syn.speak(u);
  });
};
step=async function(){
  if(!S.playing) return;
  if(S.idx>=S.words.length){
    if(S.page>=S.doc.numPages){ stop(); $("chunk").textContent="Finished 🎉"; $("chunk").classList.remove("hide"); return; }
    await showPage(S.page+1); return step();
  }
  const cnt=chunkLen(S.idx), text=S.words.slice(S.idx,S.idx+cnt).join(" "), sp=spoken(S.idx,cnt);
  S.hlr={i:S.idx,k:cnt}; hl(); S.last=sp; $("chunk").textContent=text; $("chunk").classList.toggle("hide",!$("show").checked);
  const t=S.tok, t0=Date.now();
  speak(sp,()=>{
    S.idx+=cnt; save(); updatePg();
    const wait=S.rmode?Math.max(150,(parseFloat($("rdp").value)||0)*1000):Math.max(400,cnt*60000/wpmVal()-(Date.now()-t0));
    S.timer=setTimeout(()=>{ if(t===S.tok) step(); },wait);
  });
};
function setMode(r){
  S.rmode=!!r; document.body.classList.toggle("rd",S.rmode);
  $("modeBtn").textContent=S.rmode?"📖":"✍"; $("modeBtn").title=S.rmode?"Reading mode (sentences)":"Dictation mode (few words, then you write)";
  fxSave();
  if(S.doc&&S.words.length){ S.hlr={i:S.idx,k:chunkLen(S.idx)}; hl(); $("chunk").textContent=S.words.slice(S.idx,S.idx+chunkLen(S.idx)).join(" "); }
}
function fxSave(){ try{ localStorage.setItem("dict:fx",JSON.stringify({lang:$("lang").value,vh:$("voiceHi").value,rd:S.rmode?1:0,rdp:$("rdp").value,pitch:$("pitch").value,vol:$("vol").value})); }catch(e){} }
function pickV(p){ return syn.getVoices().find(v=>v.lang.replace("_","-").toLowerCase().startsWith(p)); }
function applyLang(){
  const l=$("lang").value, en=pickV("en-in")||pickV("en"), hi=pickV("hi");
  if(l==="en"){ const e=pickV("en-us")||pickV("en-gb")||en; if(e) $("voice").value=e.name; }
  else if(l==="hing"){ if(en) $("voice").value=en.name; }
  else if(hi) $("voice").value=hi.name;
  if(hi) $("voiceHi").value=hi.name; saveSettings(); fxSave();
}
function fillHi(){
  $("voiceHi").innerHTML=$("voice").innerHTML;
  const hi=syn.getVoices().find(x=>x.name===S.vhPref)||pickV("hi"); if(hi) $("voiceHi").value=hi.name;
}
$("modeBtn").onclick=()=>setMode(!S.rmode);
$("lang").onchange=applyLang;
bindR($("rdpR"),$("rdp"));
$("menu").addEventListener("input",fxSave); $("menu").addEventListener("change",fxSave);

// ===== sleep timer, bookmarks, full screen =====
let sleepT;
$("sleep").onchange=()=>{ clearTimeout(sleepT); const m=+$("sleep").value;
  if(m) sleepT=setTimeout(()=>{ stop(); $("chunk").textContent="Sleep timer ended"; $("chunk").classList.remove("hide"); },m*60000); };
$("bmAdd").onclick=async()=>{ $("menu").hidden=true; if(!S.cur||!S.words.length) return;
  (S.cur.bm=S.cur.bm||[]).push({p:S.page,i:S.idx,t:S.words.slice(S.idx,S.idx+6).join(" ")}); await putMeta(S.cur);
  $("chunk").textContent="Bookmark added"; $("chunk").classList.remove("hide"); };
$("bmList").onclick=()=>{
  $("menu").hidden=true; if(!S.cur) return; const box=$("bmlist"), bm=S.cur.bm||[]; box.innerHTML=bm.length?"":'<div class="note">No bookmarks yet.</div>';
  bm.forEach((b,j)=>{ const d=document.createElement("div"); d.className="item"; d.innerHTML='<b>p'+b.p+'</b><span style="flex:1"></span>'; d.children[1].textContent=b.t;
    d.onclick=async()=>{ $("bm").hidden=true; const was=S.playing; stop(); await showPage(b.p,b.i); if(was) play(); };
    const x=document.createElement("button"); x.className="btn"; x.textContent="✕"; x.onclick=async e=>{ e.stopPropagation(); bm.splice(j,1); await putMeta(S.cur); $("bmList").onclick(); };
    d.appendChild(x); box.appendChild(d); });
  $("bm").hidden=false;
};
$("fsBtn").onclick=()=>{ $("menu").hidden=true; const de=document.documentElement;
  if(document.fullscreenElement) document.exitFullscreen(); else if(de.requestFullscreen) de.requestFullscreen().catch(()=>{}); };

// ===== Home: add, continue reading, recently read =====
function progress(m){ const p=m.pos||{}; return m.type==="pdf" ? (m.pages&&p.p?Math.round(100*(p.p-1)/m.pages):0) : (m.words&&p.g?Math.min(100,Math.round(100*p.g/m.words)):0); }
async function libOpen(){
  $("menu").hidden=true; const list=await allMeta(), box=$("liblist"); box.innerHTML="";
  const add=document.createElement("div"); add.className="tools";
  add.innerHTML='<button class="btn" id="hPaste">📋 Paste</button><button class="btn" id="hOpen">📂 Open file</button><button class="btn" id="hNote">📝 Notepad</button>';
  box.appendChild(add);
  $("hPaste").onclick=async()=>{ $("lib").hidden=true; await npOpen(null); try{ $("nptext").value=await navigator.clipboard.readText(); }catch(e){} };
  $("hOpen").onclick=()=>{ $("lib").hidden=true; $("file").click(); };
  $("hNote").onclick=()=>{ $("lib").hidden=true; npOpen(null); };
  if(!list.length){ box.insertAdjacentHTML("beforeend",'<div class="note">Nothing saved yet. Files you open and notes you save appear here.</div>'); }
  list.forEach((m,n)=>{
    if(n===0||n===1){ const h=document.createElement("div"); h.className="note"; h.textContent=n===0?"CONTINUE READING":"RECENTLY READ"; box.appendChild(h); }
    const d=document.createElement("div"); d.className="item";
    d.innerHTML='<div style="flex:1;min-width:0"><b></b><br><small></small><div class="bar"><i></i></div></div>';
    const pc=progress(m); d.querySelector("b").textContent=m.name; d.querySelector("i").style.width=pc+"%";
    d.querySelector("small").textContent=[m.kind==="note"?"Note":m.type==="pdf"?"PDF":"Text",pc+"%",new Date(m.updated).toLocaleDateString()].join(" · ");
    d.onclick=async()=>{ const data=await getFile(m.id); if(data==null) return; $("lib").hidden=true; try{ await openDoc(m,data); }catch(e){} };
    if(m.kind==="note"){ const e=document.createElement("button"); e.className="btn"; e.textContent="✎"; e.onclick=ev=>{ ev.stopPropagation(); $("lib").hidden=true; npOpen(m); }; d.appendChild(e); }
    const x=document.createElement("button"); x.className="btn"; x.textContent="✕";
    x.onclick=async ev=>{ ev.stopPropagation(); if(window.confirm&&!confirm("Delete “"+m.name+"”?")) return;
      await tx("meta","readwrite",s=>s.delete(m.id)); await tx("files","readwrite",s=>s.delete(m.id)); if(S.cur&&S.cur.id===m.id) S.cur=null; libOpen(); };
    d.appendChild(x); box.appendChild(d);
  });
  $("lib").hidden=false;
}
$("libBtn").onclick=libOpen;

// ===== start-up: restore settings and last session =====
try{ const f=JSON.parse(localStorage.getItem("dict:fx")||"null");
  if(f){ $("lang").value=f.lang||"hing"; S.vhPref=f.vh; $("rdp").value=f.rdp==null?0.6:f.rdp; $("rdpR").value=$("rdp").value; $("pitch").value=f.pitch||1; $("vol").value=f.vol==null?1:f.vol; S.rmode=!!f.rd; } }catch(e){}
setMode(S.rmode); setTimeout(fillHi,400);
if(syn.addEventListener) syn.addEventListener("voiceschanged",()=>setTimeout(fillHi,150));
(async()=>{ const l=await allMeta(); if(!l.length){ libOpen(); return; }
  const d=await getFile(l[0].id); if(d!=null) openDoc(l[0],d).catch(()=>{}); })();
