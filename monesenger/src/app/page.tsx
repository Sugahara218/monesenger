import { GoogleMapContent } from '@/components/googleMap/GoogleMapContent';
// import { LatLngController } from '@/components/googleMap/MapMove';
// import MapComponent from '@/components/googleMap/MapComponent';
import { SearchSection } from '@/components/home/SearchSection';
// import NewPots from '@/components/timeLine/NewPost';
// import HotLikes from '@/components/likes/HotLikes';

// --- コンポーネント本体 ---
export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* <h1>🔥HOT🔥</h1>
      <HotLikes/> */}
      {/* <h1>♪ NEW ♪</h1> */}
      {/* <NewPots/> */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl title-glow floating">想い出を検索</h1>
        <p className="mt-3 text-lg text-gray-300 pulse-slow">お札のシリアルナンバーを入力して、そこに刻まれたストーリーを見つけよう。</p>
      </div>
      <GoogleMapContent />
      {/* <LatLngController/> */}
      <SearchSection/>

    </div>
  );
}