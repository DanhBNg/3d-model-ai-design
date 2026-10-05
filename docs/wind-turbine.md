# VENTO 03 — Tua-bin gió

Route `/models/wind-turbine`. Ba chế độ Khám phá / Tách cấu tạo / Nguyên lý, cùng collection với drone và thủy điện. Nút Rotor tập trung vào phần đầu và chấp nhận cắt chân tháp; Toàn bộ nhìn toàn tháp; Khoang máy/Mặt sau mở vỏ và phóng cận.

## Thiết kế và tham chiếu

Thiết kế nguyên bản theo bố trí máy có hộp số trong ảnh người dùng, không sao chép thương hiệu. Tham chiếu giữ tại `docs/reference/wind-drivetrain.jfif` (SHA256 `5d70deeca399efe52df65f120eaac8f8cf518e740d709fd962fafe4649de0be7`) và `wind-exploded.jfif` (`7878075e0cedaee4e944b16b02a5f9eb80de54a957968787ec5055b4966dd2d4`). Ảnh tua-bin ngoài khơi trong hội thoại là tham chiếu bổ sung về tỷ lệ.

Phản hồi người dùng: bản hình khối đầu có cánh/tháp quá nhỏ so với khoang máy. Đã sửa chiều cao tháp khoảng 35 m trong scene, bán kính rotor khoảng 23 m, khoang máy 5,3 m. Camera không ép toàn bộ model vào khung mặc định. Các kích thước được suy luận phục vụ demo, không phải kích thước của một máy cụ thể.

## Source và dựng lại

```sh
npm run wind:build
npm run wind:verify
npm run wind:render
npm test
npm run build
npm run preview -- --port 4173
# Terminal khác, khi preview đang chạy:
npm run test:wind
npm run export:html
node scripts/check-offline-html.mjs
```

Runner dùng `BLENDER_BIN` hoặc `tools/local.json` như hai model trước. Blender 5.2.2 LTS, Design OS revision `0fa32f46f261009f14cf318c8c4b3137f210a667`. Không cài thêm công cụ. Build ghi lại `.blend` và GLB; giữ bản riêng nếu sửa Blender bằng tay.

- `blender/wind-turbine/geometry.py`: primitive/native mesh; `materials.py`: PBR; `assemblies.py`: hình học và hierarchy; `build.py`, `verify.py`, `render.py`: pipeline.
- `blender/wind-turbine/wind-turbine.blend`: nguồn Blender chỉnh sửa được.
- `public/models/wind-turbine.glb`: asset web không texture/decoder ngoài.
- `src/models/wind-turbine/loadModel.js`: factory + `root.userData.sculptRuntime` version 1. Registry độc lập mỗi instance, 20 cụm, pivots, sockets, pose gốc, stats, provenance và dispose idempotent.
- `metadata.js`, `materials.js`, `simulation.js`, `controller.js`: dữ liệu, vật liệu, logic và chuyển động tách riêng. Controller không có DOM/RAF.
- `src/experiences/wind-turbine/`: UI, camera/renderer, effects và vòng đời viewer. Effects gió/điện được tạo bằng Three.js.

## Cơ chế hoạt động

Hướng gió chuẩn đi theo +X; mặt rotor nằm trong mặt phẳng YZ. `yaw` quay quanh Y; rotor, các trục và máy phát quay quanh X. Mỗi `blade_mount_i` giữ phương 120°; `blade_i` quay pitch quanh Y cục bộ. Khi tách, ổ pitch đi cùng cụm cánh, không rơi lại ở moay-ơ. Model bên ngoài vẫn giữ pose do ứng dụng đặt.

Hộp số minh họa hai tầng bánh răng thẳng 36:12 và 24:12; trục trung gian quay -3 lần, đầu ra +6 lần góc rotor. Đây là cách trình bày dễ thấy quan hệ truyền động, không phải hộp số hành tinh công nghiệp chính xác. Răng chỉ xấp xỉ hình học, không dùng để chế tạo hay chứng minh tiếp xúc.

