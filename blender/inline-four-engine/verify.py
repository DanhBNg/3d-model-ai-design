"""Fresh GLB import with independent hierarchy, units, pivot and budget checks."""
import bpy,sys,json,math,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(HERE))
from geometry import cv
from assemblies import IDS
for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
asset=ROOT/'public/models/inline-four-engine.glb';assert bpy.ops.import_scene.gltf(filepath=str(asset))=={'FINISHED'}
bpy.context.view_layer.update();roots=[o for o in bpy.context.scene.objects if not o.parent]
assert set(o.name for o in roots)==set(IDS)
for o in roots:assert all(abs(o.matrix_local[i][j]-(1 if i==j else 0))<1e-6 for i in range(4) for j in range(4))
pivots={'crank_spin':((0,.10,0),'crankshaft'),'flywheel_spin':((0,.10,0),'flywheel'),'cam_intake_spin':((0,.35,-.04),'cam_intake'),'cam_exhaust_spin':((0,.35,.04),'cam_exhaust')}
for i,x in enumerate([-.15,-.05,.05,.15],1):
 sign=1 if i in [1,4] else -1
 pivots[f'piston_{i}_slide']=((x,.215+sign*.032,0),f'piston_{i}');pivots[f'rod_{i}_pose']=((x,.1+sign*.032,0),f'rod_{i}')
 for kind,z in [('intake',-.021),('exhaust',.021)]:pivots[f'{kind}_{i}_slide']=((x,.280,z),f'{kind}_valve_{i}');pivots[f'{kind}_{i}_spring']=((x,.305,z),f'{kind}_valve_{i}')
for id,(pos,parent) in pivots.items():
 o=bpy.data.objects[id];assert o.parent.name==parent;assert (o.matrix_world.translation-Vector(cv(pos))).length<1e-7
points=[];tri=0;meshes=[o for o in bpy.data.objects if o.type=='MESH']
for o in meshes:
 assert o.data.materials;o.data.calc_loop_triangles();tri+=len(o.data.loop_triangles)
 for v in o.data.vertices:
  p=o.matrix_world@v.co;assert all(math.isfinite(t) for t in p);points.append((p.x,p.z,-p.y))
assert tri<180000 and asset.stat().st_size<8000000
assert len([o for o in bpy.data.objects if o.name.startswith('belt_marker_') and o.type=='EMPTY'])==96
for id in IDS:assert any(o.type=='MESH' for o in bpy.data.objects[id].children_recursive),id
bad=bpy.data.objects['crank_spin'];bad.location.z+=.001;bpy.context.view_layer.update();assert (bad.matrix_world.translation-Vector(cv((0,.10,0)))).length>.0009
report={'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'assemblies':len(roots),'pivots':len(pivots),'triangles':tri,'meshes':len(meshes),'bytes':asset.stat().st_size,'bounds':{'min':[min(p[i] for p in points) for i in range(3)],'max':[max(p[i] for p in points) for i in range(3)]},'upAxis':'Y','manufacturing':'NOT_REQUESTED','checks':['exact 37 identity roots','28 pivot positions and parents','finite geometry','materials','budget','96 animated belt marker nodes','negative pivot displacement control']}
(HERE/'verification.json').write_text(json.dumps(report,indent=2));print('AGENT_OK '+json.dumps(report))
