const part=(id,name,description,anchor,offset=[0,0,0],type='machine')=>({id,name,description,anchor,offset,type});
export const PARTS=[
 part('terrain','Nền & địa hình','Mặt cắt nền đặt toàn bộ công trình; địa hình được giản lược theo kiểu sa bàn.',[-3,1,0],[0,0,0],'civil'),
 part('reservoir','Hồ chứa','Tích trữ nước ở cao độ lớn hơn hạ lưu. Chênh cao tạo cột nước dùng để phát điện.',[-3.7,3.55,0],[0,0,0],'water'),
 part('dam','Đập bê tông','Giữ nước hồ. Tuyến phát điện và tuyến xả tràn là hai đường nước khác nhau.',[-1.5,3.7,1.8],[0,0,0],'civil'),
 part('spillway','Cửa tràn & tiêu năng','Xả nước dư về hạ lưu, không đi qua turbine. Cửa tràn đang đóng trong minh họa này.',[-1.5,3.8,-2.45],[0,0,0],'civil'),
 part('intake_gate','Cửa nhận nước','Cửa chặn tuyến cấp nước dùng khi dừng hoặc bảo trì. Cánh hướng mới là cơ cấu điều chỉnh lưu lượng vận hành.',[0,.45,0],[0,1.2,0]),
 part('conduit_cover','Thân đập & hành lang kín','Phần kết cấu che đường ống áp lực. Chọn “Xem bên trong” để nhìn tuyến nước bên dưới.',[-.8,3,0],[0,0,0],'cover'),
 part('penstock','Đường dẫn nước có áp','Lối nhận nước thu hẹp trong thân công trình, nối cửa nhận với buồng xoắn; bố trí theo mặt cắt tham chiếu.',[-.7,1.43,0],[0,0,0]),
 part('powerhouse','Kết cấu nhà máy','Không gian kết cấu phía sau tổ máy. Mái và mặt đứng mở riêng khi xem cấu tạo.',[1.7,2.5,1.7],[0,0,0],'civil'),
 part('facade','Mặt đứng nhà máy','Bao che tổ máy, có cửa bảo trì và dải cửa lấy sáng. Đường trả nước đi dưới gian máy.',[2.4,2,-1.6],[0,0,0],'cover'),
 part('roof','Mái nhà máy','Mái kim loại có gân và máng thoát nước. Được nhấc lên trước khi tách cụm máy bên dưới.',[1.7,3.8,0],[0,4.1,1.9],'cover'),
 part('scroll_case','Buồng xoắn','Phân phối nước quanh bánh công tác. Vỏ được cắt một phần để quan sát dòng chảy.',[0,.1,0],[0,0,-2.1]),
 part('guide_vanes','Cánh hướng nước','16 cánh xoay quanh chốt riêng để điều chỉnh lưu lượng và hướng dòng vào bánh công tác.',[0,.2,0],[0,.65,0]),
 part('runner','Bánh công tác Francis','Các cánh cong nhận năng lượng của nước. Nước đi vào quanh vành và thoát xuống ống hút.',[0,.05,0],[0,1.35,0]),
 part('draft_tube','Ống hút','Ống cong mở rộng dưới turbine dẫn nước ra hạ lưu và phục hồi một phần động năng. Phần trước được cắt để thấy nước bên trong.',[2.4,-.2,0],[0,0,-1.2]),
 part('shaft','Trục & khớp nối','Truyền mô-men từ bánh công tác lên rotor máy phát; các cụm quay đồng trục.',[0,.25,0],[0,1.7,0]),
 part('generator_rotor','Rotor máy phát','Phần quay có các cực từ; cùng tốc độ với turbine. Từ trường quay tương tác với stator.',[0,.2,0],[0,2.4,0]),
 part('generator_stator','Stator & dây quấn','Lõi thép và dây quấn đồng đứng yên. Điện áp xoay chiều được tạo ra nhờ từ trường biến thiên.',[.7,.3,0],[2.4,1.5,0]),
 part('generator_cover','Nắp & ổ chặn','Đỡ và định vị trục tổ máy. Được nâng ra trước khi rút rotor.',[0,.1,0],[0,3.3,0]),
 part('tailrace','Kênh trả nước','Nước qua turbine trở về hạ lưu; nước không bị tiêu hao khi phát điện.',[4.5,.45,0],[0,0,0],'water'),
 part('transformer','Máy biến áp tăng áp','Nâng điện áp để truyền tải; không tạo thêm năng lượng. Có két tản nhiệt và sứ đầu ra.',[0,1,0],[0,0,0]),
 part('grid','Đường dây điện','Đưa điện từ trạm biến áp tới lưới. Ba dây thể hiện hệ thống điện ba pha ở mức khái niệm.',[5.25,2.7,2.1],[0,0,0]),
 part('site_details','Hạ tầng & cảnh quan','Lối bảo trì, bậc thang, cọc bảo vệ và cây xanh giúp đọc tỷ lệ công trình.',[4.6,.4,-1.3],[0,0,0],'civil'),
];
export const PART_BY_ID=Object.fromEntries(PARTS.map(p=>[p.id,p]));
export const COVERS=['facade','conduit_cover','roof'];
// Reverse playback follows the same extraction order backwards.
export const EXPLODE_STAGES={generator_cover:[0,.22],generator_rotor:[.22,.5],generator_stator:[.5,.75],shaft:[.5,.75],runner:[.75,1],guide_vanes:[.75,1],scroll_case:[.9,1],draft_tube:[.8,1],intake_gate:[.3,.6]};
export const ELECTRIC_PATH=[[1.6,2.7,0],[2.45,2.65,.4],[3,2.65,1.4],[3,1,2.15],[3.9,1,2.15],[3.9,1.95,2.15],[4.6,2.6,2.15],[5.25,3.3,2.1],[5.25,3.15,3.2]];
export const LIMITATIONS='Mô hình theo mặt cắt tham chiếu, tỷ lệ và mặt khuất được ước lượng. P = ρgQHη với η = 0,88 cố định. Lưới 50 Hz, máy 20 cực → 300 vòng/phút. Chuyển động quay hiển thị chậm 20 lần. Nước 3D, gợn và bọt là hiệu ứng minh họa; lưu lượng điều khiển nhịp chảy, không tính CFD, mực nước động, nước va hay quá độ điện từ. Ngắt tải dùng trình tự dừng giản lược, không mô phỏng vượt tốc.';
