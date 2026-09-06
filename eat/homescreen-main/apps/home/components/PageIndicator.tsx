export const PageIndicator = (props: { lists: any[]; progress: number }) => {
  return (
    <div class="mb-1 self-center row gap-2 py-2.5 px-4 rounded-full bg-black/20 children:(w-2 h-2 rounded-full)">
      {Array.from({ length: props.lists.length }).map((_, i) => (
        <div
          class={`w-2 h-2 rounded-full ${
            i + 1 === Math.round(props.progress) ? "bg-white" : "bg-white/50"
          }`}
        />
      ))}
    </div>
  );
};
