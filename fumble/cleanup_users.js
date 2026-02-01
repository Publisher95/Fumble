import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_FILE = join(__dirname, "app/data/users.json");
const PUBLIC_DIR = join(__dirname, "public");

const users = JSON.parse(readFileSync(USERS_FILE, "utf-8"));

let updatedCount = 0;

users.forEach(user => {
  // Check main photo
  const mainPath = join(PUBLIC_DIR, user.mainPhoto);
  if (!existsSync(mainPath)) {
    console.warn(`Warning: Main photo for user ${user.id} (${user.name}) not found: ${user.mainPhoto}`);
  }

  // Filter photos array
  const originalPhotos = user.photos || [];
  const validPhotos = originalPhotos.filter(photoPath => {
    const fullPath = join(PUBLIC_DIR, photoPath);
    return existsSync(fullPath);
  });

  if (validPhotos.length !== originalPhotos.length) {
    console.log(`User ${user.id}: Removed ${originalPhotos.length - validPhotos.length} missing photos.`);
    user.photos = validPhotos;
    updatedCount++;
  }
});

if (updatedCount > 0) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  console.log(`Updated ${updatedCount} user profiles.`);
} else {
  console.log("No changes needed.");
}
