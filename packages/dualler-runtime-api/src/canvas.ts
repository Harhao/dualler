export interface CanvasContext {
  setId(id: string): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  fill(): void;
  rect(x: number, y: number, width: number, height: number): void;
  arc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): void;
  setStrokeStyle(color: string): void;
  setFillStyle(color: string): void;
  setFontSize(fontSize: number): void;
  draw(preserve?: boolean, callback?: () => void): void;
}

export function createCanvasContext(id: string, _selector?: string): CanvasContext {
  return {
    setId(_id: string): void {
      console.log(`[canvas] setId: ${_id}`);
    },
    moveTo(x: number, y: number): void {
      console.log(`[canvas] moveTo(${x}, ${y})`);
    },
    lineTo(x: number, y: number): void {
      console.log(`[canvas] lineTo(${x}, ${y})`);
    },
    stroke(): void {
      console.log('[canvas] stroke()');
    },
    fill(): void {
      console.log('[canvas] fill()');
    },
    rect(x: number, y: number, w: number, h: number): void {
      console.log(`[canvas] rect(${x}, ${y}, ${w}, ${h})`);
    },
    arc(cx: number, cy: number, r: number, start: number, end: number): void {
      console.log(`[canvas] arc(${cx}, ${cy}, ${r}, ${start}, ${end})`);
    },
    setStrokeStyle(color: string): void {
      console.log(`[canvas] setStrokeStyle: ${color}`);
    },
    setFillStyle(color: string): void {
      console.log(`[canvas] setFillStyle: ${color}`);
    },
    setFontSize(fontSize: number): void {
      console.log(`[canvas] setFontSize: ${fontSize}`);
    },
    draw(preserve?: boolean, callback?: () => void): void {
      console.log(`[canvas] draw(preserve=${preserve})`);
      callback?.();
    },
  };
}
