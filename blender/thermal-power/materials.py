import bpy
def palette():
    values={'concrete':(.31,.35,.36,0,.88),'wall':(.58,.65,.66,.25,.56),'roof':(.10,.19,.23,.55,.4),'steel':(.32,.40,.44,.8,.28),'dark':(.045,.07,.085,.6,.38),'silver':(.65,.74,.78,.85,.24),'copper':(.65,.25,.09,.72,.3),'orange':(.91,.29,.045,.35,.4),'blue':(.04,.31,.47,.42,.36),'cyan':(.08,.57,.61,.4,.35),'yellow':(.9,.66,.08,.45,.4),'water':(.025,.28,.34,.6,.22),'coal':(.045,.046,.048,.12,.9),'fire':(1,.18,.01,0,.5),'glass':(.09,.22,.28,.45,.24),'green':(.13,.30,.24,.2,.8)}
    out={}
    for name,(r,g,b,metal,rough) in values.items():
        m=bpy.data.materials.new(name);m.diffuse_color=(r,g,b,1);m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(r,g,b,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
        if name=='fire':p.inputs['Emission Color'].default_value=(1,.08,.003,1);p.inputs['Emission Strength'].default_value=2
        out[name]=m
    return out
