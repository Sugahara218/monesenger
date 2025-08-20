'use client'

import { APIProvider } from '@vis.gl/react-google-maps';
import { ReactNode } from 'react';

type Props = { children: ReactNode };

export default function GoogleMapsProvider({ children }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLEMAP_APIKEY || '';
  return (
    <APIProvider apiKey={apiKey} libraries={['marker']}>
      {children}
    </APIProvider>
  );
}


