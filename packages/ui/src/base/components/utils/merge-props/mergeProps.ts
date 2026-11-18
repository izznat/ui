import { type Component } from "solid-js";
import type { BaseUIEvent, WithBaseUIEvent } from "../../internals/types";
import type { ComponentProps, JSX, ValidComponent } from "@solidjs/web";

type PropsOf<T extends ValidComponent> = WithBaseUIEvent<ComponentProps<T>>;
type InputProps<T extends ValidComponent> =
  | PropsOf<T>
  | ((otherProps: PropsOf<T>) => PropsOf<T>)
  | undefined;

const EMPTY_PROPS = {};

/**
 * Merges multiple sets of React props. It follows the Object.assign pattern where thr rightmost
 */
export function mergeProps<T extends ValidComponent>(
  a: InputProps<T>,
  b: InputProps<T>,
  c: InputProps<T>,
  d: InputProps<T>,
  e: InputProps<T>,
): PropsOf<T>;
export function mergeProps<T extends ValidComponent>(
  a: InputProps<T>,
  b: InputProps<T>,
  c: InputProps<T>,
  d: InputProps<T>,
): PropsOf<T>;
export function mergeProps<T extends ValidComponent>(
  a: InputProps<T>,
  b: InputProps<T>,
  c: InputProps<T>,
): PropsOf<T>;
export function mergeProps<T extends ValidComponent>(
  a: InputProps<T>,
  b: InputProps<T>,
): PropsOf<T>;
export function mergeProps(a: any, b: any, c?: any, d?: any, e?: any) {
  if (!c && !d && !e && !a) {
    return createInitialMergedProps(b);
  }

  // We need to mutably own `merged`.
  let merged = createInitialMergedProps(a);

  if (b) {
    merged = mergeInto(merged, b);
  }

  if (c) {
    merged = mergeInto(merged, c);
  }

  if (d) {
    merged = mergeInto(merged, d);
  }

  if (e) {
    merged = mergeInto(merged, e);
  }

  return merged;
}

export function mergePropsN<T extends ValidComponent>(props: InputProps<T>[]): PropsOf<T> {
  if (props.length === 0) {
    return EMPTY_PROPS as PropsOf<T>;
  }
  if (props.length === 1) {
    return createInitialMergedProps(props[0]) as PropsOf<T>;
  }

  // We need to mutably own `merged`.
  let merged = createInitialMergedProps(props[0]);

  for (let i = 1; i < props.length; i += 1) {
    merged = mergeInto(merged, props[i]);
  }

  return merged as PropsOf<T>;
}

function createInitialMergedProps<T extends ValidComponent>(inputProps: InputProps<T>) {
  if (isPropsGetter(inputProps)) {
    // Getter-returned handlers intentionally keep their existing sematics.
    return { ...inputProps(EMPTY_PROPS as PropsOf<T>) };
  }

  return copyInitialProps(inputProps);
}

function mergeInto<T extends ValidComponent>(
  merged: Record<string, any>,
  inputProps: InputProps<T>,
) {
  if (isPropsGetter(inputProps)) {
    return inputProps(merged as PropsOf<T>);
  }
  return mutablyMergeInto(merged, inputProps);
}

function copyInitialProps<T extends ValidComponent>(inputProps: ComponentProps<T> | undefined) {
  const copiedProps = { ...inputProps } as Record<string, any>;

  // `copiedProps` is our fresh own-object copy, so iterating with `for...in` is safe here.
  for (const propName in copiedProps) {
    const propValue = copiedProps[propName];
    if (isEventHandler(propName, propValue)) {
      copiedProps[propName] = wrapEventHandler(propValue);
    }
  }

  return copiedProps;
}

function mutablyMergeInto<T extends ValidComponent>(
  mergedProps: Record<string, any>,
  externalProps: ComponentProps<T> | undefined,
) {
  if (!externalProps) {
    return mergedProps;
  }

  for (const propName in externalProps) {
    const externalPropValue = externalProps[propName];

    switch (propName) {
      case "style": {
        mergedProps[propName] = mergeObjects(
          mergedProps.style as JSX.CSSProperties | undefined,
          externalPropValue as JSX.CSSProperties | undefined,
        );
        break;
      }
      case "class": {
        mergedProps[propName] = mergeClasses(
          mergedProps.class,
          externalPropValue as JSX.ClassValue,
        );
        break;
      }
      default: {
        if (isEventHandler(propName, externalPropValue)) {
          mergedProps[propName] = mergeEventHandlers(mergedProps[propName], externalPropValue);
        } else {
          mergedProps[propName] = externalPropValue;
        }
      }
    }
  }

  return mergedProps;
}

function mergeObjects<A extends object | undefined, B extends object | undefined>(a: A, b: B) {
  if (a && !b) {
    return a;
  }
  if (!a && b) {
    return b;
  }
  if (a || b) {
    return { ...a, ...b };
  }
  return undefined;
}

function isPropsGetter<T extends Component>(
  inputProps: InputProps<T>,
): inputProps is (props: PropsOf<T>) => PropsOf<T> {
  return typeof inputProps === "function";
}

function isEventHandler(key: string, value: unknown) {
  // This approach is more efficient than using a regex.
  const code0 = key.charCodeAt(0);
  const code1 = key.charCodeAt(1);
  const code2 = key.charCodeAt(2);
  return (
    code0 === 111 /* o */ &&
    code1 === 110 /* n */ &&
    code2 >= 65 /* A */ &&
    code2 <= 90 /* Z */ &&
    (typeof value === "function" || typeof value === "undefined")
  );
}

function mergeEventHandlers(ourHandler: Function | undefined, theirHandler: Function | undefined) {
  if (!theirHandler) {
    return ourHandler;
  }

  if (!ourHandler) {
    return wrapEventHandler(theirHandler);
  }

  return (...args: unknown[]) => {
    const event = args[0];

    if (event instanceof Event) {
      const baseUIEvent = event as BaseUIEvent<typeof event>;

      makeEventPreventable(baseUIEvent);

      const result = theirHandler(...args);

      if (!baseUIEvent.baseUIHandlerPrevented) {
        ourHandler?.(...args);
      }

      return result;
    }

    const result = theirHandler(...args);
    ourHandler?.(...args);
    return result;
  };
}

function wrapEventHandler(handler: Function | undefined) {
  if (!handler) {
    return handler;
  }

  return (...args: unknown[]) => {
    const event = args[0];

    if (event instanceof Event) {
      makeEventPreventable(event as BaseUIEvent<typeof event>);
    }

    return handler(...args);
  };
}

export function makeEventPreventable<T extends Event>(event: BaseUIEvent<T>) {
  event.preventBaseUIHandler = () => {
    (event.baseUIHandlerPrevented as boolean) = true;
  };

  return event;
}

export function mergeClasses(ourClass: JSX.ClassValue, theirClass: JSX.ClassValue): JSX.ClassValue {
  return [theirClass, ourClass];
}
