# IGNIS 06 — Inline four engine

Approved: four cylinders with single-cylinder focus; proceed implementation. Use Design OS Blender pinned toolchain, editable native scripts/blend/GLB; render-only educational original engine. No push/deploy. Preserve existing five experiences.

Architecture: src/models/inline-four-engine owns metadata/materials/loadModel/simulation/controller. src/experiences/inline-four-engine owns UI/studio/effects/lifecycle. Native sources blender/inline-four-engine. Route `/models/inline-four-engine`, IGNIS06.

## Shared mechanical contract

Y-up metres. Crank axis X at y=.10,z=0. Four cylinders centered X[-.15,-.05,.05,.15]. Crank throw r=.032,rod lengthL=.115, piston pin y=.10+r*cos(theta)+sqrt(L²-r²sin²(theta)),z=0. Crankpin y=.10+r*cos(theta),z=r*sin(theta). Pistons pin origin, crown +.020 above pin, skirt -.030; pistonradius.037,bore.038. Cylinder bottomY.185 topY.283; TDC pin.247/crown.267,BDC pin.183/crown.203. Chamber roof.283 (clearance.016). Fourstroke ideal phases at localangle0..180intake,180..360compression,360..540power,540..720exhaust. Global crankangle0 firstcylinder intakeTDC. Local phase offsets[0,180,540,360], power events order1-3-4-2 across720. Mechanical crank phases[0,180,180,0]. Crank rotation about X with z=r*sin theta.

Two camshafts parallelX, y=.350,z=-.021(intake) /+.021(exhaust). Eight vertical valves alongY (two per cylinder), closedheadY.280,radius.012,stem goes to bucketY.327; lift down .006*sin²(pi*strokeProgress). Springs lower seatY.305,upper seat moves with bucket; max lift.006. Cam base radius.023, nose +.006; analytic radial lobeprofile shared from simulation assumptions; cam turns angle/2. At each cylinder intake lobe max lift when localangle90 (global90-offset),exhaust local630; at peak lobe points down towardbucket. Cam axisY.350 and bucketclosedtopY.327 gives base contact. Need ensure profile/flat follower consistency educational approximation stated.

Timing belt at X=-.225 in YZ plane: space cam axesZ±.040, keep vertical valvesZ±.021 with small rocker arms between cam and valve. Timing pulleysradius.038 and crankradius.019, camcentresY.350,Z±.040 clear2*.038<.080. Both cams rotate same direction via outer belt triangle, crank2:1. Valve buckets atZ±.021 use rockers to bridge19mm. Agent may refine rocker geometry but do not imply direct bucket contact atdifferentZ. Spark centerXc,Y.292,Z0.

## Scene graph

Identity assembly roots: block_front,block_rear,head,cam_cover,sump,timing_cover,crankshaft,flywheel,cam_intake,cam_exhaust,timing_belt,intake_manifold,exhaust_manifold. For i1..4: cylinder_i,piston_i,rod_i,intake_valve_i,exhaust_valve_i,spark_plug_i (24) =>37parts.

Movable pivot empties: crank_spin childcrankshaft at[0,.10,0], flywheel_spin childflywheel sameorigin;cam_intake_spin at[0,.350,-.040],cam_exhaust_spin at[0,.350,.040]. piston_i_slide childpiston_i at[x,pinY(theta_i),0]; rod_i_pose childrod_i at[x,crankpinY_i,crankpinZ_i], rodlocal extends+Y length.115,rest quaternionX=atan2(-crankpinZ,pinY-crankpinY); valve_i pivots named intake_i_slide/exhaust_i_slide at[x,.280,±.021], valves localheadsY0 stems+.047. Asset rest globalangle0,rod/piston correct rest phases. Controller sets absolutepivotpositions/quaternions derived analytically everyframe; roots only used for exploded offsets. Valve springs/rockers within valve assembly can animated child; assetagent coordinate modelagent names.

## APIs

Model `loadEngineModel({url,buffer,signal})`,`createEngineRuntime`,`createEngineController(root)`. PARTS/PART_BY_ID,PIVOT_IDS exported. simulation exports ENGINE_SPEC, sampleEngine(angleDeg) =>{angle,camAngle,cylinders:[{index,phase,localAngle,pinY,crankY,crankZ,rodAngle,intakeLift,exhaustLift,spark}]}.

Controller state {mode:'explore',angle:0,rpm:600,playing:true,slow:false,time:0,selected:null,isolated:false,cutaway:false,cover:0,explode:0,explodeTarget:0,auto:false,focusCylinder:0,transition:false,sample}. focusCylinder0 all,1..4single. Methods setMode/select/setIsolated/setCutaway/setExplode/toggleAuto/setPlaying/setSlow/setRPM/setAngle/setCylinder/reset/update/dispose. RPM label real educational requested600..2400, visual angularspeed 45deg/sec at600 (80xslow),.25slow. setAngle0..720 should support exact720 state showingcycle boundary; no discontinuity. Snap to fourphase beginnings by viewer uses localoffset chosen. Focus doesn't resetangle; hides other cylinderparts and opaque covers but retains commoncrank/cams/belt; camera selected cylinder.

Viewer `mountEngineExperience({modelUrl,onExit})`,window.__engine root/runtime/controller/studio/effects/dispose. prefixengine-,data-emode,data-epart,data-eview,data-ecylinder. Same3modes responsive dark/matte like drone. Controls fourstates selectable,720slider,RPM,pause/slow/reset,all/1/2/3/4 selector, camera hero/cylinder/timing. Effects:gasvolume clipped to bore/chamberabovepiston,colorperphase; intake/exhaust wide-line arrows only correctopenvalve,briefsparkat360,combustionwarmglow. No particles. Timing belt actual moving teeth/markers alignedpath,not staticfakeifrunning. Camera can trace crankbeltcamvalve then cylinder.

## Execution and checks

- [x] Build blockout/render inspect then details original matte mechanical assembly; no solidbox cylinder obscuring cutaway. Closed exterior+frontcutaway; allimportantpart IDs and pivots verified on freshGLB. Editableblend+python+4renders+thumbnail, <180ktris/<8MB.
- [x] Test puregeometry slidercrank rodlength,stroke,endpoints720,phaseorder,camratio,valvetiming,then runtimeindependence/rest/transition/pause/singlefocus.
- [ ] Viewer responsive readable,cutaway and onecylinder coherently showmechanics; verify every90deg and severalcamphases images,avoid intersections.
- [x] Integrate6thcatalog/main/scripts/offlineexport; testall/build/browser/offline6models.
- [x] Docs README/engineprinciples/PROJECT_HANDOFF stats/hash/reports, sourceverificationlimits.

References supplied Wikimedia 4-Stroke-Engine.gif and with-airflows.gif; user images represent different OHV/DOHC engines, choose one consistent DOHC8valve teachingdesign. Idealized valve timing no overlap, ignition at360,not realECU/combustion/CFD/torquesolver. Dimensions inferred,no brand/no manufacturingclaim. Beltprofile and rockercontact simplified explicitly.
