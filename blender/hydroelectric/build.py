import bpy,sys,json,hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(HERE))
from materials import palette
from geometry import consolidate
import civil,machinery,exterior,details
try:
    assert bpy.app.version[:2]==(5,2),str(bpy.app.version)
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.context.scene.unit_settings.system='METRIC'
    block='--blockout' in sys.argv;m=palette();civil.build(m,not block);machinery.build(m,not block);exterior.build(m);details.build(m);consolidate()
    suffix='-blockout' if block else '';asset=ROOT/f'public/models/hydroelectric{suffix}.glb'
    assert bpy.ops.wm.save_as_mainfile(filepath=str(HERE/f'hydroelectric{suffix}.blend'))=={'FINISHED'}
    assert bpy.ops.export_scene.gltf(filepath=str(asset),export_format='GLB',export_yup=True,export_animations=False,export_extras=True)=={'FINISHED'}
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];tri=0
    for o in meshes:o.data.calc_loop_triangles();tri+=len(o.data.loop_triangles)
    assert tri<180000 and asset.stat().st_size<8000000
    report={'blender':bpy.app.version_string,'triangles':tri,'meshes':len(meshes),'bytes':asset.stat().st_size,'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'purpose':'educational web diorama','blockout':block}
    (HERE/f'build{suffix}-report.json').write_text(json.dumps(report,indent=2),encoding='utf8');print('AGENT_OK '+json.dumps(report))
except Exception:
    import traceback;traceback.print_exc();print('AGENT_FAIL hydro build');sys.exit(1)
