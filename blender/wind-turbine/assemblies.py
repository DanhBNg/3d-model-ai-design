"""Web coordinates: +Y up, rotor axis X, incoming wind +X. Native meshes only."""
import math
from geometry import group,mesh,box,cyl,ring,tube,beam

def axis(o):
    # Cylinder's Y axis becomes X in web coordinates (Blender Z -> X).
    o.rotation_euler[1]=math.pi/2
    return o
def xcyl(name,x,r,length,mat,parent,n=48):
    p=group(name+' axis',(x,0,0),parent)
    return axis(cyl(name,(0,0,0),r,length,mat,p,n))
def xring(name,x,ro,ri,length,mat,parent,n=64):
    p=group(name+' axis',(x,0,0),parent)
    return axis(ring(name,(0,0,0),ro,ri,length,mat,p,n=n))
def bolts(name,x,r,count,mat,parent):
    for i in range(count):
        a=i*math.tau/count;p=group(name+str(i),(x,r*math.cos(a),r*math.sin(a)),parent)
        axis(cyl(name+' bolt',(0,0,0),.035,.055,mat,p,6))
def gear(name,x,r,teeth,width,mat,parent):
    # Coarse involute-like tooth profile for the educational two-stage train.
    verts=[]
    for xx in [x-width/2,x+width/2]:
        for i in range(teeth*4):
            a=i*math.tau/(teeth*4);rr=r+(.022 if i%4 in [1,2] else -.035)
            verts.append((xx,rr*math.cos(a),rr*math.sin(a)))
    n=teeth*4;faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]
    faces.extend((i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n))
    mesh(name,verts,faces,mat,parent)
def blade(parent,m):
    # Lofted symmetric airfoil with progressive chord and twist, rounded root.
    sections=[(0,.20,0,.9),(.22,.23,.10,.8),(.65,.48,.18,.5),(1.2,.55,.20,.36),(2,.46,.16,.24),(3,.34,.11,.15),(4,.22,.05,.07),(4.85,.10,-.015,.02),(5.05,.018,-.035,0)]
    v=[];n=32
    for y,chord,sweep,twist in sections:
        radial=y*4.4
        chord*=1 if y<.3 else 2
        for j in range(n):
            a=math.tau*j/n;z=math.cos(a)*chord;x=math.sin(a)*chord*(.50 if y<.3 else .17)
            v.append((x*math.cos(twist)-z*math.sin(twist),radial,z*math.cos(twist)+x*math.sin(twist)+sweep))
    f=[tuple(range(n-1,-1,-1))]
    for s in range(len(sections)-1):
        for j in range(n):a=s*n+j;b=s*n+(j+1)%n;f.append((a,b,b+n,a+n))
    f.append(tuple(range((len(sections)-1)*n,len(sections)*n)))
    mesh('Twisted composite airfoil',v,f,m['Porcelain'],parent,True)
    ring('Root collar',(0,.10,0),.24,.195,.10,m['Silver'],parent,n=40)

