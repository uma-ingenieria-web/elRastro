import ImageWithFallback from '@/app/components/ImageFallback';
import { Rating } from '../../../components/Rating'
import { Rate } from '../../../product.types';
import Settings from '@/app/components/Settings';
import userFallbackImage from '../../../../../public/default_user.svg'

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
    const [user_promise, photo_promise, url_promise] = await Promise.allSettled([
      fetch(userApiURL),
      fetch(photoApiURL),
      fetch(urlRating)
    ]);

    const userResult = user_promise.status === 'fulfilled' && user_promise.value.status == 200 ? await user_promise.value.json() : null;
    const photoResult = photo_promise.status === 'fulfilled' && photo_promise.value.status == 200 ? await photo_promise.value.json() : null;
    const urlResult = url_promise.status === 'fulfilled' && url_promise.value.status == 200 ? await url_promise.value.json() : null;

    name = userResult?.username.split("#")[0] || "User Not Found";
    const photo_url = photoResult as string;
    const ratings = urlResult as Rate[];
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <ImageWithFallback src={photo_url} alt={`Photo of ${name}`} fallback={userFallbackImage.src} />
            </div>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl font-bold text-black">{name}</h1>
          </div>
          {ratings && <Rating ratings={ratings} />}
          <Settings id={params.id} />
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


