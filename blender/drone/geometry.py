"""Native geometry helpers. Inputs use metres, +Y up and -Z forward."""
import bpy, bmesh, math
from mathutils import Vector, Matrix

def cv(p): return (p[0],-p[2],p[1])

def group(name, pos=(0,0,0), parent=None):
    o=bpy.data.objects.new(name,None)
    bpy.context.scene.collection.objects.link(o)
    o.location=cv(pos)
    o.parent=parent
    return o

def mesh(name, verts, faces, mat, parent=None, smooth=False):
    me=bpy.data.meshes.new(name)
    me.from_pydata([cv(v) for v in verts],[],faces)
    me.validate();me.update()
    bm=bmesh.new();bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(me);bm.free()
    o=bpy.data.objects.new(name,me);bpy.context.scene.collection.objects.link(o)
    o.parent=parent;me.materials.append(mat)
    for p in me.polygons:p.use_smooth=smooth
    return o

def bevel(o, width=.001, segments=3):
    m=o.modifiers.new('Manufactured edge radii','BEVEL');m.width=width;m.segments=segments
    m=o.modifiers.new('Face normals','WEIGHTED_NORMAL');m.keep_sharp=True;m.weight=40
    return o

def box(name,pos,size,mat,parent,rounding=.001):
    verts=[(pos[0]+x*size[0]/2,pos[1]+y*size[1]/2,pos[2]+z*size[2]/2) for x,y,z in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    o=mesh(name,verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],mat,parent)
    return bevel(o,rounding) if rounding else o

def cylinder(name,pos,r,depth,mat,parent,n=32,axis='y',r2=None):
    r2=r if r2 is None else r2
    verts=[]
    for h,rad in [(-depth/2,r),(depth/2,r2)]:
        for i in range(n):
            a=i*math.tau/n; p=(rad*math.cos(a),h,rad*math.sin(a))
            if axis=='z':p=(p[0],p[2],p[1])
            if axis=='x':p=(p[1],p[0],p[2])
            verts.append(tuple(p[j]+pos[j] for j in range(3)))
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    o=mesh(name,verts,faces,mat,parent,True)
    o.data.polygons[0].use_smooth=False;o.data.polygons[1].use_smooth=False
    return bevel(o,.00035,2)

def ring(name,pos,outer,inner,depth,mat,parent,n=40):
    verts=[]
    for y,r in [(-depth/2,outer),(depth/2,outer),(-depth/2,inner),(depth/2,inner)]:
        for i in range(n):
            a=i*math.tau/n;verts.append((pos[0]+r*math.cos(a),pos[1]+y,pos[2]+r*math.sin(a)))
    faces=[]
    for i in range(n):
        j=(i+1)%n
        faces.extend([(i,j,n+j,n+i),(n+i,n+j,3*n+j,3*n+i),(2*n+i,3*n+i,3*n+j,2*n+j),(i,2*n+i,2*n+j,j)])
    return mesh(name,verts,faces,mat,parent,True)

def beam(name,a,b,width,height,mat,parent):
    dx=b[0]-a[0];dz=b[2]-a[2];L=math.hypot(dx,dz);nx=-dz/L; nz=dx/L
    verts=[]
    for p,w in [(a,width),(b,width*.73)]:
        for h,s in [(-height/2,-1),(-height/2,1),(height/2,1),(height/2,-1)]:
            verts.append((p[0]+nx*w*s/2,p[1]+h,p[2]+nz*w*s/2))
    return bevel(mesh(name,verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],mat,parent),.0025)

def wire(name, points, radius, mat, parent):
    cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.resolution_u=2
    cu.bevel_depth=radius;cu.bevel_resolution=2
    sp=cu.splines.new('POLY');sp.points.add(len(points)-1)
    for v,p in zip(sp.points,points):v.co=(*cv(p),1)
    o=bpy.data.objects.new(name,cu);bpy.context.scene.collection.objects.link(o);o.parent=parent;cu.materials.append(mat)
    return o

def shell(name,parent,mat,upper=True):
    # Nested rounded-rectangle rings make a hollow, rimmed molded cover.
    n=64;verts=[]
    layers=[(1,.076),(.99,.095),(.86,.119),(.12,.122),(.12,.12),(.83,.117),(.957,.094),(.966,.076)] if upper else [(1,.044),(.94,.028),(.65,.021),(.12,.021),(.12,.023),(.63,.024),(.91,.03),(.967,.044)]
    for scale,y in layers:
        for i in range(n):
            t=i*math.tau/n;cx=math.cos(t);sz=math.sin(t)
            x=math.copysign(abs(cx)**.65,cx)*.058*scale
            z=math.copysign(abs(sz)**.65,sz)*.103*scale
            verts.append((x,y,z))
    faces=[]
    for k in range(len(layers)):
        l=(k+1)%len(layers)
        faces.extend([(k*n+i,k*n+(i+1)%n,l*n+(i+1)%n,l*n+i) for i in range(n)])
    # Close the small central cap with the same shell thickness.
    faces += [tuple(3*n+i for i in range(n)),tuple(4*n+i for i in range(n-1,-1,-1))]
    return mesh(name,verts,faces,mat,parent,True)

def blade(name,parent,mat,hand,angle=0):
    verts=[];faces=[];N=16;K=10
    for side in (1,-1):
        offset=len(verts)
        for i in range(N):
            t=i/(N-1);rad=.008+.087*t
            chord=(.009+.014*math.sin(math.pi*t)**.7)*(1-.45*t)
            if i==N-1:chord=.003
            twist=hand*(.4-.23*t)
            sweep=.011*t*t*hand
            for j in range(K):
                a=j*math.tau/K
                c=math.cos(a)*chord/2
                h=math.sin(a)*(.0007+.0005*(1-t))
                x=rad*side;z=(c*math.cos(twist)+sweep)*side;y=c*math.sin(twist)+h
                verts.append((x*math.cos(angle)-z*math.sin(angle),y,x*math.sin(angle)+z*math.cos(angle)))
        for i in range(N-1):
            for j in range(K):
                a=offset+i*K+j;b=offset+i*K+(j+1)%K;faces.append((a,b,b+K,a+K))
        faces += [tuple(offset+j for j in range(K-1,-1,-1)),tuple(offset+(N-1)*K+j for j in range(K))]
    return mesh(name,verts,faces,mat,parent,True)

def consolidate():
    """Bake modifiers, merge only siblings sharing a material; keep all pivots."""
    deps=bpy.context.evaluated_depsgraph_get();buckets={}
    for o in list(bpy.context.scene.objects):
        if o.type not in ('MESH','CURVE'):continue
        key=(o.parent.name if o.parent else '',o.data.materials[0].name)
        buckets.setdefault(key,[]).append(o)
    for (parent_name,mat_name),objects in buckets.items():
        verts=[];faces=[];smooth=[]
        for o in objects:
            ev=o.evaluated_get(deps);me=ev.to_mesh();off=len(verts)
            verts.extend(o.matrix_local@v.co for v in me.vertices)
            for p in me.polygons:faces.append(tuple(off+i for i in p.vertices));smooth.append(p.use_smooth)
            ev.to_mesh_clear()
        me=bpy.data.meshes.new(parent_name+'__'+mat_name);me.from_pydata(verts,[],faces);me.update()
        obj=bpy.data.objects.new(me.name,me);bpy.context.scene.collection.objects.link(obj)
        obj.parent=bpy.data.objects.get(parent_name);me.materials.append(bpy.data.materials[mat_name])
        for p,s in zip(me.polygons,smooth):p.use_smooth=s
        for o in objects:bpy.data.objects.remove(o,do_unlink=True)
