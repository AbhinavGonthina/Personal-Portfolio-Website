import{r as F,j as fe}from"./react-CJWZEPwJ.js";const Be=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,We=`#version 300 es
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uTarget;
uniform vec2 uRot;
uniform vec2 uPillarRot;
uniform vec2 uWave;
uniform float uShift;
uniform float uPillarWidth;
uniform float uPillarHeight;
uniform int uDetail;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uGlowAmount;
uniform float uWidthNorm;
out vec4 outColor;

void main() {
  vec2 vUv = gl_FragCoord.xy / uTarget;
  vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
  uv.x -= uShift;
  uv = vec2(uPillarRot.x * uv.x - uPillarRot.y * uv.y, uPillarRot.y * uv.x + uPillarRot.x * uv.y);

  vec3 ro = vec3(0.0, 0.0, -10.0);
  vec3 rd = normalize(vec3(uv, 1.0));
  vec3 origin = vec3(uRot.x * ro.x - uRot.y * ro.z, ro.y, uRot.y * ro.x + uRot.x * ro.z);
  vec3 dir = vec3(uRot.x * rd.x - uRot.y * rd.z, rd.y, uRot.y * rd.x + uRot.x * rd.z);

  float glow = 0.0;
  float lift = 0.0;
  float t = 0.1;
  for (int i = 0; i < 80; i++) {
    vec3 p = origin + dir * t;
    vec3 q = p;
    q.y = p.y * uPillarHeight + uTime;

    float freq = 1.0;
    float amp = 1.0;
    for (int j = 0; j < 6; j++) {
      if (j >= uDetail) break;
      q.xz = vec2(uWave.y * q.x - uWave.x * q.z, uWave.x * q.x + uWave.y * q.z);
      q += cos(q.zxy * freq - uTime * float(j) * 2.0) * amp;
      freq *= 2.0;
      amp *= 0.5;
    }

    float d = length(cos(q.xz)) - 0.2;
    float bound = length(p.xz) - uPillarWidth;
    float h = max(4.0 - abs(d - bound), 0.0);
    d = max(d, bound) + h * h * 0.015625;
    d = abs(d) * 0.15 + 0.01;

    float weight = 1.0 / d;
    glow += weight;
    lift += clamp((15.0 - p.y) / 30.0, 0.0, 1.0) * weight;

    t += d;
    if (t > 50.0) break;
  }

  vec3 col = tanh((uBottomColor * glow + (uTopColor - uBottomColor) * lift) * uGlowAmount / uWidthNorm);
  float peak = max(col.r, max(col.g, col.b));
  outColor = vec4(col, smoothstep(0.62, 1.0, peak));
}`,Xe=`#version 300 es
precision highp float;
uniform sampler2D uField;
uniform vec2 uFieldSize;
uniform vec2 uView;
uniform vec2 uAspect;
uniform vec2 uPillarRot;
uniform float uShift;
uniform float uIntensity;
uniform float uNoiseIntensity;
uniform float uLightMode;
uniform float uNeutral;
uniform float uBloom;
uniform float uFade;
uniform float uReveal;
uniform float uFlare;
uniform vec4 uPulses[3];
out vec4 outColor;

vec3 tap(vec2 uv) {
  return textureLod(uField, uv, 0.0).rgb;
}

vec3 bicubic(vec2 uv) {
  vec2 position = uv * uFieldSize;
  vec2 center = floor(position - 0.5) + 0.5;
  vec2 f = position - center;
  vec2 w0 = f * (-0.5 + f * (1.0 - 0.5 * f));
  vec2 w1 = 1.0 + f * f * (-2.5 + 1.5 * f);
  vec2 w2 = f * (0.5 + f * (2.0 - 1.5 * f));
  vec2 w3 = f * f * (-0.5 + 0.5 * f);
  vec2 w12 = w1 + w2;
  vec2 t0 = (center - 1.0) / uFieldSize;
  vec2 t3 = (center + 2.0) / uFieldSize;
  vec2 t12 = (center + w2 / w12) / uFieldSize;
  vec3 result = vec3(0.0);
  result += tap(vec2(t0.x, t0.y)) * w0.x * w0.y;
  result += tap(vec2(t12.x, t0.y)) * w12.x * w0.y;
  result += tap(vec2(t3.x, t0.y)) * w3.x * w0.y;
  result += tap(vec2(t0.x, t12.y)) * w0.x * w12.y;
  result += tap(vec2(t12.x, t12.y)) * w12.x * w12.y;
  result += tap(vec2(t3.x, t12.y)) * w3.x * w12.y;
  result += tap(vec2(t0.x, t3.y)) * w0.x * w3.y;
  result += tap(vec2(t12.x, t3.y)) * w12.x * w3.y;
  result += tap(vec2(t3.x, t3.y)) * w3.x * w3.y;
  return max(result, 0.0);
}

float smootherstep01(float t) {
  t = clamp(t, 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uView;
  vec3 col = bicubic(uv);

  if (uBloom > 0.0) {
    vec4 l3 = textureLod(uField, uv, 3.0);
    vec4 l4 = textureLod(uField, uv, 4.0);
    vec4 l5 = textureLod(uField, uv, 5.0);
    vec4 l6 = textureLod(uField, uv, 6.0);
    float halo = l3.a * 0.3 + l4.a * 0.3 + l5.a * 0.25 + l6.a * 0.15;
    vec3 tint = l4.rgb + l5.rgb;
    tint /= max(max(tint.r, max(tint.g, tint.b)), 0.001);
    vec3 glow = clamp(tint * halo * uBloom * 1.1, 0.0, 1.0);
    col = 1.0 - (1.0 - clamp(col, 0.0, 1.0)) * (1.0 - glow);
  }

  vec2 p = (uv * 2.0 - 1.0) * uAspect;
  p.x -= uShift;
  float axis = uPillarRot.y * p.x + uPillarRot.x * p.y;

  float boost = 0.0;
  for (int i = 0; i < 3; i++) {
    vec4 pulse = uPulses[i];
    if (pulse.y <= 0.0) continue;
    float offset = (axis - pulse.x) / 0.24;
    boost += exp(-offset * offset) * pulse.y;
  }
  float head = (axis - uReveal + 0.35) / 0.3;
  boost += exp(-head * head) * uFlare;
  float lum = max(col.r, max(col.g, col.b));
  col += mix(col, vec3(lum), 0.45) * boost * 1.8;

  col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;
  vec3 result = clamp(col * uIntensity, 0.0, 1.0);

  float mask = smoothstep(uReveal, uReveal - 0.9, axis);
  float edge = uFade * 0.5;
  if (edge > 0.0) {
    mask *= smootherstep01(uv.x / edge) * smootherstep01((1.0 - uv.x) / edge);
    mask *= smootherstep01(uv.y / edge) * smootherstep01((1.0 - uv.y) / edge);
  }

  if (uLightMode > 0.5) {
    float energy = max(result.r, max(result.g, result.b));
    vec3 hue = result / max(energy, 0.001);
    float coverage = smoothstep(0.025, 0.95, energy);
    hue = pow(clamp(hue, 0.0, 1.0), vec3(1.25));
    vec3 tinted = mix(vec3(1.0), hue, coverage * 0.94 * mask);
    vec3 ink = vec3(1.0) - pow(result, vec3(1.6)) * 0.85 * mask;
    result = mix(tinted, ink, uNeutral);
  } else {
    result *= mask;
  }
  outColor = vec4(result, 1.0);
}`,me={low:.35,medium:.5,high:.6},Oe=2.1,he=1.4,de=.25,B=(r,y,v)=>Math.min(v,Math.max(y,r)),Ge=r=>1-Math.pow(1-r,3),Ve=r=>r*r*r*(r*(r*6-15)+10),ve=(r,y,v)=>{const f=r.createShader(y);return f?(r.shaderSource(f,v),r.compileShader(f),r.getShaderParameter(f,r.COMPILE_STATUS)?f:(r.deleteShader(f),null)):null},xe=(r,y)=>{const v=ve(r,r.VERTEX_SHADER,Be),f=ve(r,r.FRAGMENT_SHADER,y),c=r.createProgram();if(!v||!f||!c)return null;if(r.attachShader(c,v),r.attachShader(c,f),r.bindAttribLocation(c,0,"aPosition"),r.linkProgram(c),r.deleteShader(v),r.deleteShader(f),!r.getProgramParameter(c,r.LINK_STATUS))return r.deleteProgram(c),null;const U={},W=r.getProgramParameter(c,r.ACTIVE_UNIFORMS);for(let L=0;L<W;L++){const C=r.getActiveUniform(c,L);C&&(U[C.name.replace(/\[0\]$/,"")]=r.getUniformLocation(c,C.name))}return{program:c,uniforms:U}},je=({topColor:r="#5227FF",bottomColor:y="#FF9FFC",intensity:v=1,rotationSpeed:f=.3,flow:c=1,interactive:U=!0,clickPulse:W=!0,glowAmount:L=.002,bloom:C=.5,pillarWidth:pe=3,pillarHeight:ge=.4,pillarRotation:we=25,twist:Re=.4,detail:Ee=4,noiseIntensity:ye=.5,fade:Te=0,intro:be=!0,mixBlendMode:Me="screen",quality:Fe="high",resolution:Ae,lightMode:Pe=!1,paused:Se=!1,className:_e="",style:Le})=>{const Y=F.useRef(null),$=F.useRef(null),X=F.useRef(null),T=F.useRef(null),[Ce,Ie]=F.useState(0);return T.current={topColor:String(r),bottomColor:String(y),intensity:Math.max(0,v),rotationSpeed:f,flow:c,interactive:U,clickPulse:W,glowAmount:Math.max(0,L),bloom:Math.max(0,C),pillarWidth:Math.max(.05,pe),pillarHeight:ge,pillarRotation:we,twist:Re,detail:Math.round(B(Ee,1,6)),noiseIntensity:Math.max(0,ye),fade:B(Te,0,1),intro:be,scale:B(Ae??me[Fe]??me.high,de,2),lightMode:Pe,paused:Se},F.useEffect(()=>{const A=Y.current,m=$.current,e=m?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance"});if(!A||!m||!e)return;const Ue=!!e.getExtension("EXT_color_buffer_float"),k=xe(e,We),D=xe(e,Xe);if(!k||!D)return;const K=t=>{t.preventDefault()},Q=()=>Ie(t=>t+1);m.addEventListener("webglcontextlost",K),m.addEventListener("webglcontextrestored",Q);const J=e.createBuffer(),O=e.createVertexArray();e.bindVertexArray(O),e.bindBuffer(e.ARRAY_BUFFER,J),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let x=null;const G=e.createFramebuffer(),h={width:0,height:0},ke=(t,i)=>{if(h.width===t&&h.height===i)return;h.width=t,h.height=i,x&&e.deleteTexture(x),x=e.createTexture(),e.bindTexture(e.TEXTURE_2D,x);const n=Math.floor(Math.log2(Math.max(t,i)))+1;e.texStorage2D(e.TEXTURE_2D,n,Ue?e.RGBA16F:e.RGBA8,t,i),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,G),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,x,0)},P=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),V=new Map,N=t=>{if(V.has(t))return V.get(t);let i=[1,1,1];if(P){P.clearRect(0,0,1,1),P.fillStyle="#ffffff",P.fillStyle=t,P.fillRect(0,0,1,1);const[n,s,g]=P.getImageData(0,0,1,1).data;i=[n/255,s/255,g/255]}return V.set(t,i),i},I=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,a={width:1,height:1,ratio:1},S={x:0,y:0,inside:!1},p=[],H=new Float32Array(12),o={clock:0,intro:T.current.intro&&!I?0:1,touch:0,spin:0,lean:0,shift:0,governor:1,slow:0,quick:0};let b=0,w=0,q=!0;const De=(t,i,n)=>{const s=a.width/a.height,g=(t/a.width*2-1)*s-o.shift,d=1-i/a.height*2;return Math.sin(n)*g+Math.cos(n)*d},j=()=>{const t=T.current,i=Math.max(de,t.scale*o.governor),n=Math.max(1,Math.round(a.width*i)),s=Math.max(1,Math.round(a.height*i));ke(n,s);const g=Ve(o.intro),d=Ge(o.intro),R=(t.pillarRotation+o.lean)*Math.PI/180,z=o.clock*.3+o.spin,E=t.pillarWidth*(.3+.7*g);e.bindVertexArray(O);const l=k.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,G),e.viewport(0,0,h.width,h.height),e.useProgram(k.program),e.uniform1f(l.uTime,o.clock*t.flow),e.uniform2f(l.uResolution,a.width,a.height),e.uniform2f(l.uTarget,h.width,h.height),e.uniform2f(l.uRot,Math.cos(z),Math.sin(z)),e.uniform2f(l.uPillarRot,Math.cos(R),Math.sin(R)),e.uniform2f(l.uWave,Math.sin(t.twist),Math.cos(t.twist)),e.uniform1f(l.uShift,o.shift),e.uniform1f(l.uPillarWidth,E),e.uniform1f(l.uPillarHeight,t.pillarHeight),e.uniform1i(l.uDetail,t.detail),e.uniform3fv(l.uTopColor,N(t.topColor)),e.uniform3fv(l.uBottomColor,N(t.bottomColor)),e.uniform1f(l.uGlowAmount,t.glowAmount),e.uniform1f(l.uWidthNorm,E/3),e.drawArrays(e.TRIANGLES,0,3),e.bindTexture(e.TEXTURE_2D,x),t.bloom>0&&e.generateMipmap(e.TEXTURE_2D),H.fill(0),p.forEach((_,ze)=>{H.set([_.axis+_.age*1.7,Math.exp(-_.age/(he*.45)),0,0],ze*4)});const u=D.uniforms;e.bindFramebuffer(e.FRAMEBUFFER,null),e.viewport(0,0,m.width,m.height),e.useProgram(D.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,x),e.uniform1i(u.uField,0),e.uniform2f(u.uFieldSize,h.width,h.height),e.uniform2f(u.uView,m.width,m.height),e.uniform2f(u.uAspect,a.width/a.height,1),e.uniform2f(u.uPillarRot,Math.cos(R),Math.sin(R)),e.uniform1f(u.uShift,o.shift),e.uniform1f(u.uIntensity,t.intensity*(.15+.85*d)*(1+.12*o.touch)),e.uniform1f(u.uNoiseIntensity,t.noiseIntensity),e.uniform1f(u.uLightMode,t.lightMode?1:0);const le=_=>Math.max(..._)-Math.min(..._),qe=Math.max(le(N(t.topColor)),le(N(t.bottomColor)));e.uniform1f(u.uNeutral,1-B((qe-.08)/.12,0,1)),e.uniform1f(u.uBloom,t.bloom),e.uniform1f(u.uFade,t.fade);const ce=a.width/a.height+1.2;e.uniform1f(u.uReveal,o.intro>=1?1e4:-ce+d*(ce*2+1.2)),e.uniform1f(u.uFlare,o.intro>=1?0:(1-d)*1.3*Math.min(1,o.intro*8)),e.uniform4fv(u.uPulses,H),e.drawArrays(e.TRIANGLES,0,3)},Ne=t=>{t>1/40?(o.slow+=1,o.quick=0):t<1/55&&(o.quick+=1,o.slow=0),o.slow>20?(o.governor=Math.max(.5,o.governor*.85),o.slow=0):o.quick>180&&o.governor<1&&(o.governor=Math.min(1,o.governor*1.1),o.quick=0)},Z=t=>{if(b=0,!q||document.hidden)return;const i=T.current,n=w?Math.min(.05,(t-w)/1e3):1/60;w&&Ne((t-w)/1e3),w=t;const s=!i.paused&&!I&&i.rotationSpeed!==0;s&&(o.clock+=n*.96*i.rotationSpeed),!i.intro||I?o.intro=1:o.intro<1&&(o.intro=Math.min(1,o.intro+n/Oe));const g=i.interactive&&S.inside&&!I,d=g?S.x/a.width-.5:0,R=1-Math.exp(-n*2.4);o.spin+=(d*1.4-o.spin)*R,o.lean+=(d*9-o.lean)*R,o.shift+=(d*.35*(a.width/a.height)-o.shift)*R,o.touch+=((g?1:0)-o.touch)*(1-Math.exp(-n*3));for(let E=p.length-1;E>=0;E--)p[E].age+=n,p[E].age>he*2.2&&p.splice(E,1);j();const z=o.intro<1||p.length>0||Math.abs(d*1.4-o.spin)>5e-4||Math.abs((g?1:0)-o.touch)>.002;s||z?b=requestAnimationFrame(Z):w=0},M=()=>{!b&&q&&!document.hidden&&(b=requestAnimationFrame(Z))},ee=()=>{const t=Math.max(1,A.clientWidth),i=Math.max(1,A.clientHeight),n=Math.min(window.devicePixelRatio||1,2);a.width=t,a.height=i,a.ratio=n,m.width=Math.max(1,Math.round(t*n)),m.height=Math.max(1,Math.round(i*n)),b||j(),M()},te=t=>{const i=A.getBoundingClientRect(),n=t.clientX-i.left,s=t.clientY-i.top;return{x:n,y:s,inside:n>=0&&s>=0&&n<=i.width&&s<=i.height}},oe=t=>{const i=te(t);S.x=i.x,S.y=i.y,S.inside=i.inside,M()},re=t=>{const i=T.current;if(!i.clickPulse||I)return;const n=te(t);if(!n.inside)return;const s=(i.pillarRotation+o.lean)*Math.PI/180;p.push({axis:De(n.x,n.y,s),age:0}),p.length>3&&p.shift(),M()},ie=()=>{S.inside=!1,M()},ne=()=>{w=0,M()},ae=new ResizeObserver(ee);ae.observe(A);const ue=new IntersectionObserver(t=>{q=t.some(i=>i.isIntersecting),q&&(w=0,M())});ue.observe(A);const se=T.current.interactive||T.current.clickPulse;return se&&(window.addEventListener("pointermove",oe,{passive:!0}),window.addEventListener("pointerdown",re,{passive:!0}),document.documentElement.addEventListener("pointerleave",ie)),document.addEventListener("visibilitychange",ne),ee(),X.current=()=>{b||j(),M()},()=>{cancelAnimationFrame(b),X.current=null,m.removeEventListener("webglcontextlost",K),m.removeEventListener("webglcontextrestored",Q),ae.disconnect(),ue.disconnect(),se&&(window.removeEventListener("pointermove",oe),window.removeEventListener("pointerdown",re),document.documentElement.removeEventListener("pointerleave",ie)),document.removeEventListener("visibilitychange",ne),x&&e.deleteTexture(x),e.deleteFramebuffer(G),e.deleteProgram(k.program),e.deleteProgram(D.program),e.deleteBuffer(J),e.deleteVertexArray(O)}},[Ce]),F.useEffect(()=>{X.current?.()}),fe.jsx("div",{ref:Y,className:`absolute top-0 left-0 w-full h-full overflow-hidden ${_e}`,style:{mixBlendMode:Me,...Le},children:fe.jsx("canvas",{ref:$,className:"absolute inset-0 block w-full h-full","aria-hidden":"true"})})};export{je as default};
