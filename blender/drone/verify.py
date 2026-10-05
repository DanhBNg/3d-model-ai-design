"""Independent verification of the delivered GLB, in an empty Blender process."""
import bpy, json, math, hashlib, sys
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
try:
    asset=ROOT/'public/models/drone.glb';build=json.loads((HERE/'drone-build-report.json').read_text())
    digest=hashlib.sha256(asset.read_bytes()).hexdigest();assert digest==build['sha256']
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    result=bpy.ops.import_scene.gltf(filepath=str(asset));assert result=={'FINISHED'}
    bpy.context.view_layer.update();pts=[];triangles=0;meshes=[]
    for o in bpy.context.scene.objects:
        assert all(math.isfinite(v) for row in o.matrix_world for v in row)
        if o.type=='MESH':
            assert len(o.data.materials)>0 and len(o.data.vertices)>0
            o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles);meshes.append(o.name)
            for v in o.data.vertices:
                p=o.matrix_world@v.co;assert all(math.isfinite(c) for c in p);pts.append(p)
    assert triangles==build['triangles'],(triangles,build['triangles'])
    for name in build['assemblies']:assert name in bpy.data.objects,name
    bounds=[[min(p[i] for p in pts) for i in range(3)],[max(p[i] for p in pts) for i in range(3)]]
    size=[bounds[1][i]-bounds[0][i] for i in range(3)]
    assert .4<size[0]<.6 and .08<size[2]<.2,(bounds,size)
    for id,x,z in [('fl',-.145,-.13),('fr',.145,-.13),('rl',-.145,.13),('rr',.145,.13)]:
        prop=bpy.data.objects['prop_'+id].matrix_world.translation
        assert (prop-Vector((x,-z,.113))).length<1e-6,tuple(prop)
        assert bpy.data.objects['rotor_'+id].parent==bpy.data.objects['motor_'+id]
    assert bpy.data.objects['gimbal_pitch'].parent==bpy.data.objects['gimbal_roll']
    assert bpy.data.objects['gimbal_roll'].parent==bpy.data.objects['gimbal_yaw']
    report={'passed':True,'scope':'GLB reimport, named assemblies, mesh finiteness/materials, metre bounds, motor/gimbal pivots','sha256':digest,'triangles':triangles,'meshCount':len(meshes),'blenderBounds':bounds,'sizeMetres':size,'assetBytes':asset.stat().st_size,'blender':bpy.app.version_string}
    (HERE/'verification-report.json').write_text(json.dumps(report,indent=2),encoding='utf8');print('AGENT_OK '+json.dumps(report))
except Exception as e:
    import traceback;traceback.print_exc();print('AGENT_FAIL '+json.dumps({'error':str(e)}));sys.exit(1)
