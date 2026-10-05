# HYDRO 01 — nhà máy thủy điện

## Thiết kế và cách xem

Một tổ máy Francis trục đứng trong nhà máy chân đập bê tông. Mặc định hiển thị ngoại thất kín: hồ, đập, tuyến tràn, nhà máy, cửa trả nước, máy biến áp và cột điện. Ống áp lực nằm trong thân đập/hành lang; tổ máy nằm trong nhà máy. Không phải mọi nhà máy thực tế đều có ống ngầm, đây là lựa chọn bố cục của model này.

`Xem bên trong` nâng mái và ẩn dần mặt đứng cùng phần công trình che ống. Phần máy có vỏ cắt sẵn để quan sát. Chọn linh kiện máy từ danh sách cũng mở công trình. `Xem riêng` chỉ giữ cụm chọn và căn camera theo bounds cụm. Chọn trực tiếp mesh, kéo orbit, cuộn/chụm zoom; hỗ trợ touch.

`Tách cấu tạo`: công trình mở trước, nắp máy phát nâng lên, rotor rút khỏi stator, stator dịch sang bên, sau đó trục/bánh công tác/cánh hướng/buồng xoắn tách có thứ tự. Slider hoặc tự chạy hai chiều. Các chi tiết nhỏ nằm dưới đúng parent. Các mặt ghép là hình học minh họa; chưa chứng minh không va chạm liên tục cho toàn bộ tổ máy.

`Nguyên lý`: tự lắp máy trước, mở cửa nhận nước rồi cánh hướng. Điều chỉnh cánh hướng và cột nước giả định; xem Q, công suất và tốc độ. Nước xanh và điện vàng là các tuyến chỉ dẫn chồng lên model. Có pause, 0,25×, ngắt tải/hòa lưới và đặt lại. Ngắt tải đưa công suất bằng 0 ngay, đóng dần cánh hướng, sau đó đóng cửa nhận nước; quán tính tốc độ suy giảm giản lược.

## Vật lý và giới hạn

- `Q = 12 × độ mở × sqrt(H/50)` m³/s; `H = 20..80 m`, là tham số giả định, không phải số đo geometry.
- `P = 1000 × 9,81 × Q × H × 0,88` W. Hiệu suất tổng 0,88 cố định; không tính tổn thất biến thiên theo tải.
- Tốc độ đồng bộ giả định `n = 120f/p = 120×50/20 = 300 rpm`. Khi đã hòa lưới và ổn định, mở thêm cánh hướng tăng công suất, không tăng tốc độ đồng bộ.
- Khởi động/dừng, hòa lưới và điều tốc là chuyển tiếp giáo dục. Không mô phỏng pha hòa đồng bộ, nước va, vượt tốc khi mất tải hoặc ổn định lưới.
- Animation quay giảm 20 lần để đọc được cánh và cực rotor, ngoài hệ số tua chậm 0,25×. Hạt màu không mô phỏng vận tốc nước hay electron thực.
- Bố cục sa bàn tỷ lệ nén; máy được phóng đại. Không sao chép nhà máy có thật, không dùng làm bản vẽ xây dựng/chế tạo.
- Vỏ buồng xoắn/ống và stator có mặt cắt chủ ý. Đập/hành lang che ống là khối trình bày được ẩn khi cắt lớp, không phải mô hình bê tông có lỗ rỗng được kiểm chứng để chế tạo.
- Cửa tràn đứng yên ở trạng thái đóng; nước dưới kênh tràn là mặt nước tĩnh. Slider cánh hướng chỉ điều khiển tuyến phát điện.

