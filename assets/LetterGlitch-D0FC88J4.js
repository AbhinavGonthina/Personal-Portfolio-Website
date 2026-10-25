import{r as j,j as Qe}from"./react-CJWZEPwJ.js";const et="ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",tt="ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, 'Liberation Mono', monospace",_t=["#ffffff","#61dca3"],Pt=["#18181b","#0f9f6e"],Ce=8,Lt=1.4,Dt=.2,kt=.1,It=48,Ut=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,Xt=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D uAtlas;
uniform sampler2D uState;
uniform ivec2 uCell;
uniform ivec2 uGrid;
uniform int uAtlasColumns;
uniform vec2 uResolution;
uniform vec2 uOrigin;
uniform vec3 uBase;
uniform float uBaseOpacity;
uniform vec3 uColors[8];
uniform float uEdge;
uniform float uCenter;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uPresence;
uniform float uReveal;
uniform float uTime;
uniform float uFlow;
uniform float uFlowScale;
uniform vec4 uBackground;
out vec4 outColor;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

float smoother(float x) {
  x = clamp(x, 0.0, 1.0);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) - uOrigin;
  ivec2 q = ivec2(floor(frag));
  ivec2 cell = q / uCell;
  vec4 color = vec4(0.0);
  if (all(greaterThanEqual(q, ivec2(0))) && all(lessThan(cell, uGrid))) {
    vec4 state = texelFetch(uState, cell, 0);
    int glyph = int(state.r * 255.0 + 0.5);
    ivec2 texel = ivec2(glyph % uAtlasColumns, glyph / uAtlasColumns) * uCell + (q - cell * uCell);
    float coverage = texelFetch(uAtlas, texel, 0).a;
    if (coverage > 0.0) {
      vec2 center = vec2(cell * uCell) + vec2(uCell) * 0.5 + uOrigin;
      float mask = 1.0;
      if (uEdge > 0.0) {
        vec2 edge = min(center, uResolution - center) / uEdge;
        mask = smoother(edge.x) * smoother(edge.y);
      }
      if (uCenter > 0.0) {
        vec2 room = max(abs(center - uResolution * 0.5) - uResolution * vec2(0.3, 0.24), 0.0);
        float soft = min(uResolution.x, uResolution.y) * 0.24;
        mask *= 1.0 - uCenter * (1.0 - smoother(length(room) / soft));
      }
      float seed = hash(vec2(cell) + 17.0);
      float rest = state.g * uBaseOpacity * (0.8 + 0.2 * sin(uTime * (0.5 + 1.2 * seed) + seed * 40.0));
      if (uFlow > 0.0) {
        vec2 p = center / uFlowScale;
        float n = 0.65 * noise(p + vec2(uTime * 0.05, uTime * 0.03)) + 0.35 * noise(p * 2.03 - vec2(uTime * 0.04, -uTime * 0.06));
        rest *= mix(1.0, 0.1 + 1.7 * smoothstep(0.25, 0.8, n), uFlow);
      }
      if (uPresence > 0.0) {
        float d = length(center - uPointer) / uRadius;
        float f = clamp(1.0 - d * d, 0.0, 1.0);
        rest = mix(rest, max(rest, uReveal * step(0.004, state.g)), f * f * uPresence);
      }
      float heat = state.b;
      rest = min(rest, 1.0) * (1.0 - heat);
      vec3 tint = uColors[int(state.a * 255.0 + 0.5)];
      float weight = coverage * mask;
      color = vec4((uBase * rest + tint * heat) * weight, (rest + heat) * weight);
    }
  }
  outColor = color + uBackground * (1.0 - color.a);
}`,S=(f,T,_)=>Math.min(_,Math.max(T,f)),Bt=f=>{const T=S(f,0,1);return T*T*T*(T*(T*6-15)+10)},nt=(f,T,_)=>{const M=f.createShader(T);return M?(f.shaderSource(M,_),f.compileShader(M),f.getShaderParameter(M,f.COMPILE_STATUS)?M:(f.deleteShader(M),null)):null},Ot=f=>{const T=nt(f,f.VERTEX_SHADER,Ut),_=nt(f,f.FRAGMENT_SHADER,Xt),M=f.createProgram();if(!T||!_||!M)return null;if(f.attachShader(M,T),f.attachShader(M,_),f.linkProgram(M),f.deleteShader(T),f.deleteShader(_),!f.getProgramParameter(M,f.LINK_STATUS))return f.deleteProgram(M),null;const ne={},pe=f.getProgramParameter(M,f.ACTIVE_UNIFORMS);for(let K=0;K<pe;K++){const oe=f.getActiveUniform(M,K);if(!oe)continue;const re=oe.name.replace(/\[0\]$/,"");ne[re]=f.getUniformLocation(M,re)}return{program:M,uniforms:ne}},Ht=({glitchColors:f,baseColor:T,characters:_=et,fontFamily:M=tt,fontSize:ne=14,spacing:pe=.6,density:K=.9,baseOpacity:oe=.16,glitchAmount:re=.5,speed:ot=1,smooth:rt=!0,interactive:at=!0,cursorRadius:st=140,clickEffect:ct="tear",flow:it=.5,edgeFade:lt=0,centerFade:ut=0,intro:ft=!0,lightMode:Fe=!1,backgroundColor:ht,dpr:mt,className:dt="",style:pt,...gt})=>{const Se=j.useRef(null),_e=j.useRef(null),ge=j.useRef(null),Pe={colors:((Array.isArray(f)&&f.length?f:null)||(Fe?Pt:_t)).slice(0,Ce),baseColor:T||(Fe?"#18181b":"#ffffff"),characters:_||et,fontFamily:M||tt,fontSize:S(ne,6,96),spacing:S(pe,0,2),density:S(K,0,1),baseOpacity:S(oe,0,1),glitchAmount:S(re,0,1),speed:Math.max(0,ot),smooth:rt,interactive:at,cursorRadius:Math.max(0,st),clickEffect:ct,flow:S(it,0,1),edgeFade:S(lt,0,.5),centerFade:S(ut,0,1),intro:ft,backgroundColor:ht,dpr:mt},y=j.useRef(Pe);return y.current=Pe,j.useEffect(()=>{const B=Se.current,E=_e.current,o=E?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!B||!E||!o)return;const ae=Ot(o);if(!ae)return;const d=ae.uniforms,Le=o.createVertexArray(),De=()=>{const t=o.createTexture();return o.bindTexture(o.TEXTURE_2D,t),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.NEAREST),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE),t},Me=De(),xe=De(),Mt=o.getParameter(o.MAX_TEXTURE_SIZE),se=document.createElement("canvas"),P=se.getContext("2d"),O=document.createElement("canvas").getContext("2d",{willReadFrequently:!0});if(!P)return;const ke=new Map,ve=t=>{const n=String(t),e=ke.get(n);if(e)return e;let a=[1,1,1];if(O){O.clearRect(0,0,1,1),O.fillStyle="#ffffff",O.fillStyle=n,O.fillRect(0,0,1,1);const[i,s,l]=O.getImageData(0,0,1,1).data;a=[i/255,s/255,l/255]}return ke.set(n,a),a},k=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,x={width:1,height:1,ratio:1},r={cols:0,rows:0,cellW:0,cellH:0,originX:0,originY:0,atlasColumns:1},c={x:0,y:0,sx:0,sy:0,inside:!1,presence:0,stir:0,fresh:!0},I=[],ce=new Float32Array(Ce*3),Ie=new Set;let J=[0],ie="",Ue="",le=1,A=0,w=new Uint8Array(0),G=new Float32Array(0),W=new Float32Array(0),D=new Float32Array(0),Z=new Float32Array(0),Q=new Float32Array(0),H=new Float32Array(0),ue=new Float32Array(0),we=new Float32Array(0),N=new Float32Array(0),U=new Int32Array(0),q=new Int32Array(0),Y=0,fe=y.current.intro&&!k,Xe=0,Be=0,ye=-1,Ee=0,Te=0,Re=0,F=!0,ee=0,z=0,he=!0,Oe=!0;const te=()=>J[Math.random()*J.length|0],X=()=>Math.random()*le|0,Ae=(t,n=1)=>ue[t]<y.current.density?Math.round(we[t]*255*n):0,me=(t,n)=>{const e=Math.floor((t-r.originX)/r.cellW),a=Math.floor((n-r.originY)/r.cellH);return e<0||a<0||e>=r.cols||a>=r.rows?-1:a*r.cols+e},V=(t,n,e,a,i,s=0)=>{if(U[t]<0){U[t]=Y,q[Y++]=t,G[t]=0,D[t]=e,W[t]=n,Z[t]=a,Q[t]=0,H[t]=s,w[t*4+3]=i;return}G[t]<.15&&(w[t*4+3]=i),W[t]=D[t]>0?Math.max(W[t],n):n,D[t]=Math.max(D[t],e),Z[t]=Math.max(Z[t],a),H[t]=Math.min(H[t],s)},xt=t=>{const n=q[t],e=q[--Y];q[t]=e,U[e]=t,U[n]=-1,G[n]=0,w[n*4+2]=0},vt=()=>{const t=y.current,n=t.fontSize*x.ratio,e=`${n}px ${t.fontFamily}`,a=Array.from(t.characters),i=Array.from(new Set(a)).slice(0,256);P.font=e;let s=1;i.forEach(v=>{s=Math.max(s,P.measureText(v).width)});const l=P.measureText("M"),p=Math.max(2,Math.ceil(s+n*t.spacing)),R=Math.max(2,Math.ceil(n*(.95+t.spacing))),u=Math.max(1,Math.min(i.length,Math.floor(Mt/p)));se.width=u*p,se.height=Math.ceil(i.length/u)*R,P.font=e,P.textAlign="center",P.textBaseline="alphabetic",P.fillStyle="#ffffff";const m=R/2+(l.actualBoundingBoxAscent-l.actualBoundingBoxDescent)/2;i.forEach((v,$)=>{P.fillText(v,$%u*p+p/2,Math.floor($/u)*R+m)}),o.bindTexture(o.TEXTURE_2D,Me),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,se);const h=new Map(i.map((v,$)=>[v,$])),g=a.map(v=>h.get(v)).filter(v=>v!==void 0),b=g.length!==J.length||g.some((v,$)=>v!==J[$]);J=g.length?g:[0];const C=p!==r.cellW||R!==r.cellH;return r.cellW=p,r.cellH=R,r.atlasColumns=u,!Ie.has(e)&&document.fonts?.load&&(Ie.add(e),document.fonts.load(e,t.characters).then(()=>{Oe&&(ie="",L())}).catch(()=>{})),{resized:C,charsChanged:b}},wt=(t,n,e,a)=>{const i=(t+.5)/e-.5,s=(n+.5)/a-.5,l=Math.min(1,Math.hypot(i,s*.8)*1.6);return Lt*(.3*l+.7*Math.random()**1.3)},Ge=()=>{const t=Math.ceil(E.width/r.cellW)+1,n=Math.ceil(E.height/r.cellH)+1;if(r.originX=Math.floor((E.width-t*r.cellW)/2),r.originY=Math.floor((E.height-n*r.cellH)/2),t===r.cols&&n===r.rows)return;const e=t*n,a=new Uint8Array(e*4),i=new Float32Array(e),s=new Float32Array(e),l=new Float32Array(e),p=Math.floor((r.cols-t)/2),R=Math.floor((r.rows-n)/2);for(let u=0;u<n;u++)for(let m=0;m<t;m++){const h=u*t+m,g=m+p,b=u+R;if(g>=0&&b>=0&&g<r.cols&&b<r.rows){const C=b*r.cols+g;a[h*4]=w[C*4],a[h*4+1]=w[C*4+1],i[h]=ue[C],s[h]=we[C],l[h]=N[C]}else a[h*4]=te(),i[h]=Math.random(),s[h]=.55+.45*Math.random(),l[h]=fe?wt(m,u,t,n):-1}r.cols=t,r.rows=n,A=e,w=a,ue=i,we=s,N=l,G=new Float32Array(e),W=new Float32Array(e),D=new Float32Array(e),Z=new Float32Array(e),Q=new Float32Array(e),H=new Float32Array(e),U=new Int32Array(e).fill(-1),q=new Int32Array(e),Y=0,I.length=0;for(let u=0;u<e;u++)w[u*4+1]=N[u]>=0?0:Ae(u);ye=y.current.density,o.bindTexture(o.TEXTURE_2D,xe),o.texImage2D(o.TEXTURE_2D,0,o.RGBA8,t,n,0,o.RGBA,o.UNSIGNED_BYTE,w),F=!1},We=()=>{const t=y.current,n=`${t.fontSize*x.ratio}|${t.fontFamily}|${t.spacing}|${t.characters}`;if(n===ie)return;ie=n;const{resized:e,charsChanged:a}=vt();if((e||!r.cols)&&Ge(),a){for(let i=0;i<A;i++)w[i*4]=te();F=!0}},yt=()=>{const t=y.current,n=t.colors.join(",");if(n!==Ue){Ue=n,le=Math.max(1,t.colors.length);for(let e=0;e<Ce;e++){const a=ve(t.colors[Math.min(e,le-1)]??"#ffffff");ce[e*3]=a[0],ce[e*3+1]=a[1],ce[e*3+2]=a[2]}for(let e=0;e<A;e++)w[e*4+3]>=le&&(w[e*4+3]=X());F=!0}},be=t=>{I.length<It&&I.push({carry:0,after:0,wiggle:0,branch:0,...t})},Et=(t,n)=>{const e=me(t,n);if(e<0)return;const a=Math.floor(e/r.cols),i=r.cols*r.cellW;for(let s=-2;s<=2;s++){const l=a+s;if(l<0||l>=r.rows)continue;const p=1-Math.abs(s)/3;if(s!==0&&Math.random()>.3+.6*p)continue;const R=X(),u=r.originY+(l+.5)*r.cellH,m=(Math.random()-.5)*6*r.cellW*(1-p);[0,Math.PI].forEach(h=>{const g=i*(.12+.5*p*(.4+.6*Math.random()));be({x:t+m,y:u,angle:h,life:g,span:g,speed:(2200+Math.random()*1200)*x.ratio,after:Math.abs(s)*.035+Math.random()*.03,color:R})})}},Tt=(t,n)=>{const e=Math.min(x.width,x.height)*x.ratio,a=5+(Math.random()*3|0),i=Math.random()*Math.PI*2;for(let s=0;s<a;s++){const l=e*(.25+Math.random()*.3);be({x:t,y:n,angle:i+s/a*Math.PI*2+(Math.random()-.5)*.4,life:l,span:l,speed:(700+Math.random()*400)*x.ratio,wiggle:.2,branch:.03,color:X()})}},Rt=(t,n)=>{const e=me(t,n);e<0||(V(e,1,.08,.8,X()),y.current.clickEffect==="burst"?Tt(t,n):Et(t,n))},At=t=>{for(let n=I.length-1;n>=0;n--){const e=I[n];if(e.after>0){e.after-=t;continue}const a=Math.max(1,Math.abs(Math.cos(e.angle))*r.cellW+Math.abs(Math.sin(e.angle))*r.cellH*.6);for(e.carry+=e.speed*t;e.carry>=a&&e.life>0;){e.carry-=a,e.life-=a,e.angle+=(Math.random()-.5)*e.wiggle,e.x+=Math.cos(e.angle)*a,e.y+=Math.sin(e.angle)*a;const i=me(e.x,e.y);if(i<0){e.life=0;break}const s=e.life/e.span;if(V(i,.5+.5*s,.03+Math.random()*.05,.5+.5*s,e.color),e.branch&&Math.random()<e.branch){const l=Math.random()<.5?-1:1,p=e.life*(.45+Math.random()*.3);be({x:e.x,y:e.y,angle:e.angle+l*(.5+Math.random()*.5),life:p,span:e.span,speed:e.speed,wiggle:e.wiggle,color:e.color})}}e.life<=0&&I.splice(n,1)}},bt=t=>{const n=y.current;if(k||n.speed<=0||!A)return;Ee+=A*Dt*n.speed*t;let e=Math.min(A,Ee|0);for(Ee-=e;e-- >0;){const s=Math.random()*A|0;U[s]<0&&(w[s*4]=te(),F=!0)}const a=Math.max(n.speed,.2);Te+=A*n.glitchAmount**1.6*kt*n.speed*t;let i=Math.min(A,Te|0);for(Te-=i;i-- >0;){const s=Math.random()*A|0,l=X(),p=.45+.55*Math.random(),R=(.04+Math.random()*.26)/a,u=(.45+Math.random()*.6)/a,m=Math.random();if(m<.24){const h=s%r.cols,g=m<.015,b=Math.min(r.cols-h,g?10+(Math.random()*24|0):2+(Math.random()*7|0)),C=(g?.012:.028)/a;for(let v=0;v<b;v++)V(s+v,p,R,u,l,v*C)}else V(s,p,R,u,l)}},Ct=t=>{const n=y.current;if(c.presence<.02||k||!A)return;const e=n.cursorRadius*x.ratio;if(e<1)return;const a=Math.max(0,Math.floor((c.sx-e-r.originX)/r.cellW)),i=Math.min(r.cols-1,Math.floor((c.sx+e-r.originX)/r.cellW)),s=Math.max(0,Math.floor((c.sy-e-r.originY)/r.cellH)),l=Math.min(r.rows-1,Math.floor((c.sy+e-r.originY)/r.cellH)),p=c.presence*(3+9*c.stir)*t;for(let m=s;m<=l;m++){const h=(r.originY+(m+.5)*r.cellH-c.sy)/e;for(let g=a;g<=i;g++){const b=(r.originX+(g+.5)*r.cellW-c.sx)/e,C=b*b+h*h;if(C>=1)continue;const v=m*r.cols+g;U[v]<0&&Math.random()<(1-C)*(1-C)*p&&(w[v*4]=te(),F=!0)}}const R=Math.PI*e*e/(r.cellW*r.cellH);Re+=R*c.presence*(.15+4*c.stir)*t;let u=Math.min(512,Re|0);for(Re-=u;u-- >0;){const m=Math.random()*Math.PI*2,h=Math.sqrt(Math.random()),g=(1-h*h)**2;if(Math.random()>g)continue;const b=me(c.sx+Math.cos(m)*h*e,c.sy+Math.sin(m)*h*e);b<0||V(b,(.3+.7*Math.random())*(.45+.55*c.stir),.02+Math.random()*.08,.35+Math.random()*.4,X())}},Ft=t=>{const n=y.current,e=Math.max(n.speed,.5),a=1-Math.exp(-t/.05);for(let i=0;i<Y;){const s=q[i];if(H[s]>0){H[s]-=t,i++;continue}let l=G[s];if(D[s]>0?(D[s]-=t,l=n.smooth?l+(W[s]-l)*a:W[s]):l=n.smooth?l*Math.exp(-t*4/Math.max(Z[s],.05)):0,l<.012&&D[s]<=0){xt(i),F=!0;continue}G[s]=l,Q[s]-=t,Q[s]<=0&&(w[s*4]=te(),Q[s]=(.045+.45*(1-l)*(1-l))*(.6+.8*Math.random())/e),w[s*4+2]=Math.round(l*255),F=!0,i++}},St=t=>{if(!fe)return;const n=y.current;let e=!1;for(let a=0;a<A;a++){const i=N[a];if(i<0)continue;const s=Xe-i;if(s<0){e=!0;continue}s<t&&Math.random()<(ue[a]<n.density?.45:.12)&&V(a,.4+.5*Math.random(),.02,.35+Math.random()*.35,X());const l=n.smooth?Bt(s/.35):1;w[a*4+1]=Ae(a,l),l>=1?N[a]=-1:e=!0}F=!0,e||(fe=!1)},He=t=>{if(ee=0,!he||document.hidden)return;const n=y.current,e=z?S((t-z)/1e3,5e-4,.05):1/60;if(z=t,Xe+=e,k||(Be+=e*n.speed),We(),yt(),n.density!==ye){ye=n.density;for(let u=0;u<A;u++)N[u]<0&&(w[u*4+1]=Ae(u));F=!0}const a=n.interactive&&c.inside&&!k?1:0;c.presence+=(a-c.presence)*(1-Math.exp(-e/.25)),Math.abs(a-c.presence)<.002&&(c.presence=a);const i=c.sx,s=c.sy,l=1-Math.exp(-e/.07);c.sx+=(c.x-c.sx)*l,c.sy+=(c.y-c.sy)*l;const p=Math.hypot(c.sx-i,c.sy-s)/x.ratio/e;if(c.stir+=(S(p/1400,0,1)-c.stir)*(1-Math.exp(-e/.12)),c.stir<.001&&(c.stir=0),St(e),bt(e),Ct(e),At(e),Ft(e),o.viewport(0,0,E.width,E.height),o.disable(o.BLEND),o.useProgram(ae.program),o.bindVertexArray(Le),o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,xe),F&&(o.texSubImage2D(o.TEXTURE_2D,0,0,0,r.cols,r.rows,o.RGBA,o.UNSIGNED_BYTE,w),F=!1),o.uniform1i(d.uState,1),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,Me),o.uniform1i(d.uAtlas,0),o.uniform2i(d.uCell,r.cellW,r.cellH),o.uniform2i(d.uGrid,r.cols,r.rows),o.uniform1i(d.uAtlasColumns,r.atlasColumns),o.uniform2f(d.uResolution,E.width,E.height),o.uniform2f(d.uOrigin,r.originX,r.originY),o.uniform3fv(d.uBase,ve(n.baseColor)),o.uniform1f(d.uBaseOpacity,n.baseOpacity),o.uniform3fv(d.uColors,ce),o.uniform1f(d.uEdge,n.edgeFade*Math.min(E.width,E.height)),o.uniform1f(d.uCenter,n.centerFade),o.uniform2f(d.uPointer,c.sx,c.sy),o.uniform1f(d.uRadius,Math.max(1,n.cursorRadius*x.ratio)),o.uniform1f(d.uPresence,c.presence),o.uniform1f(d.uReveal,Math.min(1,n.baseOpacity*3.5)),o.uniform1f(d.uTime,Be),o.uniform1f(d.uFlow,n.flow),o.uniform1f(d.uFlowScale,Math.max(E.width,E.height)*.32),n.backgroundColor){const[u,m,h]=ve(n.backgroundColor);o.uniform4f(d.uBackground,u,m,h,1)}else o.uniform4f(d.uBackground,0,0,0,0);o.drawArrays(o.TRIANGLES,0,3),!k&&n.speed>0||Y>0||I.length>0||fe||c.presence!==0&&c.presence!==1||c.stir>0?ee=requestAnimationFrame(He):z=0};function L(){!ee&&he&&!document.hidden&&(ee=requestAnimationFrame(He))}const Ne=()=>{const t=y.current;x.width=Math.max(1,B.clientWidth),x.height=Math.max(1,B.clientHeight),x.ratio=Math.min(t.dpr||window.devicePixelRatio||1,2),E.width=Math.max(1,Math.round(x.width*x.ratio)),E.height=Math.max(1,Math.round(x.height*x.ratio)),We(),r.cols&&Ge(),L()},qe=t=>{const n=B.getBoundingClientRect(),e=t.clientX-n.left,a=t.clientY-n.top;c.inside=e>=0&&a>=0&&e<=n.width&&a<=n.height,c.x=e*x.ratio,c.y=a*x.ratio,(c.fresh||c.presence<.02)&&(c.sx=c.x,c.sy=c.y,c.fresh=!1)},Ye=t=>{qe(t),L()},ze=t=>{qe(t);const n=y.current;!c.inside||n.clickEffect==="none"||k||!A||(Rt(c.x,c.y),L())},de=t=>{t.pointerType!=="mouse"&&(c.inside=!1)},Ve=()=>{c.inside=!1,L()},$e=()=>{z=0,L()},je=()=>{ie="",L()},Ke=new ResizeObserver(Ne);Ke.observe(B);const Je=new IntersectionObserver(t=>{he=t.some(n=>n.isIntersecting),he&&(z=0,L())});Je.observe(B);const Ze=!!y.current?.interactive;return Ze&&(window.addEventListener("pointermove",Ye,{passive:!0}),window.addEventListener("pointerdown",ze,{passive:!0}),window.addEventListener("pointerup",de,{passive:!0}),window.addEventListener("pointercancel",de,{passive:!0}),document.documentElement.addEventListener("pointerleave",Ve)),document.addEventListener("visibilitychange",$e),document.fonts?.addEventListener?.("loadingdone",je),Ne(),ge.current=L,()=>{Oe=!1,cancelAnimationFrame(ee),ge.current=null,Ke.disconnect(),Je.disconnect(),Ze&&(window.removeEventListener("pointermove",Ye),window.removeEventListener("pointerdown",ze),window.removeEventListener("pointerup",de),window.removeEventListener("pointercancel",de),document.documentElement.removeEventListener("pointerleave",Ve)),document.removeEventListener("visibilitychange",$e),document.fonts?.removeEventListener?.("loadingdone",je),o.deleteTexture(Me),o.deleteTexture(xe),o.deleteVertexArray(Le),o.deleteProgram(ae.program)}},[]),j.useEffect(()=>{ge.current?.()}),Qe.jsx("div",{ref:Se,className:["relative h-full w-full overflow-hidden",dt].filter(Boolean).join(" "),style:pt,...gt,children:Qe.jsx("canvas",{ref:_e,className:"absolute inset-0 block h-full w-full","aria-hidden":"true"})})};export{Ht as default};
