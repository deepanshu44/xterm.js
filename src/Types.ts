/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */

import { ITerminalOptions as IPublicTerminalOptions, IEventEmitter, IDisposable, IMarker, ISelectionPosition } from 'xterm';
import { ICharset, IAttributeData, ICellData, IBufferLine, CharData } from 'core/Types';
import { ICircularList } from 'common/Types';
import { IEvent } from 'common/EventEmitter2';
import { IColorSet } from 'ui/Types';
import { IOptionsService } from 'common/options/Types';

export type CustomKeyEventHandler = (event: KeyboardEvent) => boolean;

export type LineData = CharData[];

export type LinkMatcherHandler = (event: MouseEvent, uri: string) => void;
export type LinkMatcherValidationCallback = (uri: string, callback: (isValid: boolean) => void) => void;

export type CharacterJoinerHandler = (text: string) => [number, number][];

// BufferIndex denotes a position in the buffer: [rowIndex, colIndex]
export type BufferIndex = [number, number];

/**
 * This interface encapsulates everything needed from the Terminal by the
 * InputHandler. This cleanly separates the large amount of methods needed by
 * InputHandler cleanly from the ITerminal interface.
 */
export interface IInputHandlingTerminal extends IEventEmitter {
  element: HTMLElement;
  options: ITerminalOptions;
  cols: number;
  rows: number;
  charset: ICharset;
  gcharset: number;
  glevel: number;
  charsets: ICharset[];
  applicationKeypad: boolean;
  applicationCursor: boolean;
  originMode: boolean;
  insertMode: boolean;
  wraparoundMode: boolean;
  bracketedPasteMode: boolean;
  curAttrData: IAttributeData;
  savedCols: number;
  x10Mouse: boolean;
  vt200Mouse: boolean;
  normalMouse: boolean;
  mouseEvents: boolean;
  sendFocus: boolean;
  utfMouse: boolean;
  sgrMouse: boolean;
  urxvtMouse: boolean;
  cursorHidden: boolean;

  buffers: IBufferSet;
  buffer: IBuffer;
  viewport: IViewport;
  selectionManager: ISelectionManager;

  bell(): void;
  focus(): void;
  updateRange(y: number): void;
  scroll(isWrapped?: boolean): void;
  setgLevel(g: number): void;
  eraseAttrData(): IAttributeData;
  is(term: string): boolean;
  setgCharset(g: number, charset: ICharset): void;
  resize(x: number, y: number): void;
  log(text: string, data?: any): void;
  reset(): void;
  showCursor(): void;
  refresh(start: number, end: number): void;
  error(text: string, data?: any): void;
  tabSet(): void;
  handler(data: string): void;
  handleTitle(title: string): void;
  index(): void;
  reverseIndex(): void;
}

export interface IViewport extends IDisposable {
  scrollBarWidth: number;
  syncScrollArea(): void;
  getLinesScrolled(ev: WheelEvent): number;
  onWheel(ev: WheelEvent): void;
  onTouchStart(ev: TouchEvent): void;
  onTouchMove(ev: TouchEvent): void;
  onThemeChange(colors: IColorSet): void;
}

export interface ICompositionHelper {
  compositionstart(): void;
  compositionupdate(ev: CompositionEvent): void;
  compositionend(): void;
  updateCompositionElements(dontRecurse?: boolean): void;
  keydown(ev: KeyboardEvent): boolean;
}

/**
 * Calls the parser and handles actions generated by the parser.
 */
export interface IInputHandler {
  parse(data: string): void;
  parseUtf8(data: Uint8Array): void;
  print(data: Uint32Array, start: number, end: number): void;

  /** C0 BEL */ bell(): void;
  /** C0 LF */ lineFeed(): void;
  /** C0 CR */ carriageReturn(): void;
  /** C0 BS */ backspace(): void;
  /** C0 HT */ tab(): void;
  /** C0 SO */ shiftOut(): void;
  /** C0 SI */ shiftIn(): void;

