"use client"

import Image, { ImageProps } from 'next/image'
import { useEffect, useState } from 'react'


interface ImageWithFallbackProps extends ImageProps {
    fallback?: ImageProps['src']
}

const ImageWithFallback = ({
    src,
    alt,
    width = 200,
    height = 200,
    fallback,
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
                set_imgSrc(fallback);
            }}
            {...props}
        />
    )
}

export default ImageWithFallback