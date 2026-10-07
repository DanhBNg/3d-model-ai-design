import bpy

def palette():
    specs={'graphite':((.023,.027,.033),.05,.7),'black':((.008,.012,.018),0,.72),'frame':((.22,.25,.29),.35,.6),'silver':((.55,.61,.67),.5,.55),'copper':((.8,.29,.07),.65,.48),'ferrite':((.055,.060,.069),.3,.65),'pcb':((.012,.14,.094),.05,.65),'gold':((.82,.53,.12),.8,.3),'ceramic':((.42,.33,.22),.1,.6),'battery':((.15,.18,.21),.15,.65),'screen':((.008,.035,.048),0,.5),'teal':((.02,.65,.55),.15,.28),'white':((.6,.68,.71),.15,.5)}
    out={}
    for name,(color,metal,rough) in specs.items():
        mat=bpy.data.materials.new('wireless_'+name);mat.use_nodes=True;n=mat.node_tree.nodes.get('Principled BSDF');n.inputs['Base Color'].default_value=(*color,1);n.inputs['Metallic'].default_value=metal;n.inputs['Roughness'].default_value=rough
        if name=='teal':n.inputs['Emission Color'].default_value=(*color,1);n.inputs['Emission Strength'].default_value=.4
        out[name]=mat
    return out
