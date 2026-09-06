import { css, cx } from "@twind/core";
import { Children } from "../apps/app store/utils";
import { useLayoutEffect, useRef, useState } from "preact/hooks";

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

const visible = css`
  box-shadow: 0 0 3rem #111;
  @apply relative w-[406px] h-[842px] overflow-hidden border(white [.62em] opacity-5) rounded-[60px];

  &::after {
    content: "";
    @apply absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1 bg-white/20 rounded-xl z-10;
  }
`;

export const Device = (props: { children: Children }) => {
  const [enabled] = useState<boolean>(
    !(window.navigator as NavigatorStandalone).standalone &&
      window.self === window.top
  );
  return enabled ? <Wrapper /> : props.children;
};

const Wrapper = () => {
  const child = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const $elem: HTMLElement | null | undefined = child.current;
    const $parent: HTMLElement | null | undefined = $elem?.parentElement;

    if (!($elem && $parent)) return;

    const padding = 100;

    const scale = () => {
      const xscale = ($parent.clientWidth - padding) / $elem.clientWidth;
      const yscale = ($parent.clientHeight - padding) / $elem.clientHeight;
      const scale = xscale > yscale ? yscale : xscale;
      $elem.style.transform = `scale(${scale})`;
    };

    const ro = new ResizeObserver(scale);

    if ($elem) {
      ro.observe($parent);
      scale();
    }

    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={child}
      class={cx("flex-none relative w-screen h-screen bg-black", visible)}
    >
      <div id="device" class="w-full h-full overflow-hidden">
        <iframe
          class="w-full h-full rounded-3xl overflow-hidden transform-gpu"
          src={window.location.href}
        />
      </div>
      <header class="absolute top-2 w-full row aic text-white/80 children:(flex-1)">
        <span id="time" class="text-sm row jcc">
          {new Date().toLocaleTimeString().split(":").slice(0, -1).join(":")}
        </span>
        <svg
          class="flex-none"
          style="width: 110px"
          viewBox="0 0 98 30"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M83.35 0H14.5831C6.52911 0 0 6.52908 0 14.5831C0 22.6371 6.52911 29.1662 14.5831 29.1662H83.35C91.4041 29.1662 97.9331 22.6371 97.9331 14.5831C97.9331 6.52908 91.4041 0 83.35 0Z"
            fill="black"
          />
          <path
            d="M83.2731 23.0272C87.9366 23.0272 91.7171 19.2466 91.7171 14.5831C91.7171 9.91957 87.9366 6.13902 83.2731 6.13902C78.6095 6.13902 74.829 9.91957 74.829 14.5831C74.829 19.2466 78.6095 23.0272 83.2731 23.0272Z"
            fill="#0A0A0A"
          />
          <path
            d="M83.273 19.7915C86.1496 19.7915 88.4814 17.4596 88.4814 14.5831C88.4814 11.7066 86.1496 9.37468 83.273 9.37468C80.3965 9.37468 78.0646 11.7066 78.0646 14.5831C78.0646 17.4596 80.3965 19.7915 83.273 19.7915Z"
            fill="#0A0D13"
          />
          <path
            d="M83.2731 18.5515C85.4648 18.5515 87.2415 16.7748 87.2415 14.5831C87.2415 12.3914 85.4648 10.6147 83.2731 10.6147C81.0814 10.6147 79.3047 12.3914 79.3047 14.5831C79.3047 16.7748 81.0814 18.5515 83.2731 18.5515Z"
            fill="#091427"
          />
          <g filter="url(#filter0_f_1_29)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M80.5413 11.9281C80.0707 11.9777 79.402 12.6959 79.3524 14.1077C79.3029 15.5194 79.9221 16.2872 80.2688 16.2872C80.6156 16.2872 82.0521 14.2315 80.5413 11.9281Z"
              fill="#235A91"
              fill-opacity="0.556075"
            />
          </g>
          <g filter="url(#filter1_f_1_29)">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M83.9208 11.4338C83.1785 11.6622 83.0357 12.8612 83.0643 13.5464C83.0928 14.2316 84.0635 16.0303 85.2341 15.6306C86.4046 15.2309 86.6044 13.7463 86.1191 12.747C85.6337 11.7478 84.7487 11.0341 83.9208 11.4338Z"
              fill="#235A91"
              fill-opacity="0.556075"
            />
          </g>
          <defs>
            <filter
              id="filter0_f_1_29"
              x="79.0501"
              y="11.6286"
              width="2.46868"
              height="4.95819"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="0.149779"
                result="effect1_foregroundBlur_1_29"
              />
            </filter>
            <filter
              id="filter1_f_1_29"
              x="82.7614"
              y="11.0212"
              width="3.90368"
              height="4.96617"
              filterUnits="userSpaceOnUse"
              color-interpolation-filters="sRGB"
            >
              <feFlood flood-opacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feGaussianBlur
                stdDeviation="0.149779"
                result="effect1_foregroundBlur_1_29"
              />
            </filter>
          </defs>
        </svg>
        <span class="row aic jcc gap-1">
          <svg
            style="width: 18px"
            width="22"
            height="16"
            viewBox="0 0 22 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.1055 6.55566C2.29007 6.75781 2.58011 6.74902 2.77347 6.53809C4.94437 4.24414 7.80081 3.03125 10.9912 3.03125C14.208 3.03125 17.0733 4.24414 19.2354 6.55566C19.42 6.74023 19.7012 6.73145 19.8858 6.53809L21.1162 5.29883C21.292 5.12305 21.292 4.89453 21.1514 4.72754C19.0332 2.11719 15.0869 0.245117 10.9912 0.245117C6.90433 0.245117 2.94925 2.1084 0.839873 4.72754C0.699248 4.89453 0.699248 5.12305 0.86624 5.29883L2.1055 6.55566ZM5.77933 10.2119C5.99026 10.4141 6.27151 10.3965 6.47366 10.1768C7.54593 9.00781 9.25979 8.18164 11 8.19043C12.7491 8.18164 14.4629 9.02539 15.5616 10.2031C15.7461 10.4141 16.0098 10.4053 16.2119 10.2031L17.5918 8.84961C17.7588 8.69141 17.7764 8.47168 17.627 8.2959C16.2559 6.63477 13.751 5.43945 11 5.43945C8.24026 5.43945 5.73538 6.63477 4.36429 8.2959C4.21487 8.47168 4.23245 8.68262 4.39944 8.84961L5.77933 10.2119ZM11 15.0811C11.211 15.0811 11.3955 14.9844 11.7559 14.6416L13.9092 12.5674C14.0674 12.418 14.1026 12.1719 13.9619 11.9961C13.3467 11.2139 12.2305 10.5811 11 10.5811C9.7344 10.5811 8.60062 11.2402 7.99417 12.0664C7.8887 12.2246 7.94144 12.418 8.09085 12.5674L10.2442 14.6416C10.5957 14.9756 10.7891 15.0811 11 15.0811Z"
              fill="currentColor"
            />
          </svg>
          <svg
            style="width: 32px"
            width="28"
            height="13"
            viewBox="0 0 28 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.61523 12.8066H19.3965C20.9961 12.8066 22.2529 12.6309 23.1582 11.7256C24.0547 10.8203 24.2217 9.58105 24.2217 7.98145V5.33594C24.2217 3.72754 24.0547 2.48828 23.1582 1.5918C22.2441 0.686523 20.9961 0.510742 19.3965 0.510742H5.58887C4.01562 0.510742 2.75879 0.686523 1.8623 1.5918C0.957031 2.49707 0.790039 3.73633 0.790039 5.30957V7.98145C0.790039 9.58105 0.957031 10.8291 1.85352 11.7256C2.76758 12.6309 4.01562 12.8066 5.61523 12.8066ZM5.36914 11.084C4.46387 11.084 3.61133 10.9521 3.11914 10.4688C2.62695 9.97656 2.5127 9.1416 2.5127 8.22754V5.10742C2.5127 4.18457 2.62695 3.34082 3.11035 2.84863C3.60254 2.35645 4.46387 2.2334 5.38672 2.2334H19.6426C20.5566 2.2334 21.4092 2.35645 21.8926 2.84863C22.3848 3.34082 22.499 4.17578 22.499 5.08984V8.22754C22.499 9.1416 22.3848 9.97656 21.8926 10.4688C21.4092 10.9609 20.5566 11.084 19.6426 11.084H5.36914ZM5.02637 9.97656H15.5469C16.0918 9.97656 16.417 9.89746 16.6455 9.66895C16.8652 9.44043 16.9531 9.11523 16.9531 8.5791V4.73828C16.9531 4.19336 16.8652 3.86816 16.6455 3.64844C16.417 3.41992 16.0918 3.34082 15.5469 3.34082H5.04395C4.48145 3.34082 4.15625 3.41992 3.92773 3.63965C3.70801 3.86816 3.62012 4.20215 3.62012 4.75586V8.5791C3.62012 9.12402 3.70801 9.44043 3.92773 9.66895C4.15625 9.89746 4.48145 9.97656 5.02637 9.97656ZM25.5049 9.03613C26.2344 8.99219 27.21 8.06055 27.21 6.6543C27.21 5.25684 26.2344 4.31641 25.5049 4.27246V9.03613Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </header>
    </div>
  );
};
