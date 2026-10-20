(()=>{
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg',KEY='netsim-v2';
const css=p=>getComputedStyle(document.documentElement).getPropertyValue(p).trim();
const esc=s=>String(s).replace(/[&<>"]/g,c=>'&#'+c.charCodeAt(0)+';');
const{FIB,SPL}=Engine;
const FT={cut:'قطع',dirty:'موصل متسخ',bend:'انحناء'},ST={open:'مفتوح',work:'قيد المعالجة',closed:'مغلق'};
const base=()=>{
  const m=(n,e,i,k,x,y,ip)=>({n,e,i,k,x,y,...(ip?{ip}:{})});
  const N={router:m('الراوتر','Router','📡','router',30,7),sw2:m('سويتش 2 (احتياطي)','Switch-2 · STP','🔁','sw2',70,7,'192.168.1.3'),
    switch:m('السويتش / OLT','Switch · OLT','🔀','olt',50,24),
    fat1:m('الفاتة 1','FAT-1','📦','fat',50,40),spl1:m('سبلتر 1','Splitter 1:4','🔱','spl',30,54),spl2:m('سبلتر 2','Splitter 1:4','🔱','spl',70,54),
    onu1:m('ONU 1','ONU-01','📟','onu',20,68,'10.20.0.1'),onu2:m('ONU 2','ONU-02','📟','onu',40,68,'10.20.0.2'),onu3:m('ONU 3','ONU-03','📟','onu',70,68,'10.20.0.3'),
    hr1:m('راوتر منزلي 1','Home router 1','📶','hr',20,81,'192.168.100.1'),hr2:m('راوتر منزلي 2','Home router 2','📶','hr',40,81,'192.168.100.2'),hr3:m('راوتر منزلي 3','Home router 3','📶','hr',70,81,'192.168.100.3'),
    pc1:m('حاسوب 1','PC-01','💻','pc',12,93),pc2:m('حاسوب 2','PC-02','💻','pc',28,93),pc3:m('حاسوب 3','PC-03','💻','pc',40,93),pc4:m('حاسوب 4','PC-04','💻','pc',70,93),
    dhcp:m('خادم DHCP','DHCP Server','📋','srv',9,22,'192.168.1.10'),dns:m('خادم DNS','DNS Server','📖','srv',9,38,'192.168.1.11'),web:m('خادم الويب','Web Server','🌐','srv',91,22,'192.168.1.12'),mail:m('خادم البريد','Mail Server','✉️','srv',91,38,'192.168.1.13')};
  const on={};Object.keys(N).forEach(k=>on[k]=true);
  const lk=(a,b,t,len,sp,odf)=>({a,b,t,len,sp,f:'ok',fp:.5,...(odf?{odf:1}:{}),tc:+((Math.random()-.5)*.2).toFixed(3),ts:+((Math.random()-.5)*.06).toFixed(3)});
  const L={};
  [['router','switch','cu',.01,0],['router','sw2','cu',.01,0],['switch','sw2','cu',.01,0],['switch','fat1','fo',16,6,1],['fat1','spl1','fo',.005,0],['fat1','spl2','fo',.005,0],
   ['spl1','onu1','fo',.3,0],['spl1','onu2','fo',.3,0],['spl2','onu3','fo',.3,0],['onu1','hr1','cu',.01,0],['onu2','hr2','cu',.01,0],['onu3','hr3','cu',.01,0],
   ['hr1','pc1','cu',.01,0],['hr1','pc2','cu',.01,0],['hr2','pc3','cu',.01,0],['hr3','pc4','cu',.01,0],
   ['switch','dhcp','cu',.01,0],['switch','dns','cu',.01,0],['switch','web','cu',.01,0],['switch','mail','cu',.01,0]].forEach(x=>{L[x[0]+'-'+x[1]]=lk(...x)});
  autoLayout({N,L});
  return{N,on,L,v:{pc1:10,pc2:10,pc3:10,pc4:20},T:[],st:{sent:0,succ:0,latS:0,latN:0},h:[],acl:[],nat:1,fw:0,atk:null,ex:null,dba:1,bw:{onu1:100,onu2:100,onu3:100},biz:{fee:25,opex:40},cfg:{fib:'GPON',ratio:4,tx:1.5,sens:-27,ovl:-8,wdm:0},t0:Date.now(),tr:null};
};
/* ===== hierarchy: OLT -> FAT -> splitter -> ONU -> home router -> PC ===== */
const PLV={olt:2,fat:3,spl:4,onu:5,hr:6,pc:7};
function kd(id,N){N=N||S.N;const n=N[id];if(n&&n.k)return n.k;return/^spl/.test(id)?'spl':/^fat/.test(id)?'fat':/^onu/.test(id)?'onu':/^hr/.test(id)?'hr':/^pc/.test(id)?'pc':id}
function autoLayout(o){
  const N=o.N,K=id=>kd(id,N),Y={fat:40,spl:54,onu:68,hr:81,pc:93},ch={},pos={};let nx=0;
  Object.values(o.L).forEach(l=>{const a=PLV[K(l.a)],b=PLV[K(l.b)];if(a&&b&&a!==b){const[p,c]=a<b?[l.a,l.b]:[l.b,l.a];(ch[p]=ch[p]||[]).push(c)}});
  const dfs=id=>{const c=ch[id]||[];if(!c.length)return pos[id]=nx++;const xs=c.map(dfs);return pos[id]=(Math.min(...xs)+Math.max(...xs))/2};
  (ch.switch||[]).forEach(dfs);const T=Math.max(1,nx-1);
  Object.keys(pos).forEach(id=>{N[id].x=nx<2?50:+(12+pos[id]/T*76).toFixed(1);N[id].y=Y[K(id)]});
}
let S=base(),selN='pc1',selL='switch-fat1',busy=false;
const isSpl=id=>kd(id)==='spl',pas=id=>{const k=kd(id);return k==='spl'||k==='fat'},onus=()=>Object.keys(S.N).filter(k=>kd(k)==='onu');
const kids=id=>Object.values(S.L).map(l=>l.a===id?l.b:l.b===id?l.a:null).filter(x=>x&&PLV[kd(x)]>PLV[kd(id)]);
const onuOf=id=>path('switch',id).find(n=>kd(n)==='onu')||onus()[0],splOf=ont=>path('switch',ont).find(isSpl)||'switch';
const maxOnus=()=>Math.max(0,...Object.keys(S.N).filter(isSpl).map(sp=>kids(sp).filter(x=>kd(x)==='onu').length));
const canvas=$('canvas'),svg=$('links'),el={};
const att=()=>FIB[S.cfg.fib][1],lname=k=>S.N[S.L[k].a].n+' ↔ '+S.N[S.L[k].b].n;
const vis=k=>S.tr&&S.tr.k===k?'ok':S.L[k].f;
const linkKey=(x,y)=>Object.keys(S.L).find(k=>(S.L[k].a===x&&S.L[k].b===y)||(S.L[k].a===y&&S.L[k].b===x));
const ip=k=>k==='router'?'192.168.1.1':k==='switch'?'192.168.1.2':S.N[k]&&S.N[k].ip?S.N[k].ip:S.v[k]?`192.168.${S.v[k]}.${10+parseInt(k.slice(2))}`:null;
Object.entries(FIB).filter(([k])=>!['XGU','XGD'].includes(k)).forEach(([k,v])=>$('fib').add(new Option(v[0],k)));
function stp(){
  const bl=new Set();if(!S.on.router)return bl;
  const act=k=>{const l=S.L[k];return l.f!=='cut'&&S.on[l.a]&&S.on[l.b]},seen={router:1},tree=new Set(),q=['router'];
  while(q.length){const c=q.shift();Object.keys(S.L).forEach(k=>{const l=S.L[k],n=l.a===c?l.b:l.b===c?l.a:null;if(n&&act(k)&&!seen[n]){seen[n]=1;tree.add(k);q.push(n)}})}
  Object.keys(S.L).forEach(k=>{const l=S.L[k];if(act(k)&&seen[l.a]&&seen[l.b]&&!tree.has(k))bl.add(k)});
  return bl;
}
function path(a,b){
  const bl=stp();
  for(const strict of[1,0]){
    const q=[[a]],seen={[a]:1};
    while(q.length){const p=q.shift(),c=p[p.length-1];if(c===b)return p;
      Object.keys(S.L).forEach(k=>{const l=S.L[k],n=l.a===c?l.b:l.b===c?l.a:null;
        if(n&&!seen[n]&&!(strict&&(bl.has(k)||l.f==='cut'||(!S.on[n]&&n!==b)))){seen[n]=1;q.push([...p,n])}})}
  }
  return[a,b];
}
const hub=(a,b,h)=>[...path(a,h),...path(h,b).slice(1)];
function route(a,b){
  if(S.v[a]&&S.v[b]){if(S.v[a]!==S.v[b])return hub(a,b,'router');return onuOf(a)===onuOf(b)?path(a,b):hub(a,b,'switch')}
  return path(a,b);
}
function ev1(p,nf,fk){
  const{tx,sens,ovl}=S.cfg;let loss=0,seg=0,sf=0,len=0,fo=0,down=p.some(n=>!S.on[n]);
  /* optical segments end at active devices (OLT/ONT/switch): power is regenerated there, so the worst segment decides */
  for(let i=0;i<p.length-1;i++){
    const l=S.L[linkKey(p[i],p[i+1])];if(!l){down=1;continue}
    if(l.f==='cut'&&!nf)down=1;len+=l.len;
    if(l.t==='fo'){fo=1;sf=1;seg+=Engine.linkLoss(l,FIB[fk][1],nf)}
    const nx=p[i+1],end=i+1===p.length-1;
    if(isSpl(nx)&&!end)seg+=SPL[S.cfg.ratio];
    if(!pas(nx)||end){if(sf)loss=Math.max(loss,seg+(S.cfg.wdm?1.5:0));seg=0;sf=0}
  }
  const rx=tx-loss,m=fo?rx-sens:null,ov=!!(fo&&rx>ovl),far=p.some(n=>kd(n)==='onu'&&dist(n)>20);
  return{s:Engine.state({down,fo,far,m,ov}),loss,len,fo,rx,ov,m,base:(p.length-1)*.4+len*.02};
}
function ev(p,nf){
  const D=Engine.DIR[S.cfg.fib];if(!D)return ev1(p,nf,S.cfg.fib);
  const u=ev1(p,nf,D.u),d=ev1(p,nf,D.d),w=(u.m!=null&&d.m!=null&&d.m<u.m)?d:u;
  return{...w,s:['down','fail','warn','ok'].find(x=>u.s===x||d.s===x),up:u,dn:d};
}
function center(id){const c=canvas.getBoundingClientRect(),r=el[id].getBoundingClientRect();return{x:r.left-c.left+r.width/2,y:r.top-c.top+r.height/2}}
function build(){
  canvas.querySelectorAll('.node').forEach(n=>n.remove());Object.keys(el).forEach(k=>delete el[k]);
  Object.entries(S.N).forEach(([id,n])=>{
    const d=document.createElement('div'),i=document.createElement('span'),s=document.createElement('strong');
    d.className='node';d.tabIndex=0;d.setAttribute('role','button');d.setAttribute('aria-label',n.n);i.className='i';i.textContent=n.i;s.textContent=n.n;d.append(i,s,document.createElement('small'));
    d.style.left=n.x+'%';d.style.top=n.y+'%';canvas.append(d);el[id]=d;bind(d,id);
  });
  fill();
}
function fill(){
  const sv=[$('source').value,$('target').value];
  ['source','target'].forEach((s,j)=>{$(s).replaceChildren();Object.keys(S.N).filter(k=>!pas(k)).forEach(k=>$(s).add(new Option(S.N[k].n,k)));
    $(s).value=S.N[sv[j]]&&!pas(sv[j])?sv[j]:(j?'router':'pc1')});
  $('linkSel').replaceChildren();Object.keys(S.L).forEach(k=>$('linkSel').add(new Option(lname(k),k)));
  $('fib').value=S.cfg.fib;$('rat').value=S.cfg.ratio;['as','ad'].forEach(s=>{$(s).replaceChildren();Object.keys(S.N).filter(k=>!pas(k)).forEach(k=>$(s).add(new Option(S.N[k].n,k)))});
}
function draw(){
  svg.setAttribute('viewBox',`0 0 ${canvas.clientWidth} ${canvas.clientHeight}`);svg.replaceChildren();const BL=stp();
  Object.entries(S.L).forEach(([k,l])=>{
    const a=center(l.a),b=center(l.b),f=vis(k),dn=f==='cut'||!S.on[l.a]||!S.on[l.b];
    const ln=document.createElementNS(NS,'line');
    ln.setAttribute('x1',a.x);ln.setAttribute('y1',a.y);ln.setAttribute('x2',b.x);ln.setAttribute('y2',b.y);
    ln.setAttribute('class','link '+(dn?'down':BL.has(k)?'blk':f!=='ok'?'warn':l.t==='cu'?'cu':'ok'));
    ln.setAttribute('stroke-width',k===selL?6:3);ln.addEventListener('click',()=>{selL=k;update()});svg.append(ln);
    const t=document.createElementNS(NS,'text');t.setAttribute('x',(a.x+b.x)/2+8);t.setAttribute('y',(a.y+b.y)/2-5);t.setAttribute('class','lt');
    t.textContent=(l.t==='fo'?`FO ${l.len} km · ${COL[colOf(k)-1][0]}${l.odf?' · ODF':''}`:'Cu Cat6')+(dn?' · DOWN':BL.has(k)?' · STP BLK':f==='dirty'?' · موصل متسخ':f==='bend'?' · انحناء':'');svg.append(t);
  });
}
function budget(){
  const a=$('source').value,b=$('target').value;
  if(a===b){$('bud').innerHTML='<tr><td>اختر جهازين مختلفين</td><td>—</td></tr>';return}
  const p=route(a,b),e=ev(p),f=v=>e.fo?v:'—';
  $('bud').innerHTML=`<tr><td>المسار</td><td style="direction:rtl">${esc(p.map(n=>(S.N[n]||{n}).n).join(' ← '))}</td></tr>
  <tr><td>الليف</td><td>${FIB[S.cfg.fib][0]}</td></tr><tr><td>الطول الكلي</td><td>${e.len.toFixed(2)} km</td></tr>
  <tr><td>التوهين الكلي</td><td>${f(e.loss.toFixed(2)+' dB')}</td></tr><tr><td>قدرة الاستقبال Rx</td><td>${f(e.rx.toFixed(2)+' dBm')}</td></tr>
  ${e.up?`<tr><td>Rx هابط (${FIB[Engine.DIR[S.cfg.fib].d][0]})</td><td>${e.dn.rx.toFixed(2)} dBm</td></tr><tr><td>Rx صاعد (${FIB[Engine.DIR[S.cfg.fib].u][0]})</td><td>${e.up.rx.toFixed(2)} dBm</td></tr>`:''}<tr><td>هامش القدرة</td><td>${f(e.fo&&e.m.toFixed(2)+' dB')}</td></tr>
  <tr><td>BER المقدّر</td><td>${e.fo&&e.m!=null?Engine.fmtBer(Engine.ber(e.m)):'—'}</td></tr><tr><td>حالة المسار</td><td style="direction:rtl">${{ok:'سليم ✔',warn:e.ov?'تشبع المستقبل (Rx > −8 dBm) ⚠':'هامش ضعيف ⚠',fail:'فشل: Rx أقل من الحساسية ✘',down:'منقطع ✘'}[e.s]}</td></tr>`;
}
function otdr(){
  const l=S.L[selL],c=$('ot'),g=c.getContext('2d'),w=c.width,h=c.height;
  g.clearRect(0,0,w,h);g.font='11px Tahoma';g.fillStyle=css('--muted');
  if(l.t!=='fo'){g.fillText(lang==='en'?'OTDR applies to fiber links only':'OTDR للألياف الضوئية فقط',12,22);return}
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
function update(){hist();
  Object.keys(S.N).forEach(k=>{if(isSpl(k))S.N[k].e='Splitter 1:'+S.cfg.ratio});
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
  if(r<=0){const k=S.tr.k,f=S.tr.f;addScore(S.tr.n||'—',0,120);S.tr=null;log('انتهى الوقت',`الدرجة 0/100. العطل كان: ${lname(k)} (${FT[f]}).`,false);setFault(k,'ok');update();trEnd(0)}
}
const trs=()=>{
  const ks=Object.keys(S.L).filter(k=>S.L[k].t==='fo'&&S.L[k].f==='ok'&&S.L[k].len>=.05);
  if(S.tr||!ks.length){log('سيناريو تدريبي','أصلح الأعطال الحالية أولاً أو أنهِ السيناريو الجاري.',false);return}
  const k=ks[Math.floor(Math.random()*ks.length)],f=['cut','dirty','bend'][Math.floor(Math.random()*3)];
  setFault(k,f,1);S.tr={k,f,t:Date.now(),w:0,n:'سيناريو عشوائي'};log('سيناريو تدريبي','ظهر عطل مجهول. استخدم الإرسال وقياس القدرة وOTDR ثم شخّصه.',true,1);update();
};
$('trs').onclick=()=>{S.ex=null;trs()};
$('exs').onclick=()=>{if(S.tr)return;S.ex={s:[]};trs()};
$('trd').onclick=()=>{
  const t=S.tr;if(!t)return;
  if(selL===t.k&&$('dg').value===t.f){
    const sec=Math.floor((Date.now()-t.t)/1000),sc=Math.max(0,Math.round(100-sec*.5-t.w*15));
    S.tr=null;setFault(t.k,'ok');log('تشخيص صحيح',`الدرجة ${sc}/100 · الزمن ${sec} ث · محاولات خاطئة ${t.w}`,true);addScore(t.n||'—',sc,sec);setTimeout(()=>trEnd(sc),0);
  }else{t.w++;log('تشخيص خاطئ','راجع قياسات القدرة وأثر OTDR.',false)}
  update();
};
setInterval(trTick,1000);
/* terminal */
const tout=$('tout'),tp=s=>{const d=document.createElement('div');d.textContent=s;tout.append(d);tout.scrollTop=tout.scrollHeight};
const who=s=>{s=(s||'').toLowerCase();return S.N[s]&&!pas(s)?s:Object.keys(S.N).find(k=>ip(k)===s)};
function cmd(line){
  const[c,a,b]=line.trim().split(/\s+/),src=$('source').value;tp(`${src}> ${line}`);
  if(c==='help')tp('ping <host> | trace <host> | ip | vlan <pcN> <id> | nslookup <name> | dhcp | curl <host> | clear');
  else if(c==='clear')tout.replaceChildren();
  else if(c==='ip')Object.keys(S.N).filter(k=>!pas(k)).forEach(k=>tp(`${S.N[k].e.padEnd(14)} ${ip(k)}${S.v[k]?'  VLAN '+S.v[k]:''}`));
  else if(c==='vlan'){const k=who(a),id=+b;if(!S.v[k]||!(id>0&&id<4095))tp('usage: vlan <pcN> <1-4094>');else{S.v[k]=id;tp(`${k} -> VLAN ${id} (${ip(k)})`);update()}}
  else if(c==='nslookup'){
    const H={'web.local':'web','dns.local':'dns','dhcp.local':'dhcp','mail.local':'mail'};if(!a)return tp('usage: nslookup <name>');
    if(!reach(src,'dns'))return tp(';; connection timed out; no servers could be reached');
    const t=H[a.toLowerCase()];tp(t?`Server: ${ip('dns')}\nName: ${a}\nAddress: ${ip(t)}`:`** server can't find ${a}: NXDOMAIN`);
  }else if(c==='dhcp'){
    if(!S.v[src])return tp('run from an ONT/PC');
    if(!reach(src,'dhcp'))return tp('DHCPDISCOVER ... no DHCPOFFER (timeout)');
    tp(`DHCPDISCOVER > DHCPOFFER ${ip(src)} > DHCPREQUEST > DHCPACK\nlease 24h · gw 192.168.1.1 · dns ${ip('dns')}`);
  }else if(c==='curl'){
    if(!a)return tp('usage: curl <host|ip>');
    if(/[a-z]/i.test(a)&&!reach(src,'dns'))return tp(`curl: (6) Could not resolve host: ${a}`);
    if(!reach(src,'web'))return tp('curl: (28) Connection timed out');
    tp(`HTTP/1.1 200 OK · ${ip('web')} · ${(ev(route(src,'web')).base*2+Math.random()).toFixed(1)} ms`);
  }else if(c==='ping'||c==='trace'){
    if(/^(internet|8\.8\.8\.8)$/i.test(a||'')){const ok=reach(src,'router')&&S.nat;return tp(ok?`reply from 8.8.8.8 (NAT ${ip(src)} > 203.0.113.5): time=${(14+Math.random()*6).toFixed(1)}ms`:S.nat?'request timed out':'request timed out (private address not routable: enable NAT)')}
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
$('send').onclick=send;$('source').onchange=$('target').onchange=$('svc').onchange=update;
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
  const ou=onuOf(selN);if(!ou){log('قياس القدرة','لا يوجد ONU.',false);return}
  const r=pmRead(ou),j=()=>(Math.random()-.5)*.2,fx=r.f.s==='down'?'LOS':(r.f.rx+j()).toFixed(1),ox=r.o.s==='down'?'LOS':(r.o.rx+j()).toFixed(1);
  log('Power Meter',`${bi('مدخل السبليتر','Splitter input')}: ${fx} dBm (${bi('طبيعي','normal')} −11…−4) · ONU ${S.N[ou].e}: ${ox} dBm (${bi('طبيعي','normal')} −24…−12)`,r.code==='ok',r.code!=='ok'&&!r.code.startsWith('los'));
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
  if(maxOnus()>+e.target.value){e.target.value=S.cfg.ratio;log('السبليتر','عدد ONT أكبر من منافذ النسبة المختارة.',false);return}
  S.cfg.ratio=+e.target.value;fill();update();
};
$('clear').onclick=()=>$('log').replaceChildren();
$('reset').onclick=()=>{S=base();selN='pc1';selL='switch-fat1';build();$('log').replaceChildren();log('إعادة ضبط','عادت الشبكة والإحصاءات إلى الحالة الافتراضية.',true);update()};
/* persistence */
const snap=()=>JSON.stringify({...S,tr:null,ver:Engine.VERSION});
function load(o){
  o=Engine.migrate(o);const er=Engine.validate(o);if(er.length)throw new Error(er[0]);
  S=Object.assign(base(),o,{tr:null});
  Object.values(S.L).forEach(l=>{l.len=+l.len||.01;l.sp=+l.sp||0;l.fp=+l.fp||.5});
  S.cfg.wdm=+S.cfg.wdm?1:0;S.nat=+S.nat?1:0;S.dba=+S.dba?1:0;S.fw=+S.fw?1:0;S.biz.fee=+S.biz.fee||25;S.biz.opex=+S.biz.opex||0;selL=Object.keys(S.L)[1]||Object.keys(S.L)[0];selN=Object.keys(S.v)[0]||'router';build();log('تحميل','تم تحميل الطوبولوجيا.',true);update();
}
$('save').onclick=()=>{try{localStorage.setItem(KEY,snap());log('حفظ','حُفظت الطوبولوجيا في المتصفح.',true)}catch(e){log('حفظ','تعذّر الحفظ: '+e.message,false)}};
$('load').onclick=()=>{try{const j=localStorage.getItem(KEY);j?load(JSON.parse(j)):log('تحميل','لا توجد نسخة محفوظة.',false)}catch(e){log('تحميل','تعذّر التحميل: '+e.message,false)}};
$('exp').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([snap()],{type:'application/json'}));a.download='network-topology.json';a.click();URL.revokeObjectURL(a.href)};
$('imp').onchange=e=>{const f=e.target.files[0];if(f)f.text().then(t=>load(JSON.parse(t))).catch(e=>log('استيراد','ملف غير صالح: '+e.message,false));e.target.value=''};
/* theme + print */
$('th').onclick=()=>{const d=document.documentElement,c=d.dataset.theme||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');d.dataset.theme=c==='light'?'dark':'light';update()};
$('prt').onclick=()=>dl(pdf([report()]),'network-report.pdf');
let pt;addEventListener('beforeprint',()=>{pt=document.documentElement.dataset.theme;document.documentElement.dataset.theme='light';update()});
addEventListener('afterprint',()=>{pt?document.documentElement.dataset.theme=pt:delete document.documentElement.dataset.theme;update()});
/* drag */
function bind(d,id){
  let g=null;
  d.addEventListener('click',()=>{selN=id;update()});
  d.addEventListener('keydown',e=>{const m={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];
    if(e.key==='Enter'||e.key===' '){e.preventDefault();selN=id;update()}
    else if(m){e.preventDefault();const n=S.N[id];n.x=Math.max(9,Math.min(91,n.x+m[0]));n.y=Math.max(11,Math.min(89,n.y+m[1]));d.style.left=n.x+'%';d.style.top=n.y+'%';selN=id;update()}});
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
const DARK=[0,3,6,7,9],{EN,TT}=I18N;
let lang='ar';const X=s=>lang==='en'?TT(s):s;
COL.forEach((c,i)=>$('col').add(new Option(`${i+1} · ${c[0]}`,i+1)));
const colOf=k=>S.L[k].col||Object.keys(S.L).filter(x=>S.L[x].t==='fo').indexOf(k)%12+1;
function dist(id){const p=path('switch',id);let d=0;for(let i=0;i<p.length-1;i++){const l=S.L[linkKey(p[i],p[i+1])];if(l)d+=l.len}return d}
function alloc(){
  const on=onus().filter(k=>S.on[k]),tot=on.reduce((a,k)=>a+(S.bw[k]||100),0),cap=1244,r={};
  on.forEach(k=>{const b=S.bw[k]||100;r[k]=S.dba?(tot>cap?b*cap/tot:b):Math.min(b,cap/on.length)});
  return{r,tot,cong:Math.max(0,tot/cap-1)};
}
function qos(a,b,e){
  const A=alloc(),c=$('qos').value,k={v:0,vi:1,d:3}[c],dp={v:0,vi:.1,d:.4}[c];let why='';
  if(S.acl.some(r=>r.s===a&&r.d===b))why='محظور بقاعدة ACL';
  else if(S.fw&&S.v[a]&&S.v[b]&&S.v[a]!==S.v[b])why='حظر الجدار الناري بين الشبكات الافتراضية';
  else if(S.atk&&(rp=>rp.some(isSpl)&&!rp.includes(S.atk))(route(a,b)))why='ONT مارق يشوّش الإرسال العكسي';
  const ok=!why&&(e.s==='ok'||(e.s==='warn'&&Math.random()>.35))&&Math.random()>=A.cong*dp;
  return{ok,why,ms:+(e.base*(1+A.cong*k)+Math.random()*1.5).toFixed(2)};
}
function biz(){
  let capex=0,km=0;Object.values(S.L).forEach(l=>{if(l.t==='fo'){km+=l.len;capex+=l.len*400+l.sp*15+16+(l.odf?60:0)}});
  const subs=onus().filter(k=>S.on[k]).length,rev=subs*S.biz.fee,opex=km*S.biz.opex,net=rev-opex;
  return{capex,rev,opex,net,pay:net>0?capex/net:Infinity,roi:capex?net*12/capex*100:0,util:subs/(S.cfg.ratio*Math.max(1,Object.keys(S.N).filter(isSpl).length))*100};
}

/* ===== undo/redo, tour, scenarios ===== */
const H={u:[],r:[],cur:null},topo=()=>JSON.stringify({N:S.N,L:S.L,on:S.on,v:S.v,acl:S.acl,fw:S.fw,atk:S.atk,bw:S.bw,dba:S.dba,biz:S.biz,cfg:S.cfg,nat:S.nat,T:S.T});
function hist(){const j=topo();if(H.cur===null)H.cur=j;else if(j!==H.cur){H.u.push(H.cur);if(H.u.length>50)H.u.shift();H.r=[];H.cur=j}}
function undo(red){
  const a=red?H.r:H.u,b=red?H.u:H.r;if(!a.length)return;b.push(H.cur);H.cur=a.pop();Object.assign(S,JSON.parse(H.cur));S.tr=null;
  if(!S.L[selL])selL=Object.keys(S.L)[0];if(!S.N[selN])selN='router';build();update();
}
$('un').onclick=()=>undo(0);$('re').onclick=()=>undo(1);
addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('tour').hidden)return tour(99);
  if((e.ctrlKey||e.metaKey)&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)){if(e.key==='z'){e.preventDefault();undo(0)}else if(e.key==='y'){e.preventDefault();undo(1)}}
});
addEventListener('error',e=>log('خطأ غير متوقع',e.message,false));
$('hc').onclick=()=>{document.documentElement.toggleAttribute('data-contrast');update()};
const TOUR=[['مرحباً بك','هذا محاكي تعليمي لشبكة FTTH. اسحب الأجهزة وانقر على الوصلات لتحديدها.'],['اختبر الشبكة','اختر مرسلاً ومستقبلاً ثم اضغط «إرسال الحزم». راقب ميزانية القدرة والتشخيص.'],['أضف عطلاً','غيّر حالة الوصلة (قطع، موصل متسخ، انحناء) ثم استخدم OTDR وقياس القدرة لتحديد السبب.'],['تدرّب','ابدأ سيناريو ميدانياً أو اختباراً كاملاً. يمكنك التراجع بـ Ctrl+Z وحفظ عملك أو تصديره.']];
let ts=0;
function tour(i){ts=i;if(i>=TOUR.length){$('tour').hidden=true;try{localStorage.setItem('netsim-tour','1')}catch{}return}
  $('tour').hidden=false;$('tt').textContent=TOUR[i][0];$('tp').textContent=`(${i+1}/${TOUR.length}) `+TOUR[i][1];$('tn').textContent=i===TOUR.length-1?'ابدأ':'التالي';$('tn').focus()}
$('tn').onclick=()=>tour(ts+1);$('tx').onclick=()=>tour(99);$('hl').onclick=()=>tour(0);
const FS=[{t:'انقطاع بعد أعمال حفر',k:'switch-fat1',f:'cut',c:'شكوى: انقطاع الإنترنت عن جميع المشتركين بعد أعمال حفر قرب الشارع.'},
  {t:'بطء بعد صيانة صندوق التوزيع',k:'spl1-onu2',f:'dirty',pre:l=>{l.odf=1},c:'شكوى: بطء وانقطاع متكرر عند مشترك واحد بعد تبديل توصيلة في صندوق التوزيع.'},
  {t:'إشارة ضعيفة عند مشترك بعيد',k:'spl2-onu3',f:'bend',pre:l=>{l.len=2.5;l.sp=2},c:'شكوى: إشارة ضعيفة عند مشترك بعيد بعد تركيب كابل جديد داخل المنزل.'}];
$('fsb').onclick=()=>{
  const sc=FS[+$('fs').value];S=base();selN='pc1';selL='router-switch';build();
  if(sc.pre)sc.pre(S.L[sc.k]);setFault(sc.k,sc.f,1);S.tr={k:sc.k,f:sc.f,t:Date.now(),w:0,n:sc.t};
  log('بلاغ جديد',sc.c,false,1);log('المطلوب','حدّد الوصلة ونوع العطل، ثم اضغط «تأكيد التشخيص» في قسم السيناريو التدريبي.',true);update();
};
['tx','sens','ovl'].forEach(k=>{$('c_'+k).onchange=e=>{const v=parseFloat(e.target.value),c=S.cfg;
  if(!isFinite(v)||v<-60||v>20)return log('المعدات','قيمة غير صالحة.',false);
  const n={...c,[k]:v};if(n.sens>=n.ovl)return log('المعدات','الحساسية يجب أن تكون أقل من نقطة التشبع.',false);S.cfg=n;update()}});
/* ===== real-value field diagnosis (ITU-T G.652/G.984, TIA-568 typical values) ===== */
const DX={los:['LOS: لا يصل ضوء (Rx < −40 dBm). حدّد موقع القطع بـ OTDR، ثم تأكد من تشغيل الأجهزة.','fail'],copper:['مسار نحاسي: افحص الكبل والمنفذ (Cat6 ≤ 100 م).','ok'],far:['المسافة تتجاوز 20 km (حد GPON).','fail'],dirty:['موصل متسخ أو تالف: فقد زائد ≈ 3 dB وانعكاس ≈ −35 dB. نظّف الطرف وافحصه بالمجهر ثم أعد القياس.','warnc'],bend:['انحناء حاد (Macro-bend) ≈ 1.5 dB. افرد الليف (نصف قطر ≥ 30 مم) وأعد القياس.','warnc'],ov:['تشبع المستقبل (Rx > −8 dBm). ركّب مخفّضاً (Attenuator) أو غيّر نسبة السبليتر.','warnc'],weak:['هامش ضعيف (Rx < −24 dBm). افحص الموصلات واللحامات والطول.','warnc'],ok:['المسار ضمن الحدود القياسية. لا إجراء مطلوب.','ok']};
function diag(){
  const a=$('source').value,b=$('target').value;
  if(a===b){$('dg2').innerHTML='';$('dgm').textContent='اختر جهازين مختلفين';return}
  const p=route(a,b),m=ev(p),x=ev(p,1),ex=m.loss-x.loss,far=p.some(n=>kd(n)==='onu'&&dist(n)>20);const[v,c]=DX[Engine.diagnose({down:m.s==='down',fo:m.fo,far,ex,ov:m.ov,m:m.m})];
  const f=(n,u)=>m.fo?n.toFixed(2)+u:'—';
  $('dg2').innerHTML=`<tr><td>Tx (GPON B+: ‎+1.5…+5)</td><td>${S.cfg.tx.toFixed(2)} dBm</td></tr><tr><td>Rx المتوقع (سليم)</td><td>${f(x.rx,' dBm')}</td></tr><tr><td>Rx المقاس</td><td>${m.s==='down'?'LOS':f(m.rx,' dBm')}</td></tr><tr><td>الفقد الزائد</td><td>${m.s==='down'?'—':f(ex,' dB')}</td></tr><tr><td>نافذة Rx المسموحة</td><td>${S.cfg.sens} … ${S.cfg.ovl} dBm</td></tr>`;
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
  $('oev').innerHTML='<tr><td>نوع الحدث</td><td>الموقع</td><td>الفقد</td><td>الانعكاس</td></tr>'+R.map((r,i)=>`<tr><td>${r[0]}${i>0&&r[1]<.012&&r[3]!=='—'?' ⚠ منطقة عمياء':''}</td><td>${r[1].toFixed(2)} km</td><td>${typeof r[2]==='number'?r[2].toFixed(1):r[2]} dB</td><td>${r[3]}</td></tr>`).join('');
}
/* ===== OSI 7 layers + roles of devices and servers ===== */
const bi=(a,e)=>lang==='en'?e:a;
const OSI=[[7,['التطبيق','Application'],['بيانات','Data'],'HTTP · DNS · DHCP · SMTP',['الخوادم والتطبيقات','Servers & apps']],
[6,['العرض','Presentation'],['بيانات','Data'],'TLS · UTF-8 · JPEG',['التشفير والترميز','Encryption & encoding']],
[5,['الجلسة','Session'],['بيانات','Data'],'RPC · TLS session',['إدارة الحوار','Dialog control']],
[4,['النقل','Transport'],['مقطع / داتاغرام','Segment / Datagram'],'TCP · UDP (ports)',['الجدار الناري','Firewall']],
[3,['الشبكة','Network'],['حزمة','Packet'],'IP · ICMP · ACL',['الراوتر','Router']],
[2,['ربط البيانات','Data link'],['إطار','Frame'],'Ethernet · VLAN · GPON GEM',['السويتش · OLT · ONT','Switch · OLT · ONT']],
[1,['الفيزيائية','Physical'],['بت / ضوء','Bits / light'],'1310/1490 nm · Cat6',['ليف · سبليتر · SFP','Fiber · splitter · SFP']]];
const SV={icmp:['ICMP'],dns:['UDP/TCP 53','dns'],dhcp:['UDP 67/68','dhcp'],web:['TCP 80/443','web'],mail:['TCP 25/587/993','mail']};
const blk=(a,b)=>S.acl.some(r=>r.s===a&&r.d===b)||!!(S.fw&&S.v[a]&&S.v[b]&&S.v[a]!==S.v[b]);
const reach=(a,b)=>{const e=ev(route(a,b));return(e.s==='ok'||e.s==='warn')&&!blk(a,b)};
function osiCheck(a,b,svc){
  const sv=SV[svc],t=sv[1]||b;if(a===t)return null;
  const p=route(a,t),e=ev(p),R={};let stop=false;
  const ok7={icmp:['Echo Reply','Echo Reply'],dns:['تمّت الإجابة على الاستعلام','Query answered'],dhcp:['اكتمل DORA','DORA complete'],web:['HTTP 200 OK','HTTP 200 OK'],mail:['SMTP 250 OK','SMTP 250 OK']}[svc];
  const C=[
    ()=>e.s==='down'?[0,'لا ضوء أو وصلة/جهاز معطّل في المسار','Light lost, or a link/device on the path is down']:e.s==='fail'?[0,`Rx ${e.rx.toFixed(1)} dBm خارج النافذة`,`Rx ${e.rx.toFixed(1)} dBm outside the window`]:e.s==='warn'?[2,'تعمل بهامش ضعيف أو تشبع','Works with weak margin or overload']:[1,'الإشارة سليمة','Signal healthy'],
    ()=>S.atk&&p.some(isSpl)&&!p.includes(S.atk)?[0,'ONT مارق يشوّش الإرسال العكسي','Rogue ONT jams the upstream']:[1,`الإطارات تُمرَّر · VLAN ${S.v[a]||'—'}→${S.v[t]||'—'}`,`Frames forwarded · VLAN ${S.v[a]||'—'}→${S.v[t]||'—'}`],
    ()=>blk(a,t)?[0,'محظور بقاعدة ACL أو الجدار الناري','Blocked by ACL or firewall']:[1,`${ip(a)} → ${ip(t)}`,`${ip(a)} → ${ip(t)}`],
    ()=>alloc().cong>0?[2,'ازدحام: إعادة إرسال TCP','Congestion: TCP retransmissions']:[1,`المنفذ ${sv[0]} مفتوح`,`Port ${sv[0]} open`],
    ()=>[1,'الجلسة تُنشأ','Session established'],
    ()=>[1,'ترميز/تشفير البيانات','Encoding / encryption'],
    ()=>(svc==='web'||svc==='mail')&&!reach(a,'dns')?[0,'تعذّر تحويل الاسم إلى IP: خادم DNS غير متاح','Name resolution failed: DNS unreachable']:[1,ok7[0],ok7[1]]];
  C.forEach((f,i)=>{if(stop){R[i+1]=null;return}const[o,ar,en]=f();R[i+1]={ok:o,m:bi(ar,en)};if(o===0)stop=true});
  return R;
}
function osi(){
  const a=$('source').value,svc=$('svc').value,R=osiCheck(a,$('target').value,svc),I={1:'✔',2:'⚠',0:'✘'},cl={1:'ok',2:'warnc',0:'fail'};
  $('osi').innerHTML=`<tr><td>#</td><td>PDU</td><td>${bi('البروتوكولات · الأجهزة','Protocols · Devices')}</td><td>${bi('الحالة','Status')}</td></tr>`+OSI.map(r=>{const x=R&&R[r[0]];
    return `<tr><td>${r[0]} · ${bi(...r[1])}</td><td>${bi(...r[2])}</td><td style="direction:ltr;text-align:left">${r[3]}<br><small>${bi(...r[4])}</small></td><td class="${x?cl[x.ok]:''}" style="direction:rtl;text-align:right">${x?I[x.ok]+' '+esc(x.m):'—'}</td></tr>`}).join('');
  const f=R&&OSI.map(r=>r[0]).find(n=>R[n]&&R[n].ok===0);
  $('osis').className='li '+(!R?'':f?'fail':'ok');
  $('osis').textContent=!R?bi('اختر مصدراً مختلفاً عن الخادم','Pick a source different from the server'):f?bi(`أول طبقة فاشلة: ${f} (${OSI.find(r=>r[0]===f)[1][0]}). ابدأ التشخيص منها.`,`First failing layer: ${f} (${OSI.find(r=>r[0]===f)[1][1]}). Start troubleshooting there.`):bi('كل الطبقات سليمة. الخدمة تعمل.','All layers healthy. The service works.');
}
const INFO={
 router:{l:['3 (الشبكة)','3 (Network)'],p:'IP · NAT · Inter-VLAN',t:[['يوجّه الحزم بين الشبكات والإنترنت','Routes packets between networks and the Internet'],['يربط شبكات VLAN المختلفة (Inter-VLAN routing)','Connects different VLANs (inter-VLAN routing)'],['ينفّذ NAT وقواعد ACL والجدار الناري','Applies NAT, ACLs and the firewall']],i:['عند تعطله: لا إنترنت ولا اتصال بين الـ VLAN.','If down: no Internet and no inter-VLAN traffic.']},
 switch:{l:['2 (ربط البيانات)','2 (Data link)'],p:'Ethernet · VLAN 802.1Q · GPON OLT',t:[['يحوّل الإطارات حسب عناوين MAC','Forwards frames by MAC address'],['يفصل الشبكات المنطقية بـ VLAN','Separates logical networks with VLANs'],['الـ OLT يدير الـ ONT ويوزّع النطاق (DBA)','The OLT manages ONTs and allocates bandwidth (DBA)']],i:['عند تعطله: ينقطع كل ما يتصل به.','If down: everything attached to it is cut off.']},
 spl:{l:['1 (الفيزيائية)','1 (Physical)'],p:'Passive optical splitter',t:[['يقسم الضوء بين عدة مشتركين دون كهرباء','Splits light among subscribers with no power'],['يضيف فقداً ثابتاً (1:4 ≈ 7.2 dB)','Adds fixed loss (1:4 ≈ 7.2 dB)'],['يحدّد عدد المشتركين لكل منفذ PON','Sets how many subscribers share a PON port']],i:['عند تعطله: ينقطع كل المشتركين عليه.','If it fails: all subscribers behind it lose service.']},
 fat:{l:['1 (الفيزيائية)','1 (Physical)'],p:'FAT · Fiber Access Terminal',t:[['صندوق توزيع يقرّب الألياف من المشتركين','Distribution box bringing fiber close to subscribers'],['يحتوي عدة سبلترات (حتى 4) ويحمي اللحامات والموصلات','Houses several splitters (up to 4) and protects splices and connectors'],['نقطة اختبار: قِس الباور ميتر عند مدخله','Test point: measure the power meter at its input']],i:['عند تعطله: ينقطع كل السبلترات داخله.','If down: every splitter inside it is cut off.']},
 onu:{l:['1–2 (الفيزيائية/الربط)','1–2 (Physical / Data link)'],p:'GPON ONU · GEM · 1310 nm ↑ / 1490 nm ↓',t:[['يحوّل الضوء إلى إشارة كهربائية ويرسل صاعداً بـ 1310 nm','Converts light to an electrical signal and sends upstream at 1310 nm'],['يخدم عدة راوترات منزلية على منافذ LAN (حتى 4)','Serves several home routers on LAN ports (up to 4)'],['ينال نطاقه من الـ OLT بحسب DBA','Gets its bandwidth from the OLT through DBA']],i:['عند تعطله: تنقطع الراوترات والحاسبات خلفه فقط.','If down: only the routers and PCs behind it lose service.']},
 hr:{l:['3 (الشبكة)','3 (Network)'],p:'Home router · NAT · DHCP · Wi-Fi',t:[['يوزّع عناوين IP داخلية للحاسبات (DHCP محلي)','Hands out private IPs to PCs (local DHCP)'],['يترجم العناوين (NAT) نحو الـ ONU','Translates addresses (NAT) toward the ONU'],['يربط عدة حاسبات سلكياً أو Wi-Fi','Connects several PCs by cable or Wi-Fi']],i:['عند تعطله: تنقطع حاسبات هذا المنزل فقط.','If down: only this home’s PCs lose service.']},
 pc:{l:['7 (التطبيق)','7 (Application)'],p:'NIC · IP · TCP/UDP · browser',t:[['جهاز المستخدم النهائي','End-user device'],['يطلب IP (DHCP) وأسماء (DNS) وصفحات (HTTP)','Requests IP (DHCP), names (DNS) and pages (HTTP)'],['يخضع لقواعد VLAN وACL','Subject to VLAN and ACL rules']],i:['عند تعطله: يخسر هذا المستخدم الخدمة فقط.','If down: only this user loses service.']},
 sw2:{l:['2 (ربط البيانات)','2 (Data link)'],p:'STP 802.1D',t:[['يوفّر مساراً احتياطياً (Redundancy)','Provides a redundant path'],['STP يحجب رابطاً لمنع الحلقات (Loop)','STP blocks one link to prevent loops'],['يفتح الرابط المحجوب عند سقوط الأساسي','Unblocks the backup link when the primary fails']],i:['عند تعطله: لا تأثر طالما الرابط الأساسي سليم.','If down: no impact while the primary link is healthy.']},
 dhcp:{l:['7 (التطبيق)','7 (Application)'],p:'UDP 67/68',t:[['يمنح الأجهزة عناوين IP تلقائياً (DORA)','Assigns IPs automatically (DORA)'],['يوزّع البوابة وخادم DNS ومدة التأجير','Hands out gateway, DNS server and lease time'],['يمنع تعارض العناوين ويركّز الإدارة','Prevents address conflicts, centralizes management']],i:['عند تعطله: لا تحصل الأجهزة الجديدة على IP.','If down: new devices get no IP address.']},
 dns:{l:['7 (التطبيق)','7 (Application)'],p:'UDP/TCP 53',t:[['يحوّل الأسماء إلى عناوين IP (web.local)','Resolves names to IPs (web.local)'],['يخزّن الاستعلامات مؤقتاً لتسريع الاستجابة','Caches queries to speed up answers'],['يحيل ما لا يعرفه إلى خوادم أعلى','Forwards unknown names to upstream servers']],i:['عند تعطله: ping بالـ IP يعمل لكن المواقع بالأسماء تفشل.','If down: ping by IP works but names fail.']},
 web:{l:['7 (التطبيق) + TLS (6)','7 (Application) + TLS (6)'],p:'TCP 80/443',t:[['يستضيف المواقع ويرد على طلبات HTTP/S','Hosts sites and answers HTTP/S requests'],['يشفّر الاتصال بـ TLS','Encrypts connections with TLS'],['قد يوزّع الحمل ويسجّل الطلبات','May balance load and log requests']],i:['عند تعطله: لا تُفتح الصفحات رغم سلامة الشبكة.','If down: pages do not load although the network is fine.']},
 mail:{l:['7 (التطبيق)','7 (Application)'],p:'SMTP 25/587 · IMAP 993',t:[['يرسل ويستقبل البريد بين الخوادم (SMTP)','Sends/receives mail between servers (SMTP)'],['يخزّن الصناديق ويقدّمها للعملاء (IMAP)','Stores mailboxes and serves clients (IMAP)'],['يفلتر الرسائل المزعجة والفيروسات','Filters spam and malware']],i:['عند تعطله: لا يصل البريد ولا يُرسل.','If down: mail is neither delivered nor sent.']}};
function info(){
  const d=INFO[kd(selN)]||INFO[selN],box=$('srv');box.replaceChildren();
  if(!d){box.textContent='—';return}
  const h=document.createElement('strong'),m=document.createElement('p'),u=document.createElement('ul'),f=document.createElement('p');
  h.textContent=S.N[selN].n+(ip(selN)?' · '+ip(selN):'');m.textContent=bi(`الطبقة: ${d.l[0]} · ${d.p}`,`Layer: ${d.l[1]} · ${d.p}`);
  d.t.forEach(x=>{const li=document.createElement('li');li.textContent=bi(x[0],x[1]);u.append(li)});
  f.className='warnc';f.textContent=bi(d.i[0],d.i[1]);box.append(h,m,u,f);
}
/* ===== v2.2: routing/NAT/STP, map+BOM, scenarios library, scoreboard ===== */
const ls=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch{return d}},ss=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const cnt=k=>Object.keys(S.N).filter(x=>kd(x)===k).length;
function bom(){
  const fo=Object.entries(S.L).filter(([,l])=>l.t==='fo'),km=fo.reduce((a,[,l])=>a+l.len,0),sp=fo.reduce((a,[,l])=>a+l.sp,0),odf=fo.filter(([,l])=>l.odf).length;
  $('bom').innerHTML=`<tr><td>طول الكابل الكلي</td><td>${km.toFixed(2)} km</td></tr><tr><td>اللحامات</td><td>${sp}</td></tr><tr><td>الموصلات</td><td>${fo.length*2+odf*2}</td></tr><tr><td>صناديق ODF</td><td>${odf}</td></tr><tr><td>الفاتات (FAT)</td><td>${cnt('fat')}</td></tr><tr><td>السبلترات 1:${S.cfg.ratio}</td><td>${cnt('spl')}</td></tr><tr><td>وحدات ONU</td><td>${cnt('onu')}</td></tr><tr><td>الراوترات المنزلية</td><td>${cnt('hr')}</td></tr><tr><td>الحاسبات</td><td>${cnt('pc')}</td></tr>`;
  const c=$('mp'),g=c.getContext('2d'),w=c.width,h=c.height;g.clearRect(0,0,w,h);g.font='11px Tahoma';
  const dep={switch:0},q=['switch'];
  while(q.length){const a=q.shift();Object.values(S.L).forEach(l=>{if(l.t!=='fo')return;const n=l.a===a?l.b:l.b===a?l.a:null;if(n&&dep[n]===undefined){dep[n]=dep[a]+1;q.push(n)}})}
  const D=Math.max(1,...Object.values(dep)),cols={},P={};
  Object.entries(dep).forEach(([id,d])=>(cols[d]=cols[d]||[]).push(id));
  Object.entries(cols).forEach(([d,ids])=>ids.forEach((id,i)=>{P[id]=[40+d*(w-130)/D,(i+1)*h/(ids.length+1)]}));
  Object.entries(S.L).forEach(([k,l])=>{
    if(l.t!=='fo'||!P[l.a]||!P[l.b])return;const a=P[l.a],b=P[l.b],cut=l.f==='cut';
    g.strokeStyle=cut?css('--red'):COL[colOf(k)-1][1];g.lineWidth=3;g.setLineDash(cut?[6,5]:[]);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();g.setLineDash([]);
    g.fillStyle=css('--amber');for(let i=1;i<=l.sp;i++){const t=i/(l.sp+1);g.fillRect(a[0]+(b[0]-a[0])*t-3,a[1]+(b[1]-a[1])*t-3,6,6)}
    if(l.f!=='ok'&&!(S.tr&&S.tr.k===k)){g.fillStyle=css('--red');g.fillText('✖',a[0]+(b[0]-a[0])*l.fp-4,a[1]+(b[1]-a[1])*l.fp+4)}
    g.fillStyle=css('--muted');g.fillText(l.len>=1?l.len+' km':Math.round(l.len*1000)+' m',(a[0]+b[0])/2-14,(a[1]+b[1])/2-6);
  });
  Object.entries(P).forEach(([id,p])=>{g.fillStyle=css('--text');g.beginPath();g.arc(p[0],p[1],5,0,7);g.fill();g.fillText(S.N[id].e,p[0]-18,p[1]+17)});
  g.fillStyle=css('--amber');g.fillText('■ '+bi('لحام','splice'),8,h-8);
}
function rt(){
  const vs=[...new Set(Object.values(S.v))].sort((a,b)=>a-b),bl=[...stp()].map(k=>lname(k));
  $('rt').innerHTML='<tr><td>Network</td><td>Via</td><td>Type</td></tr><tr><td>192.168.1.0/24</td><td>Servers / mgmt</td><td>C</td></tr>'+vs.map(v=>`<tr><td>192.168.${v}.0/24</td><td>VLAN ${v}</td><td>C</td></tr>`).join('')+`<tr><td>0.0.0.0/0</td><td>ISP 203.0.113.1</td><td>S*</td></tr><tr><td>NAT (PAT)</td><td>${S.nat?'203.0.113.5':'—'}</td><td>${S.nat?'ON':'OFF'}</td></tr><tr><td>STP BLK</td><td colspan="2" style="direction:rtl">${bl.length?esc(bl.join('، ')):'—'}</td></tr>`;
  $('nat').textContent='NAT: '+(S.nat?'مفعّل':'معطّل');
}
$('nat').onclick=()=>{S.nat=S.nat?0:1;log('NAT',S.nat?'تم تفعيل ترجمة العناوين (PAT).':'تم إيقاف NAT: العناوين الخاصة لا تصل للإنترنت.',!!S.nat,!S.nat);update()};
$('wdm').onchange=e=>{S.cfg.wdm=+e.target.value;update()};
const SC='netsim-scores',SK='netsim-scen',KEYS0=Object.keys(base().L);
function addScore(n,sc,sec){const a=ls(SC,[]);a.push({n:String(n).slice(0,60),sc,sec,d:new Date().toISOString().slice(0,10)});ss(SC,a.slice(-30))}
function sb(){
  const all=ls(SC,[]),b=$('sb');b.replaceChildren();if(!all.length){b.textContent='—';return}
  const h=document.createElement('div');h.className='li ok';h.textContent=bi(`أفضل درجة: ${Math.max(...all.map(x=>x.sc))}/100 · عدد المحاولات: ${all.length}`,`Best score: ${Math.max(...all.map(x=>x.sc))}/100 · attempts: ${all.length}`);b.append(h);
  all.slice(-8).reverse().forEach(x=>{const d=document.createElement('div');d.className='li';d.textContent=`${x.d} · ${x.n} · ${x.sc}/100 · ${x.sec}s`;b.append(d)});
}
const toFS=j=>({t:j.title,c:j.complaint||'',k:j.fault.link,f:j.fault.type,pre:l=>{const s=j.setup||{};if(s.len!==undefined)l.len=+s.len;if(s.sp!==undefined)l.sp=+s.sp;if(s.odf!==undefined)l.odf=+s.odf?1:0}});
const addFS=j=>{FS.push(toFS(j));$('fs').add(new Option(j.title,FS.length-1))};
ls(SK,[]).filter(j=>!Engine.validateScenario(j,KEYS0).length).forEach(addFS);
$('fsi').onchange=e=>{const f=e.target.files[0];if(!f)return;
  f.text().then(t=>{const j=JSON.parse(t),er=Engine.validateScenario(j,KEYS0);if(er.length)throw new Error(er[0]);const a=ls(SK,[]);a.push(j);ss(SK,a.slice(-20));addFS(j);log('سيناريو','أُضيف: '+j.title,true)}).catch(x=>log('سيناريو','ملف غير صالح: '+x.message,false));e.target.value=''};
let TAB='net';
function setTab(t){TAB=t;document.querySelectorAll('[data-t]').forEach(e=>{e.hidden=!e.dataset.t.split(' ').includes(t)});
  document.querySelectorAll('.tabs button').forEach(b=>{const on=b.dataset.tab===t;b.setAttribute('aria-selected',on);b.classList.toggle('primary',on)})}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
/* ===== normal power-meter readings: feeder -4..-11 dBm, ONT -12..-24 dBm ===== */
const dk=()=>{const D=Engine.DIR[S.cfg.fib];return D?D.d:S.cfg.fib};
function pmRead(ont){
  const sp=splOf(ont),f=ev1(path('switch',sp),0,dk()),o=ev1(path('switch',ont),0,dk());
  const oth=onus().filter(k=>k!==ont&&S.on[k]).map(k=>ev1(path('switch',k),0,dk())).filter(x=>x.s!=='down').map(x=>x.rx).sort((a,b)=>a-b);
  const med=oth.length?oth[Math.floor(oth.length/2)]:null,d=med==null||o.s==='down'?0:o.rx-med;
  const bf=ev1(path('switch',sp),1,dk()).rx,df=f.s==='down'?0:f.rx-bf;
  let code=Engine.meterVerdict(f,o);if(code==='ok'&&df<-1.2)code='feeder_degraded';if(code==='ok'&&d<-1.2)code='drop_diff';
  return{f,o,d,df,code};
}
const PMM={ok:['القراءات ضمن النطاق الطبيعي. لا عطل.','Readings are within the normal range. No fault.'],
 los_feeder:['لا ضوء عند مدخل السبليتر: قطع في الكابل الرئيسي أو الـ OLT/ODF. حدّد موقعه بـ OTDR.','No light at the splitter input: break in the main cable, or OLT/ODF problem. Locate it with an OTDR.'],
 los_drop:['الرئيسي سليم ولا ضوء عند ONT: قطع في الكبل الفرعي أو ONT معطّل.','Main cable is fine but no light at the ONT: break in the drop cable, or ONT is off.'],
 feeder_low:['القراءة عند مدخل السبليتر أقل من −11 dBm: فقد زائد في الكابل الرئيسي يؤثر على كل المشتركين. نظّف موصل ODF وافحص الانحناءات واللحامات بـ OTDR.','Splitter-input reading is below −11 dBm: excess loss in the main cable affects all subscribers. Clean the ODF connector and check bends and splices with an OTDR.'],
 feeder_high:['القراءة عند مدخل السبليتر أعلى من −4 dBm: تحقق من نقطة القياس أو الطول أو غياب موصلات ODF.','Splitter-input reading is above −4 dBm: check the measurement point, length, or missing ODF connectors.'],
 drop_low:['الرئيسي سليم لكن القراءة عند ONT أقل من −24 dBm: الخلل في الكبل الفرعي (موصل ONT متسخ، انحناء، لحام سيئ).','Main cable is fine but the ONT reading is below −24 dBm: fault in the drop (dirty ONT connector, bend, bad splice).'],
 ont_high:['القراءة عند ONT أعلى من −12 dBm: تحقق من نسبة السبليتر أو قصر الوصلة.','ONT reading is above −12 dBm: check the splitter ratio or an unusually short link.']};
function pmv(){
  if(!onuOf(selN)){$('pmv').innerHTML='';$('pmm').textContent='—';return}
  const ont=onuOf(selN),r=pmRead(ont),W=Engine.WIN,fm=x=>x.s==='down'?'LOS':x.rx.toFixed(1)+' dBm',st=(x,w)=>x.s==='down'?'✘':x.rx>=w[0]&&x.rx<=w[1]?'✔':'✘';
  $('pmv').innerHTML=`<tr><td>${bi('مدخل السبليتر (الكابل الرئيسي)','Splitter input (main cable)')}</td><td>${fm(r.f)} ${st(r.f,W.feeder)}</td></tr><tr><td>${bi('الطبيعي','Normal')}</td><td>−11 … −4 dBm</td></tr><tr><td>ONT ${esc(S.N[ont].e)}</td><td>${fm(r.o)} ${st(r.o,W.ont)}</td></tr><tr><td>${bi('الطبيعي','Normal')}</td><td>−24 … −12 dBm</td></tr>`;
  $('pmm').className='li '+(r.code==='ok'?'ok':r.code.startsWith('los')?'fail':'warnc');
  $('pmm').textContent=r.code==='feeder_degraded'?bi(`القراءة عند مدخل السبليتر أقل من القيمة المتوقعة عند التركيب بـ ${(-r.df).toFixed(1)} dB رغم أنها ضمن النطاق: بداية تدهور في الكابل الرئيسي (موصل ODF متسخ أو انحناء). قارن مع سجل القياس عند التسليم.`,`Splitter-input reading is ${(-r.df).toFixed(1)} dB below the expected commissioning value although within range: early degradation in the main cable (dirty ODF connector or bend). Compare with the hand-over record.`):r.code==='drop_diff'?bi(`قراءة هذا الـONT أضعف من بقية المشتركين بـ ${(-r.d).toFixed(1)} dB رغم أنها ضمن النطاق: الخلل في الكبل الفرعي (موصل ONT متسخ أو انحناء).`,`This ONT reads ${(-r.d).toFixed(1)} dB weaker than the other subscribers although within range: fault in its drop (dirty ONT connector or bend).`):bi(...PMM[r.code]);
}
/* ===== hierarchy editing ===== */
const NK={fat:{p:'olt',max:4,i:'📦',n:'الفاتة',lk:['fo',8,2,1]},spl:{p:'fat',max:4,i:'🔱',n:'سبلتر',lk:['fo',.005,0,0]},onu:{p:'spl',i:'📟',n:'ONU',lk:['fo',.3,0,0]},hr:{p:'onu',max:4,i:'📶',n:'راوتر منزلي',lk:['cu',.01,0,0]},pc:{p:'hr',max:8,i:'💻',n:'حاسوب',lk:['cu',.01,0,0]}};
const PN={olt:'الـ OLT',fat:'فاتة',spl:'سبلتر',onu:'ONU',hr:'راوتر منزلي'};
$('add').onclick=()=>{
  const kind=$('ak').value,d=NK[kind];
  const par=d.p==='olt'?'switch':kd(selN)===d.p?selN:path('switch',selN).find(n=>kd(n)===d.p);
  if(!par){log('إضافة',`حدّد ${PN[d.p]} أولاً (الجهاز الأب).`,false);return}
  const lim=kind==='onu'?S.cfg.ratio:d.max;
  if(lim&&kids(par).filter(x=>kd(x)===kind).length>=lim){log('إضافة',`تحت ${S.N[par].n} لا تتسع لأكثر من ${lim}.`,false);return}
  const n=Math.max(0,...Object.keys(S.N).map(k=>(k.match(new RegExp('^'+kind+'(\\d+)$'))||[0,0])[1]).map(Number))+1,id=kind+n;
  S.N[id]={n:`${d.n} ${n}`,e:{fat:'FAT-'+n,spl:'Splitter 1:'+S.cfg.ratio,onu:'ONU-'+String(n).padStart(2,'0'),hr:'Home router '+n,pc:'PC-'+String(n).padStart(2,'0')}[kind],i:d.i,k:kind,x:50,y:50};
  if(kind==='onu'){S.N[id].ip='10.20.0.'+n;S.bw[id]=100}
  if(kind==='hr')S.N[id].ip='192.168.100.'+n;
  if(kind==='pc'){const sib=kids(par).find(x=>S.v[x]);S.v[id]=sib?S.v[sib]:10}
  S.on[id]=true;
  S.L[par+'-'+id]={a:par,b:id,t:d.lk[0],len:d.lk[1],sp:d.lk[2],f:'ok',fp:.5,...(d.lk[3]?{odf:1}:{}),tc:+((Math.random()-.5)*.2).toFixed(3),ts:+((Math.random()-.5)*.06).toFixed(3)};
  autoLayout(S);build();log('إضافة',`أُضيف ${S.N[id].n} تحت ${S.N[par].n}.`,true);selN=id;update();
};
$('del').onclick=()=>{
  if(!NK[kd(selN)]){log('حذف','لا يمكن حذف هذا الجهاز (النواة/الخوادم).',false);return}
  const par=path('switch',selN).slice(-2)[0]||'switch',gone=new Set([selN]),walk=id=>kids(id).forEach(x=>{gone.add(x);walk(x)});walk(selN);
  gone.forEach(id=>{delete S.N[id];delete S.on[id];delete S.v[id];delete S.bw[id]});
  Object.keys(S.L).forEach(k=>{if(gone.has(S.L[k].a)||gone.has(S.L[k].b))delete S.L[k]});
  S.acl=S.acl.filter(r=>!gone.has(r.s)&&!gone.has(r.d));if(gone.has(S.atk))S.atk=null;
  if(!S.L[selL])selL=Object.keys(S.L)[0];selN=par;autoLayout(S);build();log('حذف',`حُذف ${gone.size} جهاز/أجهزة.`,true);update();
};
$('lay').onclick=()=>{autoLayout(S);build();update()};
const HN={olt:['فاتة','FATs'],fat:['سبلتر','splitters'],spl:['ONU','ONUs'],onu:['راوتر','routers'],hr:['حاسوب','PCs']};
function hier(){
  const box=$('hier');box.replaceChildren();
  const node=id=>{const li=document.createElement('li'),c=kids(id),k=kd(id);
    li.textContent=S.N[id].n+(c.length&&HN[k]?` (${c.length} ${bi(...HN[k])})`:'')+(S.on[id]?'':' ✘');li.style.cursor='pointer';li.style.fontWeight=id===selN?'bold':'normal';
    li.onclick=e=>{e.stopPropagation();selN=id;update()};
    if(c.length){const ul=document.createElement('ul');c.forEach(x=>ul.append(node(x)));li.append(ul)}return li};
  const ul=document.createElement('ul');ul.append(node('switch'));box.append(ul);
}
function ext(){
  diag();oev();osi();info();rt();bom();sb();pmv();hier();const l=S.L[selL],A=alloc(),B=biz();
  $('col').value=colOf(selL);$('odfs').value=l.odf?1:0;$('col').disabled=$('odfs').disabled=l.t==='cu';
  const ou=onuOf(selN);$('bw').value=ou?S.bw[ou]||100:'';$('bw').disabled=!ou;$('dba').value=S.dba;['tx','sens','ovl'].forEach(k=>$('c_'+k).value=S.cfg[k]);$('wdm').value=S.cfg.wdm?1:0;$('fee').value=S.biz.fee;$('opx').value=S.biz.opex;
  $('fw').textContent='جدار ناري: '+(S.fw?'مفعّل':'معطّل');
  $('gp').innerHTML='<tr><td>ONU</td><td>المسافة</td><td>المتعاقد</td><td>المخصص</td></tr>'+onus().map(k=>{const d=dist(k);
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
  const so=onuOf(src);$('thr').textContent=A.r[so]?(A.r[so]*(S.st.sent?S.st.succ/S.st.sent:1)).toFixed(0)+' Mbps':'—';
  $('sec').textContent=S.atk?'⚠ هجوم':S.fw?'جدار ✔':S.acl.length?S.acl.length+' ACL':'—';
}
$('col').onchange=e=>{S.L[selL].col=+e.target.value;update()};
$('odfs').onchange=e=>{S.L[selL].odf=+e.target.value;update()};
$('bw').onchange=e=>{const ou=onuOf(selN);if(ou){S.bw[ou]=Math.max(10,Math.min(1000,+e.target.value||100));update()}};
$('dba').onchange=e=>{S.dba=+e.target.value;update()};
$('fee').onchange=e=>{S.biz.fee=Math.max(1,+e.target.value||25);update()};
$('opx').onchange=e=>{S.biz.opex=Math.max(0,+e.target.value||0);update()};
$('aa').onclick=()=>{const s=$('as').value,d=$('ad').value;if(s===d||S.acl.some(r=>r.s===s&&r.d===d))return log('ACL','قاعدة غير صالحة أو مكررة.',false);S.acl.push({s,d});log('ACL',`حظر ${s} → ${d}`,true);update()};
$('fw').onclick=()=>{S.fw=S.fw?0:1;log('جدار ناري',S.fw?'تم حظر الحركة بين الشبكات الافتراضية.':'تم إيقاف الجدار.',true);update()};
$('atk').onclick=()=>{
  if(S.atk){tkClose('ATK');log('إيقاف الهجوم',`عاد ${S.N[S.atk].n} للعمل الطبيعي.`,true,0);S.atk=null}
  else if(onuOf(selN)){S.atk=onuOf(selN);tkOpen('ATK',`ONU مارق: ${S.N[S.atk].n} يشوّش الإرسال العكسي`);log('هجوم ONU مارق',`${S.N[S.atk].n} يرسل باستمرار ويعطّل بقية المشتركين.`,false,1)}
  else log('الهجوم','حدّد ONU أولاً.',false);
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
const pdf=cs=>PDFLib.build(cs.map(c=>({w:c.width,h:c.height,bytes:Uint8Array.from(atob(c.toDataURL('image/jpeg',.92).split(',')[1]),ch=>ch.charCodeAt(0))})));
function dl(b,name){const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}
/* i18n */
function tr(){
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
  while(n=w.nextNode()){if(n.parentNode.closest('script,#tout'))continue;if(n.__a===undefined||n.data!==n.__e)n.__a=n.data;const v=lang==='en'?TT(n.__a):n.__a;if(n.data!==v)n.data=v;n.__e=v}
}
new MutationObserver(tr).observe(document.body,{subtree:true,childList:true,characterData:true});
$('lg').onclick=()=>{lang=lang==='ar'?'en':'ar';document.documentElement.lang=lang;document.documentElement.dir=lang==='en'?'ltr':'rtl';$('lg').textContent=lang==='en'?'🌐 AR':'🌐 EN';tr();update()};
try{if(!localStorage.getItem('netsim-tour'))tour(0)}catch{}
setTab('net');
build();log('النظام جاهز','أرسل حزماً، أضف عطلاً، جرّب OTDR، أو ابدأ سيناريو تدريبياً.',true);update();
})();
