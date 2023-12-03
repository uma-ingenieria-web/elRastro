
import ImageWithFallback from '@/app/components/ImageFallback';
import { Rating } from '../../../components/Rating'
import { Rate } from '../../../product.types';
import Settings from '@/app/components/Settings';

interface UserProfileProps {
  name: string;
  bio: string;
  avatarUrl: string;
}

export default async function ProfilePageId({ params }: { params: { id: string } }) {
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
    const [user_res, photo_res, url_res] = await Promise.all([
      fetch(userApiURL),
      fetch(photoApiURL),
      fetch(urlRating)
    ]);
    name = (await user_res.json())?.username;
    const photo_url = await photo_res.json() as string;
    const ratings_res = await url_res.json() as Rate[];
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <ImageWithFallback src={photo_url} alt={`Photo of ${name}`} />
            </div>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-black">{name}</h1>
          </div>
          <Rating ratings={ratings_res} />
          <Settings id={params.id}/>
          </div>
        </div>
    );
  } catch (error: any) {
    if (error.cause?.code === "ECONNREFUSED") {
      console.error(
        "Error connecting to backend API. Is backend service working?"
      )
    } else {
      console.error(
        error
      )
    }
  }
}


