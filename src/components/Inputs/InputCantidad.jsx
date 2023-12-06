import React from 'react'
import { IoIosAdd, IoMdRemove } from 'react-icons/io'

export const InputCantidad = (cambiar_cantidades,cantidad,setcantidad) => {
    return (
        <div className='border-2 border-gray-200 w-max flex rounded mt-2 items-center'>
            <button onClick={() => { cambiar_cantidades(2) }} className='bg-gray-100 h-full left-0 w-auto px-4 flex justify-center items-center cursor-pointer rounded-l py-2 border-r-2 border-r-gray-200'><IoMdRemove size={21} /></button>
            <input
                className='outline-none px-4 text-center w-16 appearance-none resize-none'
                type='number'
                min={1}
                value={cantidad}
                onChange={(e) => {
                    setcantidad(e.target.value)
                }}

            />
            <button onClick={() => { cambiar_cantidades(1) }} className='bg-gray-100 h-full left-0 w-auto px-4 flex justify-center items-center cursor-pointer rounded-r py-2 border-l-2 border-l-gray-200'><IoIosAdd size={21} /></button>
        </div>
    )
}
