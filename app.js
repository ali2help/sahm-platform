/* ===== مصدر المحتوى: جدول Google Sheets ===== */
const SHEET_ID = '1B_-gN0FYzmHYgxNTZ0JWJ9ZnUDJdGizo9MTGDUZLijw';
const TABS = { cohorts:'الدفعات', courses:'الدورات', links:'روابط الدورات', faq:'الأسئلة المتكررة', texts:'نصوص الصفحات' };
const csvUrl = tab => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;

/* نسخة احتياطية بسيطة تُعرض لحظة فتح المنصة لأول مرة حتى يصل الجدول */
const FALLBACK = {
  cohorts:[['C94','دفعة 94','نعم','','','','']],
  courses:[], links:[], faq:[], texts:[]
};

function parseCSV(t){
  const rows=[];let row=[],f='',q=false;
  for(let i=0;i<t.length;i++){const c=t[i];
    if(q){ if(c=='"'){ if(t[i+1]=='"'){f+='"';i++} else q=false } else f+=c }
    else if(c=='"') q=true; else if(c==','){row.push(f);f=''} else if(c=='\n'){row.push(f);rows.push(row);row=[];f=''} else if(c!='\r') f+=c;
  }
  if(f||row.length){row.push(f);rows.push(row)}
  return rows;
}
async function loadSheet(){
  const out={};
  await Promise.all(Object.entries(TABS).map(async ([k,tab])=>{
    try{
      const r = await fetch(csvUrl(tab),{cache:'no-store'});
      if(!r.ok) throw 0;
      const t = await r.text();
      if(t.trim().startsWith('<')) throw 0;
      out[k] = parseCSV(t).slice(1).filter(x=>x.some(v=>v.trim()));
    }catch(e){ out[k] = null; }
  }));
  if(!out.cohorts) throw new Error('sheet');
  for(const k in out) if(!out[k]) out[k] = (RAW&&RAW[k]) || [];
  return out;
}
function shape(raw){
  const s = v => (v||'').trim();
  const cohorts = (raw.cohorts||[]).filter(r=>s(r[0])).map(r=>({code:s(r[0]),name:s(r[1])||s(r[0]),isDefault:s(r[2])==='نعم',introForm:s(r[3]),colleagues:s(r[4]),room:s(r[5]),support:s(r[6])}));
  const courses = (raw.courses||[]).filter(r=>s(r[0])&&s(r[1])).map(r=>({cohort:s(r[0]),id:s(r[1]).toLowerCase().replace(/[^a-z0-9]/g,''),title:s(r[2]),start:s(r[3]),days:parseInt(s(r[4]))||5,activeFrom:s(r[5]),note:s(r[6])}));
  const links = (raw.links||[]).filter(r=>s(r[0])).map(r=>({cohort:s(r[0]),course:s(r[1]).toLowerCase(),page:s(r[2]),label:s(r[3]),url:s(r[4]),from:s(r[5])}));
  const faq = (raw.faq||[]).filter(r=>s(r[1])&&s(r[2])).map(r=>({order:parseFloat(s(r[0]))||99,q:s(r[1]),a:s(r[2])})).sort((a,b)=>a.order-b.order);
  const texts = {}; (raw.texts||[]).forEach(r=>{ if(s(r[0])) texts[s(r[0])] = (r[1]||'').trim(); });
  return {cohorts,courses,links,faq,texts};
}

let RAW = FALLBACK;
let SOURCE = 'fallback';
try{ const c = localStorage.getItem('sahm-data2'); if(c){ RAW = JSON.parse(c); SOURCE='cache'; } }catch(e){}
let DATA = shape(RAW);

