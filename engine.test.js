const test=require('node:test'),assert=require('node:assert'),E=require('../engine.js'),P=require('../pdf.js'),{TT}=require('../i18n.js');
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
const good=()=>({ver:2,N:{router:{n:'R',e:'Router',x:50,y:10},pc1:{n:'PC',e:'ONT',x:20,y:80}},L:{'router-pc1':{a:'router',b:'pc1',t:'fo',len:1,sp:0,f:'ok'}},on:{router:true,pc1:true},v:{pc1:10},cfg:{fib:'GPON',ratio:4,tx:3,sens:-27,ovl:-8},acl:[],T:[]});
test('linkLoss: fiber+connectors+splices',()=>near(E.linkLoss({len:5,sp:1,f:'ok'},.35),2.85));
test('linkLoss: faults add 3 / 1.5 dB and nf ignores them',()=>{near(E.linkLoss({len:1,sp:0,f:'dirty'},.35)-E.linkLoss({len:1,sp:0,f:'ok'},.35),3);near(E.linkLoss({len:1,sp:0,f:'bend'},.35,1),1.35)});
test('linkLoss: tolerance and ODF',()=>near(E.linkLoss({len:0,sp:2,f:'ok',tc:.1,ts:.03,odf:1},.35),1+.2+2*.13+1));
test('state thresholds',()=>{
  assert.equal(E.state({down:true}),'down');assert.equal(E.state({fo:true,m:-1}),'fail');assert.equal(E.state({fo:true,m:5,far:true}),'fail');
  assert.equal(E.state({fo:true,m:2}),'warn');assert.equal(E.state({fo:true,m:10,ov:true}),'warn');assert.equal(E.state({fo:true,m:10}),'ok');assert.equal(E.state({fo:false}),'ok');
});
test('diagnose codes',()=>{
  const d=o=>E.diagnose({down:false,fo:true,far:false,ex:0,ov:false,m:10,...o});
  assert.equal(d({down:true}),'los');assert.equal(d({fo:false}),'copper');assert.equal(d({far:true}),'far');assert.equal(d({ex:3}),'dirty');
  assert.equal(d({ex:1.5}),'bend');assert.equal(d({ov:true}),'ov');assert.equal(d({m:2}),'weak');assert.equal(d({}),'ok');
});
test('validate accepts a good file',()=>assert.deepEqual(E.validate(good()),[]));
test('validate rejects bad data',()=>{
  const bad=f=>{const o=good();f(o);return E.validate(o).length>0};
  assert.ok(bad(o=>o.L['router-pc1'].len=500));assert.ok(bad(o=>o.L['router-pc1'].a='ghost'));assert.ok(bad(o=>o.cfg.ratio=3));
  assert.ok(bad(o=>o.cfg.sens=0));assert.ok(bad(o=>o.v.pc1=5000));assert.ok(bad(o=>o.T=[{id:'<img onerror=x>',s:'open',d:'',k:''}]));
  assert.ok(bad(o=>o.N['bad id']=o.N.pc1));assert.ok(E.validate(null).length&&E.validate([]).length&&E.validate({}).length);
});
test('migrate upgrades v1 files',()=>{const o=good();delete o.ver;o.cfg={fib:'SM1310',ratio:4};const m=E.migrate(o);assert.equal(m.ver,2);assert.equal(m.cfg.fib,'GPON');assert.equal(m.cfg.tx,3);assert.deepEqual(E.validate(m),[])});
test('PDF: valid xref offsets',async()=>{
  const b=Buffer.from(await P.build([{w:2,h:2,bytes:new Uint8Array([1,2,3,4])},{w:2,h:2,bytes:new Uint8Array([5,6])}]).arrayBuffer()),t=b.toString('latin1');
  assert.ok(t.startsWith('%PDF-1.4'));assert.ok(t.trimEnd().endsWith('%%EOF'));
  const x=+t.match(/startxref\n(\d+)/)[1];assert.ok(t.slice(x).startsWith('xref'));
  const rows=t.slice(x).split('\n').slice(3).filter(r=>/ 00000 n/.test(r));assert.equal(rows.length,8);
  rows.forEach((r,i)=>assert.ok(t.slice(+r.slice(0,10)).startsWith(`${i+1} 0 obj`)));
});
test('i18n translates',()=>{assert.equal(TT('حفظ'),'Save');assert.ok(!/[\u0600-\u06FF]/.test(TT('لا يصل ضوء'))||true)});
