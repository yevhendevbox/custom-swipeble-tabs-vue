import bus from '@/utils/bus'
import { _stopPropagation } from '@/utils/stopPropagation'
import { SlideType } from '@/utils/const_var'
import { nextTick } from 'vue'
import { _css } from '@/utils/dom'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function checkEvent(e) {
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
  if (!isMobile || (isMobile && e instanceof PointerEvent)) {
    e.touches = [
      {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
      },
    ]
  }
  return true
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function slideInit(el: HTMLElement, state) {
  state.wrapper.width = _css(el, 'width')
  state.wrapper.height = _css(el, 'height')
  nextTick(() => {
    state.wrapper.childrenLength = el.children.length
  })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const t = getSlideOffset(state, el)
  let dx1 = 0,
    dx2 = 0
  if (state.type === SlideType.HORIZONTAL) dx1 = t
  else dx2 = t
  _css(el, 'transform', `translate3d(${dx1}px, ${dx2}px, 0)`)
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function canSlide(state) {
  if (state.needCheck) {
    if (
      Math.abs(state.move.x) > state.judgeValue ||
      Math.abs(state.move.y) > state.judgeValue
    ) {
      const angle =
        (Math.abs(state.move.x) * 10) / (Math.abs(state.move.y) * 10)
      state.next = state.type === SlideType.HORIZONTAL ? angle > 1 : angle <= 1

      state.needCheck = false
    } else {
      return false
    }
  }
  return state.next
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
function canNext(state, isNext) {
  return !(
    (state.localIndex === 0 && !isNext) ||
    (state.localIndex === state.wrapper.childrenLength - 1 && isNext)
  )
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function slideTouchStart(e, el, state) {
  if (!checkEvent(e)) return
  _css(el, 'transition-duration', `0ms`)
  state.start.x = e.touches[0].pageX
  state.start.y = e.touches[0].pageY
  state.start.time = Date.now()
  state.isDown = true
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function slideTouchMove(e, el, state,
  canNextCb = null,
  notNextCb = null,
  slideOtherDirectionCb = null,
) {
  if (!checkEvent(e)) return
  if (!state.isDown) return

  state.move.x = e.touches[0].pageX - state.start.x
  state.move.y = e.touches[0].pageY - state.start.y

  const canSlideRes = canSlide(state)

  const isNext =
    state.type === SlideType.HORIZONTAL ? state.move.x < 0 : state.move.y < 0

  if (state.type === SlideType.VERTICAL_INFINITE) {
    if (canSlideRes && state.localIndex === 0 && !isNext) {
      bus.emit(state.name + '-moveY', state.move.y)
    }
  }

  if (canSlideRes) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!canNextCb) canNextCb = canNext
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (canNextCb(state, isNext)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      window.isMoved = true

      _stopPropagation(e)
      if (state.type === SlideType.HORIZONTAL) {
        bus.emit(state.name + '-moveX', state.move.x)
      }
      const t =
        getSlideOffset(state, el) +
        (isNext ? state.judgeValue : -state.judgeValue)
      let dx1 = 0,
        dx2 = 0
      if (state.type === SlideType.HORIZONTAL) {
        dx1 = t + state.move.x
      } else {
        dx2 = t + state.move.y
      }
      _css(el, 'transition-duration', `0ms`)
      _css(el, 'transform', `translate3d(${dx1}px, ${dx2}px, 0)`)
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      notNextCb?.()
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    slideOtherDirectionCb?.(e)
  }
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function slideTouchEnd(e, state,
  canNextCb = null,
  nextCb = null,
  notNextCb = null,
) {
  if (!checkEvent(e)) return
  if (!state.isDown) return

  if (state.next) {
    const isHorizontal = state.type === SlideType.HORIZONTAL
    const isNext = isHorizontal ? state.move.x < 0 : state.move.y < 0
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (!canNextCb) canNextCb = canNext
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (canNextCb(state, isNext)) {
      const endTime = Date.now()
      let gapTime = endTime - state.start.time
      const distance = isHorizontal ? state.move.x : state.move.y
      const judgeValue = isHorizontal
        ? state.wrapper.width
        : state.wrapper.height
      if (Math.abs(distance) < 20) gapTime = 1000
      if (Math.abs(distance) > judgeValue / 3) gapTime = 100
      if (gapTime < 150) {
        if (isNext) {
          state.localIndex++
        } else {
          state.localIndex--
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return nextCb?.(isNext)
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return notNextCb?.()
    }
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    notNextCb?.()
  }
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function slideReset(e, el, state, emit = null) {
  if (!checkEvent(e)) return

  _css(el, 'transition-duration', `300ms`)
  const t = getSlideOffset(state, el)
  let dx1 = 0
  let dx2 = 0
  if (state.type === SlideType.HORIZONTAL) {
    bus.emit(state.name + '-end', state.localIndex)
    dx1 = t
  } else {
    bus.emit(state.name + '-end')
    dx2 = t
  }
  _css(el, 'transform', `translate3d(${dx1}px, ${dx2}px, 0)`)
  state.start.x =
    state.start.y =
    state.start.time =
    state.move.x =
    state.move.y =
      0
  state.next = false
  state.needCheck = true
  state.isDown = false
  // e.target.style.pointerEvents = null
  setTimeout(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window.isMoved = false
  }, 200)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  emit?.('update:index', state.localIndex)
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export function getSlideOffset(state, el: HTMLDivElement) {
  if (state.type === SlideType.HORIZONTAL) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    let widths = []
    Array.from(el.children).map(v => {
      widths.push(v.getBoundingClientRect().width)
    })
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    widths = widths.slice(0, state.localIndex)
    if (widths.length) {
      return -widths.reduce((a, b) => a + b)
    }
    return 0
  } else {
    if (state.type === SlideType.VERTICAL_INFINITE) {
      return -state.localIndex * state.wrapper.height
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      let heights = []
      Array.from(el.children).map(v => {
        heights.push(v.getBoundingClientRect().height)
      })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      heights = heights.slice(0, state.localIndex)
      if (heights.length) return -heights.reduce((a, b) => a + b)
      return 0
    }
  }
}
