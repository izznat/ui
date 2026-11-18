import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";

export type HTMLProps<T = any> = JSX.HTMLAttributes<T>;

export type ComponentRenderFn<Props, State> = (props: Props, state: State) => JSX.Element;

export type BaseUIEvent<E extends Event> = E & {
  preventBaseUIHandler: () => void;
  readonly baseUIHandlerPrevented?: boolean | undefined;
};

type WithPreventBaseUIHandler<T> = T extends (event: infer E) => any
  ? E extends Event
    ? (event: BaseUIEvent<E>) => ReturnType<T>
    : T
  : T extends undefined
    ? undefined
    : T;

/**
 * Adds a `preventBaseUIHandler` method to all event handlers.
 */
export type WithBaseUIEvent<T> = {
  [K in keyof T]: WithPreventBaseUIHandler<T[K]>;
};

export type BaseUIComponentProps<
  ElementType extends ValidComponent,
  State,
  RenderFunctionProps = HTMLProps,
> = WithBaseUIEvent<Omit<ComponentProps<ElementType>, "class" | "style">> & {
  /**
   * CSS class applied to the element, or a function that
   * returns a class based on the component's state.
   */
  class?: JSX.ClassValue | ((state: State) => JSX.ClassValue) | undefined;
  /**
   * Allows you to replace the component's HTML element
   * with a different tag, or compose it with another component.
   *
   * Accepts a function that returns the element to render.
   */
  render?: ComponentRenderFn<RenderFunctionProps, State> | undefined;
  /**
   * Style applied to the element, or a function that
   * returns a style object based on the component's state.
   */
  style?: JSX.CSSProperties | ((state: State) => JSX.CSSProperties | undefined) | undefined;
};

export interface NativeButtonProps {
  /**
   * Whether the component renders a native `<button>` element when replacing it
   * via the `render` prop.
   *
   * Set to `false` if the rendered element is not a button (for example, `<div>`).
   * @default true
   */
  nativeButton?: boolean | undefined;
}

/**
 * Simplifies the display of a type (without modifiying it).
 * Taken from https://effectivetypescript.com/2022/02/25/gentips-4-display/
 */
export type Simplify<T> = T extends Function ? T : { [K in keyof T]: T[K] };

/**
 * Makes specified keys in a type required.
 *
 * @template T - The original type.
 * @template K - The key to make required.
 */
export type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;
