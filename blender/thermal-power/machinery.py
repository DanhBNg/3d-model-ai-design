from geometry import *
def axial(name,x,y,z,r,length,mat,parent,n=48,inner=0,start=0,end=math.tau):
    o=ring(name,(0,0,0),r,inner,length,mat,parent,start,end,n) if inner else cyl(name,(0,0,0),r,length,mat,parent,n)
    # Blender Z axis (web Y) -> X. Ring radial cosine maps to -Y, sine to Z.
    o.rotation_euler[1]=math.pi/2;o.location=cv((x,y,z));return o
def build(m,g,detail):
    fixed=g['bearings'];box('Machine bed',(1.9,.35,-1.3),(9.1,.3,2.45),m['concrete'],fixed,.08)
    for label,x,length,r,stages in [('hp',-1.8,1.8,.53,9),('lp',2.4,2.7,.91,12)]:
        shell=g['turbine_'+label+'_shell'];rot=g['turbine_'+label+'_rotor'];pivot=group(label+'_spin',(x,2.1,-1.3),rot)
        axial('Shaft',0,0,0,.105,length+.7,m['silver'],pivot)
        # Upper half radial cosine <0 gives positive web Y; lower half fixed.
        axial('Upper casing',x,2.1,-1.3,r+.17,length,m['steel'],shell,64,r+.055,math.pi/2,math.pi*1.5)
        axial('Lower casing',x,2.1,-1.3,r+.17,length,m['steel'],fixed,64,r+.055,-math.pi/2,math.pi/2)
        for z in [-1.3-r-.13,-1.3+r+.13]:
            box('Upper flange',(x,2.135,z),(length+.1,.07,.2),m['silver'],shell)
            box('Lower flange',(x,2.065,z),(length+.1,.07,.2),m['steel'],fixed)
            if detail:
                for i in range(13):cyl('Flange bolt',(x-length/2+i*length/12,2.205,z),.035,.07,m['dark'],shell,6)
        for i in range(stages if detail else 3):
            count=stages if detail else 3;xx=-length*.43+i*length*.86/(count-1);rr=r*(.63+.34*i/(count-1));axial('Rotor disc',xx,0,0,rr*.66,.055,m['steel'],pivot,40)
            for j in range(32 if detail else 12):
                a=j*math.tau/(32 if detail else 12);v=[]
                for dx,angle in [(-.055,a),(.055,a+.09)]:
                    for radius,da in [(rr*.65,0),(rr,.025),(rr,.105),(rr*.65,.105)]:v.append((xx+dx,radius*math.cos(angle+da),radius*math.sin(angle+da)))
                mesh('Twisted turbine blade',v,[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],m['silver'],pivot)
        for xx in [x-length/2-.17,x+length/2+.17]:
            box('Pedestal',(xx,1.1,-1.3),(.32,1.2,.65),m['steel'],fixed,.05);axial('Journal housing',xx,2.1,-1.3,.22,.3,m['copper'],fixed,32,inner=.12)
        if detail:
            for i in range(7):axial('Casing rib',x-length/2+i*length/6,2.1,-1.3,r+.21,.04,m['silver'],shell,48,r+.17,math.pi/2,math.pi*1.5)
    axial('Coupling',.3,2.1,-1.3,.16,1.35,m['silver'],fixed)
    gen=g['generator_shell'];gp=group('generator_spin',(5.3,2.1,-1.3),g['generator_rotor'])
    axial('Generator rotor',0,0,0,.36,1.7,m['steel'],gp);axial('Generator spindle',0,0,0,.12,2.7,m['silver'],gp)
    axial('Generator upper cover',5.3,2.1,-1.3,.79,2.0,m['blue'],gen,64,.72,math.pi/2,math.pi*1.5)
    axial('Generator lower cover',5.3,2.1,-1.3,.79,2.0,m['blue'],fixed,64,.72,-math.pi/2,math.pi/2)
    for j in range(24):
        a=j*math.tau/24; yy=2.1+.57*math.cos(a);zz=-1.3+.57*math.sin(a)
        tube('Stator copper winding',[(4.28,yy,zz),(4.48,yy,zz),(6.15,yy,zz),(6.32,2.1+.46*math.cos(a),-1.3+.46*math.sin(a))],.055,m['copper'],fixed,8)
    for x in [4.1,6.5]:box('Generator foot',(x,1.15,-1.3),(.4,1.15,1.05),m['steel'],fixed,.06)
    cs=g['condenser_shell'];box('Condenser rear',(2.4,.95,-.43),(2.9,1.25,.12),m['blue'],cs,.05);box('Condenser front',(2.4,.95,-2.17),(2.9,1.25,.12),m['blue'],cs,.05)
    for x in [.95,3.85]:box('Waterbox end',(x,.95,-1.3),(.16,1.25,1.8),m['blue'],cs,.05)
    box('Hotwell',(2.4,.4,-1.3),(2.9,.2,1.8),m['steel'],cs)
    for j in range(7 if detail else 3):
        for k in range(9 if detail else 3):tube('Condenser heat exchange tube',[(1.1,.64+j*.105,-1.95+k*.16),(3.7,.64+j*.105,-1.95+k*.16)],.025,m['copper'],g['condenser_bundle'],6)
    for id,pos,piv in [('feed_pump',(-1.2,.45,-3.1),'feed_spin'),('cooling_pump',(6.9,.45,1.6),'cooling_spin')]:
        pa=g[id];x,y,z=pos;box('Pump base',(x,.15,z),(1.05,.18,.7),m['steel'],pa);axial('Pump motor',x+.2,y+.1,z,.23,.6,m['blue'],pa,32);p=group(piv,pos,pa);axial('Pump shaft',0,0,0,.08,.8,m['silver'],p,24)
        axial('Pump volute',x-.3,y,z,.29,.22,m['cyan'],pa,32,.12)
