# Bộ sưu tập mô hình 3D — Drone và Năng lượng

Ứng dụng Three.js độc lập, giao diện tiếng Việt, gồm bốn mô hình: Drone AERO Q4, Thủy điện HYDRO 01, Tua-bin gió VENTO 03 và Nhiệt điện THERMO 04. Có khám phá, tách cấu tạo và nguyên lý vận hành; source Blender, GLB, factory/runtime, controller và viewer tách riêng.

Nhiệt điện có ngoại thất kín, 26 cụm, turbine cao áp/hạ áp nhiều tầng, máy phát, lò, bình ngưng và tháp giải nhiệt. Mở vỏ hoặc chọn góc **Tổ máy** để xem nội thất. **Nguyên lý** có sáu bài học, tuyến hơi/tái nhiệt, nước cấp, làm mát và điện riêng; chỉnh tải, dừng/chạy, tua chậm. Hướng dẫn và các giản lược: [docs/thermal-power.md](docs/thermal-power.md).

Tua-bin gió mới dùng tháp dài và cánh lớn, góc mặc định tập trung rotor và cắt phần chân. Nút **Khoang máy** mở vỏ/phóng gần nội thất; **Toàn bộ** xem toàn tháp. Chỉnh tốc độ/hướng gió, xem quay hướng, góc cánh và phát điện trong **Nguyên lý**. Source và giới hạn: [docs/wind-turbine.md](docs/wind-turbine.md). Lệnh asset: `npm run wind:build`, `npm run wind:verify`, `npm run wind:render`; kiểm tra viewer: `npm run test:wind` khi preview đang chạy.

Thủy điện đã bổ sung chi tiết kiến trúc/thiết bị và hướng dẫn nguyên lý 5 bước. Vào **Nguyên lý**, chọn bước **01–05**, dùng **Xem vị trí** để xem gần hoặc **Tự chuyển bước** để theo dõi toàn bộ chuỗi chuyển đổi năng lượng. Xem chi tiết và giới hạn trong [docs/hydroelectric.md](docs/hydroelectric.md).

Bản theo ảnh mặt cắt có cửa nhận thấp, lưới chắn rác, ống hút cong mở rộng dưới turbine và **nước 3D**. Nút **▤ Mặt cắt đường nước** mở công trình và chuyển góc nhìn. Mũi tên line mảnh chỉ dòng nước/điện, chuyển động theo lưu lượng; tạm dừng và tua chậm áp dụng cả nước. Thủy điện và tua-bin dùng nét line thay cho hạt tròn để phần nguyên lý gọn hơn. Hiệu ứng được dựng bằng Three.js, không dùng video hay dịch vụ bên ngoài.

## Danh sách và đường dẫn

- `/` — danh sách bốn mô hình.
- `/models/thermal-power` — THERMO 04, tổ máy nhiệt điện than với chu trình hơi tái nhiệt.
- `/models/wind-turbine` — VENTO 03, tua-bin gió ba cánh có hộp số.
- `/models/drone` — viewer drone hoàn chỉnh; dùng nút **← Bộ sưu tập** để quay lại.
- `/models/hydroelectric` — nhà máy thủy điện: mặc định ngoại thất kín; mở mái/cắt lớp để thấy ống áp lực và tổ máy Francis.

Ứng dụng dùng History API với URL sạch, không có dấu `#`. Khi mở bản HTML offline qua `file://`, việc chuyển màn hình diễn ra nội bộ trong cùng file để tránh làm hỏng đường dẫn.

## Chạy và build

Yêu cầu Node.js 22.12+ (đã kiểm tra Node 24), npm, trình duyệt hỗ trợ WebGL2.

```sh
npm ci
npm run dev -- --port 5173
# Mở http://127.0.0.1:5173
npm test
npm run build
npm run preview -- --port 4173
```

