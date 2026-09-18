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

// Two further buildings share one world; the camera travels between them.
const restoration=new THREE.Group(),villa=new THREE.Group();restoration.position.x=26;villa.position.x=52;scene.add(restoration,villa);
const additions=[[],[]],oldFacade=mat(0x867c70),newFacade=mat(0xd7cbb6),brick=mat(0x8b5947),trim=mat(0xe8e0d0),roofMat=mat(0x494e54),warmWood=mat(0x956d49);
const oldElements=[],newElements=[],scaffolding=[],villaWindows=[];
function block(group,list,w,h,d,x,y,z,material,phase=0){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);list.push({mesh,y,phase});return mesh;
}
const rb=(...args)=>block(restoration,additions[0],...args),vb=(...args)=>block(villa,additions[1],...args);
// Historic corner building inspired by the supplied photographs.
// True arched openings, projecting stonework, balustrades and a corner cupola.
const ivory=mat(0xe5ddcb,.88),sandstone=mat(0xc5b7a0,.82),windowWood=mat(0x44362c,.48),zinc=mat(0x697779,.45,.45);
const historicGlass=new THREE.MeshPhysicalMaterial({color:0x66818a,roughness:.14,metalness:.3,transparent:true,opacity:.82});
rb(12,.25,10,0,-.4,0,steel,-1);rb(11.6,.22,9.6,0,-.16,0,stone,-1);
const footprint=new THREE.Shape();footprint.moveTo(-4,-3);footprint.lineTo(4,-3);footprint.lineTo(4,1.8);footprint.lineTo(2.8,3);footprint.lineTo(-4,3);footprint.closePath();
function historicMesh(geometry,material,x,y,z,phase=-1,angle=0){
 const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.rotation.y=angle;mesh.castShadow=true;mesh.receiveShadow=true;restoration.add(mesh);additions[0].push({mesh,y,phase});return mesh;
}
function floorPlate(y,depth,material,phase){
 const g=new THREE.ExtrudeGeometry(footprint,{depth,bevelEnabled:false});g.rotateX(Math.PI/2);return historicMesh(g,material,0,y,0,phase);
}
// Face-local coordinates allow the same detailed treatment around the chamfered corner.
const faces=[{x:-.6,z:3,a:0,w:6.8,n:4},{x:4,z:-.6,a:Math.PI/2,w:4.8,n:3},{x:3.4,z:2.4,a:Math.PI/4,w:1.697,n:1}];
function faceMesh(face,g,material,x,y,z,phase){return historicMesh(g,material,face.x+x*Math.cos(face.a)+z*Math.sin(face.a),y,face.z-x*Math.sin(face.a)+z*Math.cos(face.a),phase,face.a);}
function fb(face,w,h,d,x,y,z,material,phase){return faceMesh(face,new THREE.BoxGeometry(w,h,d),material,x,y,z,phase);}
function archShape(width,height){const r=width/2,q=new THREE.Shape();q.moveTo(-r,0);q.lineTo(r,0);q.lineTo(r,height-r);q.absarc(0,height-r,r,0,Math.PI,false);q.lineTo(-r,0);return q;}
function balustrade(face,x,y,width,phase){
 fb(face,width+.18,.16,.75,x,y,.36,ivory,phase);
 fb(face,width+.1,.1,.15,x,y+.64,.68,ivory,phase);
 const profile=[new THREE.Vector2(.055,0),new THREE.Vector2(.065,.07),new THREE.Vector2(.035,.16),new THREE.Vector2(.075,.29),new THREE.Vector2(.04,.43),new THREE.Vector2(.055,.5)];
 const geo=new THREE.LatheGeometry(profile,8);
 const count=Math.round(width/.19);
 for(let k=0;k<=count;k++)faceMesh(face,geo,ivory,x-width/2+k*width/count,y+.1,.68,phase+.04);
 for(const side of [-1,1]){
  fb(face,.15,.68,.7,x+side*(width/2+.04),y+.32,.35,ivory,phase);
  fb(face,.16,.32,.32,x+side*width*.34,y-.22,.14,sandstone,phase);
 }
}
for(let f=0;f<4;f++){
 const base=.12+f*2.5,finish=1.7+f*.13;
 floorPlate(base,.15,concrete,-1);
 rb(7.9,2.45,.2,0,base+1.2,-2.95,oldFacade,-1);rb(.2,2.45,5.9,-3.95,base+1.2,0,oldFacade,-1);
 for(const face of faces){
  const wall=new THREE.Shape();wall.moveTo(-face.w/2,0);wall.lineTo(face.w/2,0);wall.lineTo(face.w/2,2.5);wall.lineTo(-face.w/2,2.5);wall.closePath();
  const gap=face.w/face.n,ww=face.n===1?1.08:1.04,wh=f===0?2.03:1.72,sill=f===0?.06:.44;
  for(let k=0;k<face.n;k++){
   const x=-face.w/2+gap*(k+.5),r=ww/2,hole=new THREE.Path();hole.moveTo(x-r,sill);hole.lineTo(x+r,sill);hole.lineTo(x+r,sill+wh-r);hole.absarc(x,sill+wh-r,r,0,Math.PI,false);hole.lineTo(x-r,sill);wall.holes.push(hole);
  }
  const wallGeo=new THREE.ExtrudeGeometry(wall,{depth:.18,bevelEnabled:false});
  oldElements.push(faceMesh(face,wallGeo,oldFacade,0,base,-.16,-1));
  newElements.push(faceMesh(face,wallGeo,ivory,0,base,-.15,finish));
  for(let k=0;k<face.n;k++){
   const x=-face.w/2+gap*(k+.5),r=ww/2,archY=base+sill+wh-r;
   const paneGeometry=new THREE.ShapeGeometry(archShape(ww,wh));
   oldElements.push(faceMesh(face,paneGeometry,spandrel,x,base+sill,-.10,-1));
   const pane=faceMesh(face,paneGeometry,historicGlass,x,base+sill,-.09,finish+.15);pane.castShadow=false;
   for(const side of [-1,1]){
    fb(face,.075,wh-r,.12,x+side*r,base+sill+(wh-r)/2,.015,windowWood,finish+.2);
    fb(face,.13,wh-r,.24,x+side*(r+.11),base+sill+(wh-r)/2,.07,sandstone,finish+.3);
   }
   faceMesh(face,new THREE.TorusGeometry(r,.04,5,18,Math.PI),windowWood,x,archY,.015,finish+.2);
   faceMesh(face,new THREE.TorusGeometry(r+.11,.085,5,20,Math.PI),ivory,x,archY,.09,finish+.3);
   fb(face,.045,wh,.07,x,base+sill+wh/2,.015,windowWood,finish+.2);
   fb(face,ww,.045,.07,x,archY,.015,windowWood,finish+.2);
   fb(face,ww+.34,.11,.34,x,base+sill-.04,.13,sandstone,finish+.3);
   fb(face,.17,.22,.25,x,archY+r+.08,.12,ivory,finish+.35);
   if(f>0){
    // Relief panel below the window and a rosette above its arch.
    fb(face,ww+.15,.22,.08,x,base+.2,.07,sandstone,finish+.35);
    faceMesh(face,new THREE.TorusGeometry(.13,.035,4,12),ivory,x,base+2.3,.10,finish+.4);
    if(face.n===1||(f===1&&k===1))balustrade(face,x,base+.38,ww+.28,finish+.4);
   }
  }
  // Layered cornices and pilasters give the facade real depth.
  for(const [dy,h,d] of [[.02,.09,.22],[2.38,.08,.27],[2.48,.12,.38]])fb(face,face.w+.08,h,d,0,base+dy,.06,ivory,finish+.3);
  for(let k=0;k<=face.n;k++){
   const x=-face.w/2+gap*k;
   if(f>0){
    fb(face,.18,2.07,.18,x,base+1.22,.06,sandstone,finish+.25);
    fb(face,.29,.15,.28,x,base+2.25,.09,ivory,finish+.3);
    fb(face,.25,.13,.25,x,base+.25,.09,ivory,finish+.3);
   }else for(let row=0;row<7;row++)fb(face,.35,.31,.1,x,base+.18+row*.34,.09,ivory,finish+.2);
  }
 }
}
floorPlate(10.2,.23,sandstone,2.8);
for(const face of faces){
 fb(face,face.w+.24,.22,.52,0,10.19,.13,ivory,2.85);
 for(let x=-face.w/2+.1;x<face.w/2;x+=.26)fb(face,.12,.16,.23,x,9.98,.19,ivory,2.85);
 fb(face,face.w,.5,.14,0,10.58,.0,ivory,2.9);
 fb(face,face.w+.1,.10,.3,0,10.85,.04,sandstone,2.9);
}
// Set-back glass roof and a small metal cupola at the corner.
rb(6.8,.18,4.6,-.35,10.72,-.4,zinc,2.9);
rb(6.7,.64,.05,-.35,11.08,1.92,glazing[1],3.0);
rb(.05,.64,4.3,3.0,11.08,-.3,glazing[1],3.0);
rb(7,.10,4.7,-.35,11.43,-.4,zinc,3.05);
for(let x=-3.65;x<3;x+=.62)rb(.035,.69,.075,x,11.08,1.96,steel,3.02);
const corner=faces[2];fb(corner,1.45,1.0,1.15,0,11.22,-.3,ivory,3.05);
faceMesh(corner,new THREE.ShapeGeometry(archShape(.7,.76)),historicGlass,0,10.86,.29,3.08);
const domeProfile=[new THREE.Vector2(.84,0),new THREE.Vector2(.84,.09),new THREE.Vector2(.72,.18),new THREE.Vector2(.59,.42),new THREE.Vector2(.43,.59),new THREE.Vector2(.25,.67),new THREE.Vector2(.24,.83)];
historicMesh(new THREE.LatheGeometry(domeProfile,12),zinc,3.17,11.73,2.17,3.1);
historicMesh(new THREE.CylinderGeometry(.11,.15,.48,8),zinc,3.17,12.74,2.17,3.14);
historicMesh(new THREE.ConeGeometry(.24,.34,8),zinc,3.17,13.14,2.17,3.17);
// Ground floor awnings, entrance and small planters.
for(const face of faces.slice(0,2))for(let k=0;k<face.n;k++){
 const x=-face.w/2+face.w/face.n*(k+.5);
 const canopy=fb(face,1.24,.1,.72,x,1.96,.43,trim,2.9);canopy.rotation.x=.12;
}
for(const side of [-1,1]){
 const x=3.4+side*.68*.707,z=2.4-side*.68*.707;
 rb(.34,.5,.34,x+.25,.26,z+.25,steel,3.1);
 const foliage=historicMesh(new THREE.ConeGeometry(.23,.92,8),leafMats[1],x+.25,.92,z+.25,3.15);
}
// Scaffold wraps both street elevations during the illustrative renovation.
for(const face of faces.slice(0,2)){
 for(let x=-face.w/2;x<=face.w/2+.05;x+=face.w/4)scaffolding.push(fb(face,.045,10.7,.045,x,5.35,.82,steel,-1));
 for(let h=0;h<5;h++){
  scaffolding.push(fb(face,face.w+.6,.065,.72,0,.8+h*2.15,.85,warmWood,-1));
  scaffolding.push(fb(face,face.w+.6,.035,.035,0,1.7+h*2.15,1.19,steel,-1));
 }
}
// Low villa: structural planes, warm interiors, open glazing and a terrace.
vb(13,.25,9,0,-.4,0,steel,-1);vb(12.5,.2,8.4,0,-.15,0,stone,0);
vb(9.7,.18,5.9,0,.07,0,concrete,.1);
for(const x of [-4.3,0,4.3])for(const z of [-2.5,2.5])vb(.15,2.9,.15,x,1.6,z,steel,.65);
vb(9.9,.22,6.1,0,3.13,0,trim,1.05);
vb(7,.16,4.5,-.6,3.31,-.3,concrete,1.15);
for(const x of [-3.6,2.4])for(const z of [-2.3,1.7])vb(.14,2.5,.14,x,4.6,z,steel,1.3);
vb(7.5,.22,4.8,-.6,5.98,-.3,trim,1.5);
vb(9.0,2.8,.2,0,1.6,-2.6,trim,1.9);vb(.2,2.8,5.1,-4.4,1.6,0,trim,1.9);
vb(2.1,2.8,.2,3.35,1.6,2.6,warmWood,2.0);
vb(6.5,2.44,.15,-.6,4.61,-2.36,trim,2.05);vb(.15,2.44,4,-3.8,4.61,-.3,trim,2.05);
for(const [w,h,d,x,y,z] of [[6.5,2.68,.035,-1.05,1.62,2.61],[.035,2.68,5.15,4.4,1.62,0],[6.25,2.38,.035,-.6,4.63,1.76],[.035,2.38,4,2.56,4.63,-.3]]){
 const mesh=vb(w,h,d,x,y,z,clearGlass,2.2);mesh.castShadow=false;villaWindows.push(mesh);
}
for(const x of [-4.25,-2.15,0,2.1])vb(.045,2.8,.07,x,1.6,2.65,steel,2.3);
vb(6.8,.11,1.15,-.6,3.27,2.35,trim,2.35);vb(6.6,.78,.035,-.6,3.73,2.9,glazing[1],2.55);vb(6.65,.035,.05,-.6,4.14,2.9,steel,2.55);
vb(8.6,.06,5,-.05,.22,0,warmWood,2.5);
// Furniture is genuinely inside the model and becomes visible on approach.
vb(2.4,.34,.9,-1.6,.48,1.35,upholstery,2.7);vb(2.4,.55,.16,-1.6,.77,1.75,upholstery,2.7);
vb(.7,.34,1.65,-2.6,.48,.65,upholstery,2.7);vb(1.25,.13,.8,-.6,.55,.4,warmWood,2.8);
vb(2.1,.9,.7,2.8,.7,-1.6,stone,2.8);vb(2.8,.09,.95,1.8,1.2,-1.55,steel,2.8);
vb(1.85,.4,2.0,-1,3.7,-.3,upholstery,2.8);
for(const x of [-4.4,4.2]){
 vb(.85,.4,.85,x,.4,3.45,steel,2.85);
 const leaves=new THREE.Mesh(new THREE.IcosahedronGeometry(.58,1),leafMats[1]);leaves.position.set(x,1.07,3.45);villa.add(leaves);additions[1].push({mesh:leaves,y:1.07,phase:3.0});
}
for(const g of [restoration,villa]){const grid=new THREE.GridHelper(15,24,0x42618b,0x293949);grid.position.y=-.54;g.add(grid);}
const story=document.querySelector('.story'),phase=document.querySelector('#phase'),pct=document.querySelector('#percent'),progress=document.querySelector('.progress i'),modelNote=document.querySelector('.model-note');let target=0,current=0,visible=true,dirty=true;
const clamp=THREE.MathUtils.clamp,smooth=(a,b,x)=>THREE.MathUtils.smoothstep(x,a,b);
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;}
function scroll(){target=clamp(-story.getBoundingClientRect().top/(story.offsetHeight-innerHeight),0,1);dirty=true;}
addEventListener('resize',resize);addEventListener('scroll',scroll,{passive:true});resize();scroll();
new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)dirty=true;}).observe(story);
function grow(list,p){for(const part of list){if(part.phase<0)continue;const amount=smooth(part.phase*.85,part.phase*.85+.65,p*4.3);part.mesh.visible=amount>.005;part.mesh.scale.y=Math.max(.001,amount);part.mesh.position.y=part.y+(1-amount)*(reduced?0:1.8);}}
function frame(){requestAnimationFrame(frame);if(!visible||(!dirty&&Math.abs(current-target)<.0001))return;
 current=reduced?target:current+(target-current)*.075;const t=current;
 const first=clamp(t/.29,0,1),second=clamp((t-.35)/.28,0,1),third=clamp((t-.69)/.28,0,1);
 const travel1=smooth(.29,.36,t),travel2=smooth(.63,.70,t);
 const center=new THREE.Vector3(26*(travel1+travel2),7-.7*travel1-3.3*travel2,0);
 const radius=9.8-.6*travel1-1.65*travel2-1.0*smooth(.90,1,t);
 const vf=THREE.MathUtils.degToRad(camera.fov),hf=2*Math.atan(Math.tan(vf/2)*camera.aspect),distance=radius/Math.sin(Math.min(vf,hf)/2);
 const angle=.6+.28*Math.sin(t*Math.PI*2);
 camera.position.copy(center).add(new THREE.Vector3(Math.sin(angle),.48,Math.cos(angle)).normalize().multiplyScalar(distance));camera.lookAt(center);
 key.position.set(center.x+8,20,10);key.target.position.copy(center);scene.add(key.target);fill.position.set(center.x-6,8,-5);
 building.rotation.y=-.35+first*.95;restoration.rotation.y=-.30+second*.12;villa.rotation.y=-.2+third*.38;
 building.visible=t<.43;restoration.visible=t>.25&&t<.77;villa.visible=t>.58;
 grow(parts,first);grow(additions[0],second);grow(additions[1],third);
 edgeGroup.visible=first<.45;edgeGroup.children.forEach(e=>{e.material.opacity=.23*(1-Math.min(1,first/.45));});
 oldElements.forEach(m=>{m.visible=second<.43;});
 scaffolding.forEach(m=>{m.visible=second>.12&&second<.78;});
 villaWindows.forEach(m=>{m.visible=m.visible&&third<.9;});
 const n=t<.33?0:t<.67?1:2;
 phase.textContent=['01 / NOVOGRADNJA','02 / REKONSTRUKCIJA','03 / VILA I INTERIJER'][n];
 modelNote.innerHTML=['CS / NOVOGRADNJA','CS / OBNOVA','CS / ZAVRŠNI RADOVI'][n]+'<span>Ilustrativni model · '+(n+1)+' / 3</span>';
 pct.textContent=String(Math.round(t*100)).padStart(2,'0')+'%';progress.style.width=t*100+'%';renderer.render(scene,camera);dirty=false;
}frame();
}
document.querySelector('#year').textContent=new Date().getFullYear();
