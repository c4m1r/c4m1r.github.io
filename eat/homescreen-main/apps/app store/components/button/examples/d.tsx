import { Button } from "..";

export default (props: { type: "d"; label?: string }) => {
  return (
    <div class="relative col aic gap-1">
      <Button class="px-6 py-2.5 text-(blue-500) bg-neutral-900 font-semibold rounded-full leading-[1.2cap]">
        {props.label ?? "Get"}
      </Button>
      <span class="absolute bottom-0 pt-1 translate-y-full text-([8px] neutral-500) whitespace-nowrap tracking-wider">
        In-App Purchases
      </span>
    </div>
  );
};
