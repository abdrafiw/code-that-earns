import '@testing-library/jest-dom/jest-globals';

// jsdom implements neither the Pointer Capture API nor scrollIntoView; Radix
// primitives (Select, DropdownMenu, Popover) call into both when opening.
if (typeof Element !== 'undefined') {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.scrollIntoView = () => {};
}

// jsdom has no PointerEvent constructor; userEvent@14+ dispatches real
// PointerEvents (pointerdown/pointerup) that Radix triggers listen for.
if (typeof MouseEvent !== 'undefined' && !global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    pointerId?: number;
    pointerType?: string;
    constructor(type: string, props: PointerEventInit = {}) {
      super(type, props);
      this.pointerId = props.pointerId;
      this.pointerType = props.pointerType;
    }
  }
  // @ts-expect-error - partial polyfill, enough for Radix/testing-library
  global.PointerEvent = PointerEvent;
}

// jsdom has no ResizeObserver; Radix Popper uses it to compute dropdown
// position when the trigger opens.
if (!global.ResizeObserver) {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
