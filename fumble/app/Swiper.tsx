

function shuffler(): number[]{
const userIDs: number[] = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];

let currentIndex = 19, randomIndex;


while (currentIndex !== 0 ){
	randomIndex = Math.floor(Math.random() * currentIndex);
	currentIndex--;

	[userIDs[currentIndex], userIDs[randomIndex]] = [userIDs[randomIndex], userIDs[currentIndex]];

	}

	return userIDs;
}


export default function Home(){
	return null;
}


