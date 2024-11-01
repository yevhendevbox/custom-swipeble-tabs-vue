export function _stopPropagation(e: Event) {
  e.stopImmediatePropagation()
  e.stopPropagation()
  e.preventDefault()
}
