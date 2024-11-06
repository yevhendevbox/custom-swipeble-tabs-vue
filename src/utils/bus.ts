type EventType = string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => void;

export default {
  eventMap: new Map(),
  on(eventType: EventType, cb: Callback): void {
    let cbs = this.eventMap.get(eventType);
    if (cbs) {
      cbs.push(cb);
    } else {
      cbs = [cb];
    }
    if (cbs.length > 10) {
      console.error('Too many listeners added for event:', eventType);
    }
    this.eventMap.set(eventType, cbs);
  },
  once(eventType: EventType, cb: Callback) {
    this.eventMap.set(eventType, [cb])
  },
  off(eventType: EventType, fn: Callback) {
    const cbs = this.eventMap.has(eventType)
    if (cbs) {
      if (fn) {
        const cbs: Callback[] = this.eventMap.get(eventType)
        const rIndex = cbs.findIndex(v => v === fn)
        if (rIndex > -1) {
          cbs.splice(rIndex, 1)
        }
        this.eventMap.set(eventType, cbs)
      } else {
        this.eventMap.delete(eventType)
      }
    }
  },
  // offAll() {
  //   this.eventMap = new Map()
  // },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(eventType: EventType, val?: any) {
    const cbs: Callback[] = this.eventMap.get(eventType)
    if (cbs) {
      cbs.map(cb => cb(val))
    }
  },
}

export const EVENT_KEY = {
  SINGLE_CLICK: 'SINGLE_CLICK',
  SINGLE_CLICK_BROADCAST: 'SINGLE_CLICK_BROADCAST',
  ENTER_FULLSCREEN: 'ENTER_FULLSCREEN',
  EXIT_FULLSCREEN: 'EXIT_FULLSCREEN',
  TOGGLE_FULLSCREEN: 'TOGGLE_FULLSCREEN',
  TOGGLE_COMMENT: 'TOGGLE_COMMENT',
  OPEN_COMMENTS: 'OPEN_COMMENTS',
  CLOSE_COMMENTS: 'CLOSE_COMMENTS',
  DIALOG_MOVE: 'DIALOG_MOVE',
  DIALOG_END: 'DIALOG_END',
  OPEN_SUB_TYPE: 'OPEN_SUB_TYPE',
  CLOSE_SUB_TYPE: 'CLOSE_SUB_TYPE',
  ITEM_TOGGLE: 'ITEM_TOGGLE',
  ITEM_PLAY: 'ITEM_PLAY',
  ITEM_STOP: 'ITEM_STOP',
  NAV: 'NAV',
  GO_USERINFO: 'GO_USERINFO',
  SHOW_SHARE: 'SHOW_SHARE',
  UPDATE_ITEM: 'UPDATE_ITEM',
  CURRENT_ITEM: 'CURRENT_ITEM',
  REMOVE_MUTED: 'REMOVE_MUTED',
  HIDE_MUTED_NOTICE: 'HIDE_MUTED_NOTICE',
  TOGGLE_CURRENT_VIDEO: 'TOGGLE_CURRENT_VIDEO',
  SHOW_AUDIO_CALL: 'SHOW_AUDIO_CALL',
}