`sampleWind` dùng đường cong công suất minh họa: 3 m/s bắt đầu, 12 m/s đạt 2.000 kW, 25 m/s dừng bảo vệ. Dưới định mức nội suy theo v³; giảm theo cos³ sai lệch hướng. Giữa định mức và ngưỡng dừng giới hạn công suất bằng tăng góc cánh; gió mạnh đưa pitch về 85°. Đây là bộ thông số bài học, không đường cong đo của máy thật. Máy phát và bộ biến đổi điện được giản lược; không đồng nhất tốc độ rotor với tần số lưới.

Animation làm chậm đồng đều 0,32× tốc độ trục được hiển thị, vẫn giữ tỷ số truyền. Nút 0,25× tiếp tục làm chậm đồng hồ mô phỏng. Pause đóng băng rotor, pitch, yaw, gió, điện và tự chuyển bài học. Thao tác đổi chế độ vẫn có chuyển tiếp giao diện. Khi vào nguyên lý, model lắp xong mới quay; khi quay lại tách sẽ khôi phục mức tách trước đó. Reset khôi phục trạng thái khám phá.

Gió là các đường 3D có vệt và đầu mũi tên mảnh, vùng phía sau mở rộng nhẹ; không phải kết quả CFD. Điện là đường vàng mảnh với mũi tên chạy từ máy phát qua cabinet và xuống tháp, dùng chung helper `src/viewer/flowLines.js` với thủy điện. Không mô phỏng nhiệt, tải kết cấu, dao động cánh, bảo vệ điện, đấu nối lưới hoặc sự cố thực tế.

Nguyên lý tham khảo: [DOE — Explore a Wind Turbine](https://www.energy.gov/cmei/systems/explore-wind-turbine-text-version). Nội dung web runtime không cần truy cập nguồn này.

## Bằng chứng và giới hạn

GLB sau sửa vỏ hộp số: **21.484 tam giác, 53 mesh, 613.696 byte**, SHA256 `5b3833abac65e3105b7c94ddd8cc1bc59c7937ca738789de2db58ba9a0742df1`. So với ngân sách 150.000 tam giác / 6 MB còn 128.516 tam giác / 5.386.304 byte. Runtime có thêm draw calls cho gió, điện và shadow.

Sửa lỗi bánh răng xuyên vỏ: dời thành sau, hạ đáy hộp, hạ gân đầu để tránh cắt trục; nới vỏ nacelle/bệ tương ứng để giữ hộp số bên trong. Test `full rotation envelopes` tính bán kính quét từ vertex GLB thật và raycast đến thành/đáy, yêu cầu khoảng hở >0,01 m. Test này đã thất bại trên asset cũ (đáy cách tâm 0,420 m trong khi bán kính 0,622 m) và đạt sau sửa. Đây là kiểm tra khoảng hở phía sau/dưới, không chứng nhận mọi cặp va chạm. Kiểm tra ảnh khi quay bằng `node scripts/check-wind-gears.mjs`; ảnh/báo cáo nằm ở `output/wind-turbine/gear-fix/`.

Blender reimport kiểm tra đủ cụm, geometry hữu hạn, bounds, trục đồng tâm và budget. Render Cycles bốn góc nằm ở `output/wind-turbine/renders/`, receipt gắn hash asset. Ảnh blockout chỉ là mốc phát triển. Render tĩnh không thể hiện hiệu ứng runtime; ảnh Chrome nằm ở `output/wind-turbine/browser/`.

Kiểm tra mobile dùng viewport Chrome 390×844, chưa thử điện thoại thật/Safari, chưa đo FPS thiết bị. Explode là bài trình bày cụm, chưa chứng minh clearance liên tục hay trình tự tháo ngoài thực tế. Phần đáy/bề mặt khuất, kết cấu và thiết bị phụ là suy luận; không dùng làm thiết kế chế tạo.
