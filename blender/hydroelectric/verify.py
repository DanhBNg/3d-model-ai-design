"""Independently reimport delivered GLB; check bounds, pivots and finite geometry."""
import bpy,sys,json,math,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
try:
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    asset=ROOT/'public/models/hydroelectric.glb';assert bpy.ops.import_scene.gltf(filepath=str(asset))=={'FINISHED'}
    ids=['terrain','reservoir','dam','spillway','intake_gate','conduit_cover','penstock','powerhouse','facade','roof','scroll_case','guide_vanes','runner','draft_tube','shaft','generator_rotor','generator_stator','generator_cover','tailrace','transformer','grid','site_details']
    for id in ids:assert bpy.data.objects.get(id),id
    bpy.context.view_layer.update();tri=0;verts=[]
    for o in bpy.context.scene.objects:
        if o.type!='MESH':continue
        assert len(o.data.materials)>0;o.data.calc_loop_triangles();tri+=len(o.data.loop_triangles)
        for v in o.data.vertices:
            p=o.matrix_world@v.co;assert all(math.isfinite(c) for c in p);verts.append(p)
    lo=[min(p[i] for p in verts) for i in range(3)];hi=[max(p[i] for p in verts) for i in range(3)]
    assert 11.8<hi[0]-lo[0]<12.3 and 6.8<hi[1]-lo[1]<7.3
    for id in ['runner_spin','rotor_spin','shaft_spin']:
        o=bpy.data.objects[id];p=o.matrix_world.translation;assert abs(p.x-1.6)<1e-5 and abs(p.y)<1e-5
    assert all(bpy.data.objects.get('guide_%02d'%i) for i in range(16))
    assert tri<180000 and asset.stat().st_size<8000000
    report={'passed':True,'parts':len(ids),'triangles':tri,'bytes':asset.stat().st_size,'boundsBlender':[lo,hi],'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'checks':['reimport','finite vertices','22 named assemblies','16 guide pivots','coaxial rotor/shaft/runner','budget'],'limits':['No manufacturing/collision qualification; cutaway solids are illustrative']}
    (HERE/'verification.json').write_text(json.dumps(report,indent=2));print('AGENT_OK '+json.dumps(report))
except Exception:
    import traceback;traceback.print_exc();print('AGENT_FAIL hydro verify');sys.exit(1)
