import React from 'react'
import Lottie from 'lottie-react'
import EmptyAnimation from '../Json/Animation_Empty2.json'

export const EmptyLottie = () => {
    return (
        <div className='w-52 h-52'>
            <Lottie
                animationData={EmptyAnimation}
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    )
}
