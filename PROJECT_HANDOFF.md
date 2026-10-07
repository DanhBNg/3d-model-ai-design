# Model collection — Session handoff

## Chuẩn hóa collection và giao diện model — 2026-10-07

Đã hoàn thành đợt chuẩn hóa theo `docs/superpowers/plans/2026-10-07-unified-model-interface.md`. Toàn bộ card catalog mở model khi nhấn ở bất kỳ vị trí nào, dùng route sạch và giữ hành vi mở tab mới. Sáu viewer AERO/HYDRO/VENTO/THERMO/FLUX/IGNIS dùng chung shell nền tối lấy drone làm chuẩn qua `src/ui/model-shell/{tokens,shell}.css`, `markup.js` và `icons.js`; hook/controller riêng của từng model được giữ nguyên.

Nguyên lý của cả sáu model dùng `src/viewer/flowLines.js` với `FLOW_STYLE`: track 2,2 px, backing outline thêm 1 px và đầu mũi tên ArrowHelper thân mảnh + nón nhỏ theo drone. Các line có viền tối nên đọc được trên máy màu sáng; hiệu ứng không định hướng như mặt nước, từ trường, combustion glow và spark vẫn giữ đúng vai trò. Mobile breakpoint 760 px, tab chế độ là lưới ba cột, không tràn ngang ở 390×844.

Kiểm chứng mới: `npm test` đạt 82/82; `npm run build` đạt. `npm run test:interface` tải sáu clean routes ở desktop 1440×900 và mobile 390×844, vào chế độ nguyên lý sau khi model vận hành, quay lại catalog sáu card, xác nhận reduced motion, không overflow, không page error và không console error. Báo cáo `output/unified-interface/report.json`; 12 ảnh nguyên lý và một ảnh catalog ở cùng thư mục đã được xem trực tiếp.

Phạm vi chưa làm trong đợt này: thumbnail và geometry/GLB không được thiết kế lại; kiểm tra là Chrome desktop và mobile emulation, chưa phải máy thật/Safari. DESIGN:OS chỉ là phương pháp phát triển, không thêm dependency runtime. Theo yêu cầu người dùng, không tái xuất hoặc xác minh `output/share/Model-Collection.html`; file HTML hiện có thuộc trạng thái trước chuẩn hóa và cần `npm run export:html` + `node scripts/check-offline-html.mjs` trước lần gửi tiếp theo. Không push/deploy.

## IGNIS 06 — động cơ 4 xi-lanh, 2026-10-06

Đã thêm `/models/inline-four-engine` vào catalog sáu model. DOHC 8 van, 37 cụm; khám phá/chọn/isolate, tách cấu tạo, mặt cắt, xem riêng xi-lanh 1–4 không reset pha. Chu kỳ 720°, cam quay nửa tốc độ, thứ tự nổ 1–3–4–2; scrub, bốn kỳ, RPM, pause/slow/reset, góc truyền cam. Dừng cơ cấu trong explode và khi lắp lại. Camera mặc định đã sửa sang phía mặt cắt sau kiểm tra ảnh browser.

Source: `blender/inline-four-engine/` (Python + editable blend + export blend), `src/models/inline-four-engine/` (factory/runtime/metadata/materials/simulation/controller), `src/experiences/inline-four-engine/` (viewer/UI/effects). Plan `docs/superpowers/plans/2026-10-06-inline-four-engine.md`; nguyên lý/giới hạn `docs/inline-four-engine.md`. Lệnh engine:build/verify/render và test:engine trong package.json.

GLB 67.816 triangles, 192 mesh, 1.619.284 byte. SHA256 `b5fa2bf1c22ea82ab3e387ce0f7c4339232e7223dfb71a2332255bce4c54a4dc`. Budget 180k/8MB, còn 112.184 triangles/6.380.716 byte. Reimport Blender verify: 37 identity roots, 28 pivots, 96 belt markers. Bốn ảnh Cycles và receipt trong `output/inline-four-engine/renders/`; đã xem cả bốn. Browser desktop/mobile/cycle/single-cylinder/timing/explode và report trong `output/inline-four-engine/browser/`.

Kiểm chứng: 53 unit tests đạt; production build đạt; browser 8 nhóm kiểm tra đạt, không JS/shader error. HTML sáu model trong `output/share/Model-Collection.html`, khoảng 18,60MB; export/report/offline-check ở cùng thư mục. Không push/deploy.

Giới hạn: kích thước suy dựng, timing van lý tưởng không overlap/đánh lửa sớm; biên dạng cam và cò mổ giản lược, không giải tiếp xúc động lực học. Không CFD, nhiệt, áp suất, mô-men, ECU. Chưa kiểm va chạm liên tục mọi chi tiết nhỏ trong exploded view; mobile được kiểm bằng viewport Chrome, chưa đo FPS trên điện thoại thật. Trong xem riêng vẫn giữ trục khuỷu/cam/đai chung để giải thích liên hệ cơ khí. Các số và trạng thái bên dưới thuộc lịch sử các model trước.

## Màn hình điện thoại / đặt sạc / giảm bóng — 2026-10-06

