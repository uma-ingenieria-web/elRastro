"use client"

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { fetchWithToken } from '../../../../../lib/authFetch';

export default function ChangeUsernamePage() {
  const {data: session} = useSession()
  const [errorName, setErrorName] = useState("")
  const [messageName, setMessageName] = useState("")
  const [newName, setNewName] = useState("")

  async function sendChangeName(e: FormEvent) {
    e.preventDefault()
    try {
      if (newName === null || newName === "") {
        throw new Error("Could not update name")
      }
      const result = await fetchWithToken(`${process.env.NEXT_PUBLIC_BACKEND_CLIENT_USER_SERVICE?? "http://localhost:8000"}/api/v1/user/${session?.user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: newName
        })
      })
      if (!result.ok) {
        throw new Error("Could not update name")
      }
      setMessageName("Name updated successfully")
      setErrorName("")
    } catch (error) {
      setErrorName("Could not update name")
      setMessageName("")
    }
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8">
          <form method="POST" onSubmit={(e) => sendChangeName(e)} className="flex flex-col justify-center">
            <label htmlFor="changeNameInput" className='mb-2'>Change your name:</label>
            <input id="changeNameInput" type='text' maxLength={20} value={newName} onChange={(evt) => setNewName(evt.currentTarget.value)}/>
            <input type="submit" value="Submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2" />
            {errorName && <p className="text-red-500 font-bold text-center text-xs mt-1">{errorName}</p>}
            {messageName && <p className="text-green-500 text-xs mt-1 font-bold text-center">{messageName}</p>}
          </form>
      </div>
    </div>
  );
}


