function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function safeToken(value, name) {
  if (!/^[a-z][a-z0-9-]*$/.test(value)) {
    throw new TypeError(`${name} must be a lowercase HTML token`);
  }
  return value;
}

export function modelHeader({
  modeAttribute,
  brand,
  code,
  principleLabel = 'Nguyên lý',
  version = 'V.02',
  thirdModeValue = 'principle',
}) {
  const attribute = safeToken(modeAttribute, 'modeAttribute');
  const thirdMode = safeToken(thirdModeValue, 'thirdModeValue');
  const modes = [
    ['explore', 'Khám phá'],
    ['explode', 'Tách cấu tạo'],
    [thirdMode, principleLabel],
  ];
  const buttons = modes.map(([mode, label], index) => `
      <button type="button" data-${attribute}="${mode}" aria-pressed="${mode === 'explore'}">
        <small>0${index + 1}</small><span>${escapeHtml(label)}</span>
      </button>`).join('');

  return `<header class="model-header">
    <a class="model-header__home" href="/" data-exit-model aria-label="Về bộ sưu tập">← <span>Bộ sưu tập</span></a>
    <strong class="model-header__brand">${escapeHtml(brand)} <em>/ ${escapeHtml(code)}</em></strong>
    <nav class="model-header__modes" aria-label="Chế độ mô hình">${buttons}
    </nav>
    <span class="model-header__edition">INTERACTIVE LAB <b>${escapeHtml(version)}</b></span>
  </header>`;
}

export function flowDiagram(stages, accessibleLabel = 'Chu\u1ed7i chuy\u1ec3n \u0111\u1ed5i n\u0103ng l\u01b0\u1ee3ng') {
  return `<ol class="model-flow-diagram" aria-label="${escapeHtml(accessibleLabel)}">${stages
    .map((stage, index) => `<li>${index ? '<i aria-hidden="true">→</i>' : ''}<span>${escapeHtml(stage)}</span></li>`)
    .join('')}</ol>`;
}

export function flowLegend(items) {
  return `<ul class="model-flow-legend" aria-label="Chú giải luồng">${items
    .map(({ label, kind }) => {
      const token = safeToken(kind, 'kind');
      return `<li><i class="model-flow-dot model-flow-dot--${token}" aria-hidden="true"></i>${escapeHtml(label)}</li>`;
    })
    .join('')}</ul>`;
}
