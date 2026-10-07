const part=(id,name,description,anchor,offset,group='structure')=>({id,name,title:name,subtitle:group,description,anchor,offset,group});
export const PARTS=[
 part('block_front','Thân máy · phía trước','Đỡ các xi lanh và ổ trục chính.',[0,.18,.065],[0,0,.15]),
 part('block_rear','Thân máy · phía sau','Kết cấu chịu lực của động cơ.',[0,.18,-.065],[0,0,-.14]),
 part('head','Nắp máy','Buồng cháy và các đường nạp, xả.',[0,.285,0],[0,.15,0]),
 part('cam_cover','Nắp trục cam','Che và bảo vệ cơ cấu phối khí.',[0,.38,0],[0,.24,0]),
 part('sump','Cácte dầu','Khoang chứa dầu dưới trục khuỷu.',[0,.025,0],[0,-.14,0]),
 part('timing_cover','Nắp đai cam','Bảo vệ bộ truyền phối khí.',[-.24,.23,0],[-.16,0,0]),
 part('crankshaft','Trục khuỷu','Biến chuyển động tịnh tiến thành chuyển động quay.',[0,.10,0],[0,-.075,0],'rotating'),
 part('flywheel','Bánh đà','Tích trữ động năng và làm đều tốc độ.',[.25,.10,0],[.16,0,0],'rotating'),
 part('cam_intake','Trục cam nạp','Quay bằng nửa tốc độ trục khuỷu.',[0,.35,-.04],[0,.17,-.08],'timing'),
 part('cam_exhaust','Trục cam xả','Điều khiển xupáp xả đúng chu kỳ.',[0,.35,.04],[0,.17,.08],'timing'),
 part('timing_belt','Đai phối khí','Đồng bộ trục khuỷu và hai trục cam theo tỉ số 2:1.',[-.225,.23,0],[-.12,0,0],'timing'),
 part('intake_manifold','Ống góp nạp','Dẫn khí mới vào xi lanh.',[0,.265,-.10],[0,.04,-.19]),
 part('exhaust_manifold','Ống góp xả','Dẫn khí sau cháy ra ngoài.',[0,.265,.10],[0,.04,.19]),
 ...[-.15,-.05,.05,.15].flatMap((x,i)=>{const n=i+1;return [
 part(`cylinder_${n}`,`Xi lanh ${n}`,'Dẫn hướng piston; mặt cắt cho thấy lòng xi lanh.',[x,.235,0],[x*.4,.05,0],'cylinder'),
 part(`piston_${n}`,`Piston ${n}`,'Nhận áp suất khí cháy và truyền lực tới thanh truyền.',[x,.24,0],[x*.4,.105,0],'piston'),
 part(`rod_${n}`,`Thanh truyền ${n}`,'Liên kết chốt piston với chốt khuỷu.',[x,.17,0],[x*.4,-.025,.055],'rod'),
 part(`intake_valve_${n}`,`Xupáp nạp ${n}`,'Mở trong kỳ nạp; lò xo đóng xupáp.',[x,.305,-.021],[x*.4,.10,-.07],'valve'),
 part(`exhaust_valve_${n}`,`Xupáp xả ${n}`,'Mở trong kỳ xả; lò xo đóng xupáp.',[x,.305,.021],[x*.4,.10,.07],'valve'),
 part(`spark_plug_${n}`,`Bugi ${n}`,'Tia lửa lý tưởng tại đầu kỳ sinh công.',[x,.30,0],[x*.4,.15,0],'ignition')];})
];
export const PART_BY_ID=Object.fromEntries(PARTS.map(p=>[p.id,p]));
export const COVER_IDS=['block_front','cam_cover','timing_cover'];
export const PIVOT_PART={crank_spin:'crankshaft',flywheel_spin:'flywheel',cam_intake_spin:'cam_intake',cam_exhaust_spin:'cam_exhaust',...Object.fromEntries([1,2,3,4].flatMap(i=>[[`piston_${i}_slide`,`piston_${i}`],[`rod_${i}_pose`,`rod_${i}`],[`intake_${i}_slide`,`intake_valve_${i}`],[`exhaust_${i}_slide`,`exhaust_valve_${i}`]]))};
export const PIVOT_IDS=Object.keys(PIVOT_PART);
