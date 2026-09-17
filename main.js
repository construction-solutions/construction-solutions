import * as THREE from './three.module.js';
const host=document.querySelector('#scene');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let renderer;
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){host.innerHTML='<p style="position:absolute;bottom:15%;left:20%;color:#a3aebc">3D prikaz nije dostupan u ovom pregledniku.</p>';}
if(renderer){
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor(0x000000,0);host.appendChild(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(12,9,15);camera.lookAt(0,1.5,0);
scene.add(new THREE.HemisphereLight(0xe3eeff,0x3b4553,2.5));const key=new THREE.DirectionalLight(0xffffff,4);key.position.set(8,20,10);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-10,right:10,top:17,bottom:-17});key.shadow.bias=-.001;scene.add(key);const fill=new THREE.DirectionalLight(0x427aff,2);fill.position.set(-6,5,-5);scene.add(fill);
const building=new THREE.Group();scene.add(building);
const mat=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const concrete=mat(0xb9bcbf),stone=mat(0xc7c3b7),steel=mat(0x343332,.32,.7),spandrel=mat(0x3c4141,.38,.55),interior=mat(0xb2aa92,.8);
const glazing=[0x6d8d95,0x78939a,0x577881,0x839da0].map(color=>new THREE.MeshPhysicalMaterial({color,metalness:.38,roughness:.16,transparent:true,opacity:.68,depthWrite:false}));
const parts=[];
function box(w,h,d,x,y,z,m,phase=0){let mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;building.add(mesh);parts.push({mesh,y,phase});return mesh;}
// Original Mies-inspired tower: expressed steel grid, recessed lobby,
// continuous curtain wall and a quiet stone plaza. Not a replica.
const lobbyHeight=2.6,storeys=7,storeyHeight=1.65,roofY=lobbyHeight+storeys*storeyHeight;
// Broad podium extends toward the front and right; its roof forms an L-shaped terrace.
box(13.2,.25,10.2,.9,-.4,.8,steel,-1);
box(12.6,.28,9.6,.9,-.13,.8,stone,0);
box(9.3,.16,7.0,1.15,.08,1,stone,.1);
for(const x of [-3.3,0,3.3,5.65])for(const z of [-2.3,2.3,4.35])box(.16,lobbyHeight,.16,x,lobbyHeight/2,z,steel,.55);
box(1.25,lobbyHeight,1.8,.55,lobbyHeight/2,-.3,interior,2.05);
for(const z of [-2.42,4.42]){
 const pane=box(9.15,2.35,.045,1.15,1.28,z,glazing[1],2.1);pane.castShadow=false;
 for(let x=-3.4;x<5.8;x+=1.15)box(.05,2.4,.075,x,1.28,z,steel,2.15);
}
for(const x of [-3.48,5.78]){
 const pane=box(.045,2.35,6.85,x,1.28,1,glazing[1],2.1);pane.castShadow=false;
 for(let z=-2.4;z<4.5;z+=1.14)box(.075,2.4,.05,x,1.28,z,steel,2.15);
}
box(9.55,.22,7.25,1.15,lobbyHeight,1,steel,.7);
box(9.4,.045,7.1,1.15,lobbyHeight+.13,1,stone,2.3);
// Thin floor plates and a restrained, repetitive facade module.
for(let f=0;f<storeys;f++){
 const base=lobbyHeight+f*storeyHeight,mid=base+storeyHeight/2;
 const structure=.65+f*.17,finish=2.05+f*.1;
 if(f===3){
  // Gallery floor leaves a real double-height void above the living room.
  box(6.65,.14,2.65,0,base,-1,concrete,structure);
  box(3.35,.14,2.0,-1.65,base,1.325,concrete,structure);
 }else box(6.65,.14,4.65,0,base,0,concrete,structure);
 box(1.2,1.54,1.65,.55,mid,-.35,interior,finish);
 for(const x of [-3.3,0,3.3])for(const z of [-2.3,2.3])box(.14,storeyHeight,.14,x,mid,z,steel,structure);
 for(const z of [-2.4,2.4]){
  if(z>0&&f===3)box(3.43,.33,.08,-1.715,base+.15,z,spandrel,finish);
  else box(6.85,.33,.08,0,base+.15,z,spandrel,finish);
  for(let k=0;k<8;k++){
   if(z>0&&(f===2||f===3)&&k>=4)continue;
   const x=-3.0+k*(6/7);
   const pane=box(.79,1.27,.035,x,base+.96,z,glazing[(k+f)%4],finish+.08);pane.castShadow=false;
  }
  if(z>0&&f===2)box(3.43,.055,.1,-1.715,base+1.61,z,steel,finish+.13);
  else box(6.85,.055,.1,0,base+1.61,z,steel,finish+.13);
 }
 for(const x of [-3.44,3.44]){
  box(.08,.33,4.8,x,base+.15,0,spandrel,finish);
  for(let k=0;k<6;k++){
   const z=-2+k*.8;
   const pane=box(.035,1.27,.74,x,base+.96,z,glazing[(k+f+1)%4],finish+.08);pane.castShadow=false;
  }
  box(.1,.055,4.8,x,base+1.61,0,steel,finish+.13);
 }
}
// Continuous exposed I-profile mullions accentuate the vertical rhythm.
const facadeHeight=roofY-lobbyHeight;
for(const z of [-2.46,2.46])for(let k=0;k<=8;k++){
 const x=-3.43+k*.8575;
 const ranges=z>0&&k>4&&k<8?[[lobbyHeight,2*storeyHeight],[lobbyHeight+4*storeyHeight,3*storeyHeight]]:[[lobbyHeight,facadeHeight]];
 for(const [bottom,height] of ranges){
  box(.045,height,.16,x,bottom+height/2,z,steel,2.85);
  box(.095,height,.035,x,bottom+height/2,z+(z>0?.075:-.075),steel,2.85);
 }
}
for(const x of [-3.48,3.48])for(let k=0;k<=6;k++){
 const z=-2.4+k*.8;
 box(.14,facadeHeight,.05,x,lobbyHeight+facadeHeight/2,z,steel,2.85);
}
// Selected floors open onto staggered terraces; others retain a flush curtain wall.
const leafMats=[mat(0x527545),mat(0x789456),mat(0x3e613c)],bark=mat(0x6c5741),soil=mat(0x3c3327);
function organic(geometry,material,x,y,z,phase){
 const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;
 building.add(mesh);parts.push({mesh,y,phase,organic:true});return mesh;
}
function planter(x,y,z,width,phase,tree=false){
 box(width,.35,.43,x,y+.22,z,steel,phase);
 box(width-.08,.035,.35,x,y+.4,z,soil,phase);
 const count=Math.max(3,Math.round(width*5));
 for(let n=0;n<count;n++){
  const px=x-width*.39+(n/(count-1))*width*.78;
  const geometry=new THREE.IcosahedronGeometry(.2,1);geometry.scale(1,.9+(n%3)*.28,.8);
  organic(geometry,leafMats[n%3],px,y+.57+(n%2)*.045,z,phase+.05);
 }
 if(tree){
  organic(new THREE.CylinderGeometry(.022,.038,.82,6),bark,x,y+.79,z,phase+.08);
  for(let n=0;n<4;n++){
   const geometry=new THREE.IcosahedronGeometry(.29,1);geometry.scale(1,1.18,.9);
   organic(geometry,leafMats[n%3],x+Math.sin(n*2)*.15,y+1.16+(n%2)*.18,z+Math.cos(n*2)*.13,phase+.12);
  }
 }
}
function terrace(f,x,width,side=1,tree=false){
 const y=lobbyHeight+f*storeyHeight+.02,phase=2.55+f*.075;
 const z=side*3.02,edge=side*3.64;
 box(width,.13,1.4,x,y,z,steel,phase);
 box(width-.08,.045,1.3,x,y+.085,z,stone,phase);
 const rail=box(width,.71,.035,x,y+.49,edge,glazing[1],phase+.08);rail.castShadow=false;
 box(width,.045,.055,x,y+.86,edge,steel,phase+.1);
 for(const dx of [-width/2,width/2]){
  const end=box(.035,.71,1.17,x+dx,y+.49,side*3.04,glazing[1],phase+.08);end.castShadow=false;
  box(.05,.8,.05,x+dx,y+.46,edge,steel,phase+.1);
  box(.05,.04,1.25,x+dx,y+.86,side*3.02,steel,phase+.1);
 }
 planter(x-width*.25,y+.1,side*3.22,Math.min(1.15,width*.42),phase+.14,tree);
}

