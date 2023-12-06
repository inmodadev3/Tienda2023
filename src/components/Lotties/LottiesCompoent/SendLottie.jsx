import React from 'react'
import Lottie from 'lottie-react'
import sendLottieAnimation from '../Json/Animation_Send2.json'
 
 export const SendLottie = () => {
   return (
     <div className='w-52 h-52'>
        <Lottie 
            animationData={sendLottieAnimation}
            loop
            autoplay
            style={{width:'100%',height:'100%'}}
        />
     </div>
   )
 }
 