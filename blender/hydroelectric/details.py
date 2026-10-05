"""Exportable architectural and service detail, attached to removable parents."""
import bpy, math
from geometry import box, cyl, ring, tube, beam

def build(m):
    house=bpy.data.objects['facade'];roof=bpy.data.objects['roof']
    site=bpy.data.objects['site_details'];dam=bpy.data.objects['dam']
    # Masonry joints, framed glazing and a lower maintenance gallery.
    for z in [-1.625,1.925]:
        for y in [.82,1.35,1.88,2.41]:
            box('Recessed horizontal joint',(1.7,y,z),(3.72,.012,.008),m['Basalt'],house)
        for x in [.15,.85,1.55,2.25,2.95]:
            box('Lower window surround',(x,1.62,z),(.44,.62,.045),m['Graphite'],house,.018)
            box('Lower glazing',(x,1.62,z+(-.027 if z<0 else .027)),(.36,.52,.02),m['Glass'],house)
        for y in [2.70,3.20]:box('Clerestory sill',(1.7,y,z),(3.48,.045,.12),m['Silver'],house)
    for x in [.35,1.6,2.85]:
        box('Roof monitor curb',(x,3.83,.12),(.65,.18,1.1),m['Graphite'],roof,.02)
        box('Roof monitor glass',(x,3.94,.12),(.56,.04,1),m['Glass'],roof,.015)
        for z in [-.38,.62]:box('Roof monitor cap',(x,3.98,z),(.67,.04,.05),m['Silver'],roof)
    for x in [.0,3.35]:
        tube('Rainwater downpipe',[(x,3.52,-1.74),(x,3.2,-1.79),(x,.52,-1.79)],.028,m['Graphite'],house,8)
    # Crest expansion joints and raised coping.
    for z in [-2,-1.3,.7,1.4,2.1]:
        box('Dam formwork seam',(-1.895,2.18,z),(.008,3.5,.014),m['Basalt'],dam)
    # Maintenance walkway, real posts and two rails at turbine hall frontage.
    box('Maintenance gallery',(1.6,.72,-1.9),(3.5,.10,.38),m['Steel'],site)
    for x in [0,.5,1,1.5,2,2.5,3,3.3]:
        beam('Walkway post',(x,.77,-2.07),(x,1.2,-2.07),.016,m['Silver'],site)
    for y in [.99,1.2]:beam('Walkway railing',(-.05,y,-2.07),(3.35,y,-2.07),.018,m['Amber'],site)
    for x in [3.9,4.3,4.7,5.1,5.5]:
        box('Apron paving joint',(x,.337,-1.24),(.012,.006,.62),m['Basalt'],site)
    # Crane belongs to the hall, and remains visible when opening its roof.
    hall=bpy.data.objects['powerhouse']
    for z in [-1.23,1.48]:box('Crane runway',(1.7,3.38,z),(3.65,.13,.12),m['Graphite'],hall)
    box('Overhead crane bridge',(3.15,3.42,.12),(.2,.22,2.9),m['Amber'],hall,.015)
    box('Crane trolley',(3.15,3.29,.12),(.42,.16,.5),m['Graphite'],hall,.025)
    beam('Hoist cable',(3.15,3.22,.12),(3.15,2.85,.12),.015,m['Silver'],hall)
    tube('Crane hook',[(3.15,2.85,.12),(3.15,2.76,.12),(3.23,2.73,.12),(3.27,2.79,.12)],.024,m['Amber'],hall,8)
    # Wrapped end turns, cooling ribs, bearing and coupling fasteners.
    stator=bpy.data.objects['generator_stator']
    for i in range(27):
        a=i*math.pi*1.5/27
        for y in [-.4,.4]:
            pts=[(r*math.cos(a+d),y+h,r*math.sin(a+d)) for r,d,h in [(.70,-.035,0),(.70,0,.055),(.84,0,.055),(.84,.035,0)]]
            tube('Copper end turn',pts,.023,m['Copper'],stator,6)
    for i in range(24):
        a=i*math.pi*1.5/24
        o=box('Generator cooling rib',(1.015,0,0),(.075,.56,.035),m['Steel'],stator,.006);o.rotation_euler.z=-a
    shaft=bpy.data.objects['shaft_spin']
    for y in [-.34,.46]:
        for i in range(8):
            a=i*math.tau/8;cyl('Coupling bolt',(.17*math.cos(a),y,.17*math.sin(a)),.023,.04,m['Copper'],shaft,6)
    transformer=bpy.data.objects['transformer']
    cyl('Conservator tank',(0,1.38,.35),.16,.32,m['Steel'],transformer,24)
    tube('Oil return pipe',[(.3,1.43,.35),(.43,1.43,.35),(.43,.95,.35)],.023,m['Copper'],transformer,8)
