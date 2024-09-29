declare module '@editorjs/editorjs'
declare module '@editorjs/header'
declare module '@editorjs/list'
declare module '@editorjs/checklist'
declare module '@editorjs/quote'
declare module '@editorjs/warning'
declare module '@editorjs/marker'
declare module '@editorjs/code'
declare module '@editorjs/delimiter'
declare module '@editorjs/inline-code'
declare module '@editorjs/link'
declare module '@editorjs/image'
declare module '@editorjs/table'

declare module '@editorjs/embed' {
  export default class Embed {
    constructor(options: {
      config?: {
        services?: {
          [key: string]: {
            regex: RegExp;
            embedUrl: string;
            html: string;
            height?: number | string;
            width?: number | string;
            id: (matches: string[]) => string;
          } | boolean;
        };
      };
    });
  }
}

interface EditorConfig {
  holder: string;
  placeholder?: string;
  tools: {
    [key: string]: any;
  };
  onChange?: (api: EditorJS, event: CustomEvent) => void;
  onReady?: () => void;
}

declare module '@editorjs/editorjs' {
  export default class EditorJS {
    constructor(config: EditorConfig);
    save(): Promise<any>;
  }
}

declare module '@editorjs/header' {
  import { BlockTool, BlockToolData } from '@editorjs/editorjs';

  export interface HeaderData extends BlockToolData {
    text: string;
    level: number;
  }

  export default class Header implements BlockTool {
    constructor({ data, config, api, readOnly }: any);
    render(): HTMLElement;
    save(blockContent: HTMLElement): HeaderData;
    validate(savedData: HeaderData): boolean;
    renderSettings(): HTMLElement;
    static get toolbox(): {
      icon: string;
      title: string;
    };
  }
}