import type { BaseUIComponentProps, NativeButtonProps } from "../internals/types";

export function Button(props: Button.Props) {
  return <button></button>;
}

export interface ButtonState {
  /**
   * Whether the button should ignore user interaction.
   */
  disabled: boolean;
}

export interface ButtonProps
  extends NativeButtonProps, BaseUIComponentProps<"button", ButtonState> {
  /**
   * Whether the button should be focusable when disabled.
   * @default false
   */
  focusableWhenDisabled?: boolean | undefined;
}

export namespace Button {
  export type State = ButtonState;
  export type Props = ButtonProps;
}
