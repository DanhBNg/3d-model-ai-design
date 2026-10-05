"""Review exported asset in a fresh process. Front/rear/top and mechanical detail."""
import bpy,sys,math,json,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(HERE))
from geometry import cv
try:
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    block='--blockout' in sys.argv;suffix='-blockout' if block else '';asset=ROOT/f'public/models/wind-turbine{suffix}.glb'
    asset_hash=hashlib.sha256(asset.read_bytes()).hexdigest()
    assert bpy.ops.import_scene.gltf(filepath=str(asset))=={'FINISHED'}
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True
    scene.render.resolution_x=960;scene.render.resolution_y=720;scene.render.resolution_percentage=100
    scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.10,.14,.17,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.7
    for name,pos,power,size in [('Key',(-15,55,-20),18000,25),('Rim',(10,42,15),12000,18),('Fill',(6,37,-7),1600,8)]:
        d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=cv(pos);o.rotation_euler=(Vector(cv((0,35,0)))-o.location).to_track_quat('-Z','Y').to_euler()
    cam=bpy.data.objects.new('Review camera',bpy.data.cameras.new('Review camera'));scene.collection.objects.link(cam);scene.camera=cam;cam.data.type='ORTHO'
    out=ROOT/'output/wind-turbine'/('blockout' if block else 'renders');out.mkdir(parents=True,exist_ok=True)
    shots=[('front',(-35,40,-75),(0,33,0),70),('rear',(35,40,75),(0,33,0),70),('cutaway',(-9,39,-12),(.6,35.8,0),8.5),('detail',(1,37.5,-14),(.6,35.8,0),7.5)]
    if block:shots=shots[:1]
    for name,pos,target,scale in shots:
        for id in ['nacelle_shell','sensors']:
            for o in [bpy.data.objects[id],*bpy.data.objects[id].children_recursive]:o.hide_render=name in ['cutaway','detail','reference-side']
        cam.location=cv(pos);cam.rotation_euler=(Vector(cv(target))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
        scene.render.filepath=str(out/(name+'.png'));assert bpy.ops.render.render(write_still=True)=={'FINISHED'}
    report={'sha256':asset_hash,'shots':[s[0] for s in shots],'engine':'Cycles','samples':12}
    (out/'receipt.json').write_text(json.dumps(report,indent=2));print('AGENT_OK '+json.dumps(report))
except Exception:
    import traceback;traceback.print_exc();print('AGENT_FAIL wind render');sys.exit(1)
