import { Button } from "..";
import { Icon } from "../../../../../elements/Icon";

export default (props: {
  type: "f";
  to: string;
  icon: string;
  label: string;
}) => {
  return (
    <Button class="col aic">
      <div class="w-full bg-gradient-to-t from-neutral-900 to-neutral-800 text-neutral-300 rounded-xl p-1">
        <Icon id={props.icon ?? "button-border-dashed"} size="14" />
      </div>
      <span class="text-xs">{props.label ?? "Label"}</span>
    </Button>
  );
};