  /** CSI @ */ insertChars(params?: number[]): void;
  /** CSI A */ cursorUp(params?: number[]): void;
  /** CSI B */ cursorDown(params?: number[]): void;
  /** CSI C */ cursorForward(params?: number[]): void;
  /** CSI D */ cursorBackward(params?: number[]): void;
  /** CSI E */ cursorNextLine(params?: number[]): void;
  /** CSI F */ cursorPrecedingLine(params?: number[]): void;
  /** CSI G */ cursorCharAbsolute(params?: number[]): void;
  /** CSI H */ cursorPosition(params?: number[]): void;
  /** CSI I */ cursorForwardTab(params?: number[]): void;
  /** CSI J */ eraseInDisplay(params?: number[]): void;
  /** CSI K */ eraseInLine(params?: number[]): void;
  /** CSI L */ insertLines(params?: number[]): void;
  /** CSI M */ deleteLines(params?: number[]): void;
  /** CSI P */ deleteChars(params?: number[]): void;
  /** CSI S */ scrollUp(params?: number[]): void;
  /** CSI T */ scrollDown(params?: number[], collect?: string): void;
  /** CSI X */ eraseChars(params?: number[]): void;
  /** CSI Z */ cursorBackwardTab(params?: number[]): void;
  /** CSI ` */ charPosAbsolute(params?: number[]): void;
  /** CSI a */ hPositionRelative(params?: number[]): void;
  /** CSI b */ repeatPrecedingCharacter(params?: number[]): void;
  /** CSI c */ sendDeviceAttributes(params?: number[], collect?: string): void;
  /** CSI d */ linePosAbsolute(params?: number[]): void;
  /** CSI e */ vPositionRelative(params?: number[]): void;
  /** CSI f */ hVPosition(params?: number[]): void;
  /** CSI g */ tabClear(params?: number[]): void;
  /** CSI h */ setMode(params?: number[], collect?: string): void;
  /** CSI l */ resetMode(params?: number[], collect?: string): void;
  /** CSI m */ charAttributes(params?: number[]): void;
  /** CSI n */ deviceStatus(params?: number[], collect?: string): void;
  /** CSI p */ softReset(params?: number[], collect?: string): void;
  /** CSI q */ setCursorStyle(params?: number[], collect?: string): void;
  /** CSI r */ setScrollRegion(params?: number[], collect?: string): void;
  /** CSI s */ saveCursor(params?: number[]): void;
  /** CSI u */ restoreCursor(params?: number[]): void;
  /** OSC 0
      OSC 2 */ setTitle(data: string): void;
  /** ESC E */ nextLine(): void;
  /** ESC = */ keypadApplicationMode(): void;
  /** ESC > */ keypadNumericMode(): void;
  /** ESC % G
      ESC % @ */ selectDefaultCharset(): void;
  /** ESC ( C
      ESC ) C
      ESC * C
      ESC + C
      ESC - C
      ESC . C
      ESC / C */ selectCharset(collectAndFlag: string): void;
  /** ESC D */ index(): void;
  /** ESC H */ tabSet(): void;
  /** ESC M */ reverseIndex(): void;
  /** ESC c */ reset(): void;
  /** ESC n
      ESC o
      ESC |
      ESC }
      ESC ~ */ setgLevel(level: number): void;
}

export interface ILinkMatcher {
  id: number;
  regex: RegExp;
  handler: LinkMatcherHandler;
  hoverTooltipCallback?: LinkMatcherHandler;
  hoverLeaveCallback?: () => void;
  matchIndex?: number;
  validationCallback?: LinkMatcherValidationCallback;
  priority?: number;
  willLinkActivate?: (event: MouseEvent, uri: string) => boolean;
}

export interface ILinkifierEvent {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cols: number;
  fg: number;
}

export interface ITerminal extends IPublicTerminal, IElementAccessor, IBufferAccessor, ILinkifierAccessor {
  screenElement: HTMLElement;
  selectionManager: ISelectionManager;
  browser: IBrowser;
  writeBuffer: string[];
  cursorHidden: boolean;
  cursorState: number;
  buffer: IBuffer;
  buffers: IBufferSet;
  isFocused: boolean;
  mouseHelper: IMouseHelper;
  viewport: IViewport;
  bracketedPasteMode: boolean;
  applicationCursor: boolean;
  optionsService: IOptionsService;
  // TODO: We should remove options once components adopt optionsService
  options: ITerminalOptions;

