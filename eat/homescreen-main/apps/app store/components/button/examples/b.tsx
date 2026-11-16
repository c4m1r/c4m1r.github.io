import { Button } from "..";
import { Icon } from "../../../../../elements/Icon";

export default (props: { type: "b"; label: string }) => {
  return (
    <Button class="gap-1.5 py-1.5 ps-2 pe-3 text-white/80 bg-neutral-800 rounded-xl">
      <Icon id="button-border-dashed" size="6" />
      <span class="leading-[1cap] capitalize whitespace-nowrap">
        {props.label}
      </span>
    </Button>
  );
};
