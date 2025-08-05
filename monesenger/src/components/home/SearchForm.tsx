import React, { FormEvent } from 'react'

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
  return (
    <div className="mx-auto max-w-xl search-container">
        <form onSubmit={handleSearch} className="search-form">
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
