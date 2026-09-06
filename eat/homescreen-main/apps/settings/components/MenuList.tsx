import { css } from "@twind/core";
import { Icon } from "../../../elements/Icon";
import { Switch } from "../../../elements/Switch";

export const MenuList = (props: { items: any[] }) => {
  return (
    <ul class="w-full bg-[#1c1c1e] px-3 rounded-xl children:(w-full row aic gap-4)">
      {props.items.map((item) => (
        <MenuItem {...item} />
      ))}
    </ul>
  );
};

const MenuItem = (props: {
  icon: string;
  title: string;
  value: string | boolean;
  fill: string;
}) => {
  return (
    <li
      class={css`
        &:not(:last-child) > div {
          @apply border-b border-white/10;
        }
      `}
    >
      <Icon
        id={props.icon}
        size="7"
        class={`bg-${props.fill} rounded-[6px] p-0.5`}
      />
      <div class="row aife flex-1 pb-2.5 pt-2">
        <span class="flex-1">{props.title}</span>
        {typeof props.value === "boolean" ? (
          <Switch checked={props.value} />
        ) : (
          <div class="row aic">
            <span class="text-(base neutral-400) font-light">
              {props.value}
            </span>
            <Icon id="chevron-forward" size="6" class="text-neutral-600" />
          </div>
        )}
      </div>
    </li>
  );
};
