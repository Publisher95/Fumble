import { Briefcase, MapPin, Ruler, Users, Cake, Drama } from "lucide-react";

interface VitalsCardProps {
  age: number;
  height: string;
  profession: string;
  location: string;
  stereotype?: string;
}

export default function VitalsCard({
  age,
  height,
  profession,
  location,
  stereotype,
}: VitalsCardProps) {
  return (
    <div className="w-full bg-white rounded-xl p-4 flex flex-col gap-4 text-zinc-900 shadow-sm border border-zinc-100">
      {/* Top Row: Age | Height */}
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2 min-w-0">
          <Cake size={20} className="text-zinc-900" />
          <span className="font-semibold">{age}</span>
        </div>
        <div className="h-4 w-[1px] bg-zinc-300" />
        <div className="flex items-center gap-2 min-w-0">
          <Ruler size={20} className="text-zinc-900" />
          <span className="font-semibold">{height}</span>
        </div>
      </div>

      {/* List Items */}
      <div className="flex flex-col gap-4">
        {stereotype && (
          <div className="flex items-center gap-3">
            <Drama size={20} className="text-zinc-900 shrink-0" />
            <span className="text-base font-medium">{stereotype}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Briefcase size={20} className="text-zinc-900 shrink-0" />
          <span className="text-base font-medium">{profession}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin size={20} className="text-zinc-900 shrink-0" />
          <span className="text-base font-medium">{location}</span>
        </div>
      </div>
    </div>
  );
}
