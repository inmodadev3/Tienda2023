import React, { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { texto_buscar } from '../routes/QueryParams';
import RUTAS from '../routes/PATHS';
import Axios from '../utilities/Axios';
import { useState } from 'react';
import { Productos } from '../components/Tienda/Productos';
import { AiOutlineArrowUp } from 'react-icons/ai';
import { Modal_Productos } from '../components/Productos/Modal_Productos';
import { ToastContainer } from 'react-toastify'
import { Header } from '../components/Header/Header';


export const Busquedas = () => {
    const url = useLocation()
    const navigate = useNavigate()
    const querySearchParams = new URLSearchParams(url.search);
    const parametro_sin_busqueda = new URLSearchParams(url.search);
    parametro_sin_busqueda.delete(texto_buscar);

    const [total_productos, settotal_productos] = useState(0)
    const [total_paginas, settotal_paginas] = useState(0)
    const [pagina, setpagina] = useState(0)
    const [arrayProductos, setarrayProductos] = useState(null)
    const [isLoadingProductos, setisLoadingProductos] = useState(false)
    const [isViewModalProducto, setisViewModalProducto] = useState(false)
    const [producto_Modal, setproducto_Modal] = useState(null)
    const [carritoTotalProductos, setcarritoTotalProductos] = useState(0)


    const focus_pagina = useRef(null)


    useEffect(() => {
        cantidad_productos()
    }, [])

    useEffect(() => {
        Productos_Busqueda()
    }, [pagina])


    const Productos_Busqueda = async () => {
        try {
            const { data } = await Axios.get(`productos/buscar/?p=${querySearchParams.get(texto_buscar)}&pag=${pagina}`)
            if (data.success) {
                if (arrayProductos !== null) {
                    setarrayProductos((prevData) => {
                        if (prevData !== null) {
                            return [...prevData, ...data.data]
                        }
                    })
                } else {
                    setarrayProductos(data.data)
                }

            }
        } catch (error) {
            console.error(error)
        }
    }

    const cantidad_productos = async () => {
        try {
            const { data } = await Axios.get(`productos/contar/busqueda?q=${querySearchParams.get(texto_buscar)}`)
            if (data.success) {
                settotal_productos(data.total)
                settotal_paginas(data.Paginas)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const focus_top_pagina = () => {
        if (focus_pagina.current) {
            focus_pagina.current.scrollIntoView({
                behavior: 'smooth',
            })
        }
    }


    return (
        <>

            <Header setisViewModalProducto={setisViewModalProducto} setproducto_Modal={setproducto_Modal} setcarritoTotalProductos={setcarritoTotalProductos} />

            <div ref={focus_pagina} >
                <div className='mt-24 mb-4 mx-10 md:mx-32'>
                    <div className='my-4 md:space-x-8 flex items-start space-y-3 md:space-y-0 '>
                        <a onClick={() => { navigate(`${RUTAS.TIENDA}?${parametro_sin_busqueda}`) }} className='cursor-pointer font-medium text-base hover:text-gray-500 transition-all underline'>Volver a la tienda</a>
                        <a onClick={() => { navigate(`${RUTAS.CARRITO}?${parametro_sin_busqueda}`) }} className='cursor-pointer font-medium text-base hover:text-gray-500 transition-all hidden underline md:flex'>Carrito</a>
                        <a onClick={() => { navigate(`${RUTAS.CHEKOUT}?${parametro_sin_busqueda}`) }} className='cursor-pointer font-medium text-base hover:text-gray-500 transition-all hidden underline md:flex'>Enviar pedido</a>
                    </div>
                    

                    <div className='flex flex-col'>
                        <h2>Resultados para la busqueda "{querySearchParams.get(texto_buscar)}"</h2>
                        <p>({total_productos}) productos</p>
                    </div>

                </div>

                <div className='mx-8 md:mx-20 pb-20'>
                    <Productos
                        arrayProductos={arrayProductos}
                        isLoadingProductos={isLoadingProductos}
                        pagina={pagina}
                        total_Paginas={total_paginas}
                        setpagina={setpagina}
                        setisViewModalProducto={setisViewModalProducto}
                        setproducto_Modal={setproducto_Modal}
                    />


                </div>
            </div>

            <div onClick={focus_top_pagina} className='fixed bottom-6 right-2 bg-blue-500 rounded-full p-2 cursor-pointer text-white transition-all hover:bg-blue-700'>
                <span><AiOutlineArrowUp size={32} /></span>
            </div>

            {(isViewModalProducto && producto_Modal !== null) && <Modal_Productos setisViewModalProducto={setisViewModalProducto} producto_Modal={producto_Modal} />}

            <ToastContainer />
        </>

    )
}
