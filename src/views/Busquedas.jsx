import React, { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { texto_buscar, vendedor_externo } from '../routes/QueryParams';
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
    const [arrayProductos, setarrayProductos] = useState([])
    const [isLoadingProductos, setisLoadingProductos] = useState(false)
    const [isViewModalProducto, setisViewModalProducto] = useState(false)
    const [producto_Modal, setproducto_Modal] = useState(null)
    const [carritoTotalProductos, setcarritoTotalProductos] = useState(0)
    const [isViewInfoInmoda, setisViewInfoInmoda] = useState(false)

    const [textValueSearch, settextValueSearch] = useState('')

    const focus_pagina = useRef(null)


    useEffect(() => {
        let infoInmoda = querySearchParams.get(vendedor_externo)
        settextValueSearch(querySearchParams.get(texto_buscar))
        if (infoInmoda) {
            setisViewInfoInmoda(false)
        } else {
            setisViewInfoInmoda(true)
        }
    }, [])

    useEffect(()=>{
        cantidad_productos()
    },[textValueSearch])

    useEffect(() => {
        Productos_Busqueda()
    }, [pagina,textValueSearch])


    const Productos_Busqueda = async () => {
        try {
            if (textValueSearch !== "") {
                const { data } = await Axios.get(`productos/buscar/?p=${textValueSearch}&pag=${pagina}`)
                if (data.success) {
                    if (arrayProductos.length > 0) {
                        setarrayProductos((prevData) => {
                            if (prevData !== null) {
                                return [...prevData, ...data.data]
                            }
                        })
                    } else {
                        setarrayProductos(data.data)
                    }

                } else {
                    if (data.data == 0) {
                        const { data } = await Axios.get(`productos/buscar/similares?p=${textValueSearch}`)
                        console.log(data)
                        settextValueSearch(data.data)
                    }
                }
            }

        } catch (error) {
            console.error(error)
        }
    }

    const cantidad_productos = async () => {
        try {
            if (textValueSearch !== "") {
                const { data } = await Axios.get(`productos/contar/busqueda?q=${textValueSearch}`)
                if (data.success) {
                    settotal_productos(data.total)
                    settotal_paginas(data.Paginas)
                }
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

            <Header setisViewModalProducto={setisViewModalProducto} setproducto_Modal={setproducto_Modal} setcarritoTotalProductos={setcarritoTotalProductos} isViewInfoInmoda={isViewInfoInmoda} />

            <div ref={focus_pagina} >
                <div className='mx-10 mt-24 mb-4 md:mx-32'>
                    <div className='flex items-start my-4 space-y-3 md:space-x-8 md:space-y-0 '>
                        <a onClick={() => { navigate(`${RUTAS.TIENDA}?${parametro_sin_busqueda}`) }} className='text-base font-medium underline transition-all cursor-pointer hover:text-gray-500'>Volver a la tienda</a>
                        <a onClick={() => { navigate(`${RUTAS.CARRITO}?${parametro_sin_busqueda}`) }} className='hidden text-base font-medium underline transition-all cursor-pointer hover:text-gray-500 md:flex'>Carrito</a>
                        <a onClick={() => { navigate(`${RUTAS.CHEKOUT}?${parametro_sin_busqueda}`) }} className='hidden text-base font-medium underline transition-all cursor-pointer hover:text-gray-500 md:flex'>Enviar pedido</a>
                    </div>


                    <div className='flex flex-col'>
                        <h2>Resultados para la busqueda "{textValueSearch}"</h2>
                        <p>({total_productos}) productos</p>
                    </div>

                </div>

                <div className='pb-20 mx-8 md:mx-20'>
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

            <div onClick={focus_top_pagina} className='fixed p-2 text-white transition-all bg-blue-500 rounded-full cursor-pointer bottom-6 right-2 hover:bg-blue-700'>
                <span><AiOutlineArrowUp size={32} /></span>
            </div>

            {(isViewModalProducto && producto_Modal !== null) && <Modal_Productos setisViewModalProducto={setisViewModalProducto} producto_Modal={producto_Modal} />}

            <ToastContainer />
        </>

    )
}
