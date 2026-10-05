from geometry import *
def build(m,g,detail):
    b=g['boiler_shell']
    for x in [-6.55,-3.65]:box('Boiler side',(x,3.15,-.1),(.13,6.15,3.6),m['wall'],b)
    for z in [-1.9,1.7]:box('Boiler enclosure',(-5.1,3.15,z),(3,6.15,.13),m['wall'],b)
    box('Boiler roof',(-5.1,6.25,-.1),(3.2,.18,3.8),m['roof'],b)
    if detail:
        for x in [-6.6,-5.1,-3.6]:
            for z in [-1.96,1.76]:box('Boiler column',(x,3.15,z),(.11,6.3,.12),m['steel'],b)
        for y in [1.1,2.6,4.1,5.6]:
            box('Maintenance landing',(-5.1,y,-2.08),(3.3,.09,.5),m['steel'],b)
            beam('Guard rail',(-6.6,y+.5,-2.3),(-3.6,y+.5,-2.3),.025,m['yellow'],b)
            for x in [-6.6,-5.6,-4.6,-3.6]:beam('Rail post',(x,y,-2.3),(x,y+.5,-2.3),.025,m['yellow'],b)
        for y in [i*.15+.3 for i in range(38)]:beam('Ladder rung',(-6.75,y,-1.3),(-6.75,y,-.95),.018,m['silver'],b)
        for z in [-1.3,-.95]:beam('Ladder rail',(-6.75,.2,z),(-6.75,6,z),.025,m['silver'],b)
    f=g['furnace'];box('Refractory furnace',(-5.1,.9,-.1),(2.5,1.5,2.9),m['dark'],f)
    box('Fire grate',(-5.1,1.73,-.1),(2.1,.06,2.5),m['fire'],f)
    tubes=g['boiler_tubes']
    for z in [-1.45,1.2]:
        for i in range(18 if detail else 6):
            x=-6.3+i*2.4/(17 if detail else 5);tube('Water wall',[(x,1.8,z),(x,5.65,z),(x,5.8,0)],.035,m['copper'],tubes,8)
    for y in [3.1,3.65,4.2,4.75,5.3]:
        for z in [-.85,-.4,.05,.5,.95]:tube('Superheater serpentine',[(-6.2,y,z),(-4.1,y,z),(-4.1,y+.2,z),(-6.2,y+.2,z)],.04,m['silver'],tubes,8)
    tube('Steam drum',[(-6.2,5.8,0),(-4,5.8,0)],.22,m['steel'],tubes,24)
    c=g['coal_supply'];box('Coal bunker',(-7.6,1.6,-.5),(1.4,1.1,1.7),m['steel'],c,.06);box('Coal bed',(-7.6,2.18,-.5),(1.25,.08,1.55),m['coal'],c)
    tube('Coal conveyor',[(-8.3,.35,-3.3),(-7.6,2,-1)],.28,m['dark'],c,8)
    tube('Coal chute',[(-7.6,1.1,-.5),(-6.3,1.2,-.5)],.22,m['steel'],c,8)
    fl=g['flue_filter'];box('Electrostatic filter',(-3.1,2.1,3.4),(2.3,2.4,1.8),m['wall'],fl,.07)
    for x in [-3.8,-3.1,-2.4]:
        cyl('Ash hopper',(x,.7,3.4),.25,1,m['steel'],fl,4,r2=.58)
        if detail:
            for z in [2.6,4.2]:box('Filter stiffener',(x,2.1,z),(.055,2.3,.05),m['silver'],fl)
    st=g['stack'];cyl('Stack foundation',(-1,.2,4.7),.66,.3,m['concrete'],st)
    cyl('Chimney',(-1,4.1,4.7),.44,7.8,m['wall'],st,48,r2=.29)
    for y in [5.8,6.6,7.4]:cyl('Stack warning band',(-1,y,4.7),.305+(7.8-y)*.018,.3,m['orange'],st,48)
    cyl('Stack mouth',(-1,8.02,4.7),.267,.025,m['dark'],st,48)