Theo phản hồi người dùng, FLUX05 đã giảm metallic/tăng roughness của vỏ, khung, PCB, pin và coil trong source Blender; viewer envMapIntensity xuống.22. Geometry không đổi. GLB mới **955.528byte,43.676triangles,39mesh**, SHA256 `730227ad33ca19c287f500398a3a370c077b1c1f510b6aaefae6a2bc4c7c5a38`; blend/GLB/4renders/thumbnail/reports cập nhật cùng hash. Những số asset ở các mục cũ bên dưới là lịch sử.

Màn hình runtime `src/experiences/wireless-charging/display.js` dùng CanvasTexture512×1024: wallpaper, đồng hồ/ngày mẫu, status icons, camera/earpiece giữ vị trí, vòng pin xanh và chữ báo sạc. Texture tạo tại máy, không tải ảnh/font ngoài; gắn vào assembly màn hình, hỗ trợ hide/isolate/dispose. Blender/GLB giữ biểu tượng màn hình tĩnh; màn hình động là source Three.js, không nằm trong ảnh render Blender. Đồng hồ và phần trăm pin là dữ liệu minh họa.

Khám phá có nút **Nhấc điện thoại / Đặt lên đế sạc**. Controller owns docked/dockProgress/screenTime: tất cả lớp điện thoại nâng/hạ cùng nhau; nhấc ngắt nhận sạc ngay, đặt hoàn tất mới báo sạc; pause/slow giữ nhất quán. Explode không phát năng lượng. Màn hình dựa trên trạng thái controller, có hiệu ứng sáng lúc nhận sạc; không dựa trên timer riêng ngoài controller.

Kiểm chứng:47unit tests đạt; production build, Blender build/verify/render đạt;16browser checks đạt, có ảnh `output/wireless-charging/browser/phone-lifted.png` và `phone-charging.png` đã xem thực tế. Mobile và các mode cũ kiểm lại đạt, không JS/shadererrors. Frame nguyên lý49.032triangles/62calls/58geometries; màn hình thêm một canvas texture runtime và2triangles khi hiện, asset không có texture ảnh. HTML offline đã export lại; kiểm tra kết quả ở `output/share/offline-check.json`. Chưa push/deploy thay đổi.

## Hiện tại — FLUX 05 / sạc không dây, 2026-10-06

Đã thêm model thứ năm `/models/wireless-charging`: điện thoại nguyên bản và đế tròn,14 cụm, coil đồng12 vòng, ferrite, PCB có linh kiện, pin, khung rỗng, màn hình và adapter/cáp. Ba mode khám phá/tách lớp/nguyên lý; chọn/highlight/isolate/focus;5 bước bài học; điều chỉnh lệch tâm±35mm và khoảng cách tâm coil6–18mm, pause/0,25×/reset. Năng lượng AC/DC→nghịch lưu→TX→từ trường→RX→chỉnh lưu/quản lý sạc→pin.

Source riêng `blender/wireless-charging/`, `src/models/wireless-charging/`, `src/experiences/wireless-charging/`; giữ Python, `wireless-charging.blend`, GLB, runtime/controller/viewer. Design OS/Blender dùng phiên bản đã khóa. Plan `docs/superpowers/plans/2026-10-06-wireless-charging.md`, chi tiết `docs/wireless-charging.md`. README/catalog/router/offline exporter và kiểm tra số card đã cập nhật5model.

Asset cuối **43.676 tam giác,39 mesh,955.568 byte**, SHA256 `75e2cf313350b73f74b019800ffcd0ea1434d923274107b10fcee347d30ad2ff`; budget100k/5MB, còn56.324 tam giác/4.044.432byte.14identityroots,2sockets TX[0,.007,0]/RX[0,.013,0],Y-up mét. Bounds[-.131,0,-.077]→[.055,.0255,.077225]. Build/GLB reimport verify đạt,4render closed/exploded/coils/rear kèm receipt đúng hash trong `output/wireless-charging/renders/`. Đã xem ảnh blockout, render cuối và Chrome desktop/mobile; nguồn asset không texture ngoài.

Kiểm chứng cuối: **46 unit tests pass**, production build pass, Blender verify pass; **15 browser checks pass** (`output/wireless-charging/browser/report.json`), gồm closed/cutaway/isolate/explode/zero/reassembly/alignment/gap/pause/slow/filter/lesson/reset/mobile/dispose và không JS/shader error. Frame nguyên lý mobile49.032triangles/62drawcalls/57geometries, không phải FPS benchmark. Browser tích hợp lỗi sandboxPolicy; dùng Chrome Playwright hiện có. Chưa thử điện thoại thật/Safari.

Review độc lập phát hiện jump14mm khi chuyển mode và các vòng từ trường giao nhau trên trục. Đã sửa separation bằng giá trị nội suy riêng, thêm regression test không đổi pose tức thì khi thoát mode. Field dùng nhánh trong xuyên vùng lỗ coil và nhánh trở về ngoài bán kính dây, phân bố quanh trục; đảo thứ tự đường khi đổi cực và giảm sáng qua zero. FerriteRX/pin/PCB đưa ra ngoài trong giảng giải để không che hai coil. Camera mobile đã nới để không cắt adapter/pin. Mũi tên theo sockets; đường nối linh kiện tách ra là sơ đồ năng lượng.

