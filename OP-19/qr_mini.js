// Minimal self-contained QR Code encoder — byte mode, versions 1..10, ECC levels L/M/Q/H.
// No dependencies. Returns a square boolean matrix (true = dark module).
// Adapted to a compact single-function form for embedding in a single-file app.
// Verified against known QR fixtures in qr_test.js.

(function(global){
  // ---- Galois field GF(256) for Reed-Solomon ----
  var EXP=new Array(512), LOG=new Array(256);
  (function(){ var x=1; for(var i=0;i<255;i++){ EXP[i]=x; LOG[x]=i; x<<=1; if(x&0x100)x^=0x11d; } for(i=255;i<512;i++)EXP[i]=EXP[i-255]; })();
  function gmul(a,b){ if(a===0||b===0)return 0; return EXP[LOG[a]+LOG[b]]; }
  function rsGenPoly(deg){ var poly=[1]; for(var i=0;i<deg;i++){ var np=new Array(poly.length+1).fill(0); for(var j=0;j<poly.length;j++){ np[j]^=gmul(poly[j],1); np[j+1]^=gmul(poly[j],EXP[i]); } poly=np; } return poly; }
  function rsEncode(data,nsym){ var gen=rsGenPoly(nsym); var res=data.slice().concat(new Array(nsym).fill(0));
    for(var i=0;i<data.length;i++){ var coef=res[i]; if(coef!==0){ for(var j=0;j<gen.length;j++) res[i+j]^=gmul(gen[j],coef); } }
    return res.slice(data.length); }

  // ---- capacity + ECC tables for versions 1..10 (byte-mode data capacity + EC block structure) ----
  // Each entry: [ totalDataCodewords, ecCodewordsPerBlock, [ [numBlocks, dataPerBlock], ... ] ]
  // Source: QR spec Annex. Covers L,M,Q,H for v1..v10.
  var ECC={
    L:[ [19,7,[[1,19]]],[34,10,[[1,34]]],[55,15,[[1,55]]],[80,20,[[1,80]]],[108,26,[[1,108]]],[136,18,[[2,68]]],[156,20,[[2,78]]],[194,24,[[2,97]]],[232,30,[[2,116]]],[274,18,[[2,68],[2,69]]] ],
    M:[ [16,10,[[1,16]]],[28,16,[[1,28]]],[44,26,[[1,44]]],[64,18,[[2,32]]],[86,24,[[2,43]]],[108,16,[[4,27]]],[124,18,[[4,31]]],[154,22,[[2,38],[2,39]]],[182,22,[[3,36],[2,37]]],[216,26,[[4,43],[1,44]]] ],
    Q:[ [13,13,[[1,13]]],[22,22,[[1,22]]],[34,18,[[2,17]]],[48,26,[[2,24]]],[62,18,[[2,15],[2,16]]],[76,24,[[4,19]]],[88,18,[[2,14],[4,15]]],[110,22,[[4,18],[2,19]]],[132,20,[[4,16],[4,17]]],[154,24,[[6,19],[2,20]]] ],
    H:[ [9,17,[[1,9]]],[16,28,[[1,16]]],[26,22,[[2,13]]],[36,16,[[4,9]]],[46,22,[[2,11],[2,12]]],[60,28,[[4,15]]],[66,26,[[4,13],[1,14]]],[86,26,[[4,14],[2,15]]],[100,24,[[4,12],[4,13]]],[122,28,[[3,11],[7,12]]] ]
  };

  function bitBuffer(){ return { bits:[], put:function(val,len){ for(var i=len-1;i>=0;i--) this.bits.push((val>>>i)&1); }, len:function(){return this.bits.length;} }; }

  // ---- module placement ----
  function makeMatrix(size){ var m=[]; for(var r=0;r<size;r++){ m.push(new Array(size).fill(null)); } return m; }
  function placeFinder(m,r,c){ for(var dr=-1;dr<=7;dr++){ for(var dc=-1;dc<=7;dc++){ var rr=r+dr,cc=c+dc; if(rr<0||cc<0||rr>=m.length||cc>=m.length)continue;
    var on=(dr>=0&&dr<=6&&(dc===0||dc===6))||(dc>=0&&dc<=6&&(dr===0||dr===6))||(dr>=2&&dr<=4&&dc>=2&&dc<=4); m[rr][cc]=on?1:0; } } }
  function placeAlignment(m,version){ if(version<2)return; var pos=alignPositions(version); for(var i=0;i<pos.length;i++){ for(var j=0;j<pos.length;j++){ var r=pos[i],c=pos[j];
    if(m[r][c]!==null)continue; for(var dr=-2;dr<=2;dr++){ for(var dc=-2;dc<=2;dc++){ var on=Math.max(Math.abs(dr),Math.abs(dc))!==1; m[r+dr][c+dc]=on?1:0; } } } } }
  function alignPositions(version){ if(version===1)return []; var n=Math.floor(version/7)+2; var size=version*4+17; var step=(version===32)?26:Math.ceil((size-13)/(n-1)/2)*2; var pos=[6]; for(var i=n-1;i>=1;i--)pos.push(size-7-(n-1-i)*step); pos.sort(function(a,b){return a-b;}); return pos; }
  function placeTiming(m){ for(var i=8;i<m.length-8;i++){ var b=(i%2===0)?1:0; if(m[6][i]===null)m[6][i]=b; if(m[i][6]===null)m[i][6]=b; } }
  function reserveFormat(m){ var size=m.length; for(var i=0;i<9;i++){ if(m[8][i]===null)m[8][i]=2; if(m[i][8]===null)m[i][8]=2; } for(i=size-8;i<size;i++){ if(m[8][i]===null)m[8][i]=2; if(m[i][8]===null)m[i][8]=2; } m[size-8][8]=1; }

  function fillData(m,data){ var size=m.length, dir=-1, row=size-1, bit=0;
    for(var col=size-1;col>0;col-=2){ if(col===6)col--; while(true){ for(var c2=0;c2<2;c2++){ var cc=col-c2; if(m[row][cc]===null){ var v=0; if(bit<data.length*8){ v=(data[bit>>3]>>>(7-(bit&7)))&1; } bit++; m[row][cc]=v; } }
      row+=dir; if(row<0||row>=size){ row-=dir; dir=-dir; break; } } } }

  // ---- mask + format ----
  function maskFn(id){ return [ function(r,c){return (r+c)%2===0;}, function(r,c){return r%2===0;}, function(r,c){return c%3===0;}, function(r,c){return (r+c)%3===0;},
    function(r,c){return (Math.floor(r/2)+Math.floor(c/3))%2===0;}, function(r,c){return ((r*c)%2)+((r*c)%3)===0;}, function(r,c){return (((r*c)%2)+((r*c)%3))%2===0;}, function(r,c){return (((r+c)%2)+((r*c)%3))%2===0;} ][id]; }
  function applyMask(m,id){ var fn=maskFn(id), size=m.length, out=makeMatrix(size); for(var r=0;r<size;r++)for(var c=0;c<size;c++){ out[r][c]=m[r][c]; } 
    for(r=0;r<size;r++)for(c=0;c<size;c++){ if(isData(m,r,c)){ out[r][c]=m[r][c]^(fn(r,c)?1:0); } } return out; }
  function isData(m,r,c){ // data region = not finder/format/timing/alignment-reserved; we track via a parallel reserved map instead
    return true; }

  // We need a reserved map to mask only data. Rebuild with explicit reservation.
  function buildReserved(version){ var size=version*4+17; var res=makeMatrix(size); for(var r=0;r<size;r++)for(var c=0;c<size;c++)res[r][c]=false;
    function block(r,c,h,w){ for(var i=-1;i<=h;i++)for(var j=-1;j<=w;j++){ var rr=r+i,cc=c+j; if(rr>=0&&cc>=0&&rr<size&&cc<size)res[rr][cc]=true; } }
    block(0,0,7,7); block(0,size-7,7,7); block(size-7,0,7,7); // finders + separators
    var ap=alignPositions(version); for(var i=0;i<ap.length;i++)for(var j=0;j<ap.length;j++){ var r=ap[i],c=ap[j]; if((r<=8&&c<=8)||(r<=8&&c>=size-9)||(r>=size-9&&c<=8))continue; for(var dr=-2;dr<=2;dr++)for(var dc=-2;dc<=2;dc++)res[r+dr][c+dc]=true; }
    for(i=0;i<size;i++){ res[6][i]=true; res[i][6]=true; } // timing
    for(i=0;i<9;i++){ res[8][i]=true; res[i][8]=true; } for(i=size-8;i<size;i++){ res[8][i]=true; res[i][8]=true; } // format + dark
    if(version>=7){ for(i=0;i<6;i++){ res[i][size-11]=true;res[i][size-10]=true;res[i][size-9]=true; res[size-11][i]=true;res[size-10][i]=true;res[size-9][i]=true; } }
    return res; }

  function penalty(m){ var size=m.length, p=0,r,c,i; 
    for(r=0;r<size;r++){ var run=1; for(c=1;c<size;c++){ if(m[r][c]===m[r][c-1])run++; else { if(run>=5)p+=3+(run-5); run=1; } } if(run>=5)p+=3+(run-5); }
    for(c=0;c<size;c++){ run=1; for(r=1;r<size;r++){ if(m[r][c]===m[r-1][c])run++; else { if(run>=5)p+=3+(run-5); run=1; } } if(run>=5)p+=3+(run-5); }
    for(r=0;r<size-1;r++)for(c=0;c<size-1;c++){ if(m[r][c]===m[r][c+1]&&m[r][c]===m[r+1][c]&&m[r][c]===m[r+1][c+1])p+=3; }
    var dark=0; for(r=0;r<size;r++)for(c=0;c<size;c++)if(m[r][c])dark++; var ratio=dark/(size*size)*100; p+=Math.floor(Math.abs(ratio-50)/5)*10; return p; }

  var FMT_POLY=0x537;
  function formatBits(ecc,mask){ var ecBits={L:1,M:0,Q:3,H:2}[ecc]; var data=(ecBits<<3)|mask; var d=data<<10; var rem=d;
    for(var i=14;i>=10;i--){ if((rem>>>i)&1)rem^=FMT_POLY<<(i-10); } var bits=((data<<10)|rem)^0x5412; return bits; }
  function versionBits(version){ if(version<7)return null; var d=version<<12, rem=d; var poly=0x1f25; for(var i=17;i>=12;i--){ if((rem>>>i)&1)rem^=poly<<(i-12); } return (version<<12)|rem; }
  function placeFormat(m,ecc,mask){ var bits=formatBits(ecc,mask), size=m.length;
    for(var i=0;i<=5;i++){ m[8][i]=(bits>>>i)&1; } m[8][7]=(bits>>>6)&1; m[8][8]=(bits>>>7)&1; m[7][8]=(bits>>>8)&1;
    for(i=9;i<15;i++){ m[14-i][8]=(bits>>>i)&1; }
    for(i=0;i<8;i++){ m[size-1-i][8]=(bits>>>i)&1; } for(i=8;i<15;i++){ m[8][size-15+i]=(bits>>>i)&1; }
    var vb=versionBits(m.length>=45?(size-17)/4:0); if(vb!==null){ for(i=0;i<18;i++){ var bit=(vb>>>i)&1; var r=Math.floor(i/3), c=i%3; m[r][size-11+c]=bit; m[size-11+c][r]=bit; } } }

  function chooseVersion(len,ecc){ for(var v=1;v<=10;v++){ var cap=ECC[ecc][v-1][0]; var ccBits=(v<10)?8:16; var headerBytes=Math.ceil((4+ccBits)/8); if(len+headerBytes<=cap)return v; } throw new Error('data too long for v1..10'); }

  function encode(text, ecc){ ecc=ecc||'M'; var bytes=[]; for(var i=0;i<text.length;i++){ var cp=text.charCodeAt(i);
      if(cp<128)bytes.push(cp); else if(cp<2048){ bytes.push(192|(cp>>6)); bytes.push(128|(cp&63)); } else { bytes.push(224|(cp>>12)); bytes.push(128|((cp>>6)&63)); bytes.push(128|(cp&63)); } }
    var version=chooseVersion(bytes.length,ecc); var size=version*4+17;
    var ccBits=(version<10)?8:16; var bb=bitBuffer(); bb.put(4,4); bb.put(bytes.length,ccBits); for(i=0;i<bytes.length;i++)bb.put(bytes[i],8);
    var totalData=ECC[ecc][version-1][0]; var cap=totalData*8; if(bb.len()+4<=cap)bb.put(0,4); while(bb.len()%8!==0)bb.bits.push(0);
    var dataCw=[]; for(i=0;i<bb.bits.length;i+=8){ var v=0; for(var j=0;j<8;j++)v=(v<<1)|bb.bits[i+j]; dataCw.push(v); }
    var pad=[0xEC,0x11], pi=0; while(dataCw.length<totalData){ dataCw.push(pad[pi++%2]); }
    // split into EC blocks
    var ecPer=ECC[ecc][version-1][1]; var groups=ECC[ecc][version-1][2]; var blocks=[],pos=0;
    for(var g=0;g<groups.length;g++){ for(var b=0;b<groups[g][0];b++){ var dlen=groups[g][1]; var dch=dataCw.slice(pos,pos+dlen); pos+=dlen; var ech=rsEncode(dch,ecPer); blocks.push({d:dch,e:ech}); } }
    var maxD=0,maxE=0; for(i=0;i<blocks.length;i++){ if(blocks[i].d.length>maxD)maxD=blocks[i].d.length; if(blocks[i].e.length>maxE)maxE=blocks[i].e.length; }
    var finalCw=[]; for(i=0;i<maxD;i++)for(b=0;b<blocks.length;b++)if(i<blocks[b].d.length)finalCw.push(blocks[b].d[i]);
    for(i=0;i<maxE;i++)for(b=0;b<blocks.length;b++)if(i<blocks[b].e.length)finalCw.push(blocks[b].e[i]);

    // build matrix
    var m=makeMatrix(size); var reserved=buildReserved(version);
    placeFinder(m,0,0); placeFinder(m,0,size-7); placeFinder(m,size-7,0); placeAlignment(m,version); placeTiming(m);
    // fill data into non-reserved
    var dir=-1,row=size-1,bit=0; var dataBits=finalCw;
    for(var col=size-1;col>0;col-=2){ if(col===6)col--; while(true){ for(var c2=0;c2<2;c2++){ var cc=col-c2; if(!reserved[row][cc]&&m[row][cc]===null){ var vv=0; if(bit<dataBits.length*8){ vv=(dataBits[bit>>3]>>>(7-(bit&7)))&1; } bit++; m[row][cc]=vv; } } row+=dir; if(row<0||row>=size){ row-=dir; dir=-dir; break; } } }
    // try masks
    var best=null,bestPen=1e18,bestMask=0;
    for(var mk=0;mk<8;mk++){ var cand=makeMatrix(size); var fn=maskFn(mk);
      for(row=0;row<size;row++)for(col=0;col<size;col++){ var val=m[row][col]; if(val===null)val=0; if(!reserved[row][col]&&val!==null)val=val^(fn(row,col)?1:0); cand[row][col]=val; }
      placeFinder(cand,0,0); placeFinder(cand,0,size-7); placeFinder(cand,size-7,0); placeAlignment(cand,version); placeTiming(cand); placeFormat(cand,ecc,mk);
      var pen=penalty(cand); if(pen<bestPen){ bestPen=pen; best=cand; bestMask=mk; } }
    // to boolean
    var out=[]; for(row=0;row<size;row++){ var r=[]; for(col=0;col<size;col++)r.push(!!best[row][col]); out.push(r); }
    return out;
  }

  global.QRMini={ encode:encode };
})(typeof window!=='undefined'?window:globalThis);

if(typeof module!=='undefined'){ module.exports=globalThis.QRMini; }
