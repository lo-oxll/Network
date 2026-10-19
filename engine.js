(function(r,f){if(typeof module==='object')module.exports=f();else r.Engine=f()})(this,function(){
const VERSION=2;
const FIB={GPON:['GPON (1310 nm ↑ / 1490 nm ↓)',.35],SM1310:['SM 1310 nm',.35],SM1490:['SM 1490 nm',.25],SM1550:['SM 1550 nm',.22],MM850:['MM 850 nm',3],MM1300:['MM 1300 nm',1]};
const SPL={2:3.5,4:7.2,8:10.5,16:13.8};
/* link loss (dB): fiber + 2 connectors (±tolerance) + splices (±tolerance) + ODF + fault */
const linkLoss=(l,a,nf)=>l.len*a+1+(l.tc||0)*2+l.sp*(.1+(l.ts||0))+(l.odf?1:0)+({dirty:3,bend:1.5}[nf?'':l.f]||0);
const state=({down,fo,far,m,ov})=>down?'down':fo&&(m<0||far)?'fail':fo&&(m<3||ov)?'warn':'ok';
const diagnose=({down,fo,far,ex,ov,m})=>down?'los':!fo?'copper':far?'far':ex>=2.5?'dirty':ex>=1?'bend':ov?'ov':m<3?'weak':'ok';
function migrate(o){
  if(!o||typeof o!=='object')return o;
  const c=Object.assign({tx:3,sens:-27,ovl:-8},o.cfg||{});
  if(!o.ver||o.ver<2){if(c.fib==='SM1310')c.fib='GPON'}
  return Object.assign({},o,{cfg:c,ver:VERSION});
}
function validate(o){
  const e=[],isN=x=>typeof x==='number'&&isFinite(x);
  if(!o||typeof o!=='object'||Array.isArray(o))return['ملف غير صالح'];
  if(!o.N||typeof o.N!=='object'||!o.L||typeof o.L!=='object'||!o.on||!o.v||!o.cfg)return['حقول مطلوبة ناقصة'];
  const ids=Object.keys(o.N);
  if(!ids.length||ids.length>40)e.push('عدد الأجهزة غير صالح');
  ids.forEach(k=>{const n=o.N[k];if(!/^[a-z][a-z0-9]*$/i.test(k)||!n||typeof n.n!=='string'||n.n.length>40||typeof n.e!=='string'||!isN(n.x)||!isN(n.y))e.push('جهاز غير صالح: '+k)});
  Object.entries(o.L).forEach(([k,l])=>{
    if(!l||!o.N[l.a]||!o.N[l.b])return e.push('وصلة بأطراف مجهولة: '+k);
    if(!['cu','fo'].includes(l.t))e.push('نوع وصلة غير صالح: '+k);
    if(!isN(+l.len)||l.len<.01||l.len>100)e.push('طول غير صالح: '+k);
    if(!Number.isInteger(+l.sp)||l.sp<0||l.sp>50)e.push('عدد لحامات غير صالح: '+k);
    if(!['ok','cut','dirty','bend'].includes(l.f))e.push('حالة غير صالحة: '+k);
  });
  Object.entries(o.v).forEach(([k,v])=>{if(!o.N[k]||!Number.isInteger(+v)||v<1||v>4094)e.push('VLAN غير صالح: '+k)});
  if(![2,4,8,16].includes(+o.cfg.ratio)||!FIB[o.cfg.fib])e.push('إعدادات الليف/السبليتر غير صالحة');
  ['tx','sens','ovl'].forEach(k=>{if(!isN(+o.cfg[k]))e.push('معامل غير صالح: '+k)});
  if(+o.cfg.sens>=+o.cfg.ovl)e.push('الحساسية يجب أن تكون أقل من نقطة التشبع');
  if(o.acl&&!(Array.isArray(o.acl)&&o.acl.every(r=>r&&o.N[r.s]&&o.N[r.d])))e.push('قواعد ACL غير صالحة');
  if(o.T&&!(Array.isArray(o.T)&&o.T.every(t=>t&&Number.isInteger(t.id)&&['open','work','closed'].includes(t.s)&&typeof t.d==='string'&&typeof t.k==='string')))e.push('تذاكر غير صالحة');
  return e;
}
return{VERSION,FIB,SPL,linkLoss,state,diagnose,migrate,validate};
});
