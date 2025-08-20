"use client"; 
import { useSearch } from '@/hooks/useSearch';
import { SearchForm } from '@/components/home/SearchForm';
import { SearchResult } from '@/components/home/SearchResult';
import { LogindPage } from './LogindPage';


export function SearchSection() {
  const {
    serial,
    setSerial,
    result,
    isLoading,
    ocrMessage,
    handleSearch,
    handleOcr,
  } = useSearch();

  return (
    <>
      {ocrMessage && <p className="text-center text-blue-400 shimmer">{ocrMessage}</p>}

      <SearchForm
      handleSearch={handleSearch}
      serial={serial}
      setSerial={setSerial}
      handleOcr={handleOcr}
      isLoading={isLoading}
      />

      <SearchResult result={result} />

      {/* 
      Clerkの認証状態が読み込み完了(isLoaded)してから、
      ログイン状態(isSignedIn)に応じて表示を切り替える
      */}
      <LogindPage/>
    </>
  );
}