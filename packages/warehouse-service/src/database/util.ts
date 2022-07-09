export const DEFAULT_PAGINATION_LIMIT = 20;
export const MAX_PAGINATION_LIMIT = 100;

export function getPaginationLimit(limit?: string): number {
  const paginationLimit = parseInt(limit || '', 10) || DEFAULT_PAGINATION_LIMIT;
  return Math.min(paginationLimit, MAX_PAGINATION_LIMIT);
}
