import bpy,sys,json,hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(HERE))
from materials import palette
from geometry import consolidate
from assemblies import build
try:
    assert bpy.app.version[:2]==(5,2)
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    block='--blockout' in sys.argv
    bpy.context.scene.unit_settings.system='METRIC';build(palette(),not block)
    # Merge only within semantic assemblies/pivots, flatten decorative axis empties.
    keep={'tower','yaw','yaw_ring','nacelle_base','nacelle_shell','rotor_spin','hub','main_shaft','shaft_spin','main_bearing','gearbox_case','gear_input','input_spin','gear_intermediate','intermediate_spin','gear_output','output_spin','brake','brake_spin','generator_stator','generator_rotor','generator_spin','controls','yaw_motor','sensors','anemometer_spin','vane_spin'}
    keep.update('blade_'+str(i) for i in range(3));keep.update('blade_mount_'+str(i) for i in range(3))
    bpy.context.view_layer.update()
    for o in list(bpy.context.scene.objects):
        if o.type!='MESH':continue
        p=o.parent
        while p and p.name not in keep:p=p.parent
        if p!=o.parent:
            world=o.matrix_world.copy();o.parent=p;o.matrix_world=world
    for o in list(bpy.context.scene.objects):
        if o.type=='EMPTY' and o.name not in keep:bpy.data.objects.remove(o,do_unlink=True)
    consolidate()
    suffix='-blockout' if block else '';asset=ROOT/f'public/models/wind-turbine{suffix}.glb'
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/f'wind-turbine{suffix}.blend'))
    bpy.ops.export_scene.gltf(filepath=str(asset),export_format='GLB',export_yup=True,export_extras=True,export_animations=False)
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];tri=0
    for o in meshes:o.data.calc_loop_triangles();tri+=len(o.data.loop_triangles)
    assert tri<150000 and asset.stat().st_size<6000000
    report={'triangles':tri,'meshes':len(meshes),'bytes':asset.stat().st_size,'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'blender':bpy.app.version_string,'blockout':block}
    (HERE/f'build{suffix}-report.json').write_text(json.dumps(report,indent=2));print('AGENT_OK '+json.dumps(report))
except Exception:
    import traceback;traceback.print_exc();print('AGENT_FAIL wind build');sys.exit(1)
