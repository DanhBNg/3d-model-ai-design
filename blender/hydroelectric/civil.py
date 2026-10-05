from geometry import group,box,mesh,beam
from hydraulics import DATA,duct

def build(m,detail=True):
    terrain=group('terrain');box('Foundation',(0,-1.15,0),(12,.5,7),m['Basalt'],terrain,.10)
    box('Upstream rock',(-4,-.7,0),(3.7,.4,5.7),m['Basalt'],terrain,.06)
    reservoir=group('reservoir');box('Forebay water',(-4,1.49,0),(3.5,3.97,5.4),m['Water'],reservoir,.025)
    for z in [-2.86,2.86]:box('Forebay coping',(-4,3.42,z),(3.75,.22,.20),m['Concrete'],terrain,.02)
    dam=group('dam')
    for z0,z1 in [(-2.9,-.72),(.72,2.9)]:
        vv=[(-2.28,-.9,z0),(-.45,-.9,z0),(-1.75,4,z0),(-2.28,4,z0),(-2.28,-.9,z1),(-.45,-.9,z1),(-1.75,4,z1),(-2.28,4,z1)]
        mesh('Intake retaining pier',vv,[(0,1,2,3),(4,7,6,5),(0,4,5,1),(3,2,6,7),(0,3,7,4),(1,5,6,2)],m['Concrete'],dam)
    box('Crest road',(-2,4.05,0),(.85,.16,6.2),m['Graphite'],dam,.02)
    for x in [-2.38,-1.64]:
        for z in [-3,-2,-1,0,1,2,3]:beam('Crest post',(x,4.12,z),(x,4.52,z),.024,m['Silver'],dam)
        beam('Crest rail',(x,4.52,-3),(x,4.52,3),.028,m['Silver'],dam)
    gate=group('intake_gate',(-2.12,1.65,0));box('Gate leaf',(0,0,0),(.12,1.32,1.30),m['Steel'],gate,.02)
    for z in [-.5,-.25,0,.25,.5]:box('Gate stiffener',(-.09,0,z),(.08,1.28,.045),m['Silver'],gate)
    for z in [-.70,.70]:box('Intake gate guide',(-2.12,2.50,z),(.16,3.10,.11),m['Graphite'],dam)
    box('Gate hoist',(-2.12,4.25,0),(.48,.25,1.65),m['Amber'],dam,.03)
    for z in [-.55,.55]:beam('Gate lifting rod',(0,.65,z),(0,1.15,z),.022,m['Silver'],gate)
    for i in range(15):
        z=-.63+i*.09;beam('Trash rack',(-2.64,.99,z),(-2.64,2.35,z),.018,m['Silver'],dam)
    for y in [1.02,1.65,2.31]:beam('Rack crossmember',(-2.66,y,-.67),(-2.66,y,.67),.03,m['Graphite'],dam)
    pen=group('penstock');duct('Intake concrete passage',DATA['intake'],m['Steel'],pen)
    draft=group('draft_tube');duct('Expanding draft tube',DATA['draft'],m['Silver'],draft)
    tail=group('tailrace');box('Tailwater',(4.65,.40,0),(2.3,.36,2.2),m['Water'],tail,.025)
    for z in [-1.22,1.22]:box('Tailrace wall',(4.5,-.1,z),(2.9,1.5,.20),m['Concrete'],tail,.02)
    house=group('powerhouse');box('Backwall',(1.7,1.32,1.72),(3.7,4.45,.18),m['Concrete'],house,.02)
    box('Transformer foundation',(4.35,-.35,2.12),(2.65,1.1,1.7),m['Concrete'],house,.035)
    box('Hall rear foundation',(1.7,-.35,1.65),(3.6,1.1,.65),m['Concrete'],house,.025)
    for x in [0,3.4]:box('Steel column',(x,1.9,1.35),(.18,3.3,.18),m['Steel'],house,.02)
    for y in [2.5,3.15]:box('Clerestory rear',(1.7,y,1.59),(2.9,.42,.055),m['Glass'],house)
    for x,w in [(.25,1.0),(3.05,.95)]:box('Generator service deck',(x,2.12,.1),(w,.20,3.05),m['Concrete'],house,.02)
    box('Rear service deck',(1.65,2.12,1.2),(1.9,.2,.7),m['Concrete'],house)
    box('Draft gallery rear',(2.2,-.15,1.36),(3.1,1.6,.43),m['Concrete'],house,.025)
    profile=[(-2.28,-.9),(.7,-.9),(.7,1.87),(-1.2,2.42),(-2.28,2.65)]
    vv=[(x,y,z) for z in [.73,1.12] for x,y in profile]
    mesh('Intake gallery rear section',vv,[(4,3,2,1,0),(5,6,7,8,9)]+[(i,(i+1)%5,(i+1)%5+5,i+5) for i in range(5)],m['Concrete'],house)
    roof=group('roof');box('Roof',(1.7,3.65,.15),(4.05,.22,3.75),m['Steel'],roof,.045)
    for x in [.2,.7,1.2,1.7,2.2,2.7,3.2]:box('Roof seam',(x,3.8,.15),(.045,.08,3.7),m['Silver'],roof)
    for z in [-1.7,2]:beam('Rain gutter',(-.3,3.56,z),(3.7,3.56,z),.04,m['Silver'],roof)
