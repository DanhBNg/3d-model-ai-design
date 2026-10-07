const p=(id,name,description,offset,anchor)=>({id,name,description,offset,anchor});
export const PARTS=[
 p('adapter','Bộ đổi nguồn','Minh họa nguồn AC/DC kín: hạ áp và cấp điện một chiều cho đế sạc. Phích cắm rời chỉ là bối cảnh; nguồn trong bài học là giả lập.',[-.025,0,0],[-.115,.012,0]),
 p('cable','Cáp cấp điện','Dẫn điện một chiều từ bộ đổi nguồn đến mạch điều khiển đế sạc.',[-.015,0,.014],[-.078,.003,0]),
 p('pad_base','Đáy đế sạc','Đáy bảo vệ mạch và các lớp cuộn phát.',[0,-.045,0],[0,.001,0]),
 p('pad_pcb','Mạch nghịch lưu','Mạch công suất biến điện một chiều thành dòng xoay chiều tần số cao cho cuộn phát.',[0,-.027,0],[0,.0025,0]),
 p('tx_ferrite','Ferrite cuộn phát','Nằm sau cuộn phát, hỗ trợ dẫn từ thông và hạn chế trường đi vào linh kiện phía dưới.',[0,-.012,0],[0,.0055,0]),
 p('tx_coil','Cuộn phát · TX','Dòng xoay chiều trong vòng dây đồng tạo từ trường biến thiên. Electron không bay qua khe hở.',[0,0,0],[0,.007,0]),
 p('pad_cover','Nắp đế sạc','Bề mặt phi kim ngăn cách cuộn phát với điện thoại.',[-.075,.025,0],[0,.009,0]),
 p('phone_back','Lưng điện thoại','Lớp vỏ phi kim hướng xuống đế sạc. Mở trong chế độ nguyên lý để nhìn hai cuộn đối diện.',[.075,.03,0],[0,.0115,0]),
 p('rx_coil','Cuộn nhận · RX','Từ thông biến thiên xuyên qua cuộn nhận tạo điện áp xoay chiều cảm ứng.',[0,.042,0],[0,.013,0]),
 p('rx_ferrite','Ferrite cuộn nhận','Nằm sau cuộn nhận, về phía pin; không chắn giữa hai cuộn.',[0,.061,0],[0,.0137,0]),
 p('battery','Pin điện thoại','Nhận điện một chiều qua mạch quản lý sạc. Phần trăm pin là đồng hồ minh họa, không phải thời gian sạc thực.',[0,.082,0],[0,.0155,.014]),
 p('phone_board','Mạch nhận & quản lý sạc','Chỉnh lưu điện cảm ứng, điều chỉnh nguồn và quản lý dòng cấp cho pin; các khối được giản lược.',[-.052,.085,0],[0,.0155,-.055]),
 p('phone_frame','Khung điện thoại','Khung bảo vệ giữ các lớp điện thoại và cụm điều khiển.',[.072,.10,0],[.036,.0155,0]),
 p('screen','Màn hình','Mặt trước hướng lên trên khi đặt điện thoại lên đế.',[0,.124,0],[0,.0195,0]),
];
export const PART_BY_ID=Object.fromEntries(PARTS.map(p=>[p.id,p]));
export const PHONE_IDS=['phone_back','rx_coil','rx_ferrite','battery','phone_board','phone_frame','screen'];
export const COVER_IDS=['pad_cover','phone_back','phone_frame','screen'];
export const FLOW_OPTIONS={lesson:'Theo bài học',all:'Toàn hệ thống',power:'Đường điện',field:'Từ trường'};
export const SOCKET_IDS=['tx_center','rx_center'];
