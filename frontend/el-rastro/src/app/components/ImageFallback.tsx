import Image, { ImageProps } from 'next/image'
import { useEffect, useState } from 'react'

import fallbackImage from '../../../public/default_user.png'

interface ImageWithFallbackProps extends ImageProps {
  fallback?: ImageProps['src']
}


const ImageWithFallback = ({
    fallback = fallbackImage,
    alt,
    src,
    width = 200,
    heigth = 200,
    ...props
}) => {
    const [error, setError] = useState(null)

    useEffect(() => {
        setError(null)
    }, [src])

    return (
        <Image
            width={width}
            
            height={heigth}
            alt={alt}
            onError={setError}
            src={error ? fallbackImage : src}
            {...props}
        />
    )
}

export default ImageWithFallback