const p=(id,name,description,offset=[0,0,0])=>({id,name,description,offset,anchor:[0,0,0]});
export const PARTS=[
 p('tower','Tháp đỡ','Tháp thép thuôn đỡ toàn bộ cụm máy. Cáp điện đi xuống bên trong tháp.'),
 p('nacelle_shell','Vỏ khoang máy','Lớp vỏ bảo vệ thiết bị khỏi thời tiết; mở vỏ để nhìn hệ truyền động.',[0,3.1,0]),
 p('nacelle_base','Bệ máy','Khung chịu lực nối ổ đỡ, hộp số và máy phát với hệ quay hướng.'),
 p('hub','Moay-ơ rotor','Liên kết ba cánh với trục chính và chứa cơ cấu điều chỉnh góc cánh.',[-1.7,0,0]),
 ...Array.from({length:3},(_,i)=>p(`blade_${i}`,`Cánh ${i+1} · chỉnh góc pitch`,'Tiết diện cánh tạo lực khí động làm quay rotor. Cánh xoay quanh trục dọc để điều tiết thu năng lượng.',[-1.7,1.1,0])),
 p('main_shaft','Trục chính tốc độ thấp','Nhận mô-men từ rotor và truyền vào hộp số.',[-.5,0,-1.6]),
 p('main_bearing','Ổ đỡ trục chính','Vòng và con lăn giữ trục, truyền tải về bệ máy.',[-.5,0,-1]),
 p('gearbox_case','Vỏ hộp số','Đỡ các trục bánh răng. Phần thành gần được cắt để thấy ăn khớp.',[0,-.6,1.5]),
 p('gear_input','Bánh răng đầu vào','Bánh 36 răng dẫn bánh 12 răng: trục trung gian quay ngược chiều và nhanh gấp ba.',[0,0,-1.6]),
 p('gear_intermediate','Trục bánh răng trung gian','Cặp bánh 12 và 24 răng quay cùng trục. Tầng sau tăng tốc thêm hai lần.',[0,1.4,.6]),
 p('gear_output','Trục đầu ra tốc độ cao','Qua hai tầng, tốc độ tăng sáu lần và trở về cùng chiều trục vào; mô-men giảm tương ứng.',[.8,0,-1.3]),
 p('brake','Phanh cơ khí','Đĩa và cùm phanh giữ rotor đã giảm tốc. Góc cánh thực hiện phần giảm thu năng lượng khi dừng.',[1.2,0,-1.3]),
 p('generator_stator','Stator máy phát','Cuộn dây đồng đứng yên quanh rotor, nơi minh họa điện năng được tạo ra.',[1.6,0,.4]),
 p('generator_rotor','Rotor máy phát','Phần quay nằm trong stator và được dẫn bởi trục nhanh.',[3.2,0,0]),
 p('controls','Điều khiển / bộ biến đổi','Điều khiển góc cánh, tốc độ, quay hướng; bộ biến đổi xử lý điện trước khi đưa ra hệ thống.',[1.5,1.4,.7]),
 p('yaw_ring','Vòng quay hướng','Ổ quay tại đỉnh tháp cho phép cả khoang máy xoay theo hướng gió.',[0,-1.5,0]),
 p('yaw_motor','Motor quay hướng','Dẫn động vành răng để đưa rotor đón gió.',[-.6,0,-1.3]),
 p('sensors','Cảm biến gió','Cốc đo tốc độ và cánh hướng cung cấp tín hiệu cho bộ điều khiển.',[0,3.1,0]),
];
export const PART_BY_ID=Object.fromEntries(PARTS.map(p=>[p.id,p]));
export const PIVOT_IDS=['yaw','rotor_spin','shaft_spin','input_spin','intermediate_spin','output_spin','brake_spin','generator_spin','anemometer_spin','vane_spin',...Array.from({length:3},(_,i)=>`blade_${i}`)];
export const LESSONS=[
 {title:'Gió tạo chuyển động',part:'blade_0',text:'Lực khí động trên cánh tạo mô-men quay. Các vệt xanh chỉ hướng gió; tăng tốc độ gió để quan sát rotor và công suất.'},
 {title:'Từ rotor đến hộp số',part:'gear_input',text:'Trục chậm mang mô-men lớn. Hai tầng bánh răng minh họa tỷ số 3 × 2 = 6: trục máy phát quay nhanh hơn rotor sáu lần.'},
 {title:'Biến cơ năng thành điện',part:'generator_stator',text:'Rotor quay bên trong stator. Tương tác điện từ tạo điện năng; vệt vàng đi qua bộ biến đổi rồi xuống tháp. Bộ biến đổi được giản lược.'},
 {title:'Quay đón gió',part:'yaw_ring',text:'Thay đổi hướng gió. Cảm biến nhận biết thay đổi và motor quay cả khoang máy; khi lệch hướng, năng lượng thu được giảm.'},
 {title:'Điều tiết và dừng',part:'blade_0',text:'Trên tốc độ gió định mức, tăng góc cánh giúp giới hạn công suất. Ở 25 m/s, cánh xoay về góc giảm thu năng lượng và rotor giảm tốc về dừng.'},
];
