"""All input points use web metres / Y-up. No dependency on the drone model."""
import bpy, bmesh, math
from mathutils import Vector

def cv(p): return (p[0],-p[2],p[1])
def group(name,pos=(0,0,0),parent=None):
    o=bpy.data.objects.new(name,None);bpy.context.scene.collection.objects.link(o);o.parent=parent;o.location=cv(pos);return o
def mesh(name,verts,faces,mat,parent=None,smooth=False):
    me=bpy.data.meshes.new(name);me.from_pydata([cv(v) for v in verts],[],faces);me.validate();me.update()
    bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);bm.to_mesh(me);bm.free()
    o=bpy.data.objects.new(name,me);bpy.context.scene.collection.objects.link(o);o.parent=parent;me.materials.append(mat)
    for p in me.polygons:p.use_smooth=smooth
    return o
def box(name,p,s,mat,parent=None,bevel=0):
    v=[(p[0]+x*s[0]/2,p[1]+y*s[1]/2,p[2]+z*s[2]/2) for x,y,z in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    o=mesh(name,v,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)],mat,parent)
    if bevel:
        m=o.modifiers.new('Edge radius','BEVEL');m.width=bevel;m.segments=2
        o.modifiers.new('Normals','WEIGHTED_NORMAL')
    return o
def cyl(name,p,r,h,mat,parent=None,n=32,r2=None):
    r2=r if r2 is None else r2
    v=[(p[0]+rr*math.cos(i*math.tau/n),p[1]+y,p[2]+rr*math.sin(i*math.tau/n)) for y,rr in [(-h/2,r),(h/2,r2)] for i in range(n)]
    f=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    return mesh(name,v,f,mat,parent,True)
def ring(name,p,outer,inner,h,mat,parent=None,start=0,end=math.tau,n=64):
    v=[(p[0]+r*math.cos(start+(end-start)*i/n),p[1]+y,p[2]+r*math.sin(start+(end-start)*i/n)) for y,r in [(-h/2,outer),(h/2,outer),(-h/2,inner),(h/2,inner)] for i in range(n+1)]
    s=n+1;f=[]
    for i in range(n): f.extend([(i,i+1,s+i+1,s+i),(s+i,s+i+1,3*s+i+1,3*s+i),(2*s+i,3*s+i,3*s+i+1,2*s+i+1),(i,2*s+i,2*s+i+1,i+1)])
    if end-start<math.tau-.001:f.extend([(0,s,3*s,2*s),(n,2*s-1,4*s-1,3*s-1)])
    return mesh(name,v,f,mat,parent,True)
def tube(name,points,r,mat,parent=None,sides=12,open_top=False):
    pts=[Vector(p) for p in points];v=[];span=math.pi*1.3 if open_top else math.tau
    for i,p in enumerate(pts):
        d=(pts[min(i+1,len(pts)-1)]-pts[max(0,i-1)]).normalized();ref=Vector((0,0,1)) if abs(d.z)<.9 else Vector((0,1,0));u=d.cross(ref).normalized();w=d.cross(u).normalized()
        for j in range(sides+1):
            a=span*j/sides+(math.pi*.35 if open_top else 0);v.append(tuple(p+r*(math.cos(a)*u+math.sin(a)*w)))
    f=[];s=sides+1
    for i in range(len(pts)-1):
        for j in range(sides):a=i*s+j;f.append((a,a+1,a+s+1,a+s))
    return mesh(name,v,f,mat,parent,True)
def beam(name,a,b,r,mat,parent=None):return tube(name,[a,b],r,mat,parent,8)
def consolidate():
    bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();buckets={}
    for o in list(bpy.context.scene.objects):
        if o.type=='MESH':buckets.setdefault((o.parent.name if o.parent else '',o.data.materials[0].name),[]).append(o)
    for (pa,ma),objects in buckets.items():
        verts=[];faces=[];smooth=[]
        for o in objects:
            ev=o.evaluated_get(deps);me=ev.to_mesh();off=len(verts);verts.extend(o.matrix_local@v.co for v in me.vertices)
            faces.extend(tuple(off+i for i in p.vertices) for p in me.polygons);smooth.extend(p.use_smooth for p in me.polygons);ev.to_mesh_clear()
        me=bpy.data.meshes.new(pa+'__'+ma);me.from_pydata(verts,[],faces);me.update()
        o=bpy.data.objects.new(me.name,me);bpy.context.scene.collection.objects.link(o);o.parent=bpy.data.objects.get(pa);me.materials.append(bpy.data.materials[ma])
        for p,s in zip(me.polygons,smooth):p.use_smooth=s
        for old in objects:bpy.data.objects.remove(old,do_unlink=True)
