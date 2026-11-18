import { isHTMLElement } from "@floating-ui/utils/dom";
import type { ComponentProps, JSX } from "@solidjs/web";
import type { HTMLProps } from "../types";
import { useCompositeRootContext } from "../composite/root/CompositeRootContext";
import { createMemo, createProjection, createRenderEffect, createSignal, merge } from "solid-js";
import {
  useFocusableWhenDisabled,
  type UseFocusableWhenDisabledParameters,
} from "../../utils/useFocusableWhenDisabled";

export function useButton(parameters: UseButtonParameters = {}): UseButtonReturnValue {
  parameters = merge({ disabled: false, tabIndex: 0, native: true }, parameters);

  const [elementRef, setElementRef] = createSignal<HTMLElement | null>(null);

  const compositeRootContext = useCompositeRootContext(true);
  const isCompositeItem = createMemo(
    () => parameters.composite ?? compositeRootContext !== undefined,
  );

  const useFocusableWhenDisabledParameters = createProjection<UseFocusableWhenDisabledParameters>(
    () => ({
      focusableWhenDisabled: parameters.focusableWhenDisabled,
      disabled: parameters.disabled === undefined ? false : parameters.disabled,
      composite: isCompositeItem(),
      tabIndex: parameters.tabIndex === undefined ? 0 : parameters.tabIndex,
      isNativeButton: parameters.native === undefined ? false : parameters.native,
    }),
    {} as UseFocusableWhenDisabledParameters,
  );

  const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled(
    useFocusableWhenDisabledParameters,
  );

  // handles a disabled composite button rendering another button, e.g.
  // <Toolbar.Button render={(props) => <Menu.Trigger {...props} />} />
  // the `disabled prop needs to pass through 2 `useButton`s then finally
  // delete the `disabled attribute from DOM
  const updateDisabled = () => {
    const element = elementRef();

    if (!isButtonElement(element)) {
      return;
    }

    if (
      isCompositeItem() &&
      parameters.disabled &&
      parameters.focusableWhenDisabled === undefined &&
      element.disabled
    ) {
      element.disabled = false;
    }
  };

  createRenderEffect(
    () => ({
      disabled: parameters.disabled,
      focusableWhenDisabledProps: { disabled: focusableWhenDisabledProps.disabled },
      isCompositeItem: isCompositeItem(),
    }),
    ({ disabled, isCompositeItem }) => {
      const element = elementRef();

      if (!isButtonElement(element)) {
        return;
      }

      if (
        isCompositeItem &&
        disabled &&
        parameters.focusableWhenDisabled === undefined &&
        element.disabled
      ) {
        element.disabled = false;
      }
    },
  );
}

function isButtonElement(elem: Element | null): elem is HTMLButtonElement {
  return isHTMLElement(elem) && elem.tagName === "BUTTON";
}

function isValidLinkElement(elem: Element | null): elem is HTMLAnchorElement {
  return isHTMLElement(elem) && elem.tagName === "A" && Boolean((elem as HTMLAnchorElement).href);
}

interface GenericButtonProps extends HTMLProps, AdditionalButtonProps {}

interface AdditionalButtonProps extends Partial<{
  "aria-disabled": JSX.AriaAttributes["aria-disabled"];
  disabled: boolean;
  role: JSX.AriaAttributes["role"];
  tabIndex?: number | undefined;
}> {}

export interface UseButtonParameters {
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Whether the button may receive focus even if it disabled.
   */
  focusableWhenDisabled?: boolean | undefined;
  tabIndex?: number | undefined;
  /**
   * Whether the component is being rendered as a native button.
   * @default true
   */
  native?: boolean | undefined;
  /**
   * Whether the button is part of a composite widget.
   * When `true`, keyboard activation for Space occurs on keydown rather than keyup.
   * @default inferred from CompositeRoot context
   */
  composite?: boolean | undefined;
}

export interface UseButtonReturnValue {
  /**
   * Resolver for the button props.
   * @param externalProps addtional props for the button
   * @returns props that should be spread on the button
   */
  getButtonProps: (externalProps?: ComponentProps<any>) => ComponentProps<any>;
  /**
   * A ref to the button DOM element. This ref shoulf be passed to the rendered element.
   * It is not a part of the props returned by `getButtonProps`.
   */
  buttonRef: JSX.Ref<HTMLElement>;
}

export interface UseButtonState {}