Khoảng cách6–18mm là tham số vật lý bài học; chỉ nguyên lý cộng14mm hiển thị có chú thích, ordinarycutaway giữ khoảng cách thật. Min6mm tránh vỏ xuyên đế. Coupling/công suất là đường cong giáo dục, pin là đồng hồ minh họa; không Maxwell/FEM/Qi/CC-CV/thermal hoặc thời gian sạc thật. Ferrite dịch ra để thấy coil không đại diện cấu hình vận hành thật. Chưa xác minh va chạm liên tục mọi chi tiết trong quá trình tách; các giới hạn rõ trong docs/UI.

Bản HTML `output/share/Model-Collection.html` **15.301.002byte (~15,30MB)** nhúng đủ5model, kiểm file:// offline qua từng model đạt, không remote request/page exception. Preview tại `http://127.0.0.1:4173/models/wireless-charging`; nếu đã dừng chạy `npm run preview -- --port 4173`. Lệnh `wireless:build`, `wireless:verify`, `wireless:render`, `test:wireless` trong package.json. Chưa push thay đổi FLUX05 lên GitHub hoặc deploy; commit GitHub gần nhất vẫn là lần người dùng yêu cầu push trước đó.

## GitHub — ủy quyền mới

Người dùng yêu cầu đưa toàn bộ dự án lên `https://github.com/DanhBNg/3d-model-ai-design`. Đã khởi tạo Git với nhánh `main`, remote `origin` trỏ repository này (trống khi kiểm tra ban đầu). Yêu cầu này thay thế giới hạn không push của các phiên triển khai trước. `.gitignore` loại dependency, dist, cấu hình máy, Python cache, log và file môi trường; giữ source, `.blend`, GLB, tài liệu và bằng chứng kiểm tra. Không triển khai website.

## Hiện tại — THERMO 04 hoàn tất, 2026-10-05

Collection có **bốn model**, route mới `/models/thermal-power`. Người dùng đã yêu cầu plan đầy đủ rồi triển khai; kế hoạch và checklist: `docs/superpowers/plans/2026-10-05-thermal-power.md`. Không push/deploy, không sửa dự án khác. Workspace này không có Git repository.

Nhiệt điện: ngoại thất kín; 26 cụm có chọn/highlight/isolate/focus; mở vỏ và 5 góc camera; tách/lắp liên tục, tự chạy và reset; 6 bài học nguyên lý. Lò có dàn ống, turbine HP/LP nhiều tầng, máy phát rotor/stator, bình ngưng chùm ống, hai bơm, tháp giải nhiệt, lọc bụi/ống khói, biến áp/đường dây. Vòng hơi có tái nhiệt tách khỏi vòng cooling. Mũi tên wide-line có viền, màu theo tuyến, bộ lọc, lửa minh họa; không dùng hạt tròn cho dòng năng lượng. Chỉnh tải 0–100%, ngắt làm mát, pause, 0,25× và tự chuyển bài học. Phải lắp lại trước khi vận hành.

Source đầy đủ: `blender/thermal-power/` gồm Python geometry/materials/site/boiler/machinery/piping, build/verify/render, `.blend`; `src/models/thermal-power/` gồm loader/factory/runtime, metadata, simulation, lesson, controller; `src/experiences/thermal-power/` gồm studio/UI/effects/CSS. `layout.json` dùng chung tọa độ ống Blender và tuyến chỉ dẫn Three.js. Runtime không sở hữu DOM hoặc RAF. Blender/Design OS dùng bản đã khóa trong README, không cài thêm công cụ.

Asset cuối: **45.816 tam giác, 74 mesh, 1.322.668 byte**, SHA256 `57ed01a74dbedbd7c8c845faffc4a122bbf2c749a548a96fdfa7e74937590c33`. Còn **134.184 tam giác / 6.677.332 byte** trong budget 180k/8MB. Bounds Y-up `[-9,-.32,-6] → [9,8.0325,6]`. Reimport GLB kiểm 26 root/5 pivot, vật liệu/hữu hạn/bounds; render Cycles 5 góc có receipt cùng hash: `output/thermal-power/renders/`. Asset trong dist và HTML trùng hash source. Thumbnail lấy từ render asset cuối.

Kiểm chứng: **38 unit tests** toàn project đạt, sau tinh chỉnh cuối controller đã chạy lại **7 thermal tests** đạt. Production build/export đạt. **16 browser checks** bản cuối đạt (`output/thermal-power/browser/report.json`): exterior/cutaway, chọn/isolate, explode100/0, lắp trước chạy, pause/slow, tải, ngắt cooling, filter hai tuyến cooling, tự chuyển bài học, reset, mobile390×844, back/dispose, không lỗi JS/shader. Đã xem ảnh thực nhiều góc Blender và desktop/mobile Chrome, chỉnh roof gap, shading tháp, khoảng nhìn mobile và vị trí mái khi tách. Một frame nguyên lý mobile: 35.942 triangles /90 draw calls /99 geometries; đây không phải benchmark FPS.