`dist/` là bản web build, không thay thế source. Phải mở qua HTTP, không mở `index.html` bằng file://. Runtime không cần CDN, font, decoder hay texture ngoài; chỉ các liên kết tài liệu tham khảo cần mạng. Cài npm lần đầu cần mạng. Không push/deploy trong quá trình bàn giao.

## HTML gửi riêng

`npm run export:html` tạo `output/share/Model-Collection.html`, nhúng catalog, ảnh đại diện, Three.js, CSS và cả bốn GLB. Người nhận mở bằng Chrome/Edge có WebGL2, không cần server hoặc mạng. Liên kết tài liệu tham khảo vẫn cần internet. Kiểm tra bằng `node scripts/check-offline-html.mjs`. Source editable vẫn ở dự án.

## Nhà máy nhiệt điện

```sh
npm run thermal:build
npm run thermal:verify
npm run thermal:render
# Khi preview đang chạy tại cổng 4173:
npm run test:thermal
```

Source: `blender/thermal-power/`, `src/models/thermal-power/`, `src/experiences/thermal-power/`. File chỉnh sửa: `blender/thermal-power/thermal-power.blend`. Asset: **45.816 tam giác, 74 mesh, 1.322.668 byte GLB**; ngân sách còn 134.184 tam giác và 6.677.332 byte. Đây là mô hình giáo dục; thông số 100 MW/36% và chuyển tiếp vận hành được giản lược, không phải mô phỏng nhiệt động nhà máy thật.

## Nhà máy thủy điện

Ngoại thất gồm hồ chứa, đập, tuyến tràn, nhà máy chân đập, kênh trả nước, máy biến áp và đường dây. `Xem bên trong` mở mái/phần bao che; `Tách cấu tạo` tách nắp, rotor, stator và cụm turbine theo thứ tự. `Nguyên lý` lắp lại trước khi chạy, cho chỉnh cánh hướng/cột nước, xem lưu lượng/công suất/RPM, ngắt tải, pause và tua chậm.

```sh
npm run hydro:build
npm run hydro:verify
npm run hydro:render
# Khi preview đang chạy tại cổng 4173:
npm run test:hydro
```

Source: `blender/hydroelectric/`, `src/models/hydroelectric/`, `src/experiences/hydroelectric/`. Asset: `public/models/hydroelectric.glb`; file chỉnh sửa: `blender/hydroelectric/hydroelectric.blend`. Xem [contract, nguyên lý và giới hạn](docs/hydroelectric.md).

Model thủy điện: **30.062 tam giác, 99 mesh, 1.204.400 byte GLB**, không texture ảnh; còn 149.938 tam giác và 6.795.600 byte so với ngân sách 180k/8 MB. Đây là sa bàn tỷ lệ giản lược, không phải bản vẽ xây dựng hay mô phỏng CFD. Chưa kiểm chứng va chạm liên tục của toàn bộ quá trình tháo; mobile kiểm tra bằng Chrome giả lập, chưa thử thiết bị thật/Safari.

## Cấu trúc source

```text
blender/drone/        build.py, geometry.py, materials.py, details.py
                     drone.blend, báo cáo, verify.py, render.py
public/models/       drone.glb; drone-blockout.glb (mốc hình khối)
src/models/drone/    loadModel.js, materials.js, metadata.js,
                     controller.js, flight.js
src/catalog/         registry, giao diện danh sách và CSS responsive
src/app/             router dùng History API, không dùng hash
src/experiences/     vòng đời gắn/tháo từng viewer
src/viewer/          studio.js, ui.js, picking.js, effects.js, responsive.css
scripts/             runner Blender, kiểm tra browser
tests/               runtime, controller, dấu mô-men và hành vi
docs/                thiết kế, runtime, kiểm chứng và giới hạn
output/              ảnh và báo cáo kiểm chứng
```

