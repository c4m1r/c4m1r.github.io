import { css } from "@twind/core";
import { createPortal } from "preact/compat";
import { useRef, useState } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";

type ScreenProps = {
  parent: string;
  hide: () => void;
};

export const Popover = (props: {
  id: string;
  parent?: string;
  placeholder: () => JSX.Element;
  window: (props: ScreenProps) => JSX.Element;
}) => {
  const id = [props.parent, props.id].filter(Boolean).join("--");

  const launcher = useRef<HTMLDivElement>(null);
  const portal = useRef<HTMLDivElement>(null);

  const [launched, setLaunched] = useState<boolean>();

  const show = () => {
    // If the portal hasn't been launched yet
    if (!launched) {
      // Set the origin of the portal to the origin of the launcher
      setLaunched(true);
      setTimeout(() => portal.current?.showPopover(), 0);
    } else {
      portal.current?.showPopover();
    }
  };

  const hide = () => {
    // Hide the portal
    portal.current?.hidePopover();
  };

  return (
    <div popovertarget={id} ref={launcher} onClick={() => show()}>
      {props.placeholder()}
      {launched &&
        createPortal(
          <div
            popover="manual"
            data-overlay="true"
            id={id}
            ref={portal}
            // @ts-ignore
            onBeforeToggle={(e: ToggleEvent) => {
              const target = e.currentTarget as HTMLElement;
              // Set the closed position of the screen to the origin
              target.style.setProperty("--x", `0px`);
              target.style.setProperty("--y", `0px`);
              target.style.setProperty("--w", `100vw`);
              target.style.setProperty("--h", `100vh`);
              target.style.setProperty("--opening-duration", ".5");
              target.style.setProperty("--closing-duration", ".75");
            }}
            class={css`
              &:popover-open {
                display: block;
                position: fixed;
                top: 0px;
                left: 0px;
                width: 100vw;
                height: 100vh;
                transform: translate(0, 0);
                pointer-events: auto;
                transition-duration: calc(var(--opening-duration) * 1s);
                transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
              }

              & {
                display: block;
                margin: 0;
                padding: 0;
                position: fixed;
                pointer-events: none;
                background: transparent;
                top: var(--y);
                left: var(--x);
                width: var(--w);
                height: var(--h);
                transform: translate(0, 100%);
                will-change: transform, display;
                transition-property: transform, display;
                transition-duration: calc(var(--closing-duration) * 1s);
                transition-behavior: allow-discrete;
                transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
              }

              @starting-style {
                &:popover-open {
                  position: fixed;
                  top: var(--y);
                  left: var(--x);
                  width: var(--w);
                  height: var(--h);
                  transform: translate(0, 100%);
                }
              }
            `}
          >
            <div class="will-change-transform absolute top-0 left-0 origin-top-left w-screen h-screen m-0">
              {props.window({ hide, parent: id })}
            </div>
          </div>,
          launcher.current?.closest("[id]")
            ? document.getElementById(launcher.current.closest("[id]")!.id)!
            : document.body!
        )}
    </div>
  );
};
