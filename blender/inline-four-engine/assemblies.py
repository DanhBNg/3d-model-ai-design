"""Original educational DOHC eight-valve engine; all dimensions are inferred metres."""
import math
from geometry import *
IDS=['block_front','block_rear','head','cam_cover','sump','timing_cover','crankshaft','flywheel','cam_intake','cam_exhaust','timing_belt','intake_manifold','exhaust_manifold']+[f'{p}_{i}' for i in range(1,5) for p in ['cylinder','piston','rod','intake_valve','exhaust_valve','spark_plug']]
XS=[-.15,-.05,.05,.15];OFF=[0,180,540,360]
def axial(name,p,r,h,mat,parent,n=48,inner=0):
    o=ring(name,(0,0,0),r,inner,h,mat,parent,n=n) if inner else cyl(name,(0,0,0),r,h,mat,parent,n=n)
    for v in o.data.vertices:
        # native cyl coordinates (u,-w,v) -> web axis X: (v,u,w)
        u,negw,vv=v.co;v.co=cv((p[0]+vv,p[1]+u,p[2]-negw))
    return o
def bolt(name,p,mat,parent,axis='Y'):
    return axial(name,p,.0034,.004,mat,parent,6) if axis=='X' else cyl(name,p,.0034,.004,mat,parent,n=6)
def palette():
    out={}
    for name,col,metal,rough in [('cast',(.25,.28,.29),.35,.78),('edge',(.47,.51,.51),.45,.58),('steel',(.38,.43,.46),.72,.4),('piston',(.67,.70,.7),.65,.42),('dark',(.065,.08,.09),.2,.77),('copper',(.48,.28,.15),.55,.57),('intake',(.20,.36,.38),.3,.7),('exhaust',(.45,.29,.20),.3,.72),('red',(.53,.11,.055),.15,.62),('ceramic',(.78,.76,.66),.05,.55)]:
        m=bpy.data.materials.new('engine_'+name);m.diffuse_color=(*col,1);bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough;out[name]=m
    return out
def cam_lobe(name,x,offset,kind,mat,parent):
    n=96;verts=[]
    for xx in [x-.010,x+.010]:
        for j in range(n):
            a=math.tau*j/n;phase=(2*(math.pi-a)*180/math.pi+offset)%720
            q=phase/180 if kind=='intake' else (phase-540)/180
            lift=.006*math.sin(math.pi*q)**2 if 0<q<1 else 0
            r=.023+lift;verts.append((xx,r*math.cos(a),r*math.sin(a)))
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n)]
    return mesh(name,verts,faces,mat,parent,True)