Review độc lập phát hiện và đã sửa: slider0 không lắp nắp; phase mái/nắp chưa tách; rotor rút ngang trục; tên stator không đúng cụm; assertion filter có thể pass rỗng. Test mới xác nhận sockets theo cụm, repeated mode/isolate, zero pose và clearance nắp/rotor từng frame khi kéo nhanh0→100% hoặc thoát mode. Regression test đã chạy fail trước fix, pass sau fix. Reviewer kiểm lại 7 tests, không còn finding trong phạm vi cuối. Stator giữ ở cụm bệ/ổ đỡ cố định để nhìn được khi mở vỏ; `generator_shell` là vỏ trên máy phát.

Bản chia sẻ `output/share/Model-Collection.html`: **12.992.262 byte**, đã kiểm qua `file://` offline đủ bốn model, không HTTP request/page exception (`output/share/offline-check.json`). Không tự chép Downloads. Các số liệu HTML/ba model bên dưới là lịch sử.

Tiếp tục: `npm run preview -- --port 4173`, mở `http://127.0.0.1:4173/models/thermal-power`. Preview đang có process tại4173 lúc bàn giao. Asset: `npm run thermal:build`, `npm run thermal:verify`, `npm run thermal:render`; viewer: `npm run test:thermal`. Hướng dẫn nguyên lý/source/giản lược: `docs/thermal-power.md`; README đã cập nhật bốn model.

Giới hạn: bố cục và kích thước suy luận, 100MW/36%/lưu lượng là thông số bài học, không giải bảng hơi hay mô phỏng hòa lưới. Tốc độ ổn định3000rpm, hình ảnh8rpm. Không đầy đủ gia nhiệt hồi nhiệt/khử khí/xử lý nước/SOx/NOx. Không có plume thể tích; tuyến khói và lửa là đồ họa minh họa. Chưa kiểm mọi va chạm liên tục hoặc leak dài hạn; chưa thử điện thoại thật/Safari. Browser tích hợp lỗi môi trường `sandboxPolicy`, đã dùng Chrome Playwright hiện có. Tài liệu không tuyên bố mô phỏng khí động/nhiệt động hoặc quy trình vận hành nhà máy chính xác.

## Tăng độ nổi mũi tên nguyên lý — 2026-10-05

Người dùng phản hồi line 1 pixel và opacity thấp quá khó nhìn so với drone. Đã chuyển helper `flowLines.js` sang Three.js LineSegments2/LineMaterial có bề dày màn hình: đường dẫn 2 px, mũi tên 2,8 px; viền tối rộng hơn 2,2 px, màu chính gần như opaque và không tone mapping. Kích thước đầu mũi tên tăng 2,5 lần. Điện vàng cam, nước cyan, gió cyan sáng; gió cũng dùng wide lines. Resolution được LineSegments2 cập nhật theo viewport khi render. Không thay đổi GLB hoặc mô phỏng. Đã xem ảnh desktop thực tế của cả hai model; 7 kiểm tra hydro water và 12 kiểm tra wind đạt, gồm mobile giả lập và không lỗi shader/JS. Production build đạt. Chi phí một frame nguyên lý mobile: hydro 38.690 triangles/103 calls, wind 26.180 triangles/110 calls; không phải benchmark FPS. Những số liệu hiệu ứng cũ bên dưới là lịch sử.

## Nguyên lý dùng line mảnh — 2026-10-05

Kiểm chứng: production build/export đạt; 7 kiểm tra nước thủy điện và 12 kiểm tra tua-bin đạt trên Chrome desktop/mobile giả lập, gồm pause, zero flow, chuyển chế độ và không lỗi JS/shader. Đã xem ảnh nguyên lý thực tế của cả hai. GLB không đổi, không cần dựng lại Blender. HTML chia sẻ đã được đóng gói lại.

Theo yêu cầu người dùng học phong cách drone, đã thay hạt tròn chỉ dòng điện của thủy điện/tua-bin bằng line + đầu mũi tên hở nhỏ, giảm số dấu chuyển động còn 5–6 mỗi tuyến. Helper chung `src/viewer/flowLines.js` dùng Line/LineSegments, tính hướng theo tiếp tuyến và dùng đồng hồ controller nên pause/slow giữ nhất quán. Tua-bin thêm đầu mũi tên mảnh cho vệt gió. Thủy điện: vòng chỉ vị trí và cung quay cơ năng dùng line thay torus/cone; dòng nước trong ống và cửa xả dùng mũi tên thay vệt/hạt bọt tròn. Nước thể tích và gợn mặt hồ giữ nguyên. Handle `water.foam` còn để tương thích kiểm tra nhưng hiện là Group chứa line cửa xả. Không sửa asset Blender/GLB hoặc logic mô phỏng; hash asset ở mục trước vẫn đúng.

## Sửa bánh răng xuyên thành hộp số — 2026-10-05

Hoàn tất bàn giao bản sửa: 31/31 unit tests đạt; production build đạt. Bước export bị gián đoạn do hạn mức duyệt quyền ở lượt trước, đã chạy lại thành công sau khi người dùng yêu cầu tiếp tục. `output/share/Model-Collection.html` hiện 10.054.003 byte, nhúng đúng GLB hash `5b3833abac65e3105b7c94ddd8cc1bc59c7937ca738789de2db58ba9a0742df1`. Đã mở và kiểm tra cả ba model qua `file://` offline, không request HTTP/page exception (`output/share/offline-check.json`).

