# THERMO 04 — Implementation Plan

**Goal:** Thêm nhà máy nhiệt điện than một tổ máy có tái nhiệt vào collection, ngoại thất kín, khám phá/tách cụm/nguyên lý dễ hiểu, full source Blender + Three.js.

**Architecture:** Model native Blender xuất GLB có assembly/pivot/socket ổn định. Factory tạo runtime version 1; controller sở hữu trạng thái/chuyển động; simulation thuần không DOM; viewer sở hữu UI/camera/effects. Dùng helper wide-line đang có, không thay source các model cũ.

**Tech stack:** Blender 5.2.2 LTS + Design OS revision đã khóa, Python native, Three.js 0.180/Vite, node:test, Chrome Playwright hiện có. Không cài mới, không push/deploy. Thực thi inline theo yêu cầu “plan hoàn thiện trước rồi làm”. Workspace độc lập hiện có, không Git repository nên không tạo commit/worktree.

## 1. Phạm vi và chuẩn nghiệm thu

- Một tổ máy nhiệt điện than giáo dục, không mô phỏng vận hành nhà máy thật. Không thiết kế chế tạo.
- Hai mức nhìn: toàn nhà máy và cận tổ máy. Ngoại thất kín; mở vỏ/mái hoặc chuyển nguyên lý mới thấy nội thất.
- Tổ máy: turbine cao áp + turbine hạ áp nhiều tầng, đường tái nhiệt về lò, trục đồng tâm nối máy phát; bình ngưng bên dưới turbine hạ áp.
- Lò: phễu cấp than, vùng cháy, dàn ống trao đổi nhiệt, đường hơi ra/tái nhiệt, tuyến khói sang xử lý bụi và ống khói.
- Vòng hơi/nước cấp tách biệt với vòng nước làm mát. Chỉ trao đổi nhiệt tại bình ngưng, không trộn hai dòng. Tháp giải nhiệt không phải ống khói.
- Tách cụm: mái/bao che mở trước, vỏ trên turbine và nắp máy phát nâng lên; rotor/cụm ống bình ngưng dịch theo trục sau khi vỏ mở. Các công trình không bay tản mạn.
- Nguyên lý: từng bước nhiên liệu → hơi → cơ năng → điện → ngưng tụ → làm mát. Có lọc tuyến, mức tải yêu cầu, chạy/dừng, 0,25×, reset, tự chuyển bài học. Mức tải đổi lưu lượng/công suất; không làm RPM máy phát nối lưới tăng theo tải. Đồng hồ animation ngừng khi pause. Vào vận hành phải lắp hết máy trước.
- Mũi tên đậm 2–2,8 pixel, có viền tương phản, không dùng hạt tròn làm dòng năng lượng. Hiệu ứng vùng cháy và plume nhỏ chỉ bổ trợ, không che model.
- Desktop/mobile: viewport ưu tiên model, sidebar cuộn; mobile panel phía dưới; không tràn ngang. Cận cảnh có thể cắt nhà xưởng, không bóp tỷ lệ máy để fit.
- Asset mục tiêu <180k triangles, <8 MB, khoảng 25 cụm. Báo số thật, ngân sách còn lại, runtime draw calls, giới hạn.

## 2. Tham chiếu và các giản lược

Năm ảnh người dùng trong hội thoại: ảnh render turbine cắt lớp là tham chiếu hình dạng/mức chi tiết; các sơ đồ dùng để hiểu bố cục, không sao chép nhãn hoặc tuyến sai. Không có kích thước khảo sát; chiều sâu và ngoại thất suy luận. Không tuyên bố độ giống theo phần trăm. Bộ gia nhiệt hồi nhiệt, khử khí, xử lý nước và chi tiết khử SOx/NOx không mô phỏng đầy đủ; ghi rõ trong docs/UI. Tuyến khí thải minh họa một cụm lọc bụi, không đại diện hệ xử lý môi trường đầy đủ.

Nguyên lý đã đối chiếu EIA https://www.eia.gov/energyexplained/electricity/how-electricity-is-generated.php và EPA https://www.epa.gov/sites/default/files/2015-06/documents/steam-electric_detailed_study_report_2009.pdf . Không cần mạng khi chạy demo.

## 3. Scene graph và bố trí

Y-up, đơn vị scene metre, tâm nền tại (0,0,0), nền 18×12. Nhà lò bên trái X=-5, turbine trục X tại Y=2.1,Z=-1.3 từ X=-1.8 đến X=4.2; máy phát X=5.3. Bình ngưng dưới turbine LP X=2.4,Y=.85. Tháp giải nhiệt phía sau phải (5,0,3.7), lọc bụi và ống khói phía sau trái. Biến áp/cột điện ngoài gian máy phía phải. Phía trước (-Z) là góc chính thấy rõ tổ máy khi cắt.