def build(m,detail=True):
    tower=group('tower');cyl('Foundation',(0,.12,0),1.15,.24,m['Concrete'],tower,64)
    cyl('Tapered tower',(0,17.6,0),.85,34.9,m['Porcelain'],tower,64,r2=.38)
    for y in [6,13,20,27]:ring('Tower seam',(0,y,0),.85-(y/34.9)*.47,.82-(y/34.9)*.47,.025,m['Silver'],tower)
    box('Service door',(-.83,.95,0),(.04,1.3,.48),m['Graphite'],tower,.03)
    yaw=group('yaw',(0,35.15,0));yr=group('yaw_ring',(0,0,0),yaw)
    ring('Yaw bearing',(0,0,0),.66,.32,.18,m['Silver'],yr)
    for i in range(60):
        a=i*math.tau/60;box('Yaw ring tooth',(.64*math.cos(a),.03,.64*math.sin(a)),(.045,.16,.045),m['Steel'],yr)
    base=group('nacelle_base',(0,0,0),yaw)
    box('Bedplate',(1,-.1,.225),(5.3,.23,2.55),m['Graphite'],base,.09)
    for z in [-.72,.72]:box('Load rail',(1,.08,z),(4.7,.2,.13),m['Steel'],base,.025)
    shell=group('nacelle_shell',(0,0,0),yaw)
    # Tapered eight-sided enclosure with chamfered shoulders and rear corners.
    verts=[]
    for x,w,lo,hi in [(-1.62,.70,.12,1.25),(-1.18,1.0,-.12,1.7),(2.98,1.0,-.12,1.7),(3.62,.72,.06,1.40)]:
        verts.extend((x,y,z+(.45 if z>0 else 0)) for y,z in [(lo,-w*.72),(lo+.18,-w),(hi-.22,-w),(hi,-w*.72),(hi,w*.72),(hi-.22,w),(lo+.18,w),(lo,w*.72)])
    faces=[]
    for j in range(3):
        for k in range(8):a=j*8+k;b=j*8+(k+1)%8;faces.append((a,b,b+8,a+8))
    faces.append(tuple(range(24,32)))
    mesh('Sculpted nacelle panels',verts,faces,m['Porcelain'],shell)
    # Shoulder at nose leaves the shaft opening unobstructed.
    box('Front shoulder',(-1.60,1.14,0),(.10,.34,1.12),m['Porcelain'],shell,.035)
    for z in [-1.035,1.485]:
        box('Teal belt',(1,.1,z),(5,.09,.012),m['Water'],shell)
        for x in [2.3,2.48,2.66,2.84,3.02]:box('Vent slot',(x,.58,z),(.07,.45,.016),m['Graphite'],shell,.01)
    rotor=group('rotor_spin',(-2.05,.64,0),yaw)
    hub=group('hub',(0,0,0),rotor)
    xcyl('Rotor hub',0,.47,.72,m['Silver'],hub)
    # Aerodynamic spinner profile, revolved about X.
    vv=[];profile=[(-.92,.025),(-.8,.24),(-.56,.43),(-.24,.51),(.12,.47)]
    for x,r in profile:
        vv.extend((x,r*math.cos(i*math.tau/48),r*math.sin(i*math.tau/48)) for i in range(48))
    ff=[tuple(range(47,-1,-1)),tuple(range(192,240))]
    for j in range(4):
        for i in range(48):a=j*48+i;b=j*48+(i+1)%48;ff.append((a,b,b+48,a+48))
    mesh('Spinner',vv,ff,m['Porcelain'],hub,True)
    for i in range(3):
        mount=group('blade_mount_'+str(i),(0,0,0),rotor);mount.rotation_euler[0]=i*math.tau/3
        ring('Pitch bearing',(0,.49,0),.29,.20,.18,m['Graphite'],mount,n=48)
        p=group('blade_'+str(i),(0,.58,0),mount);blade(p,m)
        if detail:
            for j in range(12):
                a=j*math.tau/12;cyl('Pitch flange bolt',(.26*math.cos(a),.04,.26*math.sin(a)),.017,.065,m['Silver'],p,6)
    shaft=group('main_shaft',(-1,.64,0),yaw);spin=group('shaft_spin',(0,0,0),shaft)
    xcyl('Main shaft',.275,.16,2.8,m['Silver'],spin)
    bearing=group('main_bearing',(-.9,.64,0),yaw)
    box('Bearing support',(0,-.40,0),(.52,.36,.86),m['Steel'],bearing,.055)
    xring('Main bearing',0,.43,.18,.34,m['Steel'],bearing)
    xring('Bearing lip',-.2,.39,.26,.06,m['Silver'],bearing)
    if detail:
        bolts('Bearing',-.245,.34,12,m['Graphite'],bearing)
        for i in range(16):
            a=i*math.tau/16;p=group('Bearing roller',(0,.235*math.cos(a),.235*math.sin(a)),bearing);xcyl('Roller',0,.034,.28,m['Silver'],p,12)
    case=group('gearbox_case',(.65,.64,0),yaw)
    # Input swept radius .622; intermediate centre Z=.8 + radius .422.
    # Sump top Y=-.65, far-wall inside Z=1.245: clear at every gear phase.
    box('Gearbox sump',(.45,-.71,.34),(1.55,.12,1.89),m['Steel'],case,.025)
    box('Gearbox far wall',(.45,.02,1.31),(1.55,1.45,.13),m['Steel'],case,.025)
    # Low ribs support the casing without cutting through the shaft axes.
    for x in [-.30,1.2]:box('Gearbox end rib',(x,-.51,.34),(.12,.26,1.89),m['Steel'],case,.025)
    gi=group('gear_input',(.68,.64,0),yaw);isp=group('input_spin',(0,0,0),gi)
    gear('Input 36 teeth',0,.60,36,.18,m['Silver'],isp)
    mid=group('gear_intermediate',(.68,.64,.8),yaw);msp=group('intermediate_spin',(0,0,0),mid)
    gear('Intermediate 12 teeth',0,.20,12,.18,m['Copper'],msp);gear('Intermediate 24 teeth',.48,.40,24,.16,m['Silver'],msp);xcyl('Countershaft',.25,.085,.9,m['Silver'],msp)
    out=group('gear_output',(1.16,.64,.2),yaw);osp=group('output_spin',(0,0,0),out)
    gear('Output 12 teeth',0,.20,12,.16,m['Copper'],osp);xcyl('Fast shaft',.40,.075,1,m['Silver'],osp)
    brake=group('brake',(1.8,.64,.2),yaw);bs=group('brake_spin',(0,0,0),brake)
    xring('Brake disc',0,.31,.08,.045,m['Silver'],bs)
    box('Brake caliper',(0,.26,0),(.25,.16,.26),m['Amber'],brake,.03)
    gen=group('generator_stator',(2.65,.64,.2),yaw)
    # Open near half for cutaway; outer shell is hidden by nacelle in exterior mode.
    support=group('Stator axis',(0,0,0),gen)
    axis(ring('Stator laminations',(0,0,0),.53,.37,1.15,m['Steel'],support,start=-math.pi/2,end=math.pi/2,n=48))
    for x in [-.62,.62]:xring('Generator end frame',x,.55,.36,.09,m['Silver'],gen)
    for z in [-.40,.40]:box('Generator feet',(0,-.48,z),(.9,.18,.18),m['Steel'],gen,.025)
    if detail:
        for j in range(18):
            a=j*math.tau/18;y=.40*math.cos(a);z=.40*math.sin(a)
            tube('Copper winding',[(-.56,y,z),(-.46,y*1.08,z*1.08),(.46,y*1.08,z*1.08),(.56,y,z)],.034,m['Copper'],gen,8)
        for x in [-.62,.62]:bolts('Generator',x,.48,12,m['Graphite'],gen)
    gr=group('generator_rotor',(2.65,.64,.2),yaw);gs=group('generator_spin',(0,0,0),gr)
    xcyl('Generator rotor',0,.28,1.0,m['Graphite'],gs);xcyl('Rotor shaft',0,.075,1.55,m['Silver'],gs)
    for i in range(12):
        a=i*math.tau/12;box('Rotor pole',(0,.27*math.cos(a),.27*math.sin(a)),(.85,.07,.07),m['Copper'] if i%2 else m['Silver'],gs,.01)
    control=group('controls',(2.6,.93,.78),yaw)
    box('Converter cabinet',(0,0,0),(1.3,.95,.26),m['Porcelain'],control,.035)
    for i in range(4):
        box('Panel seam',(-.48+i*.32,0,-.14),(.014,.82,.014),m['Silver'],control)
        box('Status display',(-.37+i*.32,.22,-.15),(.18,.12,.02),m['Glass'],control)
        cyl('Status lamp',(-.37+i*.32,-.22,-.16),.025,.02,m['Water'],control,12)
    ym=group('yaw_motor',(-.4,.27,-.62),yaw)
    cyl('Yaw drive motor',(0,0,0),.15,.48,m['Water'],ym)
    cyl('Yaw reduction housing',(0,-.20,0),.2,.17,m['Steel'],ym)
    if detail:
        for i in range(12):
            a=i*math.tau/12;beam('Motor cooling fin',(.15*math.cos(a),-.1,.15*math.sin(a)),(.15*math.cos(a),.2,.15*math.sin(a)),.014,m['Silver'],ym)
    sensors=group('sensors',(2.5,1.73,0),yaw)
    cyl('Sensor mast',(0,.30,0),.035,.60,m['Silver'],sensors,16)
    anem=group('anemometer_spin',(0,.60,0),sensors)
    for i in range(3):
        a=i*math.tau/3;beam('Cup arm',(0,0,0),(.23*math.cos(a),0,.23*math.sin(a)),.014,m['Silver'],anem)
        cyl('Wind cup',(.23*math.cos(a),0,.23*math.sin(a)),.07,.07,m['Steel'],anem,16)
    vane=group('vane_spin',(0,.23,0),sensors)
    beam('Vane arm',(-.30,0,0),(.30,0,0),.014,m['Silver'],vane)
    mesh('Vane fin',[(.1,-.07,0),(.34,-.12,0),(.34,.12,0),(.1,.07,0)],[(0,1,2,3)],m['Steel'],vane)
