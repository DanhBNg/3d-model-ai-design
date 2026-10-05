"""Independent fresh-process verification of the delivered GLB."""
import bpy,sys,json,math,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(HERE))
from geometry import cv
IDS='site coal_supply boiler_shell boiler_tubes furnace flue_filter stack hall_shell turbine_hp_shell turbine_hp_rotor turbine_lp_shell turbine_lp_rotor bearings generator_shell generator_rotor condenser_shell condenser_bundle feed_pump cooling_pump cooling_tower transformer grid steam_pipes feed_pipes cooling_pipes flue_duct'.split()
try:
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    asset=ROOT/'public/models/thermal-power.glb';assert bpy.ops.import_scene.gltf(filepath=str(asset))=={'FINISHED'}
    bpy.context.view_layer.update();roots=[o for o in bpy.context.scene.objects if not o.parent];assert set(o.name for o in roots)==set(IDS)
    for o in roots:assert o.location.length<1e-5 and all(abs(s-1)<1e-5 for s in o.scale)
    pivots={'hp_spin':(-1.8,2.1,-1.3),'lp_spin':(2.4,2.1,-1.3),'generator_spin':(5.3,2.1,-1.3),'feed_spin':(-1.2,.45,-3.1),'cooling_spin':(6.9,.45,1.6)}
    for id,p in pivots.items():
        o=bpy.data.objects[id];assert (o.matrix_world.translation-Vector(cv(p))).length<1e-4;assert len(o.children)>0
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
    assert tri<180000 and asset.stat().st_size<8000000
    for name,r in [('hp',.53),('lp',.91)]:
        spin=bpy.data.objects[name+'_spin'];radius=max(math.hypot(v.co.y,v.co.z) for o in spin.children if o.type=='MESH' for v in o.data.vertices);assert radius<r+.02
    report={'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'assemblies':len(roots),'pivots':list(pivots),'triangles':tri,'meshes':len(meshes),'bytes':asset.stat().st_size,'bounds':{'min':[min(p[i] for p in points) for i in range(3)],'max':[max(p[i] for p in points) for i in range(3)]},'assemblyBounds':assembly_bounds,'axis':'X','manufacturing':'NOT_REQUESTED','checks':['exact roots','identity transforms','pivot world positions','finite geometry','materials','rotor envelope','budget']}
    (HERE/'verification.json').write_text(json.dumps(report,indent=2));print('AGENT_OK '+json.dumps({k:v for k,v in report.items() if k!='assemblyBounds'}))
except Exception:
    import traceback;traceback.print_exc();print('AGENT_FAIL thermal verify');sys.exit(1)