  handler(data: string): void;
  scrollLines(disp: number, suppressScrollEvent?: boolean): void;
  cancel(ev: Event, force?: boolean): boolean | void;
  log(text: string): void;
  showCursor(): void;
}

// Portions of the public API that are required by the internal Terminal
export interface IPublicTerminal extends IDisposable, IEventEmitter {
  textarea: HTMLTextAreaElement;
  rows: number;
  cols: number;
  buffer: IBuffer;
  markers: IMarker[];
  onCursorMove: IEvent<void>;
  onData: IEvent<string>;
  onKey: IEvent<{ key: string, domEvent: KeyboardEvent }>;
  onLineFeed: IEvent<void>;
  onScroll: IEvent<number>;
  onSelectionChange: IEvent<void>;
  onRender: IEvent<{ start: number, end: number }>;
  onResize: IEvent<{ cols: number, rows: number }>;
  onTitleChange: IEvent<string>;
  blur(): void;
  focus(): void;
  resize(columns: number, rows: number): void;
  writeln(data: string): void;
  open(parent: HTMLElement): void;
  attachCustomKeyEventHandler(customKeyEventHandler: (event: KeyboardEvent) => boolean): void;
  addCsiHandler(flag: string, callback: (params: number[], collect: string) => boolean): IDisposable;
  addOscHandler(ident: number, callback: (data: string) => boolean): IDisposable;
  registerLinkMatcher(regex: RegExp, handler: (event: MouseEvent, uri: string) => void, options?: ILinkMatcherOptions): number;
  deregisterLinkMatcher(matcherId: number): void;
  registerCharacterJoiner(handler: (text: string) => [number, number][]): number;
  deregisterCharacterJoiner(joinerId: number): void;
  addMarker(cursorYOffset: number): IMarker;
  hasSelection(): boolean;
  getSelection(): string;
  getSelectionPosition(): ISelectionPosition | undefined;
  clearSelection(): void;
  select(column: number, row: number, length: number): void;
  selectAll(): void;
  selectLines(start: number, end: number): void;
  dispose(): void;
  scrollLines(amount: number): void;
  scrollPages(pageCount: number): void;
  scrollToTop(): void;
  scrollToBottom(): void;
  scrollToLine(line: number): void;
  clear(): void;
  write(data: string): void;
  writeUtf8(data: Uint8Array): void;
  refresh(start: number, end: number): void;
  reset(): void;
}

export interface IBufferAccessor {
  buffer: IBuffer;
}

export interface IElementAccessor {
  readonly element: HTMLElement;
}

export interface ILinkifierAccessor {
  linkifier: ILinkifier;
}

export interface IMouseHelper {
  getCoords(event: { clientX: number, clientY: number }, element: HTMLElement, colCount: number, rowCount: number, isSelection?: boolean): [number, number];
  getRawByteCoords(event: MouseEvent, element: HTMLElement, colCount: number, rowCount: number): { x: number, y: number };
}

// TODO: The options that are not in the public API should be reviewed
export interface ITerminalOptions extends IPublicTerminalOptions {
  [key: string]: any;
  cancelEvents?: boolean;
  convertEol?: boolean;
  debug?: boolean;
  handler?: (data: string) => void;
  screenKeys?: boolean;
  termName?: string;
  useFlowControl?: boolean;
}

export interface IBufferStringIteratorResult {
  range: {first: number, last: number};
  content: string;
}

export interface IBufferStringIterator {
  hasNext(): boolean;
  next(): IBufferStringIteratorResult;
}

