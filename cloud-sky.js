// Original renderer for this site. Concept reference (not copied source):
// https://codepen.io/strangerintheq/pen/OKVVOW — a volumetric density field.
// The camera is fixed. Only advection and the vapor field evolve slowly.
const vertexSource = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
`;
const fragmentSource = `
precision highp float;
varying vec2 uv;
uniform sampler2D vapor;
uniform float elapsed;

// A padded 32-cubed scalar field in an 8 by 4 atlas. Two bilinear lookups
// interpolate a volume sample without seams between adjacent atlas slices.
float field(vec3 p) {
  vec3 cell = floor(p);
  vec3 f = fract(p); f = f*f*(3.-2.*f);
  vec2 xy = mod(cell.xy,32.) + f.xy + 1.5;
  float a = mod(cell.z,32.);
  float b = mod(cell.z+1.,32.);
  vec2 tileA = vec2(mod(a,8.),floor(a/8.))*34.;
  vec2 tileB = vec2(mod(b,8.),floor(b/8.))*34.;
  return mix(texture2D(vapor,(tileA+xy)/vec2(272.,136.)).r,
             texture2D(vapor,(tileB+xy)/vec2(272.,136.)).r,f.z);
}
float mist(vec3 p) {
  return .50*field(p) + .28*field(p*2.07+vec3(7.1,3.3,5.9))
       + .15*field(p*4.21+vec3(1.7,9.2,2.8))
       + .07*field(p*8.31+vec3(3.2,5.3,1.2));
}
void main() {
  vec3 sky = mix(vec3(.88,.93,.97),vec3(.665,.815,.935),smoothstep(.37,1.,uv.y));
  // The photograph covers the lower half; avoid volume work there.
  if (uv.y < .38) { gl_FragColor=vec4(sky,1.); return; }
  float t = elapsed;
  float scale = mix(8.8,4.7,smoothstep(.38,.96,uv.y));
  vec2 drift = vec2(t*.008+.13*sin(t*.017),.045*sin(t*.011));
  float height = uv.y-.38;
  vec2 plane = vec2((uv.x-.5)*scale,height*10.-height*height*3.) + drift + vec2(6.4,4.1);
  float weather = field(vec3(plane*.37,t*.0016+11.));
  float threshold = .655-.028*weather;
  float horizon = smoothstep(.38,.51,uv.y);
  vec3 lightDirection = normalize(vec3(-.65,1.,-.8));
  vec3 color = vec3(0.);
  float transmission = 1.;
  for (int step=0; step<24; step++) {
    float z = -.9+float(step)*.108;
    vec3 p = vec3(plane,z+t*.0028);
    float density = max(mist(p)-threshold,0.)*10.*horizon;
    if (density > .005) {
      float towardSun = max(mist(p+lightDirection*.22)-threshold,0.)*10.*horizon;
      float lighting = clamp(.94+(density-towardSun)*.4,.85,1.);
      // Shade neutral, warm-white vapor within the sky itself: no blue matte.
      vec3 white = vec3(1.,.993,.973)*lighting;
      float opacity = 1.-exp(-density*.38);
      color += transmission*opacity*white;
      transmission *= 1.-opacity;
      if (transmission < .025) break;
    }
  }
  gl_FragColor = vec4(color+sky*transmission,1.);
}
`;

// A stable initial composition; no frame-by-frame randomness or flashing.
export function makeVaporAtlas(seed = 912367) {
  let state = seed >>> 0 || 1;
  const volume = new Uint8Array(32*32*32);
  for (let i=0;i<volume.length;i++) {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    volume[i] = state >>> 24;
  }
  const atlas = new Uint8Array(272*136*4);
  for (let z=0;z<32;z++) for (let y=0;y<34;y++) for (let x=0;x<34;x++) {
    const value = volume[z*1024+((y+31)%32)*32+(x+31)%32];
    const pixel = (((z>>3)*34+y)*272+(z%8)*34+x)*4;
    atlas[pixel]=atlas[pixel+1]=atlas[pixel+2]=value; atlas[pixel+3]=255;
  }
  return atlas;
}

export function createCloudSky(canvas, { onChange = ()=>{}, seed = 912367 } = {}) {
  let gl;
  try { gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,preserveDrawingBuffer:true,powerPreference:'low-power'}); } catch {}
  if (!gl) return {available:false,setRunning(){},destroy(){}};
  let program, buffer, texture, clockUniform;
  let available=false, running=false, disposed=false, request=0, previous=0, lastDraw=0, elapsed=0;
  let frameInterval=1000/12;
  const shaders=[];
  const pixels=makeVaporAtlas(seed);
  canvas.dataset.cloudMotion='paused';
  function release() {
    if (program) gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
    if (texture) gl.deleteTexture(texture);
    shaders.splice(0).forEach(shader=>gl.deleteShader(shader));
    program=buffer=texture=null;
  }
  function compile(type,source) {
    const shader=gl.createShader(type); shaders.push(shader);
    gl.shaderSource(shader,source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error('Cloud shader unavailable');
    return shader;
  }
  function draw() {
    if (!available || disposed) return;
    const start=performance.now();
    gl.uniform1f(clockUniform,elapsed);
    gl.drawArrays(gl.TRIANGLES,0,3);
    // Slow drivers may block draw submission. Reduce updates rather than
    // delaying input with more frames; cloud motion is deliberately gentle.
    if (performance.now()-start>30) frameInterval=1000/6;
  }
  function resize() {
    if (!available || disposed) return;
    const rect=canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const width=Math.max(180,Math.min(420,Math.round(rect.width*.85)));
    const height=Math.round(width*rect.height/rect.width);
    if (canvas.width===width && canvas.height===height) return;
    canvas.width=width; canvas.height=height;
    gl.viewport(0,0,width,height); draw();
  }
  function frame(now) {
    request=0;
    if (!running || !available || disposed) return;
    if (previous) elapsed+=Math.min((now-previous)/1000,.25);
    previous=now;
    if (now-lastDraw>=frameInterval) { draw(); lastDraw=now; }
    request=requestAnimationFrame(frame);
  }
  function setRunning(value) {
    const next=Boolean(value)&&available&&!disposed;
    if (running===next) return;
    running=next; previous=0;
    if (request) cancelAnimationFrame(request);
    request=running ? requestAnimationFrame(frame) : 0;
    canvas.dataset.cloudMotion=running ? 'running' : 'paused';
  }
  function initialize() {
    try {
      program=gl.createProgram();
      gl.attachShader(program,compile(gl.VERTEX_SHADER,vertexSource));
      gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Cloud program unavailable');
      gl.useProgram(program);
      buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
      const attribute=gl.getAttribLocation(program,'position');
      gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
      texture=gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,272,136,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      gl.uniform1i(gl.getUniformLocation(program,'vapor'),0);
      clockUniform=gl.getUniformLocation(program,'elapsed');
      available=true; resize(); draw();
      const error=gl.getError();
      if (error!==gl.NO_ERROR) throw new Error(`Cloud drawing unavailable (${error})`);
      canvas.dataset.cloudReady='true';
      delete canvas.dataset.cloudError;
    } catch (error) { available=false; setRunning(false); release(); canvas.dataset.cloudReady='false'; canvas.dataset.cloudError=error.message; }
  }
  function lost(event) {
    event.preventDefault(); setRunning(false); available=false;
    // The browser invalidates these resources. Deleting their old handles
    // after restoration would cause INVALID_OPERATION in the new context.
    program=buffer=texture=null; shaders.length=0;
    canvas.dataset.cloudReady='false'; onChange();
  }
  function restored() { if (!disposed) { release(); initialize(); onChange(); } }
  canvas.addEventListener('webglcontextlost',lost);
  canvas.addEventListener('webglcontextrestored',restored);
  initialize();
  const observer=typeof ResizeObserver==='function' ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  return {
    get available() { return available; },
    setRunning,
    destroy() {
      setRunning(false); disposed=true; observer?.disconnect();
      canvas.removeEventListener('webglcontextlost',lost);
      canvas.removeEventListener('webglcontextrestored',restored);
      release(); available=false;
    }
  };
}
