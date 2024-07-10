import{S as g,d as b,v as P,M as S,P as U,O as x,T as y,C as F,b as C,A as O,a as z}from"./index-BCUWOVe7.js";import{U as V,b as k,G as I}from"./State-D5Wpp2Hc.js";import{F as R}from"./Filter-BMIqnOf-.js";import{a as G,c as j,o as D,b as Y}from"./index-D6jliMHW.js";var A=`
in vec2 vTextureCoord;
in vec2 vFilterUv;

out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uMapTexture;

uniform vec4 uInputClamp;
uniform highp vec4 uInputSize;
uniform mat2 uRotation;
uniform vec2 uScale;

void main()
{
    vec4 map = texture(uMapTexture, vFilterUv);
    
    vec2 offset = uInputSize.zw * (uRotation * (map.xy - 0.5)) * uScale; 

    finalColor = texture(uTexture, clamp(vTextureCoord + offset, uInputClamp.xy, uInputClamp.zw));
}
`,B=`in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vFilterUv;


uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

uniform mat3 uFilterMatrix;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 getFilterCoord( void )
{
  return ( uFilterMatrix * vec3( filterTextureCoord(), 1.0)  ).xy;
}


void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vFilterUv = getFilterCoord();
}
`,T=`
struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct DisplacementUniforms {
  uFilterMatrix:mat3x3<f32>,
  uScale:vec2<f32>,
  uRotation:mat2x2<f32>
};



@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> filterUniforms : DisplacementUniforms;
@group(1) @binding(1) var uMapTexture: texture_2d<f32>;
@group(1) @binding(2) var uMapSampler : sampler;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) filterUv : vec2<f32>,
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);  
}

fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
{
  return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}

fn getSize() -> vec2<f32>
{

  
  return gfu.uGlobalFrame.zw;
}
  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
   getFilterCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) filterUv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var map = textureSample(uMapTexture, uMapSampler, filterUv);

    var offset =  gfu.uInputSize.zw * (filterUniforms.uRotation * (map.xy - 0.5)) * filterUniforms.uScale; 
   
    return textureSample(uTexture, uSampler, clamp(uv + offset, gfu.uInputClamp.xy, gfu.uInputClamp.zw));
}`;class X extends R{constructor(...t){let e=t[0];e instanceof g&&(t[1]&&b(P,"DisplacementFilter now uses options object instead of params. {sprite, scale}"),e={sprite:e,scale:t[1]});const{sprite:s,scale:a,...o}=e;let n=a??20;typeof n=="number"&&(n=new U(n,n));const h=new V({uFilterMatrix:{value:new S,type:"mat3x3<f32>"},uScale:{value:n,type:"vec2<f32>"},uRotation:{value:new Float32Array([0,0,0,0]),type:"mat2x2<f32>"}}),c=k.from({vertex:B,fragment:A,name:"displacement-filter"}),f=I.from({vertex:{source:T,entryPoint:"mainVertex"},fragment:{source:T,entryPoint:"mainFragment"}}),p=s.texture.source;super({...o,gpuProgram:f,glProgram:c,resources:{filterUniforms:h,uMapTexture:p,uMapSampler:p.style}}),this._sprite=e.sprite,this._sprite.renderable=!1}apply(t,e,s,a){const o=this.resources.filterUniforms.uniforms;t.calculateSpriteMatrix(o.uFilterMatrix,this._sprite);const n=this._sprite.worldTransform,h=Math.sqrt(n.a*n.a+n.b*n.b),c=Math.sqrt(n.c*n.c+n.d*n.d);h!==0&&c!==0&&(o.uRotation[0]=n.a/h,o.uRotation[1]=n.b/h,o.uRotation[2]=n.c/c,o.uRotation[3]=n.d/c),this.resources.uMapTexture=this._sprite.texture.source,t.applyFilter(this,e,s,a)}get scale(){return this.resources.filterUniforms.uniforms.uScale}}class ${constructor({matrix:t,observer:e}={}){this.dirty=!0,this._matrix=t??new S,this.observer=e,this.position=new x(this,0,0),this.scale=new x(this,1,1),this.pivot=new x(this,0,0),this.skew=new x(this,0,0),this._rotation=0,this._cx=1,this._sx=0,this._cy=0,this._sy=1}get matrix(){const t=this._matrix;return this.dirty&&(t.a=this._cx*this.scale.x,t.b=this._sx*this.scale.x,t.c=this._cy*this.scale.y,t.d=this._sy*this.scale.y,t.tx=this.position.x-(this.pivot.x*t.a+this.pivot.y*t.c),t.ty=this.position.y-(this.pivot.x*t.b+this.pivot.y*t.d),this.dirty=!1),t}_onUpdate(t){var e;this.dirty=!0,t===this.skew&&this.updateSkew(),(e=this.observer)==null||e._onUpdate(this)}updateSkew(){this._cx=Math.cos(this._rotation+this.skew.y),this._sx=Math.sin(this._rotation+this.skew.y),this._cy=-Math.sin(this._rotation-this.skew.x),this._sy=Math.cos(this._rotation-this.skew.x),this.dirty=!0}toString(){return`[pixi.js/math:Transform position=(${this.position.x}, ${this.position.y}) rotation=${this.rotation} scale=(${this.scale.x}, ${this.scale.y}) skew=(${this.skew.x}, ${this.skew.y}) ]`}setFromMatrix(t){t.decompose(this),this.dirty=!0}get rotation(){return this._rotation}set rotation(t){this._rotation!==t&&(this._rotation=t,this._onUpdate(this.skew))}}const M=class _ extends F{constructor(...t){let e=t[0]||{};e instanceof y&&(e={texture:e}),t.length>1&&(b(P,"use new TilingSprite({ texture, width:100, height:100 }) instead"),e.width=t[1],e.height=t[2]),e={..._.defaultOptions,...e};const{texture:s,anchor:a,tilePosition:o,tileScale:n,tileRotation:h,width:c,height:f,applyAnchorToTexture:p,roundPixels:v,...i}=e??{};super({label:"TilingSprite",...i}),this.renderPipeId="tilingSprite",this.canBundle=!0,this.batched=!0,this._roundPixels=0,this._bounds={minX:0,maxX:1,minY:0,maxY:0},this._boundsDirty=!0,this.allowChildren=!1,this._anchor=new x({_onUpdate:()=>{this.onViewUpdate()}}),this._applyAnchorToTexture=p,this.texture=s,this._width=c??s.width,this._height=f??s.height,this._tileTransform=new $({observer:{_onUpdate:()=>this.onViewUpdate()}}),a&&(this.anchor=a),this.tilePosition=o,this.tileScale=n,this.tileRotation=h,this.roundPixels=v??!1}static from(t,e={}){return typeof t=="string"?new _({texture:C.get(t),...e}):new _({texture:t,...e})}get clampMargin(){return this._texture.textureMatrix.clampMargin}set clampMargin(t){this._texture.textureMatrix.clampMargin=t}get anchor(){return this._anchor}set anchor(t){typeof t=="number"?this._anchor.set(t):this._anchor.copyFrom(t)}get tilePosition(){return this._tileTransform.position}set tilePosition(t){this._tileTransform.position.copyFrom(t)}get tileScale(){return this._tileTransform.scale}set tileScale(t){typeof t=="number"?this._tileTransform.scale.set(t):this._tileTransform.scale.copyFrom(t)}set tileRotation(t){this._tileTransform.rotation=t}get tileRotation(){return this._tileTransform.rotation}get tileTransform(){return this._tileTransform}get roundPixels(){return!!this._roundPixels}set roundPixels(t){this._roundPixels=t?1:0}get bounds(){return this._boundsDirty&&(this._updateBounds(),this._boundsDirty=!1),this._bounds}set texture(t){t||(t=y.EMPTY);const e=this._texture;e!==t&&(e&&e.dynamic&&e.off("update",this.onViewUpdate,this),t.dynamic&&t.on("update",this.onViewUpdate,this),this._texture=t,this.onViewUpdate())}get texture(){return this._texture}set width(t){this._width=t,this.onViewUpdate()}get width(){return this._width}set height(t){this._height=t,this.onViewUpdate()}get height(){return this._height}_updateBounds(){const t=this._bounds,e=this._anchor,s=this._width,a=this._height;t.maxX=-e._x*s,t.minX=t.maxX+s,t.maxY=-e._y*a,t.minY=t.maxY+a}addBounds(t){const e=this.bounds;t.addFrame(e.minX,e.minY,e.maxX,e.maxY)}containsPoint(t){const e=this._width,s=this._height,a=-e*this._anchor._x;let o=0;return t.x>=a&&t.x<=a+e&&(o=-s*this._anchor._y,t.y>=o&&t.y<=o+s)}onViewUpdate(){if(this._boundsDirty=!0,this._didTilingSpriteUpdate=!0,this._didChangeId+=4096,this.didViewUpdate)return;this.didViewUpdate=!0;const t=this.renderGroup||this.parentRenderGroup;t&&t.onChildViewUpdate(this)}destroy(t=!1){if(super.destroy(t),this._anchor=null,this._tileTransform=null,this._bounds=null,typeof t=="boolean"?t:t==null?void 0:t.texture){const s=typeof t=="boolean"?t:t==null?void 0:t.textureSource;this._texture.destroy(s)}this._texture=null}};M.defaultOptions={texture:y.EMPTY,anchor:{x:0,y:0},tilePosition:{x:0,y:0},tileScale:{x:1,y:1},tileRotation:0,applyAnchorToTexture:!1};let E=M;const W=Y("div",{id:"game-container"},null,-1),q=[W],L={__name:"FishesView",setup(w){const t=new O,e=[];let s;async function a(){await t.init({background:"#1099bb",resizeTo:window}),document.getElementById("game-container").appendChild(t.canvas)}async function o(){const i=[{alias:"background",src:"https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg"},{alias:"fish1",src:"https://pixijs.com/assets/tutorials/fish-pond/fish1.png"},{alias:"fish2",src:"https://pixijs.com/assets/tutorials/fish-pond/fish2.png"},{alias:"fish3",src:"https://pixijs.com/assets/tutorials/fish-pond/fish3.png"},{alias:"fish4",src:"https://pixijs.com/assets/tutorials/fish-pond/fish4.png"},{alias:"fish5",src:"https://pixijs.com/assets/tutorials/fish-pond/fish5.png"},{alias:"overlay",src:"https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png"},{alias:"displacement",src:"https://pixijs.com/assets/tutorials/fish-pond/displacement_map.png"}];await z.load(i)}function n(){const i=g.from("background");i.anchor.set(.5),t.screen.width>t.screen.height?(i.width=t.screen.width*1.2,i.scale.y=i.scale.x):(i.height=t.screen.height*1.2,i.scale.x=i.scale.y),i.x=t.screen.width/2,i.y=t.screen.height/2,t.stage.addChild(i)}function h(){const i=new F;t.stage.addChild(i);const u=20,m=["fish1","fish2","fish3","fish4","fish5"];for(let d=0;d<u;d++){const r=m[d%m.length],l=g.from(r);l.anchor.set(.5),l.direction=Math.random()*Math.PI*2,l.speed=2+Math.random()*2,l.turnSpeed=Math.random()-.8,l.x=Math.random()*t.screen.width,l.y=Math.random()*t.screen.height,l.scale.set(.5+Math.random()*.2),i.addChild(l),e.push(l)}}function c(i){i.deltaTime;const u=100,m=t.screen.width+u*2,d=t.screen.height+u*2;e.forEach(r=>{r.direction+=r.turnSpeed*.01,r.x+=Math.sin(r.direction)*r.speed,r.y+=Math.cos(r.direction)*r.speed,r.rotation=-r.direction-Math.PI/2,r.x<-u&&(r.x+=m),r.x>t.screen.width+u&&(r.x-=m),r.y<-u&&(r.y+=d),r.y>t.screen.height+u&&(r.y-=d)})}function f(){const i=y.from("overlay");s=new E({texture:i,width:t.screen.width,height:t.screen.height}),t.stage.addChild(s)}function p(i){const u=i.deltaTime;s.tilePosition.x-=u,s.tilePosition.y-=u}function v(){const i=g.from("displacement");i.texture.baseTexture.wrapMode="repeat";const u=new X({sprite:i,scale:50,width:t.screen.width,height:t.screen.height});t.stage.filters=[u]}return G(async()=>{await a(),await o(),n(),h(),f(),v(),t.ticker.add(i=>{c(i),p(i)})}),(i,u)=>(D(),j("main",null,q))}};export{L as default};
