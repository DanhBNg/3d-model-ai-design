export const MOTOR_LAYOUT = [
  {id:'fl',name:'Trước trái',position:[-.145,.075,-.13],spin:-1,direction:'CW'},
  {id:'fr',name:'Trước phải',position:[.145,.075,-.13],spin:1,direction:'CCW'},
  {id:'rl',name:'Sau trái',position:[-.145,.075,.13],spin:1,direction:'CCW'},
  {id:'rr',name:'Sau phải',position:[.145,.075,.13],spin:-1,direction:'CW'},
];
export const PARTS = [
 {id:'shell_upper',name:'Vỏ trên',category:'Kết cấu',short:'Lớp vỏ bảo vệ',description:'Vỏ polymer bo cong bảo vệ điện tử và tạo hình khí động. Gân trong, khe thông gió và vít liên kết với khung.',material:'Polymer phủ mờ',offset:[0,.29,0],stage:[0,.65],anchor:[0,.12,0]},
 {id:'shell_lower',name:'Vỏ dưới',category:'Kết cấu',short:'Đáy bảo vệ',description:'Nắp đáy che mặt dưới của bo mạch, có khe tản nhiệt. Tách xuống dưới để nhìn rõ bố trí bên trong.',material:'Polymer phủ mờ',offset:[0,-.12,0],stage:[0,.5],anchor:[0,.025,0]},
 {id:'frame',name:'Khung & tay đòn',category:'Kết cấu',short:'Bộ khung chịu lực',description:'Bốn tay đòn đưa motor ra khỏi thân. Sàn trung tâm, gân tăng cứng và chân đáp truyền lực từ motor về toàn bộ drone.',material:'Composite graphite',offset:[0,0,0],stage:[0,1],anchor:[-.06,.06,0]},
 {id:'battery',name:'Pin LiPo',category:'Nguồn điện',short:'Năng lượng cho chuyến bay',description:'Bốn cell mắc nối tiếp trong khay bảo vệ. Đầu nối công suất cấp điện cho ESC; cáp cân bằng phục vụ theo dõi điện áp từng cell.',material:'Cell pouch · khay polymer',offset:[0,.19,.035],stage:[.22,1],anchor:[0,.104,.04]},
 {id:'flight_controller',name:'Bộ điều khiển bay',category:'Điều khiển',short:'Bộ não của drone',description:'IMU đo chuyển động, vi điều khiển so sánh với lệnh bay rồi gửi yêu cầu đến ESC. Các đệm chống rung giúp giảm nhiễu cảm biến.',material:'PCB · IC · đệm silicone',offset:[0,.135,-.07],stage:[.28,1],anchor:[0,.074,-.057]},
 {id:'esc',name:'ESC 4 trong 1',category:'Công suất',short:'Điều tốc bốn motor',description:'Bốn kênh công suất MOSFET biến điện DC từ pin thành dòng ba pha cho motor. ESC nhận lệnh từ bộ điều khiển bay, không cấp năng lượng từ tín hiệu điều khiển.',material:'PCB · MOSFET · đồng',offset:[0,.075,0],stage:[.32,1],anchor:[0,.059,-.035]},
 {id:'gimbal',name:'Camera / gimbal',category:'Quan sát',short:'Giữ khung hình ổn định',description:'Ba trục yaw, roll và pitch giúp camera giữ hướng khi thân nghiêng. Ống kính, cảm biến và các vòng đỡ quay quanh đúng tâm khớp.',material:'Nhôm · kính quang học',offset:[0,-.07,-.12],stage:[.1,.85],anchor:[0,0,-.023]},
 ...MOTOR_LAYOUT.flatMap((m,i)=>[
  {id:'motor_'+m.id,name:`Motor ${i+1} · ${m.name.toLowerCase()}`,category:'Truyền động',short:`Động cơ không chổi than · ${m.direction}`,description:`Stator có cuộn dây đồng; chuông rotor mang nam châm quay quanh trục ổ bi. Motor ${m.name.toLowerCase()} quay ${m.direction} khi nhìn từ trên xuống, cùng chiều motor chéo đối diện.`,material:'Nhôm · thép · đồng',offset:[Math.sign(m.position[0])*.055,.038,Math.sign(m.position[2])*.045],stage:[.12,.9],anchor:[0,.02,0]},
  {id:'prop_'+m.id,name:`Cánh quạt ${i+1} · ${m.name.toLowerCase()}`,category:'Lực đẩy',short:`Cánh xoắn · ${m.direction}`,description:'Hai lá cánh có góc xoắn thay đổi theo bán kính. Khi quay đúng chiều, cánh đẩy không khí xuống và tạo phản lực nâng drone lên. Cặp CW và CCW có hình học đối xứng.',material:'Composite gia cường',offset:[Math.sign(m.position[0])*.055,.16,Math.sign(m.position[2])*.045],stage:[.05,.9],anchor:[0,.005,0]}
 ])
];
export const PART_BY_ID=Object.fromEntries(PARTS.map(p=>[p.id,p]));
export const SCENARIOS={
 takeoff:{name:'Cất cánh',subtitle:'Tăng lực nâng',description:'Bốn motor cùng tăng tốc để tổng lực đẩy lớn hơn trọng lượng. Drone lên cao, sau đó giảm về mức bay treo.'},
 hover:{name:'Bay treo',subtitle:'Cân bằng lực',description:'Bốn motor có tốc độ gần bằng nhau. Tổng lực nâng cân bằng trọng lượng; hai cặp ngược chiều triệt tiêu mô-men xoay.'},
 forward:{name:'Tiến',subtitle:'Chúi mũi về trước',description:'Ban đầu, cặp motor sau tăng lực đẩy so với cặp trước để chúi mũi. Khi đạt góc nghiêng, chênh lệch được giảm; lực đẩy nghiêng tạo thành phần hướng về trước.'},
 backward:{name:'Lùi',subtitle:'Nâng mũi về sau',description:'Cặp motor trước tăng lực đẩy ban đầu, làm mũi nâng lên. Khi giữ góc nghiêng, lực đẩy có thành phần hướng về phía sau.'},
 left:{name:'Nghiêng trái',subtitle:'Tạo lực sang trái',description:'Cặp motor phải tăng lực đẩy ban đầu để nâng bên phải, nghiêng drone sang trái. Lực đẩy nghiêng tạo chuyển động sang trái.'},
 right:{name:'Nghiêng phải',subtitle:'Tạo lực sang phải',description:'Cặp motor trái tăng lực đẩy ban đầu để nâng bên trái, nghiêng drone sang phải. Lực đẩy nghiêng tạo chuyển động sang phải.'},
 yaw_left:{name:'Xoay trái',subtitle:'Chênh lệch mô-men',description:'Tăng cặp cánh CW, giảm cặp CCW. Phản lực mô-men làm thân quay CCW (trái) khi nhìn từ trên; tổng lực nâng được giữ gần mức bay treo.'},
 yaw_right:{name:'Xoay phải',subtitle:'Chênh lệch mô-men',description:'Tăng cặp cánh CCW, giảm cặp CW. Phản lực mô-men làm thân quay CW (phải) khi nhìn từ trên; tổng lực nâng được giữ gần mức bay treo.'}
};
