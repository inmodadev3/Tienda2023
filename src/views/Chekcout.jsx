import React, { useContext, useEffect, useRef, useState } from 'react'
import Axios from '../utilities/Axios';
import RUTAS from '../routes/PATHS';
import { useLocation, useNavigate } from 'react-router-dom';
import { default_price, vendedor } from '../routes/QueryParams';
import { UsuarioContext } from '../routes/Routers';
import { ConsultarImagenes, FormateoNumberInt } from '../utilities/Helpers';
import { AiOutlineWhatsApp } from 'react-icons/ai';
import { ToastContainer, toast } from 'react-toastify'
import { BiArrowBack } from 'react-icons/bi';
import { LoaderComponent } from '../components/Loader/LoaderComponent';
import { SendLottie } from '../components/Lotties/LottiesCompoent/SendLottie';
import { soldOut } from '../utilities/Imagenes';


export const Chekcout = () => {

    const url = useLocation()
    const querySearchParams = new URLSearchParams(url.search);
    const [carrito, setcarrito] = useState([])

    let precio_default = querySearchParams.get(default_price)

    const { usuario, setUsuario } = useContext(UsuarioContext)
    const navigate = useNavigate()

    //DATOS DE FORMULARIO
    const [nombre, setnombre] = useState('')
    const [apellido, setapellido] = useState('')
    const [cedula, setcedula] = useState('')
    const [direccion, setdireccion] = useState('')
    const [ciudad, setciudad] = useState('')
    const [departamento, setdepartamento] = useState('')
    const [telefono, settelefono] = useState('')
    const [observacion, setobservacion] = useState('')

    //AGOTADOS Y CAMBIOS DE PRECIO
    const [agotados, setagotados] = useState([])
    const [cambios_precio, setcambios_precio] = useState([])

    //LOADING INFO
    const [isEnviandoPedido, setisEnviandoPedido] = useState(false)
    const [isPedidoEnviado, setisPedidoEnviado] = useState(false)
    const [pedidoIdDB, setpedidoIdDB] = useState(0)
    const [totalDB, settotalDB] = useState(0)

    useEffect(() => {
        consultar_Carrito()
    }, [usuario])

    useEffect(() => {
        if (!precio_default) {
            setUsuario(JSON.parse(localStorage.getItem('usuario')))
        }
    }, [])

    const consultar_Carrito = () => {
        if (querySearchParams.get(default_price)) {
            setcarrito(JSON.parse(localStorage.getItem('carrito')))
        } else {
            if (usuario) {
                consultar_productos_database()
                consultar_datosUsuario()
            }
        }

    }

    const calcularTotal = () => {
        let total = 0;
        if (carrito && carrito.length > 0) {
            carrito.forEach((item) => {
                total += item.subTotal
            })
        }
        return total;
    }

    const consultar_productos_database = async () => {
        try {
            const response = await Axios.get(`pedidos/productos/${usuario.StrIdTercero}`)
            setcarrito(response.data.data)
        } catch (error) {
            console.error(error)
            toast.error("Ha ocurrido un error cargando la información del carrito")
        }
    }

    const consultar_datosUsuario = async () => {
        try {
            const response = await Axios.get(`pedidos/cliente/${usuario.StrIdTercero}`)
            let tercero = response.data.data[0]
            const nombre = tercero.StrNombre1 + " " + tercero.StrNombre2
            const apellido = tercero.StrApellido1 + " " + tercero.StrApellido2
            setnombre(nombre)
            setapellido(apellido)
            setcedula(tercero.StrIdTercero)
            setdireccion(tercero.StrDireccion)
            setciudad(tercero.ciudad)
            setdepartamento(tercero.Depto)
            settelefono(tercero.StrTelefono)
        } catch (error) {
            toast.error("Ha ocurrido un error cargando la información del cliente")
        }
    }

    const validar_inputs = () => {
        if (nombre.toString().trim() !== "" || apellido.toString().trim() !== "") {
            if (cedula.toString().trim() !== "") {
                if (direccion.toString().trim() !== "") {
                    if (ciudad.toString().trim() !== "") {
                        if (departamento.toString().trim() !== "") {
                            if (telefono.toString().trim() !== "") {
                                if (telefono.toString().trim().length > 6) {
                                    validar_pedido(carrito)
                                } else {
                                    toast.info("Telefono debe tener al menos 7 caracteres", {
                                        theme: 'colored'
                                    })
                                }
                            } else {
                                toast.info("Telefono no puede estar vacio", {
                                    theme: 'colored'
                                })
                            }
                        } else {
                            toast.info("Departamento no puede estar vacio", {
                                theme: 'colored'
                            })
                        }
                    } else {
                        toast.info("Ciudad no puede estar vacio", {
                            theme: 'colored'
                        })
                    }
                } else {
                    toast.info("Dirección no puede estar vacio", {
                        theme: 'colored'
                    })
                }
            } else {
                toast.info("Cédula no puede estar vacio", {
                    theme: 'colored'
                })
            }
        } else {
            toast.info("Asegurese de llenar y los campos de nombre o apellido, no pueden estar vacios", {
                theme: 'colored'
            })
        }
    }


    const validar_pedido = async (carrito) => {
        try {
            const response = await Axios.post(`/pedidos/validar`, {
                arrProductos: carrito,
                strIdCliente: cedula,
                precio: precio_default
            })

            if (response.data.agotados.length > 0) {
                setagotados(response.data.agotados)
            }

            if (response.data.cambios_precio.length > 0) {
                setcambios_precio(response.data.cambios_precio)
            }

            if (response.data.cambios_precio.length == 0 && response.data.agotados.length == 0) {
                //ENVIAR PEDIDO
                setisEnviandoPedido(true)
                if (precio_default) {
                    try {
                        const response = await Axios.post(`/pedidos/enviar_local`, {
                            dataCliente: {
                                cedula: cedula,
                                nombre: `${nombre} ${apellido}`,
                                ciudad: ciudad,
                                valorTotal: calcularTotal(),
                                fechaEnvio: new Date(),
                                obrservacion: observacion,
                                telefono: telefono,
                            },
                            seller: querySearchParams.get(vendedor) ? querySearchParams.get(vendedor) : 138,
                            arrProductos: carrito
                        })
                        setpedidoIdDB(response.data.data.lastId)
                        toast.success("Pedido enviado correctamente")
                        setisPedidoEnviado(true)
                        localStorage.removeItem('carrito')
                    } catch (error) {
                        console.error(error)
                        toast.error(`${error.response.data.message}`)
                    }
                } else {
                    if (usuario) {
                        try {
                            const response = await Axios.post(`/pedidos/enviar/${usuario.StrIdTercero}`, {
                                strObservacion: observacion,
                                seller: querySearchParams.get(vendedor) ? querySearchParams.get(vendedor) : 138,
                            })
                            setpedidoIdDB(response.data.data.lastId)
                            settotalDB(response.data.data.total)
                            toast.success("Pedido enviado correctamente")
                            setisPedidoEnviado(true)
                        } catch (error) {
                            console.error(error)
                            toast.error(`${error.response.data.message}`)

                        }
                    } else {
                        toast.info("No existe ningun usuario")
                    }
                }
            }

        } catch (error) {
            console.error(error)
        } finally {
            setisEnviandoPedido(false)
        }

    }


    const aplicar_novedades = async () => {
        try {
            let arrCarrito = [...carrito]

            if (agotados.length > 0) {
                for (const agotado of agotados) {
                    let index = arrCarrito.findIndex(item => item.referencia == agotado.referencia)
                    arrCarrito.splice(index, 1)
                }
            }

            if (cambios_precio.length > 0) {
                for (const cambios of cambios_precio) {
                    let index = arrCarrito.findIndex(item => item.referencia == cambios.referencia)
                    arrCarrito[index].precio = cambios.precio_actual
                    arrCarrito[index].subTotal = cambios.precio_actual * arrCarrito[index].cantidad
                }
            }

            if (precio_default) {
                localStorage.setItem('carrito', JSON.stringify(arrCarrito))
            } else {
                if (usuario) {
                    actualizar_novedades_database()
                }
            }

            setagotados([])
            setcambios_precio([])
            setcarrito(arrCarrito)
            validar_pedido(arrCarrito)
        } catch (error) {
            console.error(error)
        }
    }

    const actualizar_novedades_database = async () => {
        try {
            await Axios.put('/pedidos/actualizar_agotados_precios_pedido', {
                arrIdAgotados: agotados,
                arrIdCambios: cambios_precio
            })
        } catch (error) {
            console.error(error)
            toast.error("Ha ocurrido un error inesperado")
        }
    }

    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }


    const Enviar_Confirmacion_Whatsapp = async () => {
        try {
            const seller = querySearchParams.get(vendedor) ? querySearchParams.get(vendedor) : 138
            let pedido = pedidoIdDB
            let total = totalDB
            pedido = pedido.toString().trim()
            total = total.toString().trim()
            const response = await Axios.get(`pedidos/vendedor_telefono/${seller}`)
            let telefono = (response.data.data) || '315 6353687'
            telefono = telefono.replace(" ", "")

            window.open(`https://${isMobile() ? "api" : "web"}.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(`🖐🏻 Hola.\n🛍️ Acabo de realizar un pedido desde la tienda en linea por un valor de $ ${total}.\n💰🏦 Regálame los datos de consignación y el valor del envío 🛵 para continuar con la compra.\n📄Este es mi pedido https://panel.inmodafantasy.com.co/#/pedidos/pdf/${pedido}`)}`).focus()
            navigate(`${RUTAS.TIENDA}?${querySearchParams}`)
        } catch (error) {

        }
    }

    return (
        <div className='w-full min-h-screen'>
            <div className='flex flex-col h-screen xl:justify-center gap-x-12 lg:flex-row'>
                <section className='w-full xl:h-full '>
                    <div className='px-2 xl:my-24 xl:px-12'>
                        <div className='mt-4'>
                            <p className='text-2xl font-semibold'>Datos de envio</p>
                            <section className='flex flex-col gap-x-6 xl:flex-row'>
                                <div className='flex flex-col p-3 mt-2 border-2 xl:w-1/2'>
                                    <span className='hidden'>Nombre</span>
                                    <input
                                        type="text"
                                        placeholder='Nombre'
                                        className='uppercase outline-none'
                                        value={nombre}
                                        disabled={!precio_default ? (usuario && true) : false}
                                        onChange={(e) => {
                                            setnombre(e.target.value)
                                        }}
                                    />
                                </div>

                                <div className='flex flex-col p-3 mt-2 border-2 xl:w-1/2'>
                                    <span className='hidden'>Apellidos</span>
                                    <input
                                        type="text"
                                        placeholder='Apellidos'
                                        className='uppercase outline-none'
                                        value={apellido}
                                        disabled={!precio_default ? (usuario && true) : false}
                                        onChange={(e) => {
                                            setapellido(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>
                            <section>
                                <div className='flex flex-col w-full p-3 mt-2 border-2'>
                                    <span className='hidden'>Cédula</span>
                                    <input
                                        type="number"
                                        placeholder='Cédula'
                                        className='uppercase outline-none'
                                        value={cedula}
                                        disabled={!precio_default ? (usuario && true) : false}
                                        onChange={(e) => {
                                            setcedula(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>

                            <section>
                                <div className='flex flex-col w-full p-3 mt-2 border-2'>
                                    <span className='hidden'>Dirección</span>
                                    <input
                                        type="text"
                                        placeholder='Dirección'
                                        className='uppercase outline-none'
                                        value={direccion}
                                        onChange={(e) => {
                                            setdireccion(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>

                            <section className='flex flex-col gap-x-6 xl:flex-row'>
                                <div className='flex flex-col p-3 mt-2 border-2 xl:w-1/2'>
                                    <span className='hidden'>Ciudad</span>
                                    <input
                                        type="text"
                                        placeholder='Ciudad'
                                        className='uppercase outline-none'
                                        value={ciudad}
                                        onChange={(e) => {
                                            setciudad(e.target.value)
                                        }}
                                    />
                                </div>

                                <div className='flex flex-col p-3 mt-2 border-2 xl:w-1/2'>
                                    <span className='hidden'>Departamento</span>
                                    <input
                                        type="text"
                                        placeholder='Departamento'
                                        className='uppercase outline-none'
                                        value={departamento}
                                        onChange={(e) => {
                                            setdepartamento(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>

                            <section>
                                <div className='flex flex-col w-full p-3 mt-2 border-2 rounded'>
                                    <span className='hidden'>Teléfono</span>
                                    <input
                                        type="text"
                                        placeholder='Teléfono'
                                        className='uppercase outline-none'
                                        value={telefono}
                                        onChange={(e) => {
                                            settelefono(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>

                            <section>
                                <div className='flex flex-col w-full p-3 mt-2 border-2 rounded'>
                                    <textarea
                                        className='w-full h-32 outline-none resize-none '
                                        placeholder='Observación...'
                                        value={observacion}
                                        onChange={(e) => {
                                            setobservacion(e.target.value)
                                        }}
                                    />
                                </div>

                            </section>

                        </div>

                        <div className='flex w-full mt-12 xl:gap-x-12'>
                            <button
                                className='flex items-center justify-center w-1/2 py-2 text-lg text-white bg-green-600 rounded-lg gap-x-2 xl:gap-x-12'
                                onClick={validar_inputs}
                                disabled={(carrito && carrito.length > 0) ? false : true}
                                title='Click si estas seguro de enviar tu pedido.'
                            >
                                <span><AiOutlineWhatsApp size={20} /></span>
                                <span>Enviar pedido</span>
                            </button>
                            <button title='Click si deseas agregar algo más al pedido.' onClick={() => { navigate(`${RUTAS.TIENDA}?${querySearchParams}`) }} className='w-1/2 text-lg text-white underline bg-blue-500 rounded-lg'>Seguir comprando</button>
                        </div>


                    </div>
                </section>
                <section className='lg:w-1/2 lg:px-12'>
                    <div className='flex flex-col w-full px-2 my-24 overflow-y-scroll lg:px-12 gap-y-2 h-1/2 Scroll-invisible'>
                        {
                            (carrito && carrito.length > 0) && (
                                carrito.map((item, index) => (
                                    <div key={index} className='w-full mt-1'>
                                        <div className='flex justify-between'>
                                            <article className='flex gap-x-4'>
                                                <div className='relative'>
                                                    <div className='w-20 h-20 lg:w-16 lg:h-16'>
                                                        <img
                                                            src={ConsultarImagenes(item.imagen)}
                                                            alt={`producto ${item.imagen}`}
                                                            className='object-cover w-full h-full border-2 border-gray-300 rounded'
                                                            onError={(e) => {
                                                                e.target.src = soldOut
                                                            }}
                                                        />
                                                    </div>

                                                    <span className='absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-green-600 rounded-full -top-1 -right-1'>{item.cantidad}</span>
                                                </div>

                                                <div className='flex flex-col gap-y-2'>
                                                    <p className='text-xs font-medium lg:w-40'>{item.descripcion}</p>
                                                    <p className='text-xs text-gray-500'>{item.referencia}</p>
                                                </div>
                                            </article>

                                            <p className='text-sm font-medium'>${FormateoNumberInt((item.subTotal).toString())}</p>
                                        </div>
                                    </div>
                                ))
                            )
                        }


                    </div>
                    <article className='flex justify-between py-2 mt-4 font-medium border-t-2'>
                        <p className=''>Total</p>
                        <span>${FormateoNumberInt(calcularTotal())}</span>
                    </article>
                </section>
            </div>
            <ToastContainer />
            <br />

            {/* SECCION DE AGOTADOS Y CAMBIOS DE PRECIO */}
            {
                (agotados.length > 0 || cambios_precio.length > 0) && (
                    <div className='fixed top-0 left-0 flex items-center justify-center w-screen h-screen'>
                        <div className='absolute z-10 w-full h-full bg-gray-900/40'></div>
                        <div className='z-20 flex flex-col p-4 bg-white w-96 h-3/4'>
                            <span
                                onClick={() => {
                                    setagotados([])
                                    setcambios_precio([])
                                }}
                                className='cursor-pointer'
                            ><BiArrowBack size={20} /></span>

                            <p className='text-lg text-slate-500'>Los siguientes productos presentan novedades:</p>
                            <div className='w-full overflow-y-scroll h-2/3'>
                                {
                                    agotados.map((agotado, index) => (
                                        <div className='flex space-y-2' key={index}>
                                            <div className='flex items-center justify-center w-20 h-20'>
                                                <img
                                                    src={ConsultarImagenes(agotado.imagen)}
                                                    alt={`${agotado.descripcion}`}
                                                    onError={(e) => {
                                                        e.target.src = soldOut
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className='text-sm font-medium text-slate-600'>{agotado.descripcion}</p>
                                                <p className='text-xs font-medium text-slate-400'>{agotado.referencia}</p>
                                                <p className='text-xs font-medium text-red-400'>agotado</p>
                                            </div>
                                        </div>
                                    ))
                                }
                                {
                                    cambios_precio.map((cambio, index) => (
                                        <div className='flex space-y-2' key={index}>
                                            <div className='flex items-center justify-center w-20 h-20'>
                                                <img
                                                    src={ConsultarImagenes(cambio.imagen)}
                                                    alt={`${cambio.descripcion}`}
                                                    onError={(e) => {
                                                        e.target.src = soldOut
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className='text-sm font-medium text-slate-600'>{cambio.descripcion}</p>
                                                <p className='text-xs font-medium text-slate-400'>{cambio.referencia}</p>
                                                <p className='text-xs font-medium text-yellow-400'>Cambio de precio</p>
                                                <p className='text-xs'>
                                                    <span className='font-medium text-slate-500'>{cambio.precio_actual}</span>
                                                    <span className='line-through text-slate-400'>({cambio.precio_anterior})</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <p className='mt-4 text-xs tracking-wide text-slate-500'>Para finalizar el pedido es necesario eliminar los productos agotados del carrito</p>
                            <button onClick={aplicar_novedades} className='px-8 py-2 my-4 text-center text-white transition-all bg-blue-800 border-2 border-blue-800 cursor-pointer rounded-xl hover:bg-white hover:text-blue-800'>Aplicar Cambios</button>
                        </div>
                    </div>
                )
            }

            {
                isEnviandoPedido && (
                    <div className='fixed top-0 left-0 flex items-center justify-center w-screen h-screen'>
                        <div className='absolute top-0 left-0 z-10 w-full h-full bg-gray-600/20'></div>
                        <article className='z-20 space-y-4'>
                            <div className='flex items-center justify-center'>
                                <LoaderComponent />
                            </div>
                            <p className='text-xl font-medium'>Enviando Pedido...</p>
                        </article>
                    </div>
                )
            }

            {
                isPedidoEnviado && (
                    <div className='fixed top-0 left-0 flex items-center justify-center w-screen h-screen'>
                        <div className='absolute top-0 left-0 z-10 w-full h-full bg-gray-600/20'></div>
                        <article className='z-20 flex flex-col px-12 py-8 bg-white'>
                            <div className='flex items-center justify-center'>
                                <SendLottie />
                            </div>
                            <p className='pb-12 font-medium text-center text-gray-500 '>El pedido se ha enviado con exitoso</p>
                            <div className='flex flex-col md:flex-row gap-x-12'>
                                <button onClick={Enviar_Confirmacion_Whatsapp} className='px-8 py-2 font-medium text-white transition-all bg-green-400 hover:bg-green-600'>compartir por Whatsapp</button>
                                <button onClick={() => {
                                    navigate(`${RUTAS.TIENDA}?${querySearchParams}`)
                                }} className='px-8 py-2 font-medium text-white transition-all bg-blue-400 hover:bg-blue-600'>Volver a la tienda</button>
                            </div>
                        </article>
                    </div>
                )
            }

        </div>
    )
}
