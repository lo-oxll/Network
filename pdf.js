(function(r,f){if(typeof module==='object')module.exports=f();else r.PDFLib=f()})(this,function(){
/* pages: [{w,h,bytes:Uint8Array(JPEG)}] -> PDF Blob (A4, one full-page image per page; no libraries) */
function build(pages){
  const enc=new TextEncoder(),parts=[],off=[],n=pages.length;let len=0;
  const put=x=>{const b=typeof x==='string'?enc.encode(x):x;parts.push(b);len+=b.length},obj=(i,x)=>{off[i]=len;put(`${i} 0 obj\n${x}\nendobj\n`)};
  put('%PDF-1.4\n');obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,`<</Type/Pages/Count ${n}/Kids[${pages.map((_,i)=>`${3+i*3} 0 R`).join(' ')}]>>`);
  pages.forEach((c,i)=>{const p=3+i*3,cn='q 595 0 0 842 0 0 cm /Im Do Q';
    obj(p,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</XObject<</Im ${p+2} 0 R>>>>/Contents ${p+1} 0 R>>`);
    obj(p+1,`<</Length ${cn.length}>>\nstream\n${cn}\nendstream`);
    off[p+2]=len;put(`${p+2} 0 obj\n<</Type/XObject/Subtype/Image/Width ${c.w}/Height ${c.h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${c.bytes.length}>>\nstream\n`);put(c.bytes);put('\nendstream\nendobj\n')});
  const tot=3+n*3,xr=len;put(`xref\n0 ${tot}\n0000000000 65535 f \n`);for(let i=1;i<tot;i++)put(String(off[i]).padStart(10,'0')+' 00000 n \n');
  put(`trailer\n<</Size ${tot}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`);return new Blob(parts,{type:'application/pdf'});
}
return{build};
});
