import { css } from "@twind/core";
import { useEffect, useRef } from "preact/hooks";

export default (props: { onChange: (value: number) => void }) => {
  const knobRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    var knob = knobRef.current as HTMLElement;
    var ring = ringRef.current as HTMLElement;

    knob.onpointerdown = OnPointerDown;

    var startY = 0;
    var currentY = 0;
    var lastRot = 140;

    var maxRot = 140;
    var speed = 1.5;

    function OnPointerDown(event: MouseEvent) {
      document.addEventListener("pointermove", OnPointerMove);
      document.addEventListener("pointerup", OnPointerUp);
      startY = event.clientY;
    }

    function OnPointerMove(event: MouseEvent) {
      let delta = startY - event.clientY;
      currentY = lastRot + delta * speed;

      if (currentY > maxRot) currentY = maxRot;
      if (currentY < -maxRot) currentY = -maxRot;

      props.onChange((currentY + maxRot) / 280);

      knob.style.transform = "rotate(" + currentY + "deg)";

      if (currentY > 0)
        ring.style.background =
          "conic-gradient(var(--accent) " +
          currentY +
          "deg, rgba(255,255,255,0.0) 0 360deg, var(--accent) 0deg)";
      else
        ring.style.background =
          "conic-gradient(var(--accent) 0deg, rgba(255,255,255,0.0) 0 " +
          (360 + currentY) +
          "deg, var(--accent) 0deg)";
    }

    function OnPointerUp() {
      lastRot = currentY;
      document.removeEventListener("pointermove", OnPointerMove);
      document.removeEventListener("pointerup", OnPointerUp);
    }
  }, []);

  return (
    <div class={styles}>
      <div class="ring-outer"></div>
      <div ref={ringRef} class="ring-fill"></div>
      <div class="space"></div>
      <div class="knob">
        <div ref={knobRef} class="knob-indicator-container">
          <div class="knob-indicator"></div>
        </div>
      </div>
    </div>
  );
};

const styles = css`
  & {
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -o-user-select: none;
    user-select: none;
    width: 100%;
    height: 100%;
    opacity: 0.8;
  }

  :root {
    --ring-width: 20%;
    --ring-space: 20%;
    --accent: #04c5f7;
  }

  & {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 200px;
    height: 200px;
  }

  & .ring-outer {
    position: absolute;
    background: conic-gradient(
      #545c64 140deg,
      rgba(255, 255, 255, 0) 0 220deg,
      #545c64 0deg
    );
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }

  & .ring-fill {
    position: absolute;
    background: conic-gradient(
      var(--accent) 140deg,
      rgba(255, 255, 255, 0) 0 360deg,
      var(--accent) 0deg
    );
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }

  & .space {
    position: absolute;
    background-color: #32383f;
    border-radius: 50%;
    width: calc((100%) - var(--ring-width));
    height: calc((100%) - var(--ring-width));
  }

  & .knob {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    background: linear-gradient(#6d757f, #596067);
    border-radius: 50%;
    width: calc((100%) - (var(--ring-width) + var(--ring-space)));
    height: calc((100%) - (var(--ring-width) + var(--ring-space)));
  }

  & .knob-indicator-container {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
    transform: rotate(140deg);
  }

  & .knob-indicator {
    background: #16181a;
    width: 9%;
    height: 35%;
    margin-top: 4%;
  }
`;
