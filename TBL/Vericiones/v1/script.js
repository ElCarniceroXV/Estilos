/* ==========================================================================
   0) Configuración
   ========================================================================== */
const SB_URL='https://lubqftkkcgzwxwijvmzw.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1YnFmdGtrY2d6d3h3aWp2bXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3MDI5MTQsImV4cCI6MjEwNzI3ODkxNH0.2q5Vu5VDrob0SsZXzZpkC9AiZuFPaUAnx5M-_qZAU6k';
const LK_URL='wss://proyecto-x-7rwobbcd.livekit.cloud';
const sb=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true}});
/* Un solo archivo SQL para todo: tablas, funciones, políticas RLS, permisos y
   una comprobación final simulando a un usuario conectado. Se puede ejecutar
   las veces que quieras. */
const SQL_FIX='00-instalar-todo.sql';
const SQL_FULL='00-instalar-todo.sql';

/* $ nunca devuelve null. Sin esto, si navegas mientras una consulta va en
   curso, go() vacía #main y al volver la función escribe sobre un elemento
   inexistente: "can't access property innerHTML, $(...) is null".
   En un render obsoleto, escribir aquí no hace nada. */
const noopEl=()=>({innerHTML:'',textContent:'',value:'',src:'',href:'',
  style:{setProperty(){},cssText:''},dataset:{},files:[],scrollTop:0,scrollHeight:0,clientHeight:0,
  classList:{add(){},remove(){},toggle(){},contains(){return false}},
  appendChild(){return this},prepend(){},remove(){},insertAdjacentHTML(){},click(){},focus(){},
  querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},closest(){return null},
  getAttribute(){return null},setAttribute(){},scrollIntoView(){}});
const $=i=>document.getElementById(i)||noopEl();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const val=i=>{const e=$(i);return e?e.value.trim():''};
const empty=t=>`<div class="empty"><span>${t}</span></div>`;
const hm=d=>new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const EMOS=['❤️','😂','😮','😢','🔥','👍'];
const MAXIMG=8*1024*1024, MAXFILE=25*1024*1024;
const kb=b=>!b?'0 KB':b<1024?b+' B':b<1048576?(b/1024).toFixed(0)+' KB':(b/1048576).toFixed(1)+' MB';
/* ---------- Temas y paleta ----------
   Los temas son los mismos para salas y para cada conversación privada. */
const THEMES=[
  ['noir','Negro','#121214','#ece8e8'],
  ['telegram','Telegram','#17212b','#e9edf0'],
  ['noche','Noche','#101b2d','#eaf0f8'],
  ['bosque','Bosque','#0f1a14','#e6f1e9'],
  ['amoled','AMOLED','#000000','#ffffff'],
  ['duna','Duna','#231a12','#f4e9dd'],
  ['papel','Papel','#efe9e4','#1b1b1b'],
  ['cielo','Cielo','#dbeafe','#111827'],
  ['vino','Vino','#241019','#f7e6ec'],
];
const PALETTE=['#ff8e9b','#e0242f','#ff6b7d','#f59e0b','#fbbf24','#4ade80','#22c55e',
  '#2dd4bf','#38bdf8','#0ea5e9','#818cf8','#6366f1','#a855f7','#ec4899','#f472b6',
  '#ffffff','#94a3b8'];
const themeBy=id=>THEMES.find(t=>t[0]==id)||THEMES[0];
function themeSwatches(sel,on,pre='',trans=false){
  const call=c=>`${on}(${pre}'${c}')`;
  return `<div class="swatches">${PALETTE.map(c=>`<button class="sw ${sel===c?'on':''}"
    style="background:${c}" onclick="${call(c)}" title="${c}"></button>`).join('')}
    ${trans?`<button class="sw trans ${sel==='transparent'?'on':''}" onclick="${call('transparent')}"
      title="Sin color / transparente"><i class="fa-solid fa-ban"></i></button>`:''}
    <input type="color" value="${sel&&sel!=='transparent'?sel:PALETTE[0]}" oninput="${on}(${pre}this.value)"
      style="width:38px;height:32px;padding:1px;cursor:pointer"></div>`;
}
function themeGrid(sel,on){
  return `<div class="themes">${THEMES.map(t=>`<button class="thm ${sel===t[0]?'on':''}" onclick="${on}('${t[0]}')">
    <span class="pv" style="background:${t[2]};box-shadow:inset 0 -9px 0 ${t[2]}, inset 0 9px 0 ${t[2]};
      background-image:linear-gradient(135deg,${t[2]} 60%,${t[3]}22)"></span>${t[1]}</button>`).join('')}</div>`;
}
/* Aplica un tema a un contenedor (sala, DM o mini chat) */
function paint(el,theme,accent,bg){
  if(!el)return;
  if(theme){el.setAttribute('data-theme',theme);}
  /* El fondo del chat/banner se pinta con una capa oscura al 70 % para que
     el texto se lea bien sin tapar del todo la imagen. Cada conversación
     recibe su propio fondo; al cambiar de chat se limpia el anterior. */
  if(bg){
    const layer=`linear-gradient(rgba(9,9,10,.7),rgba(9,9,10,.7)),url('${bg}')`;
    el.style.setProperty('--c-bg-img',layer);
    el.style.backgroundImage=layer;
    el.style.backgroundSize='cover';el.style.backgroundPosition='center';
  }
  else if(theme){
    el.style.backgroundImage='none';
    el.style.removeProperty('--c-bg-img');
    el.style.removeProperty('--c-bg');
  }
  if(accent){el.style.setProperty('--ac',accent);
    el.style.setProperty('--c-out',hexA(accent,.22));}
  else{
    el.style.removeProperty('--ac');
    el.style.removeProperty('--c-out');
  }
}
const hexA=(hex,a)=>{try{const n=parseInt(hex.slice(1),16);
  return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`}catch{return 'rgba(255,142,155,.2)'}};
const lvOf=xp=>1+Math.floor((xp||0)/100);
const TITLES=['Novato','Aprendiz','Explorador','Veterano','Élite','Maestro','Leyenda'];
/* El nivel empieza en 1 y TITLES en el índice 0: hay que restar 1. */
const titleOf=lv=>TITLES[Math.max(0,Math.min(TITLES.length-1,(lv||1)-1))];

/* ---------- Explicación de errores de Supabase ----------
   El 42501 es EL caso habitual: la tabla existe pero no tiene RLS con
   políticas, así que el usuario autenticado no puede escribir nada. */
function explain(err){
  const m=(err&&err.message)||String(err||'');
  const c=err&&err.code;
  if(c=='42501'||/row-level security|permission denied/i.test(m))
    return 'La base de datos tiene el RLS activado pero <b>sin políticas</b>, así'
         +' que tu usuario no puede leer ni escribir nada. Pega <b>'+SQL_FIX+'</b>'
         +' en Supabase → SQL Editor y pulsa Run.';
  if(c=='23505'||/duplicate key|already exists/i.test(m)){
    /* El texto anterior («prueba con otro») solo servía para el nombre de
       usuario, y era engañoso en cualquier otro sitio. */
    if(/profiles/.test(m))return 'Ya existe un perfil con ese identificador.';
    if(/keyvault/.test(m))return 'Ya había una llave guardada; se ha reemplazado.';
    if(/uid/.test(m))return 'Ese UID ya está en uso. Prueba a crear otra cuenta.';
    if(/shop_items|kind_name/i.test(m))return 'Ya existe un artículo de la tienda con ese nombre. Usa otro nombre.';
    return 'Ese valor ya estaba en uso (clave duplicada). Prueba con otro.';
  }
  if(c=='PGRST204'||c=='42703'||/Could not find column|column .* does not exist/i.test(m))
    return 'A la base de datos le falta una columna (código '+(c||'42703')+'). Ejecuta sql/13-parche-en-vivo.sql'
         +' en Supabase → SQL Editor (rol postgres, «Run without RLS») y vuelve a entrar en la app.';
  if(c=='PGRST205'||/Could not find the table/i.test(m))
    return 'Falta una tabla en la base de datos: ejecuta <b>00-instalar-todo.sql</b>.';
  if(c=='23502'||/null value in column|violates not-null/i.test(m))
    return 'Falta un campo obligatorio. Recarga la página (Ctrl+F5) para cargar la versión nueva de la app.';
  if(c=='23503'||/foreign key constraint/i.test(m))
    return 'Error de clave foránea: revisa que el usuario exista.';
  return m;
}

/* ---------- Avisos flotantes (reemplazan a alert) ---------- */
function toast(msg,kind='ok',ms=3800){
  if(!msg)return;
  const box=$('toasts'),t=document.createElement('div');
  t.className='tst '+kind;t.textContent=String(msg);
  box.appendChild(t);
  const kill=()=>{t.classList.add('out');setTimeout(()=>t.remove(),240)};
  t.style.pointerEvents='auto';t.onclick=kill;
  setTimeout(kill,ms);
}
/* Confirmación de borrado con estilo propio. Antes usaba confirm() del
   navegador: gris, sin tema y bloqueante. Ahora es un diálogo de la app
   (ve .ask en el CSS) que devuelve una promesa: los que llaman hacen
   `if(!await ask())return;`. Cerrar da false; solo «Sí, borrar» true. */
function ask(msg){
  return new Promise(res=>{
    const ov=document.createElement('div');ov.className='ask';
    ov.innerHTML=`<div class="askcard" role="dialog" aria-modal="true" aria-label="Confirmar borrado">
      <div class="askic"><i class="fa-solid fa-trash"></i></div>
      <b>${esc(msg||'¿Seguro que quieres borrar esto?')}</b>
      <p>Esta acción no se puede deshacer.</p>
      <div class="askbtn">
        <button class="sm" data-k="0">Cancelar</button>
        <button class="sm danger" data-k="1">Sí, borrar</button>
      </div></div>`;
    let done=false;
    const close=v=>{if(done)return;done=true;
      ov.classList.add('out');setTimeout(()=>ov.remove(),190);
      removeEventListener('keydown',onkey);res(v)};
    ov.onclick=e=>{if(e.target===ov)close(false)};
    ov.querySelectorAll('button').forEach(b=>b.onclick=()=>close(b.dataset.k==='1'));
    const onkey=e=>{if(e.key==='Escape')close(false)};
    addEventListener('keydown',onkey);
    document.body.appendChild(ov);
    ov.querySelector('button[data-k="0"]').focus();
  });
}

/* ==========================================================================
   1) Cifrado
   ========================================================================== */
const te=new TextEncoder(),td=new TextDecoder();
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function pk(p,salt,it=150000){const k=await crypto.subtle.importKey('raw',te.encode(p),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function enc(k,t){const iv=crypto.getRandomValues(new Uint8Array(12));return b64(iv)+'.'+b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,te.encode(t)))}
async function dec(k,s){try{const[i,c]=s.split('.');return td.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(i)},k,ub(c)))}catch{return '[mensaje cifrado, no se puede descifrar]'}}
const ECDH={name:'ECDH',namedCurve:'P-256'};
const roomKey=async r=>K['r'+r.id]||(K['r'+r.id]=await pk(r.room_key,te.encode('tbl-room'),50000));
async function peerKey(p){if(K['p'+p.id])return K['p'+p.id];const pub=await crypto.subtle.importKey('jwk',p.pubkey,ECDH,false,[]);return K['p'+p.id]=await crypto.subtle.deriveKey({name:'ECDH',public:pub},priv,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}

/* ==========================================================================
   2) Utilidades
   ========================================================================== */
let me,priv,view,cur,SB_SESSION=null,FC='',FB='recent',FTAB='',P={},C={},CP={},K={},RM={},MY=[],ST=[],FL=new Set(),CS={};
/* Historias: qué historias ya he visto (anillo gris) y a quién sigo
   (la bandeja solo enseña las historias de los amigos). */
let STVIEW=new Set(),FRIDS=new Set(),FRIENDS_OK=false;
/* Mensajes privados sin leer, por persona. */
let UNREAD={};
let WELCOME_PENDING=false;
const COMM={},REVEAL=new Set();
const fx=p=>(p.accent=(!p.accent||p.accent=='#00f0ff')?'#ff8e9b':p.accent,p);

/* ==========================================================================
   Caché sin conexión
   --------------------------------------------------------------------------
   Todo se guarda SOLO en este navegador, por cuenta:
     · perfil y perfiles de autores        · publicaciones del feed
     · historias                           · mensajes privados ya abiertos
     · mensajes de salas ya abiertas       · comentarios ya abiertos
   No se guarda mientras no haya sesión. Al volver a entrar sin internet se
   pinta el inicio con lo último que se cargó, sin lanzar consultas al servidor.
   ========================================================================== */
const OFF_CACHE='tbl_offline_v1_';
let OFFLINE=false;
const NET_ERR=/failed to fetch|networkerror|load failed|fetch failed|network request failed|err_internet|err_name|timeout|timed out|econn|network/i;
const isNetError=e=>!!e&&(NET_ERR.test(e.message||String(e))||e.name==='TypeError');
function cacheKey(id,part){return OFF_CACHE+String(id||'guest')+'_'+part}
function cacheRead(id,part,fallback=null){
  try{
    const raw=localStorage.getItem(cacheKey(id,part));
    return raw?JSON.parse(raw):fallback;
  }catch(e){return fallback}
}
function cacheWrite(part,val){
  if(!me||!me.id)return false;
  try{localStorage.setItem(cacheKey(me.id,part),JSON.stringify(val));return true}
  catch(e){
    /* Si el navegador se queda sin espacio, se sacrifican primero los posts
       más antiguos y luego se reintenta con los mensajes. */
    try{
      if(part==='posts'&&Array.isArray(val)&&val.length>12)
        localStorage.setItem(cacheKey(me.id,part),JSON.stringify(val.slice(0,12)));
      else if(part.startsWith('dm_')&&Array.isArray(val)&&val.length>40)
        localStorage.setItem(cacheKey(me.id,part),JSON.stringify(val.slice(-40)));
      else if(part.startsWith('profileposts_')&&Array.isArray(val)&&val.length>12)
        localStorage.setItem(cacheKey(me.id,part),JSON.stringify(val.slice(0,12)));
      else if(part.startsWith('comments_')&&Array.isArray(val)&&val.length>80)
        localStorage.setItem(cacheKey(me.id,part),JSON.stringify(val.slice(0,80)));
    }catch(_){}
    console.warn('caché sin espacio:',part,e.message);
    return false;
  }
}
let cacheProfilesT=null;
function cacheProfiles(){
  if(!me||!me.id)return;
  const out={};
  Object.values(P).filter(p=>p&&p.id).slice(0,160).forEach(p=>{
    out[p.id]={id:p.id,name:p.name,avatar:p.avatar,accent:p.accent,pubkey:p.pubkey,
      links:p.links,bg:p.bg,bio:p.bio,frame_id:p.frame_id,bubble_id:p.bubble_id,
      last_seen:p.last_seen};
  });
  cacheWrite('profiles',out);
}
function scheduleCacheProfiles(){
  clearTimeout(cacheProfilesT);
  cacheProfilesT=setTimeout(cacheProfiles,700);
}
function cacheProfile(){
  if(!me||!me.id)return;
  cacheWrite('profile',me);cacheProfiles();
}
function cachePosts(rows){
  if(!me||!Array.isArray(rows))return;
  cacheWrite('posts',rows.slice(0,60));cacheProfiles();
}
function cacheStories(){
  if(!me)return;
  cacheWrite('stories',ST.slice(0,80));cacheProfiles();
}
function cacheComments(postId,rows){
  if(!me)return;
  cacheWrite('comments_'+postId,(rows||[]).slice(0,200));scheduleCacheProfiles();
}
function cacheDM(peerId,L){
  if(!me)return;
  cacheWrite('dm_'+peerId,(L||[]).slice(-150));scheduleCacheProfiles();
}
function cacheRoom(roomId,L){
  if(!me)return;
  cacheWrite('room_'+roomId,(L||[]).slice(-200));scheduleCacheProfiles();
}
function restoreCache(id){
  const profile=cacheRead(id,'profile');
  const profiles=cacheRead(id,'profiles',{});
  Object.values(profiles||{}).forEach(p=>{if(p&&p.id)P[p.id]=fx(p)});
  if(profile){me=fx(profile);P[me.id]=me}
  const stories=cacheRead(id,'stories',[]);
  if(Array.isArray(stories))ST=stories.filter(s=>s&&s.author_id&&s.expires_at&&new Date(s.expires_at)>new Date());
  const comms=cacheRead(id,'comms',{});
  Object.values(comms||{}).forEach(c=>{if(c&&c.id)COMM[c.id]=c});
  const shop=cacheRead(id,'shop',{});
  Object.values(shop||{}).forEach(i=>{if(i&&i.id)SHOP[i.id]=i});
  const posts=cacheRead(id,'posts',[]);
  return {profile,posts:Array.isArray(posts)?posts:[],stories};
}
function setOffline(on,msg){
  OFFLINE=!!on;
  if(on&&msg)toast(msg,'warn',6500);
}

function av(o,s=36,cls='',id=''){
  const st=`width:${s}px;height:${s}px`+(s>44?`;font-size:${Math.round(s/2.4)}px`:'');
  const o2=o||{},ida=id?` id="${esc(id)}"`:'';
  return o2.avatar
    ? `<img${ida} class="av ${cls}" src="${esc(o2.avatar)}" style="${st}" alt="" onclick="openProfile('${o2.id}')" referrerpolicy="no-referrer">`
    : `<button${ida} class="av ${cls}" style="${st}" onclick="openProfile('${o2.id||''}')" title="${esc(o2.name||'?')}">${esc(((o2.name||'?')[0]||'?').toUpperCase())}</button>`;
}
const nameEl=(u)=>u&&u.id?`<b style="color:${esc(u.accent||'')};cursor:pointer" onclick="openProfile('${u.id}')">${esc(u.name||'?')}</b>`:'';

async function prof(ids){
  ids=[...new Set(ids)].filter(i=>i&&!P[i]);if(!ids.length)return;
  if(OFFLINE)return;
  const{data,error}=await sb.from('profiles').select(PROFSEL()).in('id',ids);
  if(error){
    if(isNetError(error)){OFFLINE=true;return}
    if(isMissing(error)){NEWOK=false;MISSING.add('profiles');return}
  }
  (data||[]).forEach(p=>P[p.id]=fx(p));
  if(data&&data.length)scheduleCacheProfiles();
}
async function chars(ids){
  ids=[...new Set(ids)].filter(i=>i&&!C[i]);if(!ids.length)return;
  const{data}=await sb.from('characters').select('id,name,avatar,owner').in('id',ids);
  (data||[]).forEach(c=>C[c.id]=c);
}
async function blocked(){
  if(!NEWOK){FL=new Set();return}
  const{data,error}=await sb.from('blocks').select('blocked_id').eq('blocker_id',me.id);
  if(error)return;
  FL=new Set((data||[]).map(b=>b.blocked_id));
}
const notBlocked=id=>!FL.has(id);

async function notify(uid,kind,text){
  if(!uid||uid===me.id||!notBlocked(uid))return;
  await sb.from('notifications').insert({user_id:uid,from_user:me.id,kind,text});
}

/* ---------- Imágenes: redimensionar y limitar peso ---------- */
async function shrink(file,maxSide=1600,q=.86){
  if(!file)return null;
  if(file.size>MAXIMG)throw new Error('La imagen supera los 8 MB.');
  if(!file.type.startsWith('image/'))throw new Error('Solo se permiten imágenes.');
  const bm=await createImageBitmap(file),sc=Math.min(1,maxSide/Math.max(bm.width,bm.height));
  if(sc===1&&file.size<600*1024){bm.close?.();return file}
  const cv=document.createElement('canvas');cv.width=Math.round(bm.width*sc);cv.height=Math.round(bm.height*sc);
  cv.getContext('2d').drawImage(bm,0,0,cv.width,cv.height);bm.close?.();
  const blob=await new Promise(r=>cv.toBlob(r,'image/jpeg',q));
  if(!blob)throw new Error('No se pudo procesar la imagen.');
  return new File([blob],(file.name||'img').replace(/\.\w+$/,'')+'.jpg',{type:'image/jpeg'});
}
async function up(file){
  let f;try{f=await shrink(file)}catch(e){toast(e.message,'err');return null}
  if(!f)return null;
  const ext=(f.name.split('.').pop()||'jpg').toLowerCase();
  const path=`${me.id}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
  const{error}=await sb.storage.from('uploads').upload(path,f,{contentType:f.type});
  if(error){toast('No se pudo subir la imagen: '+storageError(error,f),'err',9000);return null}
  return sb.storage.from('uploads').getPublicUrl(path).data.publicUrl;
}
const fu=async i=>{const e=$(i),f=e&&e.files&&e.files[0];if(!f)return null;const u=await up(f);e.value='';return u};
const fus=async i=>{const e=$(i),out=[];if(!e||!e.files)return out;
  for(const f of [...e.files].slice(0,8)){const u=await up(f);if(u)out.push(u)}e.value='';return out};

/* ---------- Adornos decorativos: GIF, PNG y WebP ----------
   No pasan por shrink() para no convertir los GIF en JPEG y perder la
   animación. Se suben tal cual, con un límite de 8 MB. */
const DECO_MIME={'image/gif':'gif','image/png':'png','image/webp':'webp'};
function decoExt(file){
  if(!file)return null;
  const mime=String(file.type||'').toLowerCase();
  if(DECO_MIME[mime])return DECO_MIME[mime];
  const ext=String(file.name||'').split('.').pop().toLowerCase();
  return ['gif','png','webp'].includes(ext)?ext:null;
}
async function upDeco(file){
  if(!file)return null;
  const ext=decoExt(file);
  if(!ext){toast('Solo se permiten archivos GIF, PNG o WebP.','err',6000);return null}
  if(file.size>MAXIMG){toast('El adorno supera los 8 MB.','err',6000);return null}
  const type=/^image\/(gif|png|webp)$/.test(file.type||'')?file.type:'image/'+ext;
  const path=`${me.id}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
  const{error}=await sb.storage.from('uploads').upload(path,file,{contentType:type});
  if(error){toast('No se pudo subir el archivo: '+storageError(error,file),'err',9000);return null}
  return sb.storage.from('uploads').getPublicUrl(path).data.publicUrl;
}
const fuDeco=async i=>{const e=$(i),f=e&&e.files&&e.files[0];if(!f)return null;const u=await upDeco(f);e.value='';return u};
const fusDeco=async i=>{const e=$(i),out=[];if(!e||!e.files)return out;
  for(const f of [...e.files].slice(0,8)){const u=await upDeco(f);if(u)out.push(u)}e.value='';return out};

/* ---------- Archivos adjuntos (cualquier tipo) ---------- */
let PEND=[];
function extOf(n){return String(n||'').split('.').pop()||'bin'}
function iconOf(t,n){
  t=t||'';
  if(t.startsWith('image/'))return'fa-file-image'; if(t.startsWith('video/'))return'fa-file-video';
  if(t.startsWith('audio/'))return'fa-file-audio'; if(t.includes('pdf'))return'fa-file-pdf';
  if(t.includes('zip')||/\.(zip|rar|7z|tar|gz)$/i.test(n||''))return'fa-file-zipper';
  if(t.includes('word')||/\.(doc|docx|odt)$/i.test(n||''))return'fa-file-word';
  if(t.includes('sheet')||/\.(xls|xlsx|csv|ods)$/i.test(n||''))return'fa-file-excel';
  if(t.includes('javascript')||/\.(js|ts|json|py|html|css)$/i.test(n||''))return'fa-file-code';
  return'fa-file';
}
/* Error de Storage con una explicación útil. El 403 de Supabase Storage
   casi siempre es una política del bucket `uploads`, no del perfil. */
function storageError(err,file){
  const m=String((err&&err.message)||err||'');
  if(/bucket.*not.*found|not found/i.test(m))
    return 'No existe el bucket «uploads» en Supabase Storage. Créalo como público '
      +'y ejecuta sql/09-permisos-storage-media.sql.';
  if(/mime|content.?type|not supported/i.test(m))
    return 'El bucket «uploads» no acepta el tipo '+(file&&file.type||'de archivo')+'. '
      +'Ejecuta sql/09-permisos-storage-media.sql para permitir vídeo y audio.';
  if(/row-level security|permission denied|not authorized|403|new row violates/i.test(m))
    return 'Permiso denegado en Storage para «'+(file&&file.name||'archivo')+'». '
      +'Ejecuta sql/09-permisos-storage-media.sql en Supabase → SQL Editor. '
      +'También revisa que el bucket «uploads» sea público y permita vídeo/audio.';
  if(/too large|maximum.*size|exceeded/i.test(m))
    return 'El archivo supera el límite del bucket «uploads» (25 MB en la app).';
  return m||'No se pudo subir el archivo.';
}
/* Sube sin recomprimir: para todo lo que no sea imagen */
async function upRaw(file){
  if(file.size>MAXFILE)throw new Error('«'+file.name+'» supera los 25 MB.');
  const path=`${me.id}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${extOf(file.name).toLowerCase()}`;
  const{error}=await sb.storage.from('uploads').upload(path,file,{contentType:file.type||'application/octet-stream'});
  if(error)throw new Error(storageError(error,file));
  return sb.storage.from('uploads').getPublicUrl(path).data.publicUrl;
}
/* Selector de archivos: imágenes se redimensionan, el resto sube tal cual */
function chooseFiles(where){
  const i=document.createElement('input');
  i.type='file';i.multiple=true;
  i.onchange=async()=>{
    const files=[...i.files].slice(0,10);
    i.value='';
    if(!files.length)return;
    toast('Subiendo '+files.length+' archivo(s)…','ok',1600);
    for(const f of files){
      try{
        let u;
        if(f.type.startsWith('image/')) u=await up(f);
        else u=await upRaw(f);
        if(u)PEND.push({u,n:f.name,t:f.type||'',s:f.size});
      }catch(e){toast(e.message,'err',6000)}
    }
    drawPend(where);
  };
  i.click();
}
function drawPend(where){
  const box=where=='dm'?$('pendm'):$('pend');
  if(!box)return;
  box.innerHTML=PEND.map((a,i)=>`<span class="chip"><i class="fa-solid ${iconOf(a.t,a.n)}"></i>
    <span>${esc(a.n)}</span><button onclick="rmPend(${i},'${where}')" title="Quitar"><i class="fa-solid fa-xmark"></i></button></span>`).join('');
}
function rmPend(i,where){PEND.splice(i,1);drawPend(where)}
function clearPend(where){PEND=[];drawPend(where)}
function attHtml(list){
  if(!list||!list.length)return'';
  return `<div class="atts">${list.map(a=>{
    const t=a.t||'',n=a.n||'archivo';
    if(t.startsWith('image/'))
      return `<a href="${esc(a.u)}" target="_blank" rel="noopener"><img class="att" src="${esc(a.u)}" alt="${esc(n)}" loading="lazy" onclick="event.preventDefault();zoom('${esc(a.u)}')"></a>`;
    if(t.startsWith('video/'))return `<video class="att" src="${esc(a.u)}" controls preload="metadata"></video>`;
    if(t.startsWith('audio/'))return `<audio class="att" src="${esc(a.u)}" controls preload="metadata"></audio>`;
    return `<a class="att file" href="${esc(a.u)}" target="_blank" rel="noopener" download="${esc(n)}">
      <i class="fa-solid ${iconOf(t,n)}"></i><span>${esc(n)}</span><span class="mu">${kb(a.s)}</span></a>`;
  }).join('')}</div>`;
}
function zoom(u){const d=document.createElement('div');d.className='zoom';
  d.onclick=()=>d.remove();d.innerHTML=`<img src="${esc(u)}" alt="">`;document.body.appendChild(d)}
/* Diálogo del micrófono: explica el motivo real y cómo resolverlo */
function micDlg(msg){
  const d=document.createElement('div');d.id='micdlg';
  d.innerHTML=`<div class="box">
    <h3><i class="fa-solid fa-microphone-slash" style="color:var(--rd)"></i> No se pudo abrir el micrófono</h3>
    <pre>${esc(msg)}</pre>
    ${micHelp()?`<div class="mu"><b>Cómo solucionarlo:</b>
      <ol>
        <li>Sirve la carpeta en local:<br><code>python3 -m http.server 8080</code></li>
        <li>Abre <b>http://localhost:8080/index.html</b> (fíjate en <i>localhost</i>, no en <i>file://</i>).</li>
        <li>Pulsa el candado de la barra de direcciones y permite el micrófono.</li>
        <li>Vuelve a pulsar «Unirme a la voz».</li>
      </ol></div>`:`<div class="mu">Pulsa el candado de la barra de direcciones y comprueba que el micrófono está permitido para este sitio.</div>`}
    <div class="row"><button class="p grow" onclick="document.getElementById('micdlg').remove()">Entendido</button>
      <button class="sm" onclick="joinVoice()"><i class="fa-solid fa-rotate-right"></i> Reintentar</button></div>
  </div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
}

/* ==========================================================================
   3) Autenticación
   ========================================================================== */
function tab(n){$('f1').classList.toggle('hide',n!=1);$('f2').classList.toggle('hide',n!=2);$('t1').classList.toggle('p',n==1);$('t2').classList.toggle('p',n==2);const rb=$('rembox');if(rb&&getRemembered())rb.classList.toggle('hide',n!=1)}
const mail=u=>String(u).toLowerCase()+'@theblacklist.app';

/* Carga visible al entrar o registrarse. No es un temporizador que “finge”
   sin hacer nada: envuelve las llamadas reales y, si el servidor tarda,
   sigue mostrando el progreso hasta que start() termina. */
let BOOT_T0=0,BOOT_TIMER=null;
function bootShow(text='Comprobando tu cuenta…'){
  let d=document.getElementById('bootload');
  if(!d){
    d=document.createElement('div');d.id='bootload';
    d.innerHTML=`<div class="bootcard">
      <div class="bootmark"><i class="fa-solid fa-lock"></i></div>
      <h2>The Black List</h2>
      <p id="boottext">${esc(text)}</p>
      <div class="bootbar"><span></span></div>
      <div class="bootsub">Conexión cifrada · tus mensajes siguen siendo privados</div>
    </div>`;
    document.body.appendChild(d);
  }
  d.classList.remove('off');
  const t=document.getElementById('boottext');if(t)t.textContent=text;
  BOOT_T0=Date.now();
  clearInterval(BOOT_TIMER);
  const steps=['Comprobando tu cuenta…','Preparando tus llaves…','Guardando tu perfil…','Cargando publicaciones…','Preparando tus chats…','Casi listo…'];
  let i=0;
  BOOT_TIMER=setInterval(()=>{
    const e=document.getElementById('boottext');
    if(e)e.textContent=steps[Math.min(i++,steps.length-1)];
  },950);
}
function bootHide(){
  clearInterval(BOOT_TIMER);
  const d=document.getElementById('bootload');if(!d)return;
  const wait=Math.max(0,1050-(Date.now()-BOOT_T0));
  setTimeout(()=>{
    d.classList.add('off');
    setTimeout(()=>d.remove(),420);
  },wait);
}

/* ---------- Cuenta recordada en este navegador ----------
   Guarda UID + PIN para rellenar el acceso y no perder el registro al
   recargar o cerrar sesión. Solo vive en localStorage de este navegador. */
const REM_KEY='tbl_last_login';
function getRemembered(){
  try{
    const r=JSON.parse(localStorage.getItem(REM_KEY)||'null');
    if(!r||!r.uid||!/^\d{6}$/.test(String(r.pin||'')))return null;
    return r;
  }catch(e){return null}
}
function rememberAccount(uid,pin,name){
  try{
    const u=String(uid||'').toLowerCase();
    if(!u||!/^\d{6}$/.test(String(pin||'')))return;
    const old=getRemembered();
    const prevName=(old&&old.uid===u)?old.name:'';
    localStorage.setItem(REM_KEY,JSON.stringify({
      uid:u,pin:String(pin||''),
      name:String(name||prevName||''),at:Date.now()
    }));
  }catch(e){}
}
/* Actualiza solo el nombre de una cuenta YA recordada. No crea una cuenta
   nueva si el usuario desmarcó «Recordar esta cuenta». */
function rememberName(uid,name){
  try{
    const r=getRemembered();if(!r||r.uid!==String(uid||'').toLowerCase())return;
    r.name=String(name||r.name||'');r.at=Date.now();
    localStorage.setItem(REM_KEY,JSON.stringify(r));
  }catch(e){}
}
function restoreRemembered(){
  const r=getRemembered();
  const c1=document.getElementById('rem1');if(c1)c1.checked=!!r;
  if(!r)return;
  $('lu').value=r.uid;
  $('lp').value=r.pin;
  const box=$('rembox');if(!box)return;
  box.classList.remove('hide');
  box.innerHTML=`<div class="remcard">
    <i class="fa-solid fa-face-smile" style="color:var(--ac);font-size:22px"></i>
    <div class="grow"><b>${esc(r.name||r.uid)}</b><span>@${esc(r.uid)} · recordado en este navegador</span></div>
    <button class="p sm" onclick="login()" type="button">Entrar</button>
    <button class="sm" onclick="forgetRemembered()" title="Olvidar esta cuenta" type="button"><i class="fa-solid fa-xmark"></i></button>
  </div>`;
}
function forgetRemembered(){
  try{localStorage.removeItem(REM_KEY)}catch(e){}
  $('rembox').classList.add('hide');$('rembox').innerHTML='';
  $('lu').value='';$('lp').value='';
  toast('Cuenta olvidada en este navegador.');
}

/* ---------- PIN: exactamente 6 dígitos ----------
   inputmode="numeric" es solo una sugerencia al móvil: en un teclado normal
   se pueden escribir letras igual. Aquí se recorta y se filtra de verdad. */
const PIN_RE=/^\d{6}$/;
function pinOk(pw){
  if(!pw)return 'Escribe tu PIN.';
  if(!/^\d*$/.test(pw))return 'El PIN solo puede tener números.';
  if(pw.length!==6)return 'El PIN tiene que tener exactamente 6 dígitos (llevas '+pw.length+').';
  return null;
}
function limpiarPIN(id){
  const e=$(id);if(!e)return;
  e.value=String(e.value).replace(/\D/g,'').slice(0,6);
}
async function reg(){
  if(!navigator.onLine)return toast('Sin conexión: crea la cuenta cuando recuperes internet.','warn',8000);
  const name=val('rn'),pw=$('rp').value;
  if(!name)return toast('Escribe tu nombre visible.','err');
  const pErr=pinOk(pw);
  if(pErr)return toast(pErr,'err');
  bootShow('Creando tu cuenta…');
  try{
  const uid='u'+Array.from({length:12},()=>Math.floor(Math.random()*10)).join('');
  const kp=await crypto.subtle.generateKey(ECDH,true,['deriveKey']);
  const pub=await crypto.subtle.exportKey('jwk',kp.publicKey),pv=await crypto.subtle.exportKey('jwk',kp.privateKey);
  let{data,error}=await sb.auth.signUp({email:mail(uid),password:pw});
  if(error)return toast(error.message,'err');
  /* Al registrarse se entra directo: si Supabase no devuelve sesión (porque
     tiene activada la confirmación por correo), se inicia sesión aquí mismo
     con el mismo UID y PIN, sin pasar por la pantalla de «Entrar». */
  if(!data.session){
    const r2=await sb.auth.signInWithPassword({email:mail(uid),password:pw});
    if(r2.error||!r2.data||!r2.data.session)
      return toast('La cuenta se creó, pero Supabase pide confirmar el correo. '
        +'Desactiva «Confirm email» en Supabase → Authentication → Providers → Email.','err',12000);
    data=r2.data;
  }
  const id=data.user.id;
  localStorage.setItem('tbl_'+id,JSON.stringify(pv));
  const remReg=document.getElementById('rem2');
  if(!remReg||remReg.checked)rememberAccount(uid,pw,name);
  else{try{localStorage.removeItem(REM_KEY)}catch(e){}}
  /* Primero el perfil y después la llave: keyvault.user_id apunta a
     profiles.id, y al revés el servidor devuelve 23503. */
  /* Importante: si el perfil NO se guarda, la cuenta de Auth queda creada pero
     incompleta, y al siguiente intento entra «no tiene perfil» sin remedio.
     Por eso se reintenta y, si sigue fallando, se repara ESTA cuenta: crear
     otra vez solo dejaba un montón de cuentas a medias. */
  let e1=await crearPerfil(id,uid,pub,name);
  if(e1)e1=await crearPerfil(id,uid,pub,name);            /* un reintento */
  if(e1){
    SB_SESSION=data.session;me={id,uid,name:val('rn'),accent:'#ff8e9b'};
    toast('La cuenta se creó en el servidor pero el perfil no se pudo guardar.','err',14000);
    return mostrarBloqueo({id,reparar:true,
      fallo:'Tu cuenta <b>'+esc(uid)+'</b> se ha creado, pero el perfil se ha'
           +' quedado a medias.<br><span class="mu">No pulses «Crear cuenta» otra'
           +' vez: crearía otra cuenta y dejaría esta sin arreglar. Pulsa'
           +' «Reparar esta cuenta» para guardarlo todo.</span><br><span class="mu">'
           +e1+'</span>'});
  }
  const e2=await crearLlave(id,JSON.stringify(pv),pw);
  if(e2)return toast(e2,'err',8000);
  $('rp').value='';
  toast('Cuenta creada. Tu UID es: '+uid+'\nGuárdalo: lo necesitas junto con tu PIN.','ok',14000);
  WELCOME_PENDING=true;
  await start();
  }finally{bootHide()}
}
async function login(){
  if(!navigator.onLine)return toast('Sin conexión: para entrar por primera vez necesitas internet. Si ya entraste antes, recarga la página.','warn',8000);
  const uid=val('lu').toLowerCase(),pw=$('lp').value;
  if(!uid)return toast('Escribe tu UID.','err');
  if(!/^[a-z0-9_]{3,20}$/.test(uid))
    return toast('El UID son 3–20 caracteres en minúsculas: letras, números o guion bajo.','err');
  const pErr=pinOk(pw);
  if(pErr)return toast(pErr,'err');
  bootShow('Entrando en tu cuenta…');
  try{
    const{data,error}=await sb.auth.signInWithPassword({email:mail(uid),password:pw});
    if(error)return toast('UID o PIN incorrectos.','err');
    /* Si el acceso va bien, comprobarCuenta() decide si se entra: con perfil,
       sí; sin perfil, avisa de por qué y no deja la app a medias. */
    const remLogin=document.getElementById('rem1');
    if(!remLogin||remLogin.checked)rememberAccount(uid,pw);
    else{try{localStorage.removeItem(REM_KEY)}catch(e){}}
    WELCOME_PENDING=true;
    await start();
  }finally{bootHide()}
}
/* ---------- Crear perfil y llave (solo al registrarse) ----------
   Se usa INSERT y no upsert por dos motivos concretos:
     · upsert hace ON CONFLICT DO UPDATE, que evalúa la política de UPDATE en
       otro contexto y devolvía 42501
     · keyvault.user_id tiene clave foránea a profiles.id, así que el perfil
       tiene que existir ANTES que la llave (si no, 23503) */
/* VERIFICA que la fila existe de verdad. Un insert sin error, o un RPC que
   devuelve 200 con «true», NO prueban que la fila se haya escrito: un
   SECURITY DEFINER mal escrito devolvía ok sin guardar nada y la cuenta se
   quedaba huérfana. Aquí se relee siempre. */
const perfilExiste=async id=>{
  const{count,error}=await sb.from('profiles').select('id',{count:'exact',head:true}).eq('id',id);
  return !error&&count>0;
};
async function crearPerfil(id,uid,pub,name){
  const display=name||uid;
  const{error}=await sb.from('profiles').insert({id,uid,name:display,pubkey:pub});
  if(!error&&await perfilExiste(id))return null;
  if(!error&&!await perfilExiste(id)){
    /* El insert dijo que sí, pero no se ve la fila: casi siempre la
       política de lectura. Se reintenta por RPC y se vuelve a comprobar. */
    await sb.rpc('save_profile',{p_uid:uid,p_name:display,p_pub:pub}).then(()=>{},()=>{});
    if(await perfilExiste(id))return null;
    return 'El servidor aceptó el registro pero <b>no se ve tu perfil</b>. '
         +'Suele ser la política <b>p_sel</b> de la tabla <b>profiles</b>.<br>'
         +'<span class="mu">Ejecuta <b>'+SQL_FIX+'</b> en el SQL'
         +' Editor de Supabase y vuelve a intentarlo.</span>';
  }
  if(error.code=='23505')return null;              /* ya existía: no es un fallo */
  const r=await sb.rpc('save_profile',{p_uid:uid,p_name:display,p_pub:pub});
  if(!r.error&&await perfilExiste(id))return null;
  return 'No se pudo guardar tu perfil: '+explain(error);
}
async function crearLlave(id,privJWK,pw){
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const cifrada=b64(salt)+'|'+await enc(await pk(pw,salt),privJWK);
  const{error}=await sb.from('keyvault').insert({user_id:id,enc_priv:cifrada});
  if(!error)return null;
  if(error.code=='23505')return null;              /* ya existía: no es un fallo */
  const r=await sb.rpc('save_key',{p_priv:cifrada});
  if(!r.error)return null;
  return 'No se pudo guardar tu llave: '+explain(error);
}
/* ---------- Reparar una cuenta huérfana ----------
   La cuenta existe en Auth pero se quedó sin perfil, o sin llave. No se
   inventa nada: se genera un par de claves NUEVO en este navegador y se
   guarda con repair_account(), que escribe perfil y llave en la misma
   transacción y solo devuelve ok si están de verdad.
   Lo que se pierde son los mensajes privados cifrados con la llave vieja.

   repair_account() no siempre está en la base de datos (es la función que
   faltaba en el proyecto real), así que si el servidor dice que no existe
   se cae a save_profile() + save_key(), que sí estaban. Antes, ese fallo
   dejaba al usuario con un botón que no podía hacer nada. */
async function repairAccount(){
  if(!SB_SESSION)return toast('Primero inicia sesión con tu UID y tu PIN.','warn');
  const id=SB_SESSION.user.id;
  const pin=prompt('Escribe tu PIN de 6 dígitos para cifrar la nueva llave:');
  if(!pin)return toast('Operación cancelada.','warn');
  const pErr=pinOk(pin);
  if(pErr)return toast(pErr,'err');
  toast('Reparando la cuenta…','ok',3000);
  const uid=val('lu')||(me&&me.uid)||(SB_SESSION.user.email||'').split('@')[0]||'';
  /* 1) Par de claves nuevo en el navegador */
  const kp=await crypto.subtle.generateKey(ECDH,true,['deriveKey']);
  const pub=await crypto.subtle.exportKey('jwk',kp.publicKey);
  const pv =await crypto.subtle.exportKey('jwk',kp.privateKey);
  /* 2) La llave privada, cifrada con el PIN */
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const cifrada=b64(salt)+'|'+await enc(await pk(pin,salt),JSON.stringify(pv));
  /* 3) Una sola escritura, verificada por el servidor. Si repair_account no
        existe (PGRST202) se cae a save_profile + save_key: dos llamadas en
        lugar de una, pero hacen lo mismo y esas sí suelen estar. */
  let error=(await sb.rpc('repair_account',{p_uid:uid,p_pub:pub,p_priv:cifrada})).error;
  if(error&&isNoFn(error)){
    const a=await sb.rpc('save_profile',{p_uid:uid,p_name:uid,p_pub:pub});
    if(a.error)return toast('No se pudo guardar el perfil: '+explain(a.error),'err',10000);
    const b=await sb.rpc('save_key',{p_priv:cifrada});
    if(b.error)return toast('No se pudo guardar la llave: '+explain(b.error),'err',10000);
    error=null;
  }
  if(error)return toast('No se pudo reparar: '+explain(error),'err',10000);
  /* 4) Comprobación: si tampoco se ve, es la política de lectura */
  if(!await perfilExiste(id))
    return toast('El servidor guardó los datos pero <b>tampoco se ven</b>: la'
      +' política de lectura de <b>profiles</b> está mal.<br><span class="mu">'
      +'Ejecuta <b>'+SQL_FIX+'</b>.</span>','err',14000);
  localStorage.setItem('tbl_'+id,JSON.stringify(pv));
  toast('¡Cuenta reparada! Ya puedes entrar.','ok',6000);
  location.reload();
}
/* ---------- Diagnóstico en vivo: preguntar al servidor, no adivinar ----------
   El fallo real (verificado en el proyecto) era que la tabla tenía el RLS
   activado y NINGUNA política: el usuario autenticado no leía nada y no
   escribía nada. La app lo repetía como «política de lectura», que es una
   forma de adivinar. Aquí se distingue con dos pruebas:

     INSERT con el id del propio usuario
       · 23505 «duplicate key» → la escritura HA PASADO el RLS y solo choca
         con la clave que ya existe: la fila existe de verdad.
       · 42501                → el RLS bloquea la escritura.
       · sin error             → la fila no existía y se ha creado.

     SELECT de profiles
       · 0 filas con la fila existente → falta la política de LECTURA.

   No deja basura: el INSERT usa el id y el UID de la cuenta del usuario, así
   que o no hace nada o crea exactamente el perfil que faltaba. */
async function diagnosticar(id){
  const d={escritura:'?',filas:'?',perfil:'?',saveProfile:'?',notas:[]};
  const uid=val('lu')||(SB_SESSION&&SB_SESSION.user.email||'').split('@')[0]||'';
  const w=await sb.from('profiles').insert({id,uid,name:uid}).then(r=>r,()=>({error:{code:'?'}}));
  /* 23505 puede ser por el id (mi fila ya está) o por el UID (lo usa otra
     cuenta): el mensaje dice cuál de las dos claves ha chocado. */
  d.escritura=!w.error?'creada'
    :/pkey/.test(w.error.message||'')?'ya-existe'
    :w.error.code;
  const{count,error}=await sb.from('profiles').select('id',{count:'exact',head:true});
  d.filas=error?'error':(count||0);
  const{data}=await sb.from('profiles').select('id,uid').eq('id',id).maybeSingle();
  d.perfil=data?data.uid:'no se ve';
  /* La RPC del camino de entrada. Se llama con los NOMBRES REALES de sus
     parámetros: con un argumento inventado, PostgREST responde PGRST202
     tanto si la función existe como si no, y el sondeo no diría nada.
     Solo se llama cuando el perfil NO se ve: si ya existe, escribirlo
     volvería a poner el nombre de la cuenta en vez del que eligió el
     usuario, y aquí no hay nada que arreglar con una escritura. */
  d.saveProfile='sin comprobar';
  if(d.perfil=='no se ve'){
    const{error:e}=await sb.rpc('save_profile',{p_uid:uid,p_name:null,p_pub:null})
      .then(()=>({error:null}),e=>({error:e}));
    d.saveProfile=isNoFn(e)?'no existe':'existe';
  }
  if(d.escritura=='42501')
    d.notas.push('El servidor tiene el RLS activado pero <b>sin políticas</b>: no deja escribir.');
  if((d.escritura=='ya-existe'||d.escritura=='creada')&&d.perfil=='no se ve')
    d.notas.push('Tu fila de perfil <b>existe</b> pero <b>no se puede leer</b>: falta la'
      +' política de lectura. Por eso el login es correcto y la app no entra.');
  if(d.filas==='error')
    d.notas.push('La lectura de <b>profiles</b> da error: revisa los permisos del proyecto.');
  if(d.saveProfile=='existe'&&d.perfil=='no se ve')
    d.notas.push('La función <b>save_profile</b> sí está: el botón «Reparar esta cuenta»'
      +' puede escribir aunque <b>repair_account</b> no exista.');
  if(!d.notas.length)
    d.notas.push('El servidor responde bien. Si el problema sigue, la fila se ve pero'
      +' está incompleta: pulsa «Reparar esta cuenta».');
  return d;
}
/* ---------- Pantalla de bloqueo con salida ----------
   No se entra a la app a medias, pero tampoco se deja al usuario sin
   opciones. Se dice qué pasa y se ofrece reparar la cuenta. */
function mostrarBloqueo(chk){
  bootHide();
  $('auth').classList.remove('hide');$('app').classList.add('hide');
  $('main').innerHTML='';$('side').innerHTML='';
  document.body.classList.remove('open');
  let d=document.getElementById('bloqueo');
  if(d)d.remove();
  d=document.createElement('div');d.id='bloqueo';
  d.innerHTML=`<div class="authbox" style="border:1px solid var(--rd);background:rgba(127,29,29,.16)">
    <h3 style="font-family:Syne;font-size:22px"><i class="fa-solid fa-triangle-exclamation"
      style="color:var(--rd)"></i> No se pudo entrar</h3>
    <div style="font-size:14px">${chk.fallo}</div>
    <div id="diagbox" class="mu" style="font-size:13px;margin:10px 0"></div>
    ${chk.reparar?`<button class="p" onclick="repairAccount()">
        <i class="fa-solid fa-wrench"></i> Reparar esta cuenta</button>
      <p class="mu" style="margin:0">Genera una llave nueva en este navegador y
      guarda tu perfil otra vez. Publicaciones, salas y mensajes se conservan.</p>`
      :''}
    <div class="row"><button class="sm" onclick="salirBloqueo()">
        <i class="fa-solid fa-right-from-bracket"></i> Salir de esta cuenta</button></div>
  </div>`;
  $('auth').appendChild(d);
  d.scrollIntoView({behavior:'smooth',block:'center'});
  /* El diagnóstico se pinta después para que la pantalla aparezca ya y el
     usuario no espere a la red. */
  if(chk.id)mostrarDiagnostico(chk);
}
/* ---------- Pinta el diagnóstico con lo que el servidor acaba de decir ---- */
async function mostrarDiagnostico(chk){
  const box=document.getElementById('diagbox');
  if(!box)return;
  if(!navigator.onLine){box.innerHTML='Sin conexión: no se puede consultar el servidor ahora.';return}
  box.innerHTML='<i class="fa-solid fa-spinner"></i> Comprobando el servidor…';
  let d=chk.diag;
  if(!d)try{d=await diagnosticar(chk.id)}catch(e){box.innerHTML='';return}
  if(!d){box.innerHTML='';return}
  box.innerHTML=`<b>Lo que responde el servidor ahora mismo</b>
    <table style="margin:6px 0;font-size:13px">
      <tr><td style="padding:1px 10px 1px 0">Escribir tu perfil</td><td><code>${d.escritura}</code></td></tr>
      <tr><td style="padding:1px 10px 1px 0">Leer tu perfil</td><td><code>${d.perfil}</code>${d.filas!=='error'?' · '+d.filas+' perfiles visibles':''}</td></tr>
      <tr><td style="padding:1px 10px 1px 0">Función save_profile</td><td><code>${d.saveProfile}</code></td></tr>
    </table>
    ${d.notas.map(n=>'• '+n).join('<br>')}
    <div style="margin-top:8px">Solución: Supabase → <b>SQL Editor</b> → pegar
      <b>${SQL_FIX}</b> → <b>Run</b>. Después recarga con Ctrl+F5.</div>`;
}
async function salirBloqueo(){
  document.getElementById('bloqueo')?.remove();
  /* Salir de esta cuenta es un logout: también se olvida la cuenta
     recordada para que start() no vuelva a entrar sola. */
  try{localStorage.removeItem(REM_KEY)}catch(e){}
  await sb.auth.signOut();SB_SESSION=null;
  $('auth').classList.remove('hide');$('app').classList.add('hide');
  $('lu').value='';$('lp').value='';
  const rb=$('rembox');if(rb){rb.classList.add('hide');rb.innerHTML=''}
}
/* ---------- Comprobar que la cuenta existe de verdad ----------
   Solo mira. Si el perfil no existe o no se puede leer, no se entra: se
   explica POR QUÉ y se ofrece la reparación, que es lo único que funciona.
   Antes decía «crea la cuenta de nuevo», que solo llevaba a fallar otra vez. */
async function comprobarCuenta(id){
  const j=localStorage.getItem('tbl_'+id);
  const{data:p,error:pe}=await sb.from('profiles').select('*').eq('id',id).maybeSingle();
  if(pe){
    /* Sin internet no se puede comprobar el perfil contra el servidor, pero
       si ya se guardó antes se entra con la copia local. */
    if(isNetError(pe)){
      const cp=cacheRead(id,'profile');
      if(cp&&j&&j.startsWith('{'))return{offline:true,id,perfil:cp};
    }
    return{fallo:'No se pudo leer tu perfil: '+explain(pe),id};
  }
  if(!p)
    return{fallo:'Tu UID y tu PIN son correctos, pero <b>no se encuentra tu'
                +' perfil</b> en la base de datos.<br><span class="mu">'
                +'Debajo se comprobó qué responde el servidor ahora mismo.'
                +'Casi siempre es que falta el bloque de <b>políticas RLS</b>:'
                +' ejecuta <b>'+SQL_FIX+'</b> en Supabase → SQL Editor.</span>'
                ,reparar:true,id};
  if(!p.pubkey)
    return{fallo:'Tu perfil no tiene llave pública, así que no se puede cifrar'
                +' hacia ti.<br><span class="mu">Pulsa «Reparar esta cuenta».'
                +'</span>',reparar:true,id};
  if(j&&j.startsWith('{'))return{ok:true,perfil:p};
  const{data:kv}=await sb.from('keyvault').select('enc_priv').eq('user_id',id).maybeSingle();
  if(!kv)
    return{fallo:'No se encontró tu llave de cifrado: en este navegador no'
                +' está y tampoco en el servidor.'
                +'<br><span class="mu">Pulsa «Reparar esta cuenta» para generar'
                +' una nueva. Los mensajes privados antiguos quedarían'
                +' ilegibles; el resto se conserva.</span>',reparar:true,id};
  return{llave:kv.enc_priv,perfil:p};
}
async function logout(){
  stopProfileMusic();
  /* Al cerrar sesión se olvida la cuenta recordada: si no, start() volvería
     a entrar sola y sería imposible cambiar de cuenta. */
  try{localStorage.removeItem(REM_KEY)}catch(e){}
  await sb.auth.signOut();
  localStorage.removeItem('tbl_'+me.id);localStorage.removeItem('tbl_last_id');
  location.reload();
}

async function startOffline(id,profile){
  OFFLINE=true;
  const cached=restoreCache(id);
  me=fx(profile||cached.profile);
  if(!me||!me.id){
    bootHide();
    restoreRemembered();
    toast('Sin conexión y no hay una copia guardada de esta cuenta.','warn',8000);
    return;
  }
  P[me.id]=me;
  const j=localStorage.getItem('tbl_'+id);
  if(!j||!j.startsWith('{')){
    return mostrarBloqueo({id,reparar:true,
      fallo:'Estás sin conexión y este navegador no tiene tu llave de cifrado. '
           +'Conecta a internet una vez para recuperarla.'});
  }
  try{
    priv=await crypto.subtle.importKey('jwk',JSON.parse(j),ECDH,false,['deriveKey']);
  }catch(e){
    return mostrarBloqueo({id,reparar:true,
      fallo:'La llave guardada en este navegador está dañada. Conecta a internet '
           +'y pulsa «Reparar esta cuenta».'});
  }
  document.documentElement.style.setProperty('--ac',me.accent||'#ff8e9b');
  $('auth').classList.add('hide');$('app').classList.remove('hide');
  bootHide();
  cacheProfile();
  await go('feed');
  handleDeepLink();
  if(WELCOME_PENDING){WELCOME_PENDING=false;setTimeout(()=>welcomeDlg(),450)}
}
async function start(){
  let session=null;
  const remStart=getRemembered();
  /* Si la cuenta está recordada, se muestra SOLO la pantalla de carga.
     Nunca se enseña el login mientras se comprueba/renueva la sesión. */
  if(remStart)bootShow('Entrando con tu cuenta recordada…');
  try{
    const r=await sb.auth.getSession();
    session=r&&r.data&&r.data.session||null;
  }catch(e){
    if(!navigator.onLine){
      const last=localStorage.getItem('tbl_last_id');
      const cp=last&&cacheRead(last,'profile');
      if(cp)return startOffline(last,cp);
    }
    bootHide();
    restoreRemembered();
    toast('No se pudo comprobar la sesión. Revisa tu conexión e inténtalo otra vez.','warn',8000);
    return;
  }
  /* La sesión de Supabase caduca. Si hay una cuenta recordada, se renueva
     automáticamente con su UID + PIN, sin volver a pedir el login. */
  if(!session&&remStart&&navigator.onLine){
    try{
      const r=await sb.auth.signInWithPassword({email:mail(remStart.uid),password:remStart.pin});
      if(!r.error&&r.data&&r.data.session)session=r.data.session;
    }catch(e){}
  }
  if(!session){
    if(!navigator.onLine){
      const last=localStorage.getItem('tbl_last_id');
      const cp=last&&cacheRead(last,'profile');
      if(cp)return startOffline(last,cp);
    }
    bootHide();
    restoreRemembered();return;
  }
  if(!remStart)bootShow('Cargando tu cuenta…');
  /* Se guarda en global: repairAccount() necesita saber con qué cuenta
     está trabajando aunque `me` todavía no exista. */
  SB_SESSION=session;
  const id=session.user.id;
  /* Sin conexión se entra directo con la copia local, sin esperar a que
     Supabase falle y sin mostrar el aviso de «perfil no encontrado». */
  if(!navigator.onLine){
    const cp=cacheRead(id,'profile');
    if(cp)return startOffline(id,cp);
  }
  /* Solo se COMPRUEBA que la cuenta exista. No se crea ni se recupera nada:
     si el perfil no está, no se entra y se explica por qué. */
  const chk=await comprobarCuenta(id);
  if(chk.offline)return startOffline(id,chk.perfil);
  if(chk.fallo){
    /* Antes de rendirse: diagnosticar() intenta escribir el perfil, y si de
       verdad faltaba (no solo «no se ve») eso lo arregla. Se reintenta la
       comprobación una vez y solo si sigue fallando se muestra el bloqueo. */
    chk.diag=await diagnosticar(id);
    if(chk.diag.escritura=='creada'||chk.diag.escritura=='ya-existe'){
      const r=await comprobarCuenta(id);
      /* El reintento puede venir ya bien: se quita el fallo ANTES de seguir,
         porque si no el objeto se quedaría con el fallo viejo. */
      if(!r.fallo){chk.ok=true;chk.perfil=r.perfil;delete chk.fallo;delete chk.reparar}
    }
  }
  if(chk.fallo){
    /* Antes: cerrar sesión y soltar un toast. Eso era un callejón sin
       salida, porque la única pista era «crea la cuenta de nuevo» y volver
       a crearla fallaba por lo mismo. Ahora se explica y se ofrece la
       reparación, que sí funciona.
       NO se cierra sesión: repairAccount() necesita la sesión para poder
       escribir con repair_account(). El botón «Cerrar aviso» de la pantalla
       de bloqueo sí cierra la sesión si el usuario quiere cambiar de cuenta. */
    mostrarBloqueo(chk);
    return;
  }
  /* La llave privada está en este navegador o cifrada en el servidor. */
  let j=localStorage.getItem('tbl_'+id);
  if(!j&&chk.llave){
    const rem=getRemembered();
    let pw=(rem&&rem.uid===(chk.perfil.uid||''))?rem.pin:'';
    let abierta=false;
    /* Si la cuenta está recordada, se prueba su PIN sin preguntar. */
    if(pw){
      const[s,rest]=chk.llave.split('|');
      const prueba=await dec(await pk(pw,ub(s)),rest);
      if(prueba&&prueba.startsWith('{')){j=prueba;abierta=true}
    }
    if(!abierta){
      pw=prompt('Escribe tu PIN para abrir tu llave de cifrado:');
      if(!pw){await sb.auth.signOut();$('auth').classList.remove('hide');$('app').classList.add('hide');return}
      const[s,rest]=chk.llave.split('|');
      j=await dec(await pk(pw,ub(s)),rest);
      if(!j||!j.startsWith('{')){
        toast('El PIN no es el de esta cuenta, no se pudo abrir la llave.','err',8000);
        await sb.auth.signOut();$('auth').classList.remove('hide');$('app').classList.add('hide');
        return;
      }
    }
    localStorage.setItem('tbl_'+id,j);
    const remNow=getRemembered();
    if(remNow&&remNow.uid===chk.perfil.uid)rememberAccount(chk.perfil.uid,pw,chk.perfil.name);
  }
  /* Si no hay llave en ninguna parte, antes esto reventaba con
     «JSON.parse(undefined)» y la app se quedaba en blanco sin decir nada.
     Ahora se comprueba y se ofrece repararla. */
  if(!j||!j.startsWith('{')){
    return mostrarBloqueo({id,reparar:true,
      fallo:'Se ha entrado, pero <b>no hay llave de cifrado</b>: ni en este'
           +' navegador ni en el servidor. Sin ella no se pueden cifrar los'
           +' mensajes privados.<br><span class="mu">Pulsa «Reparar esta cuenta»'
           +' para generar una nueva. Las conversaciones antiguas quedarían'
           +' ilegibles; todo lo demás se conserva.</span>'});
  }
  me=fx(chk.perfil);P[me.id]=me;
  localStorage.setItem('tbl_last_id',me.id);cacheProfile();
  /* Mantener el nombre visible de la cuenta recordada al día. */
  const rem= getRemembered();
  if(rem&&rem.uid===me.uid)rememberName(me.uid,me.name);
  /* Latido de actividad: es lo que permite mostrar «usuarios activos». */
  sb.from('profiles').update({last_seen:new Date().toISOString()}).eq('id',me.id).then(()=>{},()=>{});
  priv=await crypto.subtle.importKey('jwk',JSON.parse(j),ECDH,false,['deriveKey']);
  document.documentElement.style.setProperty('--ac',me.accent||'#ff8e9b');
  /* Comprobamos el esquema ANTES de tocar nada: sin esto, una tabla nueva
     que falte rompe el arranque y la app se queda en blanco sin explicar por qué. */
  await probeSchema();
  $('auth').classList.add('hide');$('app').classList.remove('hide');
  bootHide();
  const{data:mc}=await sb.from('characters').select('id,name,avatar,owner').eq('owner',me.id);MY=mc||[];
  MY.forEach(c=>C[c.id]=c);
  /* loadMyRoles / blocked pueden fallar si faltan tablas: no deben tumbar el arranque */
  await safe(loadMyRoles);await safe(blocked);await safe(loadLayout);
  realtime();await go('feed');bell();
  const inv=new URLSearchParams(location.search).get('inv');
  if(inv)joinByCode(inv);
  else handleDeepLink();
  /* Solo cuando se registra o inicia sesión de verdad. Al recargar con la
     sesión guardada no se repite el popup. */
  if(WELCOME_PENDING){WELCOME_PENDING=false;setTimeout(()=>welcomeDlg(),450)}
}
/* ---------- Detección de esquema incompleto ----------
   Si el SQL no está aplicado, la app sigue funcionando con lo que haya y avisa
   de lo que falta, en vez de quedarse en blanco. */
const MISSING_RE=/Could not find the table|PGRST205|schema cache|does not exist|column .* does not exist/i;
const isMissing=e=>!!e&&MISSING_RE.test(e.message||'');
/* PGRST202 = la FUNCIÓN no existe (404). Se distingue de «existe pero ha
   protestado por los argumentos», que es un error normal y no un fallo. */
const isNoFn=e=>!!e&&/PGRST202|Could not find the function|\b404\b/i.test(e.message||'');
let NEWOK=true, MISSING=new Set(), SBAR=null, NOFN=new Set();
async function safe(fn){
  try{return await fn()}catch(e){
    if(isMissing(e))MISSING.add('?');
    console.warn('omitido:',e.message);return null;
  }
}
/* Columnas que existen de verdad en cada tabla. Un SELECT con una columna
   inexistente falla entero (PGRST204), así que se prueban una a una con
   count=exact y head=true: no descargan filas y revelan qué hay. */
const COLS={profiles:new Set(),communities:new Set(),rooms:new Set(),posts:new Set(),messages:new Set(),dms:new Set(),comments:new Set(),shop_items:new Set()};
async function probeCols(table,candidates){
  if(!COLS[table])COLS[table]=new Set();
  for(const c of candidates){
    const{error}=await sb.from(table).select(c,{head:true}).limit(1);
    if(!error)COLS[table].add(c);
  }
}
/* Columnas OPCIONALES: las únicas que se descartan si no existen.
   Todo lo demás (name, body, room_key…) pasa SIEMPRE: son columnas base y
   quitarlas rompería los NOT NULL. Antes se filtraba por lista negra y
   `name` desaparecía, provocando «null value in column name». */
const OPTIONAL={
  profiles:['is_private','frame_id','bubble_id','bio','links','age','gender','bg','avatar','accent','title','wallet_on','keys','last_seen','playlist','profile_code'],
  communities:['join_mode','min_level','theme','cover','nsfw','rules','category'],
  rooms:['invite_code','turns_on','turn_order','turn_idx','is_locked','accent','theme','bg','max_mods'],
  posts:['is_pinned','cover','media','scope','is_reel','nsfw'],
  messages:['attachments','character_id'],
  dms:['attachments'],
  comments:['parent_id','attachments'],
  shop_items:['stock','sold'],
};
function fit(table,row){
  const known=COLS[table];
  if(!known||!known.size)return row;      // sin datos de sondeo: no tocar nada
  const opt=OPTIONAL[table]||[];
  const out={};
  for(const k in row){
    if(opt.includes(k)){ if(known.has(k)) out[k]=row[k]; }
    else out[k]=row[k];                    // columna base: siempre
  }
  return out;
}
async function probeSchema(){
  await probeCols('profiles',['is_private','frame_id','bubble_id','bio','links','age','gender','bg','avatar','accent','title','wallet_on','keys','last_seen','playlist','profile_code']);
  await probeCols('communities',['join_mode','min_level','theme','cover','nsfw','rules','category']);
  await probeCols('rooms',['invite_code','turns_on','turn_order','turn_idx','is_locked','accent','theme','bg','max_mods']);
  await probeCols('posts',['is_pinned','cover','media','scope','is_reel','nsfw','kind','image','community_id']);
  await probeCols('messages',['attachments','character_id','kind']);
  await probeCols('dms',['attachments','kind']);
  await probeCols('comments',['parent_id','attachments']);
  await probeCols('shop_items',['stock','sold']);
  const{error:e1}=await sb.from('posts').select('*,reactions(user_id,emoji)').limit(1);
  /* Puede fallar por tabla inexistente O por relación sin cachear: ambos casos
     sirven para que loadFeed use la selección corta. */
  if(embedBroken(e1)){NEWOK=false;MISSING.add('reactions (relación en caché de PostgREST)')}
  const{error:e2}=await sb.from('profiles').select('xp,coins',{head:true}).limit(1);
  if(isMissing(e2)){NEWOK=false;MISSING.add('profiles.xp/coins')}
  const{error:e3}=await sb.from('posts').select('is_pinned',{head:true}).limit(1);
  if(isMissing(e3)){NEWOK=false;MISSING.add('posts.is_pinned')}
  const{error:e4}=await sb.from('rooms').select('invite_code,turns_on,turn_order,turn_idx',{head:true}).limit(1);
  if(isMissing(e4)){NEWOK=false;MISSING.add('rooms.invite_code/turnos')}
  const{error:e5}=await sb.from('communities').select('join_mode',{head:true}).limit(1);
  if(isMissing(e5)){NEWOK=false;MISSING.add('communities.join_mode')}
  const{error:e6}=await sb.from('follows').select('follower_id',{count:'exact',head:true}).limit(1);
  if(isMissing(e6)){NEWOK=false;MISSING.add('follows')}
  const{error:e7}=await sb.from('wallet_txns').select('kind',{count:'exact',head:true}).limit(1);
  if(isMissing(e7)){NEWOK=false;MISSING.add('wallet_txns (monedero)')}
  /* Extras de esta versión: me gusta de perfil y mascotas. Si faltan, la app
     sigue funcionando; solo se desactivan esas dos secciones. */
  const{error:e8}=await sb.from('profile_likes').select('profile_id',{head:true}).limit(1);
  if(isMissing(e8)){MISSING.add('profile_likes (me gusta de perfil)')}
  const{error:e9}=await sb.from('pets').select('owner',{head:true}).limit(1);
  if(isMissing(e9)){MISSING.add('pets (mascotas)')}
  const{error:e10}=await sb.from('profiles').select('keys',{head:true}).limit(1);
  if(isMissing(e10)){MISSING.add('profiles.keys (llaves de la wallet)')}
  const{error:e11}=await sb.from('profiles').select('playlist',{head:true}).limit(1);
  if(isMissing(e11)){MISSING.add('profiles.playlist (música del perfil)')}
  /* Las funciones RPC que la app llama. Una que falte devolvía PGRST202
     (404) y el botón fallaba sin decir nada: comprar funcionaba pero
     equipar nunca. Ahora se listan al arrancar.

     SONDEO HONESTO: PostgREST devuelve el MISMO PGRST202 tanto si la función
     no existe como si existe pero no encaja con los argumentos enviados.
     Antes se sondaba con {__sonda__:1}, así que TODAS salían como «no
     existen» aunque estuvieran: la barra roja mentía. Ahora cada llamada usa
     los nombres reales de los parámetros y valores que hacen fallar la
     función ANTES de que escriba nada (un uuid que no existe, un código
     inválido, una sala en la que no se es moderador). Si la función está,
     protesta por el motivo ese; si no está, sale PGRST202. */
  const NUL=()=>'00000000-0000-0000-0000-0000000000ff';   /* uuid que no existe */
  const RPCS=[
    ['purge_stories','historias caducadas',{}],
    ['join_room_by_code','unirse con código',{code:'__no_existe__'}],
    ['advance_turn','turnos de sala',{rid:NUL()}],
    ['set_room_mod','nombrar moderador',{rid:NUL(),uid:NUL(),p_on:false}],
    ['room_mute','silenciar',{rid:NUL(),uid:NUL(),minutos:1}],
    ['room_unmute','quitar silencio',{rid:NUL(),uid:NUL()}],
    ['room_kick','expulsar',{rid:NUL(),uid:NUL()}],
    ['accept_join_request','resolver solicitud',{rid:NUL(),accept:false}],
    ['buy_item','comprar en la tienda',{p_item:NUL()}],
    ['publish_shop_item','publicar en la tienda',{p_kind:'__sonda__',p_name:'__sonda__',p_data:{},p_price:0,p_stock:1}],
    ['equip_item','equipar en la tienda',{p_item:NUL(),p_on:false}],
    ['like_profile','me gusta de perfil',{p_target:NUL()}],
    ['unlike_profile','quitar me gusta de perfil',{p_target:NUL()}],
    ['buy_coins','comprar monedas T',{p_pack:0}],
  ];
  NOFN=new Set();
  for(const [fn,que,args] of RPCS){
    /* supabase-js normalmente RESUELVE {data,error}; no rechaza la promesa
       por un 404. Hay que mirar las dos vías o la sonda no vería la función
       ausente y la barra de aviso se quedaría muda. */
    const r=await sb.rpc(fn,args).then(r=>({error:r&&r.error?r.error:null}),e=>({error:e}));
    if(isNoFn(r.error)){NOFN.add(fn);MISSING.add('función '+fn+' ('+que+')')}
  }
  /* save_key y repair_account NO se sondan: escriben, y save_key borraría la
     llave de cifrado del usuario. El código que las usa ya sabe reaccionar
     si no están (repairAccount() cae a save_profile+save_key). */
  await detectarRLS();
  if(NEWOK){await sb.rpc('purge_stories').then(()=>{},()=>{})}
  else schemaBar();
  if(NOFN.size)schemaBar();
  if([...MISSING].some(x=>/profile_likes|pets/.test(x)))schemaBar();
}
/* ---------- El único fallo que NO da error ----------
   Si faltan las políticas de RLS, todas las lecturas devuelven 0 filas y
   ninguna consulta protesta: la app parece una base de datos vacía, y sin
   decir nada. Por eso, cuando la política de lectura no existe pero la de
   escritura sí, todo parece bien menos los datos.

   Cómo se detecta sin tocar nada: save_profile es SECURITY DEFINER, así que
   escribe aunque falten las políticas. Se le pide que guarde la fila del
   propio usuario con p_name y p_pub a null (el servidor hace coalesce y no
   cambia ni el nombre ni la llave); si la escribe y a continuación no se ve,
   el problema es de LECTURA, no de escritura. */
async function detectarRLS(){
  if(!me||!me.uid)return;
  const r=await sb.rpc('save_profile',{p_uid:me.uid,p_name:null,p_pub:null})
    .then(x=>x,()=>({error:{}}));
  if(r.error)return;                       /* si falla, no es cosa de políticas */
  if(await perfilExiste(me.id))return;    /* se ve: todo bien */
  NEWOK=false;
  MISSING.add('políticas RLS de profiles: la fila se escribe pero no se lee');
  schemaBar();
  toast('La base de datos escribe pero no deja leer: faltan las políticas RLS. '
       +'Ejecuta '+SQL_FIX+'.','err',15000);
}
/* Columnas de profiles según lo que exista de verdad */
const PROFSEL=()=>{
  /* El UID no se pide para las vistas públicas: no hace falta para pintar el
     perfil y así tampoco viaja en las listas de personas. El dueño lo sigue
     teniendo en `me.uid` desde su propia cuenta. */
  const base='id,name,avatar,accent,pubkey,links,bg';
  const extra=[];
  if(COLS.profiles.has('bio'))extra.push('bio');
  if(COLS.profiles.has('xp'))extra.push('xp','coins');
  if(COLS.profiles.has('age'))extra.push('age','gender');
  if(COLS.profiles.has('is_private'))extra.push('is_private');
  if(COLS.profiles.has('frame_id'))extra.push('frame_id','bubble_id');
  if(COLS.profiles.has('last_seen'))extra.push('last_seen');
  if(COLS.profiles.has('playlist'))extra.push('playlist');
  if(COLS.profiles.has('profile_code'))extra.push('profile_code');
  return base+(extra.length?','+extra.join(','):'');
};
/* Selección de posts: las reacciones y el "pin" son opcionales */
/* Selección de posts. Si la tabla existe pero PostgREST aún no tiene la
   relación en su caché ("Could not find a relationship between 'posts' and
   'reactions'"), loadFeed reintenta sola con la lista corta. */
const SEL_LONG='*,likes(user_id),comments(count),poll_votes(user_id,opt),reactions(user_id,emoji)';
const SEL_SHORT='*,likes(user_id),comments(count),poll_votes(user_id,opt)';
const POSTSEL=()=>NEWOK?SEL_LONG:SEL_SHORT;
const embedBroken=e=>!!e&&/Could not find a relationship|Could not find the table|PGRST/i.test(e.message||'');
/* Tablas que sabemos que no existen (no repetimos el aviso cada 4 s) */
const NOTHERE=new Set();
function tabulaFalta(err){
  if(!isMissing(err))return false;
  const msg=err.message||'';
  /* intenta decir QUÉ falta, no solo «tabla» */
  let t=(msg.match(/table '([\w.]+)'/)||[])[1]
    || (msg.match(/column '([\w.]+)'/)||[])[1]?.replace(/\..+$/,'')
    || (msg.match(/relation "([\w.]+)"/)||[])[1]
    || null;
  if(t&&t.includes('.'))t=t.split('.').pop();
  if(!t){
    /* relación sin cachear: el mensaje no nombra la tabla */
    t=/relationship/i.test(msg)?'relaciones en la caché de PostgREST':'tablas o columnas';
  }
  if(NOTHERE.has(t))return true;
  NOTHERE.add(t);
  NEWOK=false;MISSING.add(t);
  schemaBar();
  return true;
}
/* Consulta tolerante: si la tabla no existe, devuelve vacío sin romper */
async function q(table,fn,fallback=null){
  try{ return await fn() }
  catch(e){ tabulaFalta(e); return fallback }
}
function schemaBar(){
  const falta=[...MISSING].join(', ');
  const txt=`<span style="flex:1">⚠ Base de datos desactualizada. Las funciones nuevas están desactivadas. Falta: ${falta}.
    <br><b>Solución:</b> pega <b>${SQL_FIX}</b> en Supabase → SQL Editor y pulsa Run. Arregla lo que falte y recarga la caché.
    ${/tabla|columna/i.test(falta)?'Si lo que falta son tablas o columnas, ejecuta además <b>'+SQL_FULL+'</b>.':''}
    ${/reactions/.test(falta)?'<br>Si ya lo habías ejecutado: <b>Supabase → Settings → API → «Reload schema»</b>.':''}
    ${/profile_likes|pets/.test(falta)?'<br>Para los me gusta de perfil y las mascotas ejecuta <b>sql/02-perfil-likes-mascotas.sql</b>.':''}</span>
    <button onclick="cerrarSchemaBar()">Cerrar</button>`;
  if(SBAR){SBAR.innerHTML=txt;return}   /* solo una barra, aunque falten varias cosas */
  const b=document.createElement('div');
  b.id='schemabar';
  b.style.cssText='position:fixed;left:0;right:0;top:0;z-index:400;background:#7f1d1d;color:#ffe4e6;padding:10px 16px;font:600 13px Rubik,sans-serif;display:flex;gap:10px;align-items:center';
  b.innerHTML=txt;
  document.body.appendChild(b);SBAR=b;
  toast('Falta actualizar la base de datos: ejecuta 00-instalar-todo.sql.','err',15000);
}
function cerrarSchemaBar(){
  SBAR&&SBAR.remove&&SBAR.remove();
  SBAR=null;
}

/* ==========================================================================
   4) Navegación
   ========================================================================== */
const NAV=[
  ['feed','fa-house','Inicio','go(\'feed\')',1],
  ['explore','fa-compass','Explorar','go(\'explore\')',0],
  ['reward','fa-trophy','Reward','rewardDlg()',1],
  ['wallet','fa-wallet','Wallet','walletDlg()',0],
  ['create','fa-plus','Crear','openCreateSheet()',1],
  ['dms','fa-comments','Chats','go(\'dms\')',1],
  ['chars','fa-store','Tienda','go(\'chars\')',1],
  ['rooms','fa-door-open','Salas','go(\'rooms\')',0],
  ['comms','fa-people-group','Comunidades','go(\'comms\')',0],
  ['notifs','fa-bell','Avisos','go(\'notifs\')',0],
  ['me','fa-user','Perfil','go(\'me\')',0]
];
const SIDE={dms:1};
const M_TITLES={feed:'Inicio',explore:'Explorar',rooms:'Salas',dms:'Chats',comms:'Comunidades',
  comm:'Comunidad',chars:'Tienda',notifs:'Avisos',me:'Mi perfil',prof:'Perfil',post:'Publicación'};
function setMobileTitle(v){
  const t=document.getElementById('mtitle');
  if(t)t.textContent=M_TITLES[v]||'Inicio';
  const p=document.getElementById('profiletab');
  if(p)p.classList.toggle('hide',v==='me');
}
$('rail').innerHTML+=NAV.map(n=>`<button data-v="${n[0]}" class="${n[4]?'m-primary':''}" title="${n[2]}" onclick="${n[3]}"><span class="mico"><i class="fa-solid ${n[1]}"></i>${n[0]=='notifs'?'<i id="bd" class="bd hide"></i>':''}</span><span class="mlabel">${n[2]}</span></button>`).join('');

/* ---------- Hojas de acciones del menú nuevo ---------- */
function closeSheet(){
  document.getElementById('actionsheet')?.remove();
}
function openSheet(title,items,sub){
  closeSheet();
  const d=document.createElement('div');
  d.id='actionsheet';d.className='sheet';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');
  d.innerHTML=`<div class="sheetbox">
    <div class="sheethead"><b>${esc(title)}</b>
      <button onclick="closeSheet()" title="Cerrar" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button></div>
    ${sub?`<p class="mu" style="margin:6px 0 0">${sub}</p>`:''}
    <div class="sheetgrid">${items.map(it=>`<button class="sheetopt" onclick="${it[3]}">
      <span class="sico"><i class="fa-solid ${it[1]}"></i></span><span>${esc(it[2])}</span></button>`).join('')}</div>
  </div>`;
  d.onclick=e=>{if(e.target===d)closeSheet()};
  document.body.appendChild(d);
}
function openCreateSheet(){
  stopProfileMusic();
  openSheet('Crear',[], 'Elige qué quieres crear o abrir.');
  // El título y los elementos se pintan aparte para no escapar comillas dentro de los onclick.
  const box=document.querySelector('#actionsheet .sheetgrid');
  if(!box)return;
  const items=[
    ['fa-pen','Publicación',"closeSheet();go('feed').then(()=>openComposer('post'))"],
    ['fa-clapperboard','Vídeo / Reel',"closeSheet();go('feed').then(()=>openComposer('reel'))"],
    ['fa-door-open','Sala',"closeSheet();go('rooms')"],
    ['fa-people-group','Comunidad',"closeSheet();go('comms')"],
    ['fa-masks-theater','Personaje',"closeSheet();setShopTab('personajes');go('chars')"],
    ['fa-comments','Chat',"closeSheet();go('dms')"]
  ];
  box.innerHTML=items.map(it=>`<button class="sheetopt" onclick="${it[2]}">
    <span class="sico"><i class="fa-solid ${it[0]}"></i></span><span>${esc(it[1])}</span></button>`).join('');
}
function openMoreSheet(){
  openSheet('Más secciones',[], 'Todas las secciones de The Black List.');
  const box=document.querySelector('#actionsheet .sheetgrid');
  if(!box)return;
  const items=[
    ['fa-compass','Explorar',"closeSheet();go('explore')"],
    ['fa-door-open','Salas',"closeSheet();go('rooms')"],
    ['fa-people-group','Comunidades',"closeSheet();go('comms')"],
    ['fa-bell','Avisos',"closeSheet();go('notifs')"],
    ['fa-store','Tienda',"closeSheet();go('chars')"],
    ['fa-user','Mi perfil',"closeSheet();go('me')"]
  ];
  box.innerHTML=items.map(it=>`<button class="sheetopt" onclick="${it[2]}">
    <span class="sico"><i class="fa-solid ${it[0]}"></i></span><span>${esc(it[1])}</span></button>`).join('');
}

async function go(v){
  stopProfileMusic();
  closeSheet();closeSetPanels();leaveVoice();view=v;cur=null;PEND=[];
  /* Inicio y la lista de comunidades son el ámbito general: al entrar en
     ellos se abandona la comunidad que estuviera abierta. */
  if(v==='feed'||v==='comms'){CC='';FC='';}
  setMobileTitle(v);
  /* Los mini chats flotantes se cierran al cambiar de sección */
  Object.keys(MINIS).forEach(closeMini);
  /* Y se olvida el tema del chat anterior: si no, el fondo se filtraría
     a las demás vistas porque se pinta sobre #main. */
  try{const m=$('main');if(m&&m.nodeType){m.removeAttribute('data-theme');m.style.cssText=''}}catch{}
  const railV=v==='comm'?'comms':v;
  document.querySelectorAll('#rail button').forEach(b=>b.classList.toggle('on',b.dataset.v==railV));
  $('app').classList.toggle('ns',!SIDE[v]);
  /* En móvil #main solo se ve con body.open: las vistas de lista (feed, salas…)
     deben ponerla, y las de panel lateral (mensajes) quitarla. */
  document.body.classList.toggle('open',!SIDE[v]);
  $('side').innerHTML='';$('main').innerHTML=SIDE[v]?empty('Elige una conversación para empezar.'):'';
  /* Red de seguridad: si una vista falla, se avisa en vez de dejar la pantalla en blanco. */
  try{ await (VIEWS[v]||VIEWS.feed)() }
  catch(e){
    console.error('Vista '+v,e);
    if(isMissing(e)){NEWOK=false;schemaBar()}
    toast('No se pudo cargar «'+v+'»: '+(e.message||e),'err',8000);
    if(!$('main').innerHTML.trim()) $('main').innerHTML=empty('Esta sección no se pudo cargar. Revisa la consola o ejecuta '+SQL_FIX+'.');
  }
  renderFabs();tintSoon();
}
/* Cualquier promesa rechazada suelta se muestra en vez de desaparecer */
let lastErr='';
window.addEventListener('unhandledrejection',ev=>{
  const m=ev.reason&&ev.reason.message||String(ev.reason||'');
  if(!m||m===lastErr)return; lastErr=m;
  console.error('promesa rechazada:',ev.reason);
  if(isMissing(ev.reason)){NEWOK=false;schemaBar();return}
  toast('Error: '+m,'err',7000);
});
window.addEventListener('error',ev=>{
  if(isMissing(ev.error)){NEWOK=false;schemaBar()}
});
async function bell(){
  if(!me)return;
  const{count}=await sb.from('notifications').select('id',{count:'exact',head:true}).eq('user_id',me.id).eq('read',false);
  ['bd','mbd'].forEach(id=>{
    const b=$(id);if(!b)return;
    b.textContent=count||'';b.classList.toggle('hide',!count);
  });
}
/* Respaldo por si Realtime está apagado */
setInterval(()=>{
  if(!me||OFFLINE||document.hidden)return;
  if(view=='rooms'&&cur&&cur.kind!='voz')loadRoom();
  if(view=='dms'&&cur)loadDM();
  bell();
},30000);
/* Latido de presencia: cada 45 s, solo con la pestaña visible. */
setInterval(()=>{
  if(!me||OFFLINE||document.hidden)return;
  sb.from('profiles').update({last_seen:new Date().toISOString()}).eq('id',me.id).then(()=>{},()=>{});
},45000);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&me&&!OFFLINE){
    sb.from('profiles').update({last_seen:new Date().toISOString()}).eq('id',me.id).then(()=>{},()=>{});
    bell();if(view=='rooms'&&cur)loadRoom();
  }
});

/* ---------- Realtime ---------- */
let debs={},RT_CH=null;
function rtFire(k,fn){clearTimeout(debs[k]);debs[k]=setTimeout(fn,350)}
function realtime(){
  if(!NEWOK||OFFLINE)return;
  try{
    if(RT_CH){sb.removeChannel(RT_CH);RT_CH=null}
    RT_CH=sb.channel('tbl-rt-'+Date.now())
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'messages'},p=>{
        rtFire('rm',()=>{if(view=='rooms'&&cur&&cur.id===p.new.room_id)loadRoom()})})
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'dms'},p=>{
        rtFire('rdm',()=>{
          const a=p.new.sender_id,b=p.new.receiver_id;
          if(cur&&cur.__dm&&(a===cur.id||b===cur.id))loadDM();
          const mini=a===me.id?b:a;
          if(MINIS[mini])loadMini(mini);
        });
      })
      .on('postgres_changes',{event:'*',schema:'public',table:'posts'},p=>{
        rtFire('rp',()=>applyPostRealtime(p))})
      .on('postgres_changes',{event:'*',schema:'public',table:'comments'},p=>{
        const row=p.eventType==='DELETE'?p.old:p.new;
        const pid=row&&row.post_id;
        if(pid&&$('c'+pid)&&$('c'+pid).dataset.o)rtFire('rc'+pid,()=>drawC(pid));
      })
      .on('postgres_changes',{event:'*',schema:'public',table:'stories'},p=>{
        rtFire('rst',()=>applyStoryRealtime(p));
      })
      /* El latido de presencia actualiza last_seen cada 45 s. Solo hay que
         repintar cuando cambian de verdad el avatar, el marco o la burbuja. */
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'profiles'},p=>{
        rtFire('rprof',async()=>{
          const row=fx(p.new||{});
          if(!row.id)return;
          const prev=(me&&row.id===me.id)?me:P[row.id];
          if(!prev)return;
          const frameChanged=prev.frame_id!==row.frame_id||prev.avatar!==row.avatar;
          const bubbleChanged=prev.bubble_id!==row.bubble_id;
          await loadShopCache([row.frame_id,row.bubble_id]);
          if(me&&row.id===me.id){Object.assign(me,row);P[me.id]=me;cacheProfile()}
          else{Object.assign(P[row.id],row);scheduleCacheProfiles()}
          if(cur&&cur.id===row.id)Object.assign(cur,row);
          if(frameChanged)refreshProfileAvatar(row.id);
          if(bubbleChanged){
            refreshOpenChats();
            if(view==='dms'&&$('ul'))listUsers();
          }
        });
      })
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications'},()=>bell())
      .subscribe(status=>{if(status==='CHANNEL_ERROR')console.warn('Realtime sin conexión o publicación pendiente')});
  }catch(e){console.warn('Realtime no disponible',e)}
}

/* ==========================================================================
   5) Mensajes (común)
   ========================================================================== */
function drawMsgs(L){
  const el=$('ms');if(!el)return;
  const h=L.map(x=>{
      const bs=bubbleStyle(x.who);
      return x.kind=='me'?`<div class="act">${esc(x.name)} ${esc(x.t)}</div>`:
    x.kind=='sys'?`<div class="act">${esc(x.t)}</div>`:
    `<div class="m ${x.mine?'me':''}">${av(x.who,34)}<div><div class="mu">${nameEl(x.who)} ${esc(x.time)}</div><div class="b ${x.kind=='roll'?'roll':''}" ${bs?`data-b="1" style="${bs}"`:''}>${x.t?esc(x.t):''}${attHtml(x.att)}</div></div></div>`}).join('')||empty('Aún no hay mensajes.');
  if(el.dataset.h===h)return;
  const dn=el.scrollHeight-el.scrollTop-el.clientHeight<120;
  el.dataset.h=h;el.innerHTML=h;
  if(dn||!el.dataset.i){el.scrollTop=el.scrollHeight;el.dataset.i=1}
}
const back=`<button class="back" onclick="document.body.classList.remove('open')"><i class="fa-solid fa-chevron-left"></i></button>`;
const VIEWS={};

/* ==========================================================================
   6) Historias 24 h
   ========================================================================== */
async function loadMyRoles(){
  if(!NEWOK)return;
  const{data,error}=await sb.from('community_profiles').select('community_id,role');
  if(error)return;
  (data||[]).forEach(x=>CP[x.community_id+me.id]=x.role);
}
/* ---------- Usuarios registrados: carrusel + lista completa paginada ----------
   El carrusel muestra como máximo 50 usuarios RECIENTES y nunca ensancha
   main. La lista completa abre en una ventana aparte y pagina de 50 en 50:
   los usuarios más antiguos solo aparecen al pasar de página cuando hay más
   de 50. Si hay 50 o menos, no existe una segunda página. */
const PEOPLE_PAGE_SIZE=50;
let PEOPLE_ALL=[],PEOPLE_ALL_AT=0,PEOPLE_LOADING=null,PEOPLE_PAGE=0;
async function fetchPeopleAll(force=false){
  if(!force&&PEOPLE_ALL.length&&Date.now()-PEOPLE_ALL_AT<60000)return PEOPLE_ALL;
  if(PEOPLE_LOADING)return PEOPLE_LOADING;
  PEOPLE_LOADING=(async()=>{
    if(OFFLINE){
      const rows=Object.values(P).filter(p=>p&&p.id&&notBlocked(p.id));
      PEOPLE_ALL=rows;PEOPLE_ALL_AT=Date.now();return rows;
    }
    let data=null,error=null;
    /* Primer intento: orden real de registro (más nuevos primero). */
    ({data,error}=await sb.from('profiles').select(PROFSEL()+',created_at')
      .order('created_at',{ascending:false}).limit(300));
    if(error){
      /* Si `created_at` no existe en esta instalación, no se rompe el feed. */
      ({data,error}=await sb.from('profiles').select(PROFSEL())
        .order('name',{ascending:true}).limit(300));
    }
    if(error){
      if(isNetError(error))OFFLINE=true;
      PEOPLE_ALL=[];PEOPLE_ALL_AT=Date.now();return [];
    }
    const rows=(data||[]).filter(p=>p&&p.id&&notBlocked(p.id));
    rows.forEach(p=>{if(P[p.id])Object.assign(P[p.id],p);else P[p.id]=fx(p)});
    PEOPLE_ALL=rows;PEOPLE_ALL_AT=Date.now();
    scheduleCacheProfiles();
    return rows;
  })().finally(()=>{PEOPLE_LOADING=null});
  return PEOPLE_LOADING;
}
function personTile(p){
  const act=activeNow(p);
  return `<div class="person" role="button" tabindex="0" onclick="openProfile('${p.id}')"
    onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openProfile('${p.id}')}" title="${esc(p.name||'Perfil')}">
    <span class="pring">${av(p,54)}${act?'<span class="pdot" title="En línea"></span>':''}</span>
    <b>${esc(p.name||'?')}</b>
    <small>${act?'En línea':'Miembro'}</small></div>`;
}
async function loadPeopleRail(){
  const box=$('peoplebar');if(!box)return;
  const rows=await fetchPeopleAll();
  if(!rows.length){box.innerHTML='';return}
  /* Solo los 50 más recientes en el carril. El resto vive en la lista completa. */
  const recent=rows.slice(0,PEOPLE_PAGE_SIZE);
  if(!recent.length){box.innerHTML='';return}
  const total=rows.length;
  box.innerHTML=`<div class="peoplehead">
      <b><i class="fa-solid fa-users" style="color:var(--ac)"></i> Usuarios registrados</b>
      <span class="pcount">${total>PEOPLE_PAGE_SIZE?'50 de '+total:' '+total} · desliza</span>
    </div>
    <div class="peoplerail">${recent.map(p=>personTile(p)).join('')}
      <div class="person pmore" role="button" tabindex="0" onclick="openPeopleList(0)"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openPeopleList(0)}"
        title="Seguir en la lista completa">
        <span class="pmico"><i class="fa-solid fa-arrow-right"></i></span>
        <b>Seguir en la lista completa</b>
        <small>${total>PEOPLE_PAGE_SIZE?'Hay '+(total-PEOPLE_PAGE_SIZE)+' más':'Ver todos'}</small>
      </div>
    </div>`;
}
function openPeopleList(page=0){
  const render=()=>{
    const total=PEOPLE_ALL.length;
    const pages=Math.max(1,Math.ceil(total/PEOPLE_PAGE_SIZE));
    page=Math.max(0,Math.min(pages-1,page));
    PEOPLE_PAGE=page;
    const from=page*PEOPLE_PAGE_SIZE;
    const slice=PEOPLE_ALL.slice(from,from+PEOPLE_PAGE_SIZE);
    let d=document.getElementById('peopleDlg');
    if(!d){
      d=document.createElement('div');d.id='peopleDlg';d.className='preview';
      d.onclick=e=>{if(e.target===d)closePeopleDlg()};
      document.body.appendChild(d);
    }
    d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:12px">
      <div class="row"><b class="grow" style="font-family:Syne;font-size:19px">
        <i class="fa-solid fa-users" style="color:var(--ac)"></i> Lista completa</b>
        <span class="tag">${total} usuario${total===1?'':'s'}</span>
        <button class="sm" type="button" onclick="closePeopleDlg()" title="Cerrar"><i class="fa-solid fa-xmark"></i></button></div>
      <p class="mu" style="margin:0">Los más recientes aparecen primero. Se muestran de 50 en 50.</p>
      <div class="plist">${slice.map(p=>{
        const act=activeNow(p);
        return `<div class="pcard" role="button" tabindex="0" onclick="closePeopleDlg();openProfile('${p.id}')"
          onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();closePeopleDlg();openProfile('${p.id}')}">
          <span class="pring" style="padding:2px">${av(p,38)}</span>
          <div class="grow"><b>${esc(p.name||'?')}</b>
            <small>${act?'En línea':'Miembro'}</small></div>
        </div>`}).join('')||'<div class="empty">No hay usuarios.</div>'}</div>
      ${pages>1?`<div class="ppager">
        <button class="sm" type="button" onclick="peoplePage(${page-1})" ${page<=0?'disabled':''}>
          <i class="fa-solid fa-chevron-left"></i> Anterior</button>
        <span class="pinfo">Página ${page+1} de ${pages} · usuarios ${from+1}–${Math.min(total,from+PEOPLE_PAGE_SIZE)} de ${total}</span>
        <button class="sm" type="button" onclick="peoplePage(${page+1})" ${page>=pages-1?'disabled':''}>
          Siguiente <i class="fa-solid fa-chevron-right"></i></button>
      </div>`:`<div class="ppager"><span class="pinfo">Mostrando los ${total} usuarios registrados · no hay más páginas.</span></div>`}
    </div></div>`;
  };
  if(!PEOPLE_ALL.length)fetchPeopleAll().then(()=>{if(PEOPLE_ALL.length)render();else toast('No se pudieron cargar los usuarios.','warn')});
  else render();
}
function peoplePage(p){openPeopleList(p)}
function closePeopleDlg(){document.getElementById('peopleDlg')?.remove()}
/* Historias: imagen, GIF o vídeo. El campo `image` guarda la URL y el tipo
   se deduce de la extensión, así no hace falta cambiar la tabla. */
const storyIsVideo=u=>/\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(String(u||''));
const storyDuration=s=>storyIsVideo(s&&s.image)?60000:5000;
function storyMedia(s,cls=''){
  const u=esc(s&&s.image||'');
  return storyIsVideo(s&&s.image)
    ? `<video class="${cls}" src="${u}" controls playsinline autoplay preload="metadata"></video>`
    : `<img class="${cls}" src="${u}" alt="">`;
}
async function loadStories(){
  if(OFFLINE){
    const cached=cacheRead(me&&me.id,'stories',[])||[];
    ST=cached.filter(s=>s&&s.author_id&&s.expires_at&&new Date(s.expires_at)>new Date()&&notBlocked(s.author_id));
    return;
  }
  ST=[];if(!NEWOK)return;
  const{data,error}=await sb.from('stories').select('*')
    .gt('expires_at',new Date().toISOString())
    .order('created_at',{ascending:false}).limit(300);
  if(error){if(isNetError(error))OFFLINE=true;return}
  ST=(data||[]).filter(s=>s&&s.author_id&&notBlocked(s.author_id));
  await prof([...new Set(ST.map(s=>s.author_id))]);
  cacheStories();
}
function storiesBar(){
  const by={};ST.forEach(s=>(by[s.author_id]=by[s.author_id]||[]).push(s));
  const mine=by[me.id];
  return `<div class="storieshead"><i class="fa-solid fa-circle-play"></i><b>Historias</b>
      <button class="sm" style="margin-left:auto" onclick="openStoriesTray()">
        <i class="fa-solid fa-expand"></i> Ver todas</button></div>
  <div class="stories">
    <div class="sty ${mine?'':'none'}" onclick="${mine?`openStory('${me.id}')`:'mkStory()'}">
      <div class="ring" style="position:relative">${av(me,58)}${!mine?'<i class="fa-solid fa-plus plus"></i>':''}</div>
      <span>${mine?'Tu historia':'Crear'}</span></div>
    ${Object.entries(by).filter(([k])=>k!==me.id).map(([k,v])=>{
      const unseen=v.some(s=>!STVIEW.has(s.id));
      return `<div class="sty ${unseen?'':'seen'}" onclick="openStory('${k}')">
        <div class="ring">${av(P[k]||{id:k},58)}</div>
        <span>${esc((P[k]||{name:'Alguien'}).name)}</span></div>`}).join('')}
  </div>`;
}
function refreshStoriesUI(){
  if(view==='feed'){const w=$('wstories');if(w)w.innerHTML=storiesBar()}
  renderFabs();
}
/* ---------- Stories: friends, views and the tray ---------- */
/* The people you follow. The tray only shows their stories. */
async function loadFriends(){
  FRIENDS_OK=false;
  if(!NEWOK||OFFLINE)return;
  const{data,error}=await sb.from('follows').select('following_id').eq('follower_id',me.id);
  if(error)return;
  FRIDS=new Set((data||[]).map(x=>x.following_id));
  FRIENDS_OK=true;
}
/* Which stories you have already seen: the ring turns gray. */
async function loadStoryViews(){
  STVIEW=new Set();
  if(!NEWOK||OFFLINE)return;
  const{data,error}=await sb.from('story_views').select('story_id');
  if(error)return;
  STVIEW=new Set((data||[]).map(x=>x.story_id));
}
function markStorySeen(id){
  if(!id||STVIEW.has(id))return;
  STVIEW.add(id);
  if(NEWOK&&!OFFLINE)sb.rpc('mark_story_viewed',{p_story:id}).then(()=>{},()=>{});
}
/* How many unseen stories your friends have: it is the badge on the button. */
function unseenStoriesCount(){
  const by={};ST.forEach(s=>(by[s.author_id]=by[s.author_id]||[]).push(s));
  let n=0;
  Object.keys(by).forEach(k=>{
    if(k===me.id)return;
    if(FRIENDS_OK&&!FRIDS.has(k))return;
    if(!notBlocked(k))return;
    if(by[k].some(s=>!STVIEW.has(s.id)))n++;
  });
  return n;
}
/* The tray: your story, "Create story" and your friends' stories.
   It opens from the floating button and behaves like Instagram. */
async function openStoriesTray(){
  closeSetPanels();
  document.getElementById('storytray')?.remove();
  const d=document.createElement('div');
  d.id='storytray';d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:12px">
    <div class="storytrayhead">
      <b class="grow"><i class="fa-solid fa-circle-play" style="color:var(--ac)"></i> Historias</b>
      <button class="p sm" onclick="closeStoriesTray();mkStory()">
        <i class="fa-solid fa-plus"></i> Crear historia</button>
      <button class="sm" onclick="closeStoriesTray()" title="Cerrar"><i class="fa-solid fa-xmark"></i></button></div>
    <p class="mu" style="margin:0;font-size:12px" id="stTrayNote">Duran 24 horas. Puedes guardarlas y ordenarlas en
      carpetas desde tu perfil.</p>
    <div id="stTray" class="storytraygrid"><div class="mu">Cargando…</div></div>
  </div></div>`;
  d.onclick=e=>{if(e.target===d)closeStoriesTray()};
  document.body.appendChild(d);
  await loadStories();
  await Promise.all([loadFriends(),loadStoryViews()]);
  drawStoriesTray();
}
function closeStoriesTray(){document.getElementById('storytray')?.remove()}
function drawStoriesTray(){
  const box=$('stTray');if(!box)return;
  const by={};ST.forEach(s=>(by[s.author_id]=by[s.author_id]||[]).push(s));
  const mine=by[me.id]||[];
  /* Only friends: if the list of friends could not be read (SQL missing),
     everyone is shown so the tray is never empty for no reason. */
  const others=Object.keys(by).filter(k=>k!==me.id&&notBlocked(k))
    .filter(k=>!FRIENDS_OK||FRIDS.has(k))
    .sort((a,b)=>new Date(by[b][0].created_at)-new Date(by[a][0].created_at));
  const note=$('stTrayNote');
  if(note)note.textContent=FRIENDS_OK
    ? 'Solo se ven las historias de tus amigos. Duran 24 horas: puedes guardarlas y ordenarlas en carpetas desde tu perfil.'
    : 'No se pudo leer tu lista de amigos: se muestran todas las historias. Duran 24 horas.';
  const mineHtml=`<div class="sty ${mine.length&&!mine.some(s=>!STVIEW.has(s.id))?'':'seen'} ${mine.length?'':'none'}"
      onclick="${mine.length?`closeStoriesTray();openStory('${me.id}')`:`closeStoriesTray();mkStory()`}">
      <div class="ring">${av(me,64)}${mine.length?'':'<i class="fa-solid fa-plus plus"></i>'}</div>
      <span>${mine.length?'Tu historia':'Crear'}</span></div>`;
  const friends=others.map(k=>{
    const unseen=by[k].some(s=>!STVIEW.has(s.id));
    return `<div class="sty ${unseen?'':'seen'}" onclick="closeStoriesTray();openStory('${k}')">
      <div class="ring">${av(P[k]||{id:k},64)}</div>
      <span>${esc((P[k]||{name:'Alguien'}).name)}</span></div>`;
  }).join('');
  box.innerHTML=mineHtml+friends+
    (!others.length?`<div class="storytrayempty" style="flex:1 1 100%">
      ${FRIENDS_OK?'Ninguno de tus amigos tiene una historia ahora mismo.'
                 :'No hay historias activas ahora mismo.'}</div>`:'');
  renderFabs();
}
/* Save a story in your own archive (it survives the 24 hours). */
async function saveStory(id){
  if(!id)return;
  if(!NEWOK)return toast('El archivo de historias necesita <b>'+SQL_FIX+'</b>.','warn',9000);
  const r=await sb.rpc('save_story',{p_story:id}).then(x=>x,e=>({error:e}));
  if(r.error){
    if(isNoFn(r.error))return toast('Guardar historias necesita <b>sql/15-historias-archivo-carpetas.sql</b>.','warn',9000);
    return toast(explain(r.error),'err');
  }
  toast('Historia guardada en tu perfil.','ok');
  refreshStorySaveBtn(id,true);
}
async function unsaveStory(id){
  if(!id)return;
  const r=await sb.rpc('unsave_story',{p_story:id}).then(x=>x,e=>({error:e}));
  if(r.error)return toast(explain(r.error),'err');
  toast('Historia quitada de tu archivo.','ok');
  refreshStorySaveBtn(id,false);
}
/* The «Save» button inside the viewer shows the real state. */
async function refreshStorySaveBtn(id,on){
  const b=document.getElementById('storySaveBtn');
  if(!b)return;
  if(!NEWOK){b.classList.remove('on');b.innerHTML='<i class="fa-solid fa-bookmark"></i> Guardar';return}
  if(on){b.classList.add('on');b.innerHTML='<i class="fa-solid fa-bookmark"></i> Guardada';return}
  const{data,error}=await sb.from('story_archive').select('id')
    .eq('user_id',me.id).eq('story_id',id).maybeSingle();
  const saved=!error&&!!data;
  b.classList.toggle('on',saved);
  b.innerHTML=saved?'<i class="fa-solid fa-bookmark"></i> Guardada':'<i class="fa-solid fa-bookmark"></i> Guardar';
}
/* Realtime sin GET: el payload ya trae la historia. Solo se pide el perfil
   si aún no está en caché. */
async function applyStoryRealtime(ev){
  const s=ev.eventType==='DELETE'?ev.old:ev.new;
  if(!s||!s.id)return;
  if(ev.eventType==='DELETE'){
    ST=ST.filter(x=>x.id!==s.id);
    if(SV.list.some(x=>x.id===s.id)){
      SV.list=SV.list.filter(x=>x.id!==s.id);
      if(!SV.list.length)closeStory();
      else if($('sview')&&!$('sview').classList.contains('hide'))renderStory();
    }
    cacheStories();
    return refreshStoriesUI();
  }
  if(!s.author_id||!notBlocked(s.author_id))return;
  if(s.expires_at&&new Date(s.expires_at)<new Date())return;
  if(!P[s.author_id])await prof([s.author_id]);
  ST=ST.filter(x=>x.id!==s.id);
  ST.unshift(s);
  ST.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
  cacheStories();
  refreshStoriesUI();
}
async function storyUpload(file){
  if(!file)return null;
  if(String(file.type||'').startsWith('image/')){
    /* Los GIF/PNG/WebP se suben tal cual para no perder la animación. */
    if(decoExt(file))return upDeco(file);
    return up(file);
  }
  try{return await upRaw(file)}catch(e){toast(e.message,'err',6000);return null}
}
function mkStory(){
  const i=document.createElement('input');
  i.type='file';i.accept='image/*,video/*';
  i.onchange=async()=>{
    const f=i.files&&i.files[0];if(!f)return;
    if(f.size>MAXFILE)return toast('La historia supera los 25 MB.','err',7000);
    toast('Subiendo historia…','ok',2500);
    const u=await storyUpload(f);if(!u)return;
    const{error}=await sb.from('stories').insert({author_id:me.id,image:u});
    if(error)return toast(isMissing(error)?'La tabla stories no existe: ejecuta '+SQL_FIX+'.':explain(error),'err',8000);
    toast('Historia publicada por 24 horas.','ok');
    await loadStories();
    if(view=='prof'&&PROF)openProfile(PROF);
    else if(view=='me')go('me');
    else go('feed');
  };
  i.click();
}
let SV={list:[],i:0,timer:null};
function openStory(uid){
  stopProfileMusic();
  SV.list=ST.filter(s=>s.author_id===uid).sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  SV.i=0;
  if(!SV.list.length)return toast('Esa persona no tiene historias activas.','warn');
  $('sview').classList.remove('hide');
  renderStory();
}
function renderStory(){
  const v=$('sview');if(!SV.list.length)return closeStory();
  const s=SV.list[SV.i],p=P[s.author_id]||{};
  const dur=storyDuration(s);
  v.innerHTML=`<div class="storyview">
    <div class="sbar">${SV.list.map((_,i)=>`<i class="${i<SV.i?'done':''}"><u style="${i===SV.i?`animation:sf ${dur}ms linear forwards`:''}"></u></i>`).join('')}</div>
    <div class="row"><button class="sm" onclick="closeStory()" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
      <div class="grow row" style="justify-content:center">${av(p,26)}<b>${esc(p.name||'Alguien')}</b></div>
      <span class="mu">${SV.i+1}/${SV.list.length}</span></div>
    <div>${storyMedia(s)}</div>
    ${s.caption?`<div class="storycap">${esc(s.caption)}</div>`:''}
    <div class="row" style="justify-content:center;margin-top:6px">
      <button class="sm" onclick="nextStory(-1)" ${SV.i===0?'disabled':''}><i class="fa-solid fa-chevron-left"></i> Anterior</button>
      <button class="sm storysave" id="storySaveBtn" onclick="toggleStorySave('${s.id}')" title="Guardar en tu perfil">
        <i class="fa-solid fa-bookmark"></i> Guardar</button>
      <button class="sm" onclick="nextStory(1)">Siguiente <i class="fa-solid fa-chevron-right"></i></button>
    </div>
  </div>`;
  refreshStorySaveBtn(s.id,false);
  /* Al verla, el anillo pasa a gris: ya la has visto. */
  markStorySeen(s.id);
  const vid=v.querySelector('video');
  if(vid){
    vid.onended=()=>nextStory(1);
    vid.onloadedmetadata=()=>{
      const ms=Math.max(3000,Math.min(60000,(vid.duration||60)*1000));
      const u=v.querySelectorAll('.sbar u')[SV.i];
      if(u)u.style.animationDuration=ms+'ms';
      startStoryTimer(ms);
    };
    vid.play().catch(()=>{});
  }
  startStoryTimer();
}
async function toggleStorySave(id){
  const b=document.getElementById('storySaveBtn');
  const on=b&&b.classList.contains('on');
  if(on)await unsaveStory(id);else await saveStory(id);
}
function startStoryTimer(ms){
  clearTimeout(SV.timer);
  const s=SV.list[SV.i];if(!s)return;
  SV.timer=setTimeout(()=>nextStory(1),ms||storyDuration(s));
}
function nextStory(d){
  SV.i+=d;
  if(SV.i<0)return closeStory();
  if(SV.i>=SV.list.length)return closeStory();
  renderStory();
}
function closeStory(){
  clearTimeout(SV.timer);SV.timer=null;
  $('sview').classList.add('hide');
  $('sview').innerHTML='';
  refreshStoriesUI();
}
/* Botón flotante: UNO SOLO (historias) y SOLO en Inicio.
   En el resto de vistas tapa contenido y estorba: las mascotas se gestionan
   desde el perfil y desde «Mi mochila». */
function renderFabs(){
  const dock=document.getElementById('fabdock');if(!dock)return;
  const on=!!me;
  const show=on&&view==='feed';
  dock.classList.toggle('hide',!show);
  /* Si una instalación antigua todavía tiene el botón de mascotas, se
     esconde siempre: en v4 no es un botón flotante. */
  const fp=document.getElementById('fabPet');
  if(fp)fp.classList.add('hide');
  if(!show)return;
  if(!dock.dataset.built){
    dock.innerHTML=`<button type="button" class="fab" id="fabStory" onclick="openStoriesTray()"
        title="Historias" aria-label="Historias"><i class="fa-solid fa-plus"></i>
        <span class="fabcount hide" id="fabStoryN"></span></button>`;
    dock.dataset.built='1';
  }
  const n=unseenStoriesCount();
  const b=$('fabStoryN');
  if(b){b.textContent=n>99?'99+':String(n||'');b.classList.toggle('hide',!n)}
}

/* ==========================================================================
   7) Inicio / feed
   ========================================================================== */
const TH=[['noir','Noir'],['rosa','Rosa pastel'],['papel','Papel'],['sangre','Sangre']];
const thOpts=s=>TH.map(t=>`<option value="${t[0]}" ${t[0]==s?'selected':''}>${t[1]}</option>`).join('');
let CM=null,FEED={off:0,buf:[],done:false};

/* ==========================================================================
   PERSONALIZACIÓN DEL INICIO
   Qué pestañas se ven, qué widgets, botones propios y separadores.
   Se guarda en user_layout y es estrictamente personal.
   ========================================================================== */
const DFL={
  tabs:{top:true,recent:true,reels:true,following:true},
  widgets:{rules:true,members:true,quick:true},
  buttons:[],          // [{id,label,icon,url}]
  seps:true,           // separadores entre widgets
  maxBtns:8
};
let LAY=JSON.parse(JSON.stringify(DFL));
async function loadLayout(){
  if(!NEWOK)return;
  const{data}=await sb.from('user_layout').select('*').eq('user_id',me.id).maybeSingle();
  if(data&&data.data)LAY={...JSON.parse(JSON.stringify(DFL)),...data.data,
    tabs:{...DFL.tabs,...(data.data.tabs||{})},
    widgets:{...DFL.widgets,...(data.data.widgets||{})}};
}
async function saveLayout(){
  if(!NEWOK)return toast('La personalización necesita 00-instalar-todo.sql.','warn');
  const{error}=await sb.from('user_layout').upsert({user_id:me.id,data:LAY},
    {onConflict:'user_id'});
  if(error)return toast(explain(error),'err');
}
/* Pide confirmación al ocultar, para no perder el acceso por error */
function toggleTab(k){
  const on=LAY.tabs[k];
  if(on&&Object.values(LAY.tabs).filter(Boolean).length<=1)
    return toast('Deja al menos una pestaña activa.','warn');
  if(on&&!confirm('¿Quitar la pestaña «'+TABS.find(t=>t[0]==k)[2]+'» del inicio?'))return;
  LAY.tabs[k]=!on;saveLayout();go('feed');
}
function toggleWidget(k,name){
  LAY.widgets[k]=!LAY.widgets[k];saveLayout();go('feed');
}
/* ---------- Widgets ---------- */
async function widgetHTML(){
  const out=[];
  const S=()=>LAY.seps?'<div class="sep"></div>':'';

  /* Botones rápidos */
  if(LAY.widgets.quick&&LAY.buttons.length){
    out.push(`<div class="widget"><div class="qbar">${LAY.buttons.map(b=>
      `<a class="qbtn" href="${esc(b.url||'#')}" target="_blank" rel="noopener noreferrer"
         onclick="${/^https?:/.test(b.url||'')?'':'return false'}">
        <i class="${/^fa-/.test(b.icon||'')?esc(b.icon):'fa-solid fa-link'}"></i>${esc(b.label)}</a>`).join('')}
      </div></div>`+S());
  }
  /* Reglamento de la comunidad actual */
  if(LAY.widgets.rules&&CM){
    const rules=(CM.rules||'').split('\n').filter(Boolean);
    out.push(`<div class="widget"><div class="card">
      <div class="wt"><b><i class="fa-solid fa-scroll" style="color:var(--ac)"></i> Reglamento</b>
        <button class="sm" onclick="rulesDlg('${CM.id}')">Ver todo</button></div>
      ${rules.length?`<ol class="rulesol">${rules.slice(0,3).map(r=>`<li>${esc(r)}</li>`).join('')}</ol>`
        :'<p class="mu">Esta comunidad aún no tiene reglas escritas.</p>'}
      ${rules.length>3?`<p class="mu">y ${rules.length-3} más…</p>`:''}</div></div>`+S());
  }
  /* Miembros de la comunidad actual */
  if(LAY.widgets.members&&CM){
    const{data:m}=await sb.from('community_members').select('user_id').eq('community_id',CM.id).limit(12);
    const ids=(m||[]).map(x=>x.user_id);await prof(ids);
    const total=CM.member_count!=null?CM.member_count:(await sb.from('community_members')
      .select('user_id',{count:'exact',head:true}).eq('community_id',CM.id)).count||ids.length;
    out.push(`<div class="widget"><div class="card">
      <div class="wt"><b><i class="fa-solid fa-users" style="color:var(--ac)"></i> Miembros</b>
        <span class="tag">${total}</span>
        <button class="sm" onclick="membersDlg('${CM.id}')">Ver todos</button></div>
      ${ids.length?`<div class="mgrid">${ids.map(u=>`<div class="mt" onclick="openProfile('${u}')">
          ${av(P[u]||{id:u},44)}<span class="mn">${esc((P[u]||{}).name||'?')}</span></div>`).join('')}</div>`
        :'<p class="mu">Todavía no hay miembros.</p>'}</div></div>`+S());
  }
  return out.join('');
}
/* ---------- Reglamento ---------- */
async function rulesDlg(cid){
  const{data:c}=await sb.from('communities').select('*').eq('id',cid).maybeSingle();
  if(!c)return;
  const rules=(c.rules||'').split('\n').filter(Boolean);
  const d=document.createElement('div');d.className='preview';
  d.innerHTML=`<div class="card" style="max-width:520px;margin:0 auto">
    <div class="row"><b class="grow"><i class="fa-solid fa-scroll" style="color:var(--ac)"></i> Reglamento</b>
      <button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="mu">${esc(c.name)}</div>
    ${rules.length?`<ol class="rulesol">${rules.map(r=>`<li>${esc(r)}</li>`).join('')}</ol>`
      :'<p class="mu">Sin reglas escritas.</p>'}
    <label class="row mu"><input type="checkbox" id="rok"> He leído y acepto el reglamento</label>
    <button class="p" onclick="acceptRules('${cid}',this)"><i class="fa-solid fa-check"></i> Aceptar y continuar</button></div>`;
  document.body.appendChild(d);
}
async function acceptRules(cid,btn){
  if(!$('rok').checked)return toast('Marca la casilla para continuar.','warn');
  toast('Reglamento aceptado.','ok');
  document.querySelector('.preview')?.remove();
}
/* ---------- Listado completo de miembros ---------- */
async function membersDlg(cid){
  const d=document.createElement('div');d.className='preview';
  d.innerHTML=`<div style="max-width:560px;margin:0 auto" class="card">
    <div class="row"><b class="grow"><i class="fa-solid fa-users" style="color:var(--ac)"></i> Miembros</b>
      <button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <input id="mq" placeholder="Buscar…" oninput="mFilter()" autocomplete="off">
    <div id="mlist" style="display:grid;gap:6px;margin-top:10px;max-height:56vh;overflow:auto"></div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
  const{data:cp}=await sb.from('community_profiles').select('user_id,role,nickname,xp')
    .eq('community_id',cid).order('xp',{ascending:false}).limit(500);
  const ids=(cp||[]).map(x=>x.user_id);await prof(ids);
  MLIST=(cp||[]).map(x=>({...x,u:P[x.user_id]||{id:x.user_id}}));
  mFilter();
}
let MLIST=[];
function mFilter(){
  const q=(val('mq')||'').toLowerCase();
  const rows=MLIST.filter(x=>((x.u||{}).name||'').toLowerCase().includes(q));
  const box=$('mlist');if(!box)return;
  box.innerHTML=rows.length?rows.map(x=>`<div class="memrow" onclick="openProfile('${x.user_id}')">
      ${av(x.nickname?{...x.u,avatar:x.u.avatar}:x.u,36)}
      <div class="grow"><b>${esc(x.nickname||(x.u||{}).name||'?')}</b>
        <div class="mu">${esc((x.u||{}).name||'')}</div></div>
      ${x.role=='owner'?'<span class="tag" style="color:var(--ac)">Líder</span>'
        :x.role=='mod'?'<span class="tag">Moderador</span>':''}
      <span class="tag">${x.xp||0} XP</span></div>`).join('')
    :'<p class="mu">Nadie coincide.</p>';
}
/* ---------- Botones personalizados ---------- */
function addButton(){
  const label=prompt('Nombre del botón:');if(!label)return;
  const icon=prompt('Icono de Font Awesome (ej. fa-brands fa-discord):','fa-solid fa-link')||'fa-solid fa-link';
  const url=prompt('Enlace (https://…):','https://')||'https://';
  if(LAY.buttons.length>=DFL.maxBtns)return toast('Máximo '+DFL.maxBtns+' botones.','warn');
  LAY.buttons.push({id:Date.now(),label,icon,url});
  saveLayout();toast('Botón añadido.','ok');go('feed');
}
function delButton(id){
  LAY.buttons=LAY.buttons.filter(b=>b.id!=id);
  saveLayout();go('feed');
}
/* ---------- Panel de personalización ---------- */
function customize(){
  closeSetPanels();
  const d=document.createElement('div');d.className='preview';
  d.innerHTML=`<div class="card" style="max-width:560px;margin:0 auto;display:grid;gap:16px">
    <div class="row"><b class="grow" style="font-family:Syne;font-size:18px">
        <i class="fa-solid fa-sliders" style="color:var(--ac)"></i> Personalizar inicio</b>
      <button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button></div>

    <div><div class="mu" style="text-transform:uppercase;font-size:11px;letter-spacing:.08em;margin-bottom:8px">Pestañas</div>
      <div style="display:grid;gap:8px">
      ${TABS.map(t=>`<div class="tog"><i class="fa-solid ${t[1]}"></i><span>${t[2]}</span>
        <button class="sw2 ${LAY.tabs[t[0]]?'on':''}" onclick="toggleTab('${t[0]}')"></button></div>`).join('')}
      </div></div>

    <div><div class="mu" style="text-transform:uppercase;font-size:11px;letter-spacing:.08em;margin-bottom:8px">Widgets</div>
      <div style="display:grid;gap:8px">
      ${[['quick','fa-hand-pointer','Botones rápidos'],
         ['rules','fa-scroll','Reglamento (en comunidades)'],['members','fa-users','Miembros (en comunidades)']]
        .map(w=>`<div class="tog"><i class="fa-solid ${w[1]}"></i><span>${w[2]}</span>
          <button class="sw2 ${LAY.widgets[w[0]]?'on':''}" onclick="toggleWidget('${w[0]}')"></button></div>`).join('')}
      <div class="tog"><i class="fa-solid fa-grip-lines"></i><span>Separadores entre widgets</span>
        <button class="sw2 ${LAY.seps?'on':''}" onclick="LAY.seps=!LAY.seps;saveLayout();go('feed')"></button></div>
      </div></div>

    <div><div class="row"><div class="mu grow" style="text-transform:uppercase;font-size:11px;letter-spacing:.08em">Botones propios</div>
      <button class="p sm" onclick="addButton()"><i class="fa-solid fa-plus"></i> Añadir</button></div>
      <div style="display:grid;gap:8px;margin-top:8px">
      ${LAY.buttons.length?LAY.buttons.map(b=>`<div class="btrow">
          <i class="${/^fa-/.test(b.icon)?esc(b.icon):'fa-solid fa-link'}"></i>
          <span class="grow">${esc(b.label)}</span>
          <span class="mu">${esc((b.url||'').slice(0,26))}${(b.url||'').length>26?'…':''}</span>
          <button class="sm d bx" onclick="delButton('${b.id}')"><i class="fa-solid fa-xmark"></i></button></div>`).join('')
        :'<p class="mu">Aún no has añadido botones. Puedes enlazar a tu Discord, X, web…</p>'}
      </div></div>

    <button class="d sm" onclick="LAY=JSON.parse(JSON.stringify(DFL));saveLayout();go('feed')">
      <i class="fa-solid fa-rotate-left"></i> Restablecer todo</button>
  </div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
}

/* Las 4 secciones del inicio */
const TABS=[
  ['top','fa-fire','Top'],
  ['recent','fa-clock','Recientes'],
  ['reels','fa-clapperboard','Reels'],
  ['following','fa-users','Siguiendo'],
];
const KIND=[
  ['post','fa-pen-to-square','Publicación'],
  ['blog','fa-align-left','Blog'],
  ['wiki','fa-book','Wiki'],
  ['poll','fa-chart-simple','Encuesta'],
];
function retryOnline(){
  if(!navigator.onLine)return toast('Sigues sin conexión.','warn');
  OFFLINE=false;location.reload();
}
function offlineFeed(){
  const vis=TABS.filter(t=>LAY.tabs[t[0]]);
  const tabs=vis.length?vis:TABS;
  if(!tabs.some(t=>t[0]==FB))FB=(tabs.find(t=>t[0]=='recent')||tabs[0])[0];
  const seg=tabs.map(t=>`<button class="${FB==t[0]?'on':''}" onclick="setTab('${t[0]}')">
    <i class="fa-solid ${t[1]}"></i><span>${t[2]}</span></button>`).join('');
  $('main').innerHTML=`<div class="feed wide">
    <div class="row"><div class="segbar grow">${seg}</div>
      <button class="sm" onclick="retryOnline()" title="Reintentar conexión"><i class="fa-solid fa-rotate-right"></i></button></div>
    <div class="warnbar"><i class="fa-solid fa-cloud-arrow-down"></i>
      Sin conexión. Estás viendo publicaciones y mensajes guardados en este navegador.
      <button class="sm" onclick="retryOnline()">Reintentar</button></div>
    <div class="mas" id="pl"></div><div id="fm" style="display:grid;justify-items:center"></div>
  </div>`;
  loadFeed(1);
}
VIEWS.feed=async()=>{
  if(OFFLINE)return offlineFeed();
  const{data:cm,error:cmErr}=await sb.from('communities').select('*').order('name');
  if(cmErr&&isNetError(cmErr)){setOffline(true,'Sin conexión. Mostrando lo guardado.');return offlineFeed()}

  CM=FC?(cm||[]).find(c=>c.id==FC):null;if(FC&&!CM)FC='';
  if(OFFLINE)return offlineFeed();
  const opts=(cm||[]).map(c=>`<option value="${c.id}" ${c.id==FC?'selected':''}>${esc(c.name)}</option>`).join('');
  /* Fondo de la comunidad detrás de todo. La cabecera, la gestión, los
     usuarios activos y las salas los pinta drawComm() en #commpanel. */
  const cbg=(CM&&CM.bg)?`<div class="cbg" style="background-image:url('${esc(CM.bg)}')"></div>`:'';
  const head=CM?'<div id="commpanel" class="card" style="margin:14px 18px 0;padding:0;overflow:hidden"></div>':'';
  /* Solo las pestañas que el usuario tiene activadas (mínimo una) */
  const vis=TABS.filter(t=>LAY.tabs[t[0]]);
  const tabs=vis.length?vis:TABS;
  if(!vis.some(t=>t[0]==FB))FB=(tabs.find(t=>t[0]=='recent')||tabs[0])[0];
  const seg=tabs.map(t=>`<button class="${FB==t[0]?'on':''}" onclick="setTab('${t[0]}')"
      ${t[0]=='following'&&!NEWOK?`disabled title="Necesita ${SQL_FIX}"`:''}>
      <i class="fa-solid ${t[1]}"></i><span>${t[2]}</span></button>`).join('');
  const noComposer=FB=='following';
  COMP_MODE='';
  $('main').innerHTML=`${cbg}${head}<div class="feed wide th-${CM&&CM.theme||'noir'}">
    <div class="row"><div class="segbar grow">${seg}</div></div>
    <div id="peoplebar" class="peoplebar"></div>
    <div id="wstories" class="storiesbar"></div>
    <div id="widgets"></div>
    ${noComposer?'':`<details class="newpost" id="newpost" ontoggle="composerToggle(this)">
      <summary>
        ${av(me,40)}
        <span class="nptxt grow"><b>¿Qué quieres publicar?</b><span>Un post con fotos, blog o encuesta · o un vídeo</span></span>
        <span class="npbtn"><i class="fa-solid fa-plus"></i></span>
      </summary>
      <div class="comp2 hide" id="comp">
        <div class="row">
          ${av(me,40)}
          <select id="pc" style="width:auto;max-width:56%"><option value="">Sin comunidad</option>${opts}</select>
          <button class="sm" style="margin-left:auto" onclick="composerHome()" title="Cambiar tipo"><i class="fa-solid fa-arrow-left"></i></button>
          <button class="sm" onclick="closeComposer()" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="cmpBody"></div>
      </div>
    </details>`}
    <div class="mas" id="pl"></div>
    <div id="fm" style="display:grid;justify-items:center"></div></div>`;
  if(CM)await drawComm();
  widgetHTML().then(h=>{const w=$('widgets');if(w)w.innerHTML=h});
  loadPeopleRail();
  /* Las historias del inicio: se cargan con las vistas y los amigos para
     que el anillo sepa qué está sin ver. */
  loadStories().then(()=>Promise.all([loadStoryViews(),loadFriends()]))
    .then(()=>refreshStoriesUI()).catch(()=>{});
  if(!noComposer)renderComposer();
  await loadFeed(1);
};
function setTab(t){
  FB=t;
  const vis=TABS.filter(x=>LAY.tabs[x[0]]);
  document.querySelectorAll('.segbar button').forEach((b,i)=>b.classList.toggle('on',(vis[i]||TABS[i])[0]===t));
  loadFeed(1);
}
async function setTheme(t){const{error}=await sb.from('communities').update({theme:t}).eq('id',FC);if(error)toast(error.message,'err');go(CC?'comm':'feed')}

/* ==========================================================================
   7b) Compositor:Kind + texto + multimedia + portada + vista previa
   ========================================================================== */
let MED=[],PK='post',COVER=null;
/* El compositor normal (texto/fotos) se reutiliza al volver de Reels */
function composerHTML(){
  return `
    <div class="kindrow">${KIND.map(k=>`<button class="${PK==k[0]?'on':''}" onclick="setKind('${k[0]}')">
      <i class="fa-solid ${k[1]}"></i>${k[2]}</button>`).join('')}</div>
    <input id="pt" placeholder="Título" oninput="updPrev()">
    <textarea id="pb" placeholder="Escribe aquí…" oninput="updPrev()"></textarea>
    <div id="drop" class="drop" onclick="pickMedia()" ondragover="event.preventDefault();this.classList.add('over')"
         ondragleave="this.classList.remove('over')" ondrop="dropMedia(event)">
      <i class="fa-solid fa-photo-film"></i>
      <b>Fotos y vídeos</b>
      <span class="mu">Arrastra aquí o pulsa · hasta 10 archivos</span>
    </div>
    <div class="thumbs" id="th"></div>
    <label class="tog"><i class="fa-solid fa-eye-slash"></i>
      <span>NSFW · ocultar hasta pulsar</span>
      <input type="checkbox" id="pnsfw" style="width:auto;margin-left:auto"></label>
    ${COLS.posts.has('nsfw')?'':`<p class="mu"><i class="fa-solid fa-triangle-exclamation"></i> Para guardar el NSFW de una publicación ejecuta <b>sql/01-comunidades-nsfw.sql</b>.</p>`}
    <div class="row w">
      <button class="sm" onclick="pickCover()"><i class="fa-solid fa-image"></i> Portada</button>
      <button class="sm" onclick="openPreview()"><i class="fa-solid fa-eye"></i> Vista previa</button>
      <button class="p" style="margin-left:auto" onclick="mkPost()"><i class="fa-solid fa-paper-plane"></i> Publicar</button>
    </div>`;
}
let COMP_MODE='';
function composerChoice(){
  return `<div class="createpick">
    <button class="cpick" onclick="openComposer('post')" type="button">
      <span class="cpico"><i class="fa-solid fa-pen-to-square"></i></span>
      <b>Publicación</b><span>Texto, fotos, blog, wiki o encuesta</span></button>
    <button class="cpick" onclick="openComposer('reel')" type="button">
      <span class="cpico"><i class="fa-solid fa-clapperboard"></i></span>
      <b>Vídeo / Reel</b><span>Sube uno o varios vídeos cortos</span></button>
  </div>
  <p class="mu" style="margin:0"><i class="fa-solid fa-circle-info"></i> Elige el formato y publica en tu perfil o en una comunidad.</p>`;
}
function renderComposer(){
  const box=$('cmpBody');if(!box)return;
  if(COMP_MODE==='reel'){box.innerHTML=reelForm();drawReels();return}
  if(COMP_MODE==='post'){box.innerHTML=composerHTML();drawThumbs();updPrev();return}
  box.innerHTML=composerChoice();
}
function setKind(k){PK=k;COMP_MODE='post';renderComposer()}
function openComposer(mode){
  stopProfileMusic();
  const c=$('comp'),d=$('newpost');if(!c)return;
  if(mode==='post'||mode==='reel')COMP_MODE=mode;
  if(d&&d.tagName==='DETAILS')d.open=true;
  c.classList.remove('hide');
  renderComposer();
  c.scrollIntoView({behavior:'smooth',block:'center'});
}
/* El resumen abre el compositor sin recargar la vista. */
function composerToggle(d){
  if(!d||d.tagName!=='DETAILS')return;
  const c=$('comp');if(!c)return;
  if(d.open){
    c.classList.remove('hide');
    if(!COMP_MODE)COMP_MODE='';
    renderComposer();
  }else{
    c.classList.add('hide');
    COMP_MODE='';
  }
}
function composerHome(){
  COMP_MODE='';
  renderComposer();
  $('comp').scrollIntoView({behavior:'smooth',block:'center'});
}
function closeComposer(){
  COMP_MODE='';
  $('comp').classList.add('hide');
  const d=$('newpost');if(d&&d.tagName==='DETAILS')d.open=false;
}
function pickMedia(){
  const i=document.createElement('input');i.type='file';i.multiple=true;
  i.accept='image/*,video/*';i.onchange=()=>{addMedia([...i.files]);i.value=''};i.click();
}
function dropMedia(e){
  e.preventDefault();$('drop').classList.remove('over');
  addMedia([...e.dataTransfer.files]);
}
function kindOf(f){
  if(f.type.startsWith('image/'))return'image';
  if(f.type.startsWith('video/'))return'video';
  if(f.type.startsWith('audio/'))return'audio';
  return'file';
}
async function addMedia(files){
  for(const f of files){
    if(MED.length>=10){toast('Máximo 10 archivos por publicación.','warn');break}
    if(f.size>MAXFILE){toast(`«${f.name}» supera los 25 MB.`,'err');continue}
    MED.push({u:null,n:f.name,t:kindOf(f),s:f.size,f});
  }
  drawThumbs();
  /* Subida en segundo plano: el usuario puede seguir escribiendo */
  for(let i=0;i<MED.length;i++){
    const m=MED[i];
    if(m.u||!m.f)continue;
    m.u=await up(m.f);
    if(m.u)m.t=m.t==='file'?(m.f.type||'file'):m.t;
    delete m.f;drawThumbs();
  }
}
function rmMedia(i){MED.splice(i,1);drawThumbs()}
function drawThumbs(){
  const t=$('th');if(!t)return;
  t.innerHTML=MED.map((m,i)=>`<div class="thumb">
    ${m.u?(m.t=='video'?`<video src="${esc(m.u)}" muted></video>`
          :m.t=='image'?`<img src="${esc(m.u)}" alt="">`
          :`<div class="grid" style="place-items:center;height:100%"><i class="fa-solid ${iconOf(m.t,m.n)}"></i></div>`)
      :'<div class="grid" style="place-items:center;height:100%"><i class="fa-solid fa-spinner fa-spin"></i></div>'}
    ${m.n==='Portada'?'<div class="ck">Portada</div>':''}
    <button class="x" onclick="rmMedia(${i})"><i class="fa-solid fa-xmark"></i></button></div>`).join('');
}
function pickCover(){
  const i=document.createElement('input');i.type='file';i.accept='image/*';
  i.onchange=async()=>{
    const f=i.files[0];if(!f)return;
    COVER=await up(f);
    if(COVER)MED.unshift({u:COVER,n:'Portada',t:'image',s:f.size,cover:true});
    drawThumbs();
  };i.click();
}
/* Vista previa completa antes de publicar */
function openPreview(){
  const d=document.createElement('div');d.className='preview';
  const p={author:me.id,kind:PK,title:val('pt'),body:val('pb'),
           community_id:val('pc')||FC||null,
           nsfw:!!($('pnsfw')&&$('pnsfw').checked),
           media:MED.filter(m=>m.u).map(m=>({u:m.u,n:m.n,t:m.t})),
           cover:COVER,likes:[],comments:[{count:0}],reactions:[],poll_votes:[],created_at:new Date().toISOString()};
  d.innerHTML=`<div class="wrap">
    <div class="row" style="margin-bottom:12px">
      <b class="grow"><i class="fa-solid fa-eye"></i> Así se verá</b>
      <button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    ${postHtml(p)}
    <p class="mu" style="text-align:center;margin-top:12px">Previsualización: los botones todavía no actúan.</p>
  </div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
}
function updPrev(){/* la vista previa se genera al abrirla; aquí solo validamos el título */}

/* Inserción resistente de publicaciones.
   Si la base en vivo aún no tiene las columnas nuevas (42703) o la caché de
   PostgREST está vieja (PGRST204), reintenta una sola vez solo con las
   columnas básicas para que publicar nunca se pierda del todo. */
const POST_BASE=['kind','title','body','community_id'];
async function insPost(row,single){
  const send=r=>{const q=sb.from('posts').insert(r);return single?q.select().single():q;};
  let res=await send(row);
  const err=res&&res.error;
  if(err&&(err.code=='42703'||err.code=='PGRST204'||/column .* does not exist/i.test(err.message||''))){
    const slim={};for(const k of POST_BASE)if(k in row)slim[k]=row[k];
    res=await send(slim);
    if(res&&!res.error)
      toast('Guardado en modo compatible (faltan columnas nuevas). Ejecuta <b>sql/13-parche-en-vivo.sql</b> para el soporte completo.','warn',9000);
  }
  return res;
}

async function mkPost(){
  if(!$('pt'))return;
  const row={kind:PK,title:val('pt'),body:val('pb'),community_id:val('pc')||FC||null,
    nsfw:!!($('pnsfw')&&$('pnsfw').checked)};
  const pend=MED.filter(m=>!m.u&&m.f);
  if(pend.length)return toast('Espera a que terminen de subir los archivos.','warn',4000);
  if(!row.title&&!row.body&&!MED.length)return toast('Escribe algo o adjunta una foto.','err');
  if(row.kind=='poll'&&row.body.split('\n').filter(Boolean).length<2)return toast('Una encuesta necesita al menos dos opciones.','err');
  if(MED.length)row.media=MED.map(m=>({u:m.u,n:m.n,t:m.t,s:m.s}));
  if(COVER)row.cover=COVER;
  const res=await insPost(fit('posts',row),false);
  const error=res&&res.error;
  if(error)return toast(explain(error),'err',9000);
  if(row.community_id&&!CP[row.community_id+me.id])CP[row.community_id+me.id]='member';
  MED=[];COVER=null;PK='post';$('pt').value='';$('pb').value='';
  toast('Publicado. +10 XP','ok');
  if(CC){FB='recent';await go('comm')}else go('feed');
}

/* ---- Multimedia de una publicación ----
   Portada a tamaño completo + rejilla (2-4) o carrusel (5+).
   También mantiene compatibilidad con la antigua columna `image`. */
function mediaList(p){
  const m=Array.isArray(p.media)?p.media.slice():[];
  if(p.image&&!m.some(x=>x.u==p.image))m.unshift({u:p.image,n:'imagen',t:'image'});
  if(p.cover&&!m.some(x=>x.u==p.cover))m.unshift({u:p.cover,n:'portada',t:'image',cover:true});
  return m.filter(x=>x&&x.u);
}
function mediaHtml(p){
  const m=mediaList(p);if(!m.length)return'';
  const vid=m.find(x=>x.t=='video');
  /* Un solo vídeo a pantalla completa */
  if(m.length==1&&m[0].t=='video')
    return `<video controls playsinline preload="metadata" style="width:100%;border-radius:12px;max-height:520px;background:#000;margin-top:6px" src="${esc(m[0].u)}"></video>`;
  /* Rejilla de 2 a 4 */
  if(m.length<=4)
    return `<div class="mg g${m.length}">${m.map(x=>`<div onclick="zoom('${esc(x.u)}')">${x.t=='video'
        ?`<video src="${esc(x.u)}" muted preload="metadata" style="width:100%;height:100%;object-fit:cover"></video>`
        :`<img src="${esc(x.u)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">`}</div>`).join('')}</div>`;
  /* Carrusel de 5 o más */
  return `<div class="album" id="alb${p.id}">
    ${m.map((x,i)=>`<div class="slide ${i?'':'on'}">${x.t=='video'
      ?`<video src="${esc(x.u)}" controls playsinline preload="none"></video>`
      :`<img src="${esc(x.u)}" alt="" loading="${i<2?'eager':'lazy'}" onclick="zoom('${esc(x.u)}')">`}</div>`).join('')}
    <button class="nav l" onclick="slide('${p.id}',-1)"><i class="fa-solid fa-chevron-left"></i></button>
    <button class="nav r" onclick="slide('${p.id}',1)"><i class="fa-solid fa-chevron-right"></i></button>
    <span class="cnt" id="albc${p.id}">1/${m.length}</span>
    <div class="dots" id="albd${p.id}">${m.map((_,i)=>`<i class="${i?'':'on'}"></i>`).join('')}</div>
  </div>${vid?'':''}`;
}
function slide(pid,d){
  const a=$('alb'+pid);if(!a)return;
  const s=[...a.querySelectorAll('.slide')],cur=s.findIndex(x=>x.classList.contains('on'));
  const n=Math.max(0,Math.min(s.length-1,cur+d));
  s.forEach((x,i)=>x.classList.toggle('on',i===n));
  s.forEach(x=>{const v=x.querySelector('video');if(v){v.pause();if(!x.classList.contains('on'))v.currentTime=0}});
  const dots=$('albd'+pid);if(dots)[...dots.children].forEach((x,i)=>x.classList.toggle('on',i===n));
  const c=$('albc'+pid);if(c)c.textContent=(n+1)+'/'+s.length;
}

/* Puntuación para la pestaña Top: reacciones + me gusta + comentarios.
   Se calcula en el cliente porque no hay forma de ordenar por un COUNT anidado. */
const score=p=>(p.reactions||[]).length+(p.likes||[]).length*2+(p.comments[0]?p.comments[0].count:1)*3;
const isVideo=p=>!!(p.media||[]).find(m=>m.t=='video')||!!(p.cover||'').match(/\.(mp4|webm|mov|m4v)(\?|$)/i);

function drawOfflineFeed(){
  const cached=cacheRead(me&&me.id,'posts',[])||[];
  let rows=(Array.isArray(cached)?cached:[]).map(p=>({...p,
    comments:p.comments||[],likes:p.likes||[],poll_votes:p.poll_votes||[],reactions:p.reactions||[]}));
  if(FB=='top')rows=rows.slice().sort((a,b)=>score(b)-score(a));
  FEED.buf=rows.slice(0,60);FEED.done=true;FEED.off=FEED.buf.length;
  const b=$('pl');if(!b)return;
  b.className='mas';b.style.padding='0';
  b.innerHTML=FEED.buf.length?FEED.buf.map(postHtml).join('')
    :empty('No hay publicaciones guardadas todavía.<br><span class="mu">Entra con internet al menos una vez para guardar el inicio.</span>');
  tintSoon();
  const fm=$('fm');
  if(fm)fm.innerHTML='<span class="mu"><i class="fa-solid fa-cloud-arrow-down"></i> Sin conexión · mostrando lo guardado</span>';
}
async function loadFeed(reset){
  if(reset){FEED={off:0,buf:[],done:false};$('pl')&&($('pl').innerHTML='');$('fm')&&($('fm').innerHTML='')}
  if(FEED.done)return;
  if(OFFLINE)return drawOfflineFeed();
  const mode=FB||'recent';
  /* Reels: solo multimedia vertical, una columna a pantalla completa */
  if(mode=='reels')return loadReels();
  let q=sb.from('posts').select(POSTSEL()).order('created_at',{ascending:false}).range(FEED.off,FEED.off+19);
  if(FC)q=q.eq('community_id',FC);
  if(mode=='following'){
    if(!NEWOK){$('pl').innerHTML=empty('La pestaña «Siguiendo» necesita <b>'+SQL_FIX+'</b>.');FEED.done=true;return}
    const{data:f}=await sb.from('follows').select('following_id').eq('follower_id',me.id);
    const ids=(f||[]).map(x=>x.following_id);
    if(!ids.length){$('pl').innerHTML=empty('Todavía no sigues a nadie. Ve a <b>Explorar</b>.');FEED.done=true;return}
    q=q.in('author',ids);
  }
  let{data,error}=await q;
  /* Reintento sin 'reactions' si PostgREST no encuentra la relación */
  if(error&&embedBroken(error)&&NEWOK){
    console.warn('Relación reactions no disponible:',error.message);
    NEWOK=false;schemaBar();
    q=sb.from('posts').select(SEL_SHORT).order('created_at',{ascending:false}).range(FEED.off,FEED.off+19);
    if(FC)q=q.eq('community_id',FC);
    if(FB=='following'){
      const{data:f}=await sb.from('follows').select('following_id').eq('follower_id',me.id);
      q=q.in('author',(f||[]).map(x=>x.following_id));
    }
    ({data,error}=await q);
  }
  if(error){
    if(isNetError(error)){
      setOffline(true,'Sin conexión. Mostrando las publicaciones guardadas.');
      return drawOfflineFeed();
    }
    return($('pl').innerHTML=empty(esc(error.message)));
  }
  const rows=(data||[]).filter(p=>notBlocked(p.author));
  FEED.off+=20;
  if(!rows.length){FEED.done=true;if(!FEED.buf.length)$('pl').innerHTML=empty('Nada por aquí todavía.');return}
  await prof(rows.map(p=>p.author));
  await loadComms(rows.map(p=>p.community_id));
  await cpNick(rows);                       // apodos por comunidad (consulta aparte)
  FEED.buf=FEED.buf.concat(rows);
  if(mode=='top')FEED.buf.sort((a,b)=>score(b)-score(a));   // lo más puntuado primero
  $('pl').innerHTML=FEED.buf.map(postHtml).join('');tintSoon();
  $('fm').innerHTML=FEED.done?'<span class="mu">No hay más publicaciones.</span>':`<button class="sm" onclick="loadFeed()">Cargar más</button>`;
  cachePosts(FEED.buf);
}

/* ---- Reels: una publicación por pantalla, con desplazamiento vertical ---- */
async function loadReels(){
  const b=$('pl');if(!b)return;
  b.className='reels';b.style.cssText='';
  let q=sb.from('posts').select(POSTSEL()).eq('is_reel',true)
    .order('created_at',{ascending:false}).limit(40);
  if(FC)q=q.eq('community_id',FC);
  let{data,error}=await q;
  /* Si la columna is_reel aún no existe, se filtra en el navegador
     en vez de dejar el Reels en blanco. */
  let fallback=false;
  if(error){
    tabulaFalta(error)||(NEWOK&&(NEWOK=false,schemaBar()));
    fallback=true;
    let q2=sb.from('posts').select(SEL_SHORT).order('created_at',{ascending:false}).limit(60);
    if(FC)q2=q2.eq('community_id',FC);
    ({data,error}=await q2);
  }
  if(error)return(b.innerHTML=empty(esc(error.message)));
  const list=(data||[]).filter(p=>notBlocked(p.author))
    .filter(p=>(p.media||[]).some(x=>x.t=='video'||x.t=='image'))
    .filter(p=>!fallback||p.is_reel||!COLS.posts.has('is_reel')&&(p.media||[]).some(x=>x.t=='video'));
  FEED.done=true;
  if(!list.length){
    return b.innerHTML=empty('Todavía no hay Reels. Sube el primero con el botón de arriba ↑');
  }
  await prof(list.map(p=>p.author));await loadComms(list.map(p=>p.community_id));await cpNick(list);
  b.innerHTML=list.map((p,i)=>{
    const m=(p.media||[]).find(x=>x.t=='video')||(p.media||[]).find(x=>x.t=='image');
    const a=P[p.author]||{};
    const isV=m.t=='video';
    const nsfw=nsfwPost(p)&&!REVEAL.has(p.id);
    const re=(p.reactions||[]).length+(p.likes||[]).length;
    return `<article class="reel ${nsfw?'nsfw-hide':''}" data-r="${p.id}" data-i="${i}">
      ${isV?`<video src="${esc(m.u)}" playsinline muted loop preload="metadata"></video>`
           :`<img src="${esc(m.u)}" alt="" loading="lazy">`}
      ${nsfw?`<button class="reel-veil" onclick="revealReel('${p.id}',this,event)">
        <i class="fa-solid fa-eye-slash"></i><b>Contenido NSFW</b>
        <span class="mu">Pulsa para verlo</span></button>`:''}
      <span class="idx">${i+1}/${list.length}</span>
      ${p.author==me.id?'<span class="tagv"><i class="fa-solid fa-pen"></i> Tuyo</span>':''}
      <div class="side">
        <div><button onclick="reelReact('${p.id}','${esc(m.t)}')" title="Reaccionar">
          <i class="fa-solid fa-heart"></i></button><div class="n">${re}</div></div>
        <div><button onclick="tc('${p.id}');document.getElementById('c${p.id}').scrollIntoView({behavior:'smooth'})" title="Comentarios">
          <i class="fa-regular fa-comment"></i></button><div class="n">${p.comments[0]?p.comments[0].count:0}</div></div>
        <div><button onclick="openProfile('${p.author}')" title="Perfil"><i class="fa-solid fa-user"></i></button>
          <div class="n">${esc(a.name||'?')}</div></div>
        ${isV?`<div><button onclick="reelMute(this)" title="Sonido"><i class="fa-solid fa-volume-xmark"></i></button></div>`:''}
        ${p.author==me.id?`<div><button onclick="delReel('${p.id}')" title="Borrar"><i class="fa-solid fa-trash"></i></button></div>`:''}
      </div>
      <div class="ov">
        <div class="row" style="gap:8px">${av(a,26)}<b>${esc(a.name||'?')}</b></div>
        ${p.title?`<div class="t">${esc(p.title)}</div>`:''}
        ${p.body?`<div class="d">${esc(p.body)}</div>`:''}
      </div></article>`;
  }).join('')+
  `<div id="c${list[0]&&list[0].id}" class="hide"></div>`;
  observeReels();
  $('fm').innerHTML='';
}
/* Reproduce solo el reel que se está viendo (como en Instagram) */
let reelObs=null;
function observeReels(){
  if(reelObs)reelObs.disconnect();
  const vids=[...document.querySelectorAll('.reel video')];
  if(!vids.length)return;
  reelObs=new IntersectionObserver(es=>{
    es.forEach(e=>{
      const v=e.target;
      if(e.isIntersecting&&e.intersectionRatio>.6){
        /* Empieza en silencio: el navegador bloquea el audio automático */
        v.muted=true;const p=v.play();if(p&&p.catch)p.catch(()=>{});
      }else v.pause();
    });
  },{threshold:[0,.6,1]});
  vids.forEach(v=>reelObs.observe(v));
}
function reelMute(btn){
  const v=btn.closest('.reel').querySelector('video');if(!v)return;
  v.muted=!v.muted;
  btn.innerHTML=v.muted?'<i class="fa-solid fa-volume-xmark"></i>':'<i class="fa-solid fa-volume-high"></i>';
  if(!v.muted){const p=v.play();if(p&&p.catch)p.catch(()=>{})}
}
async function reelReact(id){
  if(!NEWOK)return toast('Las reacciones necesitan 00-instalar-todo.sql.','warn');
  const{data}=await sb.from('reactions').select('emoji').eq('post_id',id).eq('user_id',me.id).maybeSingle();
  if(data)await sb.from('reactions').delete().eq('post_id',id).eq('user_id',me.id);
  else{const{error}=await sb.from('reactions').insert({post_id:id,user_id:me.id,emoji:'❤️'});
    if(error)return toast(error.message,'err')}
  loadReels();
}
async function delReel(id){
  if(!await ask())return;
  const{error}=await sb.from('posts').delete().eq('id',id);
  if(error)return toast(error.message,'err');
  toast('Reel borrado.');loadReels();
}

/* ---------- Compositor de Reels: varios vídeos, uno por publicación ---------- */
let REELS=[];
function reelForm(){
  return `<details class="panel" open><summary><i class="fa-solid fa-clapperboard"></i> Publicar Reels</summary>
    <div class="pbody">
      <div class="field"><label>Vídeos</label>
        <button class="drop" style="width:100%" onclick="pickReels()">
          <i class="fa-solid fa-film"></i><b>Elegir vídeos</b>
          <span class="mu">Cada vídeo será un Reel independiente · máx. 8 · 25 MB cada uno</span></button>
        <input id="rv" type="file" accept="video/*" multiple style="display:none"></div>
      <div class="rvids" id="rvid"></div>
      <div class="field"><label>Texto común</label>
        <input id="rtt" placeholder="Título (opcional)" maxlength="80"></div>
      <div class="field"><label>Descripción</label>
        <textarea id="rbb" placeholder="Se repetirá en cada Reel" maxlength="400"></textarea></div>
      <label class="tog"><i class="fa-solid fa-eye-slash"></i>
        <span>NSFW · ocultar hasta pulsar</span>
        <input type="checkbox" id="rnsfw" style="width:auto;margin-left:auto"></label>
      ${COLS.posts.has('nsfw')?'':`<p class="mu"><i class="fa-solid fa-triangle-exclamation"></i> Para guardar el NSFW de un Reel ejecuta <b>sql/01-comunidades-nsfw.sql</b>.</p>`}
      <button class="p" onclick="mkReels()"><i class="fa-solid fa-paper-plane"></i> Publicar Reels</button>
      <p class="mu">Cada vídeo se sube y se publica por separado. Tardará según el tamaño.</p>
    </div></details>`;
}
function pickReels(){
  const i=document.createElement('input');
  i.type='file';i.accept='video/*';i.multiple=true;
  i.onchange=async()=>{await addReels([...i.files]);i.value=''};
  i.click();
}
async function addReels(files){
  for(const f of files){
    if(REELS.length>=8){toast('Máximo 8 Reels por publicación.','warn');break}
    if(f.size>MAXFILE){toast(`«${f.name}» supera los 25 MB.`,'err',5000);continue}
    REELS.push({f,url:URL.createObjectURL(f),n:f.name,s:f.size});
  }
  drawReels();
  /* Subida en segundo plano */
  for(let i=0;i<REELS.length;i++){
    const r=REELS[i];
    if(r.up)continue;
    r.up=upRaw(r.f).then(u=>{r.remote=u||r.url;drawReels()}).catch(e=>{
      toast(e.message,'err',5000);REELS.splice(i,1);drawReels()});
  }
}
function rmReel(i){try{URL.revokeObjectURL(REELS[i].url)}catch{}REELS.splice(i,1);drawReels()}
function drawReels(){
  const b=$('rvid');if(!b)return;
  b.innerHTML=REELS.map((r,i)=>`<div class="rvid">
    <video src="${esc(r.remote||r.url)}" muted playsinline></video>
    <span class="ord">${i+1}</span>
    <button class="x" onclick="rmReel(${i})"><i class="fa-solid fa-xmark"></i></button></div>`).join('');
  const pend=REELS.filter(r=>r.up&&!r.remote).length;
  const pb=$('rpbar');
  if(pb)pb.innerHTML=pend?`<span class="mu">Subiendo ${pend} vídeo(s)…</span>`:'';
}
async function mkReels(){
  if(!REELS.length)return toast('Elige al menos un vídeo.','err');
  const tit=val('rtt'),desc=val('rbb');
  const nsfw=!!($('rnsfw')&&$('rnsfw').checked);
  const cid=val('pc')||FC||null;
  for(let i=0;i<REELS.length;i++){
    const r=REELS[i];
    if(r.up)await r.up;
    const u=r.remote||r.url;
    if(!u)continue;
    const row=fit('posts',{kind:'post',title:tit,body:desc,is_reel:true,nsfw,
      community_id:cid,media:[{u,n:r.n,t:'video',s:r.s}]});
    const res=await insPost(row,true);
    const error=res&&res.error;
    if(error){toast(explain(error),'err',7000);break}
  }
  REELS.forEach(r=>{try{URL.revokeObjectURL(r.url)}catch{}});
  REELS=[];$('rtt').value='';$('rbb').value='';
  toast('¡Reels publicados! +10 XP cada uno','ok');
  if(CC){FB='reels';await go('comm')}else loadReels();
}

/* ==========================================================================
   8) Explorar / buscador
   ========================================================================== */
VIEWS.explore=async()=>{
  $('main').innerHTML=`<div class="feed wide">
    <div class="card"><input id="gq" placeholder="Busca personas por nick o código, salas o comunidades…" oninput="gs()" autocomplete="off"></div>
    <div id="gr"></div>
    <h3 style="margin-top:10px">Lo más activo</h3><div id="gact"></div></div>`;
  /* awaited: si fallan, el error lo captura go() en vez de quedar suelto */
  await gs();await loadActive();
};
async function gs(){
  const q=val('gq').replace(/[,()%]/g,'');
  const box=$('gr');
  if(!q){box.innerHTML='';return}
  box.innerHTML='<div class="mu">Buscando…</div>';
  const like=`%${q}%`;
  const por=`name.ilike.${like},uid.ilike.${like}`+(COLS.profiles.has('profile_code')?`,profile_code.ilike.${like}`:'');
  const[pu,ro,co]=await Promise.all([
    sb.from('profiles').select(PROFSEL()).neq('id',me.id).or(por).limit(12),
    sb.from('rooms').select('*').order('created_at',{ascending:false}).ilike('name',like).limit(12),
    sb.from('communities').select('*').order('created_at',{ascending:false}).ilike('name',like).limit(12)]);
  const us=(pu.data||[]).filter(p=>notBlocked(p.id)).map(p=>fx(p));
  us.forEach(p=>P[p.id]=p);
  box.innerHTML=`
    ${us.length?`<h3>Personas</h3><div class="grid" style="padding:0">${us.map(u=>`<div class="rc" onclick="openProfile('${u.id}')">
      <div class="rb row">${av(u,44)}<div class="grow"><b>${esc(u.name)}</b><div class="mu">Ver perfil</div></div>
      <i class="fa-solid fa-chevron-right" style="color:var(--mu)"></i></div></div>`).join('')}</div>`:''}
    ${(ro.data||[]).length?`<h3>Salas</h3><div class="grid" style="padding:0">${ro.data.map(r=>rcRoom(r)).join('')}</div>`:''}
    ${(co.data||[]).length?`<h3>Comunidades</h3><div class="grid" style="padding:0">${co.data.map(c=>rcComm(c)).join('')}</div>`:''}
    ${!us.length&&!(ro.data||[]).length&&!(co.data||[]).length?empty('Nada encontrado con «'+esc(q)+'».'):''}`;
}
async function loadActive(){
  const[pp,rr,cc]=await Promise.all([
    sb.from('posts').select('author').gte('created_at',new Date(Date.now()-7*864e5).toISOString()).limit(400),
    sb.from('rooms').select('*').order('created_at',{ascending:false}).limit(6),
    sb.from('communities').select('*').order('created_at',{ascending:false}).limit(6)]);
  const n={};(pp.data||[]).forEach(p=>n[p.author]=(n[p.author]||0)+1);
  const top=Object.entries(n).filter(([k])=>notBlocked(k)).sort((a,b)=>b[1]-a[1]).slice(0,12).map(x=>x[0]);
  await prof(top);
  $('gact').innerHTML=top.length?`<div class="grid" style="padding:0">${top.map((id,i)=>`<div class="rc" onclick="openProfile('${id}')">
      <div class="rb row"><b class="n" style="color:var(--ac);font-family:Syne">${i+1}</b>${av(P[id],34)}
      <div class="grow"><b>${esc((P[id]||{}).name||'?')}</b><div class="mu">${n[id]} publicaciones esta semana</div></div></div></div>`).join('')}</div>`:empty('Todavía no hay actividad.');
  const rg=$('gr');
  if(!val('gq'))rg.innerHTML=`<h3>Salas recientes</h3><div class="grid" style="padding:0">${(rr.data||[]).map(rcRoom).join('')||empty('Sin salas.')}</div>
    <h3>Comunidades recientes</h3><div class="grid" style="padding:0">${(cc.data||[]).map(rcComm).join('')||empty('Sin comunidades.')}</div>`;
}

/* ==========================================================================
   9) Perfil público
   ========================================================================== */
let PROF=null,PEEK=false,PROFILE_LOCKED=false;
function offlineProfile(id){
  const p=P[id]||cacheRead(me&&me.id,'profiles',{})[id];
  if(!p)return toast('Sin conexión: este perfil no está guardado.','warn');
  stopProfileMusic();
  PEEK=false;PROFILE_LOCKED=false;view='prof';PROF=id;setMobileTitle('prof');
  document.querySelectorAll('#rail button').forEach(b=>b.classList.remove('on'));
  $('app').classList.add('ns');$('side').innerHTML='';
  document.body.classList.add('open');
  let rows=cacheRead(me&&me.id,'profileposts_'+id,[])||[];
  if(!rows.length)rows=(cacheRead(me&&me.id,'posts',[])||[]).filter(x=>x.author===id);
  rows=rows.map(x=>({...x,comments:x.comments||[],likes:x.likes||[],poll_votes:x.poll_votes||[],reactions:x.reactions||[]}));
  $('main').innerHTML=`<div class="feed wide">
    <div class="card" style="display:grid;gap:8px;justify-items:center;text-align:center">
      ${av(p,96)}<h2 style="margin:0">${esc(p.name||'?')}</h2>
      <div class="mu">${esc(p.bio||'Perfil guardado sin conexión')}</div>
      ${p.links?`<div class="mu">${soc(p.links)}</div>`:''}
      <span class="tag"><i class="fa-solid fa-cloud-arrow-down"></i> Sin conexión</span>
    </div>
    <h3>Publicaciones guardadas</h3>
    <div class="mas">${rows.length?rows.map(postHtml).join(''):empty('No hay publicaciones guardadas de este perfil.')}</div>
  </div>`;
  renderFabs();tintSoon();
}
/* Código de invitación del perfil. La base de datos lo genera al crear la
   cuenta (sql/10-codigo-perfil-compartir.sql); si aún no se ejecutó, se usa
   un código estable derivado del id para que el enlace siga funcionando. */
function profileCode(p){
  const c=String((p&&p.profile_code)||'').trim();
  if(c)return c.toUpperCase();
  const h=profileHash(p&&p.id).toString(36).toUpperCase().padStart(6,'0').slice(-6);
  return 'TBL-'+h;
}
function profileShareUrl(id){
  return `${location.origin}${location.pathname}?perfil=${encodeURIComponent(id)}`;
}
async function copyText(text){
  let ok=false;
  try{await navigator.clipboard.writeText(text);ok=true}catch{}
  if(!ok){
    const t=document.createElement('textarea');
    t.value=text;t.style.cssText='position:fixed;opacity:0';
    document.body.appendChild(t);t.select();
    try{document.execCommand('copy');ok=true}catch{}
    t.remove();
  }
  toast(ok?'Copiado al portapapeles.':'Copia a mano: '+text,ok?'ok':'warn',6000);
  return ok;
}
function shareProfile(id){
  const p=P[id]||{id};
  const code=profileCode(p);
  const url=profileShareUrl(id);
  document.getElementById('shareProfileDlg')?.remove();
  const d=document.createElement('div');
  d.id='shareProfileDlg';d.className='preview';
  d.onclick=e=>{if(e.target===d)d.remove()};
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:13px">
    <div class="row"><b class="grow" style="font-family:Syne;font-size:19px">
      <i class="fa-solid fa-share-nodes" style="color:var(--ac)"></i> Compartir perfil</b>
      <button class="sm" onclick="document.getElementById('shareProfileDlg').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="row">${av(p,44)}<div class="grow"><b>${esc(p.name||'Perfil')}</b>
      <div class="mu">Comparte su enlace o su código de invitación.</div></div></div>
    <div class="field"><label>Código de invitación</label>
      <div class="row"><input value="${esc(code)}" readonly onclick="this.select()">
        <button class="p sm" data-copy="${esc(code)}" onclick="copyText(this.dataset.copy)"><i class="fa-solid fa-copy"></i></button></div></div>
    <div class="field"><label>Enlace del perfil</label>
      <div class="row"><input value="${esc(url)}" readonly onclick="this.select()">
        <button class="p sm" data-copy="${esc(url)}" onclick="copyText(this.dataset.copy)"><i class="fa-solid fa-link"></i></button></div></div>
    <p class="mu" style="margin:0;font-size:12px">También puedes buscar este perfil en <b>Explorar</b> escribiendo su nick o su código de invitación.</p>
    ${COLS.profiles.has('profile_code')?'':'<p class="mu" style="margin:0;font-size:12px">Para activar los códigos de invitación ejecuta <b>sql/10-codigo-perfil-compartir.sql</b>.</p>'}
    <button class="p" data-copy="${esc(url)}" onclick="copyText(this.dataset.copy)"><i class="fa-solid fa-copy"></i> Copiar enlace del perfil</button>
  </div></div>`;
  document.body.appendChild(d);
}
function sharePost(id){
  const url=`${location.origin}${location.pathname}?post=${encodeURIComponent(id)}`;
  document.getElementById('sharePostDlg')?.remove();
  const d=document.createElement('div');
  d.id='sharePostDlg';d.className='preview';
  d.onclick=e=>{if(e.target===d)d.remove()};
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:13px">
    <div class="row"><b class="grow" style="font-family:Syne;font-size:19px">
      <i class="fa-solid fa-share-nodes" style="color:var(--ac)"></i> Compartir publicación</b>
      <button class="sm" onclick="document.getElementById('sharePostDlg').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <p class="mu" style="margin:0">Quien abra el enlace verá únicamente esta publicación y podrá comentarla.</p>
    <div class="field"><label>Enlace de la publicación</label>
      <input value="${esc(url)}" readonly onclick="this.select()"></div>
    <button class="p" data-copy="${esc(url)}" onclick="copyText(this.dataset.copy)"><i class="fa-solid fa-copy"></i> Copiar enlace</button>
  </div></div>`;
  document.body.appendChild(d);
}
async function openProfileByCode(code){
  const c=String(code||'').trim();
  if(!c||OFFLINE)return;
  let row=null;
  if(COLS.profiles.has('profile_code')){
    const{data}=await sb.from('profiles').select(PROFSEL()).ilike('profile_code',c).limit(1);
    row=(data||[])[0]||null;
  }
  if(!row){
    const{data}=await sb.from('profiles').select(PROFSEL()).ilike('uid',c).limit(1);
    row=(data||[])[0]||null;
  }
  if(!row)return toast('No encontré ningún perfil con ese código.','warn',6000);
  P[row.id]=fx(row);
  if(row.id===me.id)PEEK=true;
  openProfile(row.id);
}
function handleDeepLink(){
  const u=new URLSearchParams(location.search);
  const post=u.get('post');
  if(post){openSharedPost(post);return true}
  const pid=u.get('perfil');
  if(pid){if(pid===me.id)PEEK=true;openProfile(pid);return true}
  const code=u.get('code');
  if(code){openProfileByCode(code);return true}
  return false;
}
function closeSharedPost(){
  try{history.replaceState({},'',location.pathname)}catch{}
  go('feed');
}
async function openSharedPost(id){
  if(!id)return;
  stopProfileMusic();leaveVoice();view='post';cur=null;setMobileTitle('post');
  document.querySelectorAll('#rail button').forEach(b=>b.classList.remove('on'));
  $('app').classList.add('ns');$('side').innerHTML='';
  document.body.classList.add('open');
  $('main').innerHTML=`<div class="feed wide">
    <div class="row" style="margin-bottom:10px">
      <button class="sm" onclick="closeSharedPost()"><i class="fa-solid fa-arrow-left"></i> Volver al inicio</button>
      <div class="grow"></div>
      <button class="sm" onclick="sharePost('${esc(id)}')"><i class="fa-solid fa-share-nodes"></i> Compartir</button>
    </div>
    <div id="sharedPost"><div class="empty">Cargando publicación…</div></div></div>`;
  renderFabs();tintSoon();
  if(OFFLINE){
    const rows=cacheRead(me&&me.id,'posts',[])||[];
    const p=rows.find(x=>x.id===id);
    if(!p){$('sharedPost').innerHTML=empty('Sin conexión: esta publicación no está guardada.');return}
    $('sharedPost').innerHTML=postHtml(p);
    tintSoon();
    const box=$('c'+id);if(box){box.dataset.o=1;drawC(id)}
    return;
  }
  let{data:p,error}=await sb.from('posts').select(POSTSEL()).eq('id',id).maybeSingle();
  if(error&&embedBroken(error)&&NEWOK){
    NEWOK=false;schemaBar();
    ({data:p,error}=await sb.from('posts').select(SEL_SHORT).eq('id',id).maybeSingle());
  }
  if(error||!p){$('sharedPost').innerHTML=empty('La publicación no existe o ya fue borrada.');return}
  p={...p,comments:p.comments||[],likes:p.likes||[],poll_votes:p.poll_votes||[],reactions:p.reactions||[]};
  await prof([p.author]);
  if(p.community_id){await loadComms([p.community_id]);await cpNick([p])}
  const author=P[p.author];
  if(author)await loadShopCache([author.frame_id,author.bubble_id]);
  $('sharedPost').innerHTML=postHtml(p);
  tintSoon();
  const box=$('c'+id);
  if(box){box.dataset.o=1;await drawC(id)}
  renderFabs();tintSoon();
}
/* ---------- Logros del perfil ---------- */
async function achvDlg(id){
  const p=P[id]||{id};
  document.getElementById('achvDlg')?.remove();
  const d=document.createElement('div');
  d.id='achvDlg';d.className='preview';
  d.onclick=e=>{if(e.target===d)d.remove()};
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:13px">
    <div class="row"><b class="grow" style="font-family:Syne;font-size:19px">
      <i class="fa-solid fa-trophy" style="color:var(--ac)"></i> Logros</b>
      <button class="sm" onclick="document.getElementById('achvDlg').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="row">${av(p,44)}<div class="grow"><b>${esc(p.name||'Perfil')}</b>
      <div class="mu">Nivel ${lvOf(p.xp||0)} · ${titleOf(lvOf(p.xp||0))}</div></div></div>
    <div id="achvBody"><div class="mu">Cargando logros…</div></div>
  </div></div>`;
  document.body.appendChild(d);
  const one=async(fn,fallback=null)=>{try{const{data,error}=await fn();return error?fallback:data}catch{return fallback}};
  const count=async(fn)=>{try{const{count,error}=await fn();return error?0:(count||0)}catch{return 0}};
  const[bd,pc,fc,lc,ch,pet]=await Promise.all([
    one(()=>sb.from('badges').select('*').eq('user_id',id).order('awarded_at',{ascending:false}),[]),
    count(()=>sb.from('posts').select('id',{count:'exact',head:true}).eq('author',id)),
    count(()=>sb.from('follows').select('follower_id',{count:'exact',head:true}).eq('following_id',id)),
    count(()=>sb.from('profile_likes').select('user_id',{count:'exact',head:true}).eq('profile_id',id)),
    count(()=>sb.from('characters').select('id',{count:'exact',head:true}).eq('owner',id)),
    count(()=>sb.from('pets').select('id',{count:'exact',head:true}).eq('owner',id))
  ]);
  const body=$('achvBody');if(!body)return;
  const n=x=>Number(x||0);
  body.innerHTML=`<div class="wbal" style="grid-template-columns:repeat(3,minmax(0,1fr))">
      <div class="wstat"><span>Nivel</span><b>${lvOf(p.xp||0)}</b></div>
      <div class="wstat"><span>Me gusta</span><b>${n(lc)}</b></div>
      <div class="wstat"><span>Publicaciones</span><b>${n(pc)}</b></div>
      <div class="wstat"><span>Seguidores</span><b>${n(fc)}</b></div>
      <div class="wstat"><span>Personajes</span><b>${n(ch)}</b></div>
      <div class="wstat"><span>Mascotas</span><b>${n(pet)}</b></div>
    </div>
    <div><div class="mu" style="margin-bottom:6px">Insignias conseguidas</div>
      ${(bd||[]).length?`<div class="row w">${bd.map(b=>`<span class="tag"><i class="${esc(b.icon||'fa-solid fa-award')}"></i> ${esc(b.label||'Insignia')}</span>`).join('')}</div>`
        :'<p class="mu" style="margin:0">Todavía no tiene insignias. Se consiguen publicando, recibiendo me gusta y participando en comunidades.</p>'}
    </div>`;
}
/* ---------- Ranking: me gusta y ventas ---------- */
async function rankDlg(id){
  const p=P[id]||{id};
  document.getElementById('rankDlg')?.remove();
  const d=document.createElement('div');
  d.id='rankDlg';d.className='preview';
  d.onclick=e=>{if(e.target===d)d.remove()};
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:13px">
    <div class="row"><b class="grow" style="font-family:Syne;font-size:19px">
      <i class="fa-solid fa-ranking-star" style="color:var(--ac)"></i> Ranking</b>
      <button class="sm" onclick="document.getElementById('rankDlg').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="row">${av(p,44)}<div class="grow"><b>${esc(p.name||'Perfil')}</b>
      <div class="mu">Posición por me gusta y por ventas de la tienda.</div></div></div>
    <div id="rankBody"><div class="mu">Calculando posición…</div></div>
  </div></div>`;
  document.body.appendChild(d);
  const safe=async(fn,fallback=[])=>{try{const{data,error}=await fn();return error?fallback:(data||[])}catch{return fallback}};
  const[likesRows,shopRows]=await Promise.all([
    safe(()=>sb.from('profile_likes').select('profile_id').limit(5000),[]),
    safe(()=>sb.from('shop_items').select('creator,sold').limit(500),[])
  ]);
  const likeMap=new Map(),salesMap=new Map();
  for(const r of likesRows){if(r&&r.profile_id)likeMap.set(r.profile_id,(likeMap.get(r.profile_id)||0)+1)}
  for(const r of shopRows){if(r&&r.creator)salesMap.set(r.creator,(salesMap.get(r.creator)||0)+(Number(r.sold)||0))}
  const likeArr=[...likeMap.entries()].map(([uid,n])=>({id:uid,n})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
  const salesArr=[...salesMap.entries()].map(([uid,n])=>({id:uid,n})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n);
  const ids=[...new Set([...likeArr.slice(0,6).map(x=>x.id),...salesArr.slice(0,6).map(x=>x.id),id])];
  await prof(ids);
  const section=(arr,title,icon,unit)=>{
    const pos=arr.findIndex(x=>x.id===id)+1;
    const top=arr.slice(0,6);
    return `<div class="card" style="padding:12px;display:grid;gap:8px">
      <div class="row"><b class="grow"><i class="fa-solid ${icon}" style="color:var(--ac)"></i> ${title}</b>
        <span class="tag">${pos?'#'+pos:'Sin posición'}</span></div>
      ${top.length?top.map((x,i)=>`<div class="topitem" onclick="document.getElementById('rankDlg')?.remove();openProfile('${x.id}')">
        <b class="toprank">#${i+1}</b>${av(P[x.id]||{id:x.id},30)}
        <div class="grow"><b>${esc((P[x.id]||{}).name||'?')}</b><div class="mu">${x.n} ${unit}</div></div>
        ${x.id===id?'<span class="tag" style="color:var(--ac)">Tú</span>':''}</div>`).join('')
        :'<p class="mu" style="margin:0">Todavía no hay datos para este ranking.</p>'}
      ${pos>6?`<div class="mu">${id===me.id?'Tu posición':'Su posición'}: <b>#${pos}</b> · ${arr[pos-1].n} ${unit}</div>`:''}
    </div>`;
  };
  const body=$('rankBody');if(!body)return;
  body.innerHTML=`${section(likeArr,'Ranking por me gusta','fa-heart','me gusta')}
    ${section(salesArr,'Ranking por ventas','fa-bag-shopping','ventas')}`;
}
async function openProfile(id){
  if(!id)return;
  /* «Ver como los demás»: antes, abrir el propio perfil rebotaba a «Mi
     perfil» y no enseñaba nada. Con PEEK se muestra la vista pública. */
  if(id===me.id&&!PEEK)return go('me');
  if(OFFLINE)return offlineProfile(id);
  stopProfileMusic();
  PEEK=false;PROFILE_LOCKED=false;
  leaveVoice();view='prof';PROF=id;setMobileTitle('prof');
  /* Al salir de un chat con fondo propio, el perfil no debe heredarlo. */
  try{const m=$('main');if(m&&m.nodeType){m.removeAttribute('data-theme');m.style.cssText=''}}catch{}
  document.querySelectorAll('#rail button').forEach(b=>b.classList.remove('on'));
  /* El perfil no usa el panel lateral de chats. En móvil #main solo se ve con
     body.open; en PC #app.ns oculta #side y deja el perfil a todo el ancho. */
  $('app').classList.add('ns');$('side').innerHTML='';
  document.body.classList.add('open');
  renderFabs();tintSoon();
  $('main').innerHTML='<div class="empty">Cargando…</div>';
  const{data:p,error}=await sb.from('profiles').select(PROFSEL()).eq('id',id).maybeSingle();
  if(error||!p){PROFILE_LOCKED=true;$('main').innerHTML=empty('Perfil no disponible.');renderFabs();return}
  const t=fx(p);P[id]=t;
  /* Perfil privado: si no lo sigues, no puedes verlo. */
  if(p.is_private&&id!==me.id){
    const{data:f}=NEWOK?await sb.from('follows').select('*').eq('follower_id',me.id).eq('following_id',p.id).maybeSingle():{data:null};
    if(!f){
      $('main').innerHTML=`<div class="feed"><div class="card" style="text-align:center;display:grid;gap:10px;justify-items:center">
        ${av({...p,avatar:null},72)}
        <h3>${esc(p.name)}</h3>
        <p class="mu"><i class="fa-solid fa-lock"></i> Este perfil es privado.</p>
        <button class="p" onclick="toggleFollow('${id}',false)"><i class="fa-solid fa-user-plus"></i> Solicitar seguimiento</button>
        <button class="sm" onclick="openDM('${id}')"><i class="fa-solid fa-envelope"></i> Enviarle un mensaje</button></div></div>`;
      PROFILE_LOCKED=true;
      renderFabs();tintSoon();
      return;
    }
  }
  await loadShopCache([p.frame_id,p.bubble_id]);
  const q=async(sel,...rest)=>{
    if(!NEWOK)return{count:0,data:null};
    const{data,error,count}=await sel(...rest);
    if(isMissing(error))return{count:0,data:null};
    /* Para select(..., {count:'exact', head:true}) PostgREST devuelve el
       total en `count`, no en `data` (data es null). Antes se usaba data y
       por eso Seguidores/Siguiendo/Publicaciones salían siempre en 0. */
    return{count:count??(Array.isArray(data)?data.length:0),data};
  };
  let fc=0,gc=0,pc=0;
  if(NEWOK){
    ({count:fc}=await q(s=>sb.from('follows').select('follower_id',{count:'exact',head:true}).eq('following_id',id)));
    ({count:gc}=await q(s=>sb.from('follows').select('follower_id',{count:'exact',head:true}).eq('follower_id',id)));
  }
  ({count:pc}=await q(s=>sb.from('posts').select('id',{count:'exact',head:true}).eq('author',id)));
  const{data:mine}=NEWOK
    ? await sb.from('follows').select('*').eq('follower_id',me.id).eq('following_id',id).maybeSingle()
    :{data:null};
  const{data:bd}=NEWOK
    ? await sb.from('badges').select('*').eq('user_id',id).order('awarded_at',{ascending:false})
    :{data:[]};
  /* Me gusta del perfil, mascotas y personajes. Cada consulta es tolerante:
     si la migración sql/02 todavía no está aplicada, la vista sigue igual. */
  let likes=0,liked=false,pets=[];
  if(NEWOK){
    const[lk,ml,pt]=await Promise.all([
      sb.from('profile_likes').select('user_id',{count:'exact',head:true}).eq('profile_id',id),
      sb.from('profile_likes').select('profile_id').eq('profile_id',id).eq('user_id',me.id).maybeSingle(),
      sb.from('pets').select('*').eq('owner',id).order('created_at',{ascending:true}).limit(12)
    ]);
    if(!isMissing(lk.error))likes=lk.count||0;
    if(!isMissing(ml.error))liked=!!ml.data;
    if(!isMissing(pt.error))pets=pt.data||[];
  }
  await chars(pets.map(x=>{
    const s=String(x.species||'');
    return s.startsWith('char:')?s.slice(5):null;
  }).filter(Boolean));
  const lv=lvOf(p.xp);
  $('main').innerHTML=`
    <div class="banner" style="min-height:190px;background-image:linear-gradient(rgba(9,9,10,.15),rgba(9,9,10,.85))${p.bg?`,url('${esc(p.bg)}')`:''}">
      ${petBannerHtml(pets,likes,id)}
    </div>
    <div class="profiletop" style="padding:0 18px;display:grid;gap:12px;max-width:820px;width:100%;margin-left:auto;margin-right:auto">
      <div class="row w" style="align-items:flex-end">
        ${meAvatar(t,96,'profAvatar')}
        <div class="grow"><h2>${esc(p.name)}</h2>
          <div class="row w"><span class="lv">Nivel ${lv} · ${titleOf(lv)}</span>
          ${p.gender?`<span class="tag">${esc(p.gender)}</span>`:''}${p.age?`<span class="tag">${p.age} años</span>`:''}</div>
        </div>
        <div class="row w">
          ${id===me.id?'':`<button class="${mine?'d':'p'}" onclick="toggleFollow('${id}',${!!mine})"><i class="fa-solid fa-${mine?'user-check':'user-plus'}"></i> ${mine?'Siguiendo':'Seguir'}</button>
          <button class="sm" style="${liked?'border-color:var(--ac);color:var(--ac)':''}" onclick="${liked?'unlikeProfile':'likeProfile'}('${id}')" title="Me gusta · alimenta a sus mascotas"><i class="fa-${liked?'solid':'regular'} fa-heart"></i> ${likes||0}</button>
          <button class="sm" onclick="sendCoinsDlg('gift','${id}')" title="Regalar monedas T"><i class="fa-solid fa-gift"></i></button>
          <button class="sm" onclick="openDM('${id}')" title="Enviar mensaje"><i class="fa-solid fa-envelope"></i></button>
          <button class="sm" onclick="blockDlg('${id}')" title="Bloquear"><i class="fa-solid fa-ban"></i></button>
          <button class="sm" onclick="report('target_user','${id}')" title="Reportar"><i class="fa-solid fa-flag"></i></button>`}
          <button class="sm" onclick="achvDlg('${id}')" title="Logros"><i class="fa-solid fa-trophy"></i></button>
          <button class="sm" onclick="rankDlg('${id}')" title="Ranking de ventas y me gusta"><i class="fa-solid fa-ranking-star"></i></button>
          <button class="sm" onclick="shareProfile('${id}')" title="Compartir perfil"><i class="fa-solid fa-share-nodes"></i></button>
          ${id===me.id?`<button class="sm" onclick="petDlg()" title="Gestionar mascotas"><i class="fa-solid fa-paw"></i></button>`:''}
        </div></div>
      <div class="card">
        <div class="row"><button onclick="ftab('posts',${pc||0})"><b>${pc||0}</b> Publicaciones</button>
          <button onclick="ftab('followers')"><b>${fc||0}</b> Seguidores</button>
          <button onclick="ftab('following')"><b>${gc||0}</b> Siguiendo</button></div>
        ${p.bio?`<div class="pre">${esc(p.bio)}</div>`:''}
        ${(p.links||'').trim()?`<div class="row w">${soc(p.links)}</div>`:''}
        <div class="row w"><span class="tag"><i class="fa-solid fa-fire"></i> ${p.xp||0} XP</span><span class="tag"><i class="fa-solid fa-coins"></i> ${p.coins||0} monedas</span>
          <span class="tag" title="Código de invitación"><i class="fa-solid fa-ticket"></i> ${esc(profileCode(p))}</span></div>
        ${(bd||[]).length?`<div class="row w">${bd.map(b=>`<span class="tag" title="${esc(b.label)}"><i class="${esc(b.icon)}"></i> ${esc(b.label)}</span>`).join('')}</div>`:''}
      </div>
      ${playlistCardHtml(p.playlist,id===me.id)}
      <div id="pwall"></div>
      <div class="row w" style="justify-content:center">
        <button class="sm" onclick="ftab('posts')"><i class="fa-solid fa-images"></i> Publicaciones</button>
        <button class="sm" onclick="ftab('books')"><i class="fa-solid fa-book-open"></i> Libros</button>
      </div>
      <div id="pl" class="mas"></div>
    </div>`;
  drawWall();loadProfPosts();
  startProfileMusic(p.playlist);
  renderFabs();tintSoon();
}
async function toggleFollow(id,following){
  if(!NEWOK)return toast('Seguir necesita <b>'+SQL_FIX+'</b>.','warn',6000);
  const{error}=following
    ? await sb.from('follows').delete().eq('follower_id',me.id).eq('following_id',id)
    : await sb.from('follows').insert({follower_id:me.id,following_id:id});
  if(error)return toast(error.message,'err');
  if(!following)notify(id,'follow',(me.name||'Alguien')+' empezó a seguirte.');
  toast(following?'Dejaste de seguir.':'Ahora sigues a '+((P[id]||{}).name||'esa persona'));
  openProfile(id);
}

/* ---------- Bienvenida ----------
   Se muestra solo cuando se registra o inicia sesión, no en cada recarga. */
function welcomeDlg(){
  if(document.getElementById('welcome'))return;
  const d=document.createElement('div');
  d.id='welcome';d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card welcomecard">
    <div class="welcomeico"><i class="fa-solid fa-dove"></i></div>
    <span class="tag" style="justify-self:center"><i class="fa-solid fa-fire"></i> The Black List</span>
    <h2>Aquí eres libre.</h2>
    <p>Bienvenido. Dentro de esta red social puedes publicar cualquier cosa:
      no hay un tema en específico, es un espacio para sentirte libre.
      Crea, personaliza con nosotros y construye tus comunidades.</p>
    <div class="welcomegrid">
      <div><i class="fa-solid fa-pen-nib"></i><span>Publica lo que quieras, sin tema fijo.</span></div>
      <div><i class="fa-solid fa-people-group"></i><span>Crea y personaliza tus comunidades.</span></div>
      <div><i class="fa-solid fa-masks-theater"></i><span>Añade personajes a tu perfil.</span></div>
      <div><i class="fa-solid fa-heart"></i><span>Da me gusta y alimenta mascotas.</span></div>
    </div>
    <button class="p" onclick="closeWelcome()"><i class="fa-solid fa-door-open"></i> Entrar y explorar</button>
  </div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
}
function closeWelcome(){document.getElementById('welcome')?.remove()}

/* ---------- Me gusta de perfil + mascotas ----------
   Un me gusta en el perfil alimenta a las mascotas de esa persona. El
   servidor es quien suma energía y XP; el navegador solo llama a la RPC. */
const PET_ICONS={gato:'🐱',perro:'🐶',conejo:'🐰',zorro:'🦊',dragon:'🐲',ave:'🐦',otro:'🐾'};
let PET_OWNER=null;
function petIcon(s){
  const x=String(s||'').toLowerCase();
  if(x.includes('gato'))return '🐱';
  if(x.includes('perro'))return '🐶';
  if(x.includes('conejo'))return '🐰';
  if(x.includes('zorro'))return '🦊';
  if(x.includes('drag'))return '🐲';
  if(x.includes('ave')||x.includes('pájaro')||x.includes('pajaro'))return '🐦';
  return PET_ICONS[x]||'🐾';
}
function petChar(p){
  const s=String((p&&p.species)||'');
  return s.startsWith('char:')?(C[s.slice(5)]||null):null;
}
function petCharId(p){
  const s=String((p&&p.species)||'');
  return s.startsWith('char:')?s.slice(5):null;
}
function petAvatar(p){
  const c=petChar(p);
  if(c)return `<span class="petavatarbox">${av({...c,id:''},46,'petav')}</span>`;
  return `<span class="petemoji">${petIcon(p.species)}</span>`;
}
function petLv(xp){return Math.max(1,Math.floor((Number(xp)||0)/10)+1)}
function petEnergy(p){return Math.max(0,Math.min(100,Number(p.energy)||0))}
/* La mascota del perfil vive en el banner. Solo se pinta si está creada a
   partir de un personaje de la colección. Crece con los me gusta y, a partir
   de cierto nivel y actividad, se mueve por todo el banner. */
function profileHash(id){
  let h=2166136261;
  for(const ch of String(id||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
  return h>>>0;
}
function petBannerHtml(pets,likes,profileId){
  const pet=(pets||[]).find(p=>p&&petChar(p));
  if(!pet)return '';
  const lv=petLv(pet.xp);
  const n=Math.max(0,Number(likes)||0);
  const side=profileHash(profileId)%2?'left':'right';
  const ps=Math.min(1.55,0.86+Math.min(0.42,n*0.018)+Math.min(0.18,(lv-1)*0.025)).toFixed(2);
  const roam=n>=5&&lv>=2;
  let vars=`--ps:${ps}`;
  if(roam){
    const span=Math.min(360,Math.max(130,Math.round((typeof window!=='undefined'?window.innerWidth:800)*0.38)));
    const sign=side==='left'?1:-1;
    const rnd=(a,b)=>Math.round(a+Math.random()*(b-a));
    const x1=sign*rnd(Math.round(span*.25),Math.round(span*.5));
    const x2=sign*rnd(Math.round(span*.45),span);
    const x3=sign*rnd(Math.round(span*.2),Math.round(span*.75));
    vars+=`;--x1:${x1}px;--y1:${rnd(0,34)}px;--x2:${x2}px;--y2:${rnd(18,64)}px;--x3:${x3}px;--y3:${rnd(0,48)}px`;
  }
  return `<div class="petbanner ${side}${roam?' roam':''}" style="${vars}"
    title="${esc(pet.name||'Mascota')} · Nivel ${lv} · ${n} me gusta">
    ${petAvatar(pet)}
    <div class="petmeta"><b>${esc(pet.name||'Mascota')}</b><small>Nv ${lv} · ${n} me gusta</small></div>
  </div>`;
}
function petRowsHtml(pets,manage){
  const list=pets||[];
  if(!list.length)return '<div class="mu">Todavía no hay mascotas.</div>';
  return list.map(p=>{
    const c=petChar(p);
    const sub=c?`${esc(c.race||'Personaje')}${c.age?' · '+esc(c.age):''}`
      :(petCharId(p)?'Personaje':'')+(!petCharId(p)&&p.species?esc(p.species):'');
    return `<div class="pet">
      ${petAvatar(p)}
      <div class="grow"><b>${esc(p.name)}</b>
        <div class="mu">Nv ${petLv(p.xp)} · ${sub} · ${petEnergy(p)}% energía</div>
        <div class="petbar"><i style="width:${petEnergy(p)}%"></i></div></div>
      ${manage?`<button class="sm" onclick="renamePet('${p.id}')" title="Renombrar"><i class="fa-solid fa-pen"></i></button>
        <button class="sm d" onclick="delPet('${p.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>`:''}
    </div>`;
  }).join('');
}
function petCardHtml(pets,manage){
  const list=pets||[];
  if(!list.length&&!manage)return '';
  return `<div class="card petcard">
    <div class="row"><b class="grow"><i class="fa-solid fa-paw" style="color:var(--ac)"></i> Mascotas</b>
      ${manage?`<button class="p sm" onclick="petDlg()"><i class="fa-solid fa-${list.length?'paw':'plus'}"></i> ${list.length?'Gestionar':'Crear mascota'}</button>`:''}</div>
    ${list.length?`<div class="petgrid">${petRowsHtml(list,false)}</div>`
      :`<p class="mu" style="margin:0">Aún no tienes mascota. Se crean con los <b>personajes</b> de tu colección y los <b>me gusta</b> de tu perfil les dan energía y XP.</p>`}
  </div>`;
}
async function drawMyPets(){
  const box=$('mypets');if(!box)return;
  const{data,error}=await sb.from('pets').select('*').eq('owner',me.id).order('created_at');
  if(error){
    box.innerHTML=isMissing(error)?`<div class="card"><p class="mu" style="margin:0">Las mascotas necesitan
      <b>sql/02-perfil-likes-mascotas.sql</b>.</p></div>`:'';
    renderFabs();tintSoon();
    return;
  }
  await chars((data||[]).map(petCharId).filter(Boolean));
  box.innerHTML=petCardHtml(data||[],true);
  renderFabs();tintSoon();
}
/* Compatibilidad con instalaciones antiguas que todavía tengan el botón
   flotante #fabPet: ahora solo se muestra en el perfil propio y abre la
   misma gestión de mascotas. */
function openPetsFab(){petDlg()}
async function petDlg(owner){
  PET_OWNER=owner||me.id;
  document.getElementById('petdlg')?.remove();
  const mine=PET_OWNER===me.id;
  /* La colección de personajes se carga aquí para que el selector esté
     siempre al día aunque el usuario acabe de crear uno en la tienda. */
  if(mine){
    const{data}=await sb.from('characters').select('id,name,avatar,owner,race,age')
      .eq('owner',me.id).order('created_at',{ascending:false});
    MY=data||[];MY.forEach(c=>C[c.id]=c);
  }
  const d=document.createElement('div');
  d.id='petdlg';d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card petmodal">
    <div class="row"><b class="grow"><i class="fa-solid fa-paw" style="color:var(--ac)"></i> Mascotas</b>
      <button class="sm" onclick="document.getElementById('petdlg').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <p class="mu" style="margin:0">Cada me gusta en el perfil alimenta a las mascotas:
      +5 energía y +1 XP, como máximo una vez por hora.</p>
    <div id="petlist" class="petgrid"></div>
    ${mine?`<div class="petadd">
      <div class="mu"><i class="fa-solid fa-masks-theater" style="color:var(--ac)"></i>
        Solo puedes crear mascotas con <b>personajes de tu colección</b>.
        ${MY.length?'':'<br>Primero crea uno en Tienda → Personajes.'}</div>
      ${MY.length?`<div class="row"><select id="petchar">
          ${MY.map(c=>`<option value="${c.id}">${esc(c.name)}${c.race?' · '+esc(c.race):''}</option>`).join('')}
        </select>
        <button class="p" onclick="addPet()"><i class="fa-solid fa-plus"></i> Añadir</button></div>`
        :`<button class="p" onclick="document.getElementById('petdlg')?.remove();setShopTab('personajes');go('chars')"><i class="fa-solid fa-masks-theater"></i> Crear un personaje primero</button>`}
    </div>`:''}
  </div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
  await drawPetList();
}
async function drawPetList(){
  const box=$('petlist');if(!box)return;
  box.innerHTML='<div class="mu">Cargando…</div>';
  const{data,error}=await sb.from('pets').select('*').eq('owner',PET_OWNER).order('created_at');
  if(error){box.innerHTML=isMissing(error)?'<div class="mu">Falta ejecutar <b>sql/02-perfil-likes-mascotas.sql</b>.</div>':esc(error.message);return}
  await chars((data||[]).map(petCharId).filter(Boolean));
  box.innerHTML=petRowsHtml(data||[],PET_OWNER===me.id);
}
async function addPet(){
  const cid=val('petchar');
  if(!cid)return toast('Elige un personaje de tu colección.','err');
  /* Se comprueba contra la base de datos y contra el dueño: C puede tener
     personajes de otros perfiles que se vieron antes. */
  const{data:c,error:cErr}=await sb.from('characters')
    .select('id,name,avatar,race,age').eq('id',cid).eq('owner',me.id).maybeSingle();
  if(cErr||!c)return toast('Ese personaje no está en tu colección.','err');
  const{data:existing,error:exErr}=await sb.from('pets').select('id,species').eq('owner',me.id);
  if(exErr)return toast(isMissing(exErr)?'Falta ejecutar <b>sql/02-perfil-likes-mascotas.sql</b>.':explain(exErr),'err',9000);
  if((existing||[]).some(p=>petCharId(p)===cid))
    return toast('Ese personaje ya tiene su mascota.','warn');
  if((existing||[]).length>=6)return toast('Puedes tener hasta 6 mascotas.','warn');
  const{error}=await sb.from('pets').insert({owner:me.id,name:c.name,species:'char:'+cid});
  if(error)return toast(isMissing(error)?'Falta ejecutar <b>sql/02-perfil-likes-mascotas.sql</b>.':explain(error),'err',9000);
  toast('Mascota creada con '+c.name+'. ¡Pide un me gusta para alimentarla!','ok');
  drawPetList();drawMyPets();
}
async function renamePet(id){
  const p=prompt('Nuevo nombre para la mascota:');
  if(!p||!p.trim())return;
  const{error}=await sb.from('pets').update({name:p.trim().slice(0,40)}).eq('id',id);
  if(error)return toast(explain(error),'err');
  toast('Mascota actualizada.','ok');drawPetList();drawMyPets();
}
async function delPet(id){
  if(!await ask())return;
  const{error}=await sb.from('pets').delete().eq('id',id);
  if(error)return toast(explain(error),'err');
  toast('Mascota eliminada.','ok');drawPetList();drawMyPets();
}
async function likeProfile(id){
  if(!id||id===me.id)return;
  const{data,error}=await sb.rpc('like_profile',{p_target:id});
  if(error){
    if(isNoFn(error))return toast('Los me gusta de perfil necesitan <b>sql/02-perfil-likes-mascotas.sql</b>.','warn',11000);
    return toast(explain(error),'err');
  }
  toast(data&&data.fed?'Me gusta enviado. ¡Sus mascotas han comido!':'Me gusta enviado.','ok');
  openProfile(id);
}
async function unlikeProfile(id){
  const{error}=await sb.rpc('unlike_profile',{p_target:id});
  if(error){
    if(isNoFn(error))return toast('Los me gusta de perfil necesitan <b>sql/02-perfil-likes-mascotas.sql</b>.','warn',11000);
    return toast(explain(error),'err');
  }
  toast('Me gusta retirado.','ok');
  openProfile(id);
}
async function ftab(t){
  const b=$('pl');if(!b)return;
  if(t=='posts')return loadProfPosts();
  if(t=='chars'){
    /* La gestión de personajes vive solo en Mi mochila. */
    setMeTab('shop');return go('me');
  }
  if(t=='books'){
    b.className='shop';b.style.padding='0';
    b.style.gridTemplateColumns='repeat(auto-fill,minmax(170px,1fr))';
    const{data}=await sb.from('books').select('*').eq('author',PROF).eq('is_public',true)
      .order('updated_at',{ascending:false});
    b.innerHTML=(data||[]).length?(data||[]).map(x=>`<div class="bookc" onclick="readBook('${x.id}')">
      <div class="bcv" style="${x.cover?`background-image:url('${esc(x.cover)}')`:''}"><span class="bct">${esc(x.title)}</span></div>
      <div class="brb"><div class="mu">${esc(x.genre||'')}</div></div></div>`).join('')
      :empty('Sin libros publicados.');
    return;
  }
  b.className='grid';b.style.padding='0';b.style.gridTemplateColumns='';
  const isFollowers=t=='followers';
  const{data}=await sb.from('follows').select('*')
    .eq(isFollowers?'following_id':'follower_id',PROF);
  const ids=[...new Set((data||[]).map(x=>isFollowers?x.follower_id:x.following_id))].filter(notBlocked);
  await prof(ids);
  b.innerHTML=ids.length?ids.map(i=>`<div class="rc" onclick="openProfile('${i}')"><div class="rb row">${av(P[i],40)}
      <div class="grow"><b style="color:${esc((P[i]||{}).accent||'')}">${esc((P[i]||{}).name||'?')}</b><div class="mu">Ver perfil</div></div></div></div>`).join(''):empty('Nadie todavía.');
}
async function loadProfPosts(){
  const b=$('pl');if(!b)return;b.className='mas';b.style.padding='0';b.style.gridTemplateColumns='';
  if(OFFLINE){
    const rows=cacheRead(me&&me.id,'profileposts_'+PROF,[])||[];
    b.innerHTML=rows.length?rows.map(postHtml).join(''):empty('No hay publicaciones guardadas de este perfil.');tintSoon();
    return;
  }
  let{data,error}=await sb.from('posts').select(POSTSEL()).eq('author',PROF).order('created_at',{ascending:false}).limit(40);
  if(error&&embedBroken(error)&&NEWOK){
    NEWOK=false;schemaBar();
    ({data,error}=await sb.from('posts').select(SEL_SHORT).eq('author',PROF).order('created_at',{ascending:false}).limit(40));
  }
  if(error){
    if(isNetError(error)){OFFLINE=true;return loadProfPosts()}
    return(b.innerHTML=empty(esc(error.message)));
  }
  const rows=(data||[]).filter(p=>notBlocked(p.id||p.author));
  await prof(rows.map(p=>p.author));await loadComms(rows.map(p=>p.community_id));await cpNick(rows);
  cacheWrite('profileposts_'+PROF,rows.slice(0,40));
  b.innerHTML=rows.length?rows.map(postHtml).join(''):empty('Sin publicaciones todavía.');tintSoon();
}
/* Apodo dentro de la comunidad: se consulta aparte para no depender de que
   PostgREST infiera la relación FK entre posts y community_profiles. */
async function cpNick(rows){
  if(!NEWOK)return;
  const cids=[...new Set(rows.map(p=>p.community_id).filter(Boolean))];
  const uids=[...new Set(rows.map(p=>p.author))];
  if(!cids.length||!uids.length)return;
  const{data}=await sb.from('community_profiles').select('community_id,user_id,nickname,role').in('community_id',cids).in('user_id',uids);
  (data||[]).forEach(x=>CP[x.community_id+x.user_id]=x);
}
/* ---------- Comunidades: caché de datos y actividad ----------
   COMM guarda lo mínimo de cada comunidad para saber si una publicación
   debe mostrarse oculta (NSFW) sin hacer una consulta por publicación. */
async function loadComms(ids){
  ids=[...new Set(ids)].filter(i=>i&&!COMM[i]);
  if(!ids.length||OFFLINE)return;
  const sel='id,name,cover,banner,theme'+(COLS.communities.has('nsfw')?',nsfw':'');
  const{data,error}=await sb.from('communities').select(sel).in('id',ids);
  if(error){if(isNetError(error))OFFLINE=true;return}
  (data||[]).forEach(c=>COMM[c.id]=c);
  if(data&&data.length)cacheWrite('comms',COMM);
}
const ON_MS=5*60*1000;
/* «Activo» = se le vio en los últimos 5 minutos (latido de last_seen). */
function activeNow(u){
  return !!(u&&u.last_seen&&(Date.now()-new Date(u.last_seen).getTime()<ON_MS));
}
/* El perfil se cachea para no repetir consultas, pero last_seen cambia.
   Esto refresca solo la marca de actividad de los ids que se van a pintar. */
async function refreshActivity(ids){
  ids=[...new Set((ids||[]).filter(Boolean))];
  if(!ids.length||!COLS.profiles.has('last_seen'))return;
  const{data}=await sb.from('profiles').select('id,last_seen').in('id',ids);
  (data||[]).forEach(p=>{if(P[p.id])P[p.id].last_seen=p.last_seen});
}
function nsfwPost(p){
  if(p.nsfw)return true;
  const c=p.community_id?COMM[p.community_id]:null;
  return !!(c&&c.nsfw);
}
function revealPost(id,ev){
  if(ev)ev.stopPropagation();
  REVEAL.add(id);
  const w=document.getElementById('nsw'+id);
  if(w){w.classList.remove('hidden');const v=w.querySelector('.nsfw-veil');if(v)v.remove();}
}
function revealReel(id,btn,ev){
  if(ev)ev.stopPropagation();
  REVEAL.add(id);
  const a=btn&&btn.closest('.reel');
  if(a)a.classList.remove('nsfw-hide');
  if(btn)btn.remove();
}
function rolTag(r){return r=='owner'?'<span class="tag" style="color:var(--ac)">Líder</span>':r=='mod'?'<span class="tag">Moderador</span>':''}
function menu(p){
  return `<div class="row" style="margin-left:auto;gap:4px">
    <button class="sm" onclick="sharePost('${p.id}')" title="Compartir publicación"><i class="fa-solid fa-share-nodes"></i></button>
    <button class="sm" onclick="report('target_post','${p.id}')" title="Reportar"><i class="fa-solid fa-flag"></i></button>
    ${p.author==me.id?`<button class="sm d" onclick="delPost('${p.id}')" title="Borrar"><i class="fa-solid fa-trash"></i></button>`:''}</div>`;
}
function postHtml(p){
  const a=P[p.author]||{};
  const cp=p.community_id?CP[p.community_id+p.author]:null;
  const nick=cp&&cp.nickname?cp.nickname:(a.name||'?');
  const myRe=(p.reactions||[]).find(r=>r.user_id===me.id);
  const emoji=myRe?myRe.emoji:'❤️';
  const nRe=(p.reactions||[]).length+(p.likes||[]).length;
  let body=p.body?`<div class="pre">${esc(p.body)}</div>`:'';
  if(p.kind=='poll'){
    const o=p.body.split('\n').filter(Boolean),v=p.poll_votes||[],mv=v.find(x=>x.user_id==me.id);
    body=o.map((t,i)=>{const n=v.filter(x=>x.opt==i).length,pc=v.length?Math.round(n*100/v.length):0;
      return `<div style="cursor:pointer" onclick="vote('${p.id}',${i})">${mv&&mv.opt==i?'<i class="fa-solid fa-check"></i> ':''}${esc(t)} <span class="mu">${n} · ${pc}%</span><div class="bar"><i style="width:${pc}%"></i></div></div>`}).join('');
  }
  /* Contenido que puede quedar oculto: multimedia, título y texto. La cabecera
     del autor, las reacciones y los comentarios siguen siempre visibles. */
  const core=`${mediaHtml(p)}${p.title?`<h3>${esc(p.title)}</h3>`:''}${body}`;
  const nsfw=nsfwPost(p);
  const oculto=nsfw&&!REVEAL.has(p.id);
  const wrapped=oculto
    ? `<div class="nsfw-wrap hidden" id="nsw${p.id}">${core}
        <button class="nsfw-veil" onclick="revealPost('${p.id}',event)" title="Mostrar contenido">
          <i class="fa-solid fa-eye-slash"></i><b>Contenido NSFW</b>
          <span class="mu">Pulsa la publicación para verla</span></button></div>`
    : core;
  return `<div class="card k-${p.kind}" data-p="${p.id}" style="position:relative">
    ${p.is_pinned?'<i class="fa-solid fa-thumbtack pinb" title="Fijada"></i>':''}
    ${wrapped}
    <div class="row"><button class="sm" style="border:none;background:none;padding:0" onclick="openProfile('${p.author}')">${av(a,28)}</button>
      <div class="grow"><span onclick="openProfile('${p.author}')" style="cursor:pointer"><b style="color:${esc(a.accent||'')}">${esc(nick)}</b></span> ${soc(a.links)}
        <div class="mu">${new Date(p.created_at).toLocaleDateString()}${cp&&cp.role!=='member'?' · '+rolTag(cp.role):''}${nsfw?' · <span class="tag" style="color:var(--rd)">NSFW</span>':''}</div></div>
      ${menu(p)}</div>
    <div class="row">
      ${NEWOK?`<button class="sm" onclick="react('${p.id}','${emoji}')" title="Reaccionar">${emoji} ${nRe}</button>`
             :`<button class="sm" onclick="like('${p.id}',${(p.likes||[]).some(l=>l.user_id===me.id)},'${p.author}')"><i class="fa-${(p.likes||[]).some(l=>l.user_id===me.id)?'solid':'regular'} fa-heart"></i> ${(p.likes||[]).length}</button>`}
      <button class="sm" onclick="tc('${p.id}')"><i class="fa-regular fa-comment"></i> ${p.comments[0]?p.comments[0].count:0}</button>
      ${FC&&isMod(FC)?`<button class="sm" onclick="pinPost('${p.id}',${!p.is_pinned})"><i class="fa-solid fa-thumbtack"></i> ${p.is_pinned?'Desfijar':'Fijar'}</button>`:''}
    </div>
    ${NEWOK?`<div class="emojis">${EMOS.map(e=>`<button class="${emoji===e?'on':''}" onclick="react('${p.id}','${e}')">${e}</button>`).join('')}</div>`:''}
    <div id="c${p.id}" style="display:grid;gap:6px"></div></div>`;
}
/* ---------- Comentarios: respuestas y fotos tipo sticker ---------- */
let COMMENT_ATT={};
function cAtt(key){return COMMENT_ATT[key]||[]}
function cPreviewInner(key){
  return cAtt(key).map((a,i)=>`<span class="cchip"><img src="${esc(a.u)}" alt="${esc(a.n||'foto')}" loading="lazy">
    <button type="button" onclick="rmCPhoto('${key}',this)" title="Quitar">×</button></span>`).join('');
}
function renderCPreview(key,previewId){
  const box=$(previewId);if(box)box.innerHTML=cPreviewInner(key);
}
function rmCPhoto(key,btn){
  const chip=btn&&btn.closest('.cchip');
  const box=chip&&chip.parentElement;
  const idx=box?[...box.children].indexOf(chip):-1;
  if(idx>=0){(COMMENT_ATT[key]||[]).splice(idx,1);box.innerHTML=cPreviewInner(key)}
}
async function pickCPhoto(key,previewId){
  if(!COLS.comments.has('attachments'))
    return toast('Las fotos en comentarios necesitan <b>sql/06-comentarios-respuestas-fotos.sql</b>.','warn',9000);
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;
  inp.onchange=async()=>{
    const files=[...(inp.files||[])].slice(0,4);inp.value='';
    if(!files.length)return;
    if(!COMMENT_ATT[key])COMMENT_ATT[key]=[];
    toast('Subiendo foto…','ok',1500);
    for(const f of files){
      if(!/^image\//.test(f.type||'')){toast('Solo imágenes para el sticker.','warn');continue}
      const u=await up(f);
      if(u)COMMENT_ATT[key].push({u,n:f.name,t:f.type||'image/jpeg',s:f.size});
    }
    renderCPreview(key,previewId);
  };
  inp.click();
}
function commentAttHtml(list){
  let a=list;
  if(typeof a==='string'){try{a=JSON.parse(a)}catch{a=[]}}
  if(!Array.isArray(a))return '';
  const imgs=a.filter(x=>x&&x.u&&(!x.t||/^image\//.test(x.t)));
  if(!imgs.length)return '';
  return `<div class="comment-sticker">${imgs.map(x=>
    `<img src="${esc(x.u)}" alt="${esc(x.n||'sticker')}" loading="lazy" onclick="zoom('${esc(x.u)}')">`).join('')}</div>`;
}
function closeCReply(cid){
  const b=document.getElementById('crf'+cid);if(b)b.innerHTML='';
  delete COMMENT_ATT['r_'+cid];
}
function toggleCReply(cid,pid){
  const box=document.getElementById('crf'+cid);if(!box)return;
  if(box.innerHTML.trim())return closeCReply(cid);
  document.querySelectorAll('[id^="crf"]').forEach(el=>{if(el!==box)el.innerHTML=''});
  COMMENT_ATT['r_'+cid]=[];
  const item=document.getElementById('cm'+cid);
  const author=item?item.dataset.author:'';
  const nm=esc((P[author]||{}).name||'comentario');
  box.innerHTML=`<div class="creplyform">
    <div class="mu" style="font-size:11px">Respondiendo a <b style="color:var(--ac)">${nm}</b></div>
    <div class="row" style="align-items:flex-start">
      <input id="rc${cid}" class="grow" placeholder="Responde a ${nm}" onkeydown="if(event.key=='Enter')addC('${pid}','${cid}','rc${cid}','r_${cid}','crp${cid}')">
      <button class="sm" type="button" onclick="pickCPhoto('r_${cid}','crp${cid}')" title="Foto"><i class="fa-solid fa-image"></i></button>
      <button class="sm" type="button" onclick="addC('${pid}','${cid}','rc${cid}','r_${cid}','crp${cid}')" title="Responder"><i class="fa-solid fa-paper-plane"></i></button>
      <button class="sm d" type="button" onclick="closeCReply('${cid}')" title="Cancelar"><i class="fa-solid fa-xmark"></i></button>
    </div><div id="crp${cid}" class="comment-photo-preview"></div></div>`;
  setTimeout(()=>{const i=document.getElementById('rc'+cid);i&&i.focus()},40);
}
function tc(id){
  const d=$('c'+id);if(!d)return;
  if(d.dataset.o){d.innerHTML='';d.dataset.o='';delete COMMENT_ATT['c_'+id];return}
  d.dataset.o=1;drawC(id);
}
async function drawC(id){
  let rows;
  if(OFFLINE){
    rows=cacheRead(me&&me.id,'comments_'+id,[])||[];
  }else{
    const{data,error}=await sb.from('comments').select('*').eq('post_id',id).order('created_at');
    if(error){
      if(isNetError(error)){
        OFFLINE=true;
        rows=cacheRead(me&&me.id,'comments_'+id,[])||[];
      }else return;
    }else{
      rows=(data||[]).filter(c=>notBlocked(c.author));
      cacheComments(id,rows);
    }
  }
  rows=(rows||[]).filter(c=>notBlocked(c.author));
  await prof(rows.map(c=>c.author));
  /* Cargar las burbujas compradas/equipadas de todos los autores para que
     cada comentario se pinte con la suya, no con la burbuja por defecto.
     Se consulta bubble_id aparte porque un perfil puede venir del feed con
     solo id/nombre/avatar y entonces `prof()` no lo volvería a pedir. */
  if(!OFFLINE&&COLS.profiles.has('bubble_id')){
    const ids=[...new Set(rows.map(c=>c.author).filter(Boolean))];
    if(ids.length){
      const{data:bbRows}=await sb.from('profiles').select('id,bubble_id').in('id',ids);
      (bbRows||[]).forEach(p=>{if(P[p.id])Object.assign(P[p.id],p);else P[p.id]=fx(p)});
      await loadShopCache((bbRows||[]).map(p=>p.bubble_id));
    }
  }
  const d=$('c'+id);if(!d)return;
  /* Árbol de respuestas: si la migración 06 no está aplicada, todos los
     comentarios se ven como raíz y solo se oculta el botón Responder. */
  const map=new Map(rows.map(c=>[c.id,c])),kids=new Map();
  for(const c of rows){
    const p=c.parent_id&&map.has(c.parent_id)?c.parent_id:null;
    if(!kids.has(p))kids.set(p,[]);
    kids.get(p).push(c);
  }
  const canReply=COLS.comments.has('parent_id');
  const render=c=>{
    const parent=c.parent_id?map.get(c.parent_id):null;
    const child=kids.get(c.id)||[];
    const author=P[c.author]||{};
    const bb=author.bubble_id&&SHOP[author.bubble_id];
    const bbStyle=bubbleStyle(author);
    return `<div class="comment-item" id="cm${c.id}" data-author="${c.author}">
      <div class="row" style="align-items:flex-start">${av(P[c.author],22)}
        <div class="grow">${nameEl(P[c.author]||{})}
          ${parent?`<div class="mu" style="font-size:11px">↪ ${esc((P[parent.author]||{}).name||'comentario')}</div>`:''}
          ${c.body?`<div class="cbubble"${bb?` data-b="${esc(author.bubble_id)}"`:''} style="${bbStyle}">${esc(c.body)}</div>`:''}
          ${commentAttHtml(c.attachments)}
        </div>
        <div class="row" style="gap:2px">
          ${canReply?`<button class="sm" type="button" onclick="toggleCReply('${c.id}','${id}')" title="Responder"><i class="fa-solid fa-reply"></i></button>`:''}
          ${c.author==me.id?`<button class="sm d" onclick="delC('${c.id}','${id}')"><i class="fa-solid fa-xmark"></i></button>`:''}
        </div></div>
      <div id="crf${c.id}" class="creplyslot"></div>
      ${child.length?`<div class="comment-replies">${child.map(render).join('')}</div>`:''}
    </div>`;
  };
  d.innerHTML=(kids.get(null)||[]).map(render).join('')
    +`<div class="row comment-composer" style="align-items:flex-start">
      <input id="cc${id}" class="grow" placeholder="Escribe un comentario" onkeydown="if(event.key=='Enter')addC('${id}')">
      <button class="sm" type="button" onclick="pickCPhoto('c_${id}','cp_${id}')" title="Enviar una foto"><i class="fa-solid fa-image"></i></button>
      <button class="sm" type="button" onclick="addC('${id}')"><i class="fa-solid fa-paper-plane"></i></button></div>
    <div id="cp_${id}" class="comment-photo-preview">${cPreviewInner('c_'+id)}</div>`;
}
async function addC(id,parentId=null,inputId=null,attKey=null,prevId=null){
  if(OFFLINE)return toast('Sin conexión: no se puede comentar ahora.','warn');
  const ii=inputId||('cc'+id),key=attKey||('c_'+id),prev=prevId||('cp_'+id);
  const b=(val(ii)||'').trim(),att=(COMMENT_ATT[key]||[]).slice();
  if(!b&&!att.length)return;
  if(parentId&&!COLS.comments.has('parent_id'))
    return toast('Responder comentarios necesita <b>sql/06-comentarios-respuestas-fotos.sql</b>.','warn',9000);
  if(att.length&&!COLS.comments.has('attachments'))
    return toast('Las fotos en comentarios necesitan <b>sql/06-comentarios-respuestas-fotos.sql</b>.','warn',9000);
  const{error}=await sb.from('comments').insert(fit('comments',{
    post_id:id,body:b,parent_id:parentId||null,attachments:att
  }));
  if(error)return toast(explain(error),'err',8000);
  COMMENT_ATT[key]=[];renderCPreview(key,prev);
  const{data}=await sb.from('posts').select('author').eq('id',id).maybeSingle();
  if(data)notify(data.author,'comment',me.name+(b?' comentó':' envió una foto en')+' tu publicación');
  if(parentId){
    const{data:pc}=await sb.from('comments').select('author').eq('id',parentId).maybeSingle();
    if(pc&&pc.author!==me.id)notify(pc.author,'reply',me.name+' respondió tu comentario');
  }
  toast(parentId?'Respuesta publicada.':'Comentario publicado. +3 XP','ok');drawC(id);
}
async function delC(cid,pid){
  if(OFFLINE)return toast('Sin conexión: no se puede borrar ahora.','warn');
  const{error}=await sb.from('comments').delete().eq('id',cid);
  if(error)return toast(error.message,'err');
  drawC(pid);
}
/* Recarga la lista correcta: el feed global o las publicaciones del perfil */
function refreshPosts(){ if(view=='prof')return loadProfPosts(); loadFeed(1) }
/* Los eventos de posts se aplican en memoria: no hace falta volver a pedir
   el feed entero por cada publicación nueva. */
async function applyPostRealtime(ev){
  const row=ev&&(ev.eventType==='DELETE'?ev.old:ev.new);
  if(!row||!row.id)return;
  if(ev.eventType==='DELETE'){
    FEED.buf=FEED.buf.filter(x=>x.id!==row.id);
    if(view==='feed'&&$('pl'))$('pl').innerHTML=FEED.buf.map(postHtml).join('')||empty('Nada por aquí todavía.');tintSoon();
    if(view==='prof'&&row.author===PROF)loadProfPosts();
    cachePosts(FEED.buf);
    return;
  }
  try{
    if(row.author&&!P[row.author])await prof([row.author]);
    if(row.community_id)await loadComms([row.community_id]);
    const old=FEED.buf.find(x=>x.id===row.id);
    if(old)Object.assign(old,row);
    else FEED.buf.unshift({...row,comments:row.comments||[],likes:row.likes||[],
      poll_votes:row.poll_votes||[],reactions:row.reactions||[]});
    if(FB=='top')FEED.buf.sort((a,b)=>score(b)-score(a));
    if(view==='feed'&&$('pl'))$('pl').innerHTML=FEED.buf.map(postHtml).join('')||empty('Nada por aquí todavía.');tintSoon();
    if(view==='prof'&&row.author===PROF)loadProfPosts();
    cachePosts(FEED.buf);
  }catch(e){console.warn('post en vivo',e.message)}
}
async function like(id,liked,au){
  if(liked)await sb.from('likes').delete().eq('post_id',id).eq('user_id',me.id);
  else{await sb.from('likes').insert({post_id:id});notify(au,'like',me.name+' le dio like a tu publicación')}
  refreshPosts();
}
async function vote(id,opt){
  const{error}=await sb.from('poll_votes').upsert({post_id:id,user_id:me.id,opt},{onConflict:'post_id,user_id'});
  if(error)toast(error.message,'err');
  refreshPosts();
}
async function delPost(id){
  if(!await ask())return;
  const{error}=await sb.from('posts').delete().eq('id',id);
  if(error)return toast(error.message,'err');
  refreshPosts();
}

/* ---------- Reacciones y fijadas ---------- */
async function react(id,e){
  if(!NEWOK)return toast('Las reacciones necesitan 00-instalar-todo.sql.','warn');
  const{data}=await sb.from('reactions').select('emoji').eq('post_id',id).eq('user_id',me.id).maybeSingle();
  if(data&&data.emoji===e)await sb.from('reactions').delete().eq('post_id',id).eq('user_id',me.id);
  else{
    const{error}=await sb.from('reactions').upsert({post_id:id,user_id:me.id,emoji:e});
    if(error)return toast(error.message,'err');
  }
  refreshPosts();
}
async function pinPost(id,v){
  if(!FC||!isMod(FC))return toast('Solo líderes y moderadores pueden fijar.','err');
  const{error}=await sb.from('posts').update({is_pinned:v,pinned_at:v?new Date().toISOString():null}).eq('id',id);
  if(error)return toast(error.message,'err');
  toast(v?'Publicación fijada.':'Publicación desfijada.');
  refreshPosts();
}

async function drawWall(){
  if(!NEWOK){
    $('pwall').innerHTML='<div class="card"><div class="mu">El muro necesita <b>'+SQL_FIX+
      '</b> (tabla profile_wall).</div></div>';
    return;
  }
  const{data}=await sb.from('profile_wall').select('*').eq('profile_id',PROF).order('created_at',{ascending:false}).limit(30);
  const rows=(data||[]).filter(w=>notBlocked(w.author_id));
  await prof(rows.map(w=>w.author_id));
  $('pwall').innerHTML=`<div class="card">
    <div class="row"><b class="grow"><i class="fa-solid fa-note-sticky"></i> Muro</b>
      <span class="mu">${rows.length?rows.length+' mensajes':'sin mensajes todavía'}</span></div>
    <div id="cw"></div></div>`;
  drawW(PROF);
}
async function drawW(id){
  const d=$('cw');if(!d)return;
  const{data}=await sb.from('profile_wall').select('*').eq('profile_id',id).order('created_at',{ascending:false}).limit(30);
  const rows=(data||[]).filter(w=>notBlocked(w.author_id));
  await prof(rows.map(w=>w.author_id));
  const list=rows.map(w=>`<div class="row" style="align-items:flex-start">${av(P[w.author_id],22)}
      <div class="grow">${nameEl(P[w.author_id]||{})}
      ${w.pinned?' <i class="fa-solid fa-thumbtack" style="color:var(--ac)"></i>':''}
      <div class="pre">${esc(w.body)}</div><div class="mu">${hm(w.created_at)}</div></div>
      ${id===me.id?`<button class="sm" onclick="pinWall('${w.id}',${!w.pinned})" title="Fijar"><i class="fa-solid fa-thumbtack"></i></button>
      <button class="sm d" onclick="delWall('${w.id}','${id}')" title="Borrar del muro"><i class="fa-solid fa-trash"></i></button>`:''}</div>`).join('');
  /* El campo debe existir SIEMPRE. Antes el `||` se comía el formulario
     cuando ya había algún mensaje y nadie más podía escribir en el muro. */
  d.innerHTML=(list||'<div class="mu" style="padding:6px 0">Todavía no hay mensajes en este muro.</div>')
    +`<div class="row"><input id="ww${id}" placeholder="${id===me.id?'Escribe en tu muro':'Responde en su muro'}" onkeydown="if(event.key=='Enter')addWall('${id}')">
      <button class="sm" onclick="addWall('${id}')"><i class="fa-solid fa-paper-plane"></i></button></div>`;
}
async function addWall(id){
  const b=val('ww'+id);if(!b)return;
  const{error}=await sb.from('profile_wall').insert({profile_id:id,author_id:me.id,body:b});
  if(error)return toast(error.message,'err');
  if(id!==me.id)notify(id,'wall',me.name+' dejó un mensaje en tu muro');
  if(id===PROF)drawWall();else drawW(id);
}
async function pinWall(id,v){const{error}=await sb.from('profile_wall').update({pinned:v}).eq('id',id);if(error)toast(error.message,'err');drawW(PROF)}
async function delWall(id,p){
  if(!await ask())return;
  const{error}=await sb.from('profile_wall').delete().eq('id',id);
  if(error)toast(error.message,'err');
  if(p===PROF)drawWall();else drawW(p);
}

/* ==========================================================================
   10) Bloqueos y reportes
   ========================================================================== */
async function blockDlg(id){
  const{data}=await sb.from('blocks').select('blocked_id').eq('blocker_id',me.id).eq('blocked_id',id).maybeSingle();
  const on=!!data;
  if(!await ask())return;
  const{error}=on
    ? await sb.from('blocks').delete().eq('blocker_id',me.id).eq('blocked_id',id)
    : await sb.from('blocks').insert({blocker_id:me.id,blocked_id:id});
  if(error)return toast(error.message,'err');
  await blocked();toast(on?'Desbloqueado.':'Bloqueado: no verás su contenido.');
  go('feed');
}
/* Motivos concretos: la lista se ve como botones, no como un prompt vacío. */
const REPORTS=[
  'Post malicioso (phishing / enlaces peligrosos)',
  'Violencia o amenazas',
  'Acoso o discriminación',
  'Contenido inapropiado / NSFW sin marcar',
  'Spam o estafa',
  'Suplantación de identidad',
  'Datos personales expuestos',
  'Otro motivo'];
/* ---------- Reportes · tinte rojo de las publicaciones ----------
   El RPC report_tints (con el secreto en el servidor) devuelve cuántos
   reportes acumula cada publicación visible. Con eso se pinta un velo rojo
   que sube de intensidad: 1 reporte casi nada, 100 reportes muy rojo. */
const REP={};
/* postHtml pinta el DOM en varias vistas; tintReports() se lanza justo después
   de cada uno de esos render: una sola consulta por tanda. */
const tintSoon=()=>{if(document.querySelector('.card.k-post[data-p]'))setTimeout(tintReports,80)};
function repLevel(n){return Math.min(.6,.06+Math.min(n,100)/100*.54)}
function applyTint(card,n){
  if(!card)return;
  card.querySelector('.repveil')?.remove();
  card.querySelector('.reptag')?.remove();
  if(!n||n<1){card.style.removeProperty('border-color');card.style.removeProperty('box-shadow');return}
  const a=repLevel(n);
  card.insertAdjacentHTML('afterbegin',
    `<div class="repveil" style="background:rgba(201,42,63,${a.toFixed(2)})"></div>`+
    `<span class="tag reptag" title="Reportes recibidos"><i class="fa-solid fa-flag"></i> ${n}</span>`);
  card.style.borderColor=rgbaRep(a+.25);
  card.style.boxShadow=`inset 0 0 0 1px ${rgbaRep(a*.45)}, 0 0 18px ${rgbaRep(a*.35)}`;
}
const rgbaRep=a=>{
  const v=Math.max(0,Math.min(1,a));return `rgba(229,27,49,${v.toFixed(2)})`;
};
async function tintReports(){
  if(typeof me==='undefined'||!me)return;
  const cards=[...document.querySelectorAll('.card.k-post[data-p]')];
  if(!cards.length)return;
  const ids=[...new Set(cards.map(c=>c.dataset.p).filter(Boolean))];
  let rows=null;
  try{
    const{data,error}=await sb.rpc('report_tints',{p_ids:ids});
    if(!error)rows=data;
  }catch{}
  (rows||[]).forEach(d=>REP[d.post_id]=d.n);
  cards.forEach(c=>{
    const n=REP[c.dataset.p]||0;
    /* Solo repinta si cambió algo; evita parpadeo en re-renders */
    if(+c.dataset.n!==n){c.dataset.n=n;applyTint(c,n)}
  });
}
async function report(field,id){
  return new Promise(res=>{
    const ov=document.createElement('div');ov.className='ask';
    ov.innerHTML=`<div class="askcard" role="dialog" aria-modal="true" aria-label="Reportar">
      <div class="askic" style="color:#fbbf24;background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.35)">
        <i class="fa-solid fa-flag"></i></div>
      <b>¿Por qué lo reportas?</b>
      <p>Elige un motivo. Se envía al instante.</p>
      <div class="rlist">
        ${REPORTS.map(r=>`<button class="rr">${esc(r)}</button>`).join('')}
      </div>
      <div class="askbtn"><button class="sm" data-k="0">Cancelar</button></div></div>`;
    const close=v=>{ov.classList.add('out');setTimeout(()=>ov.remove(),190);res(v)};
    ov.onclick=e=>{if(e.target===ov)close(null)};
    ov.querySelector('button[data-k="0"]').onclick=()=>close(null);
    ov.querySelectorAll('.rr').forEach(b=>b.onclick=()=>close(b.textContent));
    document.body.appendChild(ov);
    ov.querySelector('button[data-k="0"]').focus();
  }).then(b=>{
    if(!b||b===null)return;
    (async()=>{
      const{error}=await sb.from('reports').insert({reporter_id:me.id,reason:b,[field]:id});
      if(error)return toast(error.message,'err');
      toast('Reporte enviado · '+b,'ok',5000);
    })();
  });
}

/* ==========================================================================
   11) Salas
   ========================================================================== */
function rcRoom(r){
  return `<div class="rc" onclick="openRoom('${r.id}')">
    <div class="cv" style="${r.cover?`background-image:url('${esc(r.cover)}')`:''}">${r.is_private?'<i class="fa-solid fa-lock tg"></i>':''}</div>
    <div class="rb"><b>${esc(r.name)}</b><div class="mu">${esc(r.topic)}</div>
      <div class="row"><span class="tag">${r.kind=='voz'?'Voz':'Rol'}</span>${r.turns_on?'<span class="tag">Turnos</span>':''}</div></div></div>`;
}
VIEWS.rooms=async()=>{
  $('main').innerHTML=`<div class="feed wide">
    <details class="panel" open><summary><i class="fa-solid fa-circle-plus"></i> Crear sala</summary>
      <div class="pbody">
        <div class="field"><label>Nombre de la sala</label>
          <input id="rn2" placeholder="Ej. El Pasillo Oscuro" oninput="roomPrev()"></div>
        <div class="field"><label>Tema o descripción</label>
          <input id="rt" placeholder "¿De qué va la sala?" oninput="roomPrev()"></div>
        <div class="field"><label>Portada</label>
          <button class="drop" style="width:100%" onclick="$('rcv').click()">
            <i class="fa-solid fa-image"></i><b>Elegir imagen</b>
            <span class="mu">Se reducirá automáticamente</span></button>
          <input id="rcv" type="file" accept="image/*" style="display:none" onchange="roomPrev()"></div>
        <label class="row mu"><input type="checkbox" id="rpv" onchange="roomPrev()">
          <span>Sala privada <i class="fa-solid fa-circle-info" title="Solo se entra con el código de invitación"></i></span></label>
        <div id="rprev"></div>
        <button class="p" onclick="mkRoom()"><i class="fa-solid fa-door-open"></i> Crear sala</button>
      </div></details>
    <div class="grid" id="rl" style="padding:0"></div></div>`;
  roomPrev();
  const{data,error}=await sb.from('rooms').select('*').order('created_at',{ascending:false});
  if(error)return($('rl').innerHTML=empty(esc(error.message)));
  (data||[]).forEach(r=>RM[r.id]=r);
  await prof(data.map(r=>r.owner));
  $('rl').innerHTML=(data||[]).map(rcRoom).join('')||empty('Aún no hay salas. Crea la primera.');
};
function roomPrev(){
  const p=$('rprev');if(!p)return;
  const priv=$('rpv')&&$('rpv').checked;
  p.innerHTML=`<div class="mu" style="text-transform:uppercase;font-size:11px;letter-spacing:.08em">Vista previa</div>
    <div class="rc" style="pointer-events:none">
      <div class="cv" style="height:88px">${priv?'<i class="fa-solid fa-lock tg"></i>':''}</div>
      <div class="rb"><b>${esc(val('rn2')||'Tu sala')}</b>
        <div class="mu">${esc(val('rt')||'Sin descripción todavía.')}</div>
        <div class="row w"><span class="tag">Rol</span>${priv?'<span class="tag"><i class="fa-solid fa-lock"></i> Privada</span>':'<span class="tag">Abierta</span>'}</div>
      </div></div>`;
}
async function mkRoom(){
  const name=val('rn2');if(!name)return toast('Ponle un nombre a la sala.','err');
  const cover=await fu('rcv'),rk=b64(crypto.getRandomValues(new Uint8Array(18)));
  const code=b64(crypto.getRandomValues(new Uint8Array(9))).replace(/[^a-z0-9]/gi,'').slice(0,8).toUpperCase();
  const{data,error}=await sb.from('rooms').insert(fit('rooms',
    {name,topic:val('rt'),kind:'rol',is_private:$('rpv').checked,room_key:rk,cover,invite_code:code})).select().single();
  if(error)return toast(error.message,'err');
  await sb.from('room_members').insert({room_id:data.id,user_id:me.id});
  RM[data.id]=data;toast('Sala creada.','ok');go('rooms');openRoom(data.id);
}
async function joinByCode(code){
  code=String(code||'').toUpperCase().trim();
  if(!code)return;
  if(NOFN.has('join_room_by_code'))
    return toast('La función <b>join_room_by_code</b> no existe. Ejecuta '
      +'<b>00-instalar-todo.sql</b>.','err',8000);
  const{data,error}=await sb.rpc('join_room_by_code',{code});
  if(error)return toast(error.message,'err',6000);
  const{data:r}=await sb.from('rooms').select('*').eq('id',data).maybeSingle();
  if(!r)return toast('No se pudo abrir la sala.','err');
  RM[r.id]=r;
  history.replaceState(null,'',location.pathname);
  openRoom(r.id);
  toast('Te uniste a '+r.name,'ok');
}
async function openRoom(id){
  stopProfileMusic();
  leaveVoice();PEND=[];cur=RM[id]||(await sb.from('rooms').select('*').eq('id',id).maybeSingle()).data;
  if(!cur)return toast('No se pudo abrir la sala.','err');
  RM[cur.id]=cur;document.body.classList.add('open');
  await prof([cur.owner]);const o=P[cur.owner]||{};
  const{error}=await sb.from('room_members').upsert({room_id:cur.id,user_id:me.id},{ignoreDuplicates:true});
  if(error)return toast('No puedes entrar en esta sala.','err',5000);
  const{data:mem}=await sb.from('room_members').select('user_id').eq('room_id',cur.id);
  const{data:mods}=await sb.from('room_mods').select('user_id').eq('room_id',cur.id);
  const canEditRoom=cur.owner===me.id||((mods||[]).some(m=>m.user_id===me.id));
  const turnsOn=!!cur.turns_on&&Array.isArray(cur.turn_order)&&cur.turn_order.length>0;
  const canWrite=!turnsOn||cur.turn_order[cur.turn_idx||0]===me.id;
  $('main').innerHTML=`<div class="banner" style="background-image:linear-gradient(rgba(9,9,10,.2),rgba(9,9,10,.9))${cur.cover?`,url('${esc(cur.cover)}')`:''}">
      <div class="row w" style="width:100%">
      <button onclick="go('rooms')"><i class="fa-solid fa-chevron-left"></i></button>
      <div><h3>${esc(cur.name)}</h3><div class="mu">${esc(cur.topic)}</div></div>
      <div class="row" style="margin-left:auto">
        <span class="tag">${(mem||[]).length} personas</span>
        <button class="sm" onclick="copyCode()" title="Copiar código de invitación"><i class="fa-solid fa-share-nodes"></i></button>
        ${canEditRoom?`<button class="sm" onclick="roomSettings()" title="Ajustes"><i class="fa-solid fa-sliders"></i></button>`:''}</div></div></div>
    <div class="vbar"><div class="vstrip" id="vp"></div><div class="row" id="vc"></div></div>
    ${turnsOn?turnBar(canWrite):''}
    <div class="msgs" id="ms"></div>
    <div id="pend"></div>
    <div class="comp">
      <button class="sm" onclick="chooseFiles('room')" title="Adjuntar archivo" ${canWrite?'':'disabled'}><i class="fa-solid fa-paperclip"></i></button>
      <input id="ci" class="grow" placeholder="Mensaje, /me acción o /roll 2d6" ${canWrite?'':'disabled'} onkeydown="if(event.key=='Enter')sendRoom()">
      <button class="p" onclick="sendRoom()" ${canWrite?'':'disabled'}><i class="fa-solid fa-paper-plane"></i></button></div>
    ${turnsOn&&!canWrite?`<div class="mu" style="padding:6px 18px">No es tu turno. Pulsa «Terminar turno» cuando te corresponda.</div>`:''}`;
  /* El tema y el color propios de la sala sustituyen a los globales, y el
     fondo se aplica SOLO dentro del chat: nunca aparece en la lista de salas. */
  paint($('main'),cur.theme||'noir',cur.accent||null,cur.bg||null);
  loadRoom();drawVoice();tintReports();
}
function turnBar(myTurn){
  const order=cur.turn_order||[];
  return `<div class="vbar"><span class="mu"><i class="fa-solid fa-hourglass-half"></i> Turnos</span>
    <div class="vstrip">${order.map((u,i)=>`<span class="vc ${i===cur.turn_idx?'sp':''}">${av(P[u]||{id:u},24)} ${esc((P[u]||{}).name||'?')}</span>`).join('')||'<span class="mu">Sin orden</span>'}</div>
    <div class="row">${cur.owner==me.id?`<button class="sm" onclick="roomSettings()">Configurar turnos</button>`:''}
      <button class="p sm" onclick="endTurn()" ${myTurn?'':'disabled'}>Terminar turno</button></div></div>`;
}
async function endTurn(){
  const order=cur.turn_order||[];if(!order.length)return;
  const{error,data}=await sb.rpc('advance_turn',{rid:cur.id});
  if(error)return toast(error.message,'err');
  cur.turn_idx=data;
  toast('Turno de '+(P[order[data]]||{}).name,'ok');
  openRoom(cur.id);
}
/* Cierra cualquier configuración abierta: solo se ve una a la vez. */
function closeSetPanels(){
  document.querySelectorAll('.preview').forEach(e=>e.remove());
  ['setbox','commset'].forEach(id=>{const e=document.getElementById(id);if(e)e.remove()});
}
async function roomSettings(tab='general'){
  if(!cur)return toast('Abre una sala primero.','warn');
  const rid=cur.id;
  closeSetPanels();
  const mine=cur.owner==me.id;
  const{data:mods}=await sb.from('room_mods').select('*').eq('room_id',rid);
  const MODS=(mods||[]).map(m=>m.user_id);
  const limite=cur.max_mods||20;
  const mineMod=mine||MODS.includes(me.id);
  /* Solo quien creó la sala o un moderador puede abrir los ajustes. */
  if(!mineMod){
    toast('Solo el creador de la sala y los moderadores pueden editarla.','warn');
    return;
  }
  const box=document.createElement('div');
  box.id='setbox';box.className='setbox';
  box.innerHTML=`<div class="head"><b class="grow"><i class="fa-solid fa-sliders"></i> Ajustes de la sala</b>
      <span class="mu">${esc(cur.name)}</span>
      <button class="sm p" onclick="document.getElementById('setbox').remove()"><i class="fa-solid fa-check"></i> Listo</button></div>
    <div class="body">
      <div class="settabs">
        <button class="${tab=='general'?'on':''}" onclick="roomSettings('general')"><i class="fa-solid fa-pen"></i> General</button>
        <button class="${tab=='mods'?'on':''}" onclick="roomSettings('mods')"><i class="fa-solid fa-shield-halved"></i> Moderadores</button>
        <button class="${tab=='look'?'on':''}" onclick="roomSettings('look')"><i class="fa-solid fa-palette"></i> Aspecto</button>
        <button class="${tab=='turns'?'on':''}" onclick="roomSettings('turns')"><i class="fa-solid fa-hourglass-half"></i> Turnos</button>
        <button class="${tab=='log'?'on':''}" onclick="roomSettings('log')"><i class="fa-solid fa-clock-rotate-left"></i> Historial</button>
      </div>
      <div class="setpane" id="setpane">cargando…</div>
    </div>`;
  /* Se monta en <body>, no dentro de #main: así queda POR ENCIMA del chat y
     no lo empuja hacia abajo. */
  document.body.appendChild(box);
  const pane=$('setpane');

  if(tab=='general'){
    pane.innerHTML=`<div class="field"><label>Nombre</label>
        <input id="sn" value="${esc(cur.name)}" placeholder="Nombre de la sala"></div>
      <div class="field"><label>Descripción</label>
        <textarea id="stp" placeholder="¿De qué va esta sala?">${esc(cur.topic)}</textarea></div>
      <div class="field"><label>Portada</label>
        <div class="row"><button class="sm" onclick="pickRoomCover()"><i class="fa-solid fa-image"></i> Cambiar</button>
          ${cur.cover?'<button class="sm" onclick="clearRoomCover()"><i class="fa-solid fa-eraser"></i> Quitar</button>':''}</div></div>
      <div class="field"><label>Código de invitación</label>
        <div class="row"><input readonly value="${esc(cur.invite_code||'sin código')}" onclick="this.select()">
          <button class="sm" onclick="copyCode()"><i class="fa-solid fa-copy"></i> Copiar</button></div>
        <span class="mu">Se copia solo el código, no el enlace.</span></div>
      <p class="mu"><i class="fa-solid fa-lock"></i> Los mensajes de las salas se cifran en el servidor, no de extremo a extremo. Los privados sí lo son.</p>
      ${mine?`<button class="p" onclick="saveRoom()"><i class="fa-solid fa-floppy-disk"></i> Guardar cambios</button>
        <button class="d" onclick="delRoom()"><i class="fa-solid fa-trash"></i> Borrar sala</button>`
        :'<p class="mu">Solo quien creó la sala puede editarla o borrarla.</p>'}`;
  }

  if(tab=='mods'){
    if(!mineMod){pane.innerHTML='<p class="mu">Necesitas ser moderador para ver esto.</p>';}
    else{
      const{data:mem}=await sb.from('room_members').select('user_id').eq('room_id',rid);
      const ids=(mem||[]).map(m=>m.user_id);
      await prof(ids);
      const{data:mt}=await sb.from('room_mutes').select('*').eq('room_id',rid);
      const muted=new Set((mt||[]).filter(x=>new Date(x.until)>new Date()).map(x=>x.user_id));
      pane.innerHTML=`<div class="row"><b class="grow"><i class="fa-solid fa-shield-halved"></i> Moderadores</b>
          <span class="tag">${MODS.length} / ${limite}</span></div>
        <div class="bar" style="margin:0"><i style="width:${Math.min(100,MODS.length/limite*100)}%"></i></div>
        ${mine?`<div class="field"><label>Tope de moderadores</label>
          <div class="row"><input type="number" id="smm" min="1" max="99" value="${limite}">
            <button class="sm" onclick="saveMaxMods()">Guardar</button></div></div>`:''}
        <div style="display:grid;gap:4px">
        ${ids.map(u=>{const isM=MODS.includes(u),isO=cur.owner===u,um=muted.has(u);
          return `<div class="memrow">${av(P[u]||{id:u},36)}
            <div class="grow"><b style="color:${esc((P[u]||{}).accent||'')}">${esc((P[u]||{}).name||'?')}</b>
              ${isO?'<span class="tag" style="color:var(--ac)">Dueño</span>':isM?'<span class="tag">Moderador</span>':''}
              ${um?'<span class="tag" style="color:var(--rd)">Silenciado</span>':''}</div>
            ${mine&&!isO?`<button class="sm ${isM?'':'p'}" onclick="toggleMod('${u}',${!isM})">
                <i class="fa-solid fa-shield-halved"></i> ${isM?'Quitar':'Nombrar'}</button>`:''}
            ${mineMod&&!isO?`<button class="sm" onclick="menuMod('${u}')" title="Moderar"><i class="fa-solid fa-ellipsis"></i></button>`:''}</div>`}).join('')}
        </div>`;
    }
  }

  if(tab=='look'){
    const can=mine;
    pane.innerHTML=`<div class="field"><label>${can?'Tema de la conversación':'Tema (lo elige el dueño de la sala)'}</label>
        ${themeGrid(cur.theme,can?'setRoomTheme':'noopTheme')}</div>
      <div class="field"><label>Color de la sala</label>
        ${themeSwatches(cur.accent,can?'setRoomAccent':'noopTheme')}</div>
      <div class="field"><label>Fondo del chat</label>
        <div class="row"><button class="sm" onclick="pickRoomBg()"><i class="fa-solid fa-image"></i> Subir fondo</button>
          ${cur.bg?'<button class="sm" onclick="clearRoomBg()"><i class="fa-solid fa-eraser"></i> Quitar</button>':''}</div>
        <span class="mu">El fondo se ve solo dentro del chat, nunca en la lista de salas.</span></div>`;
  }

  if(tab=='turns'){
    pane.innerHTML=`<label class="row mu"><input type="checkbox" id="sturn" ${cur.turns_on?'checked':''}> Activar turnos de rol</label>
      ${cur.turns_on?`<div><label class="mu">Orden actual</label><div class="row w">
        ${(cur.turn_order||[]).map((u,i)=>`<span class="vc ${i===cur.turn_idx?'sp':''}">${av(P[u]||{id:u},22)} ${esc((P[u]||{}).name||'?')}</span>`).join('')}</div></div>`:''}
      ${mine?'<button class="p sm" onclick="saveTurns()"><i class="fa-solid fa-hourglass-half"></i> Guardar orden de turnos</button>'
        :'<p class="mu">Solo el dueño puede cambiar el orden de turnos.</p>'}
      <p class="mu">${cur.turns_on?'El compositor se deshabilita para quien no tiene el turno.':'Sin turnos: todos pueden escribir cuando quieras.'}</p>`;
  }

  if(tab=='log'){
    if(!NEWOK){pane.innerHTML='<p class="mu">El historial necesita <b>00-instalar-todo.sql</b> (tabla room_mod_log).</p>';}
    else{
      const{data:lg}=await sb.from('room_mod_log').select('*').eq('room_id',rid).order('created_at',{ascending:false}).limit(80);
      await prof([...(lg||[]).map(l=>l.actor_id),...(lg||[]).map(l=>l.target_id)]);
      pane.innerHTML=(lg||[]).length?lg.map(l=>logRow(l)).join('')
        :'<p class="mu">Todavía no hay acciones registradas en esta sala.</p>';
    }
  }
}
const ACT={
  nombrar:['fa-shield-halved','#e0242f'], quitar_moderador:['fa-shield-halved','#fbbf24'],
  expulsar:['fa-user-slash','#ff6b7d'], silenciar:['fa-volume-xmark','#fb923c'],
  quitar_silencio:['fa-volume-high','#4ade80'], crear:['fa-star','#e0242f'],
  borrar:['fa-trash','#ff6b7d'], editar:['fa-pen','#908b8d'],
  cambiar_tema:['fa-palette','#e0242f'], bloquear:['fa-lock','#ff6b7d'], desbloquear:['fa-lock-open','#4ade80'],
};
const ACT_TXT={nombrar:'nombró moderador a',quitar_moderador:'quitó a un moderador',expulsar:'expulsó a',
  silenciar:'silenció a',quitar_silencio:'quitó el silencio a',crear:'creó la sala',borrar:'borró la sala',
  editar:'editó la sala',cambiar_tema:'cambió el tema',bloquear:'bloqueó la sala',desbloquear:'desbloqueó la sala'};
function logRow(l){
  const a=ACT[l.action]||['fa-circle','#908b8d'];
  return `<div class="logrow"><span class="logi" style="background:${hexA(a[1],.18)};color:${a[1]}">
      <i class="fa-solid ${a[0]}"></i></span>
    <div class="grow"><b>${esc((P[l.actor_id]||{}).name||'Sistema')}</b> ${esc(ACT_TXT[l.action]||l.action)}
      ${l.target_id?` <b style="color:var(--ac)">${esc((P[l.target_id]||{}).name||'alguien')}</b>`:''}
      ${l.detail?`<span class="mu"> · ${esc(l.detail)}</span>`:''}
      <div class="mu">${new Date(l.created_at).toLocaleString()}</div></div></div>`;
}
function noopTheme(){return toast('Solo el dueño de la sala puede cambiar esto.','warn')}
async function toggleMod(uid,on){
  const{error}=await sb.rpc('set_room_mod',{rid:cur.id,uid:uid,p_on:on});
  if(error)return toast(error.message,'err',6000);
  toast(on?'Nombrado moderador.':'Ya no es moderador.','ok');
  await openRoom(cur.id);roomSettings('mods');
}
async function saveMaxMods(){
  const n=Math.max(1,Math.min(99,parseInt(val('smm'))||20));
  const{error}=await sb.from('rooms').update({max_mods:n}).eq('id',cur.id);
  if(error)return toast(error.message,'err');
  cur.max_mods=n;toast('Tope de moderadores: '+n);roomSettings('mods');
}
async function menuMod(uid){
  const opt=prompt('Acción sobre '+((P[uid]||{}).name||'este miembro')+':\n'+
    '1 Silenciar\n2 Quitar silencio\n3 Expulsar\n4 Expulsar y borrar sus mensajes\n\nEscribe el número','1');
  if(opt==='1'){
    const m=prompt('¿Silenciar durante cuántos minutos?','60');
    if(!m)return;
    const{error}=await sb.rpc('room_mute',{rid:cur.id,uid:uid,minutos:parseInt(m)||60});
    if(error)return toast(error.message,'err',6000);
    toast('Silenciado '+m+' minutos.');await openRoom(cur.id);roomSettings('mods');
  }else if(opt==='2'){
    const{error}=await sb.rpc('room_unmute',{rid:cur.id,uid:uid});
    if(error)return toast(error.message,'err',6000);
    toast('Silencio retirado.');await openRoom(cur.id);roomSettings('mods');
  }else if(opt==='3'||opt==='4'){
    if(!confirm('¿Expulsar a '+(P[uid]||{}).name+' de la sala?'))return;
    const{error}=await sb.rpc('room_kick',{rid:cur.id,uid:uid,borrar_historial:opt==='4'});
    if(error)return toast(error.message,'err',6000);
    toast('Expulsado.');await openRoom(cur.id);roomSettings('mods');
  }
}
async function pickRoomCover(){
  const i=document.createElement('input');i.type='file';i.accept='image/*';
  i.onchange=async()=>{
    const u=await up(i.files[0]);if(!u)return;
    const{error}=await sb.from('rooms').update({cover:u}).eq('id',cur.id);
    if(error)return toast(error.message,'err');
    cur.cover=u;toast('Portada actualizada.');await openRoom(cur.id);roomSettings('general');
  };
  i.click();
}
async function clearRoomCover(){
  const{error}=await sb.from('rooms').update({cover:null}).eq('id',cur.id);
  if(error)return toast(error.message,'err');
  cur.cover=null;await openRoom(cur.id);roomSettings('general');
}
async function pickRoomBg(){
  const i=document.createElement('input');i.type='file';i.accept='image/*';
  i.onchange=async()=>{
    const u=await up(i.files[0]);if(!u)return;
    const{error}=await sb.from('rooms').update({bg:u}).eq('id',cur.id);
    if(error)return toast(error.message,'err');
    cur.bg=u;toast('Fondo aplicado.');await openRoom(cur.id);roomSettings('look');
  };
  i.click();
}
async function clearRoomBg(){
  const{error}=await sb.from('rooms').update({bg:null}).eq('id',cur.id);
  if(error)return toast(error.message,'err');
  cur.bg=null;await openRoom(cur.id);roomSettings('look');
}
async function setRoomTheme(t){
  const{error}=await sb.from('rooms').update({theme:t}).eq('id',cur.id);
  if(error)return toast(error.message,'err');
  cur.theme=t;await openRoom(cur.id);roomSettings('look');
}
async function setRoomAccent(c){
  const{error}=await sb.from('rooms').update({accent:c}).eq('id',cur.id);
  if(error)return toast(error.message,'err');
  cur.accent=c;await openRoom(cur.id);roomSettings('look');
}
/* Comparte SOLO el código de invitación, como pediste */
async function copyCode(){
  const code=(cur.invite_code||'').trim();
  if(!code)return toast('Esta sala no tiene código de invitación.','warn');
  let ok=false;
  try{ await navigator.clipboard.writeText(code); ok=true }catch{}
  if(!ok){
    const t=document.createElement('textarea');
    t.value=code;t.style.cssText='position:fixed;opacity:0';
    document.body.appendChild(t);t.select();
    try{document.execCommand('copy');ok=true}catch{}
    t.remove();
  }
  toast(ok?'Código copiado: '+code:'Copia a mano: '+code,'ok',6000);
}
async function saveRoom(){
  const row={name:val('sn')||cur.name,topic:val('stp')};
  const{error}=await sb.from('rooms').update(row).eq('id',cur.id);
  if(error)return toast(error.message,'err');
  Object.assign(cur,row);RM[cur.id]=cur;toast('Sala actualizada.');
  await openRoom(cur.id);roomSettings('general');
}
async function saveTurns(){
  const on=!!($('sturn')&&$('sturn').checked);
  if(!on){
    const{error}=await sb.from('rooms').update({turns_on:false}).eq('id',cur.id);
    if(error)return toast(error.message,'err');
    cur.turns_on=false;return roomSettings();
  }
  const{data}=await sb.from('room_members').select('user_id').eq('room_id',cur.id);
  const order=(data||[]).map(x=>x.user_id);
  if(!order.includes(me.id))order.unshift(me.id);
  await prof(order);
  const{error}=await sb.from('rooms').update({turns_on:true,turn_order:order,turn_idx:0}).eq('id',cur.id);
  if(error)return toast(error.message,'err');
  cur.turns_on=true;cur.turn_order=order;cur.turn_idx=0;
  toast('Turnos activados en el orden de los miembros.');openRoom(cur.id);
}
async function delRoom(){
  if(!await ask())return;
  const{error}=await sb.from('rooms').delete().eq('id',cur.id);
  if(error)return toast(error.message,'err');
  delete RM[cur.id];toast('Sala borrada.');go('rooms');
}

async function loadRoom(){
  const r=cur;if(!r||r.kind=='voz')return;
  if(OFFLINE){
    const L=cacheRead(me&&me.id,'room_'+r.id,[])||[];
    return drawMsgs(Array.isArray(L)&&L.length?L:[{kind:'sys',t:'Sin conexión. Aún no hay mensajes guardados de esta sala.'}]);
  }
  /* Traemos los 200 MÁS RECIENTES y los invertimos: así siempre se ve lo último,
     en vez de los 200 más antiguos de una sala con mucha historia. */
  const{data,error}=await sb.from('messages').select('*').eq('room_id',r.id)
    .order('created_at',{ascending:false}).limit(200);
  if(error&&isNetError(error)){
    OFFLINE=true;
    const L=cacheRead(me.id,'room_'+r.id,[]);
    return drawMsgs(Array.isArray(L)?L:[]);
  }
  const m=(data||[]).slice().reverse();
  await prof(m.map(x=>x.user_id));await chars(m.map(x=>x.character_id));
  await loadShopCache(m.map(x=>(P[x.user_id]||{}).bubble_id));
  const k=await roomKey(r),L=[];
  for(const x of m){
    const ch=C[x.character_id],u=P[x.user_id]||{};
    /* El avatar del personaje abre el PERFIL DE QUIEN lo escribe (x.user_id),
       no un id de personaje que no existe como perfil. */
    const who=ch?{...u,id:x.user_id,name:ch.name,avatar:ch.avatar,accent:u.accent}:u;
    L.push({kind:x.kind,mine:x.user_id==me.id,who,name:who.name,ac:u.accent,
            time:hm(x.created_at),t:await dec(k,x.body),att:x.attachments})
  }
  cacheRoom(r.id,L);
  if(cur===r)drawMsgs(L);
}
async function sendRoom(){
  if(OFFLINE)return toast('Sin conexión: el mensaje no se puede enviar todavía.','warn');
  let t=val('ci');if(!t&&!PEND.length)return;
  const turnsOn=!!cur.turns_on&&Array.isArray(cur.turn_order)&&cur.turn_order.length>0;
  if(turnsOn&&cur.turn_order[cur.turn_idx||0]!==me.id)
    return toast('No es tu turno todavía.','warn');
  let kind='msg';
  if(!t){t=''}
  else if(t.startsWith('/me ')){kind='me';t=t.slice(4)}
  else{
    const m=t.match(/^\/roll\s+(\d{1,2})d(\d{1,3})$/i);
    if(m){const n=+m[1],s=+m[2];if(n>50)return toast('Máximo 50 dados.','err');
      const rs=Array.from({length:n},()=>1+Math.floor(Math.random()*s));
      kind='roll';t=`Tirada ${n}d${s}: [${rs.join(', ')}] = ${rs.reduce((a,b)=>a+b,0)}`}
  }
  const row={room_id:cur.id,kind,body:await enc(await roomKey(cur),t)};
  if(PEND.length)row.attachments=PEND;
  const{error}=await sb.from('messages').insert(fit('messages',row));
  if(error)return toast(error.message,'err');
  $('ci').value='';clearPend('room');loadRoom();
}

/* ==========================================================================
   12) VOZ — LiveKit (arreglado)
   ========================================================================== */
/* Motivos habituales de fallo:
   1) la función livekit-token no está desplegada   -> 404 en el preflight
   2) la página no es un contexto seguro (file://) -> el navegador NEGA el micro
   3) el usuario denegó el permiso o no hay micrófono
   Lo comprobamos con window.isSecureContext, que es el criterio real del
   navegador (no con el protocolo: https y localhost cuentan, file:// no). */
const LOCAL=/^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/i;
function secureOk(){
  return window.isSecureContext===true ||
         (location.protocol==='https:') ||
         (location.protocol==='http:'&&LOCAL.test(location.hostname));
}
function micHelp(){
  if(location.protocol==='file:')
    return 'Estás abriendo el archivo con doble clic (file://). Los navegadores solo dan micrófono en https:// o en localhost.\n\n'+
           'Solución rápida, en una terminal dentro de esta carpeta:\n'+
           '   python3 -m http.server 8080\n'+
           'y abre  http://localhost:8080/index.html';
  if(!secureOk())
    return 'Esta dirección no es un contexto seguro ('+location.protocol+'//'+location.hostname+'). Publica el HTML en un sitio con HTTPS o usa http://localhost.';
  return null;
}
async function ensureMic(){
  const why=micHelp();
  if(why)throw new Error(why);
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)
    throw new Error('Este navegador no expone getUserMedia. Prueba en Chrome, Edge o Firefox.');
  let stream;
  try{
    stream=await navigator.mediaDevices.getUserMedia({
      audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true},video:false});
  }catch(e){
    /* Permisos distinguibles: da un mensaje útil en vez de uno genérico */
    if(e.name==='NotAllowedError'||e.name==='SecurityError')
      throw new Error('Permiso denegado. Revisa el candado junto a la dirección y permite el micrófono; en móvil puede estar bloqueado por el sistema.');
    if(e.name==='NotFoundError'||e.name==='OverconstrainedError')
      throw new Error('No se detectó ningún micrófono conectado.');
    if(e.name==='NotReadableError')
      throw new Error('El micrófono está ocupado por otra aplicación.');
    throw new Error(e.name+': '+e.message);
  }
  stream.getTracks().forEach(t=>t.stop());   // liberamos: LiveKit vuelve a pedirlos
  return true;
}
/* Sala de voz conectada (instancia de LiveKitClient.Room), o null */
let lk=null;
/* Panel de llamada: varias personas, con o sin cámara */
function callBox(){
  if(lk)return $('callbox');
  return $('callbox');
}
function hideCall(){ $('callbox')?.remove(); $('lprev')?.remove(); }

/* Pide el permiso de cámara (opcional: si se deniega, se sigue con voz) */
async function ensureCam(){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return false;
  try{
    const s=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480,facingMode:'user'},audio:false});
    s.getTracks().forEach(t=>t.stop());
    return true;
  }catch{ return false }
}

/* Azul de la pista local de vídeo (espejo) */
function showLocalCam(el){
  const track=lk&&lk.localParticipant&&lk.localParticipant.videoTrackPublications
    ?Object.values(lk.localParticipant.videoTrackPublications)[0] :null;
  if(!track||!track.track)return;
  const v=track.track.attach();
  v.muted=true;v.playsInline=true;v.dataset.lk=1;
  el.innerHTML='';el.appendChild(v);
  el.style.display='block';
}
async function toggleCam(){
  if(!lk)return;
  const p=lk.localParticipant;
  try{
    if(!p.isCameraEnabled){
      const ok=await ensureCam();
      if(!ok)return toast('El navegador no permite la cámara. Revisa los permisos del sitio.','warn',6000);
      await p.setCameraEnabled(true);
      let el=$('lprev');
      if(!el){el=document.createElement('div');el.id='lprev';document.body.appendChild(el)}
      showLocalCam(el);
      toast('Cámara activada.','ok');
    }else{
      await p.setCameraEnabled(false);
      $('lprev')?.remove();
    }
  }catch(e){toast('No se pudo usar la cámara: '+e.message,'err',6000)}
  drawVoice();
}
async function joinVoice(){
  if(typeof LivekitClient==='undefined')return toast('No se cargó la librería de voz. Revisa tu conexión.','err',6000);
  if(!cur)return toast('Abre una sala primero.','err');
  if(lk)return toast('Ya estás conectado a la voz de esta sala.','warn');
  const btn=$('vc');if(btn)btn.innerHTML='<span class="mu">Conectando…</span>';
  /* Primero el permiso de micrófono: el diálogo del navegador aparece con
     contexto y el usuario entiende por qué se le pide. */
  try{ await ensureMic() }catch(e){
    if(btn)btn.innerHTML='<button class="p" onclick="joinVoice()"><i class="fa-solid fa-headset"></i> Reintentar voz</button>';
    micDlg(e.message);return;
  }
  /* Dos caminos para obtener el token, ambos con el secreto en el servidor:
     1) RPC de PostgreSQL (sql/12): evita el 404/CORS de la Edge Function.
     2) Edge Function livekit-token, si está desplegada. */
  let data=null,error=null;
  try{
    const rpc=await sb.rpc('livekit_token',{p_room:cur.id});
    if(!rpc.error&&rpc.data&&rpc.data.token)data=rpc.data;
    else error=rpc.error;
  }catch(e){error=e}
  if(!data){
    try{
      const fn=await sb.functions.invoke('livekit-token',{body:{room:cur.id}});
      if(!fn.error&&fn.data&&fn.data.token)data=fn.data;
      else if(fn.error)error=fn.error;
    }catch(e){error=e}
  }
  if(!data||!data.token){
    if(btn)btn.innerHTML='<button class="p" onclick="joinVoice()"><i class="fa-solid fa-headset"></i> Unirte al chat de voz</button>';
    const m=String((error&&(error.message||error))||'');
    let hint='El token se pide al servidor (RPC public.livekit_token o la función livekit-token).';
    if(/configurado/i.test(m))hint='LiveKit no está configurado: ejecuta sql/14-voz-y-reportes.sql con tu wss://, API key y API secret.';
    else if(/No tienes acceso/i.test(m))hint='No eres miembro de esta sala y es privada.';
    else if(/sesion/i.test(m))hint='Tu sesión expiró: vuelve a entrar en la app.';
    else if(/PGRST202|does not exist|not exist/i.test(m))hint='Falta el RPC livekit_token: ejecuta sql/13-parche-en-vivo.sql (rol postgres).';
    return toast('No se pudo obtener el token de voz. '+hint+' ('+(m||'sin detalle')+')','err',16000);
  }
  const r=new LivekitClient.Room({adaptiveStream:true,dynacast:true});

  /* --- AUDIO: siempre oculto, para que el navegador lo reproduzca --- */
  r.on('trackSubscribed',(t)=>{
    if(t.kind==='audio'){
      const e=t.attach();e.dataset.lk=1;e.autoplay=true;e.playsInline=true;
      e.style.cssText='position:absolute;width:1px;height:1px;opacity:0;pointer-events:none';
      document.body.appendChild(e);
    }
    drawVoice();
  });
  r.on('trackUnsubscribed',(t)=>{t.detach().forEach(e=>e.remove());drawVoice()});

  /* --- VÍDEO: dentro del panel de llamada --- */
  r.on('trackSubscribed',(t)=>{
    if(t.kind==='video'){tile(t.track,t.participant);drawVoice()}
  },{kind:'video'});

  r.on('participantConnected',drawVoice).on('participantDisconnected',drawVoice)
   .on('activeSpeakersChanged',drawVoice)
   .on('trackMuted',drawVoice).on('trackUnmuted',drawVoice)
   .on('localTrackPublished',(pub)=>{if(pub.kind==='video')showLocalCam($('lprev')||mkPrev());drawVoice()})
   .on('localTrackUnpublished',()=>{$('lprev')?.remove();drawVoice()})
   .on('reconnecting',()=>toast('Reconectando a la llamada…','warn'))
   .on('reconnected',()=>toast('Reconectado.','ok'))
   .on('disconnected',(why)=>{
     if(lk===r){lk=null;hideCall();drawVoice();
       toast('Llamada terminada'+(why?' ('+why+')':''),'warn')}
   });

  try{
    /* La función devuelve también la URL; así un cambio de proyecto LiveKit
       no obliga a tocar el HTML. El token ya lleva la sala tbl_<id>. */
    await r.connect(data.url||LK_URL,data.token);
    lk=r;
    /* El micro se enciende sin fallar la conexión si el permiso se revoke */
    try{ await r.localParticipant.setMicrophoneEnabled(true) }
    catch{ toast('Conectado, pero el micro sigue bloqueado. Pulsa el botón del micro.','warn',6000) }
    /* La cámara es opcional: si el usuario la acepta, se enciende */
    if(await ensureCam()){
      try{
        await r.localParticipant.setCameraEnabled(true);
        showLocalCam(mkPrev());
      }catch{}
    }
    toast('Conectado a la voz.','ok');
  }catch(e){
    lk=null;r.disconnect();hideCall();
    if(btn)btn.innerHTML='<button class="p" onclick="joinVoice()"><i class="fa-solid fa-headset"></i> Reintentar voz</button>';
    return toast('No se pudo conectar: '+e.message,'err',7000);
  }
  drawVoice();
}
function mkPrev(){
  let el=$('lprev');
  if(!el){el=document.createElement('div');el.id='lprev';document.body.appendChild(el)}
  return el;
}
/* Miniatura de vídeo: sirve para LiveKit (participant) y P2P (stream) */
function tile(track,participant,tileId){
  const id=tileId||(participant&&participant.identity);
  if(!id)return;
  const grid=$('vgrid');if(!grid)return;
  let el=document.getElementById('t_'+id);
  if(!el){
    el=document.createElement('div');el.className='vtile';el.id='t_'+id;
    grid.appendChild(el);
  }
  let v=track;
  if(track&&typeof track.attach==='function')v=track.attach();
  if(!v)return;
  v.autoplay=true;v.playsInline=true;v.muted=v.muted||false;v.dataset.lk=1;
  el.innerHTML='';el.appendChild(v);
  drawVoice();
}
function leaveVoice(){
  if(P2P)leaveP2P();
  if(lk){const r=lk;lk=null;try{r.disconnect()}catch{}}
  clearInterval(voiceT);voiceT=null;
  document.querySelectorAll('[data-lk]').forEach(e=>e.remove());
  hideCall();
}
async function toggleMic(){
  if(!lk)return;
  try{
    const on=lk.localParticipant.isMicrophoneEnabled;
    if(!on){
      /* Si el permiso se había revocado, hay que volver a pedirlo */
      const ok=await ensureMic().then(()=>true).catch(()=>false);
      if(!ok)return toast('Sigue bloqueado el micrófono: revisa los permisos del sitio.','warn',6000);
    }
    await lk.localParticipant.setMicrophoneEnabled(!on);
  }catch(e){return toast('El navegador bloqueó el micrófono: '+e.message,'err',6000)}
  drawVoice();
}
let voiceT=null;
async function drawVoice(){
  const g=$('vp'),c=$('vc');if(!g||!c||!cur)return;
  if(!lk&&!P2P){
    if(!voiceT)voiceT=setInterval(drawVoice,1500);
    g.innerHTML='<span class="mu"><i class="fa-solid fa-microphone-slash"></i> Chat de voz apagado · Únete si deseas escuchar</span>';
    c.innerHTML=p2pBar();
    return;
  }
  /* Llamada P2P gratuita */
  if(P2P&&!lk){
    if(!voiceT)voiceT=setInterval(drawVoice,1500);
    const n=Object.keys(P2P.peers||{}).length;
    g.innerHTML=`<span class="vc sp"><i class="fa-solid fa-phone"></i> Tú ${av(P[me.id]||{},24)}
        <i class="fa-solid fa-microphone${P2P.mic?'':'-slash'}"></i></span>
      ${n?`<span class="mu">${n} en la llamada</span>`:'<span class="mu">esperando a alguien…</span>'}`;
    c.innerHTML=`<button onclick="toggleMicP()" title="Micrófono"><i class="fa-solid fa-microphone${P2P.mic?'':'-slash'}"></i></button>
      <button onclick="toggleCamP()" title="Cámara"><i class="fa-solid fa-video${P2P.cam?'':'-slash'}"></i></button>
      <button class="d" onclick="leaveP2P()" title="Colgar"><i class="fa-solid fa-phone-slash"></i></button>`;
    const box=$('callbox');
    if(!box){
      const b=document.createElement('div');b.id='callbox';
      b.innerHTML=`<div class="ch"><i class="fa-solid fa-phone" style="color:var(--ac)"></i><b>Llamada P2P</b></div>
        <div class="vgrid" id="vgrid"></div>`;
      document.body.appendChild(b);
    }
    return;
  }
  clearInterval(voiceT);voiceT=null;
  const lp=lk.localParticipant;
  const ps=[lp,...lk.remoteParticipants.values()];
  await prof(ps.map(p=>p.identity));

  /* Franja de participantes en la barra de la sala */
  g.innerHTML=ps.map(p=>{const u=P[p.identity]||{name:p.name};
    return `<span class="vc ${p.isSpeaking?'sp':''}" onclick="openProfile('${p.identity}')" style="cursor:pointer">
      ${av(u,26)}<b style="color:${esc(u.accent||'')}">${esc(u.name||p.name)}</b>
      <i class="fa-solid fa-microphone${p.isMicrophoneEnabled?'':'-slash'}"></i>
      ${p.isCameraEnabled?'<i class="fa-solid fa-video"></i>':''}</span>`}).join('')
    ||'<span class="mu">Sin participantes</span>';

  /* Botones: micro, cámara y colgar */
  c.innerHTML=`<button onclick="toggleMic()" title="Micrófono"><i class="fa-solid fa-microphone${lp.isMicrophoneEnabled?'':'-slash'}"></i></button>
    <button onclick="toggleCam()" title="Cámara"><i class="fa-solid fa-video${lp.isCameraEnabled?'':'-slash'}"></i></button>
    <button class="d" onclick="leaveVoice();drawVoice()" title="Colgar"><i class="fa-solid fa-phone-slash"></i></button>`;

  /* Panel flotante con los vídeos */
  let box=$('callbox');
  if(!box){
    box=document.createElement('div');box.id='callbox';
    box.innerHTML=`<div class="ch"><i class="fa-solid fa-phone" style="color:var(--ac)"></i>
        <b>Llamada en curso</b><span class="mu grow" style="text-align:right" id="ctime"></span></div>
      <div class="vgrid" id="vgrid"></div>`;
    document.body.appendChild(box);
  }
  const grid=$('vgrid');
  const conCam=[...lk.remoteParticipants.values()].filter(p=>p.isCameraEnabled);
  grid.className='vgrid'+(conCam.length<=1?' one':'');
  /* Borra las miniaturas de quien apagó la cámara o se fue */
  [...grid.children].forEach(el=>{
    const p=lk.remoteParticipants.get(el.id.slice(2));
    if(!p||!p.isCameraEnabled)el.remove();
  });
  if(!conCam.length&&!lp.isCameraEnabled)box.style.display='none';
  else box.style.display='grid';
}


/* ==========================================================================
   LLAMADA P2P GRATUITA (Trystero)
   WebRTC directo entre navegadores usando rastreadores públicos: no hay
   servidor propio, ni cuentas, ni claves, ni coste. Funciona aunque la
   función de LiveKit NO esté desplegada.
   Límite honesto: es una malla (cada uno se conecta a todos), así que va
   bien hasta ~4-6 personas. Sin TURN, algunas redes muy restrictivas
   (VPN corporativas, móvil detrás de CGNAT) pueden no conectar.
   ========================================================================== */
let TR=null,P2P=null,P2PROOM='';
const TCDN=[
  'https://cdn.jsdelivr.net/npm/trystero@0.21.5/dist/torrent.min.js',
  'https://unpkg.com/trystero@0.21.5/dist/torrent.min.js'
];
function loadTrystero(){
  if(window.Trystero)return Promise.resolve(window.Trystero);
  return new Promise((res,rej)=>{
    let i=0;
    const next=()=>{
      if(i>=TCDN.length)return rej(new Error('No se pudo cargar el módulo de llamada.'));
      const s=document.createElement('script');
      s.src=TCDN[i++];
      s.onload=()=>window.Trystero?res(window.Trystero):next();
      s.onerror=next;
      document.head.appendChild(s);
    };
    next();
  });
}
async function joinP2P(){
  /* Compatibilidad con páginas antiguas que todavía tengan un botón P2P.
     Ya no carga Trystero ni abre llamadas: toda la voz va por LiveKit. */
  return toast('La llamada P2P se retiró. Usa «Voz de la sala» (LiveKit).','warn',7000);
}

function p2pBar(){
  /* La voz va SIEMPRE por LiveKit, con una sala distinta por chat.
     El botón P2P antiguo cargaba Trystero desde CDNs que el navegador
     bloquea (NS_ERROR_CORRUPTED_CONTENT), así que ya no se ofrece. */
  return `<button class="p" onclick="joinVoice()" title="Entra al chat de voz de esta sala"><i class="fa-solid fa-headset"></i> Unirte al chat de voz</button>`;
}
async function toggleMicP(){
  if(!P2P)return;
  P2P.mic=!P2P.mic;
  const a=P2P.audioEl;
  if(a)a.muted=!P2P.mic;
  const act=P2P.act;if(act)act.send({name:me.name,accent:me.accent,avatar:me.avatar,mic:P2P.mic,cam:P2P.cam});
  drawVoice();
}
async function toggleCamP(){
  if(!P2P)return;
  if(!P2P.cam){
    if(!await ensureCam())return toast('El navegador no permite la cámara.','warn',6000);
    try{
      const vs=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480}});
      P2P.cam=true;P2P.vstream=vs;
      const act=P2P.act;if(act)await act.send(vs);
      showLocalCam(mkPrev());
    }catch(e){return toast('No se pudo abrir la cámara: '+e.message,'err',5000)}
  }else{
    P2P.cam=false;P2P.vstream?.getTracks().forEach(t=>t.stop());P2P.vstream=null;
    const act=P2P.act;if(act)await act.send(false);
    $('lprev')?.remove();
  }
  drawVoice();
}
function leaveP2P(){
  if(!P2P)return;
  try{P2P.room.leave()}catch{}
  document.querySelectorAll('[data-lk]').forEach(e=>e.remove());
  hideCall();
  P2P=null;drawVoice();
}

/* ==========================================================================
   13) Mensajes directos
   ========================================================================== */
let userSearchTimer=null;
function queueUsers(){clearTimeout(userSearchTimer);userSearchTimer=setTimeout(listUsers,250)}
function fillDMSide(){
  $('side').innerHTML=`<h3>Mensajes</h3><input id="us" placeholder="Buscar por nick o código" oninput="queueUsers()">
    <div id="ul"></div>`;
}
VIEWS.dms=async()=>{
  fillDMSide();
  await loadCS();listUsers();
};
/* Ajustes personales de cada conversación (tema, color, fondo, fijado) */
async function loadCS(){
  if(!NEWOK||OFFLINE)return;
  const{data,error}=await sb.from('chat_settings').select('*').eq('user_id',me.id);
  if(error){if(isNetError(error))OFFLINE=true;return}
  (data||[]).forEach(r=>CS[r.peer_id]=r);
}
function openCS(peer,row){return sb.from('chat_settings').upsert(row,{onConflict:'user_id,peer_id'})}
function csPanel(peer){
  closeSetPanels();
  const s=CS[peer]||{};
  const d=document.createElement('div');d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="row" style="margin-bottom:12px">
      <b class="grow"><i class="fa-solid fa-palette"></i> Ajustes de la conversación</b>
      <button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="card" style="display:grid;gap:12px">
      <div class="field"><label>Tema</label>${themeGrid(s.theme,`setCS('${peer}','theme',this)`)}</div>
      <div class="field"><label>Color</label>${themeSwatches(s.accent,'setCS',`'${peer}','accent',`)}</div>
      <div class="field"><label>Fondo del chat</label>
        <div class="row"><button class="sm" onclick="pickCSBg('${peer}')"><i class="fa-solid fa-image"></i> Subir</button>
          ${s.bg?'<button class="sm" onclick="setCSBg(\''+peer+'\',null)"><i class="fa-solid fa-eraser"></i> Quitar</button>':''}</div></div>
      <label class="row mu"><input type="checkbox" ${s.pinned?'checked':''}
        onchange="setCS('${peer}','pinned',this.checked)"> Fijar arriba en la lista</label>
    </div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
}
async function setCS(peer,key,v){
  if(!NEWOK)return toast('Los ajustes por chat necesitan 00-instalar-todo.sql.','warn');
  const row={user_id:me.id,peer_id:peer,[key]:v};
  const{error}=await sb.from('chat_settings').upsert(row,{onConflict:'user_id,peer_id'});
  if(error)return toast(error.message,'err');
  CS[peer]={...(CS[peer]||{}),[key]:v};
  if(CS[peer].pinned)toast('Conversación fijada.','ok');
  if(cur&&cur.id===peer&&cur.__dm){openDM(peer)}
  if(view=='dms')listUsers();
}
async function pickCSBg(peer){
  const i=document.createElement('input');i.type='file';i.accept='image/*';
  i.onchange=async()=>{const u=await up(i.files[0]);if(u)setCSBg(peer,u)};i.click();
}
async function setCSBg(peer,bg){
  if(!NEWOK)return;
  const{error}=await sb.from('chat_settings').upsert(
    {user_id:me.id,peer_id:peer,bg},{onConflict:'user_id,peer_id'});
  if(error)return toast(error.message,'err');
  CS[peer]={...(CS[peer]||{}),bg};
  if(cur&&cur.id===peer&&cur.__dm)openDM(peer);
  toast(bg?'Fondo aplicado.':'Fondo quitado.','ok');
}
async function listUsers(){
  if(!$('ul'))return;
  const q=(val('us')||'').replace(/[,()%]/g,'').toLowerCase();
  let rows=[];
  if(OFFLINE){
    rows=Object.values(P).filter(p=>p&&p.id&&p.id!==me.id&&
      (!q||(p.name||'').toLowerCase().includes(q)||(p.uid||'').toLowerCase().includes(q)||(p.profile_code||'').toLowerCase().includes(q)));
  }else{
    let s=sb.from('profiles').select(PROFSEL()).neq('id',me.id).order('name').limit(60);
    if(q)s=s.or(`name.ilike.%${q}%,uid.ilike.%${q}%`+(COLS.profiles.has('profile_code')?`,profile_code.ilike.%${q}%`:''));
    const{data,error}=await s;
    if(error){
      if(isNetError(error)){OFFLINE=true;rows=Object.values(P).filter(p=>p&&p.id&&p.id!==me.id)}
      else if(isMissing(error))return($('ul').innerHTML='<p class="mu">Necesita <b>00-instalar-todo.sql</b>.</p>');
    }else{
      rows=(data||[]);
      rows.forEach(p=>P[p.id]=fx(p));
      scheduleCacheProfiles();
    }
  }
  rows=rows.filter(p=>notBlocked(p.id));
  /* Fijadas primero, luego alfabético */
  rows.sort((a,b)=>((CS[b.id]||{}).pinned?1:0)-((CS[a.id]||{}).pinned?1:0));
  /* Los contadores de no leídos: una sola consulta para toda la lista. */
  await loadUnread();
  $('ul').innerHTML=rows.map(p=>{const cs=CS[p.id]||{};const pin=cs.pinned;
    const n=UNREAD[p.id]||0;
    return `<div class="it" onclick="openDM('${p.id}')">${av(p,40)}<div class="grow">
      <b style="color:${esc(p.accent||'')}">${pin?'<i class="fa-solid fa-thumbtack" style="font-size:11px;color:var(--ac)"></i> ':''}${esc(p.name)}</b>
      <div class="mu">${cs.theme?themeBy(cs.theme)[1]:'Chat privado'}</div></div>
      ${n?`<span class="unread" title="${n} mensaje${n===1?'':'s'} sin leer">${n>99?'99+':n}</span>`:''}
    </div>`}).join('')
    ||'<p class="mu">No hay usuarios con ese nombre.</p>';
}
/* ---------- Mensajes sin leer ----------
   unread_dms() devuelve, por persona, cuántos mensajes hay sin leer.
   Es UNA consulta para toda la lista (no una por chat). */
async function loadUnread(){
  UNREAD={};
  if(!NEWOK||OFFLINE)return UNREAD;
  const r=await sb.rpc('unread_dms').then(x=>x,e=>({error:e}));
  if(r.error){
    /* Si la función no existe (SQL sin aplicar), se cuenta a mano con la
       columna read_at, que también puede faltar: en ese caso no hay aviso. */
    if(!isNoFn(r.error))return UNREAD;
    const{data,error}=await sb.from('dms').select('sender_id',{count:'exact',head:true})
      .eq('receiver_id',me.id).is('read_at',null);
    if(error)return UNREAD;
    const{data:rows}=await sb.from('dms').select('sender_id')
      .eq('receiver_id',me.id).is('read_at',null);
    (rows||[]).forEach(x=>{UNREAD[x.sender_id]=(UNREAD[x.sender_id]||0)+1});
    return UNREAD;
  }
  (r.data||[]).forEach(x=>{UNREAD[x.peer_id]=Number(x.n)||0});
  return UNREAD;
}
/* Marca como leídos los mensajes de esa persona y refresca el círculo. */
async function markDMRead(peer){
  if(!peer)return;
  if(UNREAD[peer]){delete UNREAD[peer];paintUnread()}
  if(!NEWOK||OFFLINE)return;
  const r=await sb.rpc('mark_dms_read',{p_peer:peer}).then(x=>x,e=>({error:e}));
  if(!r.error&&view=='dms'&&$('ul'))paintUnread();
}
/* Repinta solo los círculos, sin volver a pedir la lista entera. */
function paintUnread(){
  const ul=$('ul');if(!ul)return;
  ul.querySelectorAll('.it').forEach(row=>{
    const m=(row.getAttribute('onclick')||'').match(/openDM\('([0-9a-f-]+)'\)/);
    const id=m?m[1]:null;
    const n=id?(UNREAD[id]||0):0;
    let b=row.querySelector('.unread');
    if(!n){if(b)b.remove();return}
    if(!b){
      b=document.createElement('span');b.className='unread';
      row.appendChild(b);
    }
    b.textContent=n>99?'99+':String(n);
    b.title=`${n} mensaje${n===1?'':'s'} sin leer`;
  });
}
async function openDM(id){
  /* Los avisos traen solo id/nombre/avatar: se completa la ficha (con su
     llave pública) antes de abrir la conversación cifrada. */
  if(!P[id]||!P[id].pubkey){
    if(OFFLINE)return toast('Sin conexión: este perfil no está guardado todavía.','warn');
    const{data,error}=await sb.from('profiles').select(PROFSEL()).eq('id',id).maybeSingle();
    if(error&&isNetError(error)){OFFLINE=true;return toast('Sin conexión: este perfil no está guardado todavía.','warn')}
    if(data)P[id]=fx(data);
  }
  if(!P[id])return toast('Perfil no cargado.','err');
  stopProfileMusic();
  leaveVoice();
  PEND=[];
  view='dms';setMobileTitle('dms');
  document.querySelectorAll('#rail button').forEach(b=>b.classList.toggle('on',b.dataset.v==='dms'));
  /* En PC, abrir un DM desde un perfil o una notificación también debe
     recuperar la lista lateral. En móvil queda oculta al abrir el chat. */
  $('app').classList.remove('ns');
  const needSide=!$('side').innerHTML.trim();
  cur={...P[id],__dm:true};document.body.classList.add('open');
  /* Si se abre un DM directamente desde un perfil, los ajustes por chat
     todavía no están en memoria. Se cargan antes de pintar para que el
     fondo/tema de ESTA conversación no se mezcle con el de otra. */
  if(!Object.keys(CS).length) await loadCS();
  const cs=CS[id]||{};
  $('main').innerHTML=`<div class="head">${back}${av(cur,40)}<div class="grow"><h3 style="cursor:pointer" onclick="openProfile('${id}')">${esc(cur.name)}</h3>
      <div class="mu"><i class="fa-solid fa-lock"></i> Cifrado de extremo a extremo</div></div>
      <button class="sm" onclick="openMini('${id}')" title="Mini chat"><i class="fa-solid fa-comment-dots"></i></button>
      <button class="sm" onclick="csPanel('${id}')" title="Ajustes"><i class="fa-solid fa-palette"></i></button>
      <button class="sm d" onclick="blockDlg('${id}')" title="Bloquear"><i class="fa-solid fa-ban"></i></button></div>
    <div class="msgs" id="ms"></div>
    <div id="pendm"></div>
    <div class="comp">
      <button class="sm" onclick="chooseFiles('dm')" title="Adjuntar archivo"><i class="fa-solid fa-paperclip"></i></button>
      <input id="ci" class="grow" placeholder="Escribe un mensaje privado" onkeydown="if(event.key=='Enter')sendDM()">
      <button class="p" onclick="sendDM()">Enviar</button></div>`;
  /* Cada conversación tiene su tema, color y fondo propios.
     Si no hay fondo propio, se usa el del PERFIL del destinatario:
     es una portada de chat, no aparece en su perfil público. */
  paint($('main'),cs.theme||'noir',cs.accent||null,cs.bg||cur.bg||null);
  clearPend('dm');loadDM();
  if(needSide){fillDMSide();listUsers();}
  /* Al abrir la conversación, sus mensajes dejan de contar como pendientes:
     el círculo rojo desaparece de la lista lateral. */
  markDMRead(id);
}

/* ==========================================================================
   13b) Mini chats flotantes (varios a la vez, cada uno con su tema)
   ========================================================================== */
const MINIS={};
function togglePanel(){
  const d=$('mini');
  if(d&&d.children.length){d.remove();return}
  panel();
}
function panel(){
  let d=$('mini');
  if(!d){d=document.createElement('div');d.id='mini';document.body.appendChild(d)}
  d.innerHTML=`<button class="mfab" onclick="miniPicker()" title="Abrir un mini chat"><i class="fa-solid fa-plus"></i></button>`;
  Object.keys(MINIS).forEach(k=>d.appendChild(MINIS[k]));
}
async function miniPicker(){
  const rows=(Object.values(P)).filter(p=>p.id!==me.id&&notBlocked(p.id)).slice(0,40);
  const d=document.createElement('div');d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="row" style="margin-bottom:12px">
      <b class="grow"><i class="fa-solid fa-comment-dots"></i> Abrir mini chat</b>
      <button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <input id="mmq" placeholder="Buscar…" oninput="miniList()" autocomplete="off">
    <div id="mmlist" style="display:grid;gap:4px;margin-top:10px"></div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
  ctxMiniList=rows;miniList();
}
let ctxMiniList=[];
function miniList(){
  /* ids propios (mmq/mmlist): membersDlg() usa mq/mlist y las dos listas
     pueden estar abiertas a la vez. */
  const q=(val('mmq')||'').toLowerCase();
  const rows=ctxMiniList.filter(p=>(p.name||'').toLowerCase().includes(q)||(p.uid||'').toLowerCase().includes(q)||(p.profile_code||'').toLowerCase().includes(q)).slice(0,20);
  $('mmlist').innerHTML=rows.map(p=>`<div class="it" onclick="this.closest('.preview').remove();openMini('${p.id}')">
      ${av(p,32)}<div class="grow"><b>${esc(p.name)}</b></div>
      ${MINIS[p.id]?'<span class="tag">abierto</span>':''}</div>`).join('')
    ||'<p class="mu">Nadie coincide.</p>';
}
async function openMini(id){
  if(!P[id])return toast('Perfil no cargado.','err');
  if(MINIS[id])return;
  if(!Object.keys(CS).length) await loadCS();
  if(MINIS[id])return;
  const cs=CS[id]||{};
  const box=document.createElement('div');
  box.className='mini chat';
  box.innerHTML=`<div class="head">${av(P[id],28)}<div class="grow"><b>${esc(P[id].name||'?')}</b></div>
      <button class="sm" onclick="closeMini('${id}')"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="msgs"></div>
    <div class="comp"><input class="grow" placeholder="Mensaje" onkeydown="if(event.key=='Enter')sendMini('${id}')">
      <button class="sm" onclick="sendMini('${id}')"><i class="fa-solid fa-paper-plane"></i></button></div>`;
  paint(box,cs.theme||'noir',cs.accent||null,cs.bg||P[id].bg||null);
  MINIS[id]=box;panel();
  await loadMini(id);
  setInterval(()=>{if(MINIS[id]&&document.body.contains(MINIS[id]))loadMini(id)},8000);
}
function closeMini(id){
  MINIS[id]?.remove();delete MINIS[id];panel();
}
async function loadMini(id){
  const box=MINIS[id];if(!box)return;
  const p=P[id];if(!p||!p.pubkey)return;
  let data=null;
  if(OFFLINE){
    const cached=cacheRead(me.id,'dm_'+id,[]);
    data=Array.isArray(cached)?cached:null;
  }else{
    const r=await sb.from('dms').select('*')
      .or(`and(sender_id.eq.${me.id},receiver_id.eq.${p.id}),and(sender_id.eq.${p.id},receiver_id.eq.${me.id})`)
      .order('created_at',{ascending:false}).limit(30);
    if(r.error&&isNetError(r.error)){OFFLINE=true;data=cacheRead(me.id,'dm_'+id,null)}
    else data=r.data;
  }
  if(!data||!data.length)return(box.querySelector('.msgs').innerHTML='<div class="empty" style="padding:18px">Sin mensajes</div>');
  /* En modo sin conexión el caché ya contiene la lista descifrada. */
  if(OFFLINE&&data[0]&&data[0].t!==undefined){
    const L=data;
    const h=L.map(x=>{
      const bs=bubbleStyle(x.who);
      return x.kind=='me'?`<div class="act">${esc(x.name)} ${esc(x.t)}</div>`
      :`<div class="m ${x.mine?'me':''}"><div><div class="mu" style="font-size:11px">${esc(x.name)}</div>
        <div class="b ${x.kind=='roll'?'roll':''}" ${bs?`data-b="1" style="${bs}"`:''}>${esc(x.t)}${attHtml(x.att)}</div></div></div>`}).join('');
    const el=box.querySelector('.msgs');
    if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;el.scrollTop=el.scrollHeight}
    return;
  }
  try{
    await loadShopCache([me.bubble_id,p.bubble_id]);
    const k=await peerKey(p);
    const L=[];
    for(const x of data.slice().reverse()){
      const u=x.sender_id==me.id?me:p;
      L.push({kind:x.kind,mine:x.sender_id==me.id,who:u,name:u.name,ac:u.accent,
              time:hm(x.created_at),t:await dec(k,x.body),att:x.attachments});
    }
    cacheDM(id,L);
    const h=L.map(x=>{
      const bs=bubbleStyle(x.who);
      return x.kind=='me'?`<div class="act">${esc(x.name)} ${esc(x.t)}</div>`
      :`<div class="m ${x.mine?'me':''}"><div><div class="mu" style="font-size:11px">${esc(x.name)}</div>
        <div class="b ${x.kind=='roll'?'roll':''}" ${bs?`data-b="1" style="${bs}"`:''}>${esc(x.t)}${attHtml(x.att)}</div></div></div>`}).join('');
    const el=box.querySelector('.msgs');
    if(el.dataset.h!==h){el.dataset.h=h;el.innerHTML=h;el.scrollTop=el.scrollHeight}
  }catch(e){console.warn('mini',e.message)}
}
async function sendMini(id){
  if(OFFLINE)return toast('Sin conexión: no se puede enviar ahora.','warn');
  const box=MINIS[id];if(!box)return;
  const i=box.querySelector('input');const t=i.value.trim();
  if(!t)return;
  const p=P[id];if(!p.pubkey)return toast('Sin llave de cifrado.','err');
  const{error}=await sb.from('dms').insert(fit('dms',{receiver_id:id,body:await enc(await peerKey(p),t)}));
  if(error)return toast(error.message,'err');
  notify(id,'dm','Nuevo mensaje de '+me.name);
  i.value='';await loadMini(id);
}
async function loadDM(){
  const p=cur;if(!p||!p.__dm)return;
  if(!p.pubkey)return($('ms').innerHTML=empty('Este usuario aún no tiene llave de cifrado.'));
  if(OFFLINE){
    const L=cacheRead(me.id,'dm_'+p.id,[]);
    return drawMsgs(Array.isArray(L)&&L.length?L:[{kind:'sys',t:'Sin conexión. Aún no hay mensajes guardados de esta conversación.'}]);
  }
  const{data,error}=await sb.from('dms').select('*')
    .or(`and(sender_id.eq.${me.id},receiver_id.eq.${p.id}),and(sender_id.eq.${p.id},receiver_id.eq.${me.id})`)
    .order('created_at').limit(200);
  if(error&&isNetError(error)){
    OFFLINE=true;
    const L=cacheRead(me.id,'dm_'+p.id,[]);
    return drawMsgs(Array.isArray(L)?L:[]);
  }
  const peer=P[p.id]||p;
  await loadShopCache([me.bubble_id,peer.bubble_id]);
  const k=await peerKey(p),L=[];
  for(const x of data||[]){const u=x.sender_id==me.id?me:peer;
    L.push({kind:x.kind,mine:x.sender_id==me.id,who:u,name:u.name,ac:u.accent,time:hm(x.created_at),t:await dec(k,x.body),att:x.attachments})}
  cacheDM(p.id,L);
  if(cur===p)drawMsgs(L);
}
async function sendDM(){
  if(OFFLINE)return toast('Sin conexión: el mensaje no se puede enviar todavía.','warn');
  const t=val('ci');if((!t&&!PEND.length)||!cur||!cur.pubkey)return;
  const row={receiver_id:cur.id,body:await enc(await peerKey(cur),t||'')};
  if(PEND.length)row.attachments=PEND;
  const{error}=await sb.from('dms').insert(fit('dms',row));
  if(error)return toast(error.message,'err');
  notify(cur.id,'dm','Nuevo mensaje de '+me.name);$('ci').value='';clearPend('dm');loadDM();
}

/* ==========================================================================
   14) Comunidades
   ========================================================================== */
function isMod(cid){
  const cp=CP[cid+me.id];
  const role=cp&&typeof cp==='object'?cp.role:cp;
  return role==='owner'||role==='mod';
}
function rcComm(c){
  const img=c.cover||c.banner||'';
  return `<div class="rc" onclick="openComm('${c.id}')">
    <div class="cv" style="${img?`background-image:url('${esc(img)}')`:''}">
      ${c.nsfw?'<span class="tag tg" style="color:var(--rd);background:rgba(9,9,10,.78)">NSFW</span>':''}</div>
    <div class="rb"><b>${esc(c.name)}</b>
      <div class="row w"><span class="tag">${esc(c.category||'General')}</span>
        <span class="tag">${c.join_mode=='request'?'Por solicitud':'Abierta'}</span></div>
      <div class="mu">${esc(c.description||'')}</div></div></div>`;
}
VIEWS.comms=async()=>{
  await loadMyRoles();
  CTHEME='noir';BANNER=null;CBG=null;
  const canJoinMode=COLS.communities.has('join_mode');
  $('main').innerHTML=`<div class="feed wide">
    <details class="panel" open>
      <summary style="cursor:pointer;list-style:none">
        <b><i class="fa-solid fa-circle-plus" style="color:var(--ac)"></i> Crear comunidad</b></summary>
      <div class="pbody">
        <div class="field"><label>Nombre de la comunidad</label>
          <input id="cn" placeholder="Ej. Club de Rol" oninput="commPrev()"></div>
        <div class="field"><label>Descripción</label>
          <input id="cd" placeholder="¿De qué va esta comunidad?" oninput="commPrev()"></div>
        <div class="field"><label>Categoría</label>
          <input id="cg" placeholder="General" value="General"></div>
        <div class="field"><label>Reglas <span class="mu">(una por línea)</span></label>
          <textarea id="cr" placeholder="Respeta a los demás&#10;No publiques spam"></textarea></div>
        <div class="field"><label>Imágenes</label>
          <div class="row w"><button class="sm" onclick="pickBanner()"><i class="fa-solid fa-flag"></i> Banner</button>
            <button class="sm" onclick="pickCbg()"><i class="fa-solid fa-palette"></i> Fondo</button>
            <button class="sm" onclick="$('ccv').click()"><i class="fa-solid fa-image"></i> Portada</button>
            <input id="ccv" type="file" accept="image/*" style="display:none" onchange="commPrev()"></div>
          <span class="mu">El banner es la cabecera; la portada se ve en la lista; el fondo va detrás del blog.</span></div>
        <div class="field"><label>Estilo del blog</label>
          <div class="themes">${TH.map(t=>`<button class="thm ${t[0]=='noir'?'on':''}" id="thm_${t[0]}"
              onclick="setCommTheme('${t[0]}')"><span class="pv" style="background:linear-gradient(135deg,${THCV[t[0]][0]} 60%,#ffffff22)"></span>${t[1]}</button>`).join('')}</div></div>
        <div class="field"><label>Entrada de nuevos miembros</label>
          ${canJoinMode?`<select id="cjm"><option value="open">Abierta — cualquiera se une</option>
            <option value="request">Por solicitud — apruebas tú</option></select>`
            :`<p class="mu"><i class="fa-solid fa-triangle-exclamation"></i> Las solicitudes de entrada necesitan <b>00-instalar-todo.sql</b>.</p>`}</div>
        <label class="row mu"><input type="checkbox" id="cx" onchange="commPrev()">
          <span>Contenido NSFW <i class="fa-solid fa-circle-info" title="Se mostrará una etiqueta de advertencia"></i></span></label>
        <div id="cprev"></div>
        <button type="button" class="p" onclick="mkComm()"><i class="fa-solid fa-paper-plane"></i> Crear comunidad</button>
      </div>
    </details>
    <div class="grid" id="cl" style="padding:0"></div></div>`;
  const{data,error}=await sb.from('communities').select('*').order('created_at',{ascending:false});
  if(error)return($('cl').innerHTML=empty(esc(error.message)));
  $('cl').innerHTML=(data||[]).map(rcComm).join('')||empty('Aún no hay comunidades. Crea la primera arriba.');
  commPrev();
};
/* Colores de muestra de cada estilo del blog */
const THCV={noir:['#121214'],rosa:['#4a2530'],papel:['#efe9e4'],sangre:['#1c0609']};
let CTHEME='noir';
function setCommTheme(t){
  CTHEME=t;
  document.querySelectorAll('[id^="thm_"]').forEach(b=>b.classList.toggle('on',b.id==='thm_'+t));
  commPrev();
}
let BANNER=null,CBG=null;
function pickBanner(){
  const i=document.createElement('input');i.type='file';i.accept='image/*';
  i.onchange=async()=>{const u=await up(i.files[0]);if(u){BANNER=u;commPrev();toast('Banner listo. Guárdalo al crear.','ok')}};
  i.click();
}
function pickCbg(){
  const i=document.createElement('input');i.type='file';i.accept='image/*';
  i.onchange=async()=>{const u=await up(i.files[0]);if(u){CBG=u;commPrev();toast('Fondo listo. Guárdalo al crear.','ok')}};
  i.click();
}
async function setCommField(field,id){
  const i=document.createElement('input');i.type='file';i.accept='image/*';
  i.onchange=async()=>{
    const u=await up(i.files[0]);if(!u)return;
    const{error}=await sb.from('communities').update({[field]:u}).eq('id',id);
    if(error)return toast(error.message,'err');
    toast(field=='banner'?'Banner actualizado.':'Fondo actualizado.','ok');
    if(CC)await go('comm');else await go('feed');
  };
  i.click();
}
function commPrev(){
  const box=$('cprev');if(!box)return;
  const th=THCV[CTHEME]||THCV.noir;
  const name=val('cn')||'Tu comunidad';
  box.innerHTML=`<div class="mu" style="text-transform:uppercase;letter-spacing:.08em;font-size:11px">Vista previa</div>
    <div class="rc" style="pointer-events:none">
      <div class="cv" style="height:96px;background:${th[0]};${BANNER?`background-image:url('${esc(BANNER)}');background-size:cover;background-position:center`:''}"></div>
      <div class="rb"><b style="${CTHEME=='papel'?'color:#1b1b1b':''}">${esc(name)}</b>
        <div class="row w"><span class="tag">${esc(val('cg')||'General')}</span>
          ${$('cx')&&$('cx').checked?'<span class="tag" style="color:var(--rd)">NSFW</span>':''}
          ${COLS.communities.has('join_mode')?`<span class="tag">${val('cjm')=='request'?'Por solicitud':'Abierta'}</span>`:''}</div>
        <div class="mu">${esc(val('cd')||'Sin descripción todavía.')}</div></div></div>`;
}

async function mkComm(){
  const name=val('cn');if(!name)return toast('Ponle un nombre a la comunidad.','err');
  const cover=await fu('ccv');
  /* fit() descarta las columnas que aún no existen: sin esto, mandar
     join_mode en una base sin esa columna devolvía PGRST204 y no creaba nada. */
  const row=fit('communities',{name,description:val('cd'),rules:val('cr'),
    category:val('cg')||'General',nsfw:$('cx').checked,cover,theme:CTHEME,
    join_mode:val('cjm')||'open',banner:BANNER||null,bg:CBG||null});
  const{data,error}=await sb.from('communities').insert(row).select().single();
  if(error)return toast(explain(error),'err',9000);
  /* Los memberships son secundarios: si fallan, la comunidad sigue existiendo */
  await sb.from('community_members').insert({community_id:data.id,user_id:me.id,role:'owner'}).then(r=>r.error&&console.warn('miembros:',r.error.message));
  await sb.from('community_profiles').insert({community_id:data.id,user_id:me.id,role:'owner'}).then(r=>r.error&&console.warn('perfil:',r.error.message));
  /* Toda comunidad nace con su chat general. Si las salas fallan, la
     comunidad se crea igual y se puede añadir una sala desde su página. */
  try{
    const rk=b64(crypto.getRandomValues(new Uint8Array(18)));
    const code=b64(crypto.getRandomValues(new Uint8Array(9))).replace(/[^a-z0-9]/gi,'').slice(0,8).toUpperCase();
    const{data:room,error:re}=await sb.from('rooms').insert(fit('rooms',
      {name:'Chat general',topic:data.description||'Chat de la comunidad',kind:'rol',
       room_key:rk,community_id:data.id,invite_code:code})).select().single();
    if(!re&&room){
      RM[room.id]=room;
      await sb.from('room_members').insert({room_id:room.id,user_id:me.id}).then(()=>{},()=>{});
    }
  }catch(e){console.warn('sala inicial:',e)}
  toast('Comunidad creada.','ok');
  await openComm(data.id);
}
let CC=null;
function exitComm(){CC='';FC='';go('comms')}

async function openComm(id){
  CC=id;FC=id;FB='recent';
  await go('comm');
}

/* Página propia de la comunidad: no comparte el inicio (peoplebar, widgets,
   historias ni el compositor global). Aquí solo viven su banner, sus reglas,
   sus miembros, sus publicaciones y sus Reels. */
VIEWS.comm=async()=>{
  if(!CC){await go('comms');return}
  const{data:c,error}=await sb.from('communities').select('*').eq('id',CC).maybeSingle();
  if(error||!c){toast('No se encontró la comunidad.','err');CC='';FC='';await go('comms');return}
  CM=c;FC=c.id;
  const mt=document.getElementById('mtitle');if(mt)mt.textContent=c.name||'Comunidad';
  const cbg=c.bg?`<div class="cbg" style="background-image:url('${esc(c.bg)}')"></div>`:'';
  const vis=TABS.filter(t=>LAY.tabs[t[0]]);
  const tabs=vis.length?vis:TABS;
  if(!tabs.some(t=>t[0]==FB))FB=(tabs.find(t=>t[0]=='recent')||tabs[0])[0];
  const seg=tabs.map(t=>`<button class="${FB==t[0]?'on':''}" onclick="setTab('${t[0]}')">
      <i class="fa-solid ${t[1]}"></i><span>${t[2]}</span></button>`).join('');
  COMP_MODE='';
  $('main').innerHTML=`${cbg}<div class="feed wide th-${c.theme||'noir'}">
    <div id="commpanel" class="card" style="margin:14px 18px 0;padding:0;overflow:hidden"></div>
    <div class="row" style="margin-top:12px">
      <div class="segbar grow">${seg}</div>
      <button class="sm" onclick="go('comms')" title="Volver a comunidades"><i class="fa-solid fa-arrow-left"></i></button>
    </div>
    <details class="newpost" id="newpost" ontoggle="composerToggle(this)">
      <summary>
        ${av(me,40)}
        <span class="nptxt grow"><b>¿Qué quieres publicar en ${esc(c.name)}?</b><span>Publicación con fotos, blog o encuesta · o un vídeo / Reel</span></span>
        <span class="npbtn"><i class="fa-solid fa-plus"></i></span>
      </summary>
      <div class="comp2 hide" id="comp">
        <div class="row">
          ${av(me,40)}
          <span class="tag" style="max-width:56%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            <i class="fa-solid fa-people-group"></i> ${esc(c.name)}</span>
          <button class="sm" style="margin-left:auto" onclick="composerHome()" title="Cambiar tipo"><i class="fa-solid fa-arrow-left"></i></button>
          <button class="sm" onclick="closeComposer()" title="Cerrar"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div id="cmpBody"></div>
      </div>
    </details>
    <div class="mas" id="pl"></div>
    <div id="fm" style="display:grid;justify-items:center"></div>
  </div>`;
  await drawComm();
  renderComposer();
  await loadFeed(1);
};

async function drawComm(){
  const box=$('commpanel');if(!box)return;
  const{data:c}=await sb.from('communities').select('*').eq('id',CC).maybeSingle();
  if(!c)return;
  COMM[c.id]=c;
  const[{data:cp},{data:mem}]=await Promise.all([
    sb.from('community_profiles').select('*').eq('community_id',CC).eq('user_id',me.id).maybeSingle(),
    sb.from('community_profiles').select('*').eq('community_id',CC).order('xp',{ascending:false}).limit(150)]);
  const role=cp?cp.role:'none';
  const list=mem||[];
  await prof(list.map(m=>m.user_id));
  await refreshActivity(list.map(m=>m.user_id));
  const{data:req}=await sb.from('join_requests').select('*').eq('community_id',CC).eq('status','pending');
  if(req&&req.length)await prof(req.map(r=>r.user_id));
  const{data:rooms}=NEWOK
    ? await sb.from('rooms').select('*').eq('community_id',CC).order('created_at',{ascending:false}).limit(40)
    : {data:[]};
  (rooms||[]).forEach(r=>RM[r.id]=r);
  const mine=role!=='none';
  const mod=role==='owner'||role==='mod';
  const owner=c.owner===me.id;
  const activos=list.filter(m=>activeNow(P[m.user_id])).length;
  const head=c.banner||c.cover||c.bg||'';
  const rules=(c.rules||'').split('\n').map(x=>x.trim()).filter(Boolean);
  const orden=list.slice().sort((a,b)=>{
    const A=P[a.user_id]||{},B=P[b.user_id]||{};
    return (activeNow(B)?1:0)-(activeNow(A)?1:0)||(b.xp||0)-(a.xp||0);
  });
  box.innerHTML=`
    <div class="cmhead">
      ${head?`<img class="cmbanner" src="${esc(head)}" alt="" loading="lazy" onerror="this.remove()">`:''}
      <span class="cmhead-ov"></span>
      <div class="row w">
        <button class="sm" onclick="exitComm()" title="Volver"><i class="fa-solid fa-chevron-left"></i></button>
        <div class="grow" style="min-width:170px">
          <h2 style="font-size:23px">${esc(c.name)}</h2>
          <div class="row w" style="margin-top:4px">
            <span class="tag">${esc(c.category||'General')}</span>
            ${c.nsfw?'<span class="tag" style="color:var(--rd)"><i class="fa-solid fa-eye-slash"></i> NSFW</span>':''}
            <span class="tag"><i class="fa-solid fa-users"></i> ${list.length}</span>
            <span class="tag" style="color:var(--gn)">${activos} activos</span>
            ${mine?`<span class="tag" style="color:var(--ac)">${rolTag(role)||'Miembro'}</span>`:''}
          </div>
        </div>
        <div class="row" style="margin-left:auto">
          ${mod?`<button class="sm p" onclick="commSettings('${CC}')"><i class="fa-solid fa-pen-to-square"></i> Editar</button>`:''}
          <button class="sm" onclick="rulesDlg('${CC}')" title="Reglas"><i class="fa-solid fa-scroll"></i></button>
        </div>
      </div>
      ${c.description?`<div class="mu" style="max-width:72ch">${esc(c.description)}</div>`:''}
    </div>
    <div class="cmpad">
      <div class="row w">
        ${mine&&role==='owner'?'<span class="tag" style="color:var(--ac)"><i class="fa-solid fa-crown"></i> Eres el líder</span>'
          :mine?`<button class="sm d" onclick="joinC('${CC}')"><i class="fa-solid fa-right-from-bracket"></i> Salir</button>`
          :c.join_mode=='request'?`<button class="p" onclick="askJoin('${CC}')"><i class="fa-solid fa-paper-plane"></i> Solicitar entrar</button>`
          :`<button class="p" onclick="joinC('${CC}')"><i class="fa-solid fa-plus"></i> Unirme</button>`}
        ${mine?`<button class="sm p" onclick="newCommPost()"><i class="fa-solid fa-pen"></i> Publicar</button>`:''}
        ${mine?`<input id="cnick" style="max-width:240px" placeholder="Tu apodo en esta comunidad" value="${esc(cp&&cp.nickname||'')}">
          <button class="sm" onclick="saveNick()">Guardar apodo</button>
          <input id="cav" type="file" accept="image/*" style="width:auto;max-width:180px">
          <button class="sm" onclick="saveCav()">Avatar</button>`:''}
        ${req&&req.length&&mod?`<span class="tag" style="color:var(--ac)">${req.length} solicitudes</span>`:''}
      </div>

      ${req&&req.length&&mod?`<div class="card" style="padding:10px"><b><i class="fa-solid fa-user-check" style="color:var(--ac)"></i> Solicitudes</b>
        ${req.map(r=>`<div class="row">${av(P[r.user_id],28)}<span class="grow">${esc((P[r.user_id]||{}).name||'?')}</span>
          <button class="p sm" onclick="answerReq('${r.id}','accepted')">Aceptar</button>
          <button class="d sm" onclick="answerReq('${r.id}','rejected')">Rechazar</button></div>`).join('')}</div>`:''}

      <div class="cmsection">
        <div class="row"><b class="grow"><i class="fa-solid fa-users" style="color:var(--ac)"></i> Miembros de la comunidad</b>
          <span class="mu">${list.length} miembro${list.length===1?'':'s'} · ${activos} en línea</span>
          <button class="sm" onclick="membersDlg('${CC}')">Ver todos</button></div>
        ${orden.length?`<div class="mgrid">${orden.slice(0,60).map(m=>{
          const u=P[m.user_id]||{id:m.user_id},act=activeNow(u);
          return `<div class="memchip" onclick="openProfile('${m.user_id}')" title="${esc(m.nickname||u.name||'')} · ${act?'activo':'miembro'}">
            ${av(m.avatar?{...u,avatar:m.avatar}:u,42)}
            ${act?'<span class="dot on" style="position:absolute;right:0;bottom:16px"></span>':''}
            <span class="mn">${esc(m.nickname||u.name||'?')}</span></div>`}).join('')}</div>`
          :`<p class="mu">Todavía no hay miembros en esta comunidad.</p>`}
      </div>

      <div class="cmsection">
        <div class="row"><b class="grow"><i class="fa-solid fa-comments" style="color:var(--ac)"></i> Chat y salas de la comunidad</b>
          ${mod?`<button class="sm p" onclick="newCommRoom('${CC}')"><i class="fa-solid fa-plus"></i> Crear sala</button>`:''}</div>
        ${(rooms||[]).length?`<div class="grid" style="padding:0;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))">
          ${(rooms||[]).map(r=>rcRoom(r)).join('')}</div>`
          :'<p class="mu">Esta comunidad aún no tiene salas. Las salas son el chat de la comunidad.</p>'}
      </div>

      <details class="panel" id="commrules"><summary><i class="fa-solid fa-scroll"></i> Blog de reglas</summary>
        <div class="pbody">
          ${rules.length?`<ol class="rulesol">${rules.map(r=>`<li>${esc(r)}</li>`).join('')}</ol>`
            :'<p class="mu">Esta comunidad todavía no ha escrito sus reglas.</p>'}
          ${mod?`<button class="sm" onclick="commSettings('${CC}','rules')"><i class="fa-solid fa-pen"></i> Editar reglas</button>`:''}
        </div>
      </details>

      <div class="cmsection">
        <div class="row"><b class="grow"><i class="fa-solid fa-ranking-star" style="color:var(--ac)"></i> Ranking</b></div>
        ${list.slice(0,20).map((m,i)=>`<div class="rank" onclick="openProfile('${m.user_id}')">
          <b class="n">${i+1}</b>${av(m.avatar?{...P[m.user_id],avatar:m.avatar}:P[m.user_id],32)}
          <div class="grow"><b>${esc(m.nickname||(P[m.user_id]||{}).name||'?')}</b> ${rolTag(m.role)}
            <div class="mu">${m.xp} XP · nivel ${lvOf(m.xp)}${activeNow(P[m.user_id])?' · <span style="color:var(--gn)">activo</span>':''}</div></div>
          ${mod&&m.user_id!==me.id?`<button class="sm" onclick="event.stopPropagation();modMenu('${CC}','${m.user_id}')"><i class="fa-solid fa-shield-halved"></i></button>`:''}
        </div>`).join('')||'<p class="mu">Sin miembros todavía.</p>'}
      </div>

      ${mod?`<div class="row w">
        <button class="sm" onclick="promoteDlg('${CC}')"><i class="fa-solid fa-user-shield"></i> Cambiar roles</button>
        <button class="sm" onclick="reportsDlg('${CC}')"><i class="fa-solid fa-flag"></i> Reportes</button>
        <button class="sm" onclick="badgesDlg('${CC}')"><i class="fa-solid fa-award"></i> Dar insignia</button>
        <button class="sm" onclick="commSettings('${CC}','look')"><i class="fa-solid fa-image"></i> Banner / portada</button>
      </div>`:''}

      ${owner?`<div class="row w"><button class="d sm" onclick="commSettings('${CC}','danger')">
        <i class="fa-solid fa-trash"></i> Eliminar comunidad</button>
        <span class="mu">No se borran las publicaciones: pasan al feed general.</span></div>`:''}
    </div>`;
}

/* ==========================================================================
   Edición de la comunidad: un solo panel a pantalla completa con pestañas.
   General · Aspecto · Publicaciones · Reglas · Miembros · Eliminar
   ========================================================================== */
const CMTABS=[
  ['general','fa-pen','General'],
  ['look','fa-image','Aspecto'],
  ['posts','fa-newspaper','Publicaciones'],
  ['rules','fa-scroll','Reglas'],
  ['mods','fa-users','Miembros'],
  ['danger','fa-triangle-exclamation','Eliminar'],
];
async function commSettings(id,tab='general'){
  closeSetPanels();
  const{data:c}=await sb.from('communities').select('*').eq('id',id).maybeSingle();
  if(!c)return toast('No se encontró la comunidad.','err');
  if(c.owner!==me.id){
    const{data:cp}=await sb.from('community_profiles').select('role')
      .eq('community_id',id).eq('user_id',me.id).maybeSingle();
    if(!cp||(cp.role!=='owner'&&cp.role!=='mod'))
      return toast('Solo el líder y los moderadores pueden editar la comunidad.','err');
  }
  const box=document.createElement('div');
  box.id='commset';box.className='commset';
  box.innerHTML=`<div class="head"><b class="grow"><i class="fa-solid fa-pen-to-square"></i> Editar comunidad</b>
      <span class="mu">${esc(c.name)}</span>
      <button class="sm p" onclick="document.getElementById('commset').remove()"><i class="fa-solid fa-check"></i> Listo</button></div>
    <div class="body">
      <div class="settabs">${CMTABS.map(t=>`<button class="${tab==t[0]?'on':''}" onclick="commSettings('${id}','${t[0]}')">
        <i class="fa-solid ${t[1]}"></i> ${t[2]}</button>`).join('')}</div>
      <div class="setpane" id="cmpane">cargando…</div>
    </div>`;
  document.body.appendChild(box);
  const pane=$('cmpane');

  if(tab=='general'){
    pane.innerHTML=`
      <div class="field"><label>Título de la comunidad</label><input id="cmname" value="${esc(c.name)}" maxlength="80"></div>
      <div class="field"><label>Descripción</label><textarea id="cmdesc" placeholder="¿De qué va esta comunidad?">${esc(c.description||'')}</textarea></div>
      <div class="row" style="gap:12px;align-items:flex-end">
        <div class="field grow"><label>Categoría</label><input id="cmcat" value="${esc(c.category||'General')}"></div>
        <div class="field grow"><label>Entrada de nuevos miembros</label>
          <select id="cmjoin">
            <option value="open" ${c.join_mode!='request'?'selected':''}>Abierta — cualquiera se une</option>
            <option value="request" ${c.join_mode=='request'?'selected':''}>Por solicitud — apruebas tú</option>
          </select></div>
      </div>
      <label class="tog"><i class="fa-solid fa-eye-slash"></i>
        <span>Comunidad NSFW <span class="mu">(las publicaciones se ven ocultas)</span></span>
        <input type="checkbox" id="cmnsfw" ${c.nsfw?'checked':''} style="width:auto;margin-left:auto"></label>
      ${COLS.communities.has('nsfw')?'':`<p class="mu"><i class="fa-solid fa-triangle-exclamation"></i> Para guardar esta opción ejecuta <b>sql/01-comunidades-nsfw.sql</b>.</p>`}
      <button class="p" onclick="saveCommGeneral('${id}')"><i class="fa-solid fa-floppy-disk"></i> Guardar cambios</button>`;
  }

  if(tab=='look'){
    pane.innerHTML=`
      <div class="field"><label>Banner · cabecera de la comunidad</label>
        <div class="row"><button class="sm" onclick="pickCommImg('${id}','banner')"><i class="fa-solid fa-flag"></i> Subir banner</button>
          ${c.banner?`<button class="sm d" onclick="clearCommImg('${id}','banner')"><i class="fa-solid fa-eraser"></i> Quitar</button>`:''}</div>
        ${c.banner?`<div class="cv" style="height:104px;border-radius:12px;background-image:url('${esc(c.banner)}')"></div>`:''}</div>
      <div class="field"><label>Portada · se ve en la lista de comunidades</label>
        <div class="row"><button class="sm" onclick="pickCommImg('${id}','cover')"><i class="fa-solid fa-image"></i> Subir portada</button>
          ${c.cover?`<button class="sm d" onclick="clearCommImg('${id}','cover')"><i class="fa-solid fa-eraser"></i> Quitar</button>`:''}</div>
        ${c.cover?`<div class="cv" style="height:92px;border-radius:12px;background-image:url('${esc(c.cover)}')"></div>`:''}</div>
      <div class="field"><label>Fondo del blog</label>
        <div class="row"><button class="sm" onclick="pickCommImg('${id}','bg')"><i class="fa-solid fa-palette"></i> Subir fondo</button>
          ${c.bg?`<button class="sm d" onclick="clearCommImg('${id}','bg')"><i class="fa-solid fa-eraser"></i> Quitar</button>`:''}</div>
        <span class="mu">Se ve detrás de la comunidad, con opacidad baja.</span></div>
      <div class="field"><label>Tema del blog</label>
        <div class="themes">${TH.map(t=>`<button class="thm ${(c.theme||'noir')==t[0]?'on':''}" onclick="setCommStyle('${id}','${t[0]}')">
          <span class="pv" style="background:linear-gradient(135deg,${THCV[t[0]][0]} 60%,#ffffff22)"></span>${t[1]}</button>`).join('')}</div></div>`;
  }

  if(tab=='posts'){
    const{data:ps}=await sb.from('posts').select('id,author,title,body,kind,is_pinned,created_at')
      .eq('community_id',id).order('created_at',{ascending:false}).limit(40);
    await prof((ps||[]).map(p=>p.author));
    pane.innerHTML=`
      <div class="row"><b class="grow"><i class="fa-solid fa-newspaper"></i> Publicaciones de la comunidad</b>
        <span class="tag">${(ps||[]).length}</span>
        <button class="sm p" onclick="newCommPost()"><i class="fa-solid fa-plus"></i> Crear</button></div>
      <p class="mu">Aquí puedes añadir contenido y borrar publicaciones. Solo se borra la publicación elegida.</p>
      <div style="display:grid;gap:4px">
      ${(ps||[]).length?(ps||[]).map(p=>{
        const u=P[p.author]||{id:p.author};
        const txt=p.title||(p.body||'').replace(/\s+/g,' ').slice(0,70)||'(sin texto)';
        return `<div class="memrow">${av(u,34)}
          <div class="grow"><b>${esc(txt)}</b>
            <div class="mu">${esc(u.name||'?')} · ${new Date(p.created_at).toLocaleString()}${p.is_pinned?' · fijada':''}</div></div>
          <button class="sm" onclick="pinPost('${p.id}',${!p.is_pinned})" title="${p.is_pinned?'Desfijar':'Fijar'}">
            <i class="fa-solid fa-thumbtack"></i></button>
          <button class="sm d" onclick="delCommPost('${id}','${p.id}')" title="Borrar publicación">
            <i class="fa-solid fa-trash"></i></button></div>`;
      }).join(''):'<p class="mu">Todavía no hay publicaciones en esta comunidad.</p>'}
      </div>`;
  }

  if(tab=='rules'){
    pane.innerHTML=`
      <div class="field"><label>Reglas · una por línea</label>
        <textarea id="cmrules" style="min-height:240px" placeholder="Respeta a los demás&#10;No publiques spam">${esc(c.rules||'')}</textarea></div>
      <p class="mu">Se muestran numeradas en la comunidad y en el widget del inicio.</p>
      <button class="p" onclick="saveCommRules('${id}')"><i class="fa-solid fa-floppy-disk"></i> Guardar reglas</button>`;
  }

  if(tab=='mods'){
    const{data:mem}=await sb.from('community_profiles').select('*').eq('community_id',id)
      .order('xp',{ascending:false}).limit(150);
    await prof((mem||[]).map(m=>m.user_id));
    await refreshActivity((mem||[]).map(m=>m.user_id));
    pane.innerHTML=`<div class="row"><b class="grow"><i class="fa-solid fa-users"></i> Miembros y roles</b>
        <span class="tag">${(mem||[]).length}</span></div>
      <div style="display:grid;gap:4px">
      ${(mem||[]).map(m=>{const u=P[m.user_id]||{id:m.user_id};const on=activeNow(u);
        return `<div class="memrow">${av(m.avatar?{...u,avatar:m.avatar}:u,36)}
          <div class="grow"><b>${esc(m.nickname||u.name||'?')}</b>
            ${m.role=='owner'?'<span class="tag" style="color:var(--ac)">Líder</span>':m.role=='mod'?'<span class="tag">Moderador</span>':''}
            <div class="mu">${m.xp||0} XP ${on?'· <span style="color:var(--gn)">activo</span>':''}</div></div>
          ${m.user_id!==me.id?`<button class="sm" onclick="modMenu('${id}','${m.user_id}')" title="Moderar"><i class="fa-solid fa-shield-halved"></i></button>`:''}
        </div>`}).join('')||'<p class="mu">Sin miembros.</p>'}
      </div>`;
  }

  if(tab=='danger'){
    pane.innerHTML=`
      <div class="card" style="border-color:var(--rd);background:rgba(255,107,125,.06)">
        <h3 style="color:var(--rd)"><i class="fa-solid fa-triangle-exclamation"></i> Eliminar esta comunidad</h3>
        <p>Se borran la comunidad, sus ajustes, sus perfiles internos, solicitudes e insignias.</p>
        <p class="mu"><b>No</b> se borran las publicaciones ni las salas: pasan al feed general.</p>
        ${c.owner===me.id
          ?`<button class="d" onclick="delCommDlg('${id}')"><i class="fa-solid fa-trash"></i> Eliminar comunidad</button>`
          :'<p class="mu">Solo el dueño puede eliminar la comunidad.</p>'}
      </div>`;
  }
}

/* ---------- Guardar ajustes de comunidad ---------- */
async function saveCommGeneral(id){
  const name=val('cmname').trim();
  if(!name)return toast('El título no puede estar vacío.','err');
  const row=fit('communities',{name,description:val('cmdesc'),
    category:val('cmcat')||'General',
    nsfw:!!($('cmnsfw')&&$('cmnsfw').checked)});
  if(COLS.communities.has('join_mode'))row.join_mode=$('cmjoin')?$('cmjoin').value:'open';
  const{error}=await sb.from('communities').update(row).eq('id',id);
  if(error)return toast(explain(error),'err',8000);
  COMM[id]={...(COMM[id]||{}),...row};
  toast('Comunidad actualizada.','ok');
  await drawComm();commSettings(id,'general');
  if(view==='feed'||view==='comm')loadFeed(1);
}
async function saveCommRules(id){
  const{error}=await sb.from('communities').update({rules:val('cmrules')}).eq('id',id);
  if(error)return toast(explain(error),'err',8000);
  toast('Reglas guardadas.','ok');
  await drawComm();commSettings(id,'rules');
  if(view==='feed'||view==='comm')loadFeed(1);
}
async function setCommStyle(id,theme){
  const{error}=await sb.from('communities').update({theme}).eq('id',id);
  if(error)return toast(explain(error),'err',8000);
  COMM[id]={...(COMM[id]||{}),theme};
  toast('Tema actualizado.','ok');
  await drawComm();commSettings(id,'look');
  if(view==='feed'||view==='comm')loadFeed(1);
}
async function setCommImg(id,field,url){
  const{error}=await sb.from('communities').update({[field]:url}).eq('id',id);
  if(error)return toast(explain(error),'err',8000);
  COMM[id]={...(COMM[id]||{}),[field]:url};
  toast(url?'Imagen actualizada.':'Imagen quitada.','ok');
  await drawComm();commSettings(id,'look');
  if(view==='feed'||view==='comm')loadFeed(1);
}
function pickCommImg(id,field){
  const i=document.createElement('input');i.type='file';i.accept='image/*';
  i.onchange=async()=>{const u=await up(i.files[0]);if(u)await setCommImg(id,field,u)};
  i.click();
}
function clearCommImg(id,field){setCommImg(id,field,null)}
async function newCommRoom(cid){
  const name=prompt('Nombre de la sala de la comunidad:');
  if(!name)return;
  const topic=prompt('Descripción de la sala (opcional):','')||'';
  const rk=b64(crypto.getRandomValues(new Uint8Array(18)));
  const code=b64(crypto.getRandomValues(new Uint8Array(9))).replace(/[^a-z0-9]/gi,'').slice(0,8).toUpperCase();
  const{data,error}=await sb.from('rooms').insert(fit('rooms',
    {name,topic,kind:'rol',room_key:rk,community_id:cid,invite_code:code})).select().single();
  if(error)return toast(explain(error),'err',8000);
  await sb.from('room_members').insert({room_id:data.id,user_id:me.id}).then(()=>{},()=>{});
  RM[data.id]=data;
  toast('Sala creada. Ya puedes abrirla desde la comunidad.','ok');
  drawComm();
}
/* Añadir contenido desde la gestión: cierra el panel y lleva al compositor
   que ya está en la página de la comunidad, con la comunidad ya elegida. */
function newCommPost(){
  document.getElementById('commset')?.remove();
  const d=$('newpost');
  if(d&&d.tagName==='DETAILS')d.open=true;
  openComposer('post');
  const c=$('comp');
  if(c)c.scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>{const t=$('pt');if(t)t.focus()},180);
}
async function delCommPost(cid,pid){
  if(!confirm('¿Borrar esta publicación? No se puede deshacer.'))return;
  const{error}=await sb.from('posts').delete().eq('id',pid);
  if(error)return toast(explain(error),'err',8000);
  toast('Publicación eliminada.','ok');
  await drawComm();
  commSettings(cid,'posts');
  if(view==='comm'||view==='feed')loadFeed(1);
}

/* ---------- Eliminar comunidad SIN perder las publicaciones ----------
   Las publicaciones y las salas no se borran: se «sueltan» (community_id
   a null) y siguen apareciendo en el feed general. Solo se elimina la
   comunidad y sus datos de pertenencia (miembros, roles, solicitudes,
   historias e insignias de esa comunidad). */
async function delCommDlg(id){
  const{data:c}=await sb.from('communities').select('*').eq('id',id).maybeSingle();
  if(!c)return toast('No se encontró la comunidad.','err');
  if(c.owner!==me.id)return toast('Solo el dueño puede eliminar la comunidad.','err');
  const n=async t=>{
    const{count,error}=await sb.from(t).select('id',{count:'exact',head:true}).eq('community_id',id);
    if(error)return 0;return count||0;
  };
  const posts=await n('posts'), rooms=await n('rooms'), mem=await n('community_profiles');
  const d=document.createElement('div');d.className='preview';
  d.innerHTML=`<div class="card" style="max-width:520px;margin:0 auto">
    <div class="row"><b class="grow" style="color:var(--rd)"><i class="fa-solid fa-triangle-exclamation"></i> Eliminar «${esc(c.name)}»</b>
      <button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <p>Esto <b>sí</b> se borra:</p>
    <ul class="rulesol">
      <li>La comunidad y su portada, reglas y ajustes.</li>
      <li>Los ${mem} perfiles de la comunidad (roles y apodos).</li>
      <li>Solicitudes de entrada e insignias de la comunidad.</li></ul>
    <p>Esto <b>no</b> se borra:</p>
    <ul class="rulesol">
      <li><b>Las ${posts} publicaciones</b>: quedan en tu perfil y en el feed general.</li>
      <li><b>Las ${rooms} salas</b> y todos sus mensajes.</li></ul>
    <p class="mu">Es irreversible. Para confirmarlo, escribe el nombre de la comunidad:</p>
    <input id="delcname" placeholder="${esc(c.name)}" autocomplete="off">
    <div class="row"><button class="d" onclick="delCommGo('${id}')"><i class="fa-solid fa-trash"></i> Eliminar definitivamente</button>
      <button class="sm" onclick="this.closest('.preview').remove()">Cancelar</button></div></div>`;
  document.body.appendChild(d);
}
async function delCommGo(id){
  const caja=$('delcname');if(!caja)return;
  const{data:c}=await sb.from('communities').select('name,owner').eq('id',id).maybeSingle();
  if(!c)return toast('No se encontró la comunidad.','err');
  if(c.owner!==me.id)return toast('Solo el dueño puede eliminar la comunidad.','err');
  if(caja.value.trim()!==c.name)return toast('El nombre no coincide. Escríbelo tal cual.','err');
  const paso=async(etiqueta,t,extra)=>{
    const q=extra?sb.from(t).update(extra).eq('community_id',id):sb.from(t).delete().eq('community_id',id);
    const{error}=await q;
    if(error)toast('No se pudo: '+etiqueta+' — '+error.message,'err');
    else toast(etiqueta+' hecho.','ok');
  };
  // 1º soltar lo que NO se debe borrar
  await paso('Soltar publicaciones','posts',{community_id:null});
  await paso('Soltar salas','rooms',{community_id:null});
  await paso('Soltar historias','stories',{community_id:null});
  // 2º lo que sí se elimina (todo con ON DELETE CASCADE, por seguridad)
  await paso('Borrar insignias','badges');
  await paso('Borrar solicitudes','join_requests');
  await paso('Borrar perfiles de la comunidad','community_profiles');
  // 3º la comunidad. Con ON DELETE CASCADE el resto se limpia solo.
  const{error}=await sb.from('communities').delete().eq('id',id);
  if(error){
    toast('No se pudo eliminar la comunidad: '+error.message+'.<br>Si es por una clave foránea, ejecuta el bloque «Soltar…» del informe.','err',12000);
    return;
  }
  document.querySelector('.preview')?.remove();
  document.getElementById('commset')?.remove();
  delete CP[id+me.id];CC='';FC='';
  toast('Comunidad eliminada. Tus publicaciones siguen en pie.','ok',6000);
  go('comms');
}
async function saveNick(){
  const{error}=await sb.from('community_profiles').update({nickname:val('cnick')}).eq('community_id',CC).eq('user_id',me.id);
  if(error)return toast(error.message,'err');toast('Apodo guardado.');await drawComm();loadFeed(1);
}
async function saveCav(){
  const u=await fu('cav');if(!u)return;
  const{error}=await sb.from('community_profiles').update({avatar:u}).eq('community_id',CC).eq('user_id',me.id);
  if(error)return toast(error.message,'err');toast('Avatar guardado.');drawComm();
}
async function joinC(id){
  const{data:cp}=await sb.from('community_profiles').select('user_id,role').eq('community_id',id).eq('user_id',me.id).maybeSingle();
  if(cp){
    if(cp.role==='owner')return toast('El líder no puede salir: primero elimina o transfiere la comunidad.','warn');
    const d=await sb.from('community_profiles').delete().eq('community_id',id).eq('user_id',me.id);
    if(d.error)return toast(explain(d.error),'err');
    await sb.from('community_members').delete().eq('community_id',id).eq('user_id',me.id).then(()=>{},()=>{});
  }else{
    const a=await sb.from('community_members').insert({community_id:id,user_id:me.id});
    if(a.error&&!/duplicate|23505/i.test(a.error.message))return toast(explain(a.error),'err');
    const b=await sb.from('community_profiles').insert({community_id:id,user_id:me.id,role:'member'});
    if(b.error&&!/duplicate|23505/i.test(b.error.message))
      toast('Entraste, pero no se pudo crear tu perfil interno: '+b.error.message,'warn',7000);
  }
  delete CP[id+me.id];
  CP[id+me.id]=cp?undefined:'member';
  toast(cp?'Saliste de la comunidad.':'Te uniste a la comunidad.','ok');
  await drawComm();
}
async function askJoin(id){
  const{error}=await sb.from('join_requests').insert({community_id:id,user_id:me.id});
  if(error)return toast(error.message,'err');
  toast('Solicitud enviada. Espera a que la aprueben.','ok');
}
async function answerReq(id,st){
  const{data}=await sb.from('join_requests').select('*').eq('id',id).maybeSingle();
  const{error}=await sb.from('join_requests').update({status:st}).eq('id',id);
  if(error)return toast(error.message,'err');
  if(st=='accepted'&&data){
    await sb.from('community_members').insert({community_id:data.community_id,user_id:data.user_id}).then(()=>{},()=>{});
    await sb.from('community_profiles').insert({community_id:data.community_id,user_id:data.user_id,role:'member'}).then(()=>{},()=>{});
  }
  toast(st=='accepted'?'Solicitud aprobada.':'Solicitud rechazada.');drawComm();
}
async function modMenu(cid,uid){
  const what=prompt('Acción: 1 Silenciar 2 Expulsar 3 Hacer moderador 4 Quitar moderador','1');
  const{data:c}=await sb.from('communities').select('owner').eq('id',cid).maybeSingle();
  if(c&&c.owner===uid)return toast('No puedes moderar al dueño de la comunidad.','err');
  if(what==='1'){
    const m=prompt('Silenciar ¿cuántos minutos?','60');
    if(!m)return;
    await sb.from('community_profiles').update({muted_until:new Date(Date.now()+ (+m)*60000).toISOString()}).eq('community_id',cid).eq('user_id',uid);
    toast('Miembro silenciado.');
  }else if(what==='2'){
    if(!await ask())return;
    await sb.from('community_members').delete().eq('community_id',cid).eq('user_id',uid);
    await sb.from('community_profiles').delete().eq('community_id',cid).eq('user_id',uid);
    toast('Miembro expulsado.');
  }else if(what==='3'){
    await sb.from('community_profiles').update({role:'mod'}).eq('community_id',cid).eq('user_id',uid);
    await sb.from('community_members').update({role:'mod'}).eq('community_id',cid).eq('user_id',uid).then(()=>{},()=>{});
    toast('Ahora es moderador.');
  }
  else if(what==='4'){
    await sb.from('community_profiles').update({role:'member'}).eq('community_id',cid).eq('user_id',uid);
    await sb.from('community_members').update({role:'member'}).eq('community_id',cid).eq('user_id',uid).then(()=>{},()=>{});
    toast('Ya no es moderador.');
  }
  drawComm();
}
async function promoteDlg(cid){
  const{data}=await sb.from('community_profiles').select('*').eq('community_id',cid).eq('role','member').order('xp',{ascending:false}).limit(50);
  if(!(data||[]).length)return toast('No hay miembros sin rango.','warn');
  await prof(data.map(m=>m.user_id));
  const p=prompt('¿A quién haces moderador? Escribe el número:\n'+data.map((m,i)=>`${i+1}. ${(P[m.user_id]||{}).name||'?'} (${m.xp} XP)`).join('\n'));
  const i=+p-1;if(!data[i])return;
  const{error}=await sb.from('community_profiles').update({role:'mod'}).eq('community_id',cid).eq('user_id',data[i].user_id);
  if(error)return toast(error.message,'err');
  await sb.from('community_members').update({role:'mod'}).eq('community_id',cid).eq('user_id',data[i].user_id).then(()=>{},()=>{});
  toast('Rango actualizado.');drawComm();
}
async function reportsDlg(cid){
  const{data}=await sb.from('reports').select('*').eq('target_comm',cid).eq('status','open').order('created_at',{ascending:false});
  if(!(data||[]).length)return toast('No hay reportes abiertos.','ok');
  await prof(data.map(r=>r.reporter_id));
  for(const r of data){
    toast(`${(P[r.reporter_id]||{}).name||'Alguien'}: ${r.reason}`,'warn',10000);
    if(confirm('Marcar este reporte como visto y cerrarlo?'))await sb.from('reports').update({status:'closed'}).eq('id',r.id);
  }
}
async function badgesDlg(cid){
  const{data}=await sb.from('community_profiles').select('*').eq('community_id',cid).order('xp',{ascending:false}).limit(50);
  if(!(data||[]).length)return toast('Sin miembros.','warn');
  await prof(data.map(m=>m.user_id));
  const p=prompt('¿A quién se la das? (número)\n'+data.slice(0,25).map((m,i)=>`${i+1}. ${(P[m.user_id]||{}).name||'?'} (${m.xp} XP)`).join('\n'));
  const i=+p-1;if(!data[i])return;
  const label=prompt('Nombre de la insignia:','Constante');if(!label)return;
  const{error}=await sb.from('badges').insert({user_id:data[i].user_id,community_id:cid,code:'custom_'+Date.now(),label,icon:'fa-solid fa-award'});
  if(error)return toast(error.message,'err');
  toast('Insignia otorgada.');notify(data[i].user_id,'badge','Recibiste la insignia «'+label+'»');
}

/* ==========================================================================
   15) Personajes
   ========================================================================== */
/* Formulario de personaje (lo usa la pestaña Personajes de la Tienda) */
function charForm(){
  return `<details class="panel" open><summary><i class="fa-solid fa-user-plus"></i> Nuevo personaje</summary>
    <div class="pbody">
      <div class="field"><label>Nombre</label><input id="hn" placeholder="Nombre del personaje"></div>
      <div class="field"><label>Avatar <span class="mu">(GIF, PNG o WebP)</span></label>
        <button class="drop" style="width:100%" onclick="$('ha').click()">
          <i class="fa-solid fa-image"></i><b>Elegir imagen</b>
          <span class="mu">Solo GIF, PNG o WebP · máx. 8 MB</span></button>
        <input id="ha" type="file" accept=".gif,.png,.webp,image/gif,image/png,image/webp" style="display:none"></div>
      <div class="row" style="gap:12px">
        <div class="field grow"><label>Edad</label><input id="hg" placeholder="24"></div>
        <div class="field grow"><label>Raza</label><input id="hr" placeholder="Humana"></div></div>
      <div class="field"><label>Personalidad</label><textarea id="hp" placeholder="Fría, directa, desconfiada…"></textarea></div>
      <div class="field"><label>Apariencia</label><textarea id="hl" placeholder="Cabello negro, cicatriz…"></textarea></div>
      <div class="field"><label>Historia</label><textarea id="hs" placeholder="Su pasado…"></textarea></div>
      <div class="field"><label>Poderes</label><textarea id="hw" placeholder="Lo que sabe o puede hacer…"></textarea></div>
      <div class="field"><label>Galería <span class="mu">(GIF, PNG o WebP · varias)</span></label>
        <input id="hgal" type="file" accept=".gif,.png,.webp,image/gif,image/png,image/webp" multiple></div>
      <button class="p" onclick="mkChar()"><i class="fa-solid fa-floppy-disk"></i> Guardar personaje</button>
    </div></details>`;
}
async function drawChars(){
  const{data}=await sb.from('characters').select('*').eq('owner',me.id).order('created_at',{ascending:false});
  MY=data||[];MY.forEach(c=>C[c.id]=c);
  const ids=MY.map(c=>c.id);
  const[{data:imgs},{data:lnks}]=await Promise.all([
    ids.length?sb.from('character_images').select('*').in('character_id',ids).order('ord'):{data:[]},
    ids.length?sb.from('character_links').select('*').in('from_id',ids):{data:[]}]);
  const f=(l,v)=>v?`<div><span class="mu">${l}:</span> ${esc(v)}</div>`:'';
  $('chl').innerHTML=MY.map(c=>{
    const g=(imgs||[]).filter(i=>i.character_id==c.id);
    const l=(lnks||[]).filter(x=>x.from_id==c.id);
    return `<div class="card">
      <div class="row">${av({...c,id:''},48)}<div class="grow"><h3>${esc(c.name)}</h3><div class="mu">${esc(c.race||'')} ${c.age?'· '+esc(c.age):''}</div></div></div>
      ${f('Personalidad',c.personality)}${f('Apariencia',c.appearance)}${f('Historia',c.story)}${f('Poderes',c.powers)}
      ${g.length?`<div class="gal">${g.map(i=>`<img src="${esc(i.url)}" alt="" loading="lazy">`).join('')}</div>`:''}
      ${l.length?`<div class="mu"><i class="fa-solid fa-link"></i> Relaciones: ${l.map(x=>`${esc(x.label)} <b>${esc((C[x.to_id]||{}).name||'?')}</b>`).join(' · ')}</div>`:''}
      <div class="row w">
        <button class="sm" onclick="addGal('${c.id}')"><i class="fa-solid fa-images"></i> Añadir imagen</button>
        <button class="sm" onclick="addRel('${c.id}')"><i class="fa-solid fa-link"></i> Relación</button>
        <button class="sm" onclick="editChar('${c.id}')"><i class="fa-solid fa-pen"></i> Editar</button>
        <button class="sm d" onclick="delChar('${c.id}')"><i class="fa-solid fa-trash"></i> Eliminar</button></div></div>`;
  }).join('')||empty('Crea un personaje para usarlo en las salas de rol.');
}
async function mkChar(){
  const name=val('hn');if(!name)return toast('El personaje necesita un nombre.','err');
  const hadAvatar=$('ha').files&&$('ha').files[0];
  const avatar=await fuDeco('ha');
  if(hadAvatar&&!avatar)return;
  const gal=await fusDeco('hgal');
  const{data,error}=await sb.from('characters').insert({name,avatar,age:val('hg'),race:val('hr'),
    personality:val('hp'),appearance:val('hl'),story:val('hs'),powers:val('hw')}).select().single();
  if(error)return toast(error.message,'err');
  for(const u of gal)await sb.from('character_images').insert({character_id:data.id,url:u});
  toast('Personaje creado.');go('chars');
}
async function editChar(id){
  const c=C[id];if(!c)return;
  const name=prompt('Nombre:',c.name);if(name===null)return;
  const race=prompt('Raza:',c.race||'');
  const age=prompt('Edad:',c.age||'');
  const per=prompt('Personalidad:',c.personality||'');
  const app=prompt('Apariencia:',c.appearance||'');
  const sto=prompt('Historia:',c.story||'');
  const pow=prompt('Poderes:',c.powers||'');
  const{error}=await sb.from('characters').update({name,race,age:age||null,personality:per,appearance:app,story:sto,powers:pow}).eq('id',id);
  if(error)return toast(error.message,'err');
  delete C[id];toast('Personaje actualizado.');drawChars();
}
async function addGal(id){
  const i=document.createElement('input');i.type='file';i.accept='.gif,.png,.webp,image/gif,image/png,image/webp';i.multiple=true;
  i.onchange=async()=>{
    const{data:ex}=await sb.from('character_images').select('ord').eq('character_id',id).order('ord',{ascending:false}).limit(1);
    let ord=ex&&ex[0]?ex[0].ord+1:0;
    for(const f of [...i.files].slice(0,8)){const u=await upDeco(f);if(u){await sb.from('character_images').insert({character_id:id,url:u,ord:ord++})}}
    toast('Imágenes añadidas.');drawChars();
  };i.click();
}
async function addRel(id){
  const others=MY.filter(c=>c.id!==id);
  if(!others.length)return toast('Necesitas otro personaje para relacionarlo.','warn');
  const p=prompt('¿Con quién? (número)\n'+others.map((c,i)=>`${i+1}. ${c.name}`).join('\n'));
  const t=others[+p-1];if(!t)return;
  const label=prompt('Tipo de relación (ej.: enamorado de, hermano de, rival de):','conoce a');
  const{error}=await sb.from('character_links').insert({from_id:id,to_id:t.id,label:label||'conoce a'});
  if(error)return toast(error.message,'err');
  toast('Relación creada.');drawChars();
}
async function delChar(id){if(!await ask())return;const{error}=await sb.from('characters').delete().eq('id',id);if(error)toast(error.message,'err');delete C[id];drawChars()}

/* ==========================================================================
   16) TIENDA: marcos, burbujas, personajes y libros
   ========================================================================== */
const SHOP_TABS=[['marcos','fa-circle-notch','Marcos'],['burbujas','fa-comment-dots','Burbujas'],
                 ['tiendas','fa-shop','Tiendas'],['personajes','fa-masks-theater','Personajes'],
                 ['libros','fa-book-open','Libros']];
let SHTAB='marcos',MINE={},BOOKS=[],SHOP={},SHOP_STORE=null,SHOP_ALL=[],SHOP_ALL_AT=0;
/* Cache de artículos por id, para pintar marcos ajenos sin consultar cada vez */
async function loadShopCache(ids){
  if(OFFLINE)return;
  ids=[...new Set(ids)].filter(Boolean);
  const falta=ids.filter(i=>!SHOP[i]);
  if(!falta.length)return;
  const{data,error}=await sb.from('shop_items').select('id,kind,name,data').in('id',falta);
  if(error){if(isNetError(error))OFFLINE=true;return}
  (data||[]).forEach(i=>SHOP[i.id]=i);
  if(data&&data.length)cacheWrite('shop',SHOP);
}

VIEWS.chars=async()=>{
  await loadMyItems();
  const seg=SHOP_TABS.map(t=>`<button class="${SHTAB==t[0]?'on':''}" onclick="setShopTab('${t[0]}')">
      <i class="fa-solid ${t[1]}"></i>${t[2]}</button>`).join('');
  $('main').innerHTML=`<div class="feed wide">
    <div class="row"><b class="grow" style="font-family:Syne;font-size:24px"><i class="fa-solid fa-store" style="color:var(--ac)"></i> Tienda</b>
      <span class="tag"><i class="fa-solid fa-coins"></i> ${me.coins||0}</span>
      <span class="tag"><i class="fa-solid fa-fire"></i> ${me.xp||0} XP</span></div>
    <div class="segbar">${seg}</div>
    <div id="shBody"></div></div>`;
  await shopBody();
};
function setShopTab(t){SHTAB=t;SHOP_STORE=null;
  document.querySelectorAll('.segbar button').forEach((b,i)=>b.classList.toggle('on',SHOP_TABS[i][0]===t));
  shopBody();
}
async function loadMyItems(){
  if(!NEWOK){MINE={};return}
  const data=await q('user_items',async()=>{
    /* supabase devuelve {data, error}. Con «const{d}» se quedaba undefined
       y el equipo comprado nunca se aplicaba. */
    const{data}=await sb.from('user_items').select('item_id,equipped');
    return data;
  },[]);
  MINE={};(data||[]).forEach(r=>MINE[r.item_id]=r.equipped);
}
async function shopBody(){
  const b=$('shBody');if(!b)return;
  b.innerHTML='<div class="empty">Cargando…</div>';
  if(!NEWOK&&(SHTAB=='marcos'||SHTAB=='burbujas')){
    return b.innerHTML=`<div class="warnbar"><i class="fa-solid fa-triangle-exclamation"></i>
      La tienda necesita <b>00-instalar-todo.sql</b>. mientras tanto puedes usar las otras secciones.</div>`;
  }
  if(SHTAB=='marcos'||SHTAB=='burbujas')return shopItems(SHTAB=='marcos'?'marco':'burbuja');
  if(SHTAB=='tiendas'){
    if(!NEWOK)return b.innerHTML=`<div class="warnbar"><i class="fa-solid fa-triangle-exclamation"></i>
      Las tiendas necesitan <b>00-instalar-todo.sql</b>.</div>`;
    return shopStores();
  }
  if(SHTAB=='personajes'){
    b.innerHTML=charForm();
    return drawChars();
  }
  return shopBooks();
}

/* ---------- Artículos (marcos y burbujas) ---------- */
const frameCss=d=>`--f1:${d.from||'#ff8e9b'};--f2:${d.to||'#c92a3f'}`;
function itemPreview(it){
  const d=it.data||{};
  if(it.kind=='marco'){
    const style=d.style||'conic';
    const deco=d.img?`;--fimg:url('${esc(d.img)}')`:'';
    return `<span class="avf" data-f="${style}" style="${frameCss(d)}${deco};width:56px;height:56px">
      <span class="av" style="width:46px;height:46px;font-size:19px">?</span></span>`;
  }
  const st=`--bb-bg:${d.bg||'rgba(255,255,255,.06)'};--bb-r:${d.r||'14px'};--bb-tx:${d.text||'#ece8e8'}`
    +(d.img?`;--bb-img:url('${esc(d.img)}');--bb-pad:36px`:'');
  return `<span class="bubprev ${d.img?'deco':''}" style="${st}">Así se ve</span>`;
}
const stockOf=it=>it&&it.stock!==null&&it.stock!==undefined&&it.stock!==''?Number(it.stock):null;
const soldOf=it=>Math.max(0,Number(it.sold||0)||0);
/* Coste de publicar: 500 T por cada copia. Publicar 10 copias cuesta 5.000 T.
   Es independiente del precio de venta que el creador quiera poner. */
const PUBLISH_COST=500;
const publishCost=n=>PUBLISH_COST*Math.max(1,Math.min(100,parseInt(n)||10));
const stockLabel=st=>st===1?'1 disponible':st+' disponibles';
const isSoldOut=it=>{const st=stockOf(it);return st!==null&&st<=0};
/* La tienda solo muestra lo que todavía se puede comprar. Lo agotado sigue
   existiendo en la mochila de quien ya lo compró, pero desaparece del catálogo. */
const shopVisible=it=>it&&it.active!==false&&!isSoldOut(it);
async function shopItems(kind){
  const b=$('shBody');
  const{data,error}=await sb.from('shop_items').select('*').eq('kind',kind).eq('active',true)
    .order('official',{ascending:false}).order('created_at',{ascending:false}).limit(200);
  if(error)return(b.innerHTML=esc(error.message));
  const items=(data||[]).filter(shopVisible);
  b.innerHTML=`
    <details class="comp2"><summary style="cursor:pointer"><b><i class="fa-solid fa-plus"></i>
      Crear ${kind=='marco'?'un marco':'un estilo de burbuja'}</b></summary>
      <div style="display:grid;gap:12px;margin-top:12px">
        <div class="field"><label>Nombre</label><input id="inm" placeholder="Mi diseño" maxlength="40"></div>
        <div class="field"><label>Colores</label>
          ${themeSwatches(NI.c1,'setNewItemColor','',true)}
          <div class="row" style="align-items:center">
            <input id="in2" type="color" value="${NI.c2==='transparent'?'#5c0d12':NI.c2}" oninput="setNewItemColor2(this.value)" style="width:38px;height:32px">
            <button class="sw trans ${NI.c2==='transparent'?'on':''}" type="button"
              onclick="setNewItemColor2('transparent')" title="Segundo color transparente"><i class="fa-solid fa-ban"></i></button>
          </div></div>
        ${kind=='burbuja'?`<div class="field"><label>Forma de la esquina</label>
          <select id="ibr"><option value="14px">Recta</option><option value="20px">Redondeada</option>
            <option value="26px">Muy redonda</option><option value="4px">Cuadrada</option></select></div>`:
          `<div class="field"><label>Estilo</label>
          <select id="ifs"><option value="conic">Degradado giratorio</option><option value="dashed">Punteado</option>
            <option value="solid">Liso</option></select></div>`}
        <div class="field"><label>Adorno <span class="mu">(GIF, PNG o WebP · opcional)</span></label>
          <button class="drop" style="width:100%;padding:12px" type="button" onclick="$('ideco').click()">
            <i class="fa-solid fa-wand-magic-sparkles"></i><b>Subir adorno</b>
            <span class="mu">Solo GIF, PNG o WebP · máx. 8 MB</span></button>
          <input id="ideco" type="file" accept=".gif,.png,.webp,image/gif,image/png,image/webp" style="display:none" onchange="pickItemDeco(this)">
          <div id="idecoprev" style="margin-top:8px"></div>
        </div>
        <div class="field"><label>Precio en monedas</label><input id="ipr" type="number" min="0" max="9999" value="50"></div>
        <div class="field"><label>Copias para vender <span class="mu">(1 a 100 · el creador recibe la mitad de cada venta)</span></label>
          <input id="icop" type="number" min="1" max="100" value="10" oninput="ifNewItem()"></div>
        <div class="warnbar" id="icost" style="margin:0"><i class="fa-solid fa-coins"></i>
          Publicar 10 copias cuesta <b>${publishCost(10)} T</b> (500 T por copia).</div>
        <div id="iprev"></div>
        <button class="p" onclick="mkItem('${kind}')"><i class="fa-solid fa-cloud-arrow-up"></i> Publicar en la tienda</button>
      </div></details>
    <h3 style="margin-top:6px">${kind=='marco'?'Marcos':'Estilos de burbuja'}</h3>
    <div class="warnbar" style="margin:0 0 10px"><i class="fa-solid fa-circle-info"></i>
      Solo puedes llevar ${kind=='marco'?'un marco':'una burbuja'} a la vez. Al equipar otro, se quita el anterior.</div>
    <div class="shop">${items.length?items.map(it=>{
      const eq=kind=='marco'?me.frame_id===it.id:me.bubble_id===it.id;
      const own=MINE[it.id]!==undefined||eq;
      const st=stockOf(it),sd=soldOf(it),out=st!==null&&st<=0;
      return `<div class="item ${own?'owned':''} ${eq?'on':''} ${out?'soldout':''}" onclick="itemDlg('${it.id}','${kind}')">
        <div class="prev">${itemPreview(it)}</div>
        <div class="nm">${esc(it.name)}</div>
        <div class="pr">${out?'<b style="color:var(--rd)">Agotado</b>':own?(eq?'<b style="color:var(--gn)">En uso</b>':'En tu mochila')
          :(it.price?`<b>${it.price}</b> monedas`:'Gratis')}
          ${it.official?'':' · '+esc((P[it.creator]||{}).name||'usuario')}</div>
        ${(sd||st!==null)?`<div class="mu" style="font-size:11px">${sd?sd+' vendidos':''}${sd&&st!==null?' · ':''}${st!==null?stockLabel(st):''}</div>`:''}</div>`}).join('')
      :empty('Todavía no hay nada aquí. ¡Sé el primero!')}</div>`;
  ifNewItem();
}
let NI={c1:'#e0242f',c2:'#5c0d12',st:'conic',deco:null};
function setNewItemColor(c){NI.c1=c;ifNewItem()}
function setNewItemColor2(c){NI.c2=c;ifNewItem()}
async function pickItemDeco(input){
  const f=input&&input.files&&input.files[0];
  const u=await upDeco(f);
  if(input)input.value='';
  if(u){NI.deco=u;ifNewItem();toast('Adorno listo.','ok')}
}
function clearItemDeco(){NI.deco=null;ifNewItem()}
function ifNewItem(){
  const p=$('iprev');if(!p)return;
  const copies=Math.max(1,Math.min(100,parseInt(val('icop'))||10));
  const cost=$('icost');
  if(cost)cost.innerHTML=`<i class="fa-solid fa-coins"></i> Publicar ${copies} ${copies===1?'copia':'copias'} cuesta <b>${publishCost(copies)} T</b> (500 T por copia).`;
  const kind=val('ifs')?'marco':(val('ibr')?'burbuja':null);
  const d=kind=='marco'?{from:NI.c1,to:NI.c2,style:val('ifs')||'conic',img:NI.deco||null}
    :{bg:NI.c1,text:NI.c2,r:val('ibr')||'14px',img:NI.deco||null};
  p.innerHTML=`<div class="mu" style="text-transform:uppercase;font-size:11px;letter-spacing:.08em">Vista previa</div>
    <div class="item" style="pointer-events:none"><div class="prev">${itemPreview({kind:kind,data:d})}</div>
    <div class="nm">${esc(val('inm')||'Tu diseño')}</div></div>`;
  const dp=$('idecoprev');
  if(dp)dp.innerHTML=NI.deco?`<div class="decochip"><img src="${esc(NI.deco)}" alt="">
    <div class="grow">Adorno cargado · GIF, PNG o WebP</div>
    <button class="sm" onclick="clearItemDeco()" type="button"><i class="fa-solid fa-xmark"></i></button></div>`:'';
}
async function mkItem(kind){
  const name=val('inm').trim();
  if(!name)return toast('Ponle un nombre.','err');
  if(name.length>40)return toast('El nombre no puede pasar de 40 caracteres.','err');
  if(OFFLINE)return toast('Sin conexión: no puedes publicar ahora.','warn');
  if(!NEWOK)return toast('La tienda necesita <b>00-instalar-todo.sql</b>.','warn');
  const data=kind=='marco'?{from:NI.c1,to:NI.c2,style:val('ifs')||'conic',img:NI.deco||null}
    :{bg:NI.c1,text:NI.c2,r:val('ibr')||'14px',img:NI.deco||null};
  const stock=Math.max(1,Math.min(100,parseInt(val('icop'))||10));
  const price=Math.max(0,Math.min(9999,parseInt(val('ipr'))||0));
  const cost=publishCost(stock);
  await refreshMeCoins();
  if((me.coins||0)<cost)
    return toast(`Publicar ${stock} ${stock===1?'copia':'copias'} cuesta ${cost} T y tienes ${me.coins||0} T.`,'err',9000);
  /* Comprobación de nombre repetido sin distinguir mayúsculas ni espacios.
     El índice único del servidor también lo impide, pero así el aviso es
     claro antes de cobrar nada y funciona incluso sin la migración 11. */
  const{data:names}=await sb.from('shop_items').select('name').eq('kind',kind).limit(500);
  const key=name.toLowerCase();
  if((names||[]).some(x=>String(x.name||'').trim().toLowerCase()===key))
    return toast(`Ya existe ${kind=='marco'?'un marco':'una burbuja'} llamado «${name}». Usa otro nombre.`,'err',9000);
  if(!confirm(`Publicar «${name}» con ${stock} ${stock===1?'copia':'copias'} costará ${cost} T. ¿Continuar?`))return;

  /* El servidor cobra y crea el artículo en una sola transacción. */
  let r=await sb.rpc('publish_shop_item',
    {p_kind:kind,p_name:name,p_data:data,p_price:price,p_stock:stock});
  if(!r.error){
    await refreshMeCoins();
    NI.deco=null;SHOP_ALL=[];SHOP_ALL_AT=0;
    toast(`¡Publicado! Se cobraron ${cost} T por ${stock} ${stock===1?'copia':'copias'}.`,'ok',6000);
    await loadMyItems();return shopItems(kind);
  }
  if(!isNoFn(r.error))return toast(explain(r.error),'err',9000);

  /* Compatibilidad con bases donde todavía no se ejecutó sql/11. Sin la
     columna stock no se puede cumplir la regla de copias disponibles. */
  if(!COLS.shop_items.has('stock'))
    return toast('Para publicar con copias y coste por cantidad ejecuta <b>sql/11-tienda-nombres-costo-stock.sql</b> en Supabase.','err',12000);

  const{data:current}=await sb.from('profiles').select('coins').eq('id',me.id).maybeSingle();
  const before=Number(current&&current.coins!==undefined?current.coins:(me.coins||0));
  if(before<cost)
    return toast(`Publicar ${stock} ${stock===1?'copia':'copias'} cuesta ${cost} T y tienes ${before} T.`,'err',9000);

  const newRow={kind,name,data,price,creator:me.id,stock};
  const{data:item,error}=await sb.from('shop_items')
    .insert(fit('shop_items',newRow))
    .select().single();
  if(error)return toast(explain(error),'err',9000);

  /* Cobro de respaldo: se descuenta solo si el saldo no cambió mientras
     tanto. Si no se pudo cobrar, se borra el artículo recién creado. */
  const{data:paid,error:pe}=await sb.from('profiles')
    .update({coins:before-cost}).eq('id',me.id).eq('coins',before).select('coins').maybeSingle();
  if(pe||!paid){
    await sb.from('shop_items').delete().eq('id',item.id).eq('creator',me.id);
    return toast('No se pudo cobrar la publicación. Recarga e inténtalo otra vez.','err',9000);
  }
  await sb.from('wallet_txns').insert({user_id:me.id,kind:'gasto',amount:cost,
    reason:`Publicar ${kind}: ${name} (${stock} copias)`,category:'shop'}).then(()=>{},()=>{});
  /* Quien lo publica lo recibe gratis; no consume una copia de las ventas. */
  await sb.from('user_items').insert({user_id:me.id,item_id:item.id}).then(()=>{},()=>{});
  me.coins=paid.coins;
  NI.deco=null;SHOP_ALL=[];SHOP_ALL_AT=0;
  toast(`¡Publicado! Se cobraron ${cost} T por ${stock} ${stock===1?'copia':'copias'}.`,'ok',6000);
  await loadMyItems();shopItems(kind);
}
async function refreshMeCoins(){
  const{data:p}=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();
  if(p){Object.assign(me,p);P[me.id]=me;cacheProfile()}
}
async function itemDlg(id,kind){
  const{data:it}=await sb.from('shop_items').select('*').eq('id',id).maybeSingle();
  if(!it)return;
  const eq=(it.kind||kind)=='marco'?me.frame_id===id:me.bubble_id===id;
  const own=MINE[id]!==undefined||eq;
  const st=stockOf(it),sd=soldOf(it),out=st!==null&&st<=0;
  const d=document.createElement('div');d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="row" style="margin-bottom:12px">
      <b class="grow"><i class="fa-solid fa-store"></i> ${esc(it.name)}</b>
      <button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="card" style="display:grid;gap:12px;justify-items:center">
      <div class="prev" style="height:110px;display:grid;place-items:center;width:100%">${itemPreview(it)}</div>
      <div class="row">
        ${own?'<span class="tag" style="color:var(--gn)">En tu mochila</span>'
          :`<span class="tag"><i class="fa-solid fa-coins"></i> ${it.price}</span>`}
        ${sd?`<span class="tag"><i class="fa-solid fa-fire"></i> ${sd} vendidos</span>`:''}
        ${st!==null?`<span class="tag" style="color:${out?'var(--rd)':'var(--mu)'}">${out?'Agotado':stockLabel(st)}</span>`:''}
      </div>
      <div class="mu" style="font-size:11px;text-align:center">El creador recibe el 50% de cada venta.</div>
      ${own?`<button class="p" style="width:100%" onclick="equip('${id}',${!eq});this.closest('.preview').remove()">
          <i class="fa-solid fa-${eq?'xmark':'check'}"></i> ${eq?'Quitar':'Equipar'}</button>`
        :out?`<button class="p" style="width:100%" disabled><i class="fa-solid fa-ban"></i> Agotado</button>`
        :`<button class="p" style="width:100%" onclick="buy('${id}');this.closest('.preview').remove()">
          <i class="fa-solid fa-coins"></i> Comprar por ${it.price}</button>`}
      <button class="sm" onclick="delItem('${id}')" ${it.creator==me.id?'':'disabled'}
        style="${it.creator==me.id?'':'opacity:.4'}"><i class="fa-solid fa-eye-slash"></i> Retirar de la tienda</button>
    </div></div>`;
  document.body.appendChild(d);
}
async function buy(id){
  if(OFFLINE)return toast('Sin conexión: no puedes comprar ahora.','warn');
  if(!NEWOK)return toast('La tienda necesita 00-instalar-todo.sql.','warn');
  const{data:ok,error}=await sb.rpc('buy_item',{p_item:id});
  /* Si ya lo tenía, el servidor responde «Ya tienes ese articulo». Eso no es
     un fallo real: el artículo sigue en la mochila y se puede equipar. */
  const already=!!error&&/ya tienes ese articulo/i.test(error.message||'');
  if(error&&!already)return toast(error.message,'err',6000);
  if(ok===false&&!already)return toast('No se pudo completar la compra.','err',6000);
  SHOP_ALL=[];SHOP_ALL_AT=0;
  const{data:p}=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();
  if(p){Object.assign(me,p);P[me.id]=me;cacheProfile()}
  await loadMyItems();
  /* Comprobación real de propiedad: el marco no puede «perderse» aunque el
     creador cambie el precio o el artículo se recargue de la caché. */
  if(MINE[id]===undefined&&me.frame_id!==id&&me.bubble_id!==id){
    await loadMyItems();
    if(MINE[id]===undefined)
      return toast('El pago se hizo, pero el artículo no aparece en tu mochila. Recarga la página; si sigue igual, revisa las políticas de user_items.','err',11000);
  }
  const{data:it}=await sb.from('shop_items').select('kind').eq('id',id).maybeSingle();
  if(it&&(it.kind==='marco'||it.kind==='burbuja')){
    toast(already?'Ya tenías este artículo.':'¡Comprado!','ok');
    return equip(id,true);
  }
  toast(already?'Ya tenías este artículo.':'¡Comprado! Ya puedes equiparlo.','ok');
  shopBody();
}
async function equip(id,on){
  if(OFFLINE)return toast('Sin conexión: no puedes cambiar el equipo ahora.','warn');
  if(NOFN.has('equip_item')){
    NEWOK=false;schemaBar();
    return toast('La función <b>equip_item</b> no existe en el servidor, así que '
      +'el equipo no se puede poner. Ejécuta <b>00-instalar-todo.sql</b>.','err',9000);
  }
  const{error}=await sb.rpc('equip_item',{p_item:id,p_on:on});
  if(error)return toast(error.message,'err',6000);
  toast(on?'Equipado. Solo se muestra este.':'Quitado.','ok');
  const{data:p}=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();
  if(p){Object.assign(me,p);P[me.id]=me;cacheProfile()}
  await loadShopCache([me.frame_id,me.bubble_id]);
  refreshProfileAvatar(me.id);
  refreshOpenChats();
  await loadMyItems();shopBody();
}
async function delItem(id){
  if(OFFLINE)return toast('Sin conexión: no puedes retirar ahora.','warn');
  if(!await ask())return;
  /* No se borra la fila: si alguien ya lo compró, su user_items y su marco
     desaparecerían con el ON DELETE CASCADE. Se retira de la tienda y quien
     lo tenga conserva el artículo para siempre. */
  const{error}=await sb.from('shop_items').update({active:false}).eq('id',id).eq('creator',me.id);
  if(error)return toast(error.message,'err');
  SHOP_ALL=[];SHOP_ALL_AT=0;
  toast('Retirado de la tienda. Quien ya lo compró lo conserva.','ok',6000);
  await loadMyItems();shopBody();
}

/* ---------- Tiendas de creadores y top de ventas ---------- */
async function loadShopAll(force){
  if(OFFLINE)return Object.values(SHOP).filter(shopVisible);
  if(!force&&SHOP_ALL.length&&Date.now()-SHOP_ALL_AT<20000)return SHOP_ALL;
  const{data,error}=await sb.from('shop_items').select('*').eq('active',true)
    .order('created_at',{ascending:false}).limit(300);
  if(error){if(isNetError(error))OFFLINE=true;SHOP_ALL=[];return []}
  const all=(data||[]).filter(i=>i&&i.id);
  /* Se cachean todos para poder pintar marcos ya comprados aunque estén
     agotados; el catálogo solo devuelve los que aún se pueden comprar. */
  all.forEach(i=>SHOP[i.id]=i);
  SHOP_ALL=all.filter(shopVisible);
  cacheWrite('shop',SHOP);
  SHOP_ALL_AT=Date.now();
  return SHOP_ALL;
}
function openShopStore(id){SHOP_STORE=id;shopStores()}
function closeShopStore(){SHOP_STORE=null;shopStores()}
function shopItemMeta(it){
  const st=stockOf(it),sd=soldOf(it);
  return `${it.price?`<b>${it.price}</b> monedas`:'Gratis'}${sd?` · ${sd} vendidos`:''}${st!==null?` · ${stockLabel(st)}`:''}`;
}
async function shopStores(){
  const b=$('shBody');if(!b)return;
  b.innerHTML='<div class="empty">Cargando tiendas…</div>';
  const items=await loadShopAll();
  if(SHOP_STORE)return shopStoreDetail(items);
  const owners=[...new Set(items.map(i=>i.creator).filter(Boolean))];
  await prof(owners);
  const top=items.filter(i=>i.kind=='marco')
    .sort((a,b)=>soldOf(b)-soldOf(a)||new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,6);
  const map=new Map();
  for(const i of items){
    if(!i.creator)continue;
    const s=map.get(i.creator)||{id:i.creator,items:0,sales:0,revenue:0};
    s.items++;s.sales+=soldOf(i);s.revenue+=Math.floor((Number(i.price)||0)*soldOf(i)/2);
    map.set(i.creator,s);
  }
  const stores=[...map.values()].sort((a,b)=>b.sales-a.sales||b.items-a.items||String((P[a.id]||{}).name||'').localeCompare(String((P[b.id]||{}).name||'')));
  b.innerHTML=`<div class="storewrap">
    <div class="card" style="padding:12px">
      <div class="row"><b class="grow"><i class="fa-solid fa-fire" style="color:var(--ac)"></i> Top ventas · Marcos</b>
        <span class="tag">${items.filter(i=>i.kind=='marco').length} marcos</span></div>
      ${top.length?`<div class="storetop">${top.map((it,i)=>`<div class="topitem" onclick="itemDlg('${it.id}','${it.kind}')">
        <b class="toprank">#${i+1}</b><div class="prev">${itemPreview(it)}</div>
        <div class="grow"><b>${esc(it.name)}</b><div class="mu">${esc((P[it.creator]||{}).name||'Tienda oficial')}</div>
          <div class="mu">${shopItemMeta(it)}</div></div>
        <span class="tag">${soldOf(it)} vendidos</span></div>`).join('')}</div>`
        :empty('Todavía no hay marcos publicados.')}
    </div>
    <h3 style="margin-top:8px">Tiendas de creadores</h3>
    ${stores.length?`<div class="storegrid">${stores.map(s=>`<div class="storecard" onclick="openShopStore('${s.id}')">
      ${av(P[s.id]||{id:s.id},44)}
      <div class="grow"><b>${esc((P[s.id]||{}).name||'Creador')}</b>
        <div class="mu">${s.items} artículos · ${s.sales} ventas</div></div>
      <span class="tag">${s.id===me.id?'Tu tienda':'Ver tienda'}</span></div>`).join('')}</div>`
      :empty('Nadie ha publicado artículos todavía.')}
  </div>`;
}
async function shopStoreDetail(items){
  const b=$('shBody');if(!b)return;
  const rows=items.filter(i=>i.creator===SHOP_STORE);
  if(!rows.length)return closeShopStore();
  const p=P[SHOP_STORE]||{id:SHOP_STORE};
  const sales=rows.reduce((n,i)=>n+soldOf(i),0);
  const revenue=rows.reduce((n,i)=>n+Math.floor((Number(i.price)||0)*soldOf(i)/2),0);
  b.innerHTML=`<div class="storewrap">
    <div class="row"><button class="sm" onclick="closeShopStore()"><i class="fa-solid fa-chevron-left"></i> Tiendas</button>
      <div class="grow"></div></div>
    <div class="card" style="padding:14px"><div class="row">
      ${av(p,54)}<div class="grow"><h3 style="margin:0">${esc(p.name||'Tienda')}</h3>
        <div class="mu">${rows.length} artículos · ${sales} ventas · ${revenue} T para el creador</div></div>
      ${SHOP_STORE===me.id?'<span class="tag">Tu tienda</span>':''}</div></div>
    <h3 style="margin-top:8px">Creaciones</h3>
    <div class="shop">${rows.map(it=>`<div class="item" onclick="itemDlg('${it.id}','${it.kind}')">
      <div class="prev">${itemPreview(it)}</div><div class="nm">${esc(it.name)}</div>
      <div class="pr">${it.kind=='marco'?'Marco':'Burbuja'} · ${shopItemMeta(it)}</div></div>`).join('')}</div>
  </div>`;
}

/* ---------- Libros ---------- */
async function shopBooks(){
  const b=$('shBody');
  const{data,error}=await sb.from('books').select('*,author(id,name,accent,avatar)').eq('author',me.id)
    .order('updated_at',{ascending:false});
  BOOKS=(data||[]).filter(x=>x.author_id===me.id);
  const mine=new Set(BOOKS.map(x=>x.id));
  const{data:pub}=await sb.from('books').select('*,author(id,name,accent,avatar)')
    .eq('is_public',true).neq('author',me.id).order('created_at',{ascending:false}).limit(24);
  if(error)return(b.innerHTML=esc(error.message));
  b.innerHTML=`<details class="comp2"><summary style="cursor:pointer"><b><i class="fa-solid fa-plus"></i> Escribir un libro</b></summary>
      <div style="display:grid;gap:12px;margin-top:12px">
        <div class="field"><label>Título</label><input id="bt" placeholder="La sombra delBlack List"></div>
        <div class="row" style="gap:12px">
          <div class="field grow"><label>Género</label><input id="bg2" value="Fantasía"></div>
          <div class="field"><label>Portada <span class="mu">(GIF, PNG o WebP)</span></label>
            <button class="sm" onclick="$('bcv').click()"><i class="fa-solid fa-image"></i></button>
            <input id="bcv" type="file" accept=".gif,.png,.webp,image/gif,image/png,image/webp" style="display:none"></div></div>
        <div class="field"><label>Descripción</label><textarea id="bd" placeholder="De qué va…"></textarea></div>
        <div class="field"><label>Contenido</label><textarea id="bb" style="min-height:180px" placeholder="Escribe aquí el primer capítulo…"></textarea></div>
        <label class="row mu"><input type="checkbox" id="bpub" checked> Visible para todos</label>
        <button class="p" onclick="mkBook()"><i class="fa-solid fa-book"></i> Guardar libro</button></div></details>
    <h3 style="margin-top:6px">Mis libros</h3>
    <div class="shop" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">
      ${BOOKS.length?BOOKS.map(x=>`<div class="bookc" onclick="readBook('${x.id}')">
        <div class="bcv" style="${x.cover?`background-image:url('${esc(x.cover)}')`:''}"><span class="bct">${esc(x.title)}</span></div>
        <div class="brb"><div class="mu">${esc(x.genre||'')} · ${(x.content||'').length} caracteres</div>
          <div class="row"><button class="sm" onclick="event.stopPropagation();editBook('${x.id}')"><i class="fa-solid fa-pen"></i></button>
            <button class="sm d" onclick="event.stopPropagation();delBook('${x.id}')"><i class="fa-solid fa-trash"></i></button></div></div>
        </div>`).join(''):empty('Aún no has escrito nada.')}</div>
    <h3 style="margin-top:14px">De otros autores</h3>
    <div class="shop" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">
      ${(pub||[]).length?(pub||[]).filter(x=>!mine.has(x.id)).map(x=>`<div class="bookc" onclick="readBook('${x.id}')">
        <div class="bcv" style="${x.cover?`background-image:url('${esc(x.cover)}')`:''}"><span class="bct">${esc(x.title)}</span></div>
        <div class="brb"><div class="mu">${esc((x.author||{}).name||'?')} · ${esc(x.genre||'')}</div></div></div>`).join('')
        :empty('No hay libros públicos todavía.')}</div>`;
}
async function mkBook(){
  const title=val('bt');if(!title)return toast('El libro necesita un título.','err');
  const hadCover=$('bcv').files&&$('bcv').files[0];
  const cover=await fuDeco('bcv');
  if(hadCover&&!cover)return;
  const{error}=await sb.from('books').insert({author:me.id,title,cover,description:val('bd'),
    content:val('bb'),genre:val('bg2')||'Fantasía',is_public:$('bpub').checked}).select().single();
  if(error)return toast(error.message,'err');
  toast('Libro guardado. +10 XP','ok');shopBooks();
}
async function editBook(id){
  const{data:x}=await sb.from('books').select('*').eq('id',id).maybeSingle();
  if(!x)return;
  const t=prompt('Título:',x.title);if(t===null)return;
  const c=prompt('Contenido:',x.content);
  const{error}=await sb.from('books').update({title:t,content:c??x.content,updated_at:new Date().toISOString()}).eq('id',id);
  if(error)return toast(error.message,'err');
  toast('Actualizado.');shopBooks();
}
async function delBook(id){
  if(!await ask())return;
  const{error}=await sb.from('books').delete().eq('id',id);
  if(error)return toast(error.message,'err');
  toast('Libro borrado.');shopBooks();
}
async function readBook(id){
  const{data:x,error}=await sb.from('books').select('*,author(id,name,accent,avatar)').eq('id',id).maybeSingle();
  if(error||!x)return toast('Libro no disponible.','err');
  const d=document.createElement('div');d.className='preview';
  const ch=Array.isArray(x.chapters)?x.chapters:[];
  d.innerHTML=`<div class="reader">
    <div class="row"><button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button>
      <b class="grow" style="text-align:center">${esc(x.title)}</b><span></span></div>
    ${x.cover?`<img src="${esc(x.cover)}" style="border-radius:14px;max-height:280px;object-fit:cover;width:100%">`:''}
    <div class="row"><button class="sm" onclick="openProfile('${x.author}')">${av(x.author,24)}</button>
      <span class="grow mu">${esc((x.author||{}).name||'?')} · ${new Date(x.created_at).toLocaleDateString()}</span></div>
    ${x.description?`<div class="card"><div class="pre">${esc(x.description)}</div></div>`:''}
    ${ch.map((c,i)=>`<div class="card"><h3>${i+1}. ${esc(c.t||'Capítulo')}</h3>
        <div class="ptxt">${esc(c.b||'')}</div></div>`).join('')}
    ${ch.length?'':`<div class="card"><div class="ptxt">${esc(x.content||'Sin contenido todavía.')}</div></div>`}
  </div>`;
  document.body.appendChild(d);
}

/* ==========================================================================
   16) Avisos
   ========================================================================== */
VIEWS.notifs=async()=>{
  const{data}=await sb.from('notifications').select('*,from_user(id,name,accent,avatar)').eq('user_id',me.id).order('created_at',{ascending:false}).limit(60);
  const rows=(data||[]).filter(n=>{
    const f=n.from_user;
    const id=f&&typeof f==='object'?f.id:(typeof f==='string'?f:n.from_user_id);
    return !id||notBlocked(id);
  });
  /* La relación se llama from_user; antes se leía n.from_user_id (que no
     existe) y el clic abría openProfile('undefined'). Ahora se resuelve el
     id real y, si el aviso es de un DM, abre directamente la conversación. */
  const fromId=n=>{
    const f=n&&n.from_user;
    return f&&typeof f==='object'?f.id:(typeof f==='string'?f:(n&&n.from_user_id)||null);
  };
  rows.forEach(n=>{
    const id=fromId(n);
    const f=n.from_user;
    if(id&&f&&typeof f==='object'&&!P[id])P[id]=fx(f);
  });
  $('main').innerHTML=`<div class="feed"><div class="row"><h2 class="grow">Avisos</h2>
      <button class="sm" onclick="readAll()"><i class="fa-solid fa-check-double"></i> Marcar leídos</button></div>
    ${rows.map(n=>{
      const id=fromId(n);
      const dm=n.kind==='dm'||/mensaje/i.test(n.text||'');
      const action=id?(dm?`openDM('${id}')`:`openProfile('${id}')`):'';
      return `<div class="card" ${action?`onclick="${action}" style="cursor:pointer;${n.read?'':'border-color:var(--ac)'}"`:`style="${n.read?'':'border-color:var(--ac)'}"`}>
        <div class="row">${av(n.from_user||P[id]||{},28)}
        <div class="grow"><div>${esc(n.text)}</div>
        <div class="mu">${new Date(n.created_at).toLocaleString()}</div></div>
        ${action?`<i class="fa-solid fa-chevron-right mu"></i>`:''}</div></div>`;
    }).join('')||empty('No tienes avisos.')}
    ${rows.some(n=>!n.read)?'<button class="sm" onclick="readAll()">Marcar todos como leídos</button>':''}</div>`;
  await sb.from('notifications').update({read:true}).eq('user_id',me.id).eq('read',false);bell();
};
async function readAll(){await sb.from('notifications').update({read:true}).eq('user_id',me.id);go('notifs')}

/* ==========================================================================
   17) Mi perfil: vista completa, edición y privacidad
   ========================================================================== */
let ME_TAB='resumen';
const MTABS=[['resumen','fa-address-card','Resumen'],['posts','fa-images','Publicaciones'],
             ['comms','fa-people-group','Comunidades'],['shop','fa-box-open','Mochila'],
             ['book','fa-book-open','Libros'],['edit','fa-pen','Editar']];
VIEWS.me=async()=>{
  await loadMyRoles();
  await loadShopCache([me.frame_id,me.bubble_id]);
  const seg=MTABS.map(t=>`<button class="${ME_TAB==t[0]?'on':''}" onclick="setMeTab('${t[0]}')"
      title="${t[2]}" aria-label="${t[2]}"><i class="fa-solid ${t[1]}"></i></button>`).join('');
  $('main').innerHTML=`<div class="feed wide">
    <div class="segbar iconbar">${seg}</div>
    <div id="meBody"></div></div>`;
  await meBody();
};
function setMeTab(t){
  stopProfileMusic();
  ME_TAB=t;leaveVoice();view='me';cur=null;setMobileTitle('me');
  document.querySelectorAll('.segbar button').forEach((b,i)=>b.classList.toggle('on',MTABS[i][0]===t));
  $('app').classList.add('ns');$('main').className='';$('side').innerHTML='';
  document.body.classList.add('open');
  renderFabs();tintSoon();
  const body=$('meBody');
  if(t=='edit')return meEdit();
  meBody();
}
async function meBody(){
  const body=$('meBody');if(!body)return;
  stopProfileMusic();
  await loadShopCache([me.frame_id,me.bubble_id]);
  const lv=lvOf(me.xp);
  const bd=(await q('badges',async()=>{
    const{data}=await sb.from('badges').select('*').eq('user_id',me.id).order('awarded_at',{ascending:false});
    return data||[];
  },[]))||[];
  const{count:pc}=await sb.from('posts').select('id',{count:'exact',head:true}).eq('author',me.id);
  const{count:cc}=await sb.from('community_members').select('community_id',{count:'exact',head:true}).eq('user_id',me.id);
  const ck=await q('checkins',async()=>{
    const{data}=await sb.from('checkins').select('day').eq('user_id',me.id).order('day',{ascending:false}).limit(1);
    return data;
  },null);
  const done=!!(ck&&ck[0]&&ck[0].day===new Date().toISOString().slice(0,10));

  if(ME_TAB=='posts'){
    const{data}=await sb.from('posts').select(POSTSEL()).eq('author',me.id).order('created_at',{ascending:false}).limit(40);
    await cpNick(data||[]);
    body.innerHTML=`<h3>Publicaciones (${pc||0})</h3><div class="mas">${
      (data||[]).length?(data||[]).map(postHtml).join(''):empty('Sin publicaciones todavía.')}</div>`;
    return;
  }
  if(ME_TAB=='comms'){
    const{data}=await sb.from('community_members').select('community_id,role').eq('user_id',me.id);
    const ids=(data||[]).map(x=>x.community_id);
    const{cc:cs}=ids.length?await sb.from('communities').select('*').in('id',ids):{cc:[]};
    body.innerHTML=`<h3>Comunidades (${cc||0})</h3><div class="grid" style="padding:0">
      ${(cs||[]).length?(cs||[]).map(c=>{const r=(data||[]).find(x=>x.community_id==c.id);
        return `<div class="rc" onclick="openComm('${c.id}')">
          <div class="cv" style="${c.cover?`background-image:url('${esc(c.cover)}')`:''}"></div>
          <div class="rb"><b>${esc(c.name)}</b><div class="mu">${esc(c.description)}</div>
            ${r&&r.role!=='member'?`<span class="tag" style="color:var(--ac)">${r.role=='owner'?'Líder':'Moderador'}</span>`:''}</div></div>`}).join('')
        :empty('No te has unido a ninguna comunidad.')}</div>`;
    return;
  }
  if(ME_TAB=='shop'){
    await loadMyItems();
    const{data:mine}=await sb.from('user_items').select('item_id,equipped');
    const ids=(mine||[]).map(x=>x.item_id);
    const{data:its}=ids.length?await sb.from('shop_items').select('*').in('id',ids):{data:[]};
    /* La gestión de personajes y mascotas vive SOLO aquí, en la mochila. */
    const{data:myChars}=await sb.from('characters')
      .select('id,name,avatar,race,age').eq('owner',me.id)
      .order('created_at',{ascending:false}).limit(24);
    const feats=myChars||[];feats.forEach(c=>C[c.id]=c);
    body.innerHTML=`<div class="row"><h3 class="grow">Mi mochila</h3>
        <span class="tag"><i class="fa-solid fa-coins"></i> ${me.coins||0}</span>
        <button class="sm" onclick="go('chars')" title="Ir a la tienda"><i class="fa-solid fa-store"></i></button></div>
      ${walletCardHtml()}
      <div class="card charshopcard">
        <div class="row"><b class="grow"><i class="fa-solid fa-masks-theater" style="color:var(--ac)"></i> Personajes</b>
          <button class="p sm" onclick="setShopTab('personajes');go('chars')"><i class="fa-solid fa-plus"></i> ${feats.length?'Gestionar':'Crear personaje'}</button></div>
        ${feats.length?`<div class="chargrid">${feats.map(c=>`<div class="charitem">
          ${av({...c,id:''},46)}<div class="grow"><b>${esc(c.name)}</b>
          <span class="mu">${esc(c.race||'Personaje')}${c.age?' · '+esc(c.age):''}</span></div></div>`).join('')}</div>`
          :'<p class="mu" style="margin:0">Todavía no tienes personajes. Crea uno en la tienda para usarlo en tus mascotas y en las salas de rol.</p>'}
      </div>
      <div id="mypets"></div>
      <div class="shop">${(its||[]).length?(its||[]).map(it=>{const m=mine.find(x=>x.item_id==it.id);
        return `<div class="item ${m&&m.equipped?'on':'owned'}"
          onclick="itemDlg('${it.id}','${it.kind}')"><div class="prev">${itemPreview(it)}</div>
          <div class="nm">${esc(it.name)}</div>
          <div class="pr">${m&&m.equipped?'<b style="color:var(--gn)">En uso</b>':'Equipar'}</div></div>`}).join('')
        :empty('Tu mochila está vacía. Ve a la <b>Tienda</b> a comprar marcos y burbujas.')}</div>
      <button class="p" style="margin-top:12px" onclick="go('chars')"><i class="fa-solid fa-store"></i> Ir a la tienda</button>`;
    drawMyPets();
    return;
  }
  if(ME_TAB=='book'){
    const data=await q('books',async()=>{
      const{data}=await sb.from('books').select('*').eq('author',me.id).order('updated_at',{ascending:false});
      return data;
    },[]);
    body.innerHTML=`<div class="row"><h3 class="grow">Mis libros</h3>
        <button class="sm" onclick="setShopTab('libros');go('chars')"><i class="fa-solid fa-plus"></i> Escribir</button></div>
      <div class="shop" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))">
      ${(data||[]).length?(data||[]).map(x=>`<div class="bookc" onclick="readBook('${x.id}')">
        <div class="bcv" style="${x.cover?`background-image:url('${esc(x.cover)}')`:''}"><span class="bct">${esc(x.title)}</span></div>
        <div class="brb"><div class="mu">${esc(x.genre||'')}</div></div></div>`).join('')
        :empty(NOTHERE.has('books')?'La sección de libros necesita 00-instalar-todo.sql.':'Todavía no has escrito ningún libro.')}</div>`;
    return;
  }
  if(ME_TAB=='edit')return meEdit();

  /* Resumen */
  let myPets=[],myLikes=0;
  if(NEWOK){
    const[pt,lk]=await Promise.all([
      sb.from('pets').select('*').eq('owner',me.id).order('created_at',{ascending:true}).limit(12),
      sb.from('profile_likes').select('user_id',{count:'exact',head:true}).eq('profile_id',me.id)
    ]);
    if(!isMissing(pt.error))myPets=pt.data||[];
    if(!isMissing(lk.error))myLikes=lk.count||0;
    await chars(myPets.map(x=>petCharId(x)).filter(Boolean));
  }
  body.innerHTML=`<div class="card" style="padding:0;overflow:hidden">
      <div class="pb" style="${me.bg?`background-image:url('${esc(me.bg)}')`:''}">
        ${petBannerHtml(myPets,myLikes,me.id)}
      </div>
      <div style="padding:14px;display:grid;gap:10px">
        <div class="row w">
          ${meAvatar(me,84,'meAvatarBox')}
          <div class="grow"><h2>${esc(me.name)}</h2>
            <div class="row w"><span class="lv">Nivel ${lv} · ${titleOf(lv)}</span>
              <span class="mu">UID <b>${esc(me.uid)}</b></span>
              <span class="mu">Código <b>${esc(profileCode(me))}</b></span>
              ${me.is_private?'<span class="tag"><i class="fa-solid fa-lock"></i> Privado</span>':'<span class="tag"><i class="fa-solid fa-globe"></i> Público</span>'}</div></div>
          <div class="row w">
            <button class="sm" onclick="mePublic()" title="${me.is_private?'Hacer público':'Hacer privado'}">
              <i class="fa-solid fa-${me.is_private?'lock':'unlock'}"></i></button>
            <button class="sm" onclick="setMeTab('edit')" title="Editar perfil"><i class="fa-solid fa-pen"></i></button>
            <button class="sm" onclick="viewMyProfile()" title="Ver como los demás"><i class="fa-solid fa-eye"></i></button>
            <button class="sm" onclick="achvDlg('${me.id}')" title="Logros"><i class="fa-solid fa-trophy"></i></button>
            <button class="sm" onclick="rankDlg('${me.id}')" title="Ranking"><i class="fa-solid fa-ranking-star"></i></button>
            <button class="sm" onclick="shareProfile('${me.id}')" title="Compartir perfil"><i class="fa-solid fa-share-nodes"></i></button>
            <button class="sm" onclick="petDlg()" title="Gestionar mascotas"><i class="fa-solid fa-paw"></i></button></div></div>
        ${me.bio?`<div class="pre">${esc(me.bio)}</div>`:''}
        ${(me.links||'').trim()?`<div class="row w">${soc(me.links)}</div>`:''}
        <div class="row w">
          <span class="tag"><i class="fa-solid fa-fire"></i> ${me.xp||0} XP</span>
          <span class="tag"><i class="fa-solid fa-coins"></i> ${me.coins||0}</span>
          <span class="tag"><i class="fa-solid fa-images"></i> ${pc||0} posts</span>
          <span class="tag"><i class="fa-solid fa-people-group"></i> ${cc||0} grupos</span></div>
        <div class="row"><div class="bar grow" style="margin:0"><i style="width:${(me.xp||0)%100}%"></i></div>
          <span class="mu">${100-(me.xp||0)%100} XP para el nivel ${lv+1}</span></div>
        <button class="${done?'':'p'}" onclick="checkin()" ${done?'disabled':''}>
          <i class="fa-solid fa-calendar-check"></i> ${done?'Ya hiciste check-in hoy':'Check-in diario (+20 XP, +10 monedas)'}</button>
        ${(bd||[]).length?`<div><div class="mu">Insignias</div><div class="row w">${bd.map(b=>
          `<span class="tag"><i class="${esc(b.icon)}"></i> ${esc(b.label)}</span>`).join('')}</div></div>`:''}
      </div></div>
    ${playlistCardHtml(me.playlist,true)}
    <div class="card"><h3><i class="fa-solid fa-shield-halved"></i> Privacidad y seguridad</h3>
      <p class="mu">Tus mensajes privados se cifran en tu dispositivo con AES-GCM y una clave derivada de tu PIN. Nadie más puede leerlos.</p>
      <p class="mu">Los mensajes de las salas se cifran con una clave del servidor: cifra el tránsito, pero no es de extremo a extremo.</p>
      <p class="mu">XP, monedas, insignias y las compras de la tienda los calcula el servidor: no se pueden falsificar desde el navegador.</p></div>
    <div class="row w">
      <button class="d sm grow" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión</button>
      <button class="d sm" onclick="borrarCuentaDlg()"><i class="fa-solid fa-user-slash"></i> Eliminar mi cuenta</button></div>`;
  startProfileMusic(me.playlist);
}
/* ---------- Wallet: monedas T, llaves, regalos e historial ---------- */
let WALLET_FILTER='all';
const WALLET_CATS=[
  ['all','Todos','fa-layer-group'],
  ['gift','Regalos','fa-gift'],
  ['transfer','Transferencias','fa-paper-plane'],
  ['exchange','Intercambios','fa-arrows-rotate'],
  ['checkin','Check-in','fa-calendar-check'],
  ['shop','Compras','fa-bag-shopping']
];
function walletCategory(t){
  if(t&&t.category)return t.category;
  const r=String((t&&t.reason)||'').toLowerCase();
  if(/regalo/.test(r))return 'gift';
  if(/transferencia/.test(r))return 'transfer';
  if(/intercambio|llave/.test(r))return 'exchange';
  if(/check-?in/.test(r))return 'checkin';
  if(/tienda|compra|gasto/.test(r))return 'shop';
  return 'other';
}
function walletCatMeta(cat){
  const m={gift:['Regalo','fa-gift'],transfer:['Transferencia','fa-paper-plane'],
    exchange:['Intercambio','fa-arrows-rotate'],checkin:['Check-in','fa-calendar-check'],
    shop:['Compra','fa-bag-shopping'],other:['Movimiento','fa-wallet']};
  const x=m[cat]||m.other;
  return {label:x[0],icon:x[1]};
}
function walletFiltersHtml(){
  return `<div class="wfilterbar">${WALLET_CATS.map(([id,label,icon])=>
    `<button class="wfilter ${WALLET_FILTER===id?'on':''}" data-wfilter="${id}" onclick="walletFilter('${id}')">
      <i class="fa-solid ${icon}"></i> ${label}</button>`).join('')}</div>`;
}
function walletPanelHtml(listId='rwWalletList',showHead=true){
  const head=tag=>showHead?`<div class="whead"><b><i class="fa-solid fa-wallet"></i> Mi wallet</b>
    <span class="tag"${tag==='Activada'?' style="color:var(--gn);border-color:rgba(74,222,128,.35)"':''}>${tag}</span></div>`:'';
  const history=`<div class="wsep"></div>
    <div class="row"><b class="grow" style="font-size:13px">Movimientos</b>
      <span class="mu" style="font-size:10.5px">Regalos, transferencias e intercambios</span></div>
    ${walletFiltersHtml()}
    <div id="${listId}" class="wtxlist"><div class="mu">Cargando…</div></div>`;
  if(!COLS.profiles.has('wallet_on')){
    return `<div class="walletpanel walletoff">
      ${head('Falta SQL')}
      <p class="mu" style="margin:0">Para activar el monedero ejecuta <b>sql/03-wallet-historias.sql</b>
        y <b>sql/04-wallet-regalos-playlist.sql</b>.</p>${history}</div>`;
  }
  const hasKeys=COLS.profiles.has('keys');
  const keys=hasKeys?(Number(me.keys)||0):0;
  if(!me.wallet_on){
    return `<div class="walletpanel walletoff">
      ${head('Desactivada')}
      <p class="mu" style="margin:0">Actívala para ver tus <b>monedas T</b>, tus <b>llaves</b>,
        tus regalos y todas tus transferencias.</p>
      <div class="wactions"><button class="p sm" onclick="activateWallet()">
        <i class="fa-solid fa-power-off"></i> Activar wallet</button></div>
      ${history}</div>`;
  }
  return `<div class="walletpanel">
    ${head('Activada')}
    <div class="wbal">
      <div class="wstat"><span>Monedas T</span><b><i class="fa-solid fa-coins"></i> ${me.coins||0}</b></div>
      <div class="wstat"><span>Llaves</span><b><i class="fa-solid fa-key"></i> ${hasKeys?keys:'—'}</b></div>
    </div>
    ${hasKeys?'':`<p class="mu" style="margin:0">Para usar llaves ejecuta <b>sql/03-wallet-historias.sql</b>.</p>`}
    <div class="wactions">
      <button class="p sm" onclick="coinShopDlg()" ${hasKeys?'':'disabled'}>
        <i class="fa-solid fa-cart-plus"></i> Comprar / intercambiar</button>
      <button class="sm" onclick="sendCoinsDlg('gift')"><i class="fa-solid fa-gift"></i> Regalar</button>
      <button class="sm" onclick="sendCoinsDlg('transfer')"><i class="fa-solid fa-paper-plane"></i> Transferir</button>
    </div>
    ${history}
  </div>`;
}
function walletTxnHtml(t){
  const cat=walletCategory(t),meta=walletCatMeta(cat),income=t.kind==='ingreso';
  return `<div class="wtxn"><span class="wi ${income?'in':'out'}">
    <i class="fa-solid ${meta.icon}"></i></span>
    <div class="grow"><b>${esc(t.reason||meta.label)}</b>
      <div class="mu">${meta.label} · ${new Date(t.created_at).toLocaleString()}</div></div>
    <b class="amount" style="color:${income?'var(--gn)':'var(--rd)'}">${income?'+':'-'}${Number(t.amount)||0}</b></div>`;
}
async function loadWalletHistory(boxId='rwWalletList',filter=WALLET_FILTER){
  const box=$(boxId);if(!box)return;
  const{data,error}=await sb.from('wallet_txns').select('*').eq('user_id',me.id)
    .order('created_at',{ascending:false}).limit(120);
  if(error){
    box.innerHTML=isMissing(error)
      ? '<div class="mu" style="padding:8px 0">Falta ejecutar <b>sql/03-wallet-historias.sql</b>.</div>'
      : `<div class="mu" style="padding:8px 0">${esc(error.message)}</div>`;
    return;
  }
  const rows=(data||[]).filter(t=>filter==='all'||walletCategory(t)===filter);
  box.innerHTML=rows.length
    ? rows.slice(0,80).map(walletTxnHtml).join('')
    : '<div class="mu" style="padding:8px 0">No hay movimientos en este filtro.</div>';
}
function walletFilter(f){
  WALLET_FILTER=f;
  document.querySelectorAll('[data-wfilter]').forEach(b=>b.classList.toggle('on',b.dataset.wfilter===f));
  ['rwWalletList','walletList','wtxlist'].forEach(id=>{if($(id))loadWalletHistory(id,f)});
}
function walletDlg(){
  document.getElementById('walletdlg')?.remove();
  const d=document.createElement('div');d.id='walletdlg';d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card walletdlgcard">
    <div class="row"><b class="grow" style="font-family:Syne;font-size:19px">
      <i class="fa-solid fa-wallet" style="color:var(--menu2)"></i> Mi wallet</b>
      <button class="sm" onclick="document.getElementById('walletdlg').remove()" title="Cerrar">
        <i class="fa-solid fa-xmark"></i></button></div>
    ${walletPanelHtml('walletList',false)}
  </div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
  loadWalletHistory('walletList',WALLET_FILTER);
}
function refreshWalletViews(){
  if($('rewardBody'))rewardBody();
  if($('walletdlg'))walletDlg();
  if(view==='me'&&!$('walletdlg')&&!$('rewarddlg'))meBody();
}
function walletCardHtml(){
  if(!COLS.profiles.has('wallet_on')){
    return `<div class="card walletcard walletoff">
      <div class="row"><b class="grow"><i class="fa-solid fa-wallet" style="color:var(--menu2)"></i> Mi wallet</b>
        <span class="tag">Falta SQL</span></div>
      <p class="mu" style="margin:0">Para activar el monedero ejecuta <b>sql/03-wallet-historias.sql</b>
        o el instalador completo en Supabase.</p>
    </div>`;
  }
  if(!me.wallet_on){
    return `<div class="card walletcard walletoff">
      <div class="row"><b class="grow"><i class="fa-solid fa-wallet" style="color:var(--menu2)"></i> Mi wallet</b>
        <span class="tag">Desactivada</span></div>
      <p class="mu" style="margin:0">Activa tu wallet para ver tus <b>monedas T</b>, tus <b>llaves</b> y
        todos tus movimientos. Las monedas sirven para comprar marcos, burbujas y personajes.</p>
      <button class="p" onclick="activateWallet()"><i class="fa-solid fa-power-off"></i> Activar wallet</button>
    </div>`;
  }
  const hasKeys=COLS.profiles.has('keys');
  const keys=Number(me.keys)||0;
  return `<div class="card walletcard">
    <div class="row"><b class="grow"><i class="fa-solid fa-wallet" style="color:var(--menu2)"></i> Mi wallet</b>
      <span class="tag" style="color:var(--gn)">Activada</span></div>
    <div class="wbal">
      <div class="wstat"><span>Monedas T</span><b><i class="fa-solid fa-coins"></i> ${me.coins||0}</b></div>
      <div class="wstat"><span>Llaves</span><b><i class="fa-solid fa-key"></i> ${hasKeys?keys:'—'}</b></div>
    </div>
    ${hasKeys?'':`<p class="mu" style="margin:0">Para usar llaves y comprar monedas ejecuta
      <b>sql/03-wallet-historias.sql</b>.</p>`}
    <div class="row w">
      <button class="p sm" onclick="coinShopDlg()" ${hasKeys?'':'disabled'}>
        <i class="fa-solid fa-cart-plus"></i> Comprar monedas</button>
      <button class="sm" onclick="sendCoinsDlg('gift')"><i class="fa-solid fa-gift"></i> Regalar</button>
      <button class="sm" onclick="walletDlg()"><i class="fa-solid fa-clock-rotate-left"></i> Abrir wallet</button>
    </div>
  </div>`;
}
async function activateWallet(){
  if(!COLS.profiles.has('wallet_on'))
    return toast('El monedero necesita <b>sql/03-wallet-historias.sql</b>.','warn',9000);
  const r=await sb.rpc('activate_wallet').then(x=>x,e=>({error:e}));
  if(!r.error){
    const{data}=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();
    if(data){Object.assign(me,data);P[me.id]=me}
  }else{
    /* Si la función aún no está, la política de actualización del perfil
       permite activar el campo sin depender de la migración. */
    const{error}=await sb.from('profiles').update({wallet_on:true}).eq('id',me.id);
    if(error)return toast(explain(error),'err');
    me.wallet_on=true;
  }
  toast('Wallet activada. Ya puedes ver tus monedas T y tus llaves.','ok');
  refreshWalletViews();
}
function walletTxnsDlg(){
  document.getElementById('wtxdlg')?.remove();
  const d=document.createElement('div');d.id='wtxdlg';d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:12px;max-width:560px;margin:0 auto">
    <div class="row"><b class="grow"><i class="fa-solid fa-clock-rotate-left" style="color:var(--menu2)"></i>
      Movimientos de la wallet</b>
      <button class="sm" onclick="document.getElementById('wtxdlg').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    ${walletFiltersHtml()}
    <div id="wtxlist" class="wtxlist"><div class="mu">Cargando…</div></div>
  </div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
  loadWalletHistory('wtxlist',WALLET_FILTER);
}
async function loadWalletTxns(){return loadWalletHistory('wtxlist',WALLET_FILTER)}
async function sendCoinsDlg(kind='gift',toId=''){
  if(!COLS.profiles.has('wallet_on'))
    return toast('La wallet necesita <b>sql/03-wallet-historias.sql</b>.','warn',9000);
  if(!me.wallet_on)return toast('Activa tu wallet antes de enviar monedas.','warn',7000);
  let label=(toId&&P[toId]&&P[toId].name)||'';
  if(toId&&!label){
    const{data}=await sb.from('profiles').select('name').eq('id',toId).maybeSingle();
    label=(data&&data.name)||'';
  }
  document.getElementById('sendcoins')?.remove();
  const d=document.createElement('div');d.id='sendcoins';d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:12px;max-width:560px;margin:0 auto">
    <div class="row"><b class="grow"><i class="fa-solid fa-gift" style="color:var(--menu2)"></i>
      Regalar o transferir monedas T</b>
      <button class="sm" onclick="document.getElementById('sendcoins').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="wbal">
      <div class="wstat"><span>Monedas T</span><b><i class="fa-solid fa-coins"></i> ${me.coins||0}</b></div>
      <div class="wstat"><span>Llaves</span><b><i class="fa-solid fa-key"></i> ${COLS.profiles.has('keys')?(me.keys??0):'—'}</b></div>
    </div>
    <div class="field"><label>Tipo de envío</label><select id="scKind">
      <option value="gift" ${kind==='gift'?'selected':''}>Regalo</option>
      <option value="transfer" ${kind==='transfer'?'selected':''}>Transferencia</option></select></div>
    <div class="field"><label>Destinatario · UID o nombre exacto</label>
      <input id="scTo" value="${esc(label)}" data-orig="${esc(label)}" placeholder="UID o nombre del destinatario"
        autocomplete="off" autocapitalize="none" spellcheck="false">
      <input id="scToId" type="hidden" value="${esc(toId||'')}"></div>
    <div class="field"><label>Cantidad de monedas T</label>
      <input id="scAmount" type="number" min="1" max="${Math.max(1,me.coins||1)}" value="10" inputmode="numeric"></div>
    <div class="field"><label>Mensaje (opcional)</label>
      <input id="scNote" maxlength="140" placeholder="Para que sepa por qué se lo envías"></div>
    <p class="mu" style="margin:0;font-size:12px">El destinatario recibe las monedas al instante. El movimiento
      queda registrado en el historial de regalos o transferencias de ambos.</p>
    <button class="p" onclick="sendCoins()"><i class="fa-solid fa-paper-plane"></i> Enviar monedas</button>
  </div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
}
async function sendCoins(){
  const kind=val('scKind')||'gift';
  const amount=parseInt(val('scAmount'),10);
  const note=val('scNote');
  const input=$('scTo');
  const q=val('scTo');
  if(!q)return toast('Escribe el UID o el nombre del destinatario.','warn');
  if(!Number.isFinite(amount)||amount<1)return toast('La cantidad debe ser mayor que 0.','warn');
  if(amount>(me.coins||0))return toast('No tienes suficientes monedas T.','warn');
  let to=null;
  const orig=input&&input.dataset?input.dataset.orig:'';
  const toId=val('scToId');
  if(orig&&q===orig&&toId)to={id:toId,name:orig};
  if(!to){
    let r=await sb.from('profiles').select('id,name,uid').eq('uid',q.toLowerCase()).maybeSingle();
    if(!r.data&&COLS.profiles.has('profile_code')){
      const rc=await sb.from('profiles').select('id,name,uid').ilike('profile_code',q).limit(1);
      r={data:(rc.data||[])[0]||null};
    }
    if(!r.data)r=await sb.from('profiles').select('id,name,uid').ilike('name',q).limit(1).maybeSingle();
    to=r.data;
  }
  if(!to)return toast('No encontré ese perfil. Escribe su UID o su nombre exacto.','warn',6000);
  if(to.id===me.id)return toast('No puedes enviarte monedas a ti mismo.','warn');
  if(!confirm('¿Enviar '+amount+' monedas T a '+to.name+'?'))return;
  const{error}=await sb.rpc('send_coins',{p_to:to.id,p_amount:amount,p_category:kind,p_note:note});
  if(error){
    if(isNoFn(error))return toast('Regalos y transferencias necesitan <b>sql/04-wallet-regalos-playlist.sql</b>.','warn',9000);
    return toast(explain(error),'err',8000);
  }
  const st=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();
  if(st.data){Object.assign(me,st.data);P[me.id]=me}
  toast(kind==='gift'?'Regalo enviado a '+to.name+'.':'Transferencia enviada a '+to.name+'.','ok');
  document.getElementById('sendcoins')?.remove();
  refreshWalletViews();
}
function coinShopDlg(){
  const hasKeys=COLS.profiles.has('keys');
  const keys=Number(me.keys)||0;
  const packs=[[1,100],[2,300],[5,1000],[10,2500]];
  document.getElementById('coinshop')?.remove();
  const d=document.createElement('div');d.id='coinshop';d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:13px;max-width:560px;margin:0 auto">
    <div class="row"><b class="grow"><i class="fa-solid fa-coins" style="color:var(--ac)"></i>
      Comprar monedas T</b>
      <button class="sm" onclick="document.getElementById('coinshop').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="wbal">
      <div class="wstat"><span>Monedas T</span><b><i class="fa-solid fa-coins"></i> ${me.coins||0}</b></div>
      <div class="wstat"><span>Llaves</span><b><i class="fa-solid fa-key"></i> ${hasKeys?keys:'—'}</b></div>
    </div>
    ${hasKeys?`<p class="mu" style="margin:0">Cambia tus llaves por monedas T. Las llaves se ganan
      con eventos, recompensas y check-ins especiales.</p>
      <div class="coinpacks">${packs.map(([k,c])=>`<button class="coinpack" onclick="buyCoins(${k})"
        ${keys<k?'disabled style="opacity:.45"':''}><b><i class="fa-solid fa-coins"></i> ${c}</b>
        <span>monedas T</span><span>Cuesta ${k} ${k===1?'llave':'llaves'}</span></button>`).join('')}</div>`
      :`<p class="mu" style="margin:0">Para comprar monedas con llaves ejecuta
        <b>sql/03-wallet-historias.sql</b>.</p>`}
    <button class="sm" onclick="document.getElementById('coinshop').remove()">Cerrar</button>
  </div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
}
async function buyCoins(pack){
  const{data,error}=await sb.rpc('buy_coins',{p_pack:pack});
  if(error){
    if(isNoFn(error))return toast('Comprar monedas necesita <b>sql/03-wallet-historias.sql</b>.','warn',9000);
    return toast(explain(error),'err');
  }
  const st=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();
  if(st.data){Object.assign(me,st.data);P[me.id]=me}
  toast('¡Compra hecha! +'+(data&&data.added||0)+' monedas T.','ok');
  document.getElementById('coinshop')?.remove();
  refreshWalletViews();
}
/* ---------- Misiones diarias de Recompensas ---------- */
async function loadDailyMissions(){
  const start=new Date();start.setHours(0,0,0,0);
  const iso=start.toISOString();
  const tasks=[
    {id:'post',label:'Publica algo hoy',desc:'Comparte una publicación en el feed.',
      icon:'fa-solid fa-pen',done:false,action:"closeReward();go('feed').then(()=>openComposer('post'))",cta:'Publicar'},
    {id:'reel',label:'Sube un reel',desc:'Comparte un vídeo corto con la comunidad.',
      icon:'fa-solid fa-circle-play',done:false,action:"closeReward();go('feed').then(()=>openComposer('reel'))",cta:'Subir reel'},
    {id:'create',label:'Crea algo nuevo',desc:'Una sala, comunidad o personaje.',
      icon:'fa-solid fa-wand-magic-sparkles',done:false,action:"closeReward();openCreateSheet()",cta:'Crear'}
  ];
  const tryq=async p=>{try{return await p}catch{return{error:{}}}};
  const cols=COLS.posts.has('is_reel')?'id,is_reel':'id';
  const pr=await tryq(sb.from('posts').select(cols).eq('author',me.id).gte('created_at',iso).limit(200));
  const posts=(pr&&!pr.error&&Array.isArray(pr.data))?pr.data:[];
  tasks[0].done=posts.length>0;
  tasks[1].done=posts.some(x=>x&&x.is_reel===true);
  const [ch,co,ro]=await Promise.all([
    tryq(sb.from('characters').select('id',{count:'exact',head:true}).eq('owner',me.id).gte('created_at',iso)),
    tryq(sb.from('communities').select('id',{count:'exact',head:true}).eq('owner',me.id).gte('created_at',iso)),
    tryq(sb.from('rooms').select('id',{count:'exact',head:true}).eq('owner',me.id).gte('created_at',iso))
  ]);
  const count=x=>(x&&!x.error&&Number(x.count))||0;
  tasks[2].done=(count(ch)+count(co)+count(ro))>0;
  return tasks;
}
function dailyMissionsHtml(tasks){
  const done=(tasks||[]).filter(t=>t.done).length;
  return `<div class="rwdaily">
    <div class="rwdailyhead"><b class="grow"><i class="fa-solid fa-calendar-day"></i> Misiones de hoy</b>
      <span class="tag">${done}/${(tasks||[]).length}</span></div>
    ${(tasks||[]).map(t=>`<div class="rwdailyrow ${t.done?'done':''}">
      <span class="rdi"><i class="${t.done?'fa-solid fa-circle-check':t.icon}"></i></span>
      <div class="grow"><b>${esc(t.label)}</b><div class="mu">${esc(t.desc)}</div></div>
      ${t.done?'<span class="tag">Hecho</span>':`<button class="sm" onclick="${t.action}">${esc(t.cta)}</button>`}
    </div>`).join('')}
    <div class="mu" style="font-size:10.5px">Se reinician cada día. Publicar, subir reels y crear mantienen tu perfil activo.</div>
  </div>`;
}

/* ---------- Playlist de música del perfil ----------
   Acepta enlaces de Spotify, Deezer y YouTube, o audios MP3 subidos.
   La música arranca al abrir el perfil y se detiene al salir. */
let PM={list:[],i:-1,playing:false,audio:null,token:0,autostart:false};
function musicSource(url){
  const u=String(url||'').toLowerCase();
  if(/open\.spotify\.com/.test(u))return 'spotify';
  if(/deezer\.com/.test(u))return 'deezer';
  if(/youtu\.be|youtube\.com/.test(u))return 'youtube';
  if(/\.(mp3|m4a|ogg|oga|wav|aac|flac)(\?|#|$)/.test(u))return 'audio';
  return 'url';
}
function musicSourceLabel(t){
  if(t&&t.kind==='audio')return 'MP3 / audio';
  const s=musicSource(t&&t.url);
  return {spotify:'Spotify',deezer:'Deezer',youtube:'YouTube',audio:'MP3 / audio',url:'Enlace'}[s]||'Música';
}
function musicTitleFromUrl(url){
  const s=musicSource(url);
  return {spotify:'Pista de Spotify',deezer:'Pista de Deezer',youtube:'Vídeo de YouTube',audio:'Audio',url:'Pista'}[s]||'Pista';
}
function parsePlaylist(raw){
  let a=raw;
  if(typeof a==='string'){try{a=JSON.parse(a)}catch{a=[]}}
  if(!Array.isArray(a))return [];
  return a.map(t=>{
    if(typeof t==='string')t={url:t};
    if(!t||typeof t!=='object')return null;
    const url=String(t.url||'').trim();
    if(!/^https?:\/\//i.test(url))return null;
    const src=musicSource(url);
    const kind=(t.kind==='audio'||src==='audio')?'audio':(t.kind==='embed'?'embed':'embed');
    return {title:String(t.title||t.name||'').trim()||musicTitleFromUrl(url),url,kind,source:src};
  }).filter(Boolean);
}
function musicEmbedUrl(url){
  const u=String(url||'');
  let m=u.match(/open\.spotify\.com\/(?:intl-[^/]+\/)?(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/i);
  if(m)return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&autoplay=1`;
  m=u.match(/deezer\.com\/(?:[a-z]{2}\/)?(track|album|playlist)\/(\d+)/i);
  if(m)return `https://widget.deezer.com/widget/dark/${m[1]}/${m[2]}?autoplay=true`;
  m=u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  if(m)return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
  m=u.match(/[?&]list=([A-Za-z0-9_-]+)/i);
  if(m&&/youtu/i.test(u))return `https://www.youtube.com/embed/videoseries?list=${m[1]}&autoplay=1&rel=0`;
  return '';
}
function playlistCardHtml(raw,own=false){
  const list=parsePlaylist(raw);
  const can=COLS.profiles.has('playlist');
  if(!list.length&&!own)return '';
  const rows=list.map((t,i)=>`<button class="musicrow ${i===0?'on':''}" data-i="${i}" onclick="musicPlay(${i})">
    <span class="mi">${i+1}</span><span class="grow"><b>${esc(t.title)}</b><small>${musicSourceLabel(t)}</small></span>
    <i class="fa-solid fa-play"></i></button>`).join('');
  /* En el perfil de otra persona la tarjeta grande se oculta: queda un
     reproductor compacto. La música sigue sonando, se puede pausar y la
     lista completa se abre en un panel. */
  if(!own&&list.length){
    return `<div class="card musiccard musiccard-mini">
      <div class="row">
        <div class="musicdisc musicdisc-mini" id="mdisc" onclick="musicToggle()" role="button" tabindex="0"
          onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();musicToggle()}" title="Reproducir / pausar">
          <div class="label" id="mcover"><i class="fa-solid fa-play"></i></div>
        </div>
        <div class="grow"><b id="mnow">${esc(list[0].title)}</b><div class="mu" id="msrc">${musicSourceLabel(list[0])}</div></div>
        <button class="sm" onclick="musicPrev()" title="Anterior"><i class="fa-solid fa-backward-step"></i></button>
        <button class="p sm" id="mplay" onclick="musicToggle()" title="Reproducir / pausar"><i class="fa-solid fa-play"></i></button>
        <button class="sm" onclick="musicNext()" title="Siguiente"><i class="fa-solid fa-forward-step"></i></button>
        <button class="sm" onclick="musicListDlg()" title="Ver la lista"><i class="fa-solid fa-list"></i></button>
      </div>
      <div id="mframe" class="musicframe musicframe-hidden"></div>
      <div class="musiclist hide" id="mhidelist">${rows}</div>
    </div>`;
  }
  return `<div class="card musiccard">
    <div class="row"><b class="grow"><i class="fa-solid fa-record-vinyl"></i> Música del perfil</b>
      ${own?`<button class="sm" onclick="playlistDlg()"><i class="fa-solid fa-sliders"></i> Gestionar</button>`:''}</div>
    ${!can?`<p class="mu" style="margin:0">Para activar la playlist ejecuta <b>sql/04-wallet-regalos-playlist.sql</b>.</p>`
      :list.length?`
      <div class="musicdisc-wrap">
        <div class="musicdisc" id="mdisc" onclick="musicToggle()" role="button" tabindex="0"
          onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();musicToggle()}" title="Reproducir / pausar">
          <div class="label" id="mcover"><i class="fa-solid fa-play"></i></div>
        </div>
        <div style="text-align:center;min-width:0;max-width:100%">
          <b id="mnow" style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(list[0].title)}</b>
          <div class="mu" id="msrc">${musicSourceLabel(list[0])}</div>
        </div>
        <div class="musicdisc-controls">
          <button class="sm" onclick="musicPrev()" title="Anterior"><i class="fa-solid fa-backward-step"></i></button>
          <button class="p" id="mplay" onclick="musicToggle()" title="Reproducir / pausar"><i class="fa-solid fa-play"></i></button>
          <button class="sm" onclick="musicNext()" title="Siguiente"><i class="fa-solid fa-forward-step"></i></button>
          <button class="sm wide" onclick="musicListDlg()" title="Ver la lista"><i class="fa-solid fa-list"></i> Lista</button>
        </div>
      </div>
      <div id="mframe" class="musicframe"></div>
      <div class="musiclist">${rows}</div>
      <div class="mu" style="font-size:10.5px"><i class="fa-solid fa-circle-info"></i>
        La música empieza al abrir el perfil y se detiene al salir. Si el navegador bloquea el autoplay, pulsa play.</div>`
      :`<p class="mu" style="margin:0">Aún no has añadido música. Puedes pegar enlaces de Spotify, Deezer o YouTube, o subir un MP3.</p>
        <button class="p" onclick="playlistDlg()"><i class="fa-solid fa-plus"></i> Añadir música</button>`}
  </div>`;
}
function musicListDlg(){
  if(!PM.list.length)return toast('Este perfil no tiene música.','warn');
  document.getElementById('musiclistdlg')?.remove();
  const d=document.createElement('div');
  d.id='musiclistdlg';d.className='preview';
  d.onclick=e=>{if(e.target===d)d.remove()};
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:12px">
    <div class="row"><b class="grow"><i class="fa-solid fa-music"></i> Música del perfil</b>
      <button class="sm" onclick="document.getElementById('musiclistdlg').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <div class="musicnow">
      <div class="musiccover"><i class="fa-solid fa-volume-high"></i></div>
      <div class="grow"><b id="mnow2">${esc(PM.list[PM.i]?.title||PM.list[0].title)}</b>
        <div class="mu" id="msrc2">${musicSourceLabel(PM.list[PM.i]||PM.list[0])}</div></div>
      <button class="sm" onclick="musicPrev()" title="Anterior"><i class="fa-solid fa-backward-step"></i></button>
      <button class="p sm" id="mplay2" onclick="musicToggle()" title="Reproducir / pausar"><i class="fa-solid fa-play"></i></button>
      <button class="sm" onclick="musicNext()" title="Siguiente"><i class="fa-solid fa-forward-step"></i></button>
    </div>
    <div class="musiclist">${PM.list.map((t,i)=>`<button class="musicrow ${i===PM.i?'on':''}" data-i="${i}" onclick="musicPlay(${i});this.closest('.preview').remove()">
      <span class="mi">${i+1}</span><span class="grow"><b>${esc(t.title)}</b><small>${musicSourceLabel(t)}</small></span>
      <i class="fa-solid fa-play"></i></button>`).join('')}</div>
    <div class="mu" style="font-size:10.5px"><i class="fa-solid fa-circle-info"></i>
      La música se detiene al salir del perfil.</div>
  </div></div>`;
  document.body.appendChild(d);
  musicBtn();
}
function musicBtn(){
  const icon=`<i class="fa-solid fa-${PM.playing?'pause':'play'}"></i>`;
  const b=$('mplay');if(b)b.innerHTML=icon;
  const b2=$('mplay2');if(b2)b2.innerHTML=icon;
  const c=$('mcover');if(c)c.innerHTML=`<i class="fa-solid ${PM.playing?'fa-volume-high':'fa-play'}"></i>`;
  const d=$('mdisc');if(d)d.classList.toggle('playing',PM.playing);
}
function musicPrev(){
  if(!PM.list.length)return;
  musicPlay(PM.i<=0?PM.list.length-1:PM.i-1);
}
function musicNext(){
  if(!PM.list.length)return;
  musicPlay((PM.i+1)%PM.list.length);
}
function stopProfileMusic(){
  PM.token++;
  if(PM.audio){try{PM.audio.pause();PM.audio.removeAttribute('src');PM.audio.load()}catch{};PM.audio.remove();PM.audio=null}
  const f=$('mframe');if(f)f.innerHTML='';
  document.getElementById('musiclistdlg')?.remove();
  PM.list=[];PM.i=-1;PM.playing=false;PM.autostart=false;
}
function startProfileMusic(raw){
  stopProfileMusic();
  const list=parsePlaylist(raw);
  if(!list.length)return;
  PM.list=list;PM.i=0;PM.autostart=true;
  const token=PM.token;
  setTimeout(()=>{if(PM.token!==token||!PM.autostart||!$('mnow'))return;PM.autostart=false;musicPlay(0,true)},260);
}
function musicPlay(i,auto=false){
  if(!PM.list.length)return;
  if(!auto)PM.autostart=false;
  i=((i%PM.list.length)+PM.list.length)%PM.list.length;
  PM.i=i;
  const t=PM.list[i];
  const now=$('mnow');if(now)now.textContent=t.title;
  const src=$('msrc');if(src)src.textContent=musicSourceLabel(t);
  const now2=$('mnow2');if(now2)now2.textContent=t.title;
  const src2=$('msrc2');if(src2)src2.textContent=musicSourceLabel(t);
  document.querySelectorAll('.musicrow').forEach((b,j)=>b.classList.toggle('on',j===i));
  const frame=$('mframe');
  if(t.kind==='audio'||musicSource(t.url)==='audio'){
    if(frame)frame.innerHTML='';
    let a=PM.audio;
    if(!a){
      a=document.createElement('audio');a.id='maudio';a.preload='metadata';a.style.display='none';
      a.onplay=()=>{PM.playing=true;musicBtn()};
      a.onpause=()=>{PM.playing=false;musicBtn()};
      a.onended=()=>musicPlay((PM.i+1)%PM.list.length);
      document.body.appendChild(a);PM.audio=a;
    }
    if(a.dataset.url!==t.url){a.dataset.url=t.url;a.src=t.url;a.load()}
    const token=PM.token;
    a.play().then(()=>{if(PM.token!==token)return;PM.playing=true;musicBtn()})
      .catch(()=>{if(PM.token!==token)return;PM.playing=false;musicBtn();
        if(!auto)toast('El navegador bloqueó la reproducción. Pulsa play de nuevo.','warn',5000)});
    return;
  }
  if(PM.audio){PM.audio.pause()}
  const emb=musicEmbedUrl(t.url);
  if(frame){
    /* En el reproductor compacto el iframe está oculto: si se carga con
       loading="lazy" el navegador puede no cargarlo nunca y no sonaría. */
    const lazy=frame.classList.contains('musicframe-hidden')?'eager':'lazy';
    frame.innerHTML=emb
      ? `<iframe src="${esc(emb)}" title="${esc(t.title)}" loading="${lazy}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe>`
      : `<a class="sm" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">Abrir enlace <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
  }
  PM.playing=!!emb;musicBtn();
}
function musicToggle(){
  if(!PM.list.length)return;
  PM.autostart=false;
  if(PM.playing){
    if(PM.audio)PM.audio.pause();else{
      const f=$('mframe');if(f)f.innerHTML='';
      PM.playing=false;musicBtn();
    }
    return;
  }
  musicPlay(PM.i<0?0:PM.i,false);
}
function playlistItemsHtml(list){
  if(!list.length)return '<p class="mu" style="margin:0">Tu playlist está vacía.</p>';
  return `<div class="pllist">${list.map((t,i)=>`<div class="plitem">
    <span class="pli">${i+1}</span>
    <div class="grow"><b>${esc(t.title)}</b><small>${musicSourceLabel(t)} · ${esc(t.url.length>62?t.url.slice(0,62)+'…':t.url)}</small></div>
    <button class="sm" onclick="playlistMove(${i},-1)" ${i===0?'disabled':''} title="Subir"><i class="fa-solid fa-chevron-up"></i></button>
    <button class="sm" onclick="playlistMove(${i},1)" ${i===list.length-1?'disabled':''} title="Bajar"><i class="fa-solid fa-chevron-down"></i></button>
    <button class="sm d" onclick="playlistRemove(${i})" title="Quitar"><i class="fa-solid fa-trash"></i></button>
  </div>`).join('')}</div>`;
}
function playlistDlg(){
  if(!COLS.profiles.has('playlist'))
    return toast('La playlist del perfil necesita <b>sql/04-wallet-regalos-playlist.sql</b>.','warn',9000);
  stopProfileMusic();
  const list=parsePlaylist(me.playlist);
  document.getElementById('playlistdlg')?.remove();
  const d=document.createElement('div');d.id='playlistdlg';d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:12px;max-width:620px;margin:0 auto">
    <div class="row"><b class="grow" style="font-family:Syne;font-size:19px">
      <i class="fa-solid fa-music" style="color:var(--menu2)"></i> Playlist de mi perfil</b>
      <button class="sm" onclick="closePlaylistDlg()"><i class="fa-solid fa-xmark"></i></button></div>
    <p class="mu" style="margin:0">La música sonará cuando alguien abra tu perfil y se detendrá al salir.
      Puedes usar enlaces de Spotify, Deezer o YouTube, o subir tus propios MP3.</p>
    <div id="plItems">${playlistItemsHtml(list)}</div>
    <div class="field"><label>Añadir enlace</label>
      <input id="plUrl" placeholder="https://open.spotify.com/track/…  ·  https://youtu.be/…" autocomplete="off">
      <input id="plTitle" placeholder="Título (opcional)" maxlength="120">
      <button class="p" onclick="playlistAddUrl()"><i class="fa-solid fa-plus"></i> Añadir enlace</button></div>
    <div class="field"><label>Subir un MP3 / audio</label>
      <input id="plFile" type="file" accept="audio/*,.mp3,.m4a,.ogg,.wav,.aac,.flac" onchange="playlistAddFile(this)"></div>
    <button class="sm" onclick="closePlaylistDlg()">Cerrar</button>
  </div></div>`;
  d.onclick=e=>{if(e.target===d)closePlaylistDlg()};
  document.body.appendChild(d);
}
function closePlaylistDlg(){
  document.getElementById('playlistdlg')?.remove();
  if(view==='me'&&ME_TAB!=='edit')meBody();
  else if(view==='prof'&&PROF===me.id)openProfile(me.id);
}
async function savePlaylist(list){
  if(!COLS.profiles.has('playlist')){
    toast('La playlist necesita <b>sql/04-wallet-regalos-playlist.sql</b>.','warn',8000);
    return false;
  }
  list=parsePlaylist(Array.isArray(list)?list:me.playlist);
  /* Se pide de vuelta la columna para comprobar que el UPDATE no fue un
     204 vacío (RLS activo sin política de UPDATE). Antes la app decía que
     todo había ido bien aunque no se guardara nada. */
  const{data,error}=await sb.from('profiles').update({playlist:list})
    .eq('id',me.id).select('playlist').maybeSingle();
  if(error){
    const m=String(error.message||'');
    if(error.code=='42501'||/row-level security|permission denied/i.test(m))
      toast('No se pudo guardar la playlist: el RLS de <b>profiles</b> no deja actualizar tu fila. '
        +'Ejecuta <b>'+SQL_FIX+'</b> en Supabase → SQL Editor.','err',14000);
    else
      toast('No se pudo guardar la playlist: '+explain(error),'err',10000);
    return false;
  }
  const saved=parsePlaylist(data&&data.playlist);
  if(JSON.stringify(saved)!==JSON.stringify(list)){
    toast('La playlist no se guardó: el servidor no actualizó tu perfil. '
      +'Falta la política de UPDATE en <b>profiles</b>; ejecuta <b>'+SQL_FIX+'</b>.','err',14000);
    return false;
  }
  me.playlist=list;
  return true;
}
async function playlistAddUrl(){
  const url=val('plUrl');
  if(!/^https?:\/\//i.test(url))return toast('Escribe un enlace que empiece por http:// o https://.','warn');
  const list=parsePlaylist(me.playlist);
  if(list.some(t=>t.url===url))return toast('Ese enlace ya está en tu playlist.','warn');
  const src=musicSource(url);
  if(src==='url'&&!musicEmbedUrl(url))
    return toast('Ese enlace no es de Spotify, Deezer, YouTube ni un audio. Prueba con uno compatible.','warn',7000);
  list.push({title:val('plTitle')||musicTitleFromUrl(url),url,kind:src==='audio'?'audio':'embed',source:src});
  if(await savePlaylist(list)){toast('Enlace añadido a tu playlist.','ok');playlistDlg()}
}
async function playlistAddFile(input){
  const f=input&&input.files&&input.files[0];if(!f)return;
  if(!(String(f.type||'').startsWith('audio/')||/\.(mp3|m4a|ogg|wav|aac|flac)$/i.test(f.name||'')))
    return toast('Selecciona un archivo de audio.','warn');
  if(f.size>MAXFILE)return toast('El audio supera los 25 MB.','warn',7000);
  toast('Subiendo audio…','ok',2500);
  try{
    const url=await upRaw(f);
    const list=parsePlaylist(me.playlist);
    list.push({title:String(f.name||'Audio').replace(/\.[^.]+$/,''),url,kind:'audio',source:'audio'});
    if(await savePlaylist(list)){toast('Audio añadido a tu playlist.','ok');playlistDlg()}
  }catch(e){toast(e.message||'No se pudo subir el audio.','err',7000)}
}
async function playlistRemove(i){
  const list=parsePlaylist(me.playlist);
  if(i<0||i>=list.length)return;
  if(!confirm('¿Quitar «'+list[i].title+'» de tu playlist?'))return;
  list.splice(i,1);
  if(await savePlaylist(list)){toast('Pista quitada.','ok');playlistDlg()}
}
async function playlistMove(i,dir){
  const list=parsePlaylist(me.playlist);
  const j=i+dir;if(i<0||j<0||i>=list.length||j>=list.length)return;
  [list[i],list[j]]=[list[j],list[i]];
  if(await savePlaylist(list))playlistDlg();
}

/* ---------- Borrar la cuenta entera ----------
   Antes era imposible: la fila de profiles estaba atada por claves foráneas
   sin ON DELETE y PostgreSQL se negaba con «still referenced from table
   communities». Ahora el SQL pone las cascadas correctas y esta función llama
   a delete_account(), que borra el perfil (y en cascada todo lo suyo) y la
   cuenta de Supabase Auth. Es irreversible, así que hay que escribir el UID. */
function borrarCuentaDlg(){
  const d=document.createElement('div');d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card" style="display:grid;gap:12px;max-width:520px;margin:0 auto">
    <div class="row"><b class="grow" style="color:var(--rd)"><i class="fa-solid fa-triangle-exclamation"></i>
        Eliminar la cuenta ${esc(me.uid)}</b>
      <button class="sm" onclick="this.closest('.preview').remove()"><i class="fa-solid fa-xmark"></i></button></div>
    <p><b>Se borra todo:</b> tu perfil, tu llave de cifrado, tus publicaciones,
      reacciones, comentarios, personajes, libros, salas, mensajes, comunidades
      que hayas creado y tu dinero de la tienda.</p>
    <p class="mu">Los mensajes privados que tengas con otras personas se
      quedan, pero nadie podrá volver a descifrarlos.</p>
    <p><b>No se puede deshacer.</b> Para confirmarlo, escribe tu UID:</p>
    <input id="delcuenta" placeholder="${esc(me.uid)}" autocomplete="off" autocapitalize="none" spellcheck="false">
    <div class="row"><button class="d grow" onclick="borrarCuenta()">
      <i class="fa-solid fa-trash"></i> Borrar mi cuenta para siempre</button>
      <button class="sm" onclick="this.closest('.preview').remove()">Cancelar</button></div></div>`;
  d.onclick=e=>{if(e.target===d)d.remove()};
  document.body.appendChild(d);
}
async function borrarCuenta(){
  const c=$('delcuenta');
  if(!c||c.value.trim()!==me.uid)
    return toast('El UID no coincide. Escríbelo tal cual: '+me.uid,'err',7000);
  if(!confirm('Última confirmación: esto no se puede deshacer. ¿Continuar?'))return;
  const{error}=await sb.rpc('delete_account');
  if(error&&!isNoFn(error))return toast('No se pudo borrar: '+explain(error),'err',9000);
  localStorage.removeItem('tbl_'+me.id);
  document.querySelector('.preview')?.remove();
  if(error)return toast('La función <b>delete_account</b> no existe: ejecuta '
    +SQL_FIX+'.','err',10000);
  const rem=getRemembered();
  if(rem&&me&&rem.uid===me.uid)localStorage.removeItem(REM_KEY);
  await sb.auth.signOut();
  toast('Tu cuenta se ha eliminado.','ok',4000);
  location.reload();
}
/* Avatar con marco equipado */
function meAvatar(u,s,boxId=''){
  const f=u&&u.frame_id?SHOP[u.frame_id]:null;
  if(!f)return av(u,s,'',boxId);
  const d=f.data||{};
  const deco=d.img?`;--fimg:url('${esc(d.img)}')`:'';
  const id=boxId?` id="${esc(boxId)}"`:'';
  return `<span${id} class="avf" data-f="${d.style||'conic'}" style="--f1:${d.from||'#ff8e9b'};--f2:${d.to||'#c92a3f'}${deco};width:${s+10}px;height:${s+10}px">
    ${av(u,s)}</span>`;
}
/* Refresca solo el avatar de un perfil abierto, sin re-renderizar toda la vista */
function refreshProfileAvatar(id){
  if(!P[id])return;
  if(me&&id===me.id&&view==='me'&&$('meAvatarBox'))
    $('meAvatarBox').outerHTML=meAvatar(me,84,'meAvatarBox');
  if(view==='prof'&&PROF===id&&$('profAvatar'))
    $('profAvatar').outerHTML=meAvatar(P[id],96,'profAvatar');
}
/* Refresca chats abiertos cuando cambia la burbuja o el marco */
function refreshOpenChats(){
  if(view==='dms'&&cur)loadDM();
  if(view==='rooms'&&cur&&cur.kind!='voz')loadRoom();
  Object.keys(MINIS).forEach(id=>loadMini(id));
}
/* Estilo de burbuja equipado de una persona ("" si no tiene) */
function bubbleStyle(u){
  const b=u&&u.bubble_id?SHOP[u.bubble_id]:null;
  if(!b)return '';
  const d=b.data||{};
  let st=`--bb-bg:${d.bg||'rgba(255,255,255,.06)'};--bb-r:${d.r||'14px'};--bb-tx:${d.text||'var(--ct)'}`;
  if(d.img)st+=`;--bb-img:url('${esc(d.img)}');--bb-pad:36px`;
  return st;
}
async function mePublic(){
  const to=!me.is_private;
  const{error}=await sb.from('profiles').update({is_private:to}).eq('id',me.id);
  if(error)return toast(error.message,'err');
  me.is_private=to;
  toast(to?'Tu perfil es privado. Solo lo verán quienes tú permitas.':'Tu perfil es público.','ok',5000);
  meBody();
}
function viewMyProfile(){
  ME_TAB='resumen';
  PEEK=true;
  openProfile(me.id);
}
function meEdit(){
  const body=$('meBody');if(!body)return;
  stopProfileMusic();
  body.innerHTML=`<div class="editwrap">
    <div class="row edithead">
      <button class="sm" onclick="setMeTab('resumen')"><i class="fa-solid fa-arrow-left"></i> Volver</button>
      <div class="grow"><h2>Editar perfil</h2><div class="mu">Personaliza cómo te ve la comunidad</div></div>
      <button class="p" onclick="saveMe()"><i class="fa-solid fa-floppy-disk"></i> Guardar</button>
    </div>

    <div class="editcard">
      <div class="eh"><span class="ehi"><i class="fa-solid fa-user"></i></span>
        <div><b>Datos básicos</b><span>Tu nombre, edad y foto de perfil.</span></div></div>
      <div class="field"><label>Nombre visible</label><input id="mn" value="${esc(me.name)}"></div>
      <div class="row" style="gap:12px">
        <div class="field grow"><label>Edad</label><input id="ma" type="number" min="1" max="120" value="${me.age??''}"></div>
        <div class="field grow"><label>Género</label><input id="mg" value="${esc(me.gender)}"></div></div>
      <div class="field"><label>Foto de perfil</label><input id="mav" type="file" accept="image/*"></div>
    </div>

    <div class="editcard">
      <div class="eh"><span class="ehi"><i class="fa-solid fa-quote-left"></i></span>
        <div><b>Sobre ti</b><span>Una breve biografía para tu perfil.</span></div></div>
      <div class="field"><label>Biografía</label><textarea id="mb" placeholder="Cuéntanos de ti…">${esc(me.bio)}</textarea></div>
    </div>

    <div class="editcard socialcard">
      <div class="eh"><span class="ehi"><i class="fa-solid fa-share-nodes"></i></span>
        <div><b>Redes sociales</b><span>Tus enlaces, separados de los datos del perfil.</span></div></div>
      <div class="socialbox">
        <div class="socialicons"><i class="fa-brands fa-instagram"></i><i class="fa-brands fa-x-twitter"></i>
          <i class="fa-brands fa-tiktok"></i><i class="fa-brands fa-discord"></i><i class="fa-brands fa-youtube"></i>
          <i class="fa-brands fa-twitch"></i><i class="fa-brands fa-github"></i><i class="fa-solid fa-link"></i></div>
        <textarea id="ml" placeholder="https://instagram.com/tu-usuario&#10;https://discord.gg/…" oninput="socialPreview(this.value)">${esc(me.links)}</textarea>
        <div class="socialhint"><i class="fa-solid fa-circle-info"></i>
          <span>Escribe <b>un enlace por línea</b>. Se mostrarán como iconos en tu perfil y en tus publicaciones.</span></div>
        <div class="socialprev" id="socialprev"></div>
      </div>
    </div>

    <div class="editcard musiccard">
      <div class="eh"><span class="ehi"><i class="fa-solid fa-music"></i></span>
        <div><b>Música de tu perfil</b><span>Una playlist que suena cuando alguien entra en tu perfil.</span></div></div>
      <p class="mu" style="margin:0">Añade enlaces de Spotify, Deezer o YouTube, o sube tus propios MP3.
        La música se detiene automáticamente cuando sales del perfil.</p>
      <button class="p" onclick="playlistDlg()"><i class="fa-solid fa-sliders"></i> Gestionar playlist</button>
    </div>

    <div class="editcard">
      <div class="eh"><span class="ehi"><i class="fa-solid fa-palette"></i></span>
        <div><b>Apariencia</b><span>Fondo de tus chats y color de tu nombre.</span></div></div>
      <div class="field"><label>Fondo de tus chats <i class="fa-solid fa-lock" title="Solo se ve en tus conversaciones, no en tu perfil"></i></label>
        <input id="mbg" type="file" accept="image/*">
        ${me.bg?'<button class="sm" onclick="clearMyBg()"><i class="fa-solid fa-eraser"></i> Quitar fondo actual</button>':''}</div>
      <div class="field"><label>Color de tu nombre</label>${themeSwatches(me.accent,'setMeColor')}</div>
    </div>

    <button class="p" style="width:100%;padding:13px" onclick="saveMe()"><i class="fa-solid fa-floppy-disk"></i> Guardar cambios</button>
  </div>`;
  socialPreview(me.links);
}
function setMeColor(c){
  document.documentElement.style.setProperty('--ac',c);
  me.accent=c;
}
/* ---------- Centro de recompensas ---------- */
function closeReward(){
  document.getElementById('rewarddlg')?.remove();
}
async function rewardDlg(){
  closeReward();
  const d=document.createElement('div');
  d.id='rewarddlg';d.className='preview';
  d.innerHTML=`<div class="wrap"><div class="card rewardcard">
    <div class="row"><b class="grow" style="font-family:Syne;font-size:19px">
      <i class="fa-solid fa-trophy" style="color:#ff8e9b"></i> Recompensas</b>
      <button class="sm" onclick="closeReward()" title="Cerrar"><i class="fa-solid fa-xmark"></i></button></div>
    <div id="rewardBody"><div class="mu">Cargando…</div></div>
  </div></div>`;
  d.onclick=e=>{if(e.target===d)closeReward()};
  document.body.appendChild(d);
  await rewardBody();
}
async function rewardBody(){
  const box=$('rewardBody');if(!box)return;
  const lv=lvOf(me.xp);
  const bd=(await q('badges',async()=>{
    const{data}=await sb.from('badges').select('*').eq('user_id',me.id)
      .order('awarded_at',{ascending:false});
    return data||[];
  },[]))||[];
  const ck=await q('checkins',async()=>{
    const{data}=await sb.from('checkins').select('day,streak').eq('user_id',me.id)
      .order('day',{ascending:false}).limit(1);
    return data;
  },null);
  const last=ck&&ck[0];
  const today=new Date().toISOString().slice(0,10);
  const done=!!(last&&last.day===today);
  const streak=last?(last.streak||1):0;
  const keys=COLS.profiles.has('keys')?(me.keys??0):'—';
  const daily=await loadDailyMissions().catch(()=>[]);
  box.innerHTML=`
    <div class="rewardhero">
      <div class="rwicon"><i class="fa-solid fa-trophy"></i></div>
      <div class="grow"><h2>Nivel ${lv} · ${titleOf(lv)}</h2>
        <p class="mu">Tu progreso, tus llaves y tus recompensas diarias.</p></div>
    </div>
    <div class="rwstats">
      <div class="rwstat"><b>${me.xp||0}</b><span>XP</span></div>
      <div class="rwstat"><b>${me.coins||0}</b><span>Monedas T</span></div>
      <div class="rwstat"><b>${keys}</b><span>Llaves</span></div>
    </div>
    <div><div class="row"><span class="mu grow">Progreso al nivel ${lv+1}</span>
      <span class="mu">${(me.xp||0)%100}/100</span></div>
      <div class="bar"><i style="width:${(me.xp||0)%100}%"></i></div></div>
    <div class="rwcheck">
      <div class="rwline"><i class="fa-solid fa-calendar-check"></i>
        <div class="grow"><b>Check-in diario</b>
          <div class="mu">${done?'Ya lo has hecho hoy.':'+20 XP · +10 monedas · racha de '+streak+' días'}</div></div></div>
      <button class="${done?'':'p'}" onclick="rewardCheckin(this)" ${done?'disabled':''}>
        <i class="fa-solid fa-gift"></i> ${done?'Check-in completado':'Reclamar recompensa'}</button>
      <div class="mu" style="font-size:11.5px">Cada 7 días de racha ganas además 1 llave para la wallet.</div>
    </div>
    ${dailyMissionsHtml(daily)}
    ${walletPanelHtml('rwWalletList')}
    <div><div class="mu" style="text-transform:uppercase;font-size:11px;letter-spacing:.08em;margin-bottom:6px">Insignias</div>
      ${bd.length?`<div class="rwbadges">${bd.map(b=>`<span class="tag"><i class="${esc(b.icon||'fa-solid fa-award')}"></i> ${esc(b.label||'Insignia')}</span>`).join('')}</div>`
        :'<p class="mu" style="margin:0">Todavía no tienes insignias. Participa en comunidades y publica para ganarlas.</p>'}</div>
    <div class="rwactions">
      <button class="sm" onclick="closeReward();go('me')"><i class="fa-solid fa-user"></i> Mi perfil</button>
      <button class="sm" onclick="closeReward();go('chars')"><i class="fa-solid fa-store"></i> Ir a la tienda</button>
    </div>`;
  loadWalletHistory('rwWalletList',WALLET_FILTER);
}
function rewardCheckin(btn){
  if(btn)btn.disabled=true;
  checkin(()=>rewardBody());
  setTimeout(()=>{if(btn&&document.body.contains(btn))btn.disabled=false},3000);
}

async function checkin(after){
  /* El XP y las monedas los suma el servidor, no el navegador: si no,
     cualquiera podría editar su propio perfil y ponerse un millón. */
  if(!NOFN.has('checkin_today')){
    const{error,data}=await sb.rpc('checkin_today');
    if(!error){
      const st=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();
      if(st.data){Object.assign(me,st.data);P[me.id]=me}
      toast('¡Check-in hecho! Día '+data+' · +20 XP y +10 monedas.'
        +(Number(data)%7===0?' +1 llave por 7 días de racha.':''),'ok');
      meBody();after?.();return;
    }
    if(isNoFn(error)){
      NEWOK=false;MISSING.add('función checkin_today');schemaBar();
    }
  }
  if(!NEWOK)return toast('El check-in necesita <b>'+SQL_FIX+'</b>.','warn',7000);
  const{error}=await sb.from('checkins').insert({user_id:me.id});
  if(error)return toast(error.message.includes('duplicate')?'Ya hiciste check-in hoy.':error.message,'warn');
  toast('¡Check-in hecho! +20 XP y +10 monedas.','ok');
  const{data:p}=await sb.from('profiles').select('*').eq('id',me.id).maybeSingle();
  if(p){Object.assign(me,p);P[me.id]=me}
  meBody();after?.();
}
async function clearMyBg(){
  const{error}=await sb.from('profiles').update({bg:null}).eq('id',me.id);
  if(error)return toast(error.message,'err');
  me.bg=null;toast('Fondo de chat quitado.');meBody();
}
async function saveMe(){
  const a=await fu('mav'),b=await fu('mbg');
  const row=fit('profiles',{name:val('mn'),age:parseInt(val('ma'))||null,gender:val('mg'),
    bio:val('mb'),links:val('ml'),avatar:a||me.avatar,bg:b||me.bg,accent:me.accent});
  if(!row.name)return toast('El nombre no puede estar vacío.','err');
  const{error}=await sb.from('profiles').update(row).eq('id',me.id);
  if(error)return toast(error.message,'err');
  Object.assign(me,row);P[me.id]=me;cacheProfile();
  document.documentElement.style.setProperty('--ac',me.accent||'#ff8e9b');
  toast('Perfil guardado.','ok');
  setMeTab('resumen');
}

/* ==========================================================================
   18) Iconos de redes
   ========================================================================== */
const SOC=[['instagram','fa-instagram'],['twitter.com','fa-x-twitter'],['x.com','fa-x-twitter'],['tiktok','fa-tiktok'],
  ['youtu','fa-youtube'],['twitch','fa-twitch'],['discord','fa-discord'],['github','fa-github'],['spotify','fa-spotify'],
  ['facebook','fa-facebook'],['t.me','fa-telegram'],['reddit','fa-reddit'],['tumblr','fa-tumblr'],['pinterest','fa-pinterest'],
  ['wa.me','fa-whatsapp'],['soundcloud','fa-soundcloud'],['patreon','fa-patreon'],['behance','fa-behance'],['linkedin','fa-linkedin']];
const soc=l=>(l||'').split(/\s+/).filter(u=>/^https?:\/\//.test(u)).map(u=>{
  const m=SOC.find(x=>u.toLowerCase().includes(x[0]));
  return `<a class="sl" href="${esc(u)}" target="_blank" rel="noopener noreferrer" title="${esc(u)}"><i class="${m?'fa-brands '+m[1]:'fa-solid fa-link'}"></i></a>`}).join('');

function socialPreview(v){
  const b=$('socialprev');if(!b)return;
  const h=soc(v);
  b.innerHTML=h||'<span class="mu" style="font-size:11.5px">Los enlaces aparecerán aquí.</span>';
}

/* ==========================================================================
   Arranque
   ========================================================================== */
window.addEventListener('offline',()=>{
  if(me){OFFLINE=true;toast('Sin conexión. Sigues viendo lo guardado.','warn',7000)}
});
window.addEventListener('online',()=>{
  if(OFFLINE){OFFLINE=false;toast('Conexión recuperada. Pulsa el botón de recargar si quieres actualizar.','ok',7000)}
});
/* Deslizar hacia la derecha desde el borde izquierdo abre Mi perfil.
   Se ignora en elementos con scroll horizontal, formularios y ventanas. */
let _swipe={x:0,y:0,on:false};
document.addEventListener('touchstart',e=>{
  if(e.touches.length!==1||!window.matchMedia('(max-width:600px)').matches)return;
  if(typeof me==='undefined'||!me||typeof view==='undefined'||view==='me')return;
  const t=e.target;
  if(!t||!t.closest)return;
  if(t.closest('input,textarea,select,video,audio,button,a,.stories,.peoplerail,.mas,.gal,.thumbs,.album,.segbar,.tabs,.settabs,.preview,.sheet,.setbox,.commset,#sview,#rail,.fabdock,.mtop,.profiletab,.reel'))return;
  const x=e.touches[0].clientX,y=e.touches[0].clientY;
  _swipe={x,y,on:true};
},{passive:true});
document.addEventListener('touchend',e=>{
  if(!_swipe.on)return;
  _swipe.on=false;
  const t=e.changedTouches&&e.changedTouches[0];if(!t)return;
  const dx=t.clientX-_swipe.x,dy=t.clientY-_swipe.y;
  if(dx>72&&Math.abs(dy)<56)go('me');
},{passive:true});
document.addEventListener('touchcancel',()=>{_swipe.on=false},{passive:true});

/* Sin zoom por pellizco en móvil. El viewport ya lo bloquea; esto cubre
   Safari, que a veces ignora user-scalable=no. */
document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
document.addEventListener('gesturechange',e=>e.preventDefault(),{passive:false});
document.addEventListener('touchmove',e=>{
  if(e.touches&&e.touches.length>1)e.preventDefault();
},{passive:false});

start();
