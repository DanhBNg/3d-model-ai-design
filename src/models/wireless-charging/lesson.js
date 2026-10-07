export const LESSONS=[
 {title:'Nguồn điện vào đế',part:'adapter',flow:'power',text:'Nguồn AC được đổi thành DC trong adapter kín. Cáp cấp DC đến mạch đế sạc. Bài học dùng nguồn giả lập; phích cắm rời không phải một mạch đang nối điện lưới.'},
 {title:'Tạo dòng xoay chiều',part:'pad_pcb',flow:'power',text:'Mạch nghịch lưu tạo dòng xoay chiều tần số cao trong cuộn phát. Đường sáng minh họa luồng năng lượng; không mô tả tốc độ electron.'},
 {title:'Trường từ ghép hai cuộn',part:'tx_coil',flow:'field',text:'Từ trường biến thiên liên kết cuộn phát và cuộn nhận. Các vòng trường khép kín đổi chiều theo pha; năng lượng qua khe hở, electron không vượt qua. Ferrite nằm phía sau mỗi cuộn.'},
 {title:'Cảm ứng và chỉnh lưu',part:'rx_coil',flow:'power',text:'Cuộn nhận tạo điện áp cảm ứng AC. Mạch nhận chỉnh lưu thành DC rồi điều chỉnh để cấp cho mạch quản lý sạc. Dây sáng nối đến linh kiện đã dời ra ngoài chỉ là sơ đồ kết nối.'},
 {title:'Sạc pin và căn chỉnh',part:'battery',flow:'all',text:'Mạch quản lý kiểm soát năng lượng cấp vào pin. Lệch tâm hoặc tăng khe hở làm giảm ghép từ trong mô phỏng. Khoảng cách nhập là khoảng cách vật lý giữa hai cuộn; hình nguyên lý nới thêm 14 mm để quan sát. Watt và phần trăm pin đều minh họa, không phải phép đo hay chứng nhận Qi.'},
];
