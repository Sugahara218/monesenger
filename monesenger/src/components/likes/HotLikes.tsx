"use client"

import { useAuth } from "@clerk/nextjs";


export default function HotLikes (){
    const { isLoaded, isSignedIn } = useAuth();
    return (
        <>
            {isLoaded && !isSignedIn ? (
                <div className="Hotlikesdiv">
                    <ul className="Hotlikesul">
                        <li className="Hotlikesli">
                            <h4>タイトル</h4>
                            <p>メッセージ…</p>
                            <p><span style={{ color:"#fbbf24"}}>20</span>いいね</p>
                        </li>
                        <li className="Hotlikesli">
                            <h4>タイトル</h4>
                            <p>メッセージ…</p>
                            <p><span style={{ color:"#fbbf24"}}>20</span>いいね</p>
                        </li>
                        <li className="Hotlikesli">
                            <h4>タイトル</h4>
                            <p>メッセージ…</p>
                            <p><span style={{ color:"#fbbf24"}}>20</span>いいね</p>
                        </li>
                    </ul>
                </div>
            ) : (
                <div className="Hotlikesdiv">
                    <ul className="Hotlikesul">
                        <li className="Hotlikesli">
                            <h4>タイトル</h4>
                            <p>メッセージ…</p>
                            <p><span style={{ color:"#fbbf24"}}>20</span>いいね</p>
                        </li>
                        <li className="Hotlikesli">
                            <h4>タイトル</h4>
                            <p>メッセージ…</p>
                            <p><span style={{ color:"#fbbf24"}}>20</span>いいね</p>
                        </li>
                        <li className="Hotlikesli">
                            <h4>タイトル</h4>
                            <p>メッセージ…</p>
                            <p><span style={{ color:"#fbbf24"}}>20</span>いいね</p>
                        </li>
                    </ul>
                </div>
            )}
        </>
    )
}