Nguồn kiểm chứng nguyên lý: [DOE — How Hydropower Works](https://www.energy.gov/cmei/water/how-hydropower-works), [DOE — Types of Hydropower Turbines](https://www.energy.gov/cmei/water/types-hydropower-turbines), [Bureau of Reclamation — Hoover Power FAQ](https://www.usbr.gov/lc/hooverdam/faqs/powerfaq.html). Các kích thước, công suất minh họa và tỷ lệ trình bày do dự án chọn, không được các nguồn này chứng nhận.

## Dựng và kiểm tra

```sh
npm run hydro:build
npm run hydro:verify
npm run hydro:render
npm test
npm run build
npm run preview -- --port 4173
npm run test:hydro
npm run export:html
node scripts/check-offline-html.mjs
```

Blender dùng `BLENDER_BIN` hoặc `tools/local.json`, phiên bản khóa 5.2.2 LTS. Không cần repo/project khác để chạy web; để dựng asset chỉ cần Blender executable và các script trong `blender/hydroelectric/`. Có thể tạo mốc khối bằng `node scripts/build-hydro.mjs --blockout`. Dựng lại sẽ ghi đè .blend sinh từ code; lưu bản riêng nếu đã sửa tay.

Build/render/verify xuất log và marker AGENT_OK/AGENT_FAIL. Verify import GLB vào Blender sạch, đo bounds, geometry hữu hạn, registry và các pivot đồng trục. Ảnh Cycles từ chính GLB: `output/hydroelectric/renders/`. Ảnh web/báo cáo: `output/hydroelectric/browser/`. Receipt chứa SHA256 gắn với asset.

## Module và contract

`loadHydroelectricModel({url, buffer, signal}) → Promise<THREE.Group>`; URL do ứng dụng truyền, hoặc ArrayBuffer dùng trong test. Mỗi lần tạo runtime độc lập, không chia sẻ mutable materials. Import factory không mở DOM hay render loop.

`root.userData.sculptRuntime`: schemaVersion 1, Y-up/mét/-Z forward, nodes/meshes/sockets/assemblies 22 cụm, 3 pivot quay trục đứng + 16 pivot cánh hướng, rest transforms, bounds, stats, provenance, highlight và dispose idempotent.

`createHydroController(root)` có `state`, `setMode('explore'|'explode'|'principle')`, `select(id|null)`, `setCutaway`, `setIsolated`, `setExplode(0..1)`, `toggleAuto`, `setOpening(0..1)`, `setHead(20..80)`, `setConnected`, `setPlaying`, `setSlow`, `update(dtSeconds)`, `reset`, `dispose`. Mode lạ trả false; input số được clamp. Root placement do ứng dụng quản lý. Reset về ngoại thất, đóng máy, thời gian 0, dừng mô phỏng và giữ placement root.

Geometry/material Python nằm trong `blender/hydroelectric/`; JS material policy, metadata, simulation và controller tách file. Viewer sở hữu camera, lighting, picking, flow effects, DOM và RAF trong `src/experiences/hydroelectric/`. Khi unmount phải abort load, hủy RAF/listeners, dispose controller/runtime/effects/studio.

## Ngân sách hiện tại

30.062 tam giác / 180.000 (còn 149.938), 1.204.400 byte GLB / 8.000.000 (còn 6.795.600). 99 mesh, không texture ảnh hoặc decoder. Nước được thêm lúc chạy: khoảng 10.000 tam giác kể cả các bề mặt/hạt phụ; số render thực tế và draw calls nằm trong `output/hydroelectric/browser/water-report.json`. Mobile được kiểm tra viewport/touch giả lập Chrome; chưa kiểm tra thiết bị thật hoặc Safari.

## Bám ảnh mặt cắt và nước 3D

Tham chiếu người dùng: `docs/reference/hydroelectric-section.jfif`. Đây là hình giải thích mặt cắt, không phải bản vẽ có kích thước. Tái hiện cửa nhận chìm có lưới chắn rác/cửa nâng, lối dẫn thu hẹp, turbine–trục–máy phát đứng, cầu trục gian máy, ống hút cong mở rộng nằm thấp hơn turbine và cửa ra hạ lưu. Chiều sâu, ngoại thất, tỷ lệ thiết bị là phần ước lượng; máy biến áp vẫn bố trí bên hông, tuyến tràn phụ được giữ ở ngoại thất. Bản không sao chép toàn bộ hành lang kiểm tra và cửa bảo trì ống hút trong hình. Hạng mục phụ phía trước được ẩn khi mở mặt cắt để nhìn rõ tuyến chính; vẫn có thể chọn riêng từ danh mục.

`src/models/hydroelectric/hydraulics.json` định nghĩa các tiết diện chung cho `blender/hydroelectric/hydraulics.py` và `src/experiences/hydroelectric/water.js`. Shell trong GLB và thể tích nước dùng cùng tọa độ, hướng tiếp tuyến và kích thước; nước thu nhỏ 6% để tránh chồng mặt. Runtime tạo thể tích xanh trong lòng dẫn, dòng xoắn quanh turbine, vệt chảy, gợn mặt hồ và bọt nhẹ cửa xả. `flowTime` tích phân từ lưu lượng; `waterTime` dành cho gợn, cả hai dừng khi pause. Khi lưu lượng về 0, vệt chảy/bọt dừng; thể tích nước giữ nguyên để mô tả lòng dẫn còn đầy nước. Khi tách hoặc đang chuyển về trạng thái lắp, nước bên trong được ẩn.

Gợn, độ trong, bọt và tốc độ vệt là thiết kế thị giác, không suy ra vận tốc thực hay kết quả thủy lực. Mực hồ/hạ lưu cố định, thay đổi H không biến dạng địa hình. Cấu tạo Francis được đối chiếu [DOE — Types of Hydropower Turbines](https://www.energy.gov/cmei/water/types-hydropower-turbines).

Chạy `node scripts/check-hydro-water.mjs` sau production build/preview để kiểm tra shader, pause, zero-flow, explode và mobile. Ảnh `water-side.png` là góc mặt cắt trong web; `reference-side.png` là render hình học GLB, không gồm shader nước runtime. Source Blender, .blend và GLB đều giữ đầy đủ.

## Nâng cấp hình thức và hướng dẫn nguyên lý — 05/10/2026

`blender/hydroelectric/details.py` thêm kính, khung cửa, khe bê tông, cửa lấy sáng mái, cầu trục, sàn bảo trì/lan can, đường thoát nước mái, đầu cuộn dây, cánh tản nhiệt và bu-lông khớp trục. Chi tiết được gắn đúng assembly để đi cùng bộ phận khi tách. Vật liệu kính riêng và ánh sáng giảm độ cháy sáng. Ngoại thất vẫn đóng mặc định.

`src/models/hydroelectric/lesson.js` chứa 5 chương tiếng Việt: hồ chứa → cánh hướng → turbine → máy phát → máy biến áp/lưới. Controller thêm `setLesson(index)`, `toggleLesson()`, `lesson`, `lessonTime`, `lessonAuto`. Mỗi chương tự chuyển sau 9 giây mô phỏng khi bật; tạm dừng/tua chậm tác động cùng đồng hồ. Chuyển chương chỉ đổi nội dung và dấu chỉ vị trí, không đóng/mở lần lượt những bộ phận vốn hoạt động đồng thời. Nút “Xem vị trí” đưa camera đến cụm tương ứng.

Vòng chỉ vị trí và mũi tên cơ năng là ký hiệu giáo dục. Chúng không mô phỏng trường điện từ hoặc dòng chảy CFD. Thông số cột nước vẫn là giả định độc lập với tỷ lệ dựng hình. Chạy `node scripts/check-hydro-lesson.mjs` sau khi mở preview để kiểm tra chương, tự chuyển, pause, focus và mobile.
