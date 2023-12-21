import Link from 'next/link'
 

export default function Reserved() {
    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-r from-red-600 to-red-800">
            <div className="flex flex-col justify-center  text-center">
                <h2 className="text-4xl font-bold text-white text-center">Reserved checkout.</h2>
                <p className="text-white mb-5">This product&apos;s checkout is reserved for the winner of the auction.</p>
                <Link href="/" className="bg-white hover:bg-gray-300 text-black font-bold py-2 px-4 rounded">
                    Return Home
                </Link>
            </div>
        </div>
    )
}