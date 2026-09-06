import { css, cx } from "@twind/core";
import { Card, Header, Body, Footer } from "..";
import { Button } from "../../button";
import { useState } from "preact/hooks";
import { randomGameNames } from "./a";

export default (props: { type: "c" }) => {
  const [img] = useState(Math.random());
  return (
    <Card class="bg-transparent p-0">
      <Header class="pb-3">
        <span class="uppercase font-semibold text-([12px] blue-500) leading-[1.1cap]">
          Happening Now
        </span>
      </Header>
      <Body class="relative rounded-t-lg overflow-hidden">
        <img
          class="flex-none w-full aspect-[844/525] object-cover blur-xl"
          src={`https://loremflickr.com/600/600/fantasy?random=${img}`}
        />
        {/* <img
          class={css`
            @apply absolute inset-0 aspect-[844/525] object-cover backdrop-blur-2xl;
            mask-image: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 1) 0%,
              rgba(0, 0, 0, 0) 90%
            );
          `}
          src={`https://loremflickr.com/600/600/fantasy?random=${img}`}
        /> */}
        <div class="absolute inset-0 w-full h-full col aifs bg-gradient-to-t from-neutral-900 to-transparent">
          <div class="mt-auto w-full px-4 pb-5 pt-3 row gap-2">
            <div class="col gap-2.5 pt-1">
              <span class="font-regular text-([10px] neutral-300) leading-[1cap] uppercase">
                Competition
              </span>
              <span class="text-(base neutral-100) leading-[1cap]">
                Tower Defense Online
              </span>
              <span class="font-light text-(sm neutral-200) leading-[1cap]">
                Defend and conquer in online challenges!
              </span>
            </div>
          </div>
        </div>
      </Body>
      <Footer class="px-4 py-3.5 gap-2 bg-neutral-800 rounded-b-lg overflow-hidden">
        <div class="flex-1 row aic gap-3">
          <img
            class="flex-none w-10 h-10 rounded-lg"
            src={`https://loremflickr.com/600/600/fantasy?random=${img + 10}`}
            alt=""
          />
          <div class="col jcc gap-2 w-full h-full truncate">
            <span class="text-(sm neutral-100) font-medium truncate leading-[1cap]">
              {randomGameNames[(Math.random() * randomGameNames.length) << 0]}
            </span>
            <span class="text-(xs neutral-300) font-light leading-[1cap]">
              Urban Fantasy ARPG
            </span>
          </div>
          <div class="-mt-1.5">
            <Button x={{ type: "d", label: "Get" }} />
          </div>
        </div>
      </Footer>
    </Card>
  );
};
