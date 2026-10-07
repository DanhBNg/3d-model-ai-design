"""Disposable-process inspection of exported GLB, never render a substitute scene."""
import bpy,sys,math,json,hashlib,shutil
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(HERE))
from geometry import cv
from assemblies import IDS
try:
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    block='--blockout' in sys.argv;suffix='-blockout' if block else '';asset=ROOT/f'public/models/wireless-charging{suffix}.glb'
    assert bpy.ops.import_scene.gltf(filepath=str(asset))=={'FINISHED'}
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=20;scene.cycles.use_denoising=True
    scene.render.resolution_x=960 if not block else 512;scene.render.resolution_y=720 if not block else 384;scene.render.resolution_percentage=100
    scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.10,.14,.19,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.5
    for name,pos,power,size in [('Key',(-.2,.4,-.3),10,.3),('Rim',(.2,.25,.15),7,.22),('Fill',(.3,.15,-.1),4,.22)]:
        d=bpy.data.lights.new(name,'AREA');d.energy=power*.08;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=cv(pos);o.rotation_euler=(Vector(cv((0,.03,0)))-o.location).to_track_quat('-Z','Y').to_euler()
    cam=bpy.data.objects.new('Review camera',bpy.data.cameras.new('Review camera'));scene.collection.objects.link(cam);scene.camera=cam;cam.data.type='ORTHO';cam.data.clip_start=.001
    out=ROOT/'output/wireless-charging'/('blockout' if block else 'renders');out.mkdir(parents=True,exist_ok=True)
    shots=[('closed',(.20,.27,.24),(-.035,.02,0),.27),('exploded',(.21,.20,.28),(-.01,.065,0),.29),('coils',(.085,.09,.12),(0,.016,0),.105),('rear',(-.16,-.22,-.24),(-.02,.01,0),.25)]
    offsets={'pad_base':-.02,'pad_pcb':-.011,'tx_ferrite':.003,'tx_coil':.012,'pad_cover':.029,'phone_back':.047,'rx_coil':.059,'rx_ferrite':.070,'battery':.085,'phone_board':.085,'phone_frame':.105,'screen':.125}
    if block:shots=shots[:1]
    for name,pos,target,scale in shots:
        for id in IDS:
            root=bpy.data.objects[id];root.location=(0,0,0)
            hidden=name=='coils' and id not in ['tx_coil','rx_coil','tx_ferrite','rx_ferrite']
            for o in [root,*root.children_recursive]:o.hide_render=hidden
            if name=='exploded':root.location=cv((0,offsets.get(id,0),0))
            if name=='coils' and id.startswith('rx_'):root.location=cv((0,.015,0))
        cam.location=cv(pos);cam.rotation_euler=(Vector(cv(target))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
        scene.render.filepath=str(out/(name+'.png'));assert bpy.ops.render.render(write_still=True)=={'FINISHED'}
    report={'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'shots':[s[0] for s in shots],'engine':'Cycles','samples':20}
    (out/'receipt.json').write_text(json.dumps(report,indent=2))
    if not block:shutil.copyfile(out/'closed.png',ROOT/'public/images/catalog/wireless-charging.png')
    print('AGENT_OK '+json.dumps(report))
except Exception:
    import traceback;traceback.print_exc();print('AGENT_FAIL wireless render');sys.exit(1)

