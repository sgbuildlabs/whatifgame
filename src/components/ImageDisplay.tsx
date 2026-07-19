import type { AskImage } from "@/lib/types";

export default function ImageDisplay({ image }: { image: AskImage }) {
  return (
    <figure className="w-full overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt="An illustration for your what-if question"
        className="aspect-square w-full object-cover"
      />
      {image.attribution && (
        <figcaption className="px-3 py-2 text-center text-xs text-foreground/60">
          {image.attribution}
        </figcaption>
      )}
    </figure>
  );
}
