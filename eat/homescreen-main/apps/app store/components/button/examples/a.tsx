import { Button } from "..";
import { Icon } from "../../../../../elements/Icon";

export default (props: {
  type: "a";
  to: string;
  icon: string;
  label: string;
}) => {
  return (
    <Button class="col aic gap-0 !p-0 text-sm">
      <Icon id={props.icon ?? "button-border-dashed"} size="8" />
      <span>{props.label ?? "Label"}</span>
    </Button>
  );
};
