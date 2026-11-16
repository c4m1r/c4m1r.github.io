import { css, cx } from "@twind/core";
import { Card, Header, Body, Footer } from "..";
import { Button } from "../../button";
import { useState } from "preact/hooks";
import { randomGameCategories } from "./e";

export default (props: { type: "d" }) => {
  const [img] = useState(Math.random());
  return (
    <Card class="bg-transparent p-0 gap-2">
      <Body class="relative rounded-lg overflow-hidden">
        <img
          class="flex-none w-full aspect-[844/560] object-cover blur-xl"
          src={`https://loremflickr.com/600/600/fantasy?random=${img}`}
        />
      </Body>
      <Footer>
        <span class="text-sm">
          Our top 10{" "}
          {
            randomGameCategories[
              Math.floor(Math.random() * randomGameCategories.length)
            ]
          }{" "}
          games
        </span>
      </Footer>
    </Card>
  );
};
