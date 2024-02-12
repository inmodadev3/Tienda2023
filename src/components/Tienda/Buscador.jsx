import React, { useContext, useEffect, useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import Axios from '../../utilities/Axios'
import { ConsultarImagenes } from '../../utilities/Helpers'
import { UsuarioContext } from '../../routes/Routers'
import { useLocation, useNavigate } from 'react-router-dom'
import { default_price, texto_buscar } from '../../routes/QueryParams'
import RUTAS from '../../routes/PATHS'
import { IoMdClose } from 'react-icons/io'
import { BiSearch } from 'react-icons/bi'
import { soldOut } from '../../utilities/Imagenes'


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
                    setprecio(4)
                }
            }
        } catch (error) {
            console.error(error)

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
            case 5:
                return producto.IntPrecio5
            case 6:
                return producto.IntPrecio6
            case 7:
                return producto.IntPrecio7
            case 8:
                return producto.IntPrecio8
            default:
                return producto.IntPrecio4
        }
    }

    const modal_producto = (producto) => {
        let precio_producto = listas_Precios(parseInt(precio), producto)

        setproducto_Modal({
            referencia: producto.StrIdProducto,
            precio: precio_producto
        })
        setisViewModalProducto(true)
    }

    return (
        <div className='z-auto '>
            <div className='absolute top-4 left-32'>
                <div className={` hidden lg:flex bg-white items-center px-3 py-2 rounded-lg border-2 border-blue-600 w-80 justify-between`}>
                    <input
                        type='text'
                        placeholder='¿Qué deseas buscar?'
                        className='w-full bg-transparent outline-none'
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

            <div className='absolute flex top-4 left-4 lg:hidden'>
                <button onClick={() => { setviewMobileSearch(true) }} className='p-2 bg-gray-200 rounded-full' aria-label="Abrir el buscador en versión móvil">
                    <span><AiOutlineSearch size={25} /></span>
                </button>
            </div>


            {
                !viewMobileSearch ? (

                    texto.length > 0 && (
                        <div className='absolute pb-4 overflow-y-scroll rounded-lg min-w-80 min-h-12 bg-gray-50 top-16 left-32 max-h-80 Scroll-invisible'>
                            {
                                texto.length < 3 && (
                                    <div className='p-3'>
                                        <p className='text-sm font-medium'>Digite al menos 3 caracteres para buscar</p>
                                    </div>
                                )
                            }
                            {
                                (isLoadingData && texto.length > 2) && (
                                    <div className="p-4 mx-auto space-y-4 rounded-md w-80">
                                        <div className="flex space-x-4 animate-pulse">
                                            <div className="w-10 h-10 bg-gray-400 rounded"></div>
                                            <div className="flex-1 py-1 space-y-2">
                                                <div className="h-2 bg-gray-400 rounded"></div>
                                                <div className="w-24 h-2 bg-gray-400 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-4 animate-pulse">
                                            <div className="w-10 h-10 bg-gray-400 rounded"></div>
                                            <div className="flex-1 py-1 space-y-2">
                                                <div className="h-2 bg-gray-400 rounded"></div>
                                                <div className="w-24 h-2 bg-gray-400 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-4 animate-pulse">
                                            <div className="w-10 h-10 bg-gray-400 rounded"></div>
                                            <div className="flex-1 py-1 space-y-2">
                                                <div className="h-2 bg-gray-400 rounded"></div>
                                                <div className="w-24 h-2 bg-gray-400 rounded"></div>
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
                                                className='flex object-cover px-4 py-2 space-x-4 border-b border-gray-400 cursor-pointer w-80 hover:bg-gray-200'
                                                onClick={() => {
                                                    modal_producto(item)
                                                }}
                                            >
                                                <img
                                                    src={ConsultarImagenes(item.StrArchivo)}
                                                    className='w-16 h-16 rounded-full -2'
                                                    alt={`${item.StrDescripcion}`}
                                                    onError={(e) => {
                                                        e.target.src = soldOut
                                                    }}
                                                />
                                                <div className='flex-1 py-1 space-y-2'>
                                                    <p className='text-sm font-medium truncate w-52'>{item.StrDescripcion ? item.StrDescripcion : ""}</p>
                                                    <p className='text-xs font-medium text-blue-800 w-52'>{item.StrIdProducto ? item.StrIdProducto : ""}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='z-50 p-3 w-80'>
                                            <p className='text-sm font-medium'>Sin resultados...</p>
                                        </div>
                                    )
                                )
                            }
                            {
                                (Data !== null && Data.length == 30) &&
                                (
                                    Data.length > 0 && (
                                        <button className='flex items-center justify-center w-full my-4 transition-all hover:text-blue-500'
                                            onClick={() => {
                                                navigate(`${RUTAS.BUSCAR}?${parametro_sin_busqueda}&q=${texto}`)
                                                if (url.pathname === RUTAS.BUSCAR) {
                                                    window.location.reload()
                                                }
                                            }}

                                        >
                                            <p className='z-50 underline'>Ver todos los resultados</p>
                                        </button>
                                    )
                                )
                            }
                        </div>
                    )

                ) : (
                    viewMobileSearch && (
                        <div className='fixed top-0 left-0 z-30 w-screen min-h-screen px-1 py-24 bg-white md:px-12'>
                            <div className='flex justify-between my-8'>
                                <h3 className='text-lg font-medium text-blue-800'>Buscador</h3>
                                <p onClick={() => {
                                    setviewMobileSearch(false)
                                    settexto('')
                                }} className='flex items-center cursor-pointer gap-x-4'>
                                    <span>Cerrar</span>
                                    <span><IoMdClose size={20} /></span>
                                </p>
                            </div>
                            <div className='flex justify-between p-4 border border-gray-400 rounded-xl'>
                                <input
                                    type='text'
                                    placeholder='¿Qué deseas buscar?'
                                    className='w-full bg-transparent outline-none'
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
                                                <div className="w-full p-4 space-y-4 rounded-md ">
                                                    <div className="flex space-x-4 animate-pulse">
                                                        <div className="w-10 h-10 bg-gray-400 rounded"></div>
                                                        <div className="flex-1 py-1 space-y-2">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="w-24 h-2 bg-gray-400 rounded"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-4 animate-pulse">
                                                        <div className="w-10 h-10 bg-gray-400 rounded"></div>
                                                        <div className="flex-1 py-1 space-y-2">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="w-24 h-2 bg-gray-400 rounded"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-4 animate-pulse">
                                                        <div className="w-10 h-10 bg-gray-400 rounded"></div>
                                                        <div className="flex-1 py-1 space-y-2">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="w-24 h-2 bg-gray-400 rounded"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-4 animate-pulse">
                                                        <div className="w-10 h-10 bg-gray-400 rounded"></div>
                                                        <div className="flex-1 py-1 space-y-2">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="w-24 h-2 bg-gray-400 rounded"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-4 animate-pulse">
                                                        <div className="w-10 h-10 bg-gray-400 rounded"></div>
                                                        <div className="flex-1 py-1 space-y-2">
                                                            <div className="h-2 bg-gray-400 rounded"></div>
                                                            <div className="w-24 h-2 bg-gray-400 rounded"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        }

                                        <div className='overflow-x-hidden overflow-y-scroll h-96'>
                                            {
                                                Data !== null &&
                                                (
                                                    Data.length > 0 ? (
                                                        Data.map((item, index) => (
                                                            <div
                                                                key={index}
                                                                className='flex w-full px-4 py-2 space-x-4 border-b border-gray-400 cursor-pointer hover:bg-gray-300'
                                                                onClick={() => {
                                                                    modal_producto(item)
                                                                    setviewMobileSearch(false)
                                                                    settexto('')
                                                                }}
                                                            >
                                                                <img
                                                                    src={ConsultarImagenes(item.StrArchivo)}
                                                                    className='w-16 h-16'
                                                                    alt={`${item.StrDescripcion}`}
                                                                    onError={(e) => {
                                                                        e.target.src = soldOut
                                                                    }}
                                                                />
                                                                <div className='flex-1 py-1 space-y-2'>
                                                                    <p className='text-sm font-medium truncate w-52'>{item.StrDescripcion ? item.StrDescripcion : ""}</p>
                                                                    <p className='text-xs font-medium text-blue-800 w-52'>{item.StrIdProducto ? item.StrIdProducto : ""}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className='z-50 p-3 w-80'>
                                                            <p className='text-sm font-medium'>Sin resultados...</p>
                                                        </div>
                                                    )
                                                )
                                            }
                                            {
                                                (Data !== null && Data.length == 30) &&
                                                (
                                                    Data.length > 0 && (
                                                        <button className='flex items-center justify-center w-full my-4 transition-all hover:text-blue-500'
                                                            onClick={() => {
                                                                navigate(`${RUTAS.BUSCAR}?${parametro_sin_busqueda}&q=${texto}`)
                                                                if (url.pathname === RUTAS.BUSCAR) {
                                                                    window.location.reload()
                                                                }
                                                            }}

                                                        >
                                                            <p className='z-50 underline'>Ver todos los resultados</p>
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
