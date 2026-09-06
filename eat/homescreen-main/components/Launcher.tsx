import { css } from "@twind/core";
import { createPortal } from "preact/compat";
import { useRef, useState, useEffect } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";

type Origin = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ScreenProps = {
  parent: string;
  hide: () => void;
  home: () => void;
};

export const Launcher = (props: {
  id: string;
  parent?: string;
  placeholder: () => JSX.Element;
  window: (props: ScreenProps) => JSX.Element;
}) => {
  const id = [props.parent, props.id].filter(Boolean).join("--");

  const launcher = useRef<HTMLDivElement>(null);
  const portal = useRef<HTMLDivElement>(null);
  const placeholder = useRef<HTMLDivElement>(null);

  const [launched, setLaunched] = useState<Origin>();

  const show = () => {
    if (!props.parent) launcher.current!.dataset.root = "true";
    const launchers = document.querySelectorAll(
      `[popovertarget="${id}"]`
    ) as NodeListOf<HTMLElement>;
    // Set the origin of the launcher on the data attribute so that it can be
    // referenced even if the element is not visible or has been transformed
    launchers.forEach((x) => {
      x.dataset.origin = JSON.stringify(
        launcher.current?.getBoundingClientRect()
      );
    });

    // If the portal hasn't been launched yet
    if (!launched) {
      if (document.getElementById(id)) {
        document.getElementById(id)?.showPopover();
      } else {
        // Set the origin of the portal to the origin of the launcher
        setLaunched(launcher.current?.getBoundingClientRect());
        // Allow the portal to be created then show
        setTimeout(() => portal.current?.showPopover(), 0);
      }
    } else {
      const target = document.getElementById(id);
      const peek = target?.querySelector(".peek") as HTMLElement;
      if (peek) {
        // Show the portal at the top of the stack
        peek.showPopover();
        peek.classList.remove("peek");
        // Replace the placeholder with the target placeholder
        const target = document.querySelector(
          `[popovertarget="${peek.id}"]`
        ) as HTMLElement;
        const placeholder = target?.firstElementChild as HTMLElement;
        peek
          ?.querySelector("#placeholder-clone")
          ?.replaceChildren(placeholder.cloneNode(true));
      } else {
        // Show this portal
        target?.showPopover();
      }
    }
  };

  const hide = () => {
    // Hide the portal
    portal.current?.hidePopover();
  };

  const home = () => {
    // The base icon
    const base = id.split("--")[0];
    const target = document.querySelector(`[popovertarget="${base}"]`);

    if (props.parent) {
      // Mark the portal as being at the top of the stack
      portal.current?.classList.add("peek");
      // Clone the target placeholder and set as own clones placeholder
      const icon = target?.firstElementChild as HTMLElement;
      placeholder.current!.replaceChildren(icon.cloneNode(true));
    }

    // Remove the root data attribute from the base launcher

    const launchers = document.querySelectorAll(
      `[popovertarget="${id}"]`
    ) as NodeListOf<HTMLElement>;
    launchers.forEach((launcher) => {
      launcher.dataset.root = "false";
    });
    // Hide the screen
    portal.current?.hidePopover();
  };

  useEffect(() => {
    if (!portal.current) return;
    const $parent = portal.current;
    const $child = $parent.children[0] as HTMLElement;
    // Scale the screen to fit the portal
    const scale = () => {
      const scale = $parent.clientWidth / $child.clientWidth;
      $child.style.transform = `scale(${Math.min(1, scale)})`;
      // Disable pointer events on the screen if it is scaling
      $child.style.pointerEvents = scale < 0.95 ? "none" : "auto";
    };
    const ro = new ResizeObserver(scale);
    ro.observe($parent);
    return () => ro.disconnect();
  }, [launched]);

  return (
    <div popovertarget={id} ref={launcher} onClick={() => show()}>
      {props.placeholder()}
      {launched &&
        createPortal(
          <div
            popover="manual"
            id={id}
            ref={portal}
            // @ts-ignore
            onBeforeToggle={(e: ToggleEvent) => {
              const target = e.currentTarget as HTMLElement;
              const isPeek = target.classList.contains("peek");
              // The base or this elements icon
              const launcher = document.querySelector(
                `[popovertarget="${isPeek ? id.split("--")[0] : id}"]`
              ) as HTMLElement;
              // Get the most recent origin of the launcher
              const origin = JSON.parse(launcher.dataset.origin!);
              // Set the closed position of the screen to the origin
              target.style.setProperty("--x", `${origin.x}px`);
              target.style.setProperty("--y", `${origin.y}px`);
              target.style.setProperty("--w", `${origin.width}px`);
              target.style.setProperty("--h", `${origin.height}px`);
              target.style.setProperty("--opening-duration", ".4");
              target.style.setProperty("--closing-duration", ".33");

              // Set the background of the placeholder to the icon's background
              const icon = placeholder.current!.firstElementChild!;
              const color = getComputedStyle(icon).backgroundColor;
              placeholder.current!.style.background = "#111";
            }}
            class={css`
              &.peek,
              &:has(.peek) {
                pointer-events: none !important;
              }

              &:has(:popover-open:not([data-overlay])) > :first-child,
              &:has(:popover-open) > #placeholder-clone,
              &:has(.peek) > :first-child,
              &:has(.peek) > #placeholder-clone {
                display: none !important;
                transition: display 0.5s allow-discrete;
              }

              & > #placeholder-clone {
                pointer-events: none;
                opacity: 1;
                transition: opacity calc(var(--closing-duration) * 0.8s);
                transition-delay: calc(var(--closing-duration) * 0.38s);
                transition-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
              }

              &:popover-open {
                position: fixed;
                top: 0px;
                left: 0px;
                width: 100vw;
                height: 100vh;
                border-radius: 2.7rem;
                pointer-events: auto;
                transition-duration: calc(var(--opening-duration) * 1s);
                transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);

                & > #placeholder-clone {
                  opacity: 0;
                }
              }

              & {
                margin: 0;
                padding: 0;
                position: fixed;
                pointer-events: none;
                border-radius: 1rem;
                background: #111;
                top: var(--y);
                left: var(--x);
                width: var(--w);
                height: var(--h);
                will-change: top, left, width, height, border-radius;
                transition-property: top, left, width, height, border-radius,
                  overlay, display;
                transition-duration: calc(var(--closing-duration) * 1s);
                transition-behavior: allow-discrete;
                transition-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
              }

              @starting-style {
                &:popover-open {
                  position: fixed;
                  top: var(--y);
                  left: var(--x);
                  width: var(--w);
                  height: var(--h);
                  border-radius: 1rem;
                }
              }
            `}
          >
            <div class="will-change-transform absolute top-0 left-0 origin-top-left w-screen h-screen m-0">
              {props.window({ hide, home, parent: id })}
            </div>
            <div
              ref={placeholder}
              id="placeholder-clone"
              class="absolute top-0 left-0 w-full h-full"
            >
              {props.placeholder()}
            </div>
          </div>,
          props.parent ? document.getElementById(props.parent)! : document.body
        )}
    </div>
  );
};