/* ===== أيقونات ===== */
const I = {
  room:'<path d="M4 6h11v12H4zM15 10l5-3v10l-5-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  ex:'<path d="M9 11l3 3 8-8M20 12v7H4V5h11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  att:'<path d="M21 12l-8.5 8.5a5 5 0 0 1-7-7L14 5a3.3 3.3 0 0 1 4.7 4.7L10 18.4a1.7 1.7 0 0 1-2.4-2.4L15 8.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  lib:'<path d="M5 4h4v16H5zM10 4h4v16h-4zM15.5 5l3.8-1 3.2 15-3.8 1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  prep:'<path d="M5 5h14v15H5zM8 3v4M16 3v4M5 10h14M9 15l2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  voice:'<path d="M4 10v4h4l6 5V5L8 10zM17 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>',
  eval:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  cert:'<path d="M4 4h16v11H4zM8 8h8M8 11h5M14 15v6l2-1.5 2 1.5v-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>',
  faq:'<path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17.5v.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>',
  form:'<path d="M6 3h9l4 4v14H6zM9 12h7M9 16h5M9 8h3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>',
  people:'<circle cx="9" cy="8" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3 2.8 3 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  grid:'<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="none" stroke="currentColor" stroke-width="2"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  phone:'<path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
};
const ic = (k,n=22) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;

/* key, page name in sheet, description, icon — بنفس ترتيب الموقع القديم */
const SECTIONS = [
  ['room','دخول القاعة','رابط القاعة وتعليمات المشاركة','room'],
  ['exercises','الأنشطة والتمارين','أنشطة كل يوم ومشاركات الزملاء','ex'],
  ['attachments','الملحقات','تسجيلات الأيام التدريبية','att'],
  ['library','المكتبة الإلكترونية','المادة التدريبية والمراجع','lib'],
  ['prep','التحضير اليومي','آلية إثبات الحضور اليومي','prep'],
  ['voice','صوتك مسموع','للاقتراحات والملاحظات','voice'],
  ['evaluation','تقييم الدورة','شاركنا رأيك في الدورة','eval'],
  ['certificate','شهادة الدورة','موعد الإصدار وشروط الاستحقاق','cert']
];

/* ===== أدوات ===== */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const linkify = s => esc(s).replace(/https?:\/\/[^\s<]+/g, u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
const today = () => { const d=new Date(); return new Date(d.getFullYear(),d.getMonth(),d.getDate()); };
const day = s => { const m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s||''); return m?new Date(+m[1],m[2]-1,+m[3]):null; };
const fmt = s => { const d=day(s); return d ? d.toLocaleDateString('ar-SA-u-ca-gregory-nu-latn',{weekday:'long',day:'numeric',month:'long',year:'numeric'}) : '—'; };
const due = s => { const d=day(s); return !d || d<=today(); };
let cohortCode = null;
try{ cohortCode = localStorage.getItem('sahm-cohort'); }catch(e){}
const C = () => DATA.cohorts.find(c=>c.code===cohortCode) || DATA.cohorts.find(c=>c.isDefault) || DATA.cohorts[0] || {code:'',name:''};
const coursesOf = () => DATA.courses.filter(k=>k.cohort===C().code);
const course = id => coursesOf().find(k=>k.id===id);
const linksFor = (k,page) => DATA.links.filter(l=>l.cohort===k.cohort && l.course===k.id && l.page===page);
const isActive = k => due(k.activeFrom);
const linkBtn = (url,label,ghost) => url
  ? `<a class="btn${ghost?' ghost':''}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`
  : `<span class="btn" aria-disabled="true">${esc(label)} · يُضاف قريبًا</span>`;
const crumbs = (...p) => `<nav class="crumbs" aria-label="مسار الصفحة"><a href="#home">الرئيسية</a>${p.map(x=>` / ${x}`).join('')}</nav>`;
const hero = (eyebrow,h,p,cls) => `<section class="hero${cls?' '+cls:''}">${eyebrow?`<span class="eyebrow">${esc(eyebrow)}</span>`:''}${h?`<h1>${esc(h)}</h1>`:''}${p?`<p>${esc(p)}</p>`:''}</section>`;
const linkRow = l => {
  const open = due(l.from), has = !!l.url;
  const sub = !open ? `يُفعَّل ${fmt(l.from)}` : (has ? 'اضغط للفتح' : 'غير مفعّل حاليًا');
  const inner = `<span class="rowic${open&&has?'':' off'}">${ic('link')}</span><div><b>${esc(l.label)}</b><small>${sub}</small></div><span class="pill ${open&&has?'on':'off'}">${open&&has?'مفعّل':'غير مفعّل'}</span>`;
  return open&&has ? `<a class="row" href="${esc(l.url)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="row locked">${inner}</div>`;
};
const linkList = (k,page,empty) => { const ls = linksFor(k,page); return ls.length ? ls.map(linkRow).join('') : (empty===null?'':`<div class="card"><p class="todo">${empty||'تُضاف الروابط قريبًا.'}</p></div>`); };

