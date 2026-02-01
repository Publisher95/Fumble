"use client";

import { useMemo, useState, useEffect } from "react";
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

export default function SwipingView({ currentUser, socket }: { currentUser: UserProfile, socket: any }) {
  const [swipedUserIds, setSwipedUserIds] = useState<Set<string>>(new Set());
  const [swipedQueue, setSwipedQueue] = useState<string[]>([]); // To track local session swipes

  // Get all users except current user and shuffle once
  const potentialMatches = useMemo(() => {
    return shuffleArray(getAllUsersExcept(currentUser.id));
  }, [currentUser.id]);

  // Derived state: users to display (excluding those already swiped)
  const displayUsers = useMemo(() => {
    return potentialMatches.filter(u => !swipedUserIds.has(u.id.toString()) && !swipedQueue.includes(u.id.toString()));
  }, [potentialMatches, swipedUserIds, swipedQueue]);

  // For now, show the first user in the filtered list
  const displayUser = displayUsers[0];

  useEffect(() => {
    // 1. Get history of swipes from server on mount
    socket.emit("get_swipes");

    const handleSwipesHistory = (ids: string[]) => {
      setSwipedUserIds(new Set(ids));
    };

    socket.on("swipes_history", handleSwipesHistory);

    // Optional: Listen for matches
    socket.on("new_match", ({ with: matchId }: { with: string }) => {
      // Could show a modal here
      console.log("It's a match with", matchId);
    });

    return () => {
      socket.off("swipes_history", handleSwipesHistory);
      socket.off("new_match");
    };
  }, [socket]);

  const handleSwipe = (direction: "right" | "left") => {
    if (!displayUser) return;

    console.log(`Swiping ${direction} on ${displayUser.name}`);

    // 1. Emit to server
    socket.emit("swipe", {
      to: displayUser.id.toString(),
      direction
    });

    // 2. Update local state to advance to next card
    setSwipedQueue(prev => [...prev, displayUser.id.toString()]);
  };

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
      <SwipeableCard onLike={() => handleSwipe("right")} onNope={() => handleSwipe("left")}>
        <ProfileCard
          name={displayUser.name}
          imageSrc={displayUser.mainPhoto}
          tags={displayUser.tags}
        />
      </SwipeableCard>

      {/* 2. Prompt 1 */}
      {displayUser.prompts?.[0] && (
        <SwipeableCard onLike={() => handleSwipe("right")} onNope={() => handleSwipe("left")}>
          <PromptCard
            question={displayUser.prompts[0].question}
            answer={displayUser.prompts[0].answer}
          />
        </SwipeableCard>
      )}

      {/* 3. Vitals */}
      <SwipeableCard onLike={() => handleSwipe("right")} onNope={() => handleSwipe("left")}>
        <VitalsCard
          age={displayUser.age}
          height={displayUser.height}
          stereotype={displayUser.stereotype}
          profession={displayUser.profession}
          location={displayUser.location}
        />
      </SwipeableCard>

      {/* 4-8. Photos */}
      {displayUser.photos?.map((photo, idx) => (
        <SwipeableCard key={`photo-${idx}`} onLike={() => handleSwipe("right")} onNope={() => handleSwipe("left")}>
          <PhotoCard imageSrc={photo} />
        </SwipeableCard>
      ))}

      {/* 9. Prompt 2 */}
      {displayUser.prompts?.[1] && (
        <SwipeableCard onLike={() => handleSwipe("right")} onNope={() => handleSwipe("left")}>
          <PromptCard
            question={displayUser.prompts[1].question}
            answer={displayUser.prompts[1].answer}
          />
        </SwipeableCard>
      )}

      {/* 10. Prompt 3 */}
      {displayUser.prompts?.[2] && (
        <SwipeableCard onLike={() => handleSwipe("right")} onNope={() => handleSwipe("left")}>
          <PromptCard
            question={displayUser.prompts[2].question}
            answer={displayUser.prompts[2].answer}
          />
        </SwipeableCard>
      )}
    </div>
  );
}
