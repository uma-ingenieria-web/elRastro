"use client"

import InteractiveMap from '@/app/components/InteractiveMap';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { fetchWithToken } from '../../../../../lib/authFetch';


export default function ChangeUserLocation() {
  const [position, setPosition] = useState<[number, number]>([36.715992, -4.477982])
  const { data: session } = useSession();
  const id = session?.user?.id;

  return (
    <>
      <InteractiveMap position={position} setPosition={setPosition} />
      <h1
        className="items-center text-center mt-2 py-1 font-bold text-2xl"
      >Values</h1>
      <form
        className="flex flex-col items-center space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          fetchWithToken(`${process.env.NEXT_PUBLIC_BACKEND_CLIENT_USER_SERVICE?? "http://localhost:8000"}/api/v1/user/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ location: { lat: position[0], lon: position[1] } })
          })
        }}
      >
        <label htmlFor="latitude">Latitude</label>
        <input
          className="border border-gray-300 rounded-md px-2 py-1"
          type="number"
          step="0.001"
          name="latitude"
          id="latitude"
          value={position[0]}
          onChange={(e) => setPosition([parseFloat(e.target.value), position[1]])}
        />
        <br />
        <label htmlFor="longitude">Longitude</label>
        <input
          className="border border-gray-300 rounded-md px-2 py-1"
          type="number"
          step="0.001"
          name="longitude"
          id="longitude"
          value={position[1]}
          onChange={(e) => setPosition([position[0], parseFloat(e.target.value)])}
        />
        <input
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          type="submit"
          value="Submit"
        />
      </form>
    </>
  );
}


