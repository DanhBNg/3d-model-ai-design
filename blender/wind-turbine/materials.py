import bpy

def material(name, color, metal=0, rough=.5):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
    return m

def palette():
    return {k:material(k,*v) for k,v in {
      'Glass':((.018,.095,.13),.55,.18),'Basalt':((.075,.105,.12),0,.85),'Concrete':((.36,.39,.36),0,.8),
      'CutEdge':((.83,.69,.43),.15,.5),'Steel':((.20,.33,.34),.65,.32),
      'Silver':((.64,.7,.71),.8,.26),'Copper':((.72,.31,.095),.75,.3),
      'Graphite':((.065,.085,.10),.65,.4),'Water':((.035,.37,.43),.35,.19),
      'Foam':((.39,.78,.78),.1,.32),'Amber':((.98,.55,.13),.35,.3),
      'Moss':((.18,.27,.20),0,.95),'Porcelain':((.79,.82,.74),.25,.3),
    }.items()}
