"""Complete exterior skin; cutaway controller removes explicitly named enclosures."""
import math,bpy
from geometry import group,box,mesh,beam,cyl,tube

def build(m):
    cover=group('conduit_cover')
    # The near intake pier is part of the removable geological section.
    bpy.data.objects['Intake retaining pier'].parent=cover
    # Central dam section and enclosed conduit gallery. Deliberate removable cut volume.
    pts=[(-2.28,-.9),(.25,-.9),(.25,2.15),(-1.75,4),(-2.28,4)]
    v=[(x,y,z) for z in [-.72,.72] for x,y in pts];n=len(pts)
    mesh('Pressure gallery envelope',v,[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)],m['Concrete'],cover)
    house=group('facade')
    box('Underground front section',(1.75,-.24,-1.52),(3.9,1.33,.2),m['Concrete'],house,.02)
    box('Draft outlet service pier',(3.5,1.1,1.0),(.25,1.4,.4),m['Concrete'],house,.02)
    for z in [-1.52,1.82]:
        box('Powerhouse wall',(1.7,1.91,z),(3.8,3.3,.18),m['Concrete'],house,.025)
        box('Blue upper clerestory',(1.7,2.95,z+(-.105 if z<0 else .105)),(3.35,.46,.035),m['Water'],house)
        for x in [.15,.85,1.55,2.25,2.95,3.25]:box('Window mullion',(x,2.95,z+(-.13 if z<0 else .13)),(.035,.52,.04),m['Silver'],house)
        box('Foundation band',(1.7,.48,z),(3.82,.45,.21),m['Graphite'],house)
    box('Upstream wall',(-.15,1.95,.12),(.18,3.4,3.2),m['Concrete'],house)
    # Downstream facade leaves an actual lower outlet to tailwater.
    for z in [-1.16,1.27]:box('Outlet pier',(3.55,.63,z),(.22,.76,.72),m['Concrete'],house)
    box('Downstream wall',(3.55,2.26,.13),(.22,2.6,3.45),m['Concrete'],house)
    box('Service door',(3.68,1.45,-.9),(.03,1.4,.62),m['Steel'],house,.02)
    for y in [1.1,1.22,1.34,1.46,1.58,1.70]:box('Door louvers',(3.71,y,-.9),(.04,.025,.5),m['Silver'],house)
    for x in [.4,1.0,1.6,2.2,2.8]:
        box('Facade pilaster',(x,1.8,-1.64),(.055,2.7,.035),m['Silver'],house)
    # Long crest spillway with radial gates, chute and independent stilling channel.
    spill=group('spillway')
    z=-2.46
    for za in [z-.38,z+.38]:
        profile=[(-1.45,3.64,za),(-1.1,3.55,za),(-.35,1.6,za),(.4,.64,za),(1.5,.38,za),(5.5,.38,za)]
        tube('Spill chute edge',profile,.10,m['Concrete'],spill,8)
    points=[(-1.45,3.5),(-1.12,3.4),(-.34,1.45),(.4,.49),(1.5,.24),(5.5,.24)]
    verts=[(x,y,zz) for x,y in points for zz in [z-.32,z+.32]]
    mesh('Dry spillway chute',verts,[(i*2,i*2+1,i*2+3,i*2+2) for i in range(len(points)-1)],m['Concrete'],spill)
    box('Spillway gate',(-1.61,3.73,z),(.12,.55,.63),m['Steel'],spill,.025)
    for zz in [z-.48,z+.48]:box('Gate pier',(-1.6,4.0,zz),(.42,.95,.20),m['Concrete'],spill,.02)
    box('Gate gantry',(-1.6,4.51,z),(.38,.11,1.12),m['Amber'],spill,.02)
    box('Stilling basin water',(3.45,.34,z),(4.1,.09,.62),m['Water'],spill)
    # Concrete access apron, small steps, warning bollards, trees give human-scale cues.
    land=group('site_details')
    box('Service apron',(4.6,.29,-1.24),(1.8,.08,.65),m['Concrete'],land)
    for i in range(5):box('Maintenance step',(-.3+i*.14,.38+i*.08,-1.83),(.16,.08,.3),m['Concrete'],land)
    for x in [3.9,4.6,5.3]:
        cyl('Bollard',(x,.54,-1.64),.035,.45,m['Amber'],land,10)
    for x,z,s in [(-5,2.7,.75),(-4.6,2.8,.5),(-3.1,2.85,.6),(-5,-2.85,.65),(-4,-2.85,.45)]:
        cyl('Tree trunk',(x,3.9,z),.04,.6,m['Basalt'],land,8)
        cyl('Pine lower',(x,4.15,z),.22,s,m['Moss'],land,7,r2=0)
        cyl('Pine crown',(x,4.4,z),.16,s*.65,m['Moss'],land,7,r2=0)
