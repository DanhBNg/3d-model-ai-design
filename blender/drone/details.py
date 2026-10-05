"""Functional visible detail, kept within each moving assembly."""
import bpy, math
from geometry import box,cylinder,ring,beam,wire,mesh,bevel,group

def screw(name,pos,m,parent):
    cylinder(name,pos,.0019,.0013,m['metal'],parent,n=12)
    box(name+' slot',(pos[0],pos[1]+.0007,pos[2]),(.0021,.00015,.00055),m['black'],parent,0)

def add_details(m,parts,motors):
    frame=parts['frame'];upper=parts['shell_upper'];lower=parts['shell_lower']
    # Central perimeter and load-bearing rails seal the space between covers.
    for sx in (-1,1):
        box('Side structural rail',(sx*.052,.06,0),(.007,.034,.172),m['frame'],frame,.003)
        for z in (-.082,.082):
            cylinder('Upper cover boss',(sx*.0475,.067,z),.003,.02,m['black'],frame,n=16)
            screw('Upper fastener',(sx*.043,.105,z),m,upper)
        box('Top orange shoulder',(sx*.051,.101,.035),(.003,.006,.045),m['orange'],upper,.001)
        for j in range(7):
            # Angled dark inset louvers are visual recesses, not open airflow tunnels.
            box('Vent louver',(sx*.055,.093,-.026+j*.008),(.002,.009,.0032),m['black'],upper,.0007)
        box('Shell inner rib',(sx*.049,.093,.022),(.0025,.028,.123),m['shell'],upper,.0005)
    for z in (-.09,.09):box('Crossmember',(0,.058,z),(.093,.028,.008),m['frame'],frame,.003)
    # Dark panel, engraved-looking crest and battery status indicator.
    box('Top service strip',(0,.122,.016),(.034,.0015,.105),m['black'],upper,.006)
    for j in range(3):box('Battery status',(0,.1232,.043+j*.006),(.011,.0007,.002),m['led'],upper,.0005)
    box('Signature stripe',(0,.1235,-.012),(.019,.0008,.004),m['orange'],upper,.0005)
    for x in (-.033,.033):
        for j in range(5):box('Underside vent',(x,.024,-.025+j*.012),(.013,.001,.003),m['black'],lower,.0005)
    # Motors: stationary winding packs, rotating bell rim + radial spokes + magnets.
    for id,x,z,hand in motors:
        mot=parts['motor_'+id];rot=bpy.data.objects['rotor_'+id];p=parts['prop_'+id]
        ring('Bell skirt '+id,(0,.002,0),.019,.0174,.016,m['black'],rot)
        ring('Bell upper rim '+id,(0,.0105,0),.0195,.011,.003,m['metal'],rot)
        cylinder('Shaft '+id,(0,.018,0),.0028,.029,m['metal'],mot,n=20)
        ring('Bearing '+id,(0,.015,0),.007,.003,.004,m['metal'],mot,n=24)
        for j in range(12):
            a=j*math.tau/12
            # Winding is 3 flattened copper turns around each stator tooth.
            for t in range(3):
                cx=.0118*math.cos(a);cz=.0118*math.sin(a)
                cylinder('Coil '+id,(cx,.010+t*.002,cz),.0032,.0014,m['copper'],mot,n=10)
        for j in range(6):
            a=j*math.tau/6
            beam('Bell spoke '+id,(.004*math.cos(a),.0105,.004*math.sin(a)),(.017*math.cos(a),.0105,.017*math.sin(a)),.0035,.002,m['black'],rot)
        ring('Orange rotor band '+id,(0,-.006,0),.0192,.0186,.0025,m['orange'],rot)
        cylinder('Retainer '+id,(0,.0065,0),.0042,.003,m['metal'],p,n=12)
        for q in (-1,1):
            screw('Motor mount '+id,(q*.01,-.001,0),m,mot)
        # Cables run with the arm, terminating at a connector under the motor.
        for j in range(3):
            xx=math.copysign(.045,x);zz=math.copysign(.074,z)
            wire('Three phase '+id,[(xx,.065+j*.0018,zz),(x*.77,.08+j*.0018,z*.88),(x,.077+j*.0018,z)],.00085,m['copper'] if j==1 else m['rubber'],frame)
        box('Arm marking '+id,(x*.77,.076,z*.86),(.013,.001,.009),m['orange'],frame,.001)
    # Battery: pouch cells individually modeled, tray, retaining bridge, plug and balance header.
    batt=parts['battery']
    box('Battery tray',(0,.065,.041),(.081,.004,.088),m['black'],batt,.004)
    for i in range(4):
        box('LiPo pouch '+str(i),(0,.07+i*.0082,.043),(.069,.0075,.079),m['cell'],batt,.002)
        box('Pouch edge '+str(i),(.034,.07+i*.0082,.043),(.002,.006,.077),m['orange'],batt,.0005)
    for z in (.011,.071):box('Pack retaining strap',(0,.103,z),(.075,.003,.012),m['black'],batt,.001)
    box('Battery label',(0,.1025,.027),(.05,.001,.03),m['shell'],batt,.001)
    for i in range(5):box('Cell rating bar',(-.017+i*.008,.1032,.03),(.003,.0006,.015),m['black'],batt,0)
    box('XT power connector',(.041,.088,-.026),(.012,.014,.016),m['orange'],batt,.0015)
    for s in (-1,1):
        cylinder('Power contact',(.041+s*.003,.088,-.035),.0016,.003,m['gold'],batt,n=12,axis='z')
        wire('Pack output',[(s*.024,.09,-.019),(s*.024,.078,-.038),(.041+s*.003,.08,-.038),(.041+s*.003,.088,-.031)],.0012,m['orange'] if s==1 else m['rubber'],batt)
    # PCB population: separate ESC channels, MOSFETs, copper power bus and sockets.
    esc=parts['esc'];fc=parts['flight_controller']
    for x in (-.027,.027):
        for z in (-.07,-.029):
            for j in range(3):
                box('MOSFET',(x+(j-1)*.008,.058,z),(.006,.004,.007),m['chip'],esc,.0004)
                for dz in (-.0045,.0045):box('MOSFET pad',(x+(j-1)*.008,.0564,z+dz),(.0055,.0006,.002),m['gold'],esc,.0002)
            cylinder('ESC capacitor',(x,.061,z+.011),.0035,.009,m['metal'],esc,n=16)
    for s in (-1,1):
        box('Copper DC bus',(s*.009,.0565,-.048),(.004,.001,.051),m['gold'],esc,.0004)
        box('Power header',(s*.006,.06,-.018),(.008,.008,.009),m['orange'],esc,.001)
    for j in range(8):
        z=-.077+j*.007
        wire('ESC trace',[(-.02,.0562,z),(-.014,.0562,z),(-.014,.0562,z+.003),(.02,.0562,z+.003)],.00022,m['gold'],esc)
    # Flight computer, IMU and four silicone isolation pillars.
    box('Flight MCU',(0,.072,-.055),(.015,.004,.015),m['chip'],fc,.0004)
    box('IMU',(.013,.072,-.068),(.007,.003,.007),m['metal'],fc,.0003)
    box('Barometer',(-.014,.072,-.067),(.005,.003,.007),m['black'],fc,.0003)
    for x in (-.019,.019):
        for z in (-.0765,-.0385):
            cylinder('Silicone damper',(x,.0625,z),.002,.013,m['orange'],fc,n=16)
            screw('FC retention',(x,.073,z),m,fc)
    for side in (-1,1):
        for j in range(7):
            box('MCU pin',(side*.0085,.071,-.061+j*.002),(.002,.0007,.0008),m['gold'],fc,0)
    for j in range(5):
        box('FC resistor',(-.01+j*.004,.072,-.044),(.002,.002,.003),m['chip'],fc,.0002)
        wire('FC trace',[(-.008+j*.004,.0702,-.047),(-.008+j*.004,.0702,-.052),(-.014+j*.004,.0702,-.06)],.00015,m['gold'],fc)
    box('USB connector',(0,.073,-.078),(.011,.006,.006),m['metal'],fc,.0005)
    box('USB port',(0,.073,-.0812),(.008,.003,.0005),m['black'],fc,.0003)
    box('Data header',(.016,.073,-.052),(.005,.006,.013),m['shell'],fc,.0006)
    cylinder('FC status LED',(-.013,.074,-.045),.0013,.001,m['led'],fc,n=12)
    # Gimbal chassis is a true nested three-axis mount.
    g=parts['gimbal'];yaw=bpy.data.objects['gimbal_yaw'];roll=bpy.data.objects['gimbal_roll'];pitch=bpy.data.objects['gimbal_pitch']
    box('Gimbal mounting plate',(0,.025,.018),(.043,.004,.055),m['frame'],g,.003)
    for x in (-.016,.016):cylinder('Gimbal suspension',(x,.03,.008),.003,.008,m['rubber'],g,n=16)
    cylinder('Yaw actuator',(0,.019,0),.012,.01,m['metal'],yaw,n=32)
    box('Rear yaw arm',(0,.007,.022),(.012,.025,.008),m['black'],yaw,.002)
    cylinder('Roll actuator',(0,0,.021),.011,.009,m['metal'],roll,n=32,axis='z')
    for x in (-.027,.027):
        box('Gimbal yoke',(x,0,.005),(.004,.028,.031),m['metal'],roll,.002)
        cylinder('Pitch bearing',(x,0,0),.008,.005,m['black'],roll,n=24,axis='x')
    cylinder('Lens barrel',(0,0,-.019),.0145,.019,m['black'],pitch,n=40,axis='z')
    cylinder('Lens rim',(0,0,-.03),.0125,.003,m['metal'],pitch,n=40,axis='z')
    cylinder('Front optic',(0,0,-.032),.0108,.001,m['glass'],pitch,n=40,axis='z')
    cylinder('Aperture',(0,0,-.0327),.0057,.0005,m['black'],pitch,n=32,axis='z')
    cylinder('Optical inner reflection',(.002,.002,-.033),.0025,.0003,m['glass'],pitch,n=24,axis='z')
    for x in (-.014,.014):box('Camera cooling rib',(x,0,.016),(.002,.021,.002),m['metal'],pitch,.0004)
