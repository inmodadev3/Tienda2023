import React from 'react'
import { FiAlertCircle } from 'react-icons/fi'
import { ToastContainer,toast } from 'react-toastify'


export const ModalDeleteProducto = ({ closeEvent, texto, eventoAceptar }) => {

    
    return (
        <div className='w-screen h-screen fixed top-0 left-0 flex justify-center items-center'>
            <div onClick={() => { closeEvent(false) }} className='w-full h-full absolute bg-gray-700/50 z-10'></div>
            <section className='h-3/5 w-full md:w-4/5 lg:w-3/5 xl:w-2/5 bg-white z-20 rounded'>
                <article>
                    <span className='flex justify-center items-center py-12'><FiAlertCircle size={120} color='red' /></span>
                </article>
                <article>
                    <p className='text-center font-medium text-lg'>{texto}</p>
                </article>
                <div className='flex justify-center items-center my-12 gap-x-12'>
                    <button onClick={() => { closeEvent(false) }} className='bg-blue-950 text-white px-8 py-2 rounded-lg border-2 border-blue-950 hover:bg-white hover:text-blue-950 transition-all'>Cancerlar</button>
                    <button
                    onClick={eventoAceptar}
                    className='bg-sky-500 text-white px-8 py-2 rounded-lg border-2 border-sky-500 hover:bg-white hover:text-sky-500 transition-all'
                    >Aceptar</button>
                </div>
            </section>
            <ToastContainer/>
        </div>
    )
}
