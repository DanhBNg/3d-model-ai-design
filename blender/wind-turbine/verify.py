import bpy,sys,json,math,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
try:
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    asset=ROOT/'public/models/wind-turbine.glb';bpy.ops.import_scene.gltf(filepath=str(asset))
    ids=['tower','nacelle_shell','nacelle_base','hub','blade_0','blade_1','blade_2','main_shaft','main_bearing','gearbox_case','gear_input','gear_intermediate','gear_output','brake','generator_stator','generator_rotor','controls','yaw_ring','yaw_motor','sensors']
    for id in ids:assert id in bpy.data.objects,id
    triangles=0;points=[]
    for o in bpy.context.scene.objects:
        if o.type=='MESH':
            o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
            for v in o.data.vertices:
                p=o.matrix_world@v.co;assert all(math.isfinite(x) for x in p);points.append(p)
    mn=[min(p[i] for p in points) for i in range(3)];mx=[max(p[i] for p in points) for i in range(3)]
    assert 57<mx[2]<60 and abs(mn[2])<.1,(mn,mx)
    hub=bpy.data.objects['rotor_spin'].matrix_world.translation;shaft=bpy.data.objects['shaft_spin'].matrix_world.translation
    assert abs(hub.z-shaft.z)<1e-5 and abs(hub.y-shaft.y)<1e-5
    assert triangles<150000 and asset.stat().st_size<6000000
    report={'passed':True,'assemblies':len(ids),'triangles':triangles,'bytes':asset.stat().st_size,'boundsBlender':{'min':mn,'max':mx},'sha256':hashlib.sha256(asset.read_bytes()).hexdigest()}
    (ROOT/'output/wind-turbine/verification.json').write_text(json.dumps(report,indent=2));print('AGENT_OK '+json.dumps(report))
except Exception:
    import traceback;traceback.print_exc();print('AGENT_FAIL wind verify');sys.exit(1)
