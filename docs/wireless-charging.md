# FLUX 05 — Sạc không dây

Model giáo dục gồm điện thoại và đế sạc tròn, mở tại `/models/wireless-charging`. Thiết kế nguyên bản theo ảnh đế sạc tách lớp do người dùng gửi; cấu tạo điện thoại tập trung vào hệ nhận năng lượng, không tái tạo một thương hiệu cụ thể.

## Cách khám phá

Trong Khám phá, nút **Nhấc điện thoại / Đặt lên đế sạc** chạy hoạt cảnh nâng/hạ. Nhấc lên ngừng nhận sạc; khi đặt xuống hoàn tất, màn hình sáng với vòng pin xanh và thông báo sạc không dây. Màn hình có wallpaper, đồng hồ và status icons minh họa, tạo bằng canvas tại runtime; không yêu cầu texture tải ngoài. Chất liệu vỏ/khung/đế đã chuyển sang nhám nhẹ để giảm phản chiếu.

- **Khám phá:** xoay/zoom, chọn trên model hoặc danh sách, đọc mô tả, mở vỏ, xem riêng và xem gần. Ngoại thất ban đầu kín, điện thoại nằm trên đế.
- **Tách cấu tạo:** điều chỉnh thanh trượt để phân tách các lớp điện thoại và đế sạc, tự tách/lắp hoặc đặt lại. Chi tiết nhỏ theo cụm; hiệu ứng truyền năng lượng dừng trong chế độ này.
- **Nguyên lý:** mở góc nhìn hai coil, theo các bước chuyển đổi năng lượng. Thử độ lệch tâm và khoảng cách, quan sát khả năng nhận năng lượng thay đổi. Có chạy/dừng, tua chậm và đặt lại.

## Chuỗi năng lượng

**Điện lưới → adapter AC/DC → mạch kích cao tần → cuộn phát → từ trường biến thiên → cuộn thu → chỉnh lưu → quản lý sạc → pin.**

Dòng biến thiên trong cuộn phát tạo từ trường biến thiên. Từ thông móc vòng qua cuộn thu tạo điện áp cảm ứng; phía điện thoại chỉnh lưu rồi quản lý dòng sạc cho pin. Không có dòng electron chạy từ cuộn này qua khoảng không sang cuộn kia. Lớp ferrite phía sau coil giúp dẫn từ thông; không đặt ferrite chắn giữa hai mặt coil đối diện. Thiết kế này không yêu cầu vòng nam châm căn chỉnh.

Vòng đường sức là đường khép kín minh họa. Nhịp biến thiên trên màn hình được làm chậm rất nhiều để quan sát; không biểu diễn tần số vận hành thật. Mũi tên trên mạch chỉ chiều truyền năng lượng; không thay thế dạng sóng AC trong dây coil.

Tham khảo nguyên lý: [TI — Bộ phát năng lượng không dây](https://www.ti.com/lit/ds/slusal8c/slusal8c.pdf), [TI — Bộ thu, chỉnh lưu và quản lý sạc](https://www.ti.com/product/BQ51052B). Không yêu cầu kết nối mạng khi chạy demo.

## Giản lược và giới hạn

Độ ghép từ và công suất là đường cong giáo dục theo độ lệch/khoảng cách, không phải dữ liệu đo một bộ sạc, chứng nhận Qi hoặc nghiệm Maxwell/FEM. Không mô phỏng nhiệt, vật lạ kim loại, giao thức thương lượng công suất, bảo vệ pin hoặc chu trình CC/CV đầy đủ. Phần trăm pin tăng trên đồng hồ minh họa, không đại diện thời gian sạc thực.

Chế độ nguyên lý phóng đại khe hở hiển thị giữa hai coil để nhìn rõ từ trường, có ghi chú trong UI. Khoảng cách mm trên điều khiển là tham số vật lý của bài học; phép tính ghép từ dùng giá trị này, không dùng khoảng cách đã phóng đại trên màn hình. Không hiểu model như bộ sạc hoạt động được ở khoảng cách lớn của exploded view.

Thanh khoảng cách giới hạn 6–18mm theo khoảng cách tâm hai coil; mức6mm giữ vỏ điện thoại không xuyên vào đế. Trong góc giảng giải, ferrite phía nhận, pin và bo mạch được đưa ra ngoài để lộ hai coil; đường nối là sơ đồ năng lượng. Chế độ khám phá mở vỏ giữ khoảng cách coil vật lý, chỉ Nguyên lý cộng thêm14mm hiển thị.

Kích thước và mặt khuất suy luận từ ảnh. Đơn vị asset là mét, +Y lên; kích thước điện thoại khoảng 76×154mm, đế đường kính110mm. Nội thất chỉ có các cụm phục vụ bài học; đây không phải bản vẽ chế tạo hoặc mô phỏng toàn bộ điện thoại.

## Source và dựng lại

- `blender/wireless-charging/`: Python dựng hình/vật liệu/cụm, file `.blend`, build/verify/render và báo cáo.
- `public/models/wireless-charging.glb`: asset runtime.
- `src/models/wireless-charging/`: factory/runtime, metadata/materials, simulation/controller và nội dung bài học.
- `src/experiences/wireless-charging/`: viewer/camera/input/UI và hiệu ứng từ trường.

```sh
npm run wireless:build
npm run wireless:verify
npm run wireless:render
npm test
npm run build
npm run preview -- --port 4173
# Terminal khác, khi preview đang chạy:
npm run test:wireless
```

Runner dùng Blender5.2.2 đã khóa, đọc `BLENDER_BIN` hoặc `tools/local.json`; pipeline Design OS trong README. Không cần Blender để chạy web. Build ghi lại `.blend` và GLB, nên lưu bản riêng nếu đã chỉnh tay. Asset ngân sách100k tam giác/5MB; số đo cuối và bằng chứng nghiệm thu trong PROJECT_HANDOFF.