export interface IBuffer {
  readonly lines: ICircularList<IBufferLine>;
  ydisp: number;
  ybase: number;
  y: number;
  x: number;
  tabs: any;
  scrollBottom: number;
  scrollTop: number;
  hasScrollback: boolean;
  savedY: number;
  savedX: number;
  savedCurAttrData: IAttributeData;
  isCursorInViewport: boolean;
  translateBufferLineToString(lineIndex: number, trimRight: boolean, startCol?: number, endCol?: number): string;
  getWrappedRangeForLine(y: number): { first: number, last: number };
  nextStop(x?: number): number;
  prevStop(x?: number): number;
  getBlankLine(attr: IAttributeData, isWrapped?: boolean): IBufferLine;
  stringIndexToBufferIndex(lineIndex: number, stringIndex: number): number[];
  iterator(trimRight: boolean, startIndex?: number, endIndex?: number, startOverscan?: number, endOverscan?: number): IBufferStringIterator;
  getNullCell(attr?: IAttributeData): ICellData;
  getWhitespaceCell(attr?: IAttributeData): ICellData;
}

export interface IBufferSet {
  alt: IBuffer;
  normal: IBuffer;
  active: IBuffer;

  onBufferActivate: IEvent<{ activeBuffer: IBuffer, inactiveBuffer: IBuffer }>;

  activateNormalBuffer(): void;
  activateAltBuffer(fillAttr?: IAttributeData): void;
}

export interface ISelectionManager {
  selectionText: string;
  selectionStart: [number, number];
  selectionEnd: [number, number];

  disable(): void;
  enable(): void;
  setSelection(row: number, col: number, length: number): void;
  isClickInSelection(event: MouseEvent): boolean;
  selectWordAtCursor(event: MouseEvent): void;
}

export interface ISelectionRedrawRequestEvent {
  start: [number, number];
  end: [number, number];
  columnSelectMode: boolean;
}

export interface ILinkifier {
  onLinkHover: IEvent<ILinkifierEvent>;
  onLinkLeave: IEvent<ILinkifierEvent>;
  onLinkTooltip: IEvent<ILinkifierEvent>;

  attachToDom(mouseZoneManager: IMouseZoneManager): void;
  linkifyRows(start: number, end: number): void;
  registerLinkMatcher(regex: RegExp, handler: LinkMatcherHandler, options?: ILinkMatcherOptions): number;
  deregisterLinkMatcher(matcherId: number): boolean;
}

export interface ILinkMatcherOptions {
  /**
   * The index of the link from the regex.match(text) call. This defaults to 0
   * (for regular expressions without capture groups).
   */
  matchIndex?: number;
  /**
   * A callback that validates an individual link, returning true if valid and
   * false if invalid.
   */
  validationCallback?: LinkMatcherValidationCallback;
  /**
   * A callback that fires when the mouse hovers over a link.
   */
  tooltipCallback?: LinkMatcherHandler;
  /**
   * A callback that fires when the mouse leaves a link that was hovered.
   */
  leaveCallback?: () => void;
  /**
   * The priority of the link matcher, this defines the order in which the link
   * matcher is evaluated relative to others, from highest to lowest. The
   * default value is 0.
   */
  priority?: number;
  /**
   * A callback that fires when the mousedown and click events occur that
   * determines whether a link will be activated upon click. This enables
   * only activating a link when a certain modifier is held down, if not the
   * mouse event will continue propagation (eg. double click to select word).
   */
  willLinkActivate?: (event: MouseEvent, uri: string) => boolean;
}

export interface IBrowser {
  isNode: boolean;
  userAgent: string;
  platform: string;
  isFirefox: boolean;
  isMSIE: boolean;
  isMac: boolean;
  isIpad: boolean;
  isIphone: boolean;
  isMSWindows: boolean;
}

export interface ISoundManager {
  playBellSound(): void;
}

export interface IMouseZoneManager extends IDisposable {
  add(zone: IMouseZone): void;
  clearAll(start?: number, end?: number): void;
}

export interface IMouseZone {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  clickCallback: (e: MouseEvent) => any;
  hoverCallback: (e: MouseEvent) => any | undefined;
  tooltipCallback: (e: MouseEvent) => any | undefined;
  leaveCallback: () => any | undefined;
  willLinkActivate: (e: MouseEvent) => boolean;
}