Người dùng gửi ảnh răng lộ xuyên mặt sau. Nguyên nhân: tâm bánh trung gian Z=0,8 và bán kính quét 0,422 vượt mặt trong thành Z=0,945; đáy hộp cũng cắt bánh đầu vào (khoảng cách 0,420 < bán kính 0,622). Đã dời thành sau để mặt trong ở Z=1,245, hạ mặt đáy xuống Y=-0,65 so với tâm trục, hạ gân đầu tránh cắt trục, nới phần xa của vỏ nacelle và bệ tương ứng. Giữ vị trí trục, bánh răng, tỷ số truyền, tỷ lệ cánh/tháp.

GLB hiện tại **613.696 byte, 21.484 tam giác, 53 mesh**, SHA256 `5b3833abac65e3105b7c94ddd8cc1bc59c7937ca738789de2db58ba9a0742df1`. Đã cập nhật script, `.blend`, GLB, production build. Regression test mới tính vùng quét bánh răng từ vertex thực và raycast đến vỏ; đã thấy fail trên bản lỗi, pass sau sửa. Browser đã kiểm tra góc trước/sau, hai thời điểm quay và tạm dừng: `scripts/check-wind-gears.mjs`, ảnh/báo cáo `output/wind-turbine/gear-fix/`. Render Cycles bốn góc và Blender reimport được tạo lại cho hash mới. Số liệu và review ở mục VENTO bên dưới là trước bản sửa hình học này.

## Hiện tại — VENTO 03 và sửa tỷ lệ theo ảnh ngoài khơi, 2026-10-05

Đã thêm tua-bin gió tại `/models/wind-turbine`, model thứ ba trong catalog. Người dùng đã duyệt triển khai và yêu cầu cập nhật handoff. Phản hồi quan trọng: bản blockout đầu có tháp ngắn, cánh nhỏ, khoang máy quá lớn. Đã sửa: tháp khoảng 35 m trong scene, bán kính rotor khoảng 23 m, nacelle 5,3 m. Không thu ngắn cánh/tháp để nhét vào viewport. Góc mặc định tập trung rotor và cắt chân; nút Toàn bộ nhìn toàn cảnh, Khoang máy/Mặt sau zoom vào nội thất. Giữ quyết định tỷ lệ này ở các session sau.

Nguồn: `blender/wind-turbine/` gồm geometry/materials/assemblies, build/verify/render và `wind-turbine.blend`; `public/models/wind-turbine.glb`; `src/models/wind-turbine/` gồm factory/runtime, metadata, materials, simulation, controller; `src/experiences/wind-turbine/` gồm viewer/UI/effects/CSS. Không phụ thuộc source hydro để dựng lại; helper geometry/materials được sao chép thành module riêng. Dùng toolchain Blender/Design OS đã khóa, không cài thêm công cụ.

Chức năng: 20 cụm có chọn/highlight/isolate/focus; mở vỏ, slider tách/lắp và tự chạy; nguyên lý gồm gió 3D dạng vệt, trục/hộp số/máy phát quay, hạt điện, chỉnh tốc độ/hướng gió, yaw, pitch, gió mạnh dừng bảo vệ, pause/slow/reset, 5 bước hướng dẫn. Cụm cánh gồm cả vòng pitch khi tách. Phải lắp xong trước khi vận hành. Ngoại thất kín mặc định. Sensors đi cùng vỏ trong explode và ẩn cùng vỏ trong cutaway để không lơ lửng.

Asset cuối: **21.484 tam giác, 53 mesh, 611.544 byte**, SHA256 `a61f7991b7838ca3a10c46fcb84b52e6dbbb85e05da293c00a39368d234580d2`; budget 150k/6 MB, còn 128.516 tam giác/5.388.456 byte. Bounds Y-up: y 0…58,59. Ảnh render cuối `output/wind-turbine/renders/` có receipt đúng hash; blockout chỉ là lịch sử. Không đưa ảnh blockout lên làm bằng chứng model cuối. Một frame nguyên lý mobile: 19.104 triangles, 75 draw calls, 87 geometries; không phải benchmark FPS.

Kiểm tra đã đạt: 30 unit tests toàn project; Blender reimport/verify; 4 góc Cycles; 12 browser checks tua-bin (desktop 1440×960, mobile viewport 390×844, pause, storm pitch, yaw, reassembly, reset, chọn/xem riêng, dispose về catalog, không lỗi shader/JS). Production build và export HTML đạt. Review source độc lập `/root/wind_review` không tìm thấy lỗi critical/important, chạy lại 6 wind tests đạt; review đó không bao gồm ảnh/browser. Browser tích hợp bị lỗi môi trường `sandboxPolicy`; đã dùng Chrome Playwright hiện có để kiểm tra.

Các lệnh: `npm run wind:build`, `npm run wind:verify`, `npm run wind:render`, `npm run test:wind` (preview tại 4173). Chạy web/build theo README. HTML chia sẻ đã cập nhật cả ba model tại `output/share/Model-Collection.html`, 10.051.271 byte. Kiểm tra `file://` offline đạt đủ ba model, không request HTTP hoặc page exception; báo cáo `output/share/offline-check.json`. Không tự chép sang Downloads, không push/deploy. Preview cổng 4173 đã có process từ session trước; nếu dừng thì chạy lại theo README.

