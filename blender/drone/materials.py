import bpy

def material(name, color, metal=0, rough=.4, emission=0):
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*color,1)
    m.use_nodes=True
    bsdf=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    sockets={s.name:s for s in bsdf.inputs}
    for name,value in [('Base Color',(*color,1)),('Metallic',metal),('Roughness',rough)]:
        assert name in sockets, (bpy.app.version_string,name)
        sockets[name].default_value=value
    if emission:
        sockets['Emission Color'].default_value=(*color,1)
        sockets['Emission Strength'].default_value=emission
    return m

def palette():
    return {
      'shell':material('Ceramic ivory · polymer',(.76,.79,.73),.12,.3),
      'frame':material('Graphite composite',(.032,.043,.047),.3,.38),
      'rubber':material('Elastomer',(.016,.019,.022),0,.8),
      'metal':material('Bead blasted aluminum',(.32,.38,.4),.83,.28),
      'black':material('Anodized graphite',(.027,.034,.037),.65,.28),
      'copper':material('Copper winding',(.64,.24,.075),.82,.27),
      'orange':material('Signal orange',(.96,.2,.035),.28,.3),
      'pcb':material('Teal solder mask',(.018,.14,.115),.2,.45),
      'chip':material('IC packages',(.02,.027,.025),.12,.6),
      'gold':material('Gold plated contacts',(.68,.47,.13),.8,.25),
      'glass':material('Optical coating',(.013,.065,.086),.72,.12),
      'led':material('Status mint',(.13,.9,.51),.15,.28,2),
      'cell':material('Lithium pouch foil',(.38,.42,.43),.65,.45)
    }
