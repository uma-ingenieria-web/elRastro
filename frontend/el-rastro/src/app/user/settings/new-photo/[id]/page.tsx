"use client"

import { useState } from 'react';

export default function ProfilePageId({ params }: { params: { id: string } }) {
  const { id } = params;
  const [file, setFile] = useState<File | null>(null);

  let apiUrl = '';
  if (process.env.NODE_ENV === 'development') {
    apiUrl = `http://localhost:8003/api/v1/photo/${id}`;
  } else {
    apiUrl = `http://backend-micro-image-storage/api/v1/photo/${id}`;
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
        const response = await fetch(apiUrl, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.log('File uploaded successfully');
        } else {
          console.error('Error uploading file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
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
      </div>
    </div>
  );
}


