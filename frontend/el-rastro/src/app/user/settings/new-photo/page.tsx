"use client"

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { fetchWithToken } from '../../../../../lib/authFetch';

export default function ProfilePageId() {
  const {data: session} = useSession()
  const id = session?.user?.id;
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  let apiUrl = '';
  if (process.env.NODE_ENV === 'development') {
    apiUrl = `http://localhost:8003/api/v1/photo/${id}`;
  } else {
    apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_CLIENT_IMAGE_STORAGE_SERVICE?? "http://localhost:8003"}/api/v1/photo/${id}`;
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };
  
  
  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetchWithToken(apiUrl, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          setStatus('File uploaded successfully');
        } else {
          throw new Error('Error uploading file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setStatus('Error uploading file');
      }
    }
  };


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-center">
          <input type="file" onChange={handleFileChange} />
          <button className='text-black' onClick={handleUpload}>Upload</button>
        </div>
        <div className="text-center mt-4">
          <h1 className="text-2xl font-bold text-black">{status}</h1>
      </div>
    </div>
    </div>
  );
}


