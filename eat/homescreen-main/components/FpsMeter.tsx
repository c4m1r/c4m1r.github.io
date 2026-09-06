import { useEffect, useRef } from "preact/hooks";

export const FpsMeter = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frames = 0;

    const logger = document.createElement("div");
    logger.style.position = "fixed";
    logger.style.bottom = "0";
    logger.style.left = "50%";
    logger.style.transform = "translate(-50%,-50%)";
    logger.style.color = "white";
    logger.style.background = "black";
    logger.style.padding = "4px 8px";
    logger.style.borderRadius = "8px";

    document.body.appendChild(logger);

    function animate() {
      frames++;
      requestAnimationFrame(animate);
    }

    setInterval(() => {
      logger.innerText = frames * 2 + "fps";
      frames = 0;
    }, 500);

    requestAnimationFrame(animate);
  }, []);

  return <div ref={ref} />;
};
