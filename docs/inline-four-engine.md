# IGNIS 06 — Động cơ xăng bốn xi-lanh

Mở `/models/inline-four-engine` từ collection. Thiết kế DOHC tám van, bốn xi-lanh thẳng hàng, thứ tự sinh công1–3–4–2. Hình dạng nguyên bản, tham khảo ảnh/sơ đồ người dùng cung cấp; vật liệu nhôm đúc và thép nhám nhẹ.

## Khám phá

Ngoại thất kín mặc định. Mở vỏ để thấy piston, thanh truyền, trục khuỷu, bánh đà và bộ cam. Chọn trực tiếp hoặc danh mục để đọc mô tả, xem riêng, xem gần. Chế độ tách cấu tạo dịch các cụm theo thứ tự; chi tiết nhỏ đi cùng cụm cha. Khi chạy nguyên lý, model phải lắp lại trước.

Nút chọn toàn bộ hoặc xi-lanh1–4 chỉ thay đổi phần hiển thị. Chế độ một xi-lanh giữ trục khuỷu và bộ cam chung để giải thích truyền động, không dựng một động cơ khác hoặc khởi động lại chu trình. Góc cận phối khí cho thấy đai răng, bánh dẫn động, cam và van.

## Chu trình720°

Mỗi xi-lanh thực hiện bốn kỳ trong hai vòng quay trục khuỷu. Lấy bắt đầu nạp của xi-lanh đang xét làm0°:

| Góc cục bộ | Kỳ | Piston / van |
|---|---|---|
|0–180°|Nạp|Piston xuống, van nạp mở, hòa khí vào|
|180–360°|Nén|Piston lên, hai van đóng|
|360–540°|Cháy–giãn nở|Đánh lửa tại360°, hai van đóng, piston xuống|
|540–720°|Xả|Piston lên, van xả mở, khí thải ra|

Góc cục bộ bốn xi-lanh lệch pha; hai piston1/4 cùng vị trí và2/3 cùng vị trí nhưng không cùng kỳ. Một góc trục khuỷu điều khiển toàn bộ cơ cấu. Cam quay một vòng khi trục khuỷu quay hai vòng. Chuyển động thanh truyền tính từ chiều dài không đổi, không dùng phép nội suy làm co giãn thanh truyền.

Với bán kính khuỷu r=.032m, thanh truyền L=.115m, tâm trục tạiY=.10m:

`y_pin = .10 + r*cos(theta) + sqrt(L*L - r*r*sin(theta)^2)`

Trục khuỷu dọcX, chốt khuỷu cóZ=`r*sin(theta)`. Hành trình piston64mm, đường kính lòng xi-lanh76mm; kích thước là lựa chọn thiết kế giáo dục, không phải thông số một hãng xe.

Thanh tua0–720° cho xem từng thời điểm; chọn từng kỳ, chạy/dừng, tua chậm và điều chỉnh RPM minh họa. Tốc độ hiển thị giảm mạnh để nhìn rõ. Hòa khí/khí cháy trong lòng xi-lanh và mũi tên nạp/xả đổi theo đúng kỳ; không hiển thị tia lửa liên tục.

## Phạm vi kỹ thuật

Mô hình lý tưởng hóa thời điểm van và đánh lửa: không chồng lấn van, không đánh lửa sớm, không mô phỏng ECU, áp suất thực, mô-men, nhiệt độ, dầu bôi trơn hoặc CFD. Lửa/khí là minh họa đồ họa. Cam/follower và đai răng được giản lược phục vụ quan sát, không phải thiết kế chế tạo. RPM hiển thị là giá trị bài học; không giải phương trình động lực học bánh đà.

Tài liệu tham chiếu do người dùng cung cấp: [chu trình bốn kỳ](https://commons.wikimedia.org/wiki/File:4-Stroke-Engine.gif), [chu trình với luồng khí](https://commons.wikimedia.org/wiki/File:4-Stroke-Engine-with-airflows.gif). Không nhúng GIF hay mesh của nguồn vào asset; nguồn dựng hình là Python nguyên bản. Các ảnh tham chiếu thể hiện nhiều loại phối khí khác nhau; model chọn một cấu hình DOHC nhất quán.

## Source và dựng lại

`blender/inline-four-engine/` giữ Python geometry/materials/assemblies/build/verify/render và `.blend`; `src/models/inline-four-engine/` giữ factory/runtime, metadata, simulation và controller; `src/experiences/inline-four-engine/` giữ UI/studio/effects. Không có DOM/render loop trong model factory hoặc controller.

```sh
npm run engine:build
npm run engine:verify
npm run engine:render
npm test
npm run build
npm run preview -- --port 4173
# Terminal khác:
npm run test:engine
```

Toolchain Blender/Design OS khóa trong README. Build ghi lại asset sinh từ source; lưu bản riêng trước nếu chỉnh tay. Ngân sách180k tam giác/8MB, số liệu cuối và kiểm chứng trong PROJECT_HANDOFF. Mobile kiểm trên Chrome giả lập; chưa đại diện mọi điện thoại thật/Safari. Không coi ảnh hoặc phép kiểm một số góc quay là chứng minh không va chạm liên tục mọi chi tiết.
