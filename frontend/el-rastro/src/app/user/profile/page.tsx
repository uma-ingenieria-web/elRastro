import { redirect } from 'next/navigation';
import Image from 'next/image'

export default async function ProfilePageNoId() {
  const id = 1234; // TODO - Get from context;
  return redirect(`/user/profile/${id}`);
  
}


