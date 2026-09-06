import { Card, Body } from "..";
import { useState } from "preact/hooks";

export default (props: { type: "e" }) => {
  const [img] = useState(Math.random());
  return (
    <Card class="bg-transparent p-0 gap-2">
      <Body class="relative rounded-lg overflow-hidden">
        <img
          class="flex-none w-full aspect-[844/560] object-cover blur-xl"
          src={`https://loremflickr.com/600/600/fantasy?random=${img}`}
        />
        <span class="px-2 py-1 absolute bottom-0 text-sm capitalize">
          {
            randomGameCategories[
              Math.floor(Math.random() * randomGameCategories.length)
            ]
          }
        </span>
      </Body>
    </Card>
  );
};

export const randomGameCategories = [
  "action",
  "adventure",
  "arcade",
  "board",
  "card",
  "casino",
  "casual",
  "educational",
  "music",
  "puzzle",
  "racing",
  "role Playing",
  "simulation",
  "sports",
  "strategy",
  "trivia",
];