def build(detail=True):
    m=palette();g={id:group(id) for id in IDS}
    # Split cast shell. Open crankcase and genuine half-cylinder liners reveal the mechanism.
    for side,sgn in [('front',1),('rear',-1)]:
        root=g['block_'+side]
        box('cast_side_'+side,(0,.188,sgn*.052),(.422,.19,.014),m['cast'],root,.006)
        box('deck_rail_'+side,(0,.278,sgn*.048),(.435,.010,.029),m['edge'],root,.002)
        for x in [-.208,.208]:box('end_wall',(x,.189,sgn*.023),(.017,.172,.052),m['cast'],root,.003)
        if detail:
            for x in [-.19,-.1,0,.1,.19]:
                box('cast_reinforcement',(x,.191,sgn*.063),(.010,.165,.012),m['cast'],root,.002)
            for x in [-.18,-.06,.06,.18]:
                box('water_jacket_recess',(x,.215,sgn*.060),(.062,.044,.003),m['dark'],root,.005)
    for i,x in enumerate(XS,1):
        root=g[f'cylinder_{i}'];front=group(f'cylinder_{i}_front_shell',parent=root)
        ring('rear_bore_liner',(x,.234,0),.042,.038,.098,m['steel'],root,start=math.pi,end=math.tau,n=40)
        ring('front_bore_liner',(x,.234,0),.042,.038,.098,m['steel'],front,start=0,end=math.pi,n=40)
        # Rest pins: cylinders 1/4 TDC, 2/3 BDC.
        sign=1 if i in [1,4] else -1;py=.215+sign*.032
        p=group(f'piston_{i}_slide',(x,py,0),g[f'piston_{i}'])
        cyl('piston_skirt',(0,-.005,0),.0366,.05,m['piston'],p,n=64)
        cyl('crown',(0,.0195,0),.037,.003,m['piston'],p,n=64)
        if detail:
            for y in [.007,.011,.015]:ring('compression_ring',(0,y,0),.0372,.036,.0014,m['dark'],p,n=64)
            axial('wrist_pin',(0,0,0),.006,.079,m['steel'],p)
            for z in [-.02,.02]:cyl('valve_relief',(0,.0211,z),.013,.0004,m['dark'],p,n=32)
        r=group(f'rod_{i}_pose',(x,.10+sign*.032,0),g[f'rod_{i}'])
        axial('big_end',(0,0,0),.019,.022,m['steel'],r,inner=.010)
        axial('small_end',(0,.115,0),.011,.020,m['steel'],r,inner=.006)
        box('forged_web',(0,.058,0),(.010,.094,.013),m['steel'],r,.003)
        if detail:
            for z in [-.006,.006]:box('rod_flange',(0,.058,z),(.018,.082,.004),m['steel'],r,.002)
            for z in [-.016,.016]:bolt('rod_cap_bolt',(0,-.005,z),m['edge'],r,'X')
        for kind,z in [('intake',-.021),('exhaust',.021)]:
            vr=g[f'{kind}_valve_{i}'];v=group(f'{kind}_{i}_slide',(x,.280,z),vr)
            cyl('valve_face',(0,0,0),.012,.0028,m[kind],v,n=40,r2=.010)
            cyl('valve_stem',(0,.024,0),.0021,.047,m['steel'],v,n=16)
            cyl('spring_retainer',(0,.045,0),.008,.0025,m['steel'],v,n=32)
            dz=-.019 if kind=='intake' else .019
            box(f'{kind}_{i}_rocker',(0,.046,(dz)/2),(.018,.002,.038),m['steel'],v,.0008)
            sp=group(f'{kind}_{i}_spring',(x,.305,z),vr)
            points=[(.0062*math.cos(t*math.tau*6),.022*t,.0062*math.sin(t*math.tau*6)) for t in [j/144 for j in range(145)]]
            tube('valve_spring',points,.0010,m['steel'],sp,sides=6)
            cyl('valve_guide',(x,.306,z),.0045,.014,m['copper'],g['head'],n=20)
        sp=g[f'spark_plug_{i}'];cyl('spark_ceramic',(x,.312,0),.005,.036,m['ceramic'],sp,n=24);cyl('spark_hex',(x,.292,0),.007,.009,m['steel'],sp,n=6);cyl('electrode',(x,.282,0),.001,.009,m['copper'],sp,n=12)
    # Head casting uses open ports instead of a solid box covering the teaching cutaway.
    head_front=group('head_front_shell',parent=g['head'])
    for z in [-.057,.057]:box('head_outer_rail',(0,.301,z),(.44,.037,.018),m['cast'],head_front if z>0 else g['head'],.005)
    for x in XS:
        # Rear semicircular chamber ledge leaves front cutaway open to the valve seats.
        ring('chamber_roof_rear',(x,.284,0),.039,.014,.003,m['cast'],g['head'],start=math.pi,end=math.tau,n=40)
        ring('chamber_roof_front',(x,.284,0),.039,.014,.003,m['cast'],head_front,start=0,end=math.pi,n=40)
    for x in [-.211,-.1,0,.1,.211]:
        box('head_bridge',(x,.292,0),(.015,.018,.10),m['cast'],g['head'],.003)
        for z in [-.04,.04]:
            box('cam_pedestal',(x,.33,z),(.017,.025,.018),m['cast'],g['head'],.002)
            axial('cam_bearing',(x,.35,z),.012,.018,m['edge'],g['head'],inner=.008)
    # Sealed removable lid, sump and timing cover.
    box('cam_roof',(0,.391,0),(.451,.012,.136),m['dark'],g['cam_cover'],.005)
    for z in [-.065,.065]:box('cam_cover_flank',(0,.371,z),(.451,.040,.008),m['dark'],g['cam_cover'],.004)
    for x in [-.22,.22]:box('cam_cover_end',(x,.371,0),(.011,.04,.13),m['dark'],g['cam_cover'],.003)
    if detail:
        for z in [-.039,-.013,.013,.039]:box('lid_rib',(0,.398,z),(.38,.004,.005),m['edge'],g['cam_cover'],.001)
        cyl('oil_filler',(.14,.404,0),.018,.018,m['dark'],g['cam_cover'],n=32)
    box('sump_floor',(0,.038,0),(.416,.013,.115),m['dark'],g['sump'],.005)
    for z in [-.055,.055]:box('sump_wall',(0,.066,z),(.416,.048,.012),m['dark'],g['sump'],.004)
    for x in [-.202,.202]:box('sump_end',(x,.066,0),(.012,.048,.11),m['dark'],g['sump'],.004)
    box('timing_guard',(-.245,.237,0),(.014,.317,.163),m['dark'],g['timing_cover'],.015)
    # Crank journals, offset throws, and forged counterweights.
    c=group('crank_spin',(0,.10,0),g['crankshaft'])
    axial('main_crank',(0,0,0),.013,.465,m['steel'],c)
    for i,x in enumerate(XS):
        sign=1 if i in [0,3] else -1
        axial('rod_journal',(x,sign*.032,0),.010,.027,m['steel'],c)
        for xx in [x-.021,x+.021]:
            box('crank_cheek',(xx,sign*.009,0),(.015,.064,.030),m['steel'],c,.005)
            axial('counterweight',(xx,-sign*.021,0),.029,.015,m['steel'],c,n=32)
    f=group('flywheel_spin',(0,.10,0),g['flywheel']);axial('flywheel_disc',(.244,0,0),.079,.022,m['steel'],f,inner=.015);axial('clutch_hub',(.26,0,0),.03,.024,m['dark'],f)
    if detail:
        for j in range(72):
            a=j*math.tau/72;axial('ring_gear_tooth',(.243,.080*math.cos(a),.080*math.sin(a)),.0025,.024,m['edge'],f,n=5)
        for j in range(8):a=j*math.tau/8;bolt('flywheel_bolt',(.261,.055*math.cos(a),.055*math.sin(a)),m['edge'],f,'X')
    for kind,z in [('intake',-.04),('exhaust',.04)]:
        c=group(f'cam_{kind}_spin',(0,.350,z),g['cam_'+kind]);axial('camshaft',(0,0,0),.008,.461,m['steel'],c)
        for x,offset in zip(XS,OFF):cam_lobe('cam_lobe',x,offset,kind,m['steel'],c)
        axial('cam_pulley',(-.225,0,0),.038,.014,m['dark'],c,inner=.010)
        axial('cam_pulley_rim',(-.233,0,0),.038,.003,m['edge'],c,inner=.032)
        if detail:
            for j in range(5):a=j*math.tau/5;axial('pulley_aperture',(-.234,.022*math.cos(a),.022*math.sin(a)),.006,.001,m['cast'],c,n=20)
    axial('crank_pulley',(-.225,0,0),.019,.015,m['dark'],bpy.data.objects['crank_spin'])
    # Exhaust/intake runner tubes join individual ports to a longitudinal collector.
    for kind,sign in [('intake',-1),('exhaust',1)]:
        root=g[kind+'_manifold']
        for x in XS:
            pts=smooth_path([(x,.295,sign*.058),(x,.296,sign*.086),(x,.26,sign*.112),(x,.235,sign*.117)],6)
            tube(kind+'_runner',pts,.011,m[kind],root,12)
            box('port_flange',(x,.295,sign*.064),(.036,.029,.008),m['edge'],root,.003)
        tube('collector',[(-.19,.235,sign*.117),(.20,.235,sign*.117)],.019,m[kind],root,20)
        tube('outlet',smooth_path([(.19,.235,sign*.117),(.23,.23,sign*.12),(.24,.20,sign*.125)],5),.019,m[kind],root,20)
    from belt import build_belt
    build_belt(g['timing_belt'],m,detail)
    return g
