export interface TuiDocPageBase {
    readonly section?: string;
    readonly title: string;
}

export interface TuiDocPage extends TuiDocPageBase {
    readonly route: string;
    readonly keywords?: string;
}

export interface TuiDocPageGroup extends TuiDocPageBase {
    readonly subPages: ReadonlyArray<TuiDocPage>;
}

export type RawLoaderContent = Promise<{default: string}> | string;

export type TuiDocExample = Record<string, RawLoaderContent>;