/* نص الصفحة من تبويب «نصوص الصفحات»: السطر الذي يبدأ بـ # عنوان */
const pageText = (name, cls) => {
  const t = DATA.texts[name];
  if(!t) return '';
  const html = t.split('\n').map(line=>{
    const l = line.trim();
    if(!l) return '';
    if(l.startsWith('#')) return `<h3>${linkify(l.replace(/^#+\s*/,''))}</h3>`;
    return `<p>${linkify(l)}</p>`;
  }).join('');
  return `<div class="${cls||'card prose'}">${html}</div>`;
};

/* رقم الدعم: اتصال + واتساب */
const supportBtns = num => {
  const d = (num||'').replace(/[^\d+]/g,'');
  if(!d) return '';
  const intl = d.startsWith('+') ? d.slice(1) : d.startsWith('00') ? d.slice(2) : d.startsWith('0') ? '966'+d.slice(1) : d;
  return `<div class="card prose"><h3>الدعم الفني</h3><p>📞 اتصال/واتساب: <b dir="ltr">${esc(num)}</b></p><div class="btns"><a class="btn" href="tel:${esc(d)}">اتصال</a><a class="btn ghost" href="https://wa.me/${intl}" target="_blank" rel="noopener">واتساب</a></div></div>`;
};

/* ===== التثبيت على الجوال ===== */
let deferredPrompt=null, showHelp=false;
const ua = navigator.userAgent;
const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
const isAndroid = /Android/.test(ua);
const inApp = /FBAN|FBAV|Instagram|Line\/|WhatsApp|Snapchat|TikTok|Twitter/i.test(ua);
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const installCard = () => {
  if (standalone()) return '';
  let help = '';
  if (showHelp) {
    if (inApp) help = 'افتح الرابط في متصفح الجوال أولًا (Safari للآيفون أو Chrome للأندرويد) من زر «⋮» أو «فتح في المتصفح»، ثم اضغط «تثبيت المنصة» مرة أخرى.';
    else if (isIOS) help = 'اضغط زر المشاركة ⬆️ أسفل Safari، ثم اختر «إضافة إلى الشاشة الرئيسية»، ثم «إضافة».';
    else if (isAndroid) help = 'اضغط قائمة Chrome «⋮» أعلى الشاشة، ثم اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».';
    else help = 'من شريط عنوان المتصفح اضغط أيقونة التثبيت، أو افتح القائمة واختر «تثبيت».';
  }
  return `<div class="card prose"><h3 style="margin-top:0">ثبّت المنصة على جوالك</h3>
    <div class="inst">
      <div class="ln"><b>آيفون</b><span>من متصفح Safari: زر المشاركة ⬆️ ثم «إضافة إلى الشاشة الرئيسية».</span></div>
      <div class="ln"><b>أندرويد</b><span>من متصفح Chrome: القائمة «⋮» ثم «تثبيت التطبيق».</span></div>
    </div>
    <div class="btns"><button class="btn" id="installBtn" type="button">${ic('phone',18)} تثبيت المنصة</button></div>
    ${help?`<p class="ok">${help}</p>`:''}</div>`;
};

