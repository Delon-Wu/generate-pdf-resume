// ===== 格式化日期：'2024-03' → '2024年3月' =====
export function fmtDate(dateStr) {
  if (!dateStr) return ''
  const [y, m] = dateStr.split('-')
  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  return `${y}年${months[parseInt(m) - 1]}`
}