IDs: site, coal_supply, boiler_shell, boiler_tubes, furnace, flue_filter, stack, hall_shell, turbine_hp_shell, turbine_hp_rotor, turbine_lp_shell, turbine_lp_rotor, bearings, generator_shell, generator_rotor, condenser_shell, condenser_bundle, feed_pump, cooling_pump, cooling_tower, transformer, grid, steam_pipes, feed_pipes, cooling_pipes, flue_duct. Pivots hp_spin/lp_spin/generator_spin/feed_spin/cooling_spin. Sockets do metadata khai báo; chỉ đăng ký những gì thực sự có.

Chung `layout.json` lưu tuyến hơi, tái nhiệt, hơi xả, nước cấp, nước làm mát nóng/lạnh, khí thải, điện. Blender dựng ống từ tuyến; Three.js dùng cùng tọa độ đặt mũi tên để tránh overlay trôi khỏi ống. Đường điện chỉ có trên viewer.

## 4. File map

Tạo `blender/thermal-power/{geometry,materials,site,boiler,machinery,piping,build,verify,render}.py`, `thermal-power.blend`, build-report.json. Geometry/materials riêng, không phụ thuộc file model khác khi rebuild.

Tạo `src/models/thermal-power/{layout.json,metadata.js,materials.js,loadModel.js,simulation.js,controller.js,lesson.js}`; `src/experiences/thermal-power/{index,studio,ui,effects}.js`, style.css; `scripts/build-thermal.mjs`, `scripts/check-thermal.mjs`; `tests/thermal.test.mjs`; `docs/thermal-power.md`.

Sửa `src/catalog/models.js`, `src/main.js`, `scripts/export-html.mjs`, `scripts/check-offline-html.mjs`, `tests/catalog.test.mjs`, `package.json`, README.md, PROJECT_HANDOFF.md. Thêm `public/models/thermal-power.glb`, `public/images/catalog/thermal-power.png`. Router History API tự hỗ trợ ID mới; route `/models/thermal-power` không có #.

## 5. Các bước thực hiện và kiểm chứng

### A — Logic và contract
- [x] Tạo simulation test: tải 0 không phát điện; 50%/100% cho công suất/lưu lượng tăng; khi running và có tải RPM mục tiêu 3000 không phụ thuộc tải; ngắt làm mát đưa công suất mục tiêu về 0; giá trị ngoài khoảng clamp.
- [x] API `sampleThermal({load,cooling,running}) -> {powerMW,steamFlow,coolingFlow,rpm,heatMW,rejectedMW}`. Bài học chọn 100 MW điện định mức, hiệu suất cố định .36; `heatMW=powerMW/.36`, `rejectedMW=heatMW-powerMW`, không giải chu trình Rankine bằng bảng hơi. Có trạng thái warm-up animation giản lược, không đọc nhiệt độ/áp suất như phép đo thật.
- [x] `node --test tests/thermal.test.mjs`: xác nhận fail vì behavior thiếu, implement rồi pass.

### B — Model hình khối xem được sớm
- [x] Tạo nền/nhà lò/gian máy/tổ máy/tháp giải nhiệt và các ống từ layout, giữ IDs ở trên. Build với `--blockout`, lưu file mốc riêng.
- [x] `node scripts/build-thermal.mjs --blockout`; budget assert, marker AGENT_OK.
- [x] Render góc chính blockout; xem ảnh thực để kiểm tỷ lệ, các tuyến ống có đầu/cuối đúng và không chắn turbine. Nếu sai, sửa bố trí trước detailing. Chia sẻ ảnh/checkpoint trong commentary, tiếp tục các phần đã được user cho phép.

### C — Chi tiết và chuyển động
- [x] Dựng vỏ turbine có nửa dưới cố định/nửa trên tháo được, rotor/tầng cánh thực; stator và rotor máy phát độc lập, cuộn đồng; bundle ống bình ngưng trong vỏ cắt.
- [x] Thêm gân/bu-lông trong cùng cụm cha; chân đỡ và ổ đỡ không cắt vùng quét cánh. Đường ống giữ khoảng hở, không mô tả reheat như đường nối tắt HP→LP.
- [x] Dựng lò/ống trao đổi nhiệt/phễu, tháp giải nhiệt vỏ hyperboloid rỗng và bể chân, xử lý bụi/stack tách chức năng; các lớp bao che riêng.
- [x] Export `.blend` + GLB; reimport chính GLB, kiểm 26 IDs, 5 pivots, geometry hữu hạn, bounds và budget; so hướng trục/coaxial trong test.