terrace(2,-1.8,2.9,1,false);
terrace(3,-1.55,3.6,-1,false);
terrace(5,0,6.8,1,true);
terrace(6,1.7,3.25,-1,true);
// A second planter at the opposite end of the broad upper terrace.
planter(2.5,lobbyHeight+5*storeyHeight+.12,3.22,1.15,3.1,false);
// Rooftop garden on the widened ground floor, with glass rails and lounge seating.
const deck=lobbyHeight+.16;
for(const [x,z,w,d] of [[1.15,4.55,9.5,.035],[5.88,1,.035,7.1],[-3.58,3.5,.035,2.1],[4.7,-2.55,2.35,.035]]){
 const rail=box(w,.8,d,x,deck+.43,z,glazing[1],3.0);rail.castShadow=false;
 box(w,.045,d<.1?.065:d,x,deck+.85,z,steel,3.05);
}
planter(-2.7,deck,4.05,1.25,3.05,true);
planter(.1,deck,4.05,1.7,3.05,false);
planter(4.95,deck,3.8,1.2,3.05,true);
planter(4.9,deck,-1.65,1.2,3.05,true);
const upholstery=mat(0xd0c5ac),timber=mat(0x8e6949);
box(1.9,.23,.62,2.65,deck+.2,3.9,upholstery,3.1);
box(1.9,.38,.14,2.65,deck+.44,4.13,upholstery,3.1);
box(1.1,.1,.52,2.65,deck+.23,3.1,timber,3.1);
for(const x of [2.2,3.1])box(.055,.2,.055,x,deck+.1,3.1,steel,3.1);
// One duplex occupies the third and fourth floors, with a tall glazed living room.
const duplexBase=lobbyHeight+2*storeyHeight;
const clearGlass=new THREE.MeshPhysicalMaterial({color:0xa6c0bd,metalness:.05,roughness:.08,transparent:true,opacity:.22,depthWrite:false});
const duplexPane=box(3.34,3.06,.03,1.71,duplexBase+1.73,2.41,clearGlass,2.85);duplexPane.castShadow=false;
for(const x of [.04,3.4])box(.09,3.2,.14,x,duplexBase+1.72,2.48,timber,2.95);
box(3.42,.1,.14,1.72,duplexBase+3.3,2.48,timber,2.95);
box(3.2,.05,1.96,1.65,duplexBase+.12,1.28,timber,2.8);
// Stair rises from the living room to the rear upper gallery.
for(let step=0;step<11;step++){
 const y=duplexBase+.16+(step+1)*storeyHeight/11,z=2.0-step*.17;
 box(.7,.075,.23,2.75,y,z,timber,2.98);
 box(.025,.55,.025,2.39,y+.29,z,steel,3.0);
}
const galleryRail=box(2.25,.55,.025,1.17,duplexBase+storeyHeight+.37,.33,clearGlass,3.0);galleryRail.castShadow=false;
box(2.25,.035,.045,1.17,duplexBase+storeyHeight+.66,.33,steel,3.0);
box(1.15,.25,.55,.95,duplexBase+.3,1.62,upholstery,3.05);
box(1.15,.35,.13,.95,duplexBase+.52,1.88,upholstery,3.05);
box(.62,.1,.42,1.15,duplexBase+.29,.93,timber,3.05);
// Flat crown and broad, shallow entry steps.
box(7.0,.23,4.95,0,roofY,0,steel,3.05);
box(6.7,.07,4.65,0,roofY+.15,0,spandrel,3.1);
box(5.3,.1,.65,1.2,-.01,4.7,stone,3.1);
box(5.7,.08,.6,1.2,-.11,5.05,stone,3.15);
const grid=new THREE.GridHelper(13,26,0x42618b,0x293949);grid.position.y=-.54;building.add(grid);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.25}));ground.rotation.x=-Math.PI/2;ground.position.y=-.55;scene.add(ground);
const edgeGroup=new THREE.Group();building.add(edgeGroup);for(const p of parts){if(p.phase<0||p.organic)continue;const edges=new THREE.LineSegments(new THREE.EdgesGeometry(p.mesh.geometry),new THREE.LineBasicMaterial({color:0x669aff,transparent:true,opacity:.2}));edges.position.copy(p.mesh.position);edgeGroup.add(edges);}
const story=document.querySelector('.story'),phase=document.querySelector('#phase'),pct=document.querySelector('#percent'),progress=document.querySelector('.progress i');let target=0,current=0,visible=true,dirty=true;
function resize(){
 const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;
 const center=new THREE.Vector3(0,7.0,0);
 const verticalFov=THREE.MathUtils.degToRad(camera.fov),horizontalFov=2*Math.atan(Math.tan(verticalFov/2)*camera.aspect);
 const distance=9.8/Math.sin(Math.min(verticalFov,horizontalFov)/2);
 camera.position.copy(center).add(new THREE.Vector3(1,.55,1.3).normalize().multiplyScalar(distance));
 camera.lookAt(center);camera.updateProjectionMatrix();dirty=true;
}
function scroll(){target=Math.max(0,Math.min(1,-story.getBoundingClientRect().top/(story.offsetHeight-innerHeight)));dirty=true;}
addEventListener('resize',resize);addEventListener('scroll',scroll,{passive:true});resize();scroll();
new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)dirty=true;}).observe(story);
function frame(){requestAnimationFrame(frame);if(!visible||(!dirty&&Math.abs(current-target)<.0001))return;current=reduced?target:current+(target-current)*.075;const t=current;building.rotation.y=-.35+t*Math.PI*.72;edgeGroup.visible=t<.42;edgeGroup.children.forEach(e=>{e.material.opacity=.23*(1-Math.min(1,t/.42));});for(const p of parts){if(p.phase<0)continue;const level=t*4.3;const amount=THREE.MathUtils.smoothstep(level,p.phase*.85,p.phase*.85+.65);p.mesh.visible=amount>.005;p.mesh.scale.y=Math.max(.001,amount);p.mesh.position.y=p.y+(1-amount)*(reduced?0:2);}
const n=Math.min(3,Math.floor(t*4));phase.textContent=['01 / IDEJA','02 / TEMELJI','03 / KONSTRUKCIJA','04 / ZAVRŠNA OBRADA'][n];pct.textContent=String(Math.round(t*100)).padStart(2,'0')+'%';progress.style.width=t*100+'%';renderer.render(scene,camera);dirty=false;}frame();
}
document.querySelector('#year').textContent=new Date().getFullYear();
