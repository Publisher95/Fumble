"use client";

import { useMemo } from "react";
import ProfileCard from "./ProfileCard";
import PromptCard from "./PromptCard";
import VitalsCard from "./VitalsCard";
import PhotoCard from "./PhotoCard";
import SwipeableCard from "./SwipeableCard";
import { UserProfile } from "../types/user";
import { getAllUsersExcept } from "../lib/users";

interface SwipingViewProps {
  currentUser: UserProfile;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SwipingView({ currentUser }: SwipingViewProps) {
  // Get all users except current user and shuffle once
  const otherUsers = useMemo(() => {
    return shuffleArray(getAllUsersExcept(currentUser.id));
  }, [currentUser.id]);

  // For now, show the first user in the shuffled list
  const displayUser = otherUsers[0];

  if (!displayUser) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-zinc-400 text-center">No more profiles to show</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3 pb-24 overflow-x-hidden">
      {/* 1. Hero Profile Card */}
      <SwipeableCard onLike={() => console.log("Liked Profile Photo")} onNope={() => console.log("Noped Profile Photo")}>
        <ProfileCard
          name={displayUser.name}
          imageSrc={displayUser.mainPhoto}
          tags={displayUser.tags}
        />
      </SwipeableCard>

      {/* 2. Prompt 1 */}
      <SwipeableCard onLike={() => console.log("Liked Prompt 1")} onNope={() => console.log("Noped Prompt 1")}>
        <PromptCard
          question={displayUser.prompts[0].question}
          answer={displayUser.prompts[0].answer}
        />
      </SwipeableCard>

      {/* 3. Vitals */}
      <SwipeableCard onLike={() => console.log("Liked Vitals")} onNope={() => console.log("Noped Vitals")}>
        <VitalsCard
          age={displayUser.age}
          height={displayUser.height}
          stereotype={displayUser.stereotype}
          profession={displayUser.profession}
          location={displayUser.location}
          relationshipType={displayUser.relationshipType}
        />
      </SwipeableCard>

      {/* 4-8. Photos */}
      {displayUser.photos.map((photo, idx) => (
        <SwipeableCard key={`photo-${idx}`} onLike={() => console.log(`Liked Photo ${idx + 1}`)} onNope={() => console.log(`Noped Photo ${idx + 1}`)}>
          <PhotoCard imageSrc={photo} />
        </SwipeableCard>
      ))}

      {/* 9. Prompt 2 */}
      <SwipeableCard onLike={() => console.log("Liked Prompt 2")} onNope={() => console.log("Noped Prompt 2")}>
        <PromptCard
          question={displayUser.prompts[1].question}
          answer={displayUser.prompts[1].answer}
        />
      </SwipeableCard>

      {/* 10. Prompt 3 */}
      <SwipeableCard onLike={() => console.log("Liked Prompt 3")} onNope={() => console.log("Noped Prompt 3")}>
        <PromptCard
          question={displayUser.prompts[2].question}
          answer={displayUser.prompts[2].answer}
        />
      </SwipeableCard>
    </div>
  );
}
