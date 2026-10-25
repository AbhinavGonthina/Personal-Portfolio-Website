import{r as V,j as Me}from"./react-CJWZEPwJ.js";const Ge=12e5,We=7e4,ze=16,q=256,Ye=`#version 300 es
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 vUv;
void main() {
  vUv = corners[gl_VertexID] * 0.5 + 0.5;
  gl_Position = vec4(corners[gl_VertexID], 0.0, 1.0);
}`,I=`#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv;
out vec4 fragColor;
uniform vec2 uTexel;
`,$e=`${I}
uniform sampler2D uVelocity;
uniform vec2 uSize;
uniform vec4 uSegment;
uniform vec2 uForce;
uniform float uRadius;

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 ab = b - a;
  float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-4), 0.0, 1.0);
  return length(p - a - ab * t);
}

void main() {
  float d = segment(vUv * uSize, uSegment.xy, uSegment.zw) / uRadius;
  vec2 velocity = texture(uVelocity, vUv).xy + uForce * exp(-d * d * 6.0);
  fragColor = vec4(velocity, 0.0, 1.0);
}`,je=`${I}
uniform sampler2D uVelocity;
uniform float uAmount;

void main() {
  vec2 center = texture(uVelocity, vUv).xy;
  vec2 around =
    texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).xy +
    texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).xy +
    texture(uVelocity, vUv - vec2(0.0, uTexel.y)).xy +
    texture(uVelocity, vUv + vec2(0.0, uTexel.y)).xy;
  fragColor = vec4(mix(center, around * 0.25, uAmount), 0.0, 1.0);
}`,He=`${I}
uniform sampler2D uVelocity;
uniform float uWalls;

void main() {
  vec2 center = texture(uVelocity, vUv).xy;
  float left = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float right = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float down = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float up = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  float edge = uWalls > 0.5 ? -1.0 : 0.0;
  if (vUv.x - uTexel.x < 0.0) left = edge * center.x;
  if (vUv.x + uTexel.x > 1.0) right = edge * center.x;
  if (vUv.y - uTexel.y < 0.0) down = edge * center.y;
  if (vUv.y + uTexel.y > 1.0) up = edge * center.y;
  fragColor = vec4(0.5 * (right - left + up - down), 0.0, 0.0, 1.0);
}`,_e=`
uniform float uWalls;

float pressureAt(sampler2D field, vec2 uv) {
  vec2 inside = step(vec2(0.0), uv) * step(uv, vec2(1.0));
  return texture(field, uv).x * mix(inside.x * inside.y, 1.0, uWalls);
}
`,Ke=`${I}
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
${_e}
void main() {
  vec2 reach = uTexel * 2.0;
  float sum =
    pressureAt(uPressure, vUv - vec2(reach.x, 0.0)) +
    pressureAt(uPressure, vUv + vec2(reach.x, 0.0)) +
    pressureAt(uPressure, vUv - vec2(0.0, reach.y)) +
    pressureAt(uPressure, vUv + vec2(0.0, reach.y));
  fragColor = vec4(sum * 0.25 - texture(uDivergence, vUv).x, 0.0, 0.0, 1.0);
}`,qe=`${I}
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
${_e}
void main() {
  float left = pressureAt(uPressure, vUv - vec2(uTexel.x, 0.0));
  float right = pressureAt(uPressure, vUv + vec2(uTexel.x, 0.0));
  float down = pressureAt(uPressure, vUv - vec2(0.0, uTexel.y));
  float up = pressureAt(uPressure, vUv + vec2(0.0, uTexel.y));
  vec2 velocity = texture(uVelocity, vUv).xy - 0.5 * vec2(right - left, up - down);
  fragColor = vec4(velocity, 0.0, 1.0);
}`,Je=`${I}
uniform sampler2D uVelocity;
uniform vec2 uStep;
uniform float uKeep;
uniform float uWalls;

vec2 at(vec2 uv) {
  vec2 outside = max(-uv, uv - 1.0) / uTexel;
  float open = clamp(1.0 - max(outside.x, outside.y) / 1.5, 0.0, 1.0);
  return texture(uVelocity, uv).xy * mix(open, 1.0, uWalls);
}

void main() {
  vec2 start = vUv - at(vUv) * uStep;
  vec2 back = start + at(start) * uStep;
  vec2 corrected = vUv - (back - vUv) * 0.5;
  vec2 origin = corrected - at(corrected) * uStep;
  vec2 a = at(origin + vec2(-0.5, -0.5) * uTexel);
  vec2 b = at(origin + vec2(0.5, -0.5) * uTexel);
  vec2 c = at(origin + vec2(-0.5, 0.5) * uTexel);
  vec2 d = at(origin + vec2(0.5, 0.5) * uTexel);
  vec2 velocity = clamp(at(origin), min(min(a, b), min(c, d)), max(max(a, b), max(c, d)));
  fragColor = vec4(velocity * uKeep, 0.0, 1.0);
}`,Ze=`${I}
uniform sampler2D uVelocity;
uniform sampler2D uPalette;
uniform vec2 uSimSize;
uniform float uSpeedScale;
uniform float uLight;
uniform vec4 uBackground;

vec2 velocityAt(vec2 uv) {
  vec2 st = uv * uSimSize - 0.5;
  vec2 i = floor(st);
  vec2 f = st - i;
  vec2 f2 = f * f;
  vec2 f3 = f2 * f;
  vec2 w0 = (-f3 + 3.0 * f2 - 3.0 * f + 1.0) / 6.0;
  vec2 w1 = (3.0 * f3 - 6.0 * f2 + 4.0) / 6.0;
  vec2 w2 = (-3.0 * f3 + 3.0 * f2 + 3.0 * f + 1.0) / 6.0;
  vec2 w3 = f3 / 6.0;
  vec2 g0 = w0 + w1;
  vec2 g1 = w2 + w3;
  vec2 h0 = (i - 0.5 + w1 / g0) / uSimSize;
  vec2 h1 = (i + 1.5 + w3 / g1) / uSimSize;
  vec2 a = texture(uVelocity, vec2(h0.x, h0.y)).xy;
  vec2 b = texture(uVelocity, vec2(h1.x, h0.y)).xy;
  vec2 c = texture(uVelocity, vec2(h0.x, h1.y)).xy;
  vec2 d = texture(uVelocity, vec2(h1.x, h1.y)).xy;
  return g0.y * (g0.x * a + g1.x * b) + g1.y * (g0.x * c + g1.x * d);
}

void main() {
  float speed = length(velocityAt(vUv)) * uSpeedScale;
  float level = speed < 0.75 ? speed : 0.75 + 0.25 * tanh((speed - 0.75) * 4.0);
  vec3 ink = texture(uPalette, vec2(level, 0.5)).rgb;
  float alpha = level;
  if (uLight > 0.5) {
    float hollow = smoothstep(0.7, 1.6, speed);
    alpha = smoothstep(0.08, 0.5, level) * mix(0.85, 0.1, hollow);
  } else {
    float hot = 1.0 - exp(-max(speed - 0.75, 0.0) * 1.2);
    ink = mix(ink, min(ink * 1.8 + 0.06, vec3(1.0)), hot);
  }
  vec3 color = ink * alpha + uBackground.rgb * uBackground.a * (1.0 - alpha);
  float coverage = alpha + uBackground.a * (1.0 - alpha);
  float grain = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  color += (grain - 0.5) / 255.0 * step(0.002, coverage);
  fragColor = vec4(clamp(color, vec3(0.0), vec3(coverage)), coverage);
}`,y=(n,d,l)=>Math.min(l,Math.max(d,n)),Se=(n,d)=>Math.pow(.5,d/(.35+n*n*12)),Pe=n=>{const d=String(n||"").trim(),l=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(d);if(l){const s=l[1].length===3?l[1].replace(/./g,m=>m+m):l[1];return[0,2,4].map(m=>parseInt(s.slice(m,m+2),16)/255)}const v=/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(d);return v?[v[1],v[2],v[3]].map(s=>y(parseFloat(s)/255,0,1)):null},Qe=n=>n<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4),et=n=>{const d=[];n.forEach(s=>{const m=Pe(s);m&&d.push(m)}),d.length||d.push([1,1,1]);const l=d.map(s=>s.map(Qe)),v=new Uint8Array(q*4);for(let s=0;s<q;s++){const m=y(s/(q-1)*l.length-.5,0,l.length-1),M=Math.min(Math.floor(m),Math.max(l.length-2,0)),_=Math.min(M+1,l.length-1),R=m-M,J=R*R*(3-2*R);for(let S=0;S<3;S++){const Z=l[M][S]+(l[_][S]-l[M][S])*J;v[s*4+S]=Math.round(y(Z,0,1)*255)}v[s*4+3]=255}return v},Ae=(n,d,l)=>{const v=n.createShader(d);return v?(n.shaderSource(v,l),n.compileShader(v),n.getShaderParameter(v,n.COMPILE_STATUS)?v:(console.error(n.getShaderInfoLog(v)),n.deleteShader(v),null)):null},X=(n,d)=>{const l=Ae(n,n.VERTEX_SHADER,Ye),v=Ae(n,n.FRAGMENT_SHADER,d),s=l&&v?n.createProgram():null;if(!l||!v||!s)return l&&n.deleteShader(l),v&&n.deleteShader(v),null;if(n.attachShader(s,l),n.attachShader(s,v),n.linkProgram(s),n.deleteShader(l),n.deleteShader(v),!n.getProgramParameter(s,n.LINK_STATUS))return console.error(n.getProgramInfoLog(s)),n.deleteProgram(s),null;const m={},M=n.getProgramParameter(s,n.ACTIVE_UNIFORMS);for(let _=0;_<M;_++){const R=n.getActiveUniform(s,_);R&&(m[R.name]=n.getUniformLocation(s,R.name))}return{program:s,uniforms:m}},rt=({colors:n=["#5227FF","#FF9FFC","#B497CF"],intensity:d=1,mouseForce:l=20,cursorSize:v=100,persistence:s=.75,viscosity:m=0,resolution:M=.5,bounceEdges:_=!1,clickBurst:R=!0,autoDemo:J=!0,autoSpeed:S=.5,autoIntensity:Z=2.2,autoResumeDelay:De=1e3,intro:Le=!0,lightMode:Fe=!1,backgroundColor:ae="transparent",maxDevicePixelRatio:Ve=2,className:Xe="",style:Ie})=>{const ce=V.useRef(null),se=V.useRef(null),Q=V.useRef(null),[ue,Ce]=V.useState(0),le=Array.isArray(n)?n:[n],ve=ae==="transparent"?null:Pe(ae),fe={colors:le,paletteKey:le.join(","),intensity:Math.max(0,d),force:Math.max(0,l),radius:y(v,4,600),persistence:y(s,0,1),viscosity:y(m,0,1),resolution:y(M,.05,1),walls:_,clickBurst:R,autoDemo:J,autoSpeed:Math.max(0,S),autoIntensity:Math.max(0,Z),autoResumeDelay:Math.max(0,De),intro:Le,light:Fe,background:ve?[...ve,1]:[0,0,0,0],maxRatio:y(Ve,.5,3)},k=V.useRef(fe);return k.current=fe,V.useEffect(()=>{Q.current?.()}),V.useEffect(()=>{const B=ce.current,g=se.current;if(!B||!g)return;const e=g.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!e||!e.getExtension("EXT_color_buffer_float")&&!e.getExtension("EXT_color_buffer_half_float"))return;const w={splat:X(e,$e),smooth:X(e,je),divergence:X(e,He),pressure:X(e,Ke),project:X(e,qe),advect:X(e,Je),display:X(e,Ze)};if(Object.values(w).some(t=>!t))return;const z=window.matchMedia("(prefers-reduced-motion: reduce)").matches,de=e.createVertexArray(),h={width:1,height:1},E={width:0,height:0},c={},a={x:0,y:0,fromX:0,fromY:0,dx:0,dy:0,inside:!1,ready:!1,moved:!1,last:0},x={phase:Math.random()*100,x:0,y:0,ready:!1,ramp:0},b={active:k.current.intro&&!z&&ue===0,time:0},Y=[],O=[];let C=1,$=-1/0,P=0,j=0,ee=!0,te=document.visibilityState!=="hidden",re=!1,me="";const H=e.createTexture();e.bindTexture(e.TEXTURE_2D,H),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const Ne=t=>{t.paletteKey!==me&&(me=t.paletteKey,e.bindTexture(e.TEXTURE_2D,H),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,q,1,0,e.RGBA,e.UNSIGNED_BYTE,et(t.colors)))},G=(t,r,o)=>{const u=e.createTexture();e.bindTexture(e.TEXTURE_2D,u),e.texImage2D(e.TEXTURE_2D,0,o===2?e.RG16F:e.R16F,t,r,0,o===2?e.RG:e.RED,e.HALF_FLOAT,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE);const i=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,i),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,u,0),e.clearColor(0,0,0,0),e.clear(e.COLOR_BUFFER_BIT),{texture:u,framebuffer:i}},he=()=>{Object.keys(c).forEach(t=>{e.deleteTexture(c[t].texture),e.deleteFramebuffer(c[t].framebuffer),delete c[t]})},oe=()=>{const t=k.current,r=B.getBoundingClientRect(),o=Math.max(1,r.width),u=Math.max(1,r.height),i=Math.min(window.devicePixelRatio||1,t.maxRatio,Math.sqrt(Ge/(o*u))),f=Math.max(1,Math.round(o*i)),A=Math.max(1,Math.round(u*i));(g.width!==f||g.height!==A)&&(g.width=f,g.height=A),h.width=o,h.height=u;const p=t.resolution*.5,N=p*Math.min(1,Math.sqrt(We/(o*u*p*p))),U=y(Math.round(o*N),16,1024),F=y(Math.round(u*N),16,1024);U===E.width&&F===E.height||(he(),E.width=U,E.height=F,c.velocity=G(U,F,2),c.velocityNext=G(U,F,2),c.divergence=G(U,F,1),c.pressure=G(U,F,1),c.pressureNext=G(U,F,1),e.bindFramebuffer(e.FRAMEBUFFER,null))},W=(t,r)=>{const o=c[t];c[t]=c[r],c[r]=o},T=(t,r,o)=>{e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,r),e.uniform1i(o,t)},D=(t,r,o)=>{e.useProgram(t.program),e.uniform2f(t.uniforms.uTexel,1/E.width,1/E.height),o(t.uniforms),e.bindFramebuffer(e.FRAMEBUFFER,r?r.framebuffer:null),e.drawArrays(e.TRIANGLES,0,3)},ke=(t,r)=>{e.viewport(0,0,E.width,E.height);const o=t.walls?1:0;Y.forEach(i=>{D(w.splat,c.velocityNext,f=>{T(0,c.velocity.texture,f.uVelocity),e.uniform2f(f.uSize,h.width,h.height),e.uniform4f(f.uSegment,i.ax,i.ay,i.bx,i.by),e.uniform2f(f.uForce,i.vx,i.vy),e.uniform1f(f.uRadius,i.radius)}),W("velocity","velocityNext")}),Y.length=0;const u=Math.ceil(t.viscosity*4);for(let i=0;i<u;i++)D(w.smooth,c.velocityNext,f=>{T(0,c.velocity.texture,f.uVelocity),e.uniform1f(f.uAmount,Math.min(1,t.viscosity*4-i)*.9)}),W("velocity","velocityNext");D(w.divergence,c.divergence,i=>{T(0,c.velocity.texture,i.uVelocity),e.uniform1f(i.uWalls,o)});for(let i=0;i<ze;i++)D(w.pressure,c.pressureNext,f=>{T(0,c.pressure.texture,f.uPressure),T(1,c.divergence.texture,f.uDivergence),e.uniform1f(f.uWalls,o)}),W("pressure","pressureNext");D(w.project,c.velocityNext,i=>{T(0,c.pressure.texture,i.uPressure),T(1,c.velocity.texture,i.uVelocity),e.uniform1f(i.uWalls,o)}),W("velocity","velocityNext"),D(w.advect,c.velocityNext,i=>{T(0,c.velocity.texture,i.uVelocity),e.uniform2f(i.uStep,r/h.width,r/h.height),e.uniform1f(i.uKeep,Se(t.persistence,r)),e.uniform1f(i.uWalls,o)}),W("velocity","velocityNext")},Be=t=>{e.viewport(0,0,g.width,g.height),D(w.display,null,r=>{T(0,c.velocity.texture,r.uVelocity),T(1,H,r.uPalette),e.uniform2f(r.uSimSize,E.width,E.height),e.uniform1f(r.uSpeedScale,1.25*t.intensity/(.84*Math.max(h.width,h.height))),e.uniform1f(r.uLight,t.light?1:0),e.uniform4f(r.uBackground,t.background[0],t.background[1],t.background[2],t.background[3])})},Oe=t=>{const r=.62*Math.sin(t*.83+1.3)+.38*Math.sin(t*1.71+.4),o=.6*Math.sin(t*1.07+2.1)+.4*Math.cos(t*.61+.7);return[(.5+.41*r)*h.width,(.5+.41*o)*h.height]},xe=t=>{const r=y(t/1.4,0,1),o=1-Math.pow(1-r,3),u=-.6+o*3.6,i=.08+.3*o;return[(.5+Math.cos(u)*i*1.1)*h.width,(.5+Math.sin(u)*i*(h.width/h.height)*.75)*h.height]},ne=(t,r,o,u,i)=>{Y.push({ax:t[0],ay:t[1],bx:r[0],by:r[1],vx:y((r[0]-t[0])/o*u,-6e3,6e3),vy:y((r[1]-t[1])/o*u,-6e3,6e3),radius:i})},pe=t=>{if(P=0,re)return;const r=k.current;Ne(r);const o=y((t-j)/1e3||0,0,1/30);j=Math.max(j,t);const u=Math.min(1,o*60),i=t-$>r.autoResumeDelay&&!a.inside;if(b.active&&o>0){const p=xe(b.time);b.time+=o;const N=Math.sin(Math.min(1,b.time/1.4)*Math.PI);ne(p,xe(b.time),o,.2*N,r.radius),C=1,b.time>1.4&&(b.active=!1)}else if(r.autoDemo&&!z&&i&&o>0){x.ramp=Math.min(1,x.ramp+o/.8),x.phase+=o*r.autoSpeed*1.6;const p=Oe(x.phase);if(x.ready){const N=.3+.7*Math.pow(.5+.5*Math.sin(x.phase*2.6),2),U=r.force/20*.45*r.autoIntensity*x.ramp*x.ramp*N*u;ne([x.x,x.y],p,o,U,r.radius)}x.x=p[0],x.y=p[1],x.ready=!0,C=1}else x.ramp=0;if(a.moved&&o>0){a.moved=!1;const p=Math.max(t-a.last,8)/1e3;ne([a.fromX,a.fromY],[a.x,a.y],p,r.force/20*.15*u,r.radius),a.fromX=a.x,a.fromY=a.y,a.last=t,C=1}const f=O.shift();f&&Y.push(f),e.bindVertexArray(de),e.disable(e.BLEND),o>0&&ke(r,o),Be(r),C*=Se(r.persistence,o),(b.active||r.autoDemo&&!z||C>.002||O.length>0||a.moved)&&ee&&te&&(P=requestAnimationFrame(pe))},L=()=>{P||re||!ee||!te||(j=performance.now(),P=requestAnimationFrame(pe))};Q.current=()=>{oe(),L()};const ye=t=>{const r=B.getBoundingClientRect();return{x:t.clientX-r.left,y:r.bottom-t.clientY,inside:t.clientX>=r.left&&t.clientX<=r.right&&t.clientY>=r.top&&t.clientY<=r.bottom}},ge=t=>{const r=ye(t);if(a.inside=r.inside,!r.inside){a.ready=!1;return}$=performance.now(),b.active=!1,a.ready||(a.fromX=r.x,a.fromY=r.y,a.x=r.x,a.y=r.y,a.last=$,a.ready=!0);const o=r.x-a.x,u=r.y-a.y;Math.hypot(o,u)>.5&&(a.dx=a.dx*.7+o*.3,a.dy=a.dy*.7+u*.3),a.x=r.x,a.y=r.y,a.moved=!0,L()},Ee=t=>{const r=k.current,o=ye(t);if(!o.inside||($=performance.now(),!r.clickBurst||z))return;const u=Math.hypot(a.dx,a.dy)>1?Math.atan2(a.dy,a.dx):Math.random()*Math.PI*2,i=Math.cos(u),f=Math.sin(u),A=r.radius*.5,p=1400*(r.force/20);O.push({ax:o.x-i*A,ay:o.y-f*A,bx:o.x+i*A,by:o.y+f*A,vx:i*p,vy:f*p,radius:r.radius*.9}),O.length>4&&O.shift(),C=1,L()},ie=()=>{a.inside=!1,a.ready=!1},K=t=>{t.pointerType!=="mouse"&&ie()};window.addEventListener("pointermove",ge,{passive:!0}),window.addEventListener("pointerdown",Ee,{passive:!0}),window.addEventListener("pointerup",K,{passive:!0}),window.addEventListener("pointercancel",K,{passive:!0}),document.documentElement.addEventListener("pointerleave",ie);const Te=t=>{t.preventDefault(),re=!0,cancelAnimationFrame(P),P=0},Re=()=>Ce(t=>t+1);g.addEventListener("webglcontextlost",Te),g.addEventListener("webglcontextrestored",Re);const we=new ResizeObserver(()=>{oe(),L()});we.observe(B);const be=new IntersectionObserver(t=>{ee=t.some(r=>r.isIntersecting),L()});be.observe(B);const Ue=()=>{te=document.visibilityState!=="hidden",L()};return document.addEventListener("visibilitychange",Ue),oe(),L(),()=>{cancelAnimationFrame(P),Q.current=null,we.disconnect(),be.disconnect(),window.removeEventListener("pointermove",ge),window.removeEventListener("pointerdown",Ee),window.removeEventListener("pointerup",K),window.removeEventListener("pointercancel",K),document.documentElement.removeEventListener("pointerleave",ie),document.removeEventListener("visibilitychange",Ue),g.removeEventListener("webglcontextlost",Te),g.removeEventListener("webglcontextrestored",Re),e.isContextLost()||(he(),e.deleteTexture(H),e.deleteVertexArray(de),Object.values(w).forEach(t=>e.deleteProgram(t.program)))}},[ue]),Me.jsx("div",{ref:ce,className:`relative h-full w-full overflow-hidden ${Xe}`.trim(),style:Ie,children:Me.jsx("canvas",{ref:se,className:"absolute inset-0 block h-full w-full","aria-hidden":"true"})})};export{rt as default};
