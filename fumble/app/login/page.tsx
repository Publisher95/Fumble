"use client";

import { useState } from "react";
import ProfileCard from "./components/ProfileCard";
import PromptCard from "./components/PromptCard";
import VitalsCard from "./components/VitalsCard";
import PhotoCard from "./components/PhotoCard";
import SwipeableCard from "./components/SwipeableCard";
import LoginView from "./components/LoginView";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <main className="min-h-screen w-full bg-[#f4f4f5] flex justify-center">
      <div className="w-full max-w-md bg-[#f4f4f5] min-h-screen flex flex-col gap-3 p-3 pb-10 overflow-x-hidden">

        {/* 1. Hero Profile Card */}
        <SwipeableCard onLike={() => console.log("Liked Profile Photo")}>
          <ProfileCard
            name="Rylee Johnston"
            imageSrc="/profile-main.png"
            tags={["Looksmaxing", "Trapezing", "Donating to Charity"]}
          />
        </SwipeableCard>

        {/* 2. Prompt */}
        <SwipeableCard onLike={() => console.log("Liked Prompt 1")}>
          <PromptCard
            question="A fun fact about me"
            answer="I once ate a whole pizza in one sitting and didn't regret it."
          />
        </SwipeableCard>

        {/* 3. Vitals */}
        <SwipeableCard onLike={() => console.log("Liked Vitals")}>
          <VitalsCard
            age={24}
            height="5'7&quot;"
            stereotype="Gamer"
            profession="Product Designer"
            location="Brooklyn, NY"
            relationshipType="Monogamy"
          />
        </SwipeableCard>

        {/* 4. Photo */}
        <SwipeableCard onLike={() => console.log("Liked Photo 1")}>
          <PhotoCard />
        </SwipeableCard>

        {/* 5. Photo */}
        <SwipeableCard onLike={() => console.log("Liked Photo 2")}>
          <PhotoCard />
        </SwipeableCard>

        {/* 6. Prompt */}
        <SwipeableCard onLike={() => console.log("Liked Prompt 2")}>
          <PromptCard
            question="Dating me is like"
            answer="Finding a needle in a haystack, but the needle is made of chocolate."
          />
        </SwipeableCard>

        {/* 7. Photo */}
        <SwipeableCard onLike={() => console.log("Liked Photo 3")}>
          <PhotoCard />
        </SwipeableCard>

        {/* 8. Prompt */}
        <SwipeableCard onLike={() => console.log("Liked Prompt 3")}>
          <PromptCard
            question="My simple pleasures"
            answer="Morning coffee, sunset walks, and the smell of old books."
          />
        </SwipeableCard>

        {/* 9. Photo */}
        <SwipeableCard onLike={() => console.log("Liked Photo 4")}>
          <PhotoCard />
        </SwipeableCard>

        {/* 10. Photo */}
        <SwipeableCard onLike={() => console.log("Liked Photo 5")}>
          <PhotoCard />
        </SwipeableCard>

        {/* Bottom padding/space */}
        <div className="h-10" />
      </div>
    </main>
  );
}
