"""Original inferred assembly; all dimensions in web metres, Y up."""
import math
from geometry import *
IDS='adapter cable pad_base pad_pcb tx_ferrite tx_coil pad_cover phone_back rx_coil rx_ferrite battery phone_board phone_frame screen'.split()

def build(m,detail=True):
    g={id:group(id) for id in IDS}
    cyl('Pad bottom', (0,.001,0),.055,.002,m['graphite'],g['pad_base'],96)
    ring('Pad lower shell',(0,.0045,0),.055,.052,.005,m['graphite'],g['pad_base'],n=96)
    cyl('Driver board',(0,.0026,0),.047,.001,m['pcb'],g['pad_pcb'],64)
    cyl('TX ferrite backing',(0,.0055,0),.023,.001,m['ferrite'],g['tx_ferrite'],64)
    cyl('Top contact cover',(0,.0095,0),.0545,.001,m['black'],g['pad_cover'],96)
    ring('Perimeter light guide',(0,.0083,0),.0548,.0535,.0006,m['teal'],g['pad_cover'],n=96)
    rounded('Back glass',(0,.0115,0),.075,.153,.001,.009,m['graphite'],g['phone_back'])
    rounded('Receiver magnetic shield',(0,.0138,0),.046,.050,.00065,.005,m['ferrite'],g['rx_ferrite'])
    rounded('Lithium pouch',(0,.016,.004),.055,.091,.003,.003,m['battery'],g['battery'])
    rounded('Phone mainboard',(0,.0157,-.056),.061,.024,.001,.003,m['pcb'],g['phone_board'])
    rounded('Phone aluminium chassis',(0,.0155,0),.076,.154,.007,.0095,m['frame'],g['phone_frame'],wall=.0015)
    rounded('Display bezel',(0,.0191,0),.075,.153,.0011,.009,m['black'],g['screen'])
    rounded('OLED glass',(0,.01975,0),.070,.147,.0005,.007,m['screen'],g['screen'])
    rounded('Adapter case',(-.115,.013,0),.032,.044,.025,.005,m['white'],g['adapter'])
    for z in [-.007,.007]:box('Disconnected mains pin',(-.115,.013,-.028),(.003,.011,.012),m['silver'],g['adapter']) if z==-.007 else None
    # Pins face away from the charging assembly; disconnected context only.
    box('Second disconnected pin',(-.125,.013,-.028),(.003,.011,.012),m['silver'],g['adapter'])
    pts=[(-.099,.007,.012),(-.087,.004,.026),(-.08,.003,.049),(-.066,.003,.059),(-.052,.003,.054),(-.048,.004,.027)]
    tube('USB power cable',smooth_path(pts),.0013,m['black'],g['cable'],12)
    rounded('Pad USB strain relief',(-.048,.004,.027),.007,.011,.004,.001,m['black'],g['cable'])
    for id,y in [('tx',.007),('rx',.013)]:
        root=g[id+'_coil'];group(id+'_center',(0,y,0),root)
        if detail:spiral(id+' continuous copper spiral',y,m['copper'],root)
        else:ring(id+' coil envelope',(0,y,0),.021,.006,.0008,m['copper'],root)
    if detail:details(m,g)
    return g

