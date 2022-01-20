export interface DbnkCtx {
  [key: string]: DbnkCtxPart;
}

export interface DbnkCtxPart {
  cmd?: string;
  var?: {
    [key: string]: string;
  };
  ctx?: DbnkCtx;
}
