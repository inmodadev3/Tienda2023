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
                console.log('existe al menos un elemento agotado')
            }

            if (response.data.cambios_precio.length > 0) {
                setcambios_precio(response.data.cambios_precio)
                console.log('existe al menos un elemento con precio diferente')
            }

            if (response.data.cambios_precio.length == 0 && response.data.agotados.length == 0) {
                //ENVIAR PEDIDO
                setisEnviandoPedido(true)
                if (precio_default) {
                    try {
                        const response = await Axios.post(`/pedidos/enviar_local`,{
                            dataCliente:{
                                cedula:cedula,
                                nombre:`${nombre} ${apellido}`,
                                ciudad:ciudad,
                                valorTotal:calcularTotal(),
                                fechaEnvio: new Date(),
                                obrservacion:observacion,
                                telefono:telefono,
                            },
                            seller:querySearchParams.get(vendedor) ? querySearchParams.get(vendedor) : 138,
                            arrProductos:carrito
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
                                seller:querySearchParams.get(vendedor) ? querySearchParams.get(vendedor) : 138,
                            })
                            console.log(response.data)
                            setpedidoIdDB(response.data.data.lastId)
                            settotalDB(response.data.data.total)
                            toast.success("Pedido enviado correctamente")
                            setisPedidoEnviado(true)
                        } catch (error) {
                            console.error(error)
                            toast.error(`${error.response.data.message}`)

                        }
                    }else{
                        toast.info("No existe ningun usuario")
                    }
                }
            }

        } catch (error) {
            console.log(error)
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

    const isMobile = () =>{
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    console.log()

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

            console.log(pedido,totalDB)

            window.open(`https://api.whatsapp.com/send?phone=${telefono}&text=${encodeURIComponent(`🖐🏻 Hola.\n🛍️ Acabo de realizar un pedido desde la tienda en linea por un valor de $ ${total}.\n💰🏦 Regálame los datos de consignación y el valor del envío 🛵 para continuar con la compra.\n📄Este es mi pedido https://panel.inmodafantasy.com.co/#/pedidos/pdf/${pedido}`)}`).focus()
            navigate(`${RUTAS.TIENDA}?${querySearchParams}`)
        } catch (error) {

        }
    }

    return (
        <div className='w-full min-h-screen'>
            <div className='flex flex-col xl:justify-center gap-x-12 h-screen lg:flex-row'>
                <section className='w-full xl:h-full '>
                    <div className=' px-2 xl:my-24 xl:px-12'>
                        <div className='mt-4'>
                            <p className='text-2xl font-semibold'>Datos de envio</p>
                            <section className='flex flex-col gap-x-6 xl:flex-row'>
                                <div className='mt-2 xl:w-1/2 flex flex-col border-2 p-3'>
                                    <span className='hidden'>Nombre</span>
                                    <input
                                        type="text"
                                        placeholder='Nombre'
                                        className='outline-none uppercase'
                                        value={nombre}
                                        disabled={!precio_default ? (usuario && true) : false}
                                        onChange={(e) => {
                                            setnombre(e.target.value)
                                        }}
                                    />
                                </div>

                                <div className='mt-2 xl:w-1/2 flex flex-col border-2 p-3'>
                                    <span className='hidden'>Apellidos</span>
                                    <input
                                        type="text"
                                        placeholder='Apellidos'
                                        className='outline-none uppercase'
                                        value={apellido}
                                        disabled={!precio_default ? (usuario && true) : false}
                                        onChange={(e) => {
                                            setapellido(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>
                            <section>
                                <div className='mt-2 w-full flex flex-col border-2 p-3'>
                                    <span className='hidden'>Cédula</span>
                                    <input
                                        type="number"
                                        placeholder='Cédula'
                                        className='outline-none uppercase'
                                        value={cedula}
                                        disabled={!precio_default ? (usuario && true) : false}
                                        onChange={(e) => {
                                            setcedula(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>

                            <section>
                                <div className='mt-2 w-full flex flex-col border-2 p-3'>
                                    <span className='hidden'>Dirección</span>
                                    <input
                                        type="text"
                                        placeholder='Dirección'
                                        className='outline-none uppercase'
                                        value={direccion}
                                        onChange={(e) => {
                                            setdireccion(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>

                            <section className='flex flex-col gap-x-6 xl:flex-row'>
                                <div className='mt-2 xl:w-1/2 flex flex-col border-2 p-3'>
                                    <span className='hidden'>Ciudad</span>
                                    <input
                                        type="text"
                                        placeholder='Ciudad'
                                        className='outline-none uppercase'
                                        value={ciudad}
                                        onChange={(e) => {
                                            setciudad(e.target.value)
                                        }}
                                    />
                                </div>

                                <div className='mt-2 xl:w-1/2 flex flex-col border-2 p-3'>
                                    <span className='hidden'>Departamento</span>
                                    <input
                                        type="text"
                                        placeholder='Departamento'
                                        className='outline-none uppercase'
                                        value={departamento}
                                        onChange={(e) => {
                                            setdepartamento(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>

                            <section>
                                <div className='mt-2 w-full flex flex-col border-2 p-3 rounded'>
                                    <span className='hidden'>Teléfono</span>
                                    <input
                                        type="text"
                                        placeholder='Teléfono'
                                        className='outline-none uppercase'
                                        value={telefono}
                                        onChange={(e) => {
                                            settelefono(e.target.value)
                                        }}
                                    />
                                </div>
                            </section>

                            <section>
                                <div className='mt-2 w-full flex flex-col border-2 p-3 rounded'>
                                    <textarea
                                        className=' resize-none w-full h-32 outline-none'
                                        placeholder='Observación...'
                                        value={observacion}
                                        onChange={(e) => {
                                            setobservacion(e.target.value)
                                        }}
                                    />
                                </div>

                            </section>

                        </div>

                        <div className='flex w-full  xl:gap-x-12 mt-12'>
                            <button
                                className='w-1/2 bg-green-600 flex justify-center items-center gap-x-2 xl:gap-x-12 py-2 rounded-lg text-white text-lg'
                                onClick={validar_inputs}
                                disabled={(carrito && carrito.length > 0) ? false:true}
                            >
                                <span><AiOutlineWhatsApp size={20} /></span>
                                <span>Enviar pedido</span>
                            </button>
                            <button onClick={() => { navigate(`${RUTAS.TIENDA}?${querySearchParams}`) }} className='w-1/2 underline bg-transparent text-lg'>Seguir comprando</button>
                        </div>


                    </div>
                </section>
                <section className='lg:w-1/2 lg:px-12'>
                    <div className='my-24 px-2 lg:px-12 w-full overflow-y-scroll flex flex-col gap-y-2 h-1/2 Scroll-invisible'>
                        {
                            (carrito && carrito.length > 0) && (
                                carrito.map((item, index) => (
                                    <div key={index} className='mt-1 w-full'>
                                        <div className='flex justify-between'>
                                            <article className='flex gap-x-4'>
                                                <div className='relative'>
                                                    <div className='w-20 h-20 lg:w-16 lg:h-16'>
                                                        <img
                                                            src={ConsultarImagenes(item.imagen)}
                                                            className='w-full h-full border-2 border-gray-300 rounded object-cover'
                                                        />
                                                    </div>

                                                    <span className='absolute -top-1 -right-1 bg-green-600 w-5 h-5 text-white rounded-full flex justify-center items-center text-xs'>{item.cantidad}</span>
                                                </div>

                                                <div className='flex flex-col gap-y-2'>
                                                    <p className='lg:w-40 text-xs font-medium'>{item.descripcion}</p>
                                                    <p className='text-xs text-gray-500'>{item.referencia}</p>
                                                </div>
                                            </article>

                                            <p className='font-medium text-sm'>${FormateoNumberInt((item.subTotal).toString())}</p>
                                        </div>
                                    </div>
                                ))
                            )
                        }


                    </div>
                    <article className='flex mt-4 justify-between font-medium border-t-2 py-2'>
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
                    <div className='fixed w-screen h-screen top-0 left-0 flex items-center justify-center'>
                        <div className='w-full h-full absolute bg-gray-900/40 z-10'></div>
                        <div className='w-96 h-3/4 bg-white z-20 p-4 flex flex-col'>
                            <span
                                onClick={() => {
                                    setagotados([])
                                    setcambios_precio([])
                                }}
                                className='cursor-pointer'
                            ><BiArrowBack size={20} /></span>

                            <p className='text-lg text-slate-500'>Los siguientes productos presentan novedades:</p>
                            <div className='w-full h-2/3 overflow-y-scroll'>
                                {
                                    agotados.map((agotado, index) => (
                                        <div className='flex space-y-2' key={index}>
                                            <div className='w-20 h-20 flex items-center justify-center'>
                                                <img
                                                    src={ConsultarImagenes(agotado.imagen)}
                                                />
                                            </div>
                                            <div>
                                                <p className='font-medium text-slate-600 text-sm'>{agotado.descripcion}</p>
                                                <p className='text-slate-400 font-medium text-xs'>{agotado.referencia}</p>
                                                <p className='text-red-400 font-medium text-xs'>agotado</p>
                                            </div>
                                        </div>
                                    ))
                                }
                                {
                                    cambios_precio.map((cambio, index) => (
                                        <div className='flex space-y-2' key={index}>
                                            <div className='w-20 h-20 flex items-center justify-center'>
                                                <img
                                                    src={ConsultarImagenes(cambio.imagen)}
                                                />
                                            </div>
                                            <div>
                                                <p className='font-medium text-slate-600 text-sm'>{cambio.descripcion}</p>
                                                <p className='text-slate-400 font-medium text-xs'>{cambio.referencia}</p>
                                                <p className='text-yellow-400 font-medium text-xs'>Cambio de precio</p>
                                                <p className='text-xs'>
                                                    <span className='text-slate-500 font-medium'>{cambio.precio_actual}</span>
                                                    <span className=' line-through text-slate-400'>({cambio.precio_anterior})</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <p className='text-xs text-slate-500 tracking-wide mt-4'>Para finalizar el pedido es necesario eliminar los productos agotados del carrito</p>
                            <button onClick={aplicar_novedades} className='my-4 px-8 py-2 rounded-xl bg-blue-800 border-2 border-blue-800 text-white hover:bg-white hover:text-blue-800 transition-all text-center cursor-pointer'>Aplicar Cambios</button>
                        </div>
                    </div>
                )
            }

            {
                isEnviandoPedido && (
                    <div className='fixed w-screen h-screen flex justify-center items-center top-0 left-0'>
                        <div className='w-full h-full absolute top-0 left-0 bg-gray-600/20 z-10'></div>
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
                    <div className='fixed w-screen h-screen flex justify-center items-center top-0 left-0'>
                        <div className='w-full h-full absolute top-0 left-0 bg-gray-600/20 z-10'></div>
                        <article className='z-20 px-12 py-8 bg-white flex flex-col'>
                            <div className='flex justify-center items-center'>
                                <SendLottie />
                            </div>
                            <p className=' text-center pb-12 font-medium text-gray-500'>El pedido se ha enviado con exitoso</p>
                            <div className='flex flex-col md:flex-row gap-x-12'>
                                <button onClick={Enviar_Confirmacion_Whatsapp} className='bg-green-400 text-white px-8 py-2 font-medium hover:bg-green-600  transition-all'>compartir por Whatsapp</button>
                                <button onClick={() => {
                                    navigate(`${RUTAS.TIENDA}?${querySearchParams}`)
                                }} className='bg-blue-400 text-white px-8 py-2 font-medium hover:bg-blue-600  transition-all'>Volver a la tienda</button>
                            </div>
                        </article>
                    </div>
                )
            }

        </div>
    )
}
