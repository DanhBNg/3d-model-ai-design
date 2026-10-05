import json
from pathlib import Path
from geometry import *
def build(m,g,detail):
    layout=json.loads((Path(__file__).resolve().parents[2]/'src/models/thermal-power/layout.json').read_text())
    for name,route in layout['routes'].items():
        if not route['assembly']:continue
        mat=m['orange' if route['assembly']=='steam_pipes' else 'cyan' if name=='feed' else 'blue' if name.startswith('cooling') else 'steel'];points=route['points'];pa=g[route['assembly']]
        tube(name,points,route['radius'],mat,pa,16)
        if detail:
            for p in points[1:-1]:cyl('Pipe joint',p,route['radius']*1.22,.06,m['silver'],pa,16)
