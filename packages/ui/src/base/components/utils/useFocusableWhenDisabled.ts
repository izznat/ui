import { createMemo, createProjection, merge } from "solid-js";

export function useFocusableWhenDisabled(
  parameters: UseFocusableWhenDisabledParameters,
): UseFocusableWhenDisabledReturnValue {
  parameters = merge({ composite: false, tabIndex: 0 }, parameters);

  const isFocusableComposite = createMemo(
    () => parameters.composite && parameters.focusableWhenDisabled !== false,
  );
  const isNonFocusableComposite = createMemo(
    () => parameters.composite && parameters.focusableWhenDisabled === false,
  );

  // we can't explicitly assign `undefined` to any of these props because it
  // would otherwise prevent subsequently merged props from setting them
  const props = createProjection<FocusableWhenDisabledProps>(() => {
    const additionalProps = {
      // allow Tabbing away from focusableWhenDisabled elements
      onKeyDown(event: KeyboardEvent) {
        if (parameters.disabled && parameters.focusableWhenDisabled && event.key !== "Tab") {
          event.preventDefault();
        }
      },
    } as FocusableWhenDisabledProps;

    if (!parameters.composite) {
      if (!parameters.isNativeButton && parameters.disabled) {
        additionalProps.tabIndex = parameters.focusableWhenDisabled ? parameters.tabIndex : -1;
      } else {
        additionalProps.tabIndex = parameters.tabIndex;
      }
    }

    if (
      (parameters.isNativeButton && (parameters.focusableWhenDisabled || isFocusableComposite())) ||
      (!parameters.isNativeButton && parameters.disabled)
    ) {
      additionalProps["aria-disabled"] = parameters.disabled;
    }

    if (
      parameters.isNativeButton &&
      (!parameters.focusableWhenDisabled || isNonFocusableComposite())
    ) {
      additionalProps.disabled = parameters.disabled;
    }

    return additionalProps;
  }, {} as FocusableWhenDisabledProps);

  return { props };
}

interface FocusableWhenDisabledProps {
  "aria-disabled"?: boolean | undefined;
  disabled?: boolean | undefined;
  tabIndex?: number;
  onKeyDown: (event: KeyboardEvent) => void;
}

export interface UseFocusableWhenDisabledParameters {
  /**
   * Whether the component should be focusable when disabled.
   * When `undefined`, composite items are focusable when disabled by default.
   */
  focusableWhenDisabled?: boolean | undefined;
  /**
   * The disabled state of the component.
   */
  disabled: boolean;
  /**
   * Whether this is a composite item or not.
   * @default false
   */
  composite?: boolean | undefined;
  /**
   * @default 0
   */
  tabIndex?: number | undefined;
  /**
   * @default true
   */
  isNativeButton: boolean;
}

export interface UseFocusableWhenDisabledReturnValue {
  props: FocusableWhenDisabledProps;
}

export interface UseFocusableWhenDisabledState {}
