(()=>{
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',KEY='netsim-v2';
const css=p=>getComputedStyle(document.documentElement).getPropertyValue(p).trim();
const esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
const FIB={SM1310:['SM 1310 nm',.35],SM1490:['SM 1490 nm',.25],SM1550:['SM 1550 nm',.22],MM850:['MM 850 nm',3],MM1300:['MM 1300 nm',1]};
const SPL={2:3.5,4:7.2,8:10.5,16:13.8};
const FT={cut:'قطع',dirty:'موصل متسخ',bend:'انحناء'},ST={open:'مفتوح',work:'قيد المعالجة',closed:'مغلق'};
const base=()=>{
  const N={router:{n:'الراوتر',e:'Router',i:'📡',x:50,y:12},switch:{n:'السويتش / OLT',e:'Switch · OLT',i:'🔀',x:50,y:38},spl:{n:'سبليتر',e:'Splitter',i:'🔱',x:50,y:63},
    pc1:{n:'حاسوب 1',e:'ONT-01',i:'💻',x:18,y:88},pc2:{n:'حاسوب 2',e:'ONT-02',i:'🖥️',x:50,y:88},pc3:{n:'حاسوب 3',e:'ONT-03',i:'🖥️',x:82,y:88}};
  const on={};Object.keys(N).forEach(k=>on[k]=true);
  const lk=(a,b,t,len,sp)=>({a,b,t,len,sp,f:'ok',fp:.5});
  return{N,on,L:{'router-switch':lk('router','switch','cu',.01,0),'switch-spl':lk('switch','spl','fo',5,1),'spl-pc1':lk('spl','pc1','fo',.3,0),'spl-pc2':lk('spl','pc2','fo',.3,0),'spl-pc3':lk('spl','pc3','fo',.3,0)},
    v:{pc1:10,pc2:10,pc3:20},T:[],st:{sent:0,succ:0,latS:0,latN:0},h:[],acl:[],fw:0,atk:null,ex:null,dba:1,bw:{pc1:100,pc2:100,pc3:100},biz:{fee:25,opex:40},cfg:{fib:'SM1310',ratio:4},t0:Date.now(),tr:null};
};
let S=base(),selN='pc1',selL='switch-spl',busy=false;
const canvas=$('canvas'),svg=$('links'),el={};
const att=()=>FIB[S.cfg.fib][1],lname=k=>S.N[S.L[k].a].n+' ↔ '+S.N[S.L[k].b].n;
const vis=k=>S.tr&&S.tr.k===k?'ok':S.L[k].f;
const linkKey=(x,y)=>Object.keys(S.L).find(k=>(S.L[k].a===x&&S.L[k].b===y)||(S.L[k].a===y&&S.L[k].b===x));
const ip=k=>k==='router'?'192.168.1.1':k==='switch'?'192.168.1.2':S.v[k]?`192.168.${S.v[k]}.${10+parseInt(k.slice(2))}`:null;
Object.entries(FIB).forEach(([k,v])=>$('fib').add(new Option(v[0],k)));
function path(a,b){
  const q=[[a]],seen={[a]:1};
  while(q.length){const p=q.shift(),c=p[p.length-1];if(c===b)return p;
    Object.values(S.L).forEach(l=>{const n=l.a===c?l.b:l.b===c?l.a:null;if(n&&!seen[n]){seen[n]=1;q.push([...p,n])}})}
  return[a,b];
}
const hub=(a,b,h)=>[...path(a,h),...path(h,b).slice(1)];
const route=(a,b)=>S.v[a]&&S.v[b]?hub(a,b,S.v[a]===S.v[b]?'switch':'router'):path(a,b);
function ev(p,nf){
  let loss=0,len=0,fo=0,down=p.some(n=>!S.on[n]);
  for(let i=0;i<p.length-1;i++){
    const l=S.L[linkKey(p[i],p[i+1])];if(!l){down=1;continue}
    if(l.f==='cut'&&!nf)down=1;len+=l.len;
    if(l.t==='fo'){fo=1;loss+=l.len*att()+1+l.sp*.1+(l.odf?1:0)+({dirty:3,bend:1.5}[nf?'':l.f]||0)}
  }
  if(fo)loss+=p.slice(1,-1).filter(x=>x==='spl').length*SPL[S.cfg.ratio];
  const m=fo?30-loss:null,far=p.some(n=>S.v[n]&&dist(n)>20);
  return{s:down?'down':fo&&(m<0||far)?'fail':fo&&(m<3||3-loss>-8)?'warn':'ok',loss,len,fo,rx:3-loss,ov:fo&&3-loss>-8,m,base:(p.length-1)*.4+len*.02};
}
function center(id){const c=canvas.getBoundingClientRect(),r=el[id].getBoundingClientRect();return{x:r.left-c.left+r.width/2,y:r.top-c.top+r.height/2}}
function build(){
  canvas.querySelectorAll('.node').forEach(n=>n.remove());Object.keys(el).forEach(k=>delete el[k]);
  Object.entries(S.N).forEach(([id,n])=>{
    const d=document.createElement('div'),i=document.createElement('span'),s=document.createElement('strong');
    d.className='node';i.className='i';i.textContent=n.i;s.textContent=n.n;d.append(i,s,document.createElement('small'));
    d.style.left=n.x+'%';d.style.top=n.y+'%';canvas.append(d);el[id]=d;bind(d,id);
  });
  fill();
}
function fill(){
  const sv=[$('source').value,$('target').value];
  ['source','target'].forEach((s,j)=>{$(s).replaceChildren();Object.keys(S.N).filter(k=>k!=='spl').forEach(k=>$(s).add(new Option(S.N[k].n,k)));
    $(s).value=S.N[sv[j]]&&sv[j]!=='spl'?sv[j]:(j?'router':'pc1')});
  $('linkSel').replaceChildren();Object.keys(S.L).forEach(k=>$('linkSel').add(new Option(lname(k),k)));
  $('fib').value=S.cfg.fib;$('rat').value=S.cfg.ratio;['as','ad'].forEach(s=>{$(s).replaceChildren();Object.keys(S.N).filter(k=>k!=='spl').forEach(k=>$(s).add(new Option(S.N[k].n,k)))});
}
function draw(){
  svg.setAttribute('viewBox',`0 0 ${canvas.clientWidth} ${canvas.clientHeight}`);svg.replaceChildren();
  Object.entries(S.L).forEach(([k,l])=>{
    const a=center(l.a),b=center(l.b),f=vis(k),dn=f==='cut'||!S.on[l.a]||!S.on[l.b];
    const ln=document.createElementNS(NS,'line');
    ln.setAttribute('x1',a.x);ln.setAttribute('y1',a.y);ln.setAttribute('x2',b.x);ln.setAttribute('y2',b.y);
    ln.setAttribute('class','link '+(dn?'down':f!=='ok'?'warn':l.t==='cu'?'cu':'ok'));
    ln.setAttribute('stroke-width',k===selL?6:3);ln.addEventListener('click',()=>{selL=k;update()});svg.append(ln);
    const t=document.createElementNS(NS,'text');t.setAttribute('x',(a.x+b.x)/2+8);t.setAttribute('y',(a.y+b.y)/2-5);t.setAttribute('class','lt');
    t.textContent=(l.t==='fo'?`FO ${l.len} km · ${COL[colOf(k)-1][0]}${l.odf?' · ODF':''}`:'Cu Cat6')+(dn?' · DOWN':f==='dirty'?' · موصل متسخ':f==='bend'?' · انحناء':'');svg.append(t);
  });
}
function budget(){
  const a=$('source').value,b=$('target').value;
  if(a===b){$('bud').innerHTML='<tr><td>اختر جهازين مختلفين</td><td>—</td></tr>';return}
  const p=route(a,b),e=ev(p),f=v=>e.fo?v:'—';
  $('bud').innerHTML=`<tr><td>المسار</td><td style="direction:rtl">${esc(p.map(n=>S.N[n].n).join(' ← '))}</td></tr>
  <tr><td>الليف</td><td>${FIB[S.cfg.fib][0]}</td></tr><tr><td>الطول الكلي</td><td>${e.len.toFixed(2)} km</td></tr>
  <tr><td>التوهين الكلي</td><td>${f(e.loss.toFixed(2)+' dB')}</td></tr><tr><td>قدرة الاستقبال Rx</td><td>${f(e.rx.toFixed(2)+' dBm')}</td></tr>
  <tr><td>هامش القدرة</td><td>${f(e.fo&&e.m.toFixed(2)+' dB')}</td></tr>
  <tr><td>حالة المسار</td><td style="direction:rtl">${{ok:'سليم ✔',warn:e.ov?'تشبع المستقبل (Rx > −8 dBm) ⚠':'هامش ضعيف ⚠',fail:'فشل: Rx أقل من الحساسية ✘',down:'منقطع ✘'}[e.s]}</td></tr>`;
}
function otdr(){
  const l=S.L[selL],c=$('ot'),g=c.getContext('2d'),w=c.width,h=c.height;
  g.clearRect(0,0,w,h);g.font='11px Tahoma';g.fillStyle=css('--muted');
  if(l.t!=='fo'){g.fillText('OTDR للألياف الضوئية فقط',12,22);return}
  const a=att(),E=[[0,.5,1]];
  for(let i=1;i<=l.sp;i++)E.push([l.len*i/(l.sp+1),.1,0]);
  if(l.f==='dirty')E.push([0,3,1]);
  if(l.f==='bend')E.push([l.len*l.fp,1.5,0]);
  E.push([l.len,.5,1]);E.sort((x,y)=>x[0]-y[0]);
  const end=l.f==='cut'?l.len*l.fp:l.len,ym=Math.max(8,l.len*a+8),X=k=>24+k/l.len*(w-40),Y=p=>16+(-p/ym)*(h-36);
  g.strokeStyle=css('--cyan');g.lineWidth=2;g.beginPath();g.moveTo(X(0),Y(0));
  let p=0,x=0;
  for(const[pos,ls,rf]of E){if(pos>end)break;p-=a*(pos-x);x=pos;g.lineTo(X(x),Y(p));if(rf){g.lineTo(X(x),Y(p)-12);g.lineTo(X(x),Y(p))}p-=ls;g.lineTo(X(x),Y(p))}
  p-=a*(end-x);g.lineTo(X(end),Y(p));
  if(l.f==='cut'){g.lineTo(X(end),Y(-ym+1));g.lineTo(X(l.len),Y(-ym+1))}
  g.stroke();g.fillStyle=css('--muted');g.fillText('0 km',4,h-4);g.fillText(l.len+' km',w-50,h-4);g.fillText('dB',4,12);
}
function lat(){
  const c=$('lc'),g=c.getContext('2d'),w=c.width,h=c.height,mx=Math.max(5,...S.h.filter(x=>x!=null))*1.2,dx=w/40;
  g.clearRect(0,0,w,h);g.strokeStyle=css('--cyan');g.lineWidth=2;g.beginPath();let s=0;
  S.h.forEach((x,i)=>{if(x==null){s=0;return}const X=i*dx+dx/2,Y=h-14-(x/mx)*(h-26);s?g.lineTo(X,Y):g.moveTo(X,Y);s=1});g.stroke();
  g.fillStyle=css('--red');S.h.forEach((x,i)=>{if(x==null)g.fillRect(i*dx+dx/2-2,h-10,4,8)});
  g.fillStyle=css('--muted');g.font='11px Tahoma';g.fillText(mx.toFixed(0)+' ms',4,11);
}
function cost(){
  let f=0,c=0,ok=1;
  Object.values(S.L).forEach(l=>{if(l.t!=='fo')return;const m=l.len*1000;f+=m*.4+l.sp*15+16;c+=m*.9+6;if(m>100)ok=0});
  $('cost').innerHTML=`<tr><td>ليف ضوئي (قطعة + لحام + موصلات)</td><td>$${f.toFixed(0)}</td></tr><tr><td>نحاس Cat6 بنفس الأطوال</td><td style="direction:rtl">${ok?'$'+c.toFixed(0):'غير عملي (>100 م)'}</td></tr>`;
}
function tickets(){
  $('tk').replaceChildren();
  [...S.T].reverse().forEach(t=>{
    const d=document.createElement('div');d.className='li';d.style.cursor='pointer';
    d.innerHTML=`<strong class="${t.s==='closed'?'ok':t.s==='work'?'warnc':'fail'}">#${t.id} · ${ST[t.s]}</strong><p></p>`;d.lastChild.textContent=t.d;
    d.onclick=()=>{if(t.s!=='closed'){t.s=t.s==='open'?'work':'open';update()}};$('tk').append(d);
  });
}
function tkOpen(k,d){if(!S.T.some(t=>t.k===k&&t.s!=='closed'))S.T.push({id:S.T.length+1,k,d,s:'open',o:Date.now()})}
function tkClose(k){S.T.filter(t=>t.k===k&&t.s!=='closed').forEach(t=>{t.s='closed';t.c=Date.now()})}
function update(){
  S.N.spl.n='سبليتر 1:'+S.cfg.ratio;
  Object.keys(el).forEach(id=>{
    el[id].classList.toggle('off',!S.on[id]);el[id].classList.toggle('sel',id===selN);
    el[id].querySelector('strong').textContent=S.N[id].n;el[id].querySelector('small').textContent=S.on[id]?S.N[id].e:'معطّل';
  });
  const bad=Object.keys(S.L).filter(k=>vis(k)!=='ok').length+Object.values(S.on).filter(v=>!v).length;
  $('status').textContent=bad?`● ${bad} عطل/تنبيه في الشبكة`:'● الشبكة تعمل بشكل طبيعي';$('status').style.color=bad?'var(--red)':'var(--green)';
  const s=S.st,av=s.sent?s.succ/s.sent*100:null,cl=S.T.filter(t=>t.c);
  $('sent').textContent=s.sent;$('succ').textContent=s.succ;$('loss').textContent=s.sent?((s.sent-s.succ)/s.sent*100).toFixed(1)+'%':'—';
  $('lat').textContent=s.latN?(s.latS/s.latN).toFixed(1)+' ms':'—';$('av').textContent=s.sent?av.toFixed(2)+'%':'—';
  $('sla').textContent=s.sent?(av>=99.9?'ضمن الهدف':'خارج الهدف'):'—';$('sla').style.color=s.sent?(av>=99.9?'var(--green)':'var(--red)'):'';
  $('mttr').textContent=cl.length?(cl.reduce((a,t)=>a+t.c-t.o,0)/cl.length/1000).toFixed(0)+' ث':'—';
  $('mtbf').textContent=S.T.length?((Date.now()-S.t0)/1000/S.T.length).toFixed(0)+' ث':'—';
  $('tko').textContent=S.T.filter(t=>t.s!=='closed').length;
  const l=S.L[selL];$('linkSel').value=selL;$('len').value=l.len;$('len').disabled=$('sp').disabled=l.t==='cu';$('sp').value=l.sp;
  $('fault').value=vis(selL);$('cut').disabled=vis(selL)==='cut';$('fix').disabled=vis(selL)==='ok';$('otdr').disabled=l.t==='cu';
  $('tog').textContent=(S.on[selN]?'تعطيل ':'تفعيل ')+S.N[selN].n;
  draw();budget();otdr();lat();cost();tickets();ext();
}
function log(t,d,ok,w){
  const e=document.createElement('div'),h=document.createElement('strong'),p=document.createElement('p');
  e.className='li';h.className=w?'warnc':ok?'ok':'fail';
  h.textContent=new Date().toLocaleTimeString('en-GB')+' · '+(w?'تحذير · ':ok?'نجاح · ':'فشل · ')+t;p.textContent=d;e.append(h,p);$('log').prepend(e);
  while($('log').children.length>40)$('log').lastElementChild.remove();
}
function setFault(k,f,hide){
  const l=S.L[k];l.f=f;l.fp=.15+Math.random()*.7;
  f==='ok'?tkClose('L'+k):tkOpen('L'+k,hide?'عطل في الشبكة (قيد التشخيص)':`${lname(k)}: ${FT[f]}`);
}
function animate(p){
  const pts=p.map(center),dot=document.createElementNS(NS,'circle');dot.setAttribute('r','5');dot.setAttribute('class','packet');svg.append(dot);
  let s=0,t=0;
  (function f(){if(!dot.isConnected)return;t+=.06;if(t>=1){t=0;s++}if(s>=pts.length-1){dot.remove();return}
    dot.setAttribute('cx',pts[s].x+(pts[s+1].x-pts[s].x)*t);dot.setAttribute('cy',pts[s].y+(pts[s+1].y-pts[s].y)*t);requestAnimationFrame(f)})();
}
async function send(){
  if(busy)return;
  const a=$('source').value,b=$('target').value;
  if(a===b){log('تعذّر الإرسال','اختر جهازين مختلفين.',false);return}
  const n=Math.max(1,Math.min(20,parseInt($('count').value,10)||1));busy=true;$('send').disabled=true;
  for(let i=0;i<n;i++){
    const p=route(a,b),e=ev(p),q=qos(a,b,e),ok=q.ok,ms=ok?q.ms:null;
    S.st.sent++;if(ok){S.st.succ++;S.st.latS+=ms;S.st.latN++}
    S.h.push(ms);if(S.h.length>40)S.h.shift();update();if(ok)animate(p);
    const r=p.map(x=>S.N[x].n).join(' ← ');
    log(`الحزمة #${S.st.sent}: ${S.N[a].n} إلى ${S.N[b].n}`,
      ok?`وصلت عبر ${r} · ${ms} ms`+(e.fo?` · Rx ${e.rx.toFixed(1)} dBm`:''):q.why?'لم تصل: '+q.why:e.s==='down'?`لم تصل: انقطاع أو جهاز معطّل في ${r}`:`لم تصل: ${e.s==='fail'?'Rx أقل من الحساسية':'فقد بسبب هامش ضعيف'} (Rx ${e.rx.toFixed(1)} dBm)`,ok,ok&&e.s==='warn');
    await new Promise(r=>setTimeout(r,300));
  }
  busy=false;$('send').disabled=false;
}
/* training */
function trTick(){
  if(!S.tr){$('tm').textContent='—';return}
  const r=120-Math.floor((Date.now()-S.tr.t)/1000);$('tm').textContent=r+' ث';
  if(r<=0){const k=S.tr.k,f=S.tr.f;S.tr=null;log('انتهى الوقت',`الدرجة 0/100. العطل كان: ${lname(k)} (${FT[f]}).`,false);setFault(k,'ok');update();trEnd(0)}
}
const trs=()=>{
  const ks=Object.keys(S.L).filter(k=>S.L[k].t==='fo'&&S.L[k].f==='ok');
  if(S.tr||!ks.length){log('سيناريو تدريبي','أصلح الأعطال الحالية أولاً أو أنهِ السيناريو الجاري.',false);return}
  const k=ks[Math.floor(Math.random()*ks.length)],f=['cut','dirty','bend'][Math.floor(Math.random()*3)];
  setFault(k,f,1);S.tr={k,f,t:Date.now(),w:0};log('سيناريو تدريبي','ظهر عطل مجهول. استخدم الإرسال وقياس القدرة وOTDR ثم شخّصه.',true,1);update();
};
$('trs').onclick=()=>{S.ex=null;trs()};
$('exs').onclick=()=>{if(S.tr)return;S.ex={s:[]};trs()};
$('trd').onclick=()=>{
  const t=S.tr;if(!t)return;
  if(selL===t.k&&$('dg').value===t.f){
    const sec=Math.floor((Date.now()-t.t)/1000),sc=Math.max(0,Math.round(100-sec*.5-t.w*15));
    S.tr=null;setFault(t.k,'ok');log('تشخيص صحيح',`الدرجة ${sc}/100 · الزمن ${sec} ث · محاولات خاطئة ${t.w}`,true);setTimeout(()=>trEnd(sc),0);
  }else{t.w++;log('تشخيص خاطئ','راجع قياسات القدرة وأثر OTDR.',false)}
  update();
};
setInterval(trTick,1000);
/* terminal */
const tout=$('tout'),tp=s=>{const d=document.createElement('div');d.textContent=s;tout.append(d);tout.scrollTop=tout.scrollHeight};
const who=s=>{s=(s||'').toLowerCase();return S.N[s]&&s!=='spl'?s:Object.keys(S.N).find(k=>ip(k)===s)};
function cmd(line){
  const[c,a,b]=line.trim().split(/\s+/),src=$('source').value;tp(`${src}> ${line}`);
  if(c==='help')tp('ping <host> | trace <host> | ip | vlan <pcN> <id> | clear');
  else if(c==='clear')tout.replaceChildren();
  else if(c==='ip')Object.keys(S.N).filter(k=>k!=='spl').forEach(k=>tp(`${S.N[k].e.padEnd(14)} ${ip(k)}${S.v[k]?'  VLAN '+S.v[k]:''}`));
  else if(c==='vlan'){const k=who(a),id=+b;if(!S.v[k]||!(id>0&&id<4095))tp('usage: vlan <pcN> <1-4094>');else{S.v[k]=id;tp(`${k} -> VLAN ${id} (${ip(k)})`);update()}}
  else if(c==='ping'||c==='trace'){
    const t=who(a);if(!t)return tp('host غير معروف');if(t===src)return tp('نفس الجهاز');
    const p=route(src,t),e=ev(p);
    if(c==='ping'){let ok=0;for(let i=0;i<4;i++){const g=qos(src,t,e).ok;if(g){ok++;tp(`reply from ${ip(t)}: time=${(e.base*2+Math.random()*1.5).toFixed(2)}ms`)}else tp('request timed out')}tp(`${ok}/4 received, ${(100-ok*25)}% loss`)}
    else for(let i=1;i<p.length;i++){
      if(ev(p.slice(0,i+1)).s==='down'){tp(`${i}  * * *  request timed out`);break}
      tp(`${i}  ${ip(p[i])||'(passive splitter)'}  ${(ev(p.slice(0,i+1)).base*2+Math.random()).toFixed(2)} ms`);
    }
  }else if(c)tp('أمر غير معروف. اكتب help');
}
$('tin').onkeydown=e=>{if(e.key==='Enter'){cmd($('tin').value);$('tin').value=''}};
tp('NetSim terminal — اكتب help');
/* controls */
$('send').onclick=send;$('source').onchange=$('target').onchange=budget;
$('linkSel').onchange=e=>{selL=e.target.value;update()};
$('len').onchange=e=>{const l=S.L[selL];l.len=Math.max(.01,Math.min(20,parseFloat(e.target.value)||l.len));log('تعديل الطول',`${lname(selL)}: ${l.len} km`,true);update()};
$('sp').onchange=e=>{S.L[selL].sp=Math.max(0,Math.min(20,parseInt(e.target.value,10)||0));update()};
$('fault').onchange=e=>{const f=e.target.value;setFault(selL,f);log('حالة الوصلة',`${lname(selL)}: ${e.target.selectedOptions[0].text}`,f==='ok',f==='dirty'||f==='bend');update()};
$('cut').onclick=()=>{setFault(selL,'cut');log('قطع الوصلة',lname(selL),false);update()};
$('fix').onclick=()=>{setFault(selL,'ok');log('إعادة الاتصال',`أُصلحت ${lname(selL)}.`,true);update()};
$('otdr').onclick=()=>{
  const l=S.L[selL],r=()=>(l.len*l.fp).toFixed(2),h='OTDR · '+lname(selL);
  if(l.f==='cut')log(h,`نهاية الأثر: انقطاع على بعد ${r()} km من ${S.N[l.a].n}.`,false);
  else if(l.f==='dirty')log(h,'حدث انعكاسي عند 0.00 km، فقد 3.0 dB: نظّف الموصل.',false,1);
  else if(l.f==='bend')log(h,`فقد غير انعكاسي 1.5 dB عند ${r()} km: انحناء حاد.`,false,1);
  else log(h,`لا أحداث شاذة. توهين الألياف ${(l.len*att()).toFixed(2)} dB.`,true);
};
$('pm').onclick=()=>{
  if(!S.v[selN]){log('قياس القدرة','حدّد ONT (حاسوب) أولاً.',false);return}
  const e=ev(path('switch',selN));
  log('Power Meter',`${S.N[selN].e} @ ${FIB[S.cfg.fib][0]}: Rx ${(e.rx+(Math.random()-.5)*.2).toFixed(2)} dBm (±0.1) · هامش ${e.m.toFixed(1)} dB`,e.s==='ok',e.s==='warn');
};
$('tog').onclick=()=>{
  const on=S.on[selN]=!S.on[selN];on?tkClose('N'+selN):tkOpen('N'+selN,`${S.N[selN].n}: جهاز معطّل`);
  log(S.N[selN].n,on?'تم تفعيل الجهاز.':'تم تعطيل الجهاز.',on);update();
};
$('add').onclick=()=>{
  const pcs=Object.keys(S.v);
  if(pcs.length>=S.cfg.ratio){log('إضافة ONT',`منافذ السبليتر 1:${S.cfg.ratio} ممتلئة.`,false);return}
  const k=Math.max(...pcs.map(x=>parseInt(x.slice(2))))+1,id='pc'+k;
  S.N[id]={n:'حاسوب '+k,e:'ONT-'+String(k).padStart(2,'0'),i:'🖥️',x:12+(k*17)%76,y:k%2?76:90};S.on[id]=true;S.v[id]=10;
  S.L['spl-'+id]={a:'spl',b:id,t:'fo',len:.3,sp:0,f:'ok',fp:.5};build();log('إضافة ONT',`أُضيف ${S.N[id].n} (${ip(id)}).`,true);update();
};
$('fib').onchange=e=>{S.cfg.fib=e.target.value;log('الليف',FIB[S.cfg.fib][0],true);update()};
$('rat').onchange=e=>{
  if(Object.keys(S.v).length>+e.target.value){e.target.value=S.cfg.ratio;log('السبليتر','عدد ONT أكبر من منافذ النسبة المختارة.',false);return}
  S.cfg.ratio=+e.target.value;fill();update();
};
$('clear').onclick=()=>$('log').replaceChildren();
$('reset').onclick=()=>{S=base();selN='pc1';selL='switch-spl';build();$('log').replaceChildren();log('إعادة ضبط','عادت الشبكة والإحصاءات إلى الحالة الافتراضية.',true);update()};
/* persistence */
const snap=()=>JSON.stringify({...S,tr:null});
function load(o){
  if(!o||!o.N||!o.L||!o.on||!o.v)throw 0;
  S=Object.assign(base(),o,{tr:null});
  Object.values(S.L).forEach(l=>{l.len=+l.len||.01;l.sp=+l.sp||0;l.fp=+l.fp||.5});
  selL=Object.keys(S.L)[1]||Object.keys(S.L)[0];selN=Object.keys(S.v)[0]||'router';build();log('تحميل','تم تحميل الطوبولوجيا.',true);update();
}
$('save').onclick=()=>{try{localStorage.setItem(KEY,snap());log('حفظ','حُفظت الطوبولوجيا في المتصفح.',true)}catch{log('حفظ','التخزين غير متاح.',false)}};
$('load').onclick=()=>{try{const j=localStorage.getItem(KEY);j?load(JSON.parse(j)):log('تحميل','لا توجد نسخة محفوظة.',false)}catch{log('تحميل','تعذّر التحميل.',false)}};
$('exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([snap()],{type:'application/json'}));a.download='network-topology.json';a.click();URL.revokeObjectURL(a.href)};
$('imp').onchange=e=>{const f=e.target.files[0];if(f)f.text().then(t=>load(JSON.parse(t))).catch(()=>log('استيراد','ملف غير صالح.',false));e.target.value=''};
/* theme + print */
$('th').onclick=()=>{const d=document.documentElement,c=d.dataset.theme||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');d.dataset.theme=c==='light'?'dark':'light';update()};
$('prt').onclick=()=>dl(pdf([report()]),'network-report.pdf');
let pt;addEventListener('beforeprint',()=>{pt=document.documentElement.dataset.theme;document.documentElement.dataset.theme='light';update()});
addEventListener('afterprint',()=>{pt?document.documentElement.dataset.theme=pt:delete document.documentElement.dataset.theme;update()});
/* drag */
function bind(d,id){
  let g=null;
  d.addEventListener('click',()=>{selN=id;update()});
  d.addEventListener('pointerdown',e=>{if(e.button!==0)return;g={x:e.clientX,y:e.clientY,l:S.N[id].x,t:S.N[id].y,m:false};d.setPointerCapture(e.pointerId)});
  d.addEventListener('pointermove',e=>{
    if(!g)return;const c=canvas.getBoundingClientRect(),dx=(e.clientX-g.x)/c.width*100,dy=(e.clientY-g.y)/c.height*100;
    if(Math.abs(dx)+Math.abs(dy)>1)g.m=true;
    if(g.m){S.N[id].x=Math.max(9,Math.min(91,g.l+dx));S.N[id].y=Math.max(11,Math.min(89,g.t+dy));d.style.left=S.N[id].x+'%';d.style.top=S.N[id].y+'%';draw()}
  });
  d.addEventListener('pointerup',()=>{if(g&&g.m){selN=id;update()}g=null});
  d.addEventListener('pointercancel',()=>g=null);
}
addEventListener('resize',draw);
/* ===== extensions: ODF, GPON/DBA, QoS, security, ROI, exam, PDF, i18n ===== */
const COL=[['أزرق','#2b6cff'],['برتقالي','#ff8a1f'],['أخضر','#22b55b'],['بني','#8b5a2b'],['رمادي','#8a96a8'],['أبيض','#f4f4f4'],['أحمر','#e03131'],['أسود','#222'],['أصفر','#f2d600'],['بنفسجي','#9b59d0'],['وردي','#ff7eb6'],['تركوازي','#19c3d6']];
const DARK=[0,3,6,7,9],EN={"محاكي الشبكات والألياف الضوئية (FTTH)": "FTTH Network & Fiber Simulator", "ميزانية القدرة، OTDR، تذاكر الأعطال، مؤشرات SLA، VLAN وطرفية أوامر.": "Power budget, OTDR, incident tickets, SLA KPIs, VLAN and CLI terminal.", "المظهر": "Theme", "تقرير PDF": "PDF report", "حفظ": "Save", "تحميل": "Load", "تصدير JSON": "Export JSON", "استيراد": "Import", "تنبيه:": "Notice:", "هذه محاكاة برمجية تعليمية فقط، وليست فحصاً لشبكة حقيقية. لا تُرسل حزم فعلية، والقيم (زمن الاستجابة، القدرة الضوئية، OTDR، التكاليف) افتراضية محسوبة نظرياً.": "This is an educational software simulation only, not a scan of a real network. No real packets are sent; all values (latency, optical power, OTDR, costs) are theoretical.", "مخطط الشبكة": "Network Diagram", "الحزم المرسلة": "Packets sent", "الحزم الناجحة": "Packets OK", "نسبة الفقد": "Loss rate", "متوسط الاستجابة": "Avg latency", "التوافر": "Availability", "التذاكر المفتوحة": "Open tickets", "الأمان": "Security", "ميزانية القدرة الضوئية للمسار المحدد": "Optical power budget (selected path)", "أثر OTDR للوصلة المحددة": "OTDR trace (selected link)", "زمن الاستجابة (آخر 40 حزمة)": "Latency (last 40 packets)", "مقارنة تكلفة تقديرية (ليف مقابل نحاس)": "Estimated cost: fiber vs copper", "لوحة ODF (كابل 12 ليفاً)": "ODF panel (12-fiber cable)", "جدوى الشبكة (CAPEX/OPEX/ROI)": "Network economics (CAPEX/OPEX/ROI)", "لوحة التحكم": "Control Panel", "إرسال الحزم": "Send packets", "المُرسل": "Source", "المستقبِل": "Target", "عدد الحزم (1–20)": "Packets (1–20)", "الوصلة والجهاز": "Link & device", "الوصلة المحددة": "Selected link", "الطول (km)": "Length (km)", "عدد اللحامات": "Splices", "لون الليف": "Fiber color", "عبر ODF/FDB": "Via ODF/FDB", "مباشر": "Direct", "حالة الوصلة": "Link state", "سليمة": "Healthy", "موصل متسخ": "Dirty connector", "انحناء": "Bend", "مقطوعة": "Cut", "قطع الوصلة": "Cut link", "إعادة الاتصال": "Restore", "فحص OTDR": "OTDR test", "قياس القدرة": "Power meter", "تعطيل": "Disable", "تفعيل": "Enable", "إضافة ONT": "Add ONT", "معايير الليف والسبليتر": "Fiber & splitter", "نوع الليف / الطول الموجي": "Fiber / wavelength", "نسبة السبليتر": "Splitter ratio", "GPON وDBA": "GPON & DBA", "عرض النطاق المتعاقد للجهاز المحدد (Mbps)": "Contracted bandwidth, selected device (Mbps)", "مفعّل": "Enabled", "معطّل": "Disabled", "الاشتراك الشهري ($)": "Monthly fee ($)", "OPEX لكل km ($/شهر)": "OPEX per km ($/month)", "المسافة": "Distance", "المتعاقد": "Contracted", "المخصص": "Allocated", "السعة الكلية": "Total capacity", "لا ازدحام": "No congestion", "ازدحام": "Congestion", "الأمان وQoS": "Security & QoS", "فئة الحركة": "Traffic class", "صوت (أولوية عالية)": "Voice (high priority)", "فيديو": "Video", "بيانات": "Data", "المصدر": "Source", "الوجهة": "Destination", "قاعدة حظر ACL": "ACL deny rule", "جدار ناري": "Firewall", "هجوم ONT مارق": "Rogue ONT attack", "سيناريو تدريبي واختبار": "Training & exam", "بدء السيناريو": "Start scenario", "اختبار كامل (5 أعطال)": "Full exam (5 faults)", "شهادة PDF": "PDF certificate", "اسم المتدرب": "Trainee name", "قطع": "Cut", "تأكيد التشخيص": "Confirm diagnosis", "الوقت المتبقي": "Time left", "تذاكر الأعطال": "Fault tickets", "الطرفية": "Terminal", "سجل الأحداث": "Event log", "مسح": "Clear", "إعادة ضبط": "Reset", "الراوتر": "Router", "السويتش": "Switch", "حاسوب": "PC", "سبليتر": "Splitter", "مفتوح": "Open", "قيد المعالجة": "In progress", "مغلق": "Closed", "نجاح": "Success", "فشل": "Failed", "تحذير": "Warning", "الحزمة": "Packet", "وصلت عبر": "Delivered via", "لم تصل": "Not delivered", "انقطاع": "Outage", "عطل/تنبيه في الشبكة": "fault(s)/alert(s)", "الشبكة تعمل بشكل طبيعي": "Network operating normally", "ضمن الهدف": "Within target", "خارج الهدف": "Below target", "المسار": "Path", "الليف": "Fiber", "الطول الكلي": "Total length", "التوهين الكلي": "Total attenuation", "قدرة الاستقبال": "Rx power", "هامش القدرة": "Power margin", "حالة المسار": "Path status", "سليم": "OK", "هامش ضعيف": "Weak margin", "منقطع": "Down", "اختر جهازين مختلفين": "Select two different devices", "محظور بقاعدة ACL": "blocked by ACL rule", "حظر الجدار الناري بين الشبكات الافتراضية": "firewall blocks inter-VLAN traffic", "ONT مارق يشوّش الإرسال العكسي": "rogue ONT jams upstream", "ليف ضوئي": "Fiber", "نحاس Cat6 بنفس الأطوال": "Copper Cat6, same lengths", "غير عملي": "impractical", "تكاليف الإنشاء CAPEX": "CAPEX", "الإيراد الشهري": "Monthly revenue", "OPEX شهرياً": "Monthly OPEX", "الصافي الشهري": "Monthly net", "فترة الاسترداد (شهر)": "Payback (months)", "العائد السنوي ROI": "Annual ROI", "استخدام السبليتر": "Splitter utilization", "النظام جاهز": "System ready", "إعداد وتطوير": "Developed by", "علي كامل ياسين": "Ali Kamil Yassin", "فني ألياف ضوئية (FTTH) سابقاً": "former FTTH fiber technician", "بكالوريوس إدارة تقنيات المعلومات": "B.Sc. in IT Management", "أزرق": "Blue", "برتقالي": "Orange", "أخضر": "Green", "بني": "Brown", "رمادي": "Slate", "أبيض": "White", "أحمر": "Red", "أسود": "Black", "أصفر": "Yellow", "بنفسجي": "Violet", "وردي": "Rose", "تركوازي": "Aqua"};
Object.assign(EN,{'التشخيص الميداني (قيم قياسية)':'Field diagnosis (standard values)','أحداث OTDR':'OTDR events','قيم مرجعية قياسية (ITU-T / TIA)':'Reference values (ITU-T / TIA)','نوع الحدث':'Event','الموقع':'Position','الفقد الزائد':'Excess loss','الفقد':'Loss','الانعكاس':'Reflectance','Rx المتوقع (سليم)':'Expected Rx (healthy)','Rx المقاس':'Measured Rx','نافذة Rx المسموحة':'Allowed Rx window','موصل البداية':'Start connector','موصل النهاية':'End connector','لحام':'Splice','تشبع المستقبل':'Receiver overload','المسار ضمن الحدود القياسية. لا إجراء مطلوب.':'Path within standard limits. No action required.','نظّف الطرف وافحصه بالمجهر ثم أعد القياس.':'Clean the end-face, inspect with a scope, then re-measure.'});const KEYS=Object.keys(EN).sort((a,b)=>b.length-a.length),TT=s=>KEYS.reduce((x,k)=>x.split(k).join(EN[k]),s);
let lang='ar';const X=s=>lang==='en'?TT(s):s;
COL.forEach((c,i)=>$('col').add(new Option(`${i+1} · ${c[0]}`,i+1)));
const colOf=k=>S.L[k].col||Object.keys(S.L).filter(x=>S.L[x].t==='fo').indexOf(k)%12+1;
function dist(id){const p=path('switch',id);let d=0;for(let i=0;i<p.length-1;i++){const l=S.L[linkKey(p[i],p[i+1])];if(l)d+=l.len}return d}
function alloc(){
  const on=Object.keys(S.v).filter(k=>S.on[k]),tot=on.reduce((a,k)=>a+(S.bw[k]||100),0),cap=1244,r={};
  on.forEach(k=>{const b=S.bw[k]||100;r[k]=S.dba?(tot>cap?b*cap/tot:b):Math.min(b,cap/on.length)});
  return{r,tot,cong:Math.max(0,tot/cap-1)};
}
function qos(a,b,e){
  const A=alloc(),c=$('qos').value,k={v:0,vi:1,d:3}[c],dp={v:0,vi:.1,d:.4}[c];let why='';
  if(S.acl.some(r=>r.s===a&&r.d===b))why='محظور بقاعدة ACL';
  else if(S.fw&&S.v[a]&&S.v[b]&&S.v[a]!==S.v[b])why='حظر الجدار الناري بين الشبكات الافتراضية';
  else if(S.atk&&((S.v[a]&&a!==S.atk)||(S.v[b]&&b!==S.atk))&&route(a,b).includes('spl'))why='ONT مارق يشوّش الإرسال العكسي';
  const ok=!why&&(e.s==='ok'||(e.s==='warn'&&Math.random()>.35))&&Math.random()>=A.cong*dp;
  return{ok,why,ms:+(e.base*(1+A.cong*k)+Math.random()*1.5).toFixed(2)};
}
function biz(){
  let capex=0,km=0;Object.values(S.L).forEach(l=>{if(l.t==='fo'){km+=l.len;capex+=l.len*400+l.sp*15+16+(l.odf?60:0)}});
  const subs=Object.keys(S.v).filter(k=>S.on[k]).length,rev=subs*S.biz.fee,opex=km*S.biz.opex,net=rev-opex;
  return{capex,rev,opex,net,pay:net>0?capex/net:Infinity,roi:capex?net*12/capex*100:0,util:subs/S.cfg.ratio*100};
}

/* ===== real-value field diagnosis (ITU-T G.652/G.984, TIA-568 typical values) ===== */
function diag(){
  const a=$('source').value,b=$('target').value;
  if(a===b){$('dg2').innerHTML='';$('dgm').textContent='اختر جهازين مختلفين';return}
  const p=route(a,b),m=ev(p),x=ev(p,1),ex=m.loss-x.loss,far=p.some(n=>S.v[n]&&dist(n)>20);let v,c='warnc';
  if(m.s==='down'){v='LOS: لا يصل ضوء (Rx < −40 dBm). حدّد موقع القطع بـ OTDR، ثم تأكد من تشغيل الأجهزة.';c='fail'}
  else if(!m.fo){v='مسار نحاسي: افحص الكبل والمنفذ (Cat6 ≤ 100 م).';c='ok'}
  else if(far){v='المسافة تتجاوز 20 km (حد GPON).';c='fail'}
  else if(ex>=2.5)v='موصل متسخ أو تالف: فقد زائد ≈ 3 dB وانعكاس ≈ −35 dB. نظّف الطرف وافحصه بالمجهر ثم أعد القياس.';
  else if(ex>=1)v='انحناء حاد (Macro-bend) ≈ 1.5 dB. افرد الليف (نصف قطر ≥ 30 مم) وأعد القياس.';
  else if(m.ov)v='تشبع المستقبل (Rx > −8 dBm). ركّب مخفّضاً (Attenuator) أو غيّر نسبة السبليتر.';
  else if(m.m<3)v='هامش ضعيف (Rx < −24 dBm). افحص الموصلات واللحامات والطول.';
  else{v='المسار ضمن الحدود القياسية. لا إجراء مطلوب.';c='ok'}
  const f=(n,u)=>m.fo?n.toFixed(2)+u:'—';
  $('dg2').innerHTML=`<tr><td>Tx (GPON B+: ‎+1.5…+5)</td><td>+3.00 dBm</td></tr><tr><td>Rx المتوقع (سليم)</td><td>${f(x.rx,' dBm')}</td></tr><tr><td>Rx المقاس</td><td>${m.s==='down'?'LOS':f(m.rx,' dBm')}</td></tr><tr><td>الفقد الزائد</td><td>${m.s==='down'?'—':f(ex,' dB')}</td></tr><tr><td>نافذة Rx المسموحة</td><td>−27 … −8 dBm</td></tr>`;
  $('dgm').className='li '+c;$('dgm').textContent=v;
}
function oev(){
  const l=S.L[selL];if(l.t!=='fo'){$('oev').innerHTML='';return}
  const R=[['موصل البداية',0,.5,'−50 dB']];
  for(let i=1;i<=l.sp;i++)R.push(['لحام',l.len*i/(l.sp+1),.1,'—']);
  if(l.odf)R.push(['ODF (موصلان)',.01,1,'−50 dB']);
  if(l.f==='dirty')R.push(['موصل متسخ',0,3,'−35 dB']);
  if(l.f==='bend')R.push(['انحناء',l.len*l.fp,1.5,'—']);
  if(l.f==='cut')R.push(['نهاية الأثر (انقطاع)',l.len*l.fp,'∞','−14 dB']);else R.push(['موصل النهاية',l.len,.5,'−50 dB']);
  R.sort((p,q)=>p[1]-q[1]);
  $('oev').innerHTML='<tr><td>نوع الحدث</td><td>الموقع</td><td>الفقد</td><td>الانعكاس</td></tr>'+R.map(r=>`<tr><td>${r[0]}</td><td>${r[1].toFixed(2)} km</td><td>${typeof r[2]==='number'?r[2].toFixed(1):r[2]} dB</td><td>${r[3]}</td></tr>`).join('');
}
function ext(){
  diag();oev();const l=S.L[selL],A=alloc(),B=biz();
  $('col').value=colOf(selL);$('odfs').value=l.odf?1:0;$('col').disabled=$('odfs').disabled=l.t==='cu';
  $('bw').value=S.bw[selN]||100;$('bw').disabled=!S.v[selN];$('dba').value=S.dba;$('fee').value=S.biz.fee;$('opx').value=S.biz.opex;
  $('fw').textContent='جدار ناري: '+(S.fw?'مفعّل':'معطّل');
  $('gp').innerHTML='<tr><td>ONT</td><td>المسافة</td><td>المتعاقد</td><td>المخصص</td></tr>'+Object.keys(S.v).map(k=>{const d=dist(k);
    return `<tr><td>${esc(S.N[k].e)}</td><td>${d.toFixed(2)} km ${d>20?'✘':'✔'}</td><td>${S.bw[k]||100} Mbps</td><td>${A.r[k]?A.r[k].toFixed(0)+' Mbps':'—'}</td></tr>`}).join('')
    +`<tr><td colspan="2">السعة الكلية 1244 Mbps</td><td colspan="2" style="direction:rtl">${A.cong>0?'ازدحام ⚠ '+(A.cong*100).toFixed(0)+'%':'لا ازدحام'}</td></tr>`;
  $('biz').innerHTML=`<tr><td>تكاليف الإنشاء CAPEX</td><td>$${B.capex.toFixed(0)}</td></tr><tr><td>الإيراد الشهري</td><td>$${B.rev.toFixed(0)}</td></tr><tr><td>OPEX شهرياً</td><td>$${B.opex.toFixed(0)}</td></tr><tr><td>الصافي الشهري</td><td>$${B.net.toFixed(0)}</td></tr><tr><td>فترة الاسترداد (شهر)</td><td>${isFinite(B.pay)?B.pay.toFixed(1):'∞'}</td></tr><tr><td>العائد السنوي ROI</td><td>${B.roi.toFixed(1)}%</td></tr><tr><td>استخدام السبليتر</td><td>${B.util.toFixed(0)}%</td></tr>`;
  $('odf').replaceChildren();
  COL.forEach((c,i)=>{const names=Object.keys(S.L).filter(k=>S.L[k].t==='fo'&&colOf(k)===i+1),d=document.createElement('div');
    d.style.cssText=`background:${c[1]};color:${DARK.includes(i)?'#fff':'#000'};border-color:${names.length>1?'var(--red)':'var(--line)'}`;
    d.textContent=`${i+1}`+(names.length?' · '+names.map(k=>S.N[S.L[k].b].e).join('، ')+(names.length>1?' ⚠':''):'');$('odf').append(d)});
  $('acl').replaceChildren();
  S.acl.forEach((r,i)=>{const d=document.createElement('div');d.className='li';d.style.cursor='pointer';d.textContent=`✕ ACL ${i+1}: deny ${r.s} → ${r.d}`;d.onclick=()=>{S.acl.splice(i,1);update()};$('acl').append(d)});
  const v=S.h.filter(x=>x!=null),j=v.length>1?v.slice(1).reduce((a,x,i)=>a+Math.abs(x-v[i]),0)/(v.length-1):null,src=$('source').value;
  $('jit').textContent=j==null?'—':j.toFixed(2)+' ms';
  $('thr').textContent=A.r[src]?(A.r[src]*(S.st.sent?S.st.succ/S.st.sent:1)).toFixed(0)+' Mbps':'—';
  $('sec').textContent=S.atk?'⚠ هجوم':S.fw?'جدار ✔':S.acl.length?S.acl.length+' ACL':'—';
}
$('col').onchange=e=>{S.L[selL].col=+e.target.value;update()};
$('odfs').onchange=e=>{S.L[selL].odf=+e.target.value;update()};
$('bw').onchange=e=>{if(S.v[selN]){S.bw[selN]=Math.max(10,Math.min(1000,+e.target.value||100));update()}};
$('dba').onchange=e=>{S.dba=+e.target.value;update()};
$('fee').onchange=e=>{S.biz.fee=Math.max(1,+e.target.value||25);update()};
$('opx').onchange=e=>{S.biz.opex=Math.max(0,+e.target.value||0);update()};
$('aa').onclick=()=>{const s=$('as').value,d=$('ad').value;if(s===d||S.acl.some(r=>r.s===s&&r.d===d))return log('ACL','قاعدة غير صالحة أو مكررة.',false);S.acl.push({s,d});log('ACL',`حظر ${s} → ${d}`,true);update()};
$('fw').onclick=()=>{S.fw=S.fw?0:1;log('جدار ناري',S.fw?'تم حظر الحركة بين الشبكات الافتراضية.':'تم إيقاف الجدار.',true);update()};
$('atk').onclick=()=>{
  if(S.atk){tkClose('ATK');log('إيقاف الهجوم',`عاد ${S.N[S.atk].n} للعمل الطبيعي.`,true,0);S.atk=null}
  else if(S.v[selN]){S.atk=selN;tkOpen('ATK',`ONT مارق: ${S.N[selN].n} يشوّش الإرسال العكسي`);log('هجوم ONT مارق',`${S.N[selN].n} يرسل باستمرار ويعطّل بقية الأجهزة.`,false,1)}
  else log('الهجوم','حدّد ONT (حاسوب) أولاً.',false);
  update();
};
/* exam */
function trEnd(sc){
  if(!S.ex)return;S.ex.s.push(sc);
  if(S.ex.s.length<5){log('الاختبار',`العطل ${S.ex.s.length}/5 انتهى. التالي بعد لحظات.`,true);setTimeout(trs,800)}
  else{const a=Math.round(S.ex.s.reduce((x,y)=>x+y,0)/5);log('انتهى الاختبار',`المعدل ${a}/100 · ${a>=60?'ناجح':'غير ناجح'}. اضغط شهادة PDF.`,a>=60)}
}
$('cert').onclick=()=>{if(!S.ex||S.ex.s.length<5)return log('الشهادة','أكمل الاختبار الكامل (5 أعطال) أولاً.',false);dl(pdf([cert()]),'certificate.pdf')};
/* PDF (canvas pages embedded as JPEG, no libraries) */
function page(draw){
  const c=document.createElement('canvas');c.width=794;c.height=1123;const g=c.getContext('2d');
  g.fillStyle='#fff';g.fillRect(0,0,794,1123);g.fillStyle='#14213a';g.direction=lang==='en'?'ltr':'rtl';g.textAlign=lang==='en'?'left':'right';draw(g,lang==='en'?40:754);return c;
}
function report(){return page((g,x)=>{
  let y=60;const L=(s,f=15,c='#14213a')=>{if(y>1085)return;g.font=`${f}px Tahoma,Arial`;g.fillStyle=c;g.fillText(X(s),x,y);y+=f+11},B=biz();
  L('تقرير أداء الشبكة (محاكاة تعليمية)',24,'#0a8f84');L(new Date().toLocaleString('en-GB'),13,'#52647f');y+=8;
  L('المؤشرات',18);[['الحزم المرسلة','sent'],['الحزم الناجحة','succ'],['نسبة الفقد','loss'],['متوسط الاستجابة','lat'],['التوافر','av'],['SLA','sla'],['MTTR','mttr'],['MTBF','mtbf'],['Jitter','jit'],['Throughput','thr']].forEach(([a,b])=>L(`${a}: ${$(b).textContent}`));
  y+=8;L('الجدوى الاقتصادية',18);L(`CAPEX: $${B.capex.toFixed(0)} · الإيراد الشهري: $${B.rev.toFixed(0)} · OPEX: $${B.opex.toFixed(0)}`);L(`الاسترداد: ${isFinite(B.pay)?B.pay.toFixed(1):'∞'} شهر · ROI: ${B.roi.toFixed(1)}%`);
  y+=8;L('الوصلات',18);Object.keys(S.L).forEach(k=>{const l=S.L[k];L(`${lname(k)} · ${l.t==='fo'?l.len+' km · '+COL[colOf(k)-1][0]:'Cu'} · ${l.f}`,14)});
  y+=8;L('التذاكر',18);S.T.slice(-12).forEach(t=>L(`#${t.id} ${ST[t.s]} — ${t.d}`,13));
})}
function cert(){
  const nm=$('nm').value.trim()||'—',a=Math.round(S.ex.s.reduce((x,y)=>x+y,0)/5);
  return page(g=>{g.textAlign='center';g.direction='rtl';g.strokeStyle='#0a8f84';g.lineWidth=8;g.strokeRect(30,30,734,1063);
    const L=(s,y,f,c='#14213a')=>{g.font=`bold ${f}px Tahoma,Arial`;g.fillStyle=c;g.fillText(X(s),397,y)};
    L('شهادة إنجاز',220,46,'#0a8f84');L('تشهد هذه الشهادة بأن',340,22);L(nm,420,36);L('أتمّ اختبار تشخيص أعطال شبكات الألياف الضوئية FTTH',500,20);
    L(`المعدل: ${a}/100 · ${a>=60?'ناجح':'غير ناجح'}`,580,28,a>=60?'#0f9d5a':'#d6314a');L('درجات الأعطال: '+S.ex.s.join(' · '),640,18);
    L(new Date().toLocaleDateString('en-GB'),760,18);L('محاكي الشبكات والألياف الضوئية (FTTH) · محاكاة تعليمية',1040,14,'#52647f')});
}
function pdf(cs){
  const enc=new TextEncoder(),parts=[],off=[],n=cs.length;let len=0;
  const put=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length},obj=(i,x)=>{off[i]=len;put(`${i} 0 obj\n${x}\nendobj\n`)};
  put('%PDF-1.4\n');obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,`<</Type/Pages/Count ${n}/Kids[${cs.map((_,i)=>`${3+i*3} 0 R`).join(' ')}]>>`);
  cs.forEach((c,i)=>{const p=3+i*3,jpg=Uint8Array.from(atob(c.toDataURL('image/jpeg',.92).split(',')[1]),ch=>ch.charCodeAt(0)),cn='q 595 0 0 842 0 0 cm /Im Do Q';
    obj(p,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</XObject<</Im ${p+2} 0 R>>>>/Contents ${p+1} 0 R>>`);
    obj(p+1,`<</Length ${cn.length}>>\nstream\n${cn}\nendstream`);
    off[p+2]=len;put(`${p+2} 0 obj\n<</Type/XObject/Subtype/Image/Width ${c.width}/Height ${c.height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpg.length}>>\nstream\n`);put(jpg);put('\nendstream\nendobj\n')});
  const tot=3+n*3,xr=len;put(`xref\n0 ${tot}\n0000000000 65535 f \n`);for(let i=1;i<tot;i++)put(String(off[i]).padStart(10,'0')+' 00000 n \n');
  put(`trailer\n<</Size ${tot}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`);return new Blob(parts,{type:'application/pdf'});
}
function dl(b,name){const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
/* i18n */
function tr(){
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){if(n.parentNode.closest('script,#tout'))continue;if(n.__a===undefined||n.data!==n.__e)n.__a=n.data;const v=lang==='en'?TT(n.__a):n.__a;if(n.data!==v)n.data=v;n.__e=v}
}
new MutationObserver(tr).observe(document.body,{subtree:true,childList:true,characterData:true});
$('lg').onclick=()=>{lang=lang==='ar'?'en':'ar';document.documentElement.lang=lang;document.documentElement.dir=lang==='en'?'ltr':'rtl';$('lg').textContent=lang==='en'?'🌐 AR':'🌐 EN';tr()};
build();log('النظام جاهز','أرسل حزماً، أضف عطلاً، جرّب OTDR، أو ابدأ سيناريو تدريبياً.',true);update();
})();
