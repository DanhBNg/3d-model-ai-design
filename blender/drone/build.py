import bpy, sys, json, math, hashlib
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))
from geometry import group, box, cylinder, beam, shell, blade, consolidate
from materials import palette

def build():
    assert bpy.app.version[:2]==(5,2), bpy.app.version_string
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.context.scene.unit_settings.system='METRIC'
    m=palette();root=group('drone');parts={}
    for name in ['shell_upper','shell_lower','frame','battery','flight_controller','esc','gimbal']:
        parts[name]=group(name,parent=root);parts[name]['part_id']=name
    shell('Upper molded cover',parts['shell_upper'],m['shell'])
    shell('Lower molded cover',parts['shell_lower'],m['shell'],False)
    f=parts['frame']
    box('Central deck',(0,.05,0),(.105,.007,.178),m['frame'],f,.004)
    if '--blockout' in sys.argv:box('Battery pack',(0,.082,.031),(.074,.036,.109),m['black'],parts['battery'],.006)
    for id,y,z,w,d in [('flight_controller',.069,-.057,.047,.042),('esc',.055,-.048,.076,.066)]:
        box(id+' board',(0,y,z),(w,.002,d),m['pcb'],parts[id],.001)
    motors=[('fl',-.145,-.13,1),('fr',.145,-.13,-1),('rl',-.145,.13,-1),('rr',.145,.13,1)]
    for id,x,z,hand in motors:
        beam('Arm '+id,(math.copysign(.044,x),.055,math.copysign(.068,z)),(x,.075,z),.026,.019,m['frame'],f)
        lx=math.copysign(.125,x);lz=math.copysign(.118,z)
        box('Landing support '+id,(lx,.036,lz),(.012,.063,.016),m['frame'],f,.004)
        box('Foot '+id,(lx,.005,lz),(.022,.01,.032),m['rubber'],f,.004)
        mot=parts['motor_'+id]=group('motor_'+id,(x,.075,z),root);mot['part_id']='motor_'+id
        cylinder('Motor stator '+id,(0,.006,0),.016,.014,m['metal'],mot)
        rotor=group('rotor_'+id,(0,.016,0),mot)
        if '--blockout' in sys.argv:cylinder('Motor bell '+id,(0,.005,0),.019,.015,m['black'],rotor)
        p=parts['prop_'+id]=group('prop_'+id,(x,.113,z),root);p['part_id']='prop_'+id
        blade('Twisted airfoils '+id,p,m['frame'],hand,.45 if hand>0 else -.45)
        cylinder('Prop hub '+id,(0,0,0),.008,.009,m['black'],p)
    g=parts['gimbal'];g.location=(0,.138,.038)
    yaw=group('gimbal_yaw',parent=g);roll=group('gimbal_roll',parent=yaw);pitch=group('gimbal_pitch',parent=roll)
    box('Camera body',(0,0,0),(.04,.029,.03),m['black'],pitch,.006)
    cylinder('Lens',(0,0,-.021),.012,.013,m['glass'],pitch,axis='z')
    if '--blockout' not in sys.argv:
        from details import add_details
        add_details(m,parts,motors)
    bpy.context.view_layer.update();consolidate();bpy.context.view_layer.update()
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
    triangles=0
    for o in meshes:o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
    assert len(parts)==15 and triangles<120000,(len(parts),triangles)
    for o in meshes:
        assert all(math.isfinite(c) for v in o.data.vertices for c in v.co)
    path=ROOT/'public/models';path.mkdir(parents=True,exist_ok=True)
    name='drone-blockout' if '--blockout' in sys.argv else 'drone'
    blend=HERE/(name+'.blend');glb=path/(name+'.glb')
    bpy.context.scene['purpose']='render-only';bpy.context.scene['tool_version']=bpy.app.version_string
    bpy.ops.wm.save_as_mainfile(filepath=str(blend))
    result=bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',export_yup=True,export_extras=True,export_animations=False,export_cameras=False,export_lights=False)
    assert result=={'FINISHED'} and glb.stat().st_size>2048
    report={'blender':bpy.app.version_string,'assemblies':list(parts),'meshCount':len(meshes),'triangles':triangles,'assetBytes':glb.stat().st_size,'sha256':hashlib.sha256(glb.read_bytes()).hexdigest(),'blendSha256':hashlib.sha256(blend.read_bytes()).hexdigest(),'stage':name}
    (HERE/(name+'-build-report.json')).write_text(json.dumps(report,indent=2),encoding='utf8')
    print('AGENT_OK '+json.dumps(report))

try:build()
except Exception as e:
    import traceback;traceback.print_exc();print('AGENT_FAIL '+json.dumps({'error':str(e)}));sys.exit(1)
