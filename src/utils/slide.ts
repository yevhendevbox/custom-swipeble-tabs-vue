import bus from '@/utils/bus'
import { _stopPropagation } from '@/utils/stopPropagation'
import { SlideType } from '@/utils/const_var'
import { nextTick } from 'vue'
import { _css } from '@/utils/dom'

import { useBaseValues } from '@/composables/useBaseValues'

interface CustomPointerEvent extends PointerEvent {
  touches?: Array<{ clientX: number; clientY: number; pageX: number; pageY: number }>;
}

declare global {
  interface Window {
    isMoved: boolean;
  }
}

interface StateInterface {
  judgeValue: number;
  type: number;
  name: string;
  localIndex: number;
  needCheck: boolean;
  next: boolean;
  isDown: boolean;
  start: {
    x: number;
    y: number;
    time: number
  };
  move: {
    x: number;
    y: number
  };
  wrapper: {
    width: number;
    height: number;
    childrenLength: number
  }
}

const { toggleVerticalScroll } = useBaseValues()

function checkEvent(e: CustomPointerEvent): boolean {
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

  if (!isMobile || (isMobile && e instanceof PointerEvent)) {
    e.touches = [
      {
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
      },
    ];
  }

  return true;
}

export function slideInit(el: HTMLElement, state: StateInterface) {
  state.wrapper.width = _css(el, 'width') as number
  state.wrapper.height = _css(el, 'height') as number
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

export function canSlide(state: StateInterface) {
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

function canNext(state: StateInterface, isNext: boolean) {
  return !(
    (state.localIndex === 0 && !isNext) ||
    (state.localIndex === state.wrapper.childrenLength - 1 && isNext)
  )
}

export function slideTouchStart(e: CustomPointerEvent, el: HTMLElement | null, state: StateInterface) {
  if (!checkEvent(e)) return

  if (el) {
    _css(el, 'transition-duration', `0ms`)
  }

  if (e.touches) {
    state.start.x = e.touches[0].pageX
    state.start.y = e.touches[0].pageY
    state.start.time = Date.now()
    state.isDown = true
  }
}

export function slideTouchMove(
  e: CustomPointerEvent,
  el: HTMLElement | null,
  state: StateInterface,
  canNextCb?: (state: StateInterface, isNext: boolean) => boolean,
  notNextCb?: () => void,
  slideOtherDirectionCb?: (e: CustomPointerEvent) => void
): void {
  if (!checkEvent(e)) return;
  if (!state.isDown) return;

  if (e.touches) {
    state.move.x = e.touches[0].pageX - state.start.x;
    state.move.y = e.touches[0].pageY - state.start.y;
  }


  const canSlideRes = canSlide(state);

  const isNext =
    state.type === SlideType.HORIZONTAL ? state.move.x < 0 : state.move.y < 0;

  if (state.type === SlideType.VERTICAL_INFINITE) {
    if (canSlideRes && state.localIndex === 0 && !isNext) {
      bus.emit(state.name + '-moveY', state.move.y);
    }
  }

  if (canSlideRes) {
    if (!canNextCb) canNextCb = canNext;

    if (canNextCb(state, isNext)) {
      window.isMoved = true;

      _stopPropagation(e);
      if (state.type === SlideType.HORIZONTAL) {
        bus.emit(state.name + '-moveX', state.move.x);
        toggleVerticalScroll()
      }
      const t =
        getSlideOffset(state, el as HTMLDivElement) +
        (isNext ? state.judgeValue : -state.judgeValue);
      let dx1 = 0,
        dx2 = 0;
      if (state.type === SlideType.HORIZONTAL) {
        dx1 = t + state.move.x;
      } else {
        dx2 = t + state.move.y;
      }

      if (el) {
        _css(el, 'transition-duration', `0ms`);
        _css(el, 'transform', `translate3d(${dx1}px, ${dx2}px, 0)`);
      }
    } else {
      notNextCb?.();
    }
  } else {
    slideOtherDirectionCb?.(e);
  }
}

export function slideTouchEnd(
  e: CustomPointerEvent,
  state: StateInterface,
  canNextCb?: (state: StateInterface, isNext: boolean) => boolean,
  nextCb?: (isNext: boolean) => void,
  notNextCb?: () => void
): void {
  if (!checkEvent(e)) return;
  if (!state.isDown) return;

  if (state.next) {
    const isHorizontal = state.type === SlideType.HORIZONTAL;
    const isNext = isHorizontal ? state.move.x < 0 : state.move.y < 0;

    if (!canNextCb) canNextCb = canNext;

    if (canNextCb(state, isNext)) {
      const endTime = Date.now();
      let gapTime = endTime - state.start.time;
      const distance = isHorizontal ? state.move.x : state.move.y;
      const judgeValue = isHorizontal ? state.wrapper.width : state.wrapper.height;

      if (Math.abs(distance) < 20) gapTime = 1000;
      if (Math.abs(distance) > judgeValue / 3) gapTime = 100;

      if (gapTime < 150) {
        if (isNext) {
          state.localIndex++;
        } else {
          state.localIndex--;
        }
        return nextCb?.(isNext);
      }
    } else {
      return notNextCb?.();
    }
  } else {
    notNextCb?.();
  }
}

export function slideReset(
  e: CustomPointerEvent,
  el: HTMLElement,
  state: StateInterface,
  // eslint-disable-next-line
  emit?: (event: string, value?: any) => void
): void {
  if (!checkEvent(e)) return;

  _css(el, 'transition-duration', `300ms`);
  const t = getSlideOffset(state, el as HTMLDivElement);
  let dx1 = 0;
  let dx2 = 0;

  if (state.type === SlideType.HORIZONTAL) {
    bus.emit(state.name + '-end', state.localIndex);
    dx1 = t;
  } else {
    bus.emit(state.name + '-end');
    dx2 = t;
  }

  _css(el, 'transform', `translate3d(${dx1}px, ${dx2}px, 0)`);

  // Reset state values
  state.start.x = 0;
  state.start.y = 0;
  state.start.time = 0;
  state.move.x = 0;
  state.move.y = 0;
  state.next = false;
  state.needCheck = true;
  state.isDown = false;

  setTimeout(() => {
    window.isMoved = false;

    if (state.type === SlideType.HORIZONTAL) {
      toggleVerticalScroll()
    }
  }, 200);

  emit?.('update:index', state.localIndex);
}

export function getSlideOffset(state: StateInterface, el: HTMLDivElement) {
  if (state.type === SlideType.HORIZONTAL) {

    let widths: number[] = []
    Array.from(el.children).map(v => {
      widths.push(v.getBoundingClientRect().width)
    })

    widths = widths.slice(0, state.localIndex)
    if (widths.length) {
      return -widths.reduce((a, b) => a + b)
    }
    return 0
  } else {
    if (state.type === SlideType.VERTICAL_INFINITE) {
      return -state.localIndex * state.wrapper.height
    } else {

      let heights: number[] = []
      Array.from(el.children).map(v => {
        heights.push(v.getBoundingClientRect().height)
      })
      heights = heights.slice(0, state.localIndex)
      if (heights.length) return -heights.reduce((a, b) => a + b)
      return 0
    }
  }
}
