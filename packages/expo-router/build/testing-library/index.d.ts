import './expect';
import { render } from '@testing-library/react-native';
import { FileStub } from './context-stubs';
export * from '@testing-library/react-native';
type RenderRouterOptions = Parameters<typeof render>[1] & {
    initialUrl?: any;
};
type Result = ReturnType<typeof render> & {
    getPathname(): string;
    getPathnameWithParams(): string;
    getSegments(): string[];
    getSearchParams(): Record<string, string | string[]>;
};
export declare function getMockContext(context: string | Record<string, FileStub> | {
    appDir: string;
    overrides: Record<string, FileStub>;
}): import("../types").RequireContext;
export declare function renderRouter(context?: string, options?: RenderRouterOptions): Result;
export declare function renderRouter(context: Record<string, FileStub>, options?: RenderRouterOptions): Result;
export declare function renderRouter(context: {
    appDir: string;
    overrides: Record<string, FileStub>;
}, options?: RenderRouterOptions): Result;
export declare const testRouter: {
    /** Navigate to the provided pathname and the pathname */
    navigate(path: string): void;
    /** Push the provided pathname and assert the pathname */
    push(path: string): void;
    /** Replace with provided pathname and assert the pathname */
    replace(path: string): void;
    /** Go back in history and asset the new pathname */
    back(path: string): void;
    /** If there's history that supports invoking the `back` function. */
    canGoBack(): boolean;
    /** Update the current route query params and assert the new pathname */
    setParams(params?: Record<string, string>): void;
};
//# sourceMappingURL=index.d.ts.map