Giới hạn: kích thước suy luận; hộp số hai tầng bánh răng thẳng 6:1 phục vụ bài học, không tái tạo đầy đủ hộp số công nghiệp. Công suất 2 MW và ngưỡng gió 3/12/25 m/s là tham số giáo dục. Cánh/luồng gió/điều tốc/phát điện không phải CFD hay mô phỏng điều khiển chính xác; tốc độ hình ảnh 0,32×, giữ tỷ số truyền. Chưa kiểm chứng clearance liên tục khi tháo; chưa thử điện thoại thật/Safari. Chi tiết và nguồn nguyên lý ở `docs/wind-turbine.md`; spec/plan tại `docs/superpowers/{specs,plans}/2026-10-05-wind-turbine.md`.

Các mục bên dưới là lịch sử thủy điện/drone, không đại diện số model hoặc dung lượng HTML hiện tại.

## Hiện tại — mặt cắt tham chiếu và nước 3D, 2026-10-05

Yêu cầu mới: bám ảnh `thuỷ điện.jfif` và làm luồng nước sinh động. Bản tham chiếu được giữ tại `docs/reference/hydroelectric-section.jfif`. Đã dựng lại cửa nhận thấp, lưới chắn rác, đường dẫn thu hẹp, nền thấp và ống hút cong mở rộng dưới turbine. Cầu trục thuộc gian máy, không biến mất theo mái. Ngoại thất vẫn kín; mặt cắt ẩn các hạng mục phụ phía trước trừ khi người dùng chọn chúng. Nút ▤ mở góc mặt cắt đường nước.

Thêm `hydraulics.json` dùng chung tiết diện giữa Blender (`hydraulics.py`) và Three.js (`water.js`). Nước có thể tích, vệt chảy, gợn mặt hồ và bọt cửa xả. Hai đồng hồ trong controller hỗ trợ pause/slow/reset; flowTime theo lưu lượng. Nội thất nước ẩn khi explode/isolate/transition. Đã sửa vệt chảy tránh nối tắt hai đầu đường khi lặp. Đây là hiệu ứng đồ họa, không CFD hoặc mô phỏng mực nước động.

GLB cuối: 30.062 tam giác, 99 mesh, 1.204.400 byte, SHA256 `bfb8ef5e448f0a7aeee40f21c183443b61b7e0780f1232df280f7e660109bd79`. Đã lưu script/.blend/GLB; render Cycles 6 góc có receipt cùng hash. Render Blender không gồm nước runtime và vẫn giữ các hạng mục phụ; ảnh web `water-side.png` thể hiện mặt cắt hiển thị thực tế. Trong một frame mobile nguyên lý đo 40.650 tam giác và 101 draw calls, không coi đây là benchmark FPS.

Kiểm tra: 24 unit tests, 23 checks viewer hydro, 7 checks nước (gồm lỗi shader/JS, pause, zero flow, explode, mobile); Blender reimport/verify đạt. Giới hạn ảnh: chiều sâu/tỷ lệ là ước lượng, transformer bên hông và tuyến tràn khác hình gốc; chưa dựng đầy đủ hành lang kiểm tra/cửa bảo trì ống hút. Reviewer độc lập được gọi theo skill nhưng không chạy được vì hết hạn mức; không tuyên bố đã được review độc lập. Không thay đổi source drone, không push/deploy.

Hướng dẫn chi tiết: `docs/hydroelectric.md`; thiết kế: `docs/superpowers/specs/2026-10-05-hydro-reference-water.md`. Preview localhost:4173; nếu đã dừng, chạy lệnh README. Các mục bên dưới là lịch sử, số liệu cũ không đại diện bản hiện tại.

Đóng gói cuối: `output/share/Model-Collection.html` 8,29 MB; kiểm tra `file://` offline đạt, không request mạng. Thumbnail catalog đã thay bằng render mới. Preview được khởi động lại sau khi phát hiện process cũ đã dừng.

## Nâng cấp tiếp theo — hình thức và nguyên lý, 2026-10-05

Đã thực hiện yêu cầu làm thủy điện chi tiết hơn theo workflow design-os-3d-blender hiện có. Thêm `blender/hydroelectric/details.py` (chi tiết kiến trúc, cầu trục, cuộn dây, tản nhiệt, khớp nối), cập nhật palette và ánh sáng. Build lại `.blend`, GLB, 5 ảnh Cycles và thumbnail catalog. Vẫn ngoại thất kín mặc định, 22 assembly/pivot cũ được giữ.

Thêm `src/models/hydroelectric/lesson.js`: 5 bước giải thích với vòng chỉ vị trí, mũi tên quay cơ năng, nút focus và tự chuyển bước mỗi 9 giây mô phỏng. Controller sở hữu trạng thái/đồng hồ; UI/effects chỉ hiển thị. Pause/slow tác động cả lời dẫn lẫn animation. Chuyển bước không thay đổi vật lý. Source và hướng dẫn tại `docs/hydroelectric.md`.

Asset hiện tại: 29.738 tam giác, 98 mesh, 1.170.412 byte. SHA256 `57693a3818939dcb997a1dd201bd2d624fecccb86cd090fb9cd33eda81ed01d2`. HTML cập nhật `output/share/Model-Collection.html` 8,21 MB. Chưa chép sang Downloads, chưa push/deploy.

