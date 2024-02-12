import React, { useContext, useEffect, useState } from 'react'
import { Inmoda_Logo, Tienda_Banner } from '../../utilities/Imagenes'
import { AiOutlineUser } from 'react-icons/ai'
import { Buscador } from '../Tienda/Buscador'
import { UsuarioContext } from '../../routes/Routers'
import { useLocation, useNavigate } from 'react-router-dom'
import { default_price } from '../../routes/QueryParams'
import { ToastContainer, toast } from 'react-toastify'
import RUTAS from '../../routes/PATHS'
import Axios from '../../utilities/Axios'

export const Header = ({ setisViewModalProducto, setproducto_Modal, setcarritoTotalProductos, isViewInfoInmoda }) => {
    const [viewUsuario, setviewUsuario] = useState(true)
    const { usuario, setUsuario } = useContext(UsuarioContext)
    const [isViewUserOPtions, setisViewUserOPtions] = useState(false)

    const url = useLocation()
    const querySearchParams = new URLSearchParams(url.search);
    const navigate = useNavigate()


    useEffect(() => {
        let usuario = JSON.parse(localStorage.getItem("usuario"))
        let precio_default = querySearchParams.get(default_price)
        let carrito = JSON.parse(localStorage.getItem("carrito"))

        if (precio_default) {
            setviewUsuario(false)
            if (carrito) {
                setcarritoTotalProductos(carrito.length ? carrito.length : 0)
            }
        } else {
            if (usuario) {
                setUsuario(usuario)
                Calcular_Total_Carrito_Usuario(usuario)
            }
        }

    }, [])

    const cerrar_Session = () => {
        localStorage.removeItem("usuario")
        window.location.reload()
    }

    const Calcular_Total_Carrito_Usuario = async (usuario) => {
        try {
            const response = await Axios.get(`pedidos/cantidades/${usuario.StrIdTercero}`)
            setcarritoTotalProductos(response.data.data)
        } catch (error) {
            toast.error(` ${error.response.data.message}`, {
                closeOnClick: true,
                theme: 'colored',
                autoClose: 2000,
                position: 'top-right',
                hideProgressBar: true
            })
        }
    }



    return (
        <section className='relative w-full h-80'>
            {/* Banner Inmoda */}
            {
                isViewInfoInmoda ? (
                    <img
                        src={Tienda_Banner}
                        alt='Banner de inicio para tienda de INMODA FANTASY S.A.S'
                        className='object-cover w-full h-full'
                        loading='lazy'
                    />
                ) :
                    (
                        <div className='object-cover w-full h-full bg-gray-200'>

                        </div>
                    )
            }
            {/* Logo Inmoda */}
            {
                isViewInfoInmoda ? (
                    <div className='absolute left-0 right-0 flex items-center justify-center w-32 h-32 m-auto bg-white rounded-full -bottom-12 md:-bottom-20 md:right-auto md:left-20'>
                        <img
                            src={Inmoda_Logo}
                            alt='Logo de compañia INMODA FANTASY S.A.S'
                            className='w-full p-2 border-2 rounded-full border-blue-800/50'
                        />
                    </div>
                ):(
                    <div>
                        
                    </div>
                )
            }


            <h1 className='absolute hidden text-xl font-bold text-gray-600 truncate md:flex left-4 md:left-60 -bottom-10'>{isViewInfoInmoda ? "IN MODA FANTASY S.A.S" : "Productos"}</h1>

            {/* LOGIN */}
            {
                viewUsuario ?
                    usuario !== null ?
                        (
                            <div className='absolute top-4 right-2 md:right-12 [&>div]:bg-white [&>div]:px-4 [&>div]:py-2 [&>div]:rounded-xl'>
                                <div
                                    className='flex items-center transition-all cursor-pointer gap-x-2 hover:scale-105 hover:-translate-y-1'
                                    onClick={() => { setisViewUserOPtions(!isViewUserOPtions) }}
                                >
                                    <span className='w-48 truncate md:w-auto'>{usuario.StrNombre ? usuario.StrNombre : "usuario"}</span>
                                </div>
                                <div className={` ${isViewUserOPtions ? "flex" : "hidden"} relative mt-2 flex-col gap-y-3 [&>span]:cursor-pointer`}>
                                    {/* <span onClick={() => { navigate(RUTAS.PERFIL) }} className='flex items-center py-1 font-medium text-gray-600 hover:-translate-x-1 hover:text-blue-700'>Ver perfil</span> */}
                                    <span
                                        onClick={cerrar_Session}
                                        className='flex items-center py-1 font-medium text-gray-600 border-t-2 hover:-translate-x-1 hover:text-blue-700 border-t-gray-300'
                                    >
                                        Cerrar sesion
                                    </span>
                                </div>
                            </div>

                        ) : (
                            <button
                                onClick={() => { navigate(`${RUTAS.LOGIN}?${querySearchParams}`) }}
                                className='absolute flex items-center px-4 py-2 transition-all bg-white top-4 right-2 md:right-12 rounded-xl gap-x-2 hover:scale-105 hover:-translate-y-1'
                            >
                                <span>Iniciar sesión</span>
                                <span><AiOutlineUser size={20} /></span>
                            </button>
                        )
                    : ""
            }
            <Buscador setisViewModalProducto={setisViewModalProducto} setproducto_Modal={setproducto_Modal} />
            <ToastContainer />
        </section>
    )
}