### D — Factory/controller
- [x] `loadThermalModel({url,buffer,signal})` fetch/abort/parse; lỗi rõ ràng; `createThermalRuntime(scene,{assetBytes,url})` có registries độc lập, highlight không ảnh hưởng instance khác, dispose idempotent.
- [x] Controller API setMode/select/setCutaway/setIsolated/setExplode/toggleAuto/setLoad/setCooling/setPlaying/setSlow/setLesson/reset/update/dispose. Lưu rest position/quaternion/scale và không sửa root transform của app.
- [x] Test thật trên GLB: explode→principle chờ lắp; pause giữ clock/angle; đổi mode liên tục không drift; reset khôi phục pose; selected/isolate hợp lệ; sockets theo cụm; dispose hai lần an toàn.

### E — Viewer và nguyên lý
- [x] Studio dark, camera hero/machine/boiler/cooling/rear; damping/fit portrait; ResizeObserver/renderer/environment dispose.
- [x] UI Việt: 3 mode, danh mục, description, isolate/focus, cutaway, explode slider/auto/reset, principle controls và 6 bài học. Sidebar desktop 320px; mobile canvas tối thiểu 430px, panel phía dưới.
- [x] Effects dùng `createFlowLines` hiện có; màu hơi cam, nước cấp cyan, cooling xanh dương, cơ năng xanh lá, điện vàng, khí thải xám; bộ lọc tuyến hiện đường đang học và có chọn toàn hệ thống. Mũi tên và lửa dùng cùng clock để pause/slow.
- [x] Tạo local preview ngay khi mount được; kiểm bằng Chrome thực, không chỉ syntax/build.

### F — Tích hợp và nghiệm thu
- [x] Thêm card thứ tư, clean route, offline embedding và thumbnail từ render asset thật.
- [x] `npm test`, `npm run build`, `npm run thermal:verify`, `npm run thermal:render` đạt. Review source/ảnh theo Design OS; các giới hạn chưa xác minh phải ghi rõ.
- [x] Browser `npm run test:thermal`: direct route, exterior→cutaway, chọn/isolate, explode 0/100, assemble before running, pause/slow, load, cooling interlock, lesson/filter, reset, mobile390×844, back/catalog, không JS/shader errors; chụp hero/cutaway/machine/principle/explode/mobile.
- [x] Xem render Blender front/rear/cutaway/machine/cooling và ảnh browser tương ứng, sửa lỗi nhìn thấy rồi kiểm lại đúng phạm vi.
- [x] `npm run export:html`; `node scripts/check-offline-html.mjs` kiểm cả bốn model file:// không HTTP. Không tự deploy hoặc chép Downloads.
- [x] README hướng dẫn lệnh; docs ghi nguyên lý/giản lược/source/budget; PROJECT_HANDOFF ghi trạng thái cuối, ảnh/report/hash/lệnh tiếp tục, không ghi kiểm tra chưa chạy như đã đạt.

## 6. Điều kiện hoàn tất

Card nhiệt điện hoạt động; source dựng lại được; có blend/GLB; ảnh nhìn được ở nhiều góc; đủ ba chế độ và vòng đời không leak rõ ràng; chu trình hơi và cooling không lẫn; UI đọc được mobile; build/offline pass; số liệu có report đúng asset. Mục tiêu chất lượng là mô hình giáo dục thuyết phục, không chứng nhận CFD, nhiệt động, tải kết cấu, hệ bảo vệ hoặc môi trường của nhà máy thực.

## 7. Điều chỉnh khi nghiệm thu — 2026-10-05

- Giữ stator máy phát ở cụm bệ/ổ đỡ cố định để vẫn thấy cuộn dây khi mở nắp; tên và mô tả danh mục đã sửa đúng hierarchy. `generator_shell` là vỏ trên, không chứa stator.
- Bao che gian máy nâng và lùi ra sau để không chắn các nắp đang tách; rotor nâng rồi dịch dọc X. Nắp luôn đi trước rotor kể cả kéo nhanh slider hoặc thoát mode; có regression test lấy mẫu từng frame. Chưa xác minh va chạm liên tục của mọi chi tiết.
- Dùng lửa minh họa và tuyến khói có mũi tên; không thêm plume khói thể tích ở phiên bản này để giữ rõ các tuyến và giảm hiệu ứng chồng lấp.
- Mobile nới khoảng cách camera để toàn cảnh có khoảng trống hai bên. Kiểm thử Chrome giả lập, chưa thử điện thoại thật.
- Runtime không benchmark FPS/đo leak dài hạn; kiểm registry độc lập, dispose idempotent và quay lại catalog. Bằng chứng ảnh/report và kết quả lệnh nằm trong PROJECT_HANDOFF.
