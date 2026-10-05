# THERMO 04 — Nhà máy nhiệt điện

Mở `/models/thermal-power` từ danh sách mô hình. Ngoại thất kín ở chế độ Khám phá; **Xem bên trong** mở bao che. Các góc máy gồm toàn cảnh, tổ máy, lò, làm mát và phía sau. Chọn trực tiếp hoặc trong danh sách để đọc mô tả, xem riêng hoặc đưa camera tới cụm.

## Cấu tạo và nguyên lý

Mô hình gồm 26 cụm. Nhà lò có vùng cháy và dàn ống; gian máy chứa turbine cao áp, turbine hạ áp, máy phát và bình ngưng. Than, lọc bụi, ống khói, tháp giải nhiệt, bơm, máy biến áp và đường dây thể hiện các chức năng riêng.

Chu trình làm việc: bơm nước cấp → lò → turbine cao áp → tái nhiệt trong lò → turbine hạ áp → bình ngưng → bơm nước cấp. Trục turbine kéo rotor máy phát. Điện qua máy biến áp tới lưới. Nước làm mát tuần hoàn giữa bình ngưng và tháp giải nhiệt; vòng này trao đổi nhiệt qua thành ống, không trộn với nước/hơi của chu trình phát điện. Khí cháy qua lọc bụi và ống khói, không đi vào tháp giải nhiệt.

Sáu bước trong **Nguyên lý** lần lượt giải thích cháy, hơi/tái nhiệt, cơ năng, điện, ngưng tụ và làm mát. Bộ lọc có thể chỉ hiện tuyến đang học hoặc toàn hệ thống. Hơi màu cam; nước cấp cyan; nước làm mát xanh; điện vàng; khí thải xám. Mũi tên có bề dày theo màn hình và viền tương phản. Chạy/dừng và 0,25× áp dụng cùng đồng hồ cho chuyển động và hiệu ứng.

Chuyển từ tách cấu tạo sang nguyên lý phải lắp lại máy trước khi chạy. Bao che mở trước rồi rotor nâng/dịch ra; chi tiết nhỏ theo cụm cha. Đường ống ẩn khi tách để tránh biểu diễn kết nối lơ lửng.

## Những giá trị được giản lược

- Bài học dùng tổ máy 100 MW, hiệu suất điện cố định 36%, lưu lượng hơi định mức 100 kg/s và nước làm mát 6 m³/s. Đây là tham số minh họa, không phải thông số một nhà máy cụ thể.
- Ở trạng thái phát ổn định, máy phát đồng bộ hai cực 50 Hz quay 3.000 rpm. Tải thay đổi công suất/lưu lượng; tốc độ hình ảnh chỉ 8 vòng/phút để nhìn cấu tạo. Pha tăng tốc là chuyển tiếp đồ họa, không mô phỏng hòa đồng bộ.
- Nhiệt vào = điện / 0,36; nhiệt còn lại = nhiệt vào − điện. Không giải bảng hơi hay tổn thất từng thiết bị. Không diễn giải toàn bộ phần nhiệt còn lại là tải chính xác của tháp giải nhiệt.
- Ngắt làm mát đưa phát điện về 0 và trục giảm tốc minh họa. Không mô phỏng hệ bảo vệ, quán tính nhiệt hoặc quy trình khởi động/dừng thực.
- Hình dạng, kích thước, số tầng cánh và ngoại thất được suy luận từ ảnh tham chiếu; không có hồ sơ khảo sát. Bộ gia nhiệt hồi nhiệt, khử khí, xử lý nước, khử SOx/NOx và hệ phụ trợ chưa được dựng đầy đủ.
- Hiệu ứng lửa và mũi tên chỉ dẫn hỗ trợ bài học, không phải CFD, mô phỏng cháy hoặc nhiệt động chính xác.

Nguồn nguyên lý: [EIA — How electricity is generated](https://www.eia.gov/energyexplained/electricity/how-electricity-is-generated.php), [EPA — Steam Electric Power Generating study](https://www.epa.gov/sites/default/files/2015-06/documents/steam-electric_detailed_study_report_2009.pdf). Ảnh người dùng trong hội thoại là tham chiếu bố cục/hình dạng; không nhập mesh bên ngoài.

## Source và dựng lại

`blender/thermal-power/` giữ geometry, materials, site, boiler, machinery, piping, build/verify/render và file `.blend`. `src/models/thermal-power/` giữ loader/factory, runtime registry, metadata, simulation, lesson và controller. `src/experiences/thermal-power/` giữ studio, UI, effects và vòng đời viewer. `layout.json` là nguồn tọa độ chung cho ống Blender và mũi tên Three.js.

```sh
npm run thermal:build
npm run thermal:verify
npm run thermal:render
npm test
npm run build
npm run preview -- --port 4173
# Trong terminal khác:
npm run test:thermal
```

Dùng Blender 5.2.2 LTS và pipeline Design OS đã khóa trong README. Runner đọc `BLENDER_BIN` hoặc `tools/local.json`. `node scripts/build-thermal.mjs --blockout` dựng mốc hình khối riêng. Build ghi lại `.blend`/GLB; lưu bản riêng nếu đã chỉnh tay.

Báo cáo asset: `blender/thermal-power/build-report.json`; ảnh và kiểm chứng: `output/thermal-power/`. Ngân sách 180.000 tam giác và 8.000.000 byte GLB. Số liệu nghiệm thu cuối nằm trong PROJECT_HANDOFF; không lấy số blockout làm số của asset cuối.

Kiểm thử mobile dùng viewport Chrome giả lập, chưa đại diện điện thoại thật hoặc Safari. Chưa chứng minh clearance liên tục của tất cả chi tiết trong quá trình tách/lắp. Các góc render và browser giúp phát hiện giao cắt nhìn thấy, không thay thế kiểm tra cơ khí.
