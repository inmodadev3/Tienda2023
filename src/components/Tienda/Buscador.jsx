import React, { useContext, useEffect, useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import Axios from '../../utilities/Axios'
import { ConsultarImagenes, FormateoNumberInt } from '../../utilities/Helpers'
import { UsuarioContext } from '../../routes/Routers'
import { useLocation, useNavigate } from 'react-router-dom'
import { default_price, texto_buscar } from '../../routes/QueryParams'
import { Modal_Productos } from '../Productos/Modal_Productos'
import RUTAS from '../../routes/PATHS'
import { IoMdClose } from 'react-icons/io'
import { BiSearch } from 'react-icons/bi'


export const Buscador = ({ setisViewModalProducto, setproducto_Modal }) => {
    const [texto, settexto] = useState('')
    const [Data, setData] = useState(null)
    const [isLoadingData, setisLoadingData] = useState(false)
    const [precio, setprecio] = useState(0)
    const [viewMobileSearch, setviewMobileSearch] = useState(false)

    const { usuario } = useContext(UsuarioContext)
    const url = useLocation()
    const querySearchParams = new URLSearchParams(url.search);
    const parametro_sin_busqueda = new URLSearchParams(url.search);
    parametro_sin_busqueda.delete(texto_buscar);
    const navigate = useNavigate()

    useEffect(() => {
        let timer;
        setData(null)

        if (texto.length > 2) {
            clearTimeout(timer)
            setisLoadingData(true)
            timer = setTimeout(() => {
                Buscar_Productos()
            }, 1500);
        }

        return () => {
            clearTimeout(timer)
        }
    }, [texto])

    useEffect(() => {
        definirPrecio()
    }, [Data])


    const Buscar_Productos = async () => {
        try {
            const { data } = await Axios.get(`productos/buscar/?p=${texto}`)
            if (data.success) {
                setData(data.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setisLoadingData(false)
        }
    }

    const definirPrecio = () => {
        const precio_default = querySearchParams.get(default_price)
        try {

            if (precio_default) {
                setprecio(precio_default)
            } else {
                if (usuario) {
                    setprecio(usuario.IntPrecio)
                } else {
                    setprecio(3)
                }
            }
        } catch (error) {
            console.log(error)

        }
    }

    const listas_Precios = (precio, producto) => {
        switch (precio) {
            case 1:
                return producto.IntPrecio1
            case 2:
                return producto.IntPrecio2
            case 3:
                return producto.IntPrecio3
            case 4:
                return producto.IntPrecio4
            default:
                return producto.IntPrecio3
        }
    }

    const modal_producto = (producto) => {
        console.log(producto)
        let precio_producto = listas_Precios(parseInt(precio), producto)

        setproducto_Modal({
            referencia: producto.StrIdProducto,
            precio: precio_producto
        })
        setisViewModalProducto(true)
    }

    return (
        <div className=' z-auto'>
            <div className='absolute top-4 left-32'>
                <div className={` hidden lg:flex bg-white items-center px-3 py-2 rounded-lg border-2 border-blue-600 w-80 justify-between`}>
                    <input
                        type='text'
                        placeholder='¿Qué deseas buscar?'
                        className='bg-transparent outline-none w-full'
                        onChange={(e) => { settexto(e.target.value) }}
                        value={texto}
                        onKeyUp={(e) => {
                            if (e.keyCode == 13) {
                                navigate(`${RUTAS.BUSCAR}?${parametro_sin_busqueda}&q=${texto}`)
                                if (url.pathname === RUTAS.BUSCAR) {
                                    window.location.reload()
                                }
                            }
                        }}
                    />

                </div>
            </div>

            <div className='absolute top-4 left-4 flex lg:hidden'>
                <button onClick={() => { setviewMobileSearch(true) }} className='bg-gray-200 p-2 rounded-full'><AiOutlineSearch size={25} /></button>
            </div>


            {
                !viewMobileSearch ? (

                    texto.length > 0 && (
                        <div className='min-w-80 min-h-12 bg-gray-50 absolute top-16 left-32 rounded-lg overflow-y-scroll max-h-80 Scroll-invisible pb-4'>
                            {
                                texto.length < 3 && (
                                    <div className='p-3'>
                                        <p className='text-sm font-medium'>Digite al menos 3 caracteres para buscar</p>
                                    </div>
                                )
                            }
                            {
                                (isLoadingData && texto.length > 2) && (
                                    <div className=" rounded-md p-4 w-80 mx-auto space-y-4">
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="rounded bg-gray-400 h-10 w-10"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-2 bg-gray-400 rounded"></div>
                                                <div className="h-2 bg-gray-400 rounded w-24"></div>
                                            </div>
                                        </div>
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="rounded bg-gray-400 h-10 w-10"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-2 bg-gray-400 rounded"></div>
                                                <div className="h-2 bg-gray-400 rounded w-24"></div>
                                            </div>
                                        </div>
                                        <div className="animate-pulse flex space-x-4">
                                            <div className="rounded bg-gray-400 h-10 w-10"></div>
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-2 bg-gray-400 rounded"></div>
                                                <div className="h-2 bg-gray-400 rounded w-24"></div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                Data !== null &&
                                (
                                    Data.length > 0 ? (
                                        Data.map((item, index) => (
                                            <div
                                                key={index}
                                                className='flex space-x-4 py-2 w-80 border-b border-gray-400 cursor-pointer hover:bg-gray-200 px-4 object-cover'
                                                onClick={() => {
                                                    modal_producto(item)
                                                }}
                                            >
                                                <img
                                                    src={ConsultarImagenes(item.StrArchivo)}
                                                    className='w-16 h-16 rounded-full -2'
                                                    alt='Imagen de producto'
                                                />
                                                <div className='flex-1 space-y-2 py-1'>
                                                    <p className='w-52 truncate font-medium text-sm'>{item.StrDescripcion ? item.StrDescripcion : ""}</p>
                                                    <p className='w-52 font-medium text-xs text-blue-800'>{item.StrIdProducto ? item.StrIdProducto : ""}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='p-3 w-80 z-50'>
                                            <p className='text-sm font-medium'>Sin resultados...</p>
                                        </div>
                                    )
                                )
                            }
                            {
                                (Data !== null && Data.length == 30) &&
                                (
                                    Data.length > 0 && (
                                        <button className='flex justify-center items-center w-full my-4 hover:text-blue-500 transition-all'
                                            onClick={() => {
                                                navigate(`${RUTAS.BUSCAR}?${parametro_sin_busqueda}&q=${texto}`)
                                                if (url.pathname === RUTAS.BUSCAR) {
                                                    window.location.reload()
                                                }
                                            }}

                                        >
                                            <p className='underline z-50'>Ver todos los resultados</p>
                                        </button>
                                    )
                                )
                            }
                        </div>
                    )

                ) : (
                    viewMobileSearch && (
                        <div className='fixed w-screen min-h-screen bg-white top-0 left-0 z-30 md:px-12 px-1 py-24'>
                            <div className='flex justify-between my-8'>
                                <h3 className='text-lg text-blue-800 font-medium'>Buscador</h3>
                                <p onClick={() => {
                                    setviewMobileSearch(false)
                                    settexto('')
                                }} className='flex items-center gap-x-4 cursor-pointer'>
                                    <span>Cerrar</span>
                                    <span><IoMdClose size={20} /></span>
                                </p>
                            </div>
                            <div className='flex justify-between border border-gray-400 rounded-xl p-4'>
                                <input
                                    type='text'
                                    placeholder='¿Qué deseas buscar?'
                                    className='bg-transparent outline-none w-full'
                                    onChange={(e) => { settexto(e.target.value) }}
                                    value={texto}
                                    onKeyUp={(e) => {
                                        if (e.keyCode == 13) {
                                            navigate(`${RUTAS.BUSCAR}?${parametro_sin_busqueda}&q=${texto}`)
                                            if (url.pathname === RUTAS.BUSCAR) {
                                                window.location.reload()
                                            }
                                        }
                                    }}
                                />

                                <span><BiSearch size={20} /></span>
                            </div>

                            {
                                texto.length > 0 && (
                                    <>
                                        {
                                            texto.length < 3 && (
                                                <div className='p-3'>
                                                    <p className='text-sm font-medium'>Digite al menos 3 caracteres para buscar</p>
                                                </div>
                                            )
                                        }
                                        {
                                            isLoadingData && (
                                                <div className=" rounded-md p-4 w-full space-y-4">
                                                    <div className="animate-pulse flex space-x-4">
                                                        <div className="rounded bg-gray-400 h-10 w-10"></div>
                                                        <div className="flex-1 space-y-2 py-1">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="h-2 bg-gray-400 rounded w-24"></div>
                                                        </div>
                                                    </div>
                                                    <div className="animate-pulse flex space-x-4">
                                                        <div className="rounded bg-gray-400 h-10 w-10"></div>
                                                        <div className="flex-1 space-y-2 py-1">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="h-2 bg-gray-400 rounded w-24"></div>
                                                        </div>
                                                    </div>
                                                    <div className="animate-pulse flex space-x-4">
                                                        <div className="rounded bg-gray-400 h-10 w-10"></div>
                                                        <div className="flex-1 space-y-2 py-1">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="h-2 bg-gray-400 rounded w-24"></div>
                                                        </div>
                                                    </div>
                                                    <div className="animate-pulse flex space-x-4">
                                                        <div className="rounded bg-gray-400 h-10 w-10"></div>
                                                        <div className="flex-1 space-y-2 py-1">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="h-2 bg-gray-400 rounded w-24"></div>
                                                        </div>
                                                    </div>
                                                    <div className="animate-pulse flex space-x-4">
                                                        <div className="rounded bg-gray-400 h-10 w-10"></div>
                                                        <div className="flex-1 space-y-2 py-1">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="h-2 bg-gray-400 rounded w-24"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        <div className=' h-96 overflow-y-scroll overflow-x-hidden'>
                                            {
                                                Data !== null &&
                                                (
                                                    Data.length > 0 ? (
                                                        Data.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className='flex space-x-4 py-2 w-full border-b border-gray-400 cursor-pointer hover:bg-gray-300 px-4'
                                                                onClick={() => {
                                                                    modal_producto(item)
                                                                    setviewMobileSearch(false)
                                                                    settexto('')
                                                                }}
                                                            >
                                                                <img
                                                                    src={ConsultarImagenes(item.StrArchivo)}
                                                                    className='w-16 h-16'
                                                                    alt='Imagen de producto'
                                                                />
                                                                <div className='flex-1 space-y-2 py-1'>
                                                                    <p className='w-52 truncate font-medium text-sm'>{item.StrDescripcion ? item.StrDescripcion : ""}</p>
                                                                    <p className='w-52 font-medium text-xs text-blue-800'>{item.StrIdProducto ? item.StrIdProducto : ""}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className='p-3 w-80 z-50'>
                                                            <p className='text-sm font-medium'>Sin resultados...</p>
                                                        </div>
                                                    )
                                                )
                                            }
                                            {
                                                (Data !== null && Data.length == 30) &&
                                                (
                                                    Data.length > 0 && (
                                                        <button className='flex justify-center items-center w-full my-4 hover:text-blue-500 transition-all'
                                                            onClick={() => {
                                                                navigate(`${RUTAS.BUSCAR}?${parametro_sin_busqueda}&q=${texto}`)
                                                                if (url.pathname === RUTAS.BUSCAR) {
                                                                    window.location.reload()
                                                                }
                                                            }}

                                                        >
                                                            <p className='underline z-50'>Ver todos los resultados</p>
                                                        </button>
                                                    )
                                                )
                                            }
                                        </div>
                                    </>
                                )
                            }

                        </div>
                    )
                )
            }

        </div>

    )
}
