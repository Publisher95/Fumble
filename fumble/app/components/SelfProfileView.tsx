"use client";

import ProfileCard from "./ProfileCard";
import PromptCard from "./PromptCard";
import VitalsCard from "./VitalsCard";
import PhotoCard from "./PhotoCard";
import { UserProfile } from "../types/user";

interface SelfProfileViewProps {
  currentUser: UserProfile;
}

export default function SelfProfileView({ currentUser }: SelfProfileViewProps) {
  return (
    <div className="flex flex-col gap-3 p-3 pb-24 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-100 mb-2">
        <h1 className="text-xl font-bold text-center">My Profile</h1>
        <p className="text-center text-zinc-500 text-sm">Preview mode</p>
      </div>

      {/* 1. Hero Profile Card */}
      <ProfileCard
        name={currentUser.name}
        imageSrc={currentUser.mainPhoto}
        tags={currentUser.tags}
      />

      {/* 2. Prompt 1 */}
      <PromptCard
        question={currentUser.prompts[0].question}
        answer={currentUser.prompts[0].answer}
      />

      {/* 3. Vitals */}
      <VitalsCard
        age={currentUser.age}
        height={currentUser.height}
        stereotype={currentUser.stereotype}
        profession={currentUser.profession}
        location={currentUser.location}
        relationshipType={currentUser.relationshipType}
      />

      {/* 4-8. Photos */}
      {currentUser.photos.map((photo, idx) => (
        <PhotoCard key={`photo-${idx}`} imageSrc={photo} />
      ))}

      {/* 9. Prompt 2 */}
      <PromptCard
        question={currentUser.prompts[1].question}
        answer={currentUser.prompts[1].answer}
      />

      {/* 10. Prompt 3 */}
      <PromptCard
        question={currentUser.prompts[2].question}
        answer={currentUser.prompts[2].answer}
      />
    </div>
  );
}
