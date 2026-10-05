# Runtime và chuyển động

```js
import { loadDroneModel } from '../src/models/drone/loadModel.js';
import { createDroneController } from '../src/models/drone/controller.js';
const root = await loadDroneModel({url:'/models/drone.glb', signal});
scene.add(root);
const runtime = root.userData.sculptRuntime;
const controller = createDroneController(root);
controller.setMode('flight');
controller.play('forward');
// Trong render loop của ứng dụng, dt tính bằng giây:
controller.update(dt);
// Khi tháo: dừng loop/input, tháo scene rồi giải phóng:
scene.remove(root);
controller.dispose();
runtime.dispose();
```

`loadDroneModel` cũng nhận `{buffer: ArrayBuffer}`. Mỗi lần parse tạo instance và tài nguyên riêng. Abort được kiểm tra trước/sau parse, kết quả lỗi thời được dispose. GLB thiếu assembly/pivot bị từ chối. Không có skeleton; các khớp cứng được animate procedural.

`coordinates`: mét, +Y lên, -Z trước, gốc ground_center. Transform của `root` do ứng dụng quản lý; `runtime.nodes.flightRoot` do controller quản lý. Reset không xóa placement của ứng dụng.

Registries `nodes`, `meshes` (mảng mesh theo cụm), `pivots`, `sockets`, `assemblies`, `animations`, `colliders` (rỗng) đều có. `assemblies` chứa node, parent, restPosition/restQuaternion/restScale, offset và stage. Bounds là model-local/rest, không bao phủ mọi pose. Không serialize runtime vào JSON hoặc clone bằng `root.clone()`.

Các part ID nằm trong `metadata.js`: hai nắp, frame, battery, flight_controller, esc, gimbal, bốn motor và bốn prop. Rotor nằm dưới motor, cánh có pivot riêng đồng trục. Gimbal yaw → roll → pitch. Socket inspect nằm dưới cụm tương ứng. Geometry merge chỉ trong cùng parent/material, không gộp khớp chuyển động.

Controller API: `setMode(explore|explode|flight)`, `select(id|null)`, `setCoversHidden(bool)`, `isolate(id|null)`, `setExplode(0..1)`, `setAuto(bool)`, `setPlaying(bool)`, `setSpeed(0.1..2)`, `setGimbalTilt(radian)`, `play(action)`, `reset()`, `update(dt)`, `dispose()`. Action không tồn tại trả false. Play một tình huống đang chạy sẽ restart và blend từ pose hiện tại. `play('explode')` chọn mode và tự tách/lắp. API `play` tình huống bay đặt tình huống, cần mode flight để chạy.

Pause đóng băng thời gian bay và góc rotor; chuyển mode/lắp lại vẫn có thể tiếp tục. Reset tức thì, dừng play/auto, trả pose gốc; giữ mode, tình huống, selection và tùy chọn visibility. Explode được lưu để quay lại sau flight. Controller kẹp dt ≤ 0,05 s, do đó khi tab bị nền hoặc máy quá chậm, thời gian mô phỏng không nhảy bù. `state` phục vụ đọc cho UI, không sửa trực tiếp.

Quỹ đạo là chuyển động minh họa hữu hạn: tăng tốc → hãm → giữ; không teleport loop. Cặp FL/RR quay CW, FR/RL CCW nhìn từ trên. Đánh số M1–M4 là của demo, không phải số cổng autopilot. Dấu mô-men tính từ r×F và phản lực rotor; tốc độ chuẩn hóa = sqrt(lực đẩy chuẩn hóa). RPM hiển thị = tốc độ ×8000, giả định cho giáo dục. Góc cánh hiển thị chậm khoảng 70 lần. Khối lượng, hệ số lực đẩy và PID thực tế không được hiệu chuẩn.

Hiệu ứng năng lượng dùng socket động: pin→ESC→motor→cánh. Nhánh FC→motor biểu diễn tác động điều khiển hiệu dụng thông qua ESC, không phải cáp nguồn trực tiếp. Gimbal chống góc thân gần đúng, giới hạn yaw ±0,6 rad; không phải bộ ổn định thương mại mô phỏng chính xác.
