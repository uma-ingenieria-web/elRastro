"use client"

import Image, { ImageProps } from 'next/image'
import { useEffect, useState } from 'react'

import fallbackImage from '../../../public/default_user.png'

interface ImageWithFallbackProps extends ImageProps {
    fallback?: ImageProps['src']
}

const ImageWithFallback = ({
    fallback = fallbackImage,
    src,
    alt,
    width = 200,
    height = 200,
    ...props
}: ImageWithFallbackProps) => {
    const [imgSrc, set_imgSrc] = useState(src)

    useEffect(() => {
        set_imgSrc(src)
    }, [src])
    return (
        <Image
            width={width}
            height={height}
            alt={alt}
            src={imgSrc}
            onError={() => {
                set_imgSrc(fallbackImage.src);
            }}
            {...props}
        />
    )
}

export default ImageWithFallback