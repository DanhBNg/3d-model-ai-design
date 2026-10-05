# Nhà máy thủy điện — thiết kế triển khai

Người dùng đã yêu cầu triển khai sau khi chốt collection và chọn Astra 6 medium. Thiết kế tiếp nối phương án cutaway đã trao đổi. Purpose: interactive educational web asset, not manufacturing.

## Điều chỉnh người dùng đã duyệt

Ngoại thất phải kín và gần bố cục thực tế; không lộ ống áp lực/tổ máy ở lần mở đầu. Chỉ mở công trình khi chọn xem bên trong, tách cấu tạo hoặc nguyên lý. Dựng thêm facade, conduit_cover, spillway và cảnh quan. Mặt cắt khối bao che phục vụ trình bày, không phải kiến trúc xây dựng chi tiết.

## Phạm vi

Một nhà máy nguyên bản, một tổ máy Francis trục đứng. Diorama hồ chứa → cửa nhận nước → ống áp lực → buồng xoắn/cánh hướng → bánh công tác → ống hút/kênh trả nước. Turbine và rotor máy phát chung trục; stator đứng yên. Điện đi qua máy biến áp đến đường dây.

Ba chế độ: khám phá/chọn/ẩn công trình/xem riêng; tách lắp có slider và autoplay; nguyên lý với mở cánh hướng, cột nước, công suất, hòa lưới/ngắt tải, pause/slow/reset. Chỉ chạy dòng năng lượng khi lắp hoàn chỉnh. Chuyển chế độ êm, giữ mức tách để trở lại.

Hình học dùng mét theo tỷ lệ diorama minh họa; kích thước máy được phóng đại so với đập, không suy ra công suất từ tỷ lệ geometry. Thông số minh họa: H 20–80 m, Q tối đa 12 m³/s ở H=50 m, hiệu suất tổng cố định 0,88. Công suất P=ρgQHη. Hòa lưới 50 Hz, 20 cực, n=300 rpm; renderer giảm tốc hiển thị. Không mô phỏng CFD, nước va, điện từ quá độ hoặc bộ điều tốc công nghiệp.

## Source và runtime

`blender/hydroelectric/`: geometry.py, materials.py, civil.py, machinery.py, build.py, verify.py, render.py, hydroelectric.blend, build-report.json.
`public/models/hydroelectric.glb`: asset độc lập, không decoder/CDN.
`src/models/hydroelectric/`: metadata.js, loadModel.js, materials.js, simulation.js, controller.js.
`src/experiences/hydroelectric/`: viewer/studio, UI, effects, lifecycle, CSS. Không đưa DOM vào model/controller.

Runtime schemaVersion 1: nodes, meshes, pivots, sockets, assemblies/rest transforms, bounds, stats, provenance, highlight, idempotent dispose. Không chia sẻ mutable materials giữa instance. Route sạch `/models/hydroelectric`; cập nhật catalog, exporter offline và docs.

## Kiểm chứng

Dựng blockout và render kiểm tra trước; thêm chi tiết, export và import lại GLB, đo triangles/bounds/hierarchy/finite values. Ngân sách <180k triangles, <8 MB GLB. Render front/rear/top/detail. Test vật lý giản lược, coaxial pivots, reset/placement/instance/dispose, lắp trước vận hành. Browser kiểm tra chọn, tách, flow, load rejection, route/back, desktop/mobile và offline không mạng. Báo hạn chế thật.

## Nguồn nguyên lý

- https://www.energy.gov/cmei/water/how-hydropower-works
- https://www.energy.gov/cmei/water/types-hydropower-turbines
- https://www.usbr.gov/lc/hooverdam/faqs/powerfaq.html

Nguồn xác nhận chuỗi năng lượng và cấu tạo Francis; hình học tự thiết kế, không sao chép một nhà máy cụ thể.
