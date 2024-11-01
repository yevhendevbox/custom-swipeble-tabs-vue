export function _css(el: HTMLElement, key: string, value?: string) {
  const reg = /^-?\d+.?\d*(px|pt|em|rem|vw|vh|%|rpx|ms)$/i
  if (value === undefined) {
    let val: string | null = null
    if ('getComputedStyle' in window) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      val = window.getComputedStyle(el, null)[key]
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      val = el.style[key]
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return reg.test(val) ? parseFloat(val) : val
    // return parseFloat(val)
  } else {
    if (
      [
        'top',
        'left',
        'bottom',
        'right',
        'width',
        'height',
        'font-size',
        'margin',
        'padding',
      ].includes(key)
    ) {
      if (!reg.test(value)) {
        if (!String(value).includes('calc')) {
          value += 'px'
        }
      }
    }
    // console.log(value)
    if (key === 'transform') {
      //直接设置不生效
      el.style.webkitTransform =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        el.style.MsTransform =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        el.style.msTransform =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        el.style.MozTransform =
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        el.style.OTransform =
        el.style.transform =
          value
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      el.style[key] = value
    }
  }
}
