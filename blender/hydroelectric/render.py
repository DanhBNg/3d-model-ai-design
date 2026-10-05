"""Review exported asset in a fresh process. Front/rear/top and mechanical detail."""
import bpy,sys,math,json,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(HERE))
from geometry import cv
try:
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    block='--blockout' in sys.argv;suffix='-blockout' if block else '';asset=ROOT/f'public/models/hydroelectric{suffix}.glb'
    asset_hash=hashlib.sha256(asset.read_bytes()).hexdigest()
    assert bpy.ops.import_scene.gltf(filepath=str(asset))=={'FINISHED'}
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=12;scene.cycles.use_denoising=True
    scene.render.resolution_x=960;scene.render.resolution_y=720;scene.render.resolution_percentage=100
    scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.10,.14,.17,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.7
    for name,pos,power,size in [('Key',(-4,12,-6),2300,9),('Rim',(4,8,5),1800,7),('Fill',(6,5,-7),1100,8)]:
        d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=cv(pos);o.rotation_euler=(Vector(cv((0,1,0)))-o.location).to_track_quat('-Z','Y').to_euler()
    cam=bpy.data.objects.new('Review camera',bpy.data.cameras.new('Review camera'));scene.collection.objects.link(cam);scene.camera=cam;cam.data.type='ORTHO'
    out=ROOT/'output/hydroelectric'/('blockout' if block else 'renders');out.mkdir(parents=True,exist_ok=True)
    shots=[('front',(10,9,-14),(0,1.7,0),15),('rear',(-10,9,14),(0,1.7,0),15),('top',(0,20,-.01),(0,1,0),15),('cutaway',(10,9,-14),(0,1.7,0),15),('detail',(5,5,-6),(1.6,2,0),5.5)]
    shots.append(('reference-side',(0,3,-18),(0,1.5,0),14))
    if block:shots=shots[:1]
    for name,pos,target,scale in shots:
        for id in ['roof','facade','conduit_cover']:
            for o in [bpy.data.objects[id],*bpy.data.objects[id].children_recursive]:o.hide_render=name in ['cutaway','detail','reference-side']
        cam.location=cv(pos);cam.rotation_euler=(Vector(cv(target))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
        scene.render.filepath=str(out/(name+'.png'));assert bpy.ops.render.render(write_still=True)=={'FINISHED'}
    report={'sha256':asset_hash,'shots':[s[0] for s in shots],'engine':'Cycles','samples':12}
    (out/'receipt.json').write_text(json.dumps(report,indent=2));print('AGENT_OK '+json.dumps(report))
except Exception:
    import traceback;traceback.print_exc();print('AGENT_FAIL hydro render');sys.exit(1)