/* ===== الصفحات ===== */
const V = {};
V.home = () => {
  const c = C();
  return hero('','','كل ما تحتاجه خلال البرنامج في مكان واحد: دورات البرنامج، الأسئلة المتكررة، واستمارة التعارف.','plain') + `
  <div class="stack">
    <div class="note"><b>📢 تنويه مهم للمشاركين</b><br>يُرجى الاطلاع على الأسئلة والإجابات الواردة في صفحة الأسئلة المتكررة قبل انعقاد اللقاء التدريبي؛ تفاديًا لتكرار الاستفسارات، وتحقيقًا للاستفادة المثلى من وقت اللقاء.</div>
    <div class="tiles">
      <a class="tile" href="#faq"><span class="ic">${ic('faq')}</span><b>الأسئلة المتكررة</b><span>اقرأها قبل اللقاء الأول</span></a>
      ${c.introForm?`<a class="tile" href="${esc(c.introForm)}" target="_blank" rel="noopener"><span class="ic">${ic('form')}</span><b>استمارة التعارف</b><span>عرّفنا بنفسك</span></a>`:`<div class="tile"><span class="ic">${ic('form')}</span><b>استمارة التعارف</b><span>تُضاف قريبًا</span></div>`}
      ${c.colleagues?`<a class="tile" href="${esc(c.colleagues)}" target="_blank" rel="noopener"><span class="ic">${ic('people')}</span><b>زملاؤك في البرنامج</b><span>قائمة المشاركين</span></a>`:`<div class="tile"><span class="ic">${ic('people')}</span><b>زملاؤك في البرنامج</b><span>تُضاف القائمة قريبًا</span></div>`}
    </div>
    <h2 class="section-t">دورات البرنامج</h2>
    ${coursesOf().map(k=>{
      const on = isActive(k);
      const sub = on ? (k.start?`${due(k.start)?'بدأت':'تبدأ'} ${fmt(k.start)}`:'') : (k.note || `يُفعَّل ${fmt(k.activeFrom)}`);
      return on
        ? `<a class="row" href="#${k.id}"><span class="rowic">${ic('grid')}</span><div><b>${esc(k.title)}</b><small>${esc(sub)}</small></div><span class="pill on">مفعّل</span></a>`
        : `<div class="row locked"><span class="rowic off">${ic('grid')}</span><div><b>${esc(k.title)}</b><small>${esc(sub)}</small></div><span class="pill off">غير مفعّل</span></div>`;
    }).join('') || '<div class="card"><p class="todo">جارِ تحميل الدورات…</p></div>'}
    ${installCard()}
  </div>`;
};

V.faq = () => crumbs('الأسئلة المتكررة') + hero(C().name,'الأسئلة المتكررة','اضغط على السؤال لعرض الإجابة.') + `
  <div class="stack">${DATA.faq.map((f,i)=>`<details id="q${i}"><summary>${esc(f.q)}</summary><div class="a">${linkify(f.a)}</div></details>`).join('') || '<div class="card"><p class="todo">جارِ تحميل الأسئلة…</p></div>'}</div>`;

V.course = k => hero(C().name,'نرحب بكم في موقع '+k.title,'','welcome-h').replace('<h1>','<h1 class="welcome">') + `
  <div class="stack">
    <div class="tiles">${SECTIONS.map(([s,t,d,i])=>`<a class="tile" href="#${k.id}-${s}"><span class="ic">${ic(i)}</span><b>${t}</b><span>${d}</span></a>`).join('')}</div>
    ${pageText('الصفحة الرئيسية للدورة','note')}
  </div>`;

const SV = {
  room: k => `${pageText('دخول القاعة')}<div class="card prose"><h3>رابط القاعة</h3><p>الدخول عبر الرابط الموحد طوال فترة الدورة، ولا يلزم إدخال كلمة مرور.</p><div class="btns">${linkBtn(C().room,'الدخول إلى القاعة')}</div></div>${supportBtns(C().support)}${linkList(k,'دخول القاعة',null)}`,
  exercises: k => `${pageText('الأنشطة والتمارين')}${linkList(k,'الأنشطة والتمارين','تُضاف أنشطة كل يوم قريبًا.')}`,
  attachments: k => `${linkList(k,'الملحقات')}${pageText('الملحقات')}`,
  library: k => `${pageText('المكتبة الإلكترونية')}${linkList(k,'المكتبة الإلكترونية')}`,
  prep: k => `${pageText('التحضير اليومي')}${linkList(k,'التحضير اليومي',null)}`,
  voice: k => `${pageText('صوتك مسموع')}${linkList(k,'صوتك مسموع')}`,
  evaluation: k => `${pageText('تقييم الدورة')}${linkList(k,'تقييم الدورة')}`,
  certificate: k => `${pageText('شهادة الدورة') || '<div class="card"><p class="todo">جارِ التحميل…</p></div>'}${linkList(k,'شهادة الدورة',null)}`
};

