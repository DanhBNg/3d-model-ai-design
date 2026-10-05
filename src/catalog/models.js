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
]);

export function getModelById(id) {
  return MODEL_CATALOG.find((model) => model.id === id);
}
