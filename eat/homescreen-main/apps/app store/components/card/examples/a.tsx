import { useState } from "preact/hooks";
import { Card, Header, Body, Footer } from "..";
import { Button } from "../../button";
import { randomGameCategories } from "./e";

export default (props: { type: "a" }) => {
  const [seed] = useState(Math.random());
  return (
    <Card class="bg-transparent p-0 gap-4">
      <Header class="backdrop-blur-xl">
        <div class="col gap-3 pt-1 overflow-hidden">
          <span class="uppercase font-medium text-([11px] blue-500) leading-[1cap]">
            New Game
          </span>
          <span class="font-regular text-(xl neutral-100) leading-[1cap] truncate">
            {randomGameNames[(seed * randomGameNames.length) << 0]}
          </span>
          <span class="font-light text-(xl neutral-400) leading-[1cap]">
            {
              randomGameTagline[
                Math.floor(Math.random() * randomGameTagline.length)
              ]
            }
          </span>
        </div>
      </Header>
      <Body class="relative rounded-lg overflow-hidden">
        <img
          class="w-full bg-neutral-900 aspect-[844/545] object-cover blur-xl"
          src={`https://loremflickr.com/600/400/fantasy?random=${seed}`}
          onError={(e) => {
            e.currentTarget.src =
              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
          }}
        />
        <div class="absolute inset-0 w-full h-full col aifs bg-gradient-to-t from-neutral-900">
          <div class="w-full mt-auto px-4 pb-5 row gap-6">
            <div class="flex-1 w-full row aic gap-2">
              <img
                class="flex-none w-9 h-9 rounded-lg"
                src={`https://loremflickr.com/100/100/fantasy?random=${
                  seed + 1
                }`}
                alt=""
              />
              <div class="col jcc gap-2 w-full h-full truncate">
                <span class="text-(sm neutral-100) font-medium truncate leading-[1.1cap]">
                  {randomGameNames[(seed * randomGameNames.length + 1) << 0]}
                </span>
                <span class="text-(xs neutral-300) font-light leading-[1cap] capitalize">
                  {
                    randomGameCategories[
                      Math.floor(Math.random() * randomGameCategories.length)
                    ]
                  }{" "}
                  {
                    randomGameCategories[
                      Math.floor(Math.random() * randomGameCategories.length)
                    ]
                  }
                </span>
              </div>
            </div>
            <div class="col">
              <Button x={{ type: "c", label: "Get" }} />
            </div>
          </div>
        </div>
      </Body>
    </Card>
  );
};

export const randomGameNames = [
  "Resident Evil 7 Biohazard",
  "The Witcher 3: Wild Hunt",
  "Grand Theft Auto V",
  "The Legend of Zelda: Breath of the Wild",
  "Bloodborne",
  "Red Dead Redemption 2",
  "God of War",
  "Dark Souls III",
  "The Last of Us Part II",
  "Persona 5",
  "Control",
  "Final Fantasy VII Remake",
  "Sekiro: Shadows Die Twice",
  "Death Stranding",
  "Horizon Zero Dawn",
];

const randomGameTagline = [
  "Urban Fantasy ARPG",
  "Defend and conquer",
  "Ultimate survival experience",
];
