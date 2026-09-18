import test from 'node:test';
import assert from 'node:assert/strict';
import {makeVaporAtlas,createCloudSky} from '../cloud-sky.js';

test('vapor texture is stable and each slice wraps cleanly across its padded edges',()=>{
  const atlas=makeVaporAtlas(19);
  assert.deepEqual(atlas,makeVaporAtlas(19));
  assert.notDeepEqual(atlas,makeVaporAtlas(20));
  const pixel=(z,x,y)=>Array.from(atlas.slice((((z>>3)*34+y)*272+z%8*34+x)*4,(((z>>3)*34+y)*272+z%8*34+x)*4+4));
  for(let z=0;z<32;z++) for(let edge=0;edge<34;edge++) {
    assert.deepEqual(pixel(z,0,edge),pixel(z,32,edge));
    assert.deepEqual(pixel(z,33,edge),pixel(z,1,edge));
    assert.deepEqual(pixel(z,edge,0),pixel(z,edge,32));
    assert.deepEqual(pixel(z,edge,33),pixel(z,edge,1));
    assert.equal(pixel(z,edge,0)[3],255);
  }
});

test('denied or missing WebGL yields a safe controller for the photographic fallback',()=>{
  for(const getContext of [()=>null,()=>{throw new Error('disabled')}]) {
    const renderer=createCloudSky({getContext});
    assert.equal(renderer.available,false);
    assert.doesNotThrow(()=>{renderer.setRunning(true);renderer.setRunning(false);renderer.destroy()});
  }
});

test('pause/resume keeps sky time stable and context recovery discards invalid resources',t=>{
  const pending=new Map(),timeValues=[],listeners=new Map(); let id=0;
  const oldRequest=globalThis.requestAnimationFrame,oldCancel=globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame=callback=>{pending.set(++id,callback);return id};
  globalThis.cancelAnimationFrame=request=>pending.delete(request);
  t.after(()=>{
    if(oldRequest===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=oldRequest;
    if(oldCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=oldCancel;
  });
  const resources=[];let glError=0;
  const gl=new Proxy({NO_ERROR:0},{get(target,key){
    if(key in target)return target[key];
    if(['getShaderParameter','getProgramParameter'].includes(key))return ()=>true;
    if(key==='getError')return ()=>{const error=glError;glError=0;return error};
    if(['createProgram','createShader','createBuffer','createTexture'].includes(key))return ()=>{const resource={valid:true};resources.push(resource);return resource};
    if(['deleteProgram','deleteShader','deleteBuffer','deleteTexture'].includes(key))return resource=>{if(!resource.valid)glError=1282};
    if(key==='uniform1f')return (_,value)=>timeValues.push(value);
    return ()=>({});
  }});
  const canvas={dataset:{},width:420,height:280,getContext:()=>gl,getBoundingClientRect:()=>({width:494,height:329.33}),addEventListener:(event,listener)=>listeners.set(event,listener),removeEventListener:event=>listeners.delete(event)};
  const renderer=createCloudSky(canvas);
  const tick=now=>{const [key,callback]=pending.entries().next().value;pending.delete(key);callback(now)};
  assert.equal(renderer.available,true);
  assert.equal(pending.size,0);
  renderer.setRunning(true); renderer.setRunning(true);
  assert.equal(pending.size,1);
  tick(1000);tick(1100);
  const beforePause=timeValues.at(-1);
  renderer.setRunning(false);
  assert.equal(pending.size,0);
  assert.equal(canvas.dataset.cloudMotion,'paused');
  renderer.setRunning(true);tick(900000);
  assert.equal(timeValues.at(-1),beforePause);
  resources.forEach(resource=>resource.valid=false);
  listeners.get('webglcontextlost')({preventDefault(){}});
  assert.equal(renderer.available,false);
  assert.equal(pending.size,0);
  listeners.get('webglcontextrestored')();
  assert.equal(renderer.available,true);
  renderer.setRunning(true);
  renderer.destroy();renderer.setRunning(true);
  assert.equal(pending.size,0);
  assert.equal(listeners.size,0);
});
