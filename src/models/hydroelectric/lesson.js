// Chapters direct attention through one continuously operating system.
export const LESSONS = [
 {title:'Hồ chứa tích trữ thế năng',part:'reservoir',position:[-3.6,3.7,0],color:'#49dce2',text:'Chênh cao giữa hồ và hạ lưu tạo cột nước H. Nước qua lưới chắn rác và cửa nhận vào lối dẫn kín. Khối nước xanh trong mặt cắt cho thấy đường đi bên trong; dùng góc “Mặt cắt đường nước” để quan sát.'},
 {title:'Cánh hướng điều tiết dòng nước',part:'guide_vanes',position:[1.6,1.4,0],color:'#49dce2',text:'Buồng xoắn phân phối nước quanh turbine. Các cánh hướng xoay để thay đổi lưu lượng và hướng dòng vào bánh công tác. Thử tăng độ mở để thấy lưu lượng tăng.'},
 {title:'Turbine biến thủy năng thành cơ năng',part:'runner',position:[1.6,1.8,0],color:'#b8e59a',text:'Nước truyền mô-men cho bánh công tác Francis rồi thoát xuống ống hút, về hạ lưu. Bánh công tác, trục và rotor quay cùng nhau; cánh turbine không tự đổi góc.'},
 {title:'Máy phát biến cơ năng thành điện năng',part:'generator_stator',position:[1.6,3.2,0],color:'#ffbd5e',text:'Rotor quay tạo từ trường biến thiên qua cuộn dây stator đứng yên, cảm ứng điện áp xoay chiều. Vòng màu minh họa chuyển đổi năng lượng, không biểu diễn trường điện từ chính xác.'},
 {title:'Máy biến áp đưa điện lên lưới',part:'transformer',position:[4,2,2.15],color:'#ffbd5e',text:'Máy biến áp nâng điện áp để truyền tải. Khi hòa lưới, tốc độ gần như cố định; tăng nước chủ yếu làm tăng công suất. Ngắt tải để quan sát công suất về 0 và cánh hướng đóng dần.'},
];
export function advanceLesson(state,dt){
 if(!state.lessonAuto)return;
 state.lessonTime+=dt;
 if(state.lessonTime>=9){state.lessonTime%=9;state.lesson=(state.lesson+1)%LESSONS.length;}
}
