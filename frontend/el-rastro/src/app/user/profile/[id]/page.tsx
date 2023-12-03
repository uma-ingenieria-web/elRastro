"use client"

import ImageWithFallback from '@/app/components/ImageFallback';
import { Rating } from '../../../components/Rating'
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Rate } from '../../../product.types';
interface UserProfileProps {
  name: string;
  bio: string;
  avatarUrl: string;
}

export default async function ProfilePageId({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { id } = params;
  let photoApiURL = '';
  let userApiURL = '';
  let urlRating = '';
  let name = "User Not Found";
  if (process.env.NODE_ENV === 'development') {
    photoApiURL = `http://localhost:8003/api/v1/photo/${id}`;
    userApiURL = `http://localhost:8000/api/v1/user/${id}`;
    urlRating = `http://localhost:8007/api/v2/users/${id}/ratings`;
  } else {
    photoApiURL = `http://backend-micro-image-storage/api/v1/photo/${id}`;
  }

  try {
    const result = await fetch(userApiURL);
    name = (await result.json())?.username;
    const photo_result = await fetch(photoApiURL);
    const url = await photo_result.json();
    const res = await fetch(urlRating);
    const ratings_res = await res.json() as Rate[];
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <ImageWithFallback src={url} alt={`Photo of ${name}`} />
            </div>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-black">{name}</h1>
          </div>
          <Rating ratings={ratings_res} />
          {session?.user?.id === id && (<div className="flex flex-col justify-center mt-4">
            <Link href={`/user/settings/new-photo`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2" >
              Add new photo
            </Link>
            <Link href={`/user/settings/change-name`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" >
              Change username
            </Link>
          </div>)}
        </div>
      </div>
    );
  } catch (error: any) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error(
        "Error connecting to backend API. Is backend service working?"
      )
    }
  }
}


