# Bằng chứng kiểm chứng — 2026-10-04

Asset cuối SHA256: `106e1ba567b29a506fd287287081b4acaed9b4b645ea263414e49fd1752c8dda`.

Kết quả cuối: **12/12 Node tests**, **34/34 browser checks trên production preview localhost:4173**, không page exception. `npm ci` và `npm run build` trong `.test-build` với node_modules mới thành công; bằng chứng `output/clean-build.json`. Bản production trong `dist/` đã đồng bộ source cuối. Esbuild cần chạy ngoài sandbox ở môi trường Codex Windows này do lỗi quyền đọc thư mục cha; không phải lỗi dependency thiếu.

## Model

Blender 5.2.2 LTS, design-os revision đã kiểm tra bằng Git. Dựng native Python, lưu `.blend`, export GLB và reimport vào Blender process trống. `blender/drone/verification-report.json` xác nhận 15 assembly, 76 mesh, 94.068 tam giác, geometry/transform hữu hạn, material tồn tại, kích thước rest khoảng 0,453 × 0,365 × 0,124 m và pivot motor/gimbal. Kích thước là thiết kế minh họa, không số đo sản phẩm thật.

Ảnh Cycles CPU 900×700, 24 samples: `output/blender-final/{front,rear,top,internals}.png`. Đã xem các ảnh và ảnh Three.js, kiểm tra silhouette, đĩa cánh rời nhau, chân nối tay đòn, các cụm điện tử và camera. Receipt gắn SHA asset. Ảnh `output/blender/` là pre-change, SHA khác, không chứng minh asset cuối.

## Chuyển động/tương tác

Node tests kiểm tra runtime độc lập, dispose lặp, load lỗi/abort, highlight không lan sang cụm khác, reset không làm mất placement, socket/pivot, dấu pitch/roll/yaw, pause/slow và interlock tách–bay. Có regression cho việc bấm đổi mode nhanh rồi quay lại bay, trước sửa đã tái hiện bước nhảy pose.

`output/validation/browser-report.json` ghi kết quả chạy thật Chrome: direct mesh picking, orbit, hide/isolate, gimbal, slider/auto, 8 tình huống, pause/slow/reset, missing asset UI, dispose, tài nguyên cùng origin. Viewport 1440×960 và cảm ứng giả lập 390×844, 320×740, 844×390. Không tràn ngang; hình nằm trong frustum ở pose lắp. Chưa kiểm tra Safari/iOS hay GPU điện thoại thật.

Lần đo desktop ban đầu: median frame interval khoảng 16,7 ms; giá trị chịu ảnh hưởng headless, máy và cache. Không coi đây là benchmark điện thoại hay FPS đảm bảo. Báo cáo browser chứa số đo chạy gần nhất, loadMs và drawCalls scene thực. Model 76 draw calls cơ sở; scene với cả hai luồng minh họa đã đo 122 calls (không đồng nghĩa tất cả pass shadow).

## Tách cấu tạo: phạm vi và hạn chế

`motion-diagnostic.json` kiểm tra BVH surface intersection ở 21 mức từ 0 đến 1. Không còn giao cắt vỏ–pin hoặc vỏ–gimbal sau chỉnh hình học. Không có giao cắt được phát hiện từ mức 0,40 đến 1,00 ở các mẫu.

Vẫn có giao cắt cục bộ gần trạng thái lắp: shell_upper/frame và shell_lower/frame ở t=0; frame/battery đến 0,25; frame/gimbal đến 0,15; frame/motor đến 0,35; flight_controller/esc đến 0,30. Các vùng tiếp giáp và chi tiết lắp ghép đơn giản hóa chưa được xây thành dung sai CAD/boolean hoàn chỉnh. Vì vậy yêu cầu tuyệt đối “không xuyên nhau” chưa được chứng minh và chưa đạt ở các vùng này. Báo cáo diagnostic là số đo, không gate clearance đã pass; BVH bề mặt cũng không phát hiện mọi containment hoặc va chạm giữa hai mẫu.

## Các đơn giản hóa khác

- Vỏ có bề dày và gân; một số khe thông gió là inset tối, không khoét thông thật.
- Winding và điện tử thể hiện cấu trúc/chức năng, không sơ đồ điện sản xuất. Dây công suất đi cùng khung; khi tách thể hiện ngắt kết nối, không mô phỏng dây đàn hồi.
- Quỹ đạo, độ nghiêng và chuyển tiếp được lập trình; mixer đúng dấu cơ bản nhưng không là solver khí động học, dynamics 6DOF hay autopilot PID.
- Không kiểm chứng tải, nhiệt, tuổi pin, hiệu suất, độ bền hoặc khả năng bay. Manufacture NOT_REQUESTED.
- Review subagent không hoàn thành do giới hạn sử dụng; đã tự rà và chạy regression, không ghi là có review độc lập.

Nguồn kỹ thuật: [ArduPilot motor layout](https://ardupilot.org/copter/docs/connect-escs-and-motors.html), [Copter motor library](https://ardupilot.org/dev/docs/code-overview-copter-motors-library.html), [MathWorks flight control](https://www.mathworks.com/videos/drone-simulation-and-control-part-1-setting-up-the-control-problem-1539323440930.html). Thiết kế hình học nguyên bản, không suy diễn cấu tạo thương hiệu từ các nguồn này.
