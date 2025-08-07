// 修正後の LikedButton.tsx
"use client"
import { useAuth } from "@clerk/nextjs";

export default function LikedButton() {
  // const [optimisticLikeCount, addOptimisticLike] = useOptimistic(
  //   initialLikeCount,
  //   (state) => state + 1
  // );
  const { isLoaded, isSignedIn } = useAuth();

  return (
    // action属性に直接async関数を記述します
    isLoaded && isSignedIn && (
      <form>
      <button
        type="submit"
        className="register-button-Simple"
        style={{ width: "100%" }}
      >
        {/* <span style={{ color:"#fbbf24"}}>{optimisticLikeCount}</span>  */}
        いいね
      </button>
    </form>
    )
  );
}