Factory không tạo DOM/render loop. Controller không gắn input. Viewer sở hữu camera, ánh sáng, input và vòng frame. Contract `root.userData.sculptRuntime` version 1 có registries độc lập cho từng instance. Xem [runtime](docs/runtime.md).

## Dựng lại asset

Blender **5.2.2 LTS**; phiên bản và nguồn tải khóa trong `tools/blender-toolchain.json`. Pipeline áp dụng [design-os-3d-blender](https://github.com/jangtrinh/design-os-3d-blender), revision `0fa32f46f261009f14cf318c8c4b3137f210a667`. Không cần MCP hay cài repo công cụ để chạy lại các script của dự án.

PowerShell:

```powershell
$env:BLENDER_BIN = 'C:\duong-dan\blender.exe'
npm run model:build
npm run model:verify
node scripts/write-assembly-manifest.mjs
node scripts/build-model.mjs --motion
npm run model:render
```

Hoặc tạo `tools/local.json` chứa `{"blenderBin":"đường/dẫn/blender.exe"}`. File này chỉ cấu hình máy, bị gitignore; source không phụ thuộc dự án cũ. Script dựng ghi lại `drone.blend` và GLB, vì vậy hãy lưu bản riêng nếu chỉnh tay trong Blender. File `.blend` được giữ trong bộ bàn giao. `--blockout` dựng lại mốc hình khối.

Geometry, vật liệu PBR và hierarchy đều được dựng bằng Python native; không tải mesh/vendor asset. Blender đổi tọa độ web `(x,y,z)` thành `(x,-z,y)` rồi xuất GLB Y-up. Không Draco/meshopt, không decoder cần tải thêm.

## Thao tác

- Kéo để orbit, cuộn/chụm để zoom; chọn trực tiếp hoặc qua danh sách. `Ẩn vỏ`, `Xem riêng` và góc camera có nút riêng.
- Tách cấu tạo: slider 0–100%, tự chạy hai chiều, đặt lại. Chi tiết con đi cùng cụm cha.
- Nguyên lý bay: cất cánh, treo, tiến/lùi, trái/phải, xoay trái/phải. Chọn năng lượng/tín hiệu/cả hai; có RPM giả định, chiều quay và vector lực đẩy. Tạm dừng, 0,25× và reset.
- Chuyển vào bay tự lắp model; khi quay lại tách cấu tạo sẽ khôi phục mức tách. Model trở về vị trí trước khi tách ra. Chọn camera/gimbal để chỉnh pitch.

## Kiểm chứng và giới hạn

Model: **94.068 tam giác, 76 mesh, 3.342.068 byte GLB**, không texture ảnh. Ngân sách đặt ra: <120k tam giác, <5 MB GLB; còn khoảng 25.932 tam giác và 1,66 MB. Scene có thêm draw call cho shadow/đường minh họa. Xem [báo cáo](docs/verification.md) và `output/validation/browser-report.json`.

Đã kiểm tra Chrome desktop và viewport cảm ứng giả lập; chưa kiểm tra điện thoại thật/Safari. Không suy ra FPS điện thoại từ desktop. Model là minh họa giáo dục, không phải mô phỏng khí động học chính xác hay thiết kế chế tạo. Các bề mặt lắp ghép còn giao nhau cục bộ ở trạng thái gần lắp; báo cáo 21 mẫu không chứng minh clearance liên tục. Chi tiết phạm vi trong báo cáo.

Kiểm tra browser (cần server đang chạy và Chrome cài sẵn):

```sh
npm run test:browser
# PowerShell, để kiểm tra build production:
# $env:DEMO_URL='http://127.0.0.1:4173'; npm run test:browser
```

`BROWSER_CHANNEL=msedge` có thể dùng Edge; chưa được kiểm thử trong lần bàn giao. Ảnh cuối nằm ở `output/validation/` và `output/blender-final/`; ảnh `blockout-*`, `output/blender/`, `output/review/` là các mốc trước, không dùng làm bằng chứng asset cuối.
