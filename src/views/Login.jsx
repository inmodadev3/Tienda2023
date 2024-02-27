import React, { useContext, useEffect, useState } from 'react'
import { Inmoda_Logo } from '../utilities/Imagenes'
import { BiArrowBack } from 'react-icons/bi'
import { useLocation, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import RUTAS from '../routes/PATHS'
import Axios from '../utilities/Axios'
import { UsuarioContext } from '../routes/Routers'
import { default_price } from '../routes/QueryParams'

export const Login = () => {
    const navigate = useNavigate()
    const url = useLocation()
    const querySearchParams = new URLSearchParams(url.search)
    const precio_default = querySearchParams.get(default_price)
    const { usuario } = useContext(UsuarioContext)

    const [identificacion, setidentificacion] = useState('')
    const [clave, setclave] = useState('')
    const [validando, setvalidando] = useState(false)

    useEffect(() => {
        if (precio_default) {
            navigate(`${RUTAS.TIENDA}?${querySearchParams}`)
        } else {
            if (localStorage.getItem('usuario') !== null) {
                navigate(`${RUTAS.TIENDA}?${querySearchParams}`)
            }
        }
    }, [])


    const Login = async () => {
        setvalidando(true)
        try {
            const usuario = await Axios.post('/login', { idTercero: identificacion, clave: clave })
            if (usuario.data.success) {
                if (usuario.data.data.length !== 0) {
                    localStorage.setItem("usuario", JSON.stringify(usuario.data.data))
                    toast.success(usuario.data.messagge, {
                        closeOnClick: true,
                        theme: 'colored',
                        autoClose: 1000,
                        position: 'top-right',
                        hideProgressBar: true
                    })
                    setTimeout(() => {
                        navigate(`${RUTAS.TIENDA}?${querySearchParams}`)
                    }, 1000);
                } else {
                    toast.info(usuario.data.messagge, {
                        closeOnClick: true,
                        theme: 'colored',
                        autoClose: 2000,
                        position: 'top-right',
                        hideProgressBar: true
                    })
                }
            } else {
                console.warn(usuario.data.messagge)
            }
        } catch (error) {
            if (error.response.status === 403) {
                toast.error(` ${error.response.data.messagge}`, {
                    closeOnClick: true,
                    theme: 'colored',
                    autoClose: 2000,
                    position: 'top-right',
                    hideProgressBar: true
                })
            } else {
                console.error(error)
            }
        } finally {
            setvalidando(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="relative w-screen p-8 bg-white rounded shadow-md md:w-1/2 lg:w-1/3">
                <section className='flex items-center justify-between pr-4'>
                    <h2 className="mb-4 text-4xl font-semibold">Bienvenid@</h2>
                    <img
                        src={Inmoda_Logo}
                        alt='Logo de la empresa INMODA FANTASY S.A.S'
                        className='w-20 h-20 p-2 border-2 rounded-full sm:w-28 sm:h-28 border-sky-600'
                    />
                </section>
                <section>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-600" htmlFor="id">
                            Identificación
                        </label>
                        <input
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
                            type="text"
                            id='id'
                            placeholder="Identificación"
                            value={identificacion}
                            onChange={(e) => {
                                setidentificacion(e.target.value)
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-600" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-400"
                            type="password"
                            id='password'
                            placeholder="Contraseña"
                            value={clave}
                            onChange={(e) => {
                                setclave(e.target.value)
                            }}
                        />
                        {/* <label className='my-2 mb-2 text-xs font-medium text-gray-600 underline cursor-pointer hover:text-blue-700'>Recuperar Contraseña</label> */}
                    </div>

                    <button
                        className="w-full py-2 text-white transition duration-300 bg-blue-500 rounded-lg hover:bg-blue-600"
                        type="submit"
                        onClick={Login}
                        disabled={validando}
                    >
                        Iniciar sesión
                    </button>
                    <span className='block mt-4 text-xl font-medium text-center'>¿No tienes cuenta?</span>
                    <div className='flex items-center justify-center'>
                        <a href='https://panel.inmodafantasy.com.co/#/clientes/registro' target='_blank' className='font-medium underline cursor-pointer hover:text-blue-700'>Registrate</a>
                    </div>

                </section>

                <div onClick={() => { navigate(`${RUTAS.TIENDA}?${querySearchParams}`) }} className='absolute flex items-center justify-center transition-all cursor-pointer left-4 top-4 gap-x-2 hover:scale-110'>
                    <span className='text-gray-500'><BiArrowBack size={20} /></span>
                    <span className='text-gray-500'>Volver a la tienda</span>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}
