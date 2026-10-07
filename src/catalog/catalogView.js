import { MODEL_CATALOG } from './models.js';

export function resolveCatalogAsset(path, baseUrl = '/') {
  return path.startsWith('data:') ? path : `${baseUrl}${path}`;
}

function cardMarkup(model, baseUrl) {
  const action = model.available
    ? '<span class="catalog-card__action">Mở mô hình <span aria-hidden="true">↗</span></span>'
    : '<span class="catalog-card__action catalog-card__action--disabled" aria-disabled="true">Đang phát triển</span>';
  const content = `
    <div class="catalog-card__visual">
      <img src="${resolveCatalogAsset(model.image, baseUrl)}" alt="${model.imageAlt}">
      <span class="catalog-card__index">${model.index}</span>
      <span class="catalog-card__status"><i></i>${model.status}</span>
    </div>
    <div class="catalog-card__body">
      <p>${model.category}</p>
      <h2>${model.title}</h2>
      <div class="catalog-card__footer"><span>${model.description}</span>${action}</div>
    </div>`;
  if (model.available) {
    const href = `${baseUrl.replace(/\/?$/, '/')}models/${model.id}`;
    return `<a class="catalog-card" href="${href}" data-open-model="${model.id}">${content}
  </a>`;
  }
  return `<article class="catalog-card catalog-card--pending">${content}
  </article>`;
}

export function shouldInterceptCatalogNavigation(event, link, protocol = globalThis.location?.protocol) {
  if (event.defaultPrevented || event.button !== 0 || link.target?.toLowerCase() === '_blank') return false;
  if (protocol === 'file:') return true;
  return !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
}

export function createCatalogClickHandler({ onOpen, protocol = globalThis.location?.protocol } = {}) {
  return (event) => {
    const link = event.target.closest?.('[data-open-model]');
    if (!link || !onOpen || !shouldInterceptCatalogNavigation(event, link, protocol)) return;
    event.preventDefault();
    onOpen(link.dataset.openModel);
  };
}

export function renderCatalogMarkup(baseUrl = '/') {
  return `<main class="catalog-shell">
    <header class="catalog-header">
      <a class="catalog-brand" href="/" data-catalog-home aria-label="Bộ sưu tập mô hình 3D, trang chính">
        <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="8" cy="8" r="5"/><circle cx="24" cy="8" r="5"/><circle cx="8" cy="24" r="5"/><circle cx="24" cy="24" r="5"/><path d="m8 8 16 16M8 24 24 8"/></svg>
        <strong>MODEL<span> / COLLECTION</span></strong>
      </a>
      <div class="catalog-header__meta"><i></i> INTERACTIVE LAB <b>V.02</b></div>
    </header>
    <section class="catalog-intro">
      <div><p class="catalog-kicker"><span></span> BỘ SƯU TẬP MÔ HÌNH 3D</p><h1>Chọn một hệ thống<br>để khám phá<span>.</span></h1></div>
      <p>Quan sát cấu tạo, tách từng cụm và tìm hiểu nguyên lý hoạt động qua các mô hình tương tác.</p>
    </section>
    <section class="catalog-grid" aria-label="Danh sách mô hình">
      ${MODEL_CATALOG.map((model) => cardMarkup(model, baseUrl)).join('')}
    </section>
    <footer class="catalog-footer"><span>${String(MODEL_CATALOG.length).padStart(2,'0')} MÔ HÌNH</span><span>THIẾT KẾ NGUYÊN BẢN <i>·</i> WEBGL</span></footer>
  </main>`;
}

export function mountCatalog({ root = document.querySelector('#app'), baseUrl = '/', onOpen }) {
  root.innerHTML = renderCatalogMarkup(baseUrl);
  document.body.dataset.screen = 'catalog';
  delete document.body.dataset.mode;
  delete document.body.dataset.ready;
  const abort = new AbortController();
  root.addEventListener('click', createCatalogClickHandler({ onOpen }), { signal: abort.signal });
  return () => {
    abort.abort();
    root.replaceChildren();
  };
}
