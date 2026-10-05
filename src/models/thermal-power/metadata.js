const p=(id,name,description,offset=[0,0,0],anchor=[0,0,0])=>({id,name,description,offset,anchor});
export const PARTS=[
 p('site','Nền và kết cấu','Nền móng, đường nội bộ và kết cấu đỡ các thiết bị của tổ máy.'),
 p('coal_supply','Cấp nhiên liệu','Băng tải đưa than từ bãi chứa đến phễu cấp. Nghiền và đốt than được giản lược trong mô hình.'),
 p('boiler_shell','Nhà lò / bao che','Bao che công trình lò hơi. Mở mặt cắt để thấy vùng cháy và các dàn ống hấp thụ nhiệt.',[-3,0,0]),
 p('boiler_tubes','Dàn ống sinh hơi / tái nhiệt','Nước nhận nhiệt qua thành ống để tạo hơi. Hơi sau turbine cao áp trở về dàn tái nhiệt trước khi đến turbine hạ áp.'),
 p('furnace','Buồng đốt','Nhiệt từ đốt nhiên liệu truyền cho dàn ống. Khí cháy và hơi nước trong ống là hai dòng riêng.'),
 p('flue_filter','Cụm lọc bụi','Tách bụi khỏi dòng khí thải trước khi ra ống khói. Chỉ minh họa một phần hệ xử lý môi trường, chưa gồm đầy đủ SOx/NOx.'),
 p('stack','Ống khói','Dẫn khí thải sau xử lý ra ngoài. Có chức năng khác với tháp giải nhiệt.'),
 p('hall_shell','Gian turbine–máy phát','Nhà xưởng bảo vệ tổ máy. Mở mái và tường gần để quan sát đường hơi, trục và máy phát.',[0,4.8,3.8]),
 p('turbine_hp_shell','Vỏ trên turbine cao áp','Vỏ giữ và dẫn hơi đi qua các tầng cánh. Mở nắp trước khi nhấc rotor.',[0,2.1,0]),
 p('turbine_hp_rotor','Rotor turbine cao áp','Hơi giãn nở qua các tầng cánh tạo mô-men lên trục. Hơi ra tiếp tục được tái nhiệt.',[-1.2,1.35,0]),
 p('turbine_lp_shell','Vỏ trên turbine hạ áp','Hơi sau tái nhiệt đi vào turbine hạ áp. Kích thước tầng cánh lớn hơn về phía hơi xả.',[0,2.7,0]),
 p('turbine_lp_rotor','Rotor turbine hạ áp','Tiếp tục lấy cơ năng từ dòng hơi, cùng trục với turbine cao áp và máy phát.',[-1.2,1.65,0]),
 p('bearings','Bệ máy / ổ đỡ / stator','Cụm cố định giữ tâm trục, đỡ nửa vỏ dưới và cuộn dây stator máy phát. Stator đứng yên khi rotor quay.'),
 p('generator_shell','Vỏ trên máy phát','Nắp bảo vệ phía trên máy phát. Mở nắp để thấy cuộn dây stator cố định và rotor đồng trục với turbine.',[0,2.3,0]),
 p('generator_rotor','Rotor máy phát','Quay đồng trục với turbine. Bài học giả định máy hai cực, 50 Hz, tốc độ định mức 3.000 rpm.',[2.2,0,0]),
 p('condenser_shell','Bình ngưng','Hơi xả từ turbine ngưng tụ ở bên ngoài các ống nước làm mát. Hai dòng không hòa trộn.',[0,0,-2.1]),
 p('condenser_bundle','Chùm ống trao đổi nhiệt','Nước làm mát chảy trong chùm ống, nhận nhiệt từ hơi xả qua thành ống.',[1.7,0,-.5]),
 p('feed_pump','Bơm nước cấp','Đưa nước ngưng trở lại lò để khép vòng nước–hơi. Gia nhiệt hồi nhiệt và khử khí được giản lược.'),
 p('cooling_pump','Bơm nước làm mát','Tuần hoàn nước giữa tháp giải nhiệt và bình ngưng; độc lập với bơm nước cấp.'),
 p('cooling_tower','Tháp giải nhiệt','Thải nhiệt của nước làm mát ra không khí; một phần nước bay hơi. Nước được làm nguội quay lại bình ngưng.'),
 p('transformer','Máy biến áp','Nâng điện áp đầu ra máy phát cho truyền tải. Thiết bị đóng cắt/bảo vệ được giản lược.'),
 p('grid','Đường dây truyền tải','Đưa điện từ trạm biến áp đến lưới điện.'),
 p('steam_pipes','Đường hơi / tái nhiệt','Hơi chính → cao áp → dàn tái nhiệt → hạ áp → bình ngưng. Màu cam phân biệt với nước làm mát.'),
 p('feed_pipes','Đường nước cấp','Nước ngưng → bơm nước cấp → dàn ống lò, hoàn thành vòng tuần hoàn công tác.'),
 p('cooling_pipes','Đường nước làm mát','Tuyến lạnh từ tháp qua bơm đến bình ngưng; tuyến ấm đưa nước về tháp để thải nhiệt.'),
 p('flue_duct','Đường khói','Dẫn khí cháy từ lò sang cụm xử lý bụi và ống khói; không đi qua turbine.'),
];
export const PART_BY_ID=Object.fromEntries(PARTS.map(p=>[p.id,p]));
export const PIVOT_IDS=['hp_spin','lp_spin','generator_spin','feed_spin','cooling_spin'];
export const COVER_IDS=['boiler_shell','hall_shell','turbine_hp_shell','turbine_lp_shell','generator_shell','condenser_shell'];
export const FLOW_OPTIONS={lesson:'Theo bước',all:'Toàn hệ thống',steam:'Hơi / tái nhiệt',feed:'Nước cấp',cooling:'Nước làm mát',electric:'Điện',flue:'Khí thải'};
// Blender assembly roots are identity; anchors are explicit model-local locations.
const anchors={site:[0,0,0],coal_supply:[-7,.7,-2],boiler_shell:[-5,4,0],boiler_tubes:[-5,3.7,0],furnace:[-5,1.5,0],flue_filter:[-4,1.5,3.7],stack:[-6.8,6,4],hall_shell:[2,4,-1.3],turbine_hp_shell:[-1.8,2.6,-1.3],turbine_hp_rotor:[-1.8,2.1,-1.3],turbine_lp_shell:[2.4,3,-1.3],turbine_lp_rotor:[2.4,2.1,-1.3],bearings:[0,1.6,-1.3],generator_shell:[5.3,2.4,-1.3],generator_rotor:[5.3,2.1,-1.3],condenser_shell:[2.4,.85,-1.3],condenser_bundle:[2.4,.85,-1.3],feed_pump:[-1.2,.45,-3.1],cooling_pump:[6.9,.45,1.6],cooling_tower:[5,3.5,3.7],transformer:[7,.9,-3.7],grid:[8,3,-4.7],steam_pipes:[-.8,3.7,-.8],feed_pipes:[-3,.6,-3],cooling_pipes:[4,.65,1],flue_duct:[-5,3,3]};
for(const part of PARTS)part.anchor=anchors[part.id];
Object.assign(PART_BY_ID.stack,{anchor:[-1,6,4.7]});
Object.assign(PART_BY_ID.flue_filter,{anchor:[-3.1,2.1,3.4]});
Object.assign(PART_BY_ID.furnace,{anchor:[-5.1,1.8,-.1]});
