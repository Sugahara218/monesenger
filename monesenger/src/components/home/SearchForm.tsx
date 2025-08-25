import React, { FormEvent } from 'react'
import { useLatLngController } from '../googleMap/MapMove';
import { searchLocation } from '@/app/_actions';

export const SearchForm = ({
  handleSearch,
  serial,
  setSerial,
  handleOcr,
  isLoading,
}: {
  handleSearch: (e: FormEvent) => void;
  serial: string;
  setSerial: (value: string) => void;
  handleOcr: (file: File) => void;
  isLoading: boolean;
}) => {
  const moveMap = useLatLngController();
  return (
    <div className="mx-auto max-w-xl search-container">
        <form onSubmit={async (e)=>{
          handleSearch(e);
          const res = await searchLocation(serial);
          // console.log(res);
          if (res?.locations?.length && res?.locations[0] !== null) {
            const { lat, lng } = res?.locations[0];
            // console.log(lat, lng);
            moveMap({ lat, lng });
          }
        }} className="search-form">
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value.toUpperCase())}
            className="block w-full search-input px-3.5 py-2 text-white placeholder-gray-400 sm:text-sm sm:leading-6 "
            placeholder="例: AB1234567C"
            required
          />
          <input
            type="file"
            id="search-ocr-input"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files && handleOcr(e.target.files[0])}
          />
          <label htmlFor="search-ocr-input" className="camera-button-register">
            📷
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="register-button-Simple"
            
          >
            {isLoading ? (
              <>
                {/* <span className="loading-spinner"></span> */}
                検索中...
              </>
            ) : '検索'}
          </button>
        </form>
      </div>
  )
}