def details(m,g):
    for id,y in [('tx',.007),('rx',.013)]:
        root=g[id+'_coil']
        tube(id+' outer terminal',[(.0205,y,0),(.026,y,0),(.027,y,-.025)],.00042,m['copper'],root,8)
        tube(id+' inner terminal',[(.007,y,0),(.004,y-.0006,0),(.004,y-.0006,-.026)],.00032,m['copper'],root,8)
        for x in [.004,.027]:box('Solder terminal',(x,y,-.026),(.002,.0005,.003),m['silver'],root)
    # Driver board components arranged around, rather than through, the ferrite disk.
    for i,(x,z,w,d) in enumerate([(-.033,-.014,.011,.014),(.032,.01,.008,.012),(-.018,-.034,.010,.010),(.018,-.032,.011,.009)]):
        chip(m,g['pad_pcb'],x,.0036,z,w,d,i)
    for i in range(28):
        a=math.tau*i/28;r=.036;x=r*math.cos(a);z=r*math.sin(a)
        box('Driver passive',(x,.0035,z),(.0022,.0009,.0035),m['ceramic'] if i%3 else m['black'],g['pad_pcb'])
        for dz in [-.0018,.0018]:box('Passive solder',(x,.0033,z+dz),(.0024,.0003,.0007),m['silver'],g['pad_pcb'])
    for i in range(14):
        a=math.tau*i/14;r=.043
        ring('Gold plated via',(r*math.cos(a),.00315,r*math.sin(a)),.001,.00045,.00012,m['gold'],g['pad_pcb'],n=12)
    for x,z in [(-.039,-.025),(.039,-.025),(-.039,.025),(.039,.025)]:
        cyl('Assembly screw',(x,.0038,z),.0015,.0012,m['silver'],g['pad_base'],16)
        box('Screw slot',(x,.00441,z),(.0016,.00008,.00025),m['black'],g['pad_base'])
    for i in range(4):
        a=math.pi/4+i*math.pi/2;cyl('Rubber foot',(.041*math.cos(a),.00015,.041*math.sin(a)),.004,.0003,m['black'],g['pad_base'],24)
    for i,(x,z) in enumerate([(-.015,-.056),(.004,-.056),(.019,-.057)]):chip(m,g['phone_board'],x,.0168,z,.010,.012,i)
    for i in range(16):
        x=-.026+(i%8)*.007;z=-.066+(i//8)*.020
        box('Phone passive',(x,.0167,z),(.002,.001,.0028),m['ceramic'],g['phone_board'])
    # Lens barrels, recessed optical faces and flash belong to the back cover.
    rounded('Camera island',(-.021,.0107,-.055),.023,.032,.001,.005,m['black'],g['phone_back'])
    for z in [-.063,-.049]:
        cyl('Lens rim',(-.022,.0102,z),.0057,.001,m['frame'],g['phone_back'],32)
        cyl('Optical glass',(-.022,.00965,z),.0045,.00015,m['screen'],g['phone_back'],32)
        cyl('Lens pupil',(-.022,.00955,z),.0021,.0001,m['black'],g['phone_back'],24)
    cyl('Rear flash',(-.006,.011,-.056),.0024,.0003,m['white'],g['phone_back'],24)
    rounded('Battery inset',(0,.01755,.004),.049,.084,.0001,.002,m['graphite'],g['battery'])
    for x in [-.011,.011]:box('Battery connector',(x,.016,-.044),(.007,.0006,.005),m['gold'],g['battery'])
    for z in [-.02,.009]:box('Side key',(.038,.016,z),(.001,.002,.011),m['frame'],g['phone_frame'])
    for x in [-.021,-.017,-.013,.013,.017,.021]:box('Speaker aperture',(x,.015,.0771),(.0018,.0014,.0002),m['black'],g['phone_frame'])
    box('USB-C recess',(0,.015,.0771),(.008,.0027,.00025),m['black'],g['phone_frame'])
    rounded('Earpiece slit',(0,.0201,-.067),.013,.0017,.00012,.0007,m['black'],g['screen'])
    cyl('Front camera',(.015,.0201,-.066),.0018,.00012,m['black'],g['screen'],24)
    # Screen icon remains geometry, so the asset is fully self-contained offline.
    rounded('Charging battery outline',(0,.02008,.006),.018,.032,.0001,.003,m['teal'],g['screen'],wall=.001)
    rounded('Charge fill',(0,.02015,.010),.013,.019,.0001,.001,m['teal'],g['screen'])
    box('Battery icon terminal',(0,.02015,-.011),(.007,.0001,.002),m['teal'],g['screen'])
    rounded('Home indicator',(0,.0201,.067),.022,.0014,.00012,.0006,m['white'],g['screen'])

def chip(m,parent,x,y,z,w,d,index):
    box('IC package',(x,y,z),(w,.0013,d),m['black'],parent,bevel=.00035)
    box('IC inset marking',(x,y+.00067,z),(w*.6,.00006,d*.2),m['graphite'],parent)
    for side in [-1,1]:
        for i in range(6):box('IC lead',(x+side*(w/2+.0005),y-.0002,z-d*.38+i*d*.152),(.0011,.00035,.00065),m['silver'],parent)

