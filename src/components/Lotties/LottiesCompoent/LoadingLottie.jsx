import Lottie from 'lottie-react'
import React from 'react'
import LoadingAnimation from '../Json/Animation_Loading.json'

export const LoadingLottie = () => {
    return (
        <div className='w-52 h-52'>
            <Lottie
                animationData={LoadingAnimation}
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    )
}
