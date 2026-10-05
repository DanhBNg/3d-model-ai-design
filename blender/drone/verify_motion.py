"""Sample surface intersections of independent assembly groups. Diagnostic only:
BVH surface overlap does not prove solid clearance or continuous swept volume."""
import bpy,json,sys,hashlib
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
sys.path.insert(0,str(HERE))
from geometry import cv
try:
    asset=ROOT/'public/models/drone.glb'
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.ops.import_scene.gltf(filepath=str(asset));bpy.context.view_layer.update()
    manifest=json.loads((HERE/'assembly-manifest.json').read_text());bases={}
    for p in manifest:
        verts=[];tris=[]
        for o in bpy.data.objects[p['id']].children_recursive:
            if o.type!='MESH':continue
            o.data.calc_loop_triangles();off=len(verts);verts.extend(o.matrix_world@v.co for v in o.data.vertices)
            tris.extend(tuple(off+i for i in t.vertices) for t in o.data.loop_triangles)
        bases[p['id']]=(verts,tris)
    collisions=[]
    for step in range(21):
        t=step/20;trees={};bounds={}
        for p in manifest:
            a,b=p['stage'];u=min(1,max(0,(t-a)/(b-a)));u=u*u*u*(u*(u*6-15)+10)
            offset=Vector(cv(p['offset']))*u;verts,tris=bases[p['id']];vs=[v+offset for v in verts]
            trees[p['id']]=BVHTree.FromPolygons(vs,tris,all_triangles=True,epsilon=0)
            bounds[p['id']]=([min(v[i] for v in vs) for i in range(3)],[max(v[i] for v in vs) for i in range(3)])
        for i,p in enumerate(manifest):
            for q in manifest[i+1:]:
                aa,bb=bounds[p['id']],bounds[q['id']]
                if any(aa[1][k]<bb[0][k] or bb[1][k]<aa[0][k] for k in range(3)):continue
                overlap=trees[p['id']].overlap(trees[q['id']])
                if overlap:collisions.append({'t':t,'a':p['id'],'b':q['id'],'trianglePairs':len(overlap)})
    report={'assetSha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'samples':21,'scope':'BVH surface overlap diagnostic, not continuous clearance or solid containment proof','overlaps':collisions}
    (HERE/'motion-diagnostic.json').write_text(json.dumps(report,indent=2));print('AGENT_OK '+json.dumps({'samples':21,'overlaps':len(collisions),'pairs':sorted(set(v['a']+' / '+v['b'] for v in collisions))}))
except Exception as e:
    import traceback;traceback.print_exc();print('AGENT_FAIL '+json.dumps({'error':str(e)}));sys.exit(1)
