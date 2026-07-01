export interface ChooseImageOptions {
  count?: number;
  sizeType?: ('original' | 'compressed')[];
  sourceType: ('album' | 'camera')[];
  success?: (res: { tempFilePaths: string[]; tempFiles: any[] }) => void;
  fail?: (err: any) => void;
  complete?: () => void;
}

export function chooseImage(options: ChooseImageOptions): void {
  console.log(`[media] chooseImage(count=${options.count ?? 9}, sourceType=${JSON.stringify(options.sourceType)})`);
  // Placeholder: in a real bridge implementation this would invoke the native image picker
  const tempFilePaths: string[] = [];
  const tempFiles: any[] = [];
  options.success?.({ tempFilePaths, tempFiles });
  options.complete?.();
}

export interface ChooseVideoOptions {
  success?: (res: { tempFilePath: string; duration: number; height: number; width: number }) => void;
  fail?: (err: any) => void;
  complete?: () => void;
}

export function chooseVideo(options: ChooseVideoOptions): void {
  console.log('[media] chooseVideo');
  options.success?.({ tempFilePath: '', duration: 0, height: 0, width: 0 });
  options.complete?.();
}