Kiểm tra lần nâng cấp: 23 unit tests; 23 browser checks thủy điện; 6 checks mới trong `scripts/check-hydro-lesson.mjs`; Blender reimport/verify và render 5 góc; production build/export đều qua. Đã xem ảnh desktop, mobile, cận cảnh và phía sau. Bài kiểm tra 40 mục drone ở phần dưới là kết quả phiên trước; không thay đổi source drone trong lần này. Giới hạn còn: địa hình/công trình vẫn được thu gọn; thủy lực, điều tốc và trường điện từ chưa mô phỏng kỹ thuật; mobile là giả lập Chrome, chưa đo thiết bị thật/Safari.

HTML mới cũng đã qua kiểm tra mở offline `file://` bằng `scripts/check-offline-html.mjs`, không có request mạng.

## Trạng thái trước đợt nâng cấp — 2026-10-05

Kiểm chứng cuối: 22/22 unit tests, 23/23 hydro browser checks, 40/40 collection/drone browser checks; không page exception. Offline file://: 11 kiểm tra đạt, không HTTP request. Production build và HTML export thành công. Preview localhost:4173 đã khởi động lại; nếu process dừng, dùng lệnh README. Ảnh desktop/mobile cuối nằm trong `output/hydroelectric/browser/`. Bộ duyệt quyền đã hoạt động lại sau gián đoạn hạn mức; không còn bước build bị chặn.

HYDRO 01 đã được triển khai tại `/models/hydroelectric`, catalog có hai model hoạt động. Theo phản hồi người dùng, mặc định ngoại thất kín (ống nằm trong công trình, tổ máy trong nhà máy); chỉ lộ bên trong khi chủ động cắt lớp, chọn linh kiện máy, tách hoặc xem nguyên lý. Không quay lại mặc định phơi ống/tổ máy như blockout cũ.

Nguồn mới: `blender/hydroelectric/{geometry,materials,civil,machinery,exterior,build,verify,render}.py`, `hydroelectric.blend`; `src/models/hydroelectric/{metadata,materials,loadModel,simulation,controller}.js`; `src/experiences/hydroelectric/{index,studio,ui,effects}.js` và CSS. Model/controller không tạo DOM hay RAF. Pipeline `scripts/build-hydro.mjs` dùng Blender đã khóa, giữ log/marker. Đọc `docs/hydroelectric.md` trước khi sửa.

GLB hiện tại: 22.098 triangles, 90 mesh, 824.484 bytes, SHA256 `407d9669ec2f3cb1525ee25ab22b06704081190dabffd153d53abb4b838ee9cd`. Render chính xác asset: `output/hydroelectric/renders/{front,rear,top,cutaway,detail}.png`; receipt chứa hash. Blockout là mốc cũ, không dùng làm bằng chứng ngoại thất cuối.

Đã kiểm tra Blender reimport/finite vertices/bounds/22 cụm/16 guide pivots/đồng trục. 22 unit tests đạt sau thay đổi cuối. Build production và export HTML mới thành công; các báo cáo browser/offline được ghi ở `output/hydroelectric/browser/report.json`, `output/validation/browser-report.json`, `output/share/offline-check.json` khi chạy script tương ứng. HTML mới `output/share/Model-Collection.html` khoảng 7,72 MB chứa cả hai GLB. Chưa chép bản collection mới vào Downloads; bản AERO-Q4-Drone.html trong Downloads là bản drone lịch sử.

Giới hạn: sa bàn tỷ lệ nén, khối bao che phục vụ cắt lớp không phải kết cấu bê tông có lòng rỗng; chưa chứng minh không va chạm liên tục toàn bộ exploded view. P=ρgQHη với η cố định; máy giả định 50 Hz/20 cực/300 rpm, quay hiển thị chậm 20 lần. Khởi động/hòa lưới/ngắt tải giản lược, không CFD/nước va/vượt tốc. Điện thoại thật/Safari chưa thử. Không push/deploy.

## Lịch sử trước khi thêm thủy điện

2026-10-05: dự án đã có màn hình **Bộ sưu tập mô hình 3D** tại `/`, gồm Drone AERO Q4 đang hoạt động và Nhà máy thủy điện ở trạng thái `Đang chuẩn bị`. Drone mở ở `/models/drone` bằng History API, không có dấu `#`; nút `← Bộ sưu tập` tháo viewer và quay lại catalog. Route `/models/hydroelectric` đã giữ chỗ nhưng hiện trả về catalog. Trên `file://`, navigation chạy nội bộ để single-file không rời khỏi file HTML.

Source mới: `src/catalog/models.js`, `catalogView.js`, `catalog.css`; `src/app/router.js`; `src/experiences/drone/index.js`. `src/main.js` chỉ còn bootstrap/router. Model factory, controller và asset drone không bị ghép với catalog.

`npm run export:html` hiện tạo `output/share/Model-Collection.html`, tự chứa ảnh catalog và GLB. Offline checker đi theo luồng catalog → drone → catalog và xác nhận không có request mạng.

