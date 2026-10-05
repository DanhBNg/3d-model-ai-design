"""Common hydraulic envelopes shared with the Three.js water meshes."""
import json,math
from pathlib import Path
from geometry import mesh
DATA=json.loads((Path(__file__).resolve().parents[2]/'src/models/hydroelectric/hydraulics.json').read_text())
def duct(name,sections,material,parent):
    verts=[];faces=[];segments=24
    for i,(x,y,z,h,w) in enumerate(sections):
        prev=sections[max(0,i-1)];nxt=sections[min(len(sections)-1,i+1)]
        dx=nxt[0]-prev[0];dy=nxt[1]-prev[1];length=math.hypot(dx,dy);nx=-dy/length;ny=dx/length
        for j in range(segments+1):
            a=math.pi*j/segments
            verts.append((x+nx*h*math.cos(a),y+ny*h*math.cos(a),z+w*math.sin(a)))
    for i in range(len(sections)-1):
        for j in range(segments):
            k=i*(segments+1)+j;faces.append((k,k+1,k+segments+2,k+segments+1))
    return mesh(name,verts,faces,material,parent,True)
