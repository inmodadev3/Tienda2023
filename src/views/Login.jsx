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
            navigate(RUTAS.TIENDA)
        } else {
            if (localStorage.getItem('usuario') !== null) {
                navigate(RUTAS.TIENDA)
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
                console.log(usuario.data.messagge)
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
                console.log(error)
            }
        } finally {
            setvalidando(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-screen md:w-1/2 lg:w-1/3 relative">
                <section className='flex items-center justify-between pr-4'>
                    <h2 className="text-4xl font-semibold mb-4">Bienvenid@</h2>
                    <img
                        src={Inmoda_Logo}
                        alt='Logo de la empresa INMODA FANTASY S.A.S'
                        className='w-20 h-20 sm:w-28 sm:h-28 border-2 rounded-full p-2 border-sky-600'
                    />
                </section>
                <section>
                    <div className="mb-4">
                        <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="id">
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
                        <label className="block text-gray-600 text-sm font-medium mb-2" htmlFor="password">
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
                        {/* <label className='text-gray-600 text-xs my-2 font-medium mb-2 underline cursor-pointer hover:text-blue-700'>Recuperar Contraseña</label> */}
                    </div>

                    <button
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                        type="submit"
                        onClick={Login}
                        disabled={validando}
                    >
                        Iniciar sesión
                    </button>
                    <span className='block text-center text-xl mt-4 font-medium'>¿No tienes cuenta?</span>
                    <div className='flex justify-center items-center'>
                        <a href='https://panel.inmodafantasy.com.co/#/clientes/registro' target='_blank' className=' cursor-pointer underline hover:text-blue-700 font-medium'>Registrate</a>
                    </div>

                </section>

                <div onClick={() => { navigate(`${RUTAS.TIENDA}?${querySearchParams}`) }} className='absolute left-4 top-4 flex items-center justify-center gap-x-2 cursor-pointer hover:scale-110 transition-all'>
                    <span className='text-gray-500'><BiArrowBack size={20} /></span>
                    <span className='text-gray-500'>Volver a la tienda</span>
                </div>
            </div>
            <ToastContainer />
        </div>
    )
}
