import math
from geometry import group,box,cyl,ring,mesh,tube,beam

def build(m,detail=True):
    center=(1.6,1.25,0)
    scroll=group('scroll_case',center)
    # Open top spiral shell: tapered meridional half-sections leave the runner visible.
    v=[];faces=[];N=72;K=10
    for i in range(N+1):
        a=math.pi+i/N*math.tau;rr=.40-.25*i/N;R=.83
        for j in range(K+1):
            b=math.pi+j/K*math.pi;v.append(((R+rr*math.cos(b))*math.cos(a),rr*math.sin(b),(R+rr*math.cos(b))*math.sin(a)))
    for i in range(N):
        for j in range(K):k=i*(K+1)+j;faces.append((k,k+1,k+K+2,k+K+1))
    mesh('Spiral shell cutaway',v,faces,m['Steel'],scroll,True)
    ring('Scroll seat',(0,-.17,0),1.1,.66,.08,m['Silver'],scroll)
    guides=group('guide_vanes',center)
    ring('Guide lower ring',(0,-.11,0),.76,.60,.10,m['Copper'],guides)
    for i in range(16):
        a=i*math.tau/16;p=group('guide_%02d'%i,(.69*math.cos(a),.05,.69*math.sin(a)),guides)
        blade=box('Wicket blade',(0,0,0),(.25,.25,.045),m['Silver'],p,.012);p.rotation_euler.z=-a
        cyl('Wicket pin',(0,.16,0),.035,.1,m['Copper'],p,12)
    runner=group('runner',center);pivot=group('runner_spin',parent=runner)
    cyl('Runner crown',(0,.07,0),.27,.2,m['Silver'],pivot,48,r2=.14)
    ring('Runner band',(0,-.20,0),.54,.39,.075,m['Silver'],pivot)
    for i in range(13):
        vv=[]
        for t in range(13):
            u=t/12;a=i*math.tau/13+.85*u;r=.52-.30*u
            for side in [-1,1]:vv.append((r*math.cos(a),.16-.34*u+side*.095*(1-.25*u),r*math.sin(a)))
        ff=[(k*2,k*2+1,k*2+3,k*2+2) for k in range(12)]
        mesh('Francis curved blade',vv,ff,m['Silver'],pivot,True)
    shaft=group('shaft',(1.6,1.95,0));sp=group('shaft_spin',parent=shaft);cyl('Coupling shaft',(0,0,0),.105,1.30,m['Silver'],sp)
    for y in [-.4,.4]:cyl('Coupling flange',(0,y,0),.23,.1,m['Graphite'],sp)
    stator=group('generator_stator',(1.6,2.65,0))
    ring('Stator laminated core',(0,0,0),.91,.66,.66,m['Graphite'],stator,start=0,end=math.pi*1.5)
    ring('Stator casing',(0,0,0),1.0,.93,.73,m['Steel'],stator,start=0,end=math.pi*1.5)
    for i in range(27):
        a=i*math.pi*1.5/27;coil=box('Copper winding',(.76,0,0),(.10,.83,.14),m['Copper'],stator,.03);coil.rotation_euler.z=-a
    rotor=group('generator_rotor',(1.6,2.65,0));rp=group('rotor_spin',parent=rotor)
    cyl('Rotor core',(0,0,0),.5,.53,m['Steel'],rp,48)
    for i in range(20):
        a=i*math.tau/20
        o=box('Rotor pole',(.56,0,0),(.12,.48,.13),m['Copper'] if i%2 else m['Silver'],rp,.012);o.rotation_euler.z=-a
    cap=group('generator_cover',(1.6,3.16,0));ring('Top bearing bracket',(0,0,0),1.02,.30,.14,m['Steel'],cap)
    ring('Thrust bearing',(0,.05,0),.28,.12,.23,m['Copper'],cap)
    if detail:
        for i in range(12):
            a=i*math.tau/12;cyl('Cover fastener',(.89*math.cos(a),.1,.89*math.sin(a)),.035,.06,m['Silver'],cap,6)
        for y in [-.27,.27]:ring('Stator band',(0,y,0),1.025,.975,.04,m['Silver'],stator,start=0,end=math.pi*1.5)
    transformer=group('transformer',(3.9,.25,2.15));box('Transformer plinth',(0,.15,0),(1.4,.3,1.45),m['Concrete'],transformer,.04)
    box('Oil tank',(0,.78,0),(.95,1.05,.9),m['Steel'],transformer,.07)
    for x in [-.58,.58]:
        for z in [-.4,-.25,-.1,.05,.2,.35]:box('Radiator fin',(x,.75,z),(.19,.85,.045),m['Silver'],transformer)
    for x in [-.28,0,.28]:
        cyl('Bushing',(x,1.5,0),.055,.45,m['Copper'],transformer,12)
        for y in [1.35,1.44,1.53,1.62]:cyl('Porcelain shed',(x,y,0),.09,.04,m['Porcelain'],transformer,12)
    grid=group('grid');tx=5.25;tz=2.1
    for z in [-.38,.38]:
        for x in [-.35,.35]:beam('Tower leg',(tx+x,.25,tz+z),(tx+x*.3,3.45,tz+z*.3),.028,m['Silver'],grid)
        for k in range(5):
            y=.25+k*.6;w=.35*(1-k*.13)
            beam('Lattice diagonal',(tx-w,y,tz+z),(tx+w*.86,y+.6,tz+z*.86),.019,m['Silver'],grid)
            beam('Lattice diagonal',(tx+w,y,tz+z),(tx-w*.86,y+.6,tz+z*.86),.019,m['Silver'],grid)
    for y in [2.65,3.3]:beam('Crossarm',(tx-.8,y,tz),(tx+.45,y,tz),.055,m['Silver'],grid)
    for x in [tx-.7,tx,tx+.4]:
        tube('Transmission conductor',[(3.9,1.95,2.15),(4.6,2.6,2.15),(x,3.3,tz),(x,3.15,3.2)],.017,m['Copper'],grid,8)
    tube('Generator bus',[(-1.45,2.4,-1.75),(-.9,2.4,-.75),(-.9,.75,0),(0,.75,0)],.065,m['Amber'],transformer)
