/** Fallback types when node_modules is not installed. Run `npm install` for full types. */
declare module "react" {
  export type ReactNode = any;
  export function useState<T>(initial: T | (() => T)): [T, (value: T | ((prev: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export default unknown;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elem: string]: Record<string, unknown>;
  }
}

declare module "react-dom" {
  export function createRoot(container: Element | DocumentFragment): { render(children: unknown): void };
}

declare module "next" {
  export type Metadata = { title?: string; description?: string };
}

declare module "next/server" {
  export class NextResponse {
    static json(body: unknown, init?: ResponseInit): NextResponse;
  }
}
