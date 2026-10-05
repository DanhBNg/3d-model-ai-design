import { getModelById } from '../catalog/models.js';

function normalizeBase(base = '/') {
  const withLeadingSlash = base.startsWith('/') ? base : `/${base}`;
  return withLeadingSlash === '/' ? '/' : `${withLeadingSlash.replace(/\/+$/, '')}/`;
}

export function resolveRoute(pathname, base = '/') {
  const normalizedBase = normalizeBase(base);
  let localPath = pathname || '/';
  if (normalizedBase !== '/' && localPath.startsWith(normalizedBase)) {
    localPath = `/${localPath.slice(normalizedBase.length)}`;
  }
  localPath = `/${localPath.replace(/^\/+|\/+$/g, '')}`;
  if (localPath === '/') return { name: 'catalog' };
  const match = localPath.match(/^\/models\/([^/]+)$/);
  if (!match) return { name: 'catalog' };
  const model = getModelById(decodeURIComponent(match[1]));
  return model?.available ? { name: 'model', modelId: model.id } : { name: 'catalog' };
}

export function pathForModel(modelId, base = '/') {
  const normalizedBase = normalizeBase(base);
  return `${normalizedBase === '/' ? '' : normalizedBase.slice(0, -1)}/models/${encodeURIComponent(modelId)}`;
}

export function catalogPath(base = '/') {
  return normalizeBase(base);
}