V.manage = () => crumbs('إدارة الدورات') + hero('للمشرفين','دورة جديدة = صف جديد','كل محتوى المنصة يأتي من جدول Google Sheets. أضف صفًا للدفعة الجديدة وتظهر لها نفس الصفحات تلقائيًا.') + `
  <div class="stack">
    <div class="card prose"><p>مصدر البيانات الآن: <b>${SOURCE==='live'?'الجدول مباشرة':SOURCE==='cache'?'آخر نسخة محفوظة من الجدول':'النسخة الاحتياطية داخل التطبيق'}</b>.</p><div class="btns"><a class="btn" href="https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit" target="_blank" rel="noopener">فتح جدول المحتوى</a></div></div>
    <div class="tbl"><table><thead><tr><th>الدفعة</th><th>الدورة</th><th>تاريخ البداية</th><th>الأيام</th><th>يُفعَّل من</th><th>الحالة اليوم</th></tr></thead><tbody>
    ${DATA.courses.map(k=>`<tr><td>${esc(k.cohort)}</td><td>${esc(k.title)}</td><td>${k.start||'—'}</td><td>${k.days}</td><td>${k.activeFrom||'—'}</td><td><span class="pill ${isActive(k)?'on':'off'}">${isActive(k)?'مفعّل':'غير مفعّل'}</span></td></tr>`).join('')}
    </tbody></table></div>
  </div>`;

const lockedView = k => hero(C().name, k.title, '') + `<div class="stack"><div class="note"><b>الموقع غير مفعّل بعد</b><br>${esc(k.note || ('يُفعَّل '+fmt(k.activeFrom)))}</div></div>`;

/* ===== التوجيه ===== */
function render(){
  const h = (location.hash||'#home').slice(1);
  const [cid, sec] = h.split('-');
  const k = course(cid);
  let html;
  if (h==='faq'||h==='manage') html = V[h]();
  else if (k && !sec) html = crumbs(esc(k.title)) + (isActive(k)?V.course(k):lockedView(k));
  else if (k && SV[sec]) {
    const s = SECTIONS.find(x=>x[0]===sec);
    html = crumbs(`<a href="#${k.id}">${esc(k.title)}</a>`, s[1]) + (isActive(k) ? hero(k.title, s[1], '') + `<div class="stack">${SV[sec](k)}</div>` : lockedView(k));
  } else html = V.home();
  $('#view').innerHTML = html;
  $('#backband').hidden = (h==='home'||h==='');
  $('#cohortName').textContent = C().name;
  const ib = $('#installBtn');
  if(ib) ib.onclick = async()=>{
    if(deferredPrompt){ deferredPrompt.prompt(); try{ await deferredPrompt.userChoice; }catch(e){} deferredPrompt=null; render(); }
    else { showHelp = true; render(); }
  };
}
function fillCohorts(){
  const sel = $('#cohort');
  sel.innerHTML = DATA.cohorts.map(c=>`<option value="${esc(c.code)}">${esc(c.name)}</option>`).join('');
  sel.value = C().code;
  sel.hidden = DATA.cohorts.length < 2;
}
$('#cohort').addEventListener('change',e=>{ cohortCode = e.target.value; try{localStorage.setItem('sahm-cohort',cohortCode)}catch(err){}; render(); });
window.addEventListener('hashchange',()=>{ render(); window.scrollTo({top:0}); });
window.addEventListener('beforeinstallprompt',e=>{ e.preventDefault(); deferredPrompt=e; });
window.addEventListener('appinstalled',()=>{ deferredPrompt=null; render(); });
fillCohorts(); render();

/* تحديث المحتوى من الجدول في الخلفية */
loadSheet().then(raw=>{
  RAW = raw; DATA = shape(raw); SOURCE='live';
  try{ localStorage.setItem('sahm-data2', JSON.stringify(raw)); }catch(e){}
  fillCohorts(); render();
}).catch(()=>{});

if('serviceWorker' in navigator && location.protocol==='https:'){ navigator.serviceWorker.register('sw.js').catch(()=>{}); }
