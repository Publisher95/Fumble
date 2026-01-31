import Image from "next/image";

interface ProfileCardProps {
  name: string;
  imageSrc: string;
  tags: string[];
}

export default function ProfileCard({ name, imageSrc, tags }: ProfileCardProps) {
  return (
    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-gray-200">
      <Image
        src={imageSrc}
        alt={name}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white tracking-tight">{name}</h1>
        {/* Scrollable container with mask for fade effect at edge if desired, but simple scroll first */}
        <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 -mx-4 px-4 scrollbar-hide">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium text-white bg-black/50 backdrop-blur-md border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
