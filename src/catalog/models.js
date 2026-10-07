export const MODEL_CATALOG = Object.freeze([
  Object.freeze({
    id: 'drone',
    index: '01',
    title: 'AERO Q4',
    category: 'Drone bốn cánh',
    description: 'Khám phá cấu tạo, tách lắp từng cụm và quan sát nguyên lý điều khiển bay.',
    status: 'Có thể khám phá',
    available: true,
    image: 'images/catalog/drone.png',
    imageAlt: 'Drone AERO Q4 nhìn từ góc chéo phía trước',
  }),
  Object.freeze({
    id: 'hydroelectric',
    index: '02',
    title: 'Nhà máy thủy điện',
    category: 'Hệ thống năng lượng',
    description: 'Theo dòng nước qua đập, đường ống áp lực, turbine, máy phát và kết nối lưới điện.',
    status: 'Có thể khám phá',
    available: true,
    image: 'images/catalog/hydroelectric.png',
    imageAlt: 'Ngoại thất nhà máy thủy điện: hồ chứa, đập, nhà máy và trạm biến áp',
  }),
  Object.freeze({
    id: 'wind-turbine', index: '03', title: 'Tua-bin gió', category: 'Hệ thống năng lượng',
    description: 'Khám phá cánh, hộp số và máy phát. Điều chỉnh gió để theo dõi quá trình tạo điện.',
    status: 'Có thể khám phá', available: true, image: 'images/catalog/wind-turbine.png',
    imageAlt: 'Tua-bin gió ba cánh, tháp cao và khoang máy kín',
  }),
  Object.freeze({
    id: 'thermal-power', index: '04', title: 'Nhà máy nhiệt điện', category: 'Hệ thống năng lượng',
    description: 'Theo chu trình nhiệt, hơi, turbine và điện. Khám phá hai vòng nước và hệ thống làm mát.',
    status: 'Có thể khám phá', available: true, image: 'images/catalog/thermal-power.png',
    imageAlt: 'Nhà máy nhiệt điện gồm lò hơi, tổ máy, ống khói và tháp giải nhiệt',
  }),
  Object.freeze({
    id: 'wireless-charging', index: '05', title: 'Sạc không dây', category: 'Truyền năng lượng',
    description: 'Tách điện thoại và đế sạc để thấy hai cuộn dây. Khám phá cảm ứng điện từ, độ lệch và khoảng cách sạc.',
    status: 'Có thể khám phá', available: true, image: 'images/catalog/wireless-charging.png',
    imageAlt: 'Điện thoại và đế sạc tròn với hai cuộn dây đồng cảm ứng đối diện',
  }),
  Object.freeze({
    id: 'inline-four-engine', index: '06', title: 'Động cơ đốt trong', category: 'Cơ khí & năng lượng',
    description: 'Bốn xi-lanh, một trục khuỷu. Theo dõi chu trình 720°, bộ cam và xem riêng từng xi-lanh.',
    status: 'Có thể khám phá', available: true, image: 'images/catalog/inline-four-engine.png',
    imageAlt: 'Động cơ xăng bốn xi-lanh với trục khuỷu, bộ phối khí và bánh đà',
  }),
]);

export function getModelById(id) {
  return MODEL_CATALOG.find((model) => model.id === id);
}
