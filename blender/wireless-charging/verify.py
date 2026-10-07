"""Fresh-process verification of exact delivered geometry and assembly contract."""
import bpy,sys,json,math,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(HERE))
from geometry import cv
from assemblies import IDS
try:
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    asset=ROOT/'public/models/wireless-charging.glb';assert bpy.ops.import_scene.gltf(filepath=str(asset))=={'FINISHED'}
    bpy.context.view_layer.update();roots=[o for o in bpy.context.scene.objects if not o.parent];assert set(o.name for o in roots)==set(IDS)
    for o in roots:
        assert o.location.length<1e-7 and all(abs(s-1)<1e-7 for s in o.scale)
        assert all(abs(o.matrix_local[i][j]-(1 if i==j else 0))<1e-6 for i in range(4) for j in range(4))
    sockets={'tx_center':(0,.007,0),'rx_center':(0,.013,0)}
    for id,p in sockets.items():
        o=bpy.data.objects[id];assert (o.matrix_world.translation-Vector(cv(p))).length<1e-7;assert o.parent.name==id[:2]+'_coil'
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];tri=0;points=[];assembly_bounds={}
    for o in meshes:
        assert len(o.data.materials)>0;o.data.calc_loop_triangles();tri+=len(o.data.loop_triangles)
        for v in o.data.vertices:
            p=o.matrix_world@v.co;assert all(math.isfinite(c) for c in p);points.append((p.x,p.z,-p.y))
    for root in roots:
        pp=[]
        for o in root.children_recursive:
            if o.type=='MESH':
                for v in o.data.vertices:p=o.matrix_world@v.co;pp.append((p.x,p.z,-p.y))
        assert pp;assembly_bounds[root.name]={'min':[min(p[i] for p in pp) for i in range(3)],'max':[max(p[i] for p in pp) for i in range(3)]}
    assert tri<100000 and asset.stat().st_size<5000000
    # Negative controls show identity and socket predicates distinguish a displaced root.
    tx=bpy.data.objects['tx_coil'];tx.location.z=.001;bpy.context.view_layer.update()
    assert (bpy.data.objects['tx_center'].matrix_world.translation-Vector(cv(sockets['tx_center']))).length>.0009
    tx.location.z=0;bpy.context.view_layer.update()
    report={'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'assemblies':len(roots),'sockets':sockets,'triangles':tri,'meshes':len(meshes),'bytes':asset.stat().st_size,'bounds':{'min':[min(p[i] for p in points) for i in range(3)],'max':[max(p[i] for p in points) for i in range(3)]},'assemblyBounds':assembly_bounds,'upAxis':'Y','manufacturing':'NOT_REQUESTED','checks':['exact roots','identity transforms','socket parents and world positions','finite geometry','materials','budget','negative control socket displacement']}
    (HERE/'verification.json').write_text(json.dumps(report,indent=2));print('AGENT_OK '+json.dumps({k:v for k,v in report.items() if k!='assemblyBounds'}))
except Exception:
    import traceback;traceback.print_exc();print('AGENT_FAIL wireless verify');sys.exit(1)
