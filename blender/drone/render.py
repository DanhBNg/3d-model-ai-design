"""Verification stills from the exported GLB, not an unsaved source scene."""
import bpy,sys,math,json,hashlib
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))
from geometry import cv,box
from materials import material
try:
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    asset=ROOT/'public/models/drone.glb';bpy.ops.import_scene.gltf(filepath=str(asset))
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
    scene.render.resolution_x=900;scene.render.resolution_y=700;scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False
    world=bpy.data.worlds.new('Studio world');scene.world=world;world.use_nodes=True
    world.node_tree.nodes['Background'].inputs['Color'].default_value=(.68,.72,.64,1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value=.65
    floor=box('Studio floor',(0,-.008,0),(200,.01,200),material('Studio ground',(.7,.72,.65),0,.9),None,0)
    for name,pos,power,size in [('Soft key',(-.4,.8,-.4),65,.65),('Cool rim',(.5,.5,.4),42,.45),('Front fill',(.2,.4,-.6),14,.4)]:
        data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size
        obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=cv(pos);obj.rotation_euler=(Vector(cv((0,.07,0)))-obj.location).to_track_quat('-Z','Y').to_euler()
    camera=bpy.data.objects.new('Review camera',bpy.data.cameras.new('Review camera'));scene.collection.objects.link(camera);scene.camera=camera;camera.data.type='ORTHO';camera.data.ortho_scale=.7;camera.data.clip_start=.005
    output=ROOT/'output/blender-final';output.mkdir(parents=True,exist_ok=True)
    views=[('front',(.54,.4,-.68)),('rear',(-.5,.35,.65)),('top',(0,.9,-.001)),('internals',(.38,.58,-.5))]
    receipts=[]
    for name,pos in views:
        if name=='internals':
            for id in ['shell_upper','shell_lower']:
                for o in bpy.data.objects[id].children_recursive:o.hide_render=True
        camera.location=cv(pos);camera.rotation_euler=(Vector(cv((0,.065,0)))-camera.location).to_track_quat('-Z','Y').to_euler()
        out=output/(name+'.png');scene.render.filepath=str(out);bpy.ops.render.render(write_still=True);assert out.exists() and out.stat().st_size>5000
        receipts.append({'view':name,'path':str(out.relative_to(ROOT)),'bytes':out.stat().st_size})
    report={'assetSha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'views':receipts,'resolution':[900,700],'samples':24,'engine':'Cycles CPU','purpose':'verification'}
    (output/'receipt.json').write_text(json.dumps(report,indent=2),encoding='utf8');print('AGENT_OK '+json.dumps(report))
except Exception as e:
    import traceback;traceback.print_exc();print('AGENT_FAIL '+json.dumps({'error':str(e)}));sys.exit(1)
