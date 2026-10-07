"""Render only the delivered/reimported GLB in four independent inspection views."""
import bpy,sys,math,json,hashlib,shutil
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];sys.path.insert(0,str(HERE))
from geometry import cv
from assemblies import IDS
for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
block='--blockout' in sys.argv;suffix='-blockout' if block else '';asset=ROOT/f'public/models/inline-four-engine{suffix}.glb'
assert bpy.ops.import_scene.gltf(filepath=str(asset))=={'FINISHED'}
s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=16;s.cycles.use_denoising=True
s.render.resolution_x=960 if not block else 640;s.render.resolution_y=720 if not block else 480;s.render.resolution_percentage=100
s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.075,.095,.115,1);s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.6
for name,pos,power,size in [('Key',(-.3,.9,.6),18,.7),('Fill',(.6,.5,.3),9,.6),('Rim',(-.2,.6,-.5),15,.5)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=cv(pos);o.rotation_euler=(Vector(cv((0,.22,0)))-o.location).to_track_quat('-Z','Y').to_euler()
cam=bpy.data.objects.new('Review camera',bpy.data.cameras.new('Review camera'));s.collection.objects.link(cam);s.camera=cam;cam.data.type='ORTHO';cam.data.clip_start=.001
out=ROOT/'output/inline-four-engine'/('blockout' if block else 'renders');out.mkdir(parents=True,exist_ok=True)
shots=[('cutaway',(-.65,.51,.85),.69),('closed',(-.65,.51,.85),.69),('timing',(-.8,.37,.36),.65),('rear',(.65,.49,-.75),.69)]
if block:shots=shots[:1]
for name,pos,scale in shots:
 for o in bpy.data.objects:o.hide_render=False
 hide=['block_front','cam_cover','timing_cover','exhaust_manifold','head_front_shell'] if name in ['cutaway','timing'] else []
 if name=='cutaway':hide+=['sump']
 for id in hide+[f'cylinder_{i}_front_shell' for i in range(1,5) if name in ['cutaway','timing']]:
  root=bpy.data.objects[id]
  for o in [root,*root.children_recursive]:o.hide_render=True
 cam.location=cv(pos);cam.rotation_euler=(Vector(cv((0,.22,0)))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=scale
 s.render.filepath=str(out/(name+'.png'));assert bpy.ops.render.render(write_still=True)=={'FINISHED'}
report={'sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'shots':[x[0] for x in shots],'engine':'Cycles','samples':16}
(out/'receipt.json').write_text(json.dumps(report,indent=2))
if not block:shutil.copyfile(out/'cutaway.png',ROOT/'public/images/catalog/inline-four-engine.png')
print('AGENT_OK '+json.dumps(report))
