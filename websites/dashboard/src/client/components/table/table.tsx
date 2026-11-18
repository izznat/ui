import { type JSX } from "@solidjs/web";
import { omit } from "solid-js";
import { tv, type ClassValue } from "tailwind-variants";

export interface TableProps extends Omit<JSX.HTMLAttributes<HTMLTableElement>, "class"> {
  class: ClassValue;
}

const tableClass = tv({
  base: "border-collapse",
});

export function Table(props: TableProps) {
  const spread = omit(props, "children", "class");

  return (
    <table {...spread} class={tableClass({ class: props.class })}>
      {props.children}
    </table>
  );
}
