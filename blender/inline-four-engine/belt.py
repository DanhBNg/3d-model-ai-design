import math
from geometry import mesh,group,box,cv
P=[(.1,0,.019),(.35,-.04,.038),(.35,.04,.038)]
N=[]
for i,(y,z,r) in enumerate(P):
 yy,zz,rr=P[(i+1)%3];d=math.hypot(yy-y,zz-z);N.append(math.atan2(zz-z,yy-y)-math.acos((r-rr)/d))
S=[];LENGTH=0
for i,(y,z,r) in enumerate(P):
 yy,zz,rr=P[(i+1)%3];n=N[i];p=(y+r*math.cos(n),z+r*math.sin(n));q=(yy+rr*math.cos(n),zz+rr*math.sin(n));length=math.dist(p,q)
 S.append((LENGTH,length,p,q,None));LENGTH+=length;sweep=(N[(i+1)%3]-n)%math.tau;length=rr*sweep
 S.append((LENGTH,length,None,None,(yy,zz,rr,n,sweep)));LENGTH+=length
def sample(d):
 d%=LENGTH
 for start,length,p,q,arc in S:
  if d<start+length:
   t=(d-start)/length
   if arc:
    y,z,r,n,sweep=arc;a=n+sweep*t;return y+r*math.cos(a),z+r*math.sin(a),a+math.pi/2
   return p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,math.atan2(q[1]-p[1],q[0]-p[0])
def build_belt(root,m,detail):
 n=300;v=[]
 for j in range(n):
  y,z,a=sample(LENGTH*j/n);ny,nz=-math.sin(a),math.cos(a)
  for x,o in [(-.2325,-.0013),(-.2175,-.0013),(-.2325,.0013),(-.2175,.0013)]:v.append((x,y+ny*o,z+nz*o))
 f=[]
 for j in range(n):
  a=4*j;b=4*((j+1)%n)
  f.extend([(a,b,b+1,a+1),(a+2,a+3,b+3,b+2),(a,a+2,b+2,b),(a+1,b+1,b+3,a+3)])
 mesh('rubber_timing_belt',v,f,m['dark'],root,True)
 # Independent roots retain animated travel around the exact same analytic path.
 for j in range(96 if detail else 24):
  y,z,a=sample(LENGTH*j/(96 if detail else 24));mark=group(f'belt_marker_{j}',(-.225,y,z),root);mark.rotation_euler.x=a
  box('belt_tooth',(0,0,0),(.017,.0022,.0024),m['edge'] if j%8==0 else m['dark'],mark)