2026-10-05: `npm run export:html` tạo HTML tự chứa ở output/share/AERO-Q4-Drone.html (~5,12 MB). Đã mở bằng file:// trong Chrome offline, kiểm tra explode/flight/pause và không có request HTTP. Bản gửi được chép đến Downloads/AERO-Q4-Drone.html theo yêu cầu. Dựng lại HTML sau mỗi thay đổi source/asset; không sửa bundle thủ công.

2026-10-05: desktop exploded layout có thẻ điều khiển rộng 220px phía trái; viewport dùng chiều cao còn lại và dịch sang phải để drone lớn hơn. Camera explode desktop distance base 1,02m; mobile giữ 1,14m và bố cục trước. Nhãn socket cộng offsetLeft của viewport.

2026-10-05: đổi giao diện sang xám than theo yêu cầu người dùng. `src/viewer/theme.css` điều khiển màu UI; `studio.js` đặt background WebGL #252930 và grid tối. Geometry, controller và asset không thay đổi.

Workspace độc lập: `new-test-dsos`. Không sửa source dự án khác, không push/deploy. Đọc README, docs/runtime.md, docs/verification.md trước khi tiếp tục.

## Đã có

Kiểm chứng cuối: 12/12 unit tests; 34/34 browser checks trên production localhost:4173; clean npm ci/build thành công trong .test-build. Có production preview ở cổng 4173 trong session bàn giao, nếu process đã dừng hãy chạy lại theo README.

Demo tiếng Việt với ba mode, responsive desktop/mobile, 15 cụm, gimbal và rotor pivots, chọn/ẩn/isolate, slider tách/lắp và autoplay, 8 tình huống giáo dục với năng lượng/tín hiệu, RPM, lực đẩy, play/pause/slow/reset. Blender source + `.blend` + GLB đầy đủ. Factory/runtime/controller/viewer tách riêng. Npm lockfile khóa dependencies.

Lệnh: `npm ci`, `npm run dev -- --port 5173`, `npm test`, `npm run build`. Preview build `npm run preview -- --port 4173`. Browser tests dùng Chrome cài sẵn và DEMO_URL tùy chọn. Dựng lại asset cần Blender 5.2.2 qua BLENDER_BIN; tools/local.json chỉ cho máy hiện tại.

Asset SHA cuối: `106e1ba567b29a506fd287287081b4acaed9b4b645ea263414e49fd1752c8dda`. 94.068 triangles, 76 meshes, 3.342.068 bytes. Báo cáo số đo ở blender/drone và output/validation. Ảnh cuối asset ở output/blender-final; output/blender là pre-change. scripts/capture.mjs là script mốc blockout cũ, không chạy trên UI hiện tại; scripts/review.mjs và browser-check.mjs dùng UI hiện tại.

## Cần biết khi sửa

- Gốc +Y up/-Z forward/mét. Python chuyển `(x,y,z)` sang `(x,-z,y)`; GLB xuất Y-up. Không tự xoay lại wrapper.
- Runtime gắn ở root.userData.sculptRuntime; không clone root trực tiếp. Mỗi factory parse lại GLB và clone material theo part để highlight không lan.
- Cánh và motor chung trục nhưng là assemblies riêng; rotor là child motor. Đừng merge rotor vào stator.
- Controller dùng pose rest tuyệt đối; root placement không do controller sở hữu. Flight mode phải về explode=0 trước khi bay, và về ground pose trước khi bung.
- Trạng thái pause dừng instructional clock; dt bị kẹp 0,05 giây. Không sửa state trực tiếp từ UI.
- Nếu thay metadata offset/stage: chạy write-assembly-manifest rồi --motion. Thay geometry cần build, verify và render bằng tên thư mục mới; ảnh cũ không còn là bằng chứng.

## Giới hạn cần ưu tiên tiếp

Vùng tiếp giáp ở pose lắp vẫn có surface intersections được ghi cụ thể trong docs/verification.md. Muốn đạt yêu cầu tuyệt đối không xuyên nhau cần sửa mount, standoff và housing interfaces thành hình học có clearance thực, rồi quét đường tách dày hơn/continuous. Chưa có kiểm chứng điện thoại thật hoặc Safari. Mô phỏng là giáo dục, không khí động học chính xác. Gimbal stabilization là bù Euler gần đúng; dây không đàn hồi.

Review độc lập đã thử nhưng subagent hết quota; không được coi đã hoàn thành review. Trong lần tự rà đã bổ sung regression cho rapid flight re-entry và sửa blend từ pose hiện tại.

## Công cụ và nguồn

Đã đọc hai tài liệu người dùng cung cấp: DESIGN-OS-3D-GUIDE.md và model-structure-standard.md. design-os local revision đúng `0fa32f46f261009f14cf318c8c4b3137f210a667`; Blender portable 5.2.2 chạy read-only từ thư mục dự án cũ, mọi output ở workspace này. Không cần thư mục cũ để chạy web/build; chỉ cần cấu hình Blender executable khác khi dựng lại.

In-app browser tool không bootstrap được vì môi trường báo thiếu sandboxPolicy; dùng Playwright Chrome headless thay thế, đã lưu ảnh/báo cáo. Dev server từng cần escalation do esbuild sandbox read denial. Dependency Vite đã cập nhật 7.3.6; npm audit khi cài báo 0 vulnerabilities.
