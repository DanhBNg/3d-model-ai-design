from geometry import *
IDS='site coal_supply boiler_shell boiler_tubes furnace flue_filter stack hall_shell turbine_hp_shell turbine_hp_rotor turbine_lp_shell turbine_lp_rotor bearings generator_shell generator_rotor condenser_shell condenser_bundle feed_pump cooling_pump cooling_tower transformer grid steam_pipes feed_pipes cooling_pipes flue_duct'.split()
def build(m,detail):
    g={id:group(id) for id in IDS};s=g['site'];box('Foundation',(0,-.17,0),(18,.3,12),m['concrete'],s,.1)
    box('Road',(0,.002,-4.9),(17,.02,1.25),m['dark'],s)
    for x in range(-8,9,2):box('Road marking',(x,.02,-4.9),(.8,.02,.06),m['yellow'],s)
    for x,z,w,d in [(-5,-.1,3.3,4.2),(2,-1.3,9.7,3.8),(5,3.7,3.5,3.5),(-3,3.7,3.5,3.2)]:box('Equipment pad',(x,.06,z),(w,.12,d),m['wall'],s)
    h=g['hall_shell'];box('Hall roof',(1.7,4.15,-1.35),(10.5,.18,4),m['roof'],h,.04)
    for z in [-3.35,.65]:
        box('Insulated facade',(1.7,2.05,z),(10.5,4.1,.09),m['wall'],h)
        box('Ribbon glazing',(1.7,2.9,z-.055),(9.9,.65,.025),m['glass'],h)
        if detail:
            for x in [i*.35-3.4 for i in range(30)]:box('Facade seam',(x,1.95,z-.065),(.025,3.9,.03),m['silver'],h)
    for x in [-3.55,6.95]:box('Gable',(x,2.05,-1.35),(.09,4.1,4),m['wall'],h)
    for x in [-2,1,4]:
        box('Service door',(x,.8,-3.41),(1.2,1.55,.025),m['roof'],h)
        if detail:
            for y in [.3,.5,.7,.9,1.1,1.3,1.5]:box('Door slat',(x,y,-3.44),(1.12,.025,.02),m['silver'],h)
    if detail:
        for x in [-3.3,-1,1.3,3.6,6.7]:
            for z in [-3.15,.45]:box('Steel column',(x,1.9,z),(.12,3.8,.13),m['steel'],g['bearings'])
            box('Roof ridge',(x,4.28,-1.35),(.035,.03,4.05),m['silver'],h)
    tower=g['cooling_tower'];cyl('Cooling basin',(5,.19,3.7),1.58,.3,m['concrete'],tower,64);cyl('Basin water',(5,.35,3.7),1.45,.025,m['water'],tower,64)
    profile=[(.65+i*3.7/32,.86*math.sqrt(1+((.65+i*3.7/32-2.85)/1.85)**2)) for i in range(33)]
    verts=[(5+(r-inset)*math.cos(j*math.tau/64),y,3.7+(r-inset)*math.sin(j*math.tau/64)) for inset in [0,.07] for y,r in profile for j in range(64)];faces=[];off=len(profile)*64
    for i in range(len(profile)-1):
        for j in range(64):
            a=i*64+j;b=i*64+(j+1)%64;faces.extend([(a,b,b+64,a+64),(off+a,off+a+64,off+b+64,off+b)])
    for row in [0,len(profile)-1]:
        for j in range(64):a=row*64+j;b=row*64+(j+1)%64;faces.append((a,b,off+b,off+a))
    mesh('Hyperbolic shell',verts,faces,m['wall'],tower,True)
    for i in range(20):
        a=i*math.tau/20;x=5+1.3*math.cos(a);z=3.7+1.3*math.sin(a);beam('Tower leg',(x,.3,z),(x,.85,z),.065,m['steel'],tower)
    t=g['transformer'];box('Transformer tank',(7.5,.75,-3.35),(1.2,1.1,1),m['roof'],t,.08)
    for x in [7.05,7.95]:
        for z in [-3.75,-3.55,-3.35,-3.15,-2.95]:box('Radiator',(x,.75,z),(.35,.9,.045),m['steel'],t)
    for z in [-3.65,-3.35,-3.05]:cyl('Bushing',(7.5,1.65,z),.075,.7,m['copper'],t,12)
    grid=g['grid']
    for x in [7.6,8.4]:beam('Grid column',(x,.1,-4.15),(x,5.1,-4.15),.055,m['silver'],grid)
    for y in [1,2,3,4,5]:beam('Grid truss',(7.6,y,-4.15),(8.4,y,-4.15),.035,m['silver'],grid)
    beam('Crossarm',(7.1,4.8,-4.15),(8.8,4.8,-4.15),.065,m['steel'],grid)
    return g
