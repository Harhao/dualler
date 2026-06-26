/**
 * Minimal DOM type declarations for runtime code that runs in WebView.
 * These are not part of the Node.js compiler but are needed for
 * browser-targeted runtime modules.
 */

interface EventListener {
  (evt: Event): void;
}

interface EventListenerObject {
  handleEvent(evt: Event): void;
}

type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

interface AddEventListenerOptions {
  passive?: boolean;
  once?: boolean;
  capture?: boolean;
}

interface EventListenerOptions {
  capture?: boolean;
}

interface Event {
  type: string;
}

interface Node {
  nodeType: number;
  parentNode: Node | null;
  firstChild: Node | null;
  lastChild: Node | null;
  appendChild<T extends Node>(node: T): T;
  insertBefore<T extends Node>(node: T, child: Node | null): T;
  removeChild<T extends Node>(node: T): T;
}

interface HTMLElement extends Node {
  style: CSSStyleDeclaration;
  scrollTop: number;
  firstElementChild: HTMLElement | null;
  lastElementChild: HTMLElement | null;
  innerHTML: string;
  id: string;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

interface CSSStyleDeclaration {
  position: string;
  overflow: string;
  height: string;
  top: string;
  width: string;
}

interface Document {
  getElementById(elementId: string): HTMLElement | null;
  createElement(tagName: string): HTMLElement;
}

interface Window {
  __dualler_virtual_list__?: any;
}

declare var document: Document;
declare var window: Window;
