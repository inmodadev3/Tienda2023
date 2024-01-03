import Axios from '../utilities/Axios'
import RUTAS from '../routes/PATHS'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { AiOutlineArrowUp, AiOutlineShoppingCart, AiOutlineUser } from 'react-icons/ai'
import { Categorias } from '../components/Tienda/Categorias'
import { useLocation, useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import { Productos } from '../components/Tienda/Productos'
import { UsuarioContext } from '../routes/Routers'
import { Modal_Productos } from '../components/Productos/Modal_Productos'
import { default_price } from '../routes/QueryParams'
import { Header } from '../components/Header/Header'


export const Tienda = () => {
    const navigate = useNavigate()
    const titulo_tiendaRef = useRef(null)
    const url = useLocation()
    const querySearchParams = new URLSearchParams(url.search);

    /* Validacion de carga de la aplicacion */
    /* CARGA Y VISIBILIDAD DE DATOS*/
    const [isLoadCategorias, setisLoadCategorias] = useState(false)
    const [isViewModalCategoriasMobile, setisViewModalCategoriasMobile] = useState(false)
    const [isLoadingProductos, setisLoadingProductos] = useState(false)

    /* CATEGORIAS Y SUBCATEGORIAS */
    const [categorias, setcategorias] = useState([])
    const [subCategorias, setsubCategorias] = useState(null)
    const [subCategoriaSelected, setsubCategoriaSelected] = useState([])
    const [lineasChecked, setlineasChecked] = useState([])
    const [gruposChecked, setgruposChecked] = useState([])
    const [tiposChecked, settiposChecked] = useState([])
    /* CONTAR TOTAL DE PRODUCTOS */
    const [total_Productos, settotal_Productos] = useState(0)

    //DATOS DE PRODUCTOS
    const [pagina, setpagina] = useState(0)
    const [total_Paginas, settotal_Paginas] = useState(0)
    const [arrayProductos, setarrayProductos] = useState(null)
    const [carritoTotalProductos, setcarritoTotalProductos] = useState(0)
    //USUARIO
    const { setUsuario } = useContext(UsuarioContext)

    //MODAL DE PRODUCTO
    const [isViewModalProducto, setisViewModalProducto] = useState(false)
    const [producto_Modal, setproducto_Modal] = useState(null)

    //VALIDAR URLPARAMETROS

    //DEFINIR EL USUARIO DE LA TIENDA
    useEffect(() => {
        let usuario = JSON.parse(localStorage.getItem("usuario"))
        let precio_default = querySearchParams.get(default_price)
        let carrito = JSON.parse(localStorage.getItem("carrito"))

        if (precio_default) {
            if (carrito) {
                setcarritoTotalProductos(carrito.length ? carrito.length : 0)
            }
        } else {
            if (usuario) {
                setUsuario(usuario)
            }
        }

        Consultar_Total_Productos()
    }, [])

    //CONSULTAR NUEVOS PRODUCTOS AL CAMBIAR PAGINA
    useEffect(() => {
        if (subCategorias == null) {
            consultar_Productos_Generales()
        } else {
            consultar_Productos_Subcategorias(1)
        }
    }, [pagina])

    //CONSULTAR PRODUCTOS DE CLASES O LINEAS POR PRIMERA VEZ
    useEffect(() => {
        if (subCategorias !== null) {
            setarrayProductos(null)
            consultar_Productos_Subcategorias(1)
        } else {
            consultar_Productos_Generales()
        }
    }, [subCategorias])

    //CONSULTAR SUBCATEGORIAS EN CASO DE SELECCIONAR ALGUNA LINEA GRUPO O TIPO
    useEffect(() => {
        let timer;
        if (subCategorias) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                setpagina(0)
                consultar_Productos_Subcategorias(1)
            }, 1000);

        }
        return () => {
            clearTimeout(timer);
        };
    }, [lineasChecked, gruposChecked, tiposChecked])


    const Consultar_Total_Productos = async () => {
        try {
            const paginas = await Axios.get('/productos/contar')
            if (paginas.data.success) {
                settotal_Paginas(paginas.data.Paginas)
            }
        } catch (error) {
            console.error(error)
        }
    }


    const FocusTienda = () => {
        if (titulo_tiendaRef.current) {
            titulo_tiendaRef.current.scrollIntoView({
                behavior: 'smooth', // Puedes ajustar el comportamiento de desplazamiento
            });
        }
    }

    const consultar_Productos_Generales = async () => {
        try {
            setisLoadingProductos(true)

            const data = await Axios.get(`/productos?pag=${pagina}`)
            if (data.data.success) {
                if (arrayProductos !== null) {
                    setarrayProductos((prevData) => {
                        return [...prevData, ...data.data.data];
                    })
                } else {
                    setarrayProductos(data.data.data)
                }
            }

        } catch (error) {
            console.error(error)
            alert(import.meta.env.VITE_API_URL_HOST)
            toast.error(` Ha ocurrido un error al consultar los productos`, {
                closeOnClick: true,
                theme: 'colored',
                autoClose: 2000,
                position: 'top-right',
                hideProgressBar: true
            })

        } finally {
            setisLoadingProductos(false)
        }
    }

    const consultar_Productos_Subcategorias = async (render_times) => {
        setisLoadingProductos(true)
        try {
            if (pagina == 0) {
                setarrayProductos(null)
            }
            let suma = 0;
            if ((lineasChecked.length !== 0 || gruposChecked.length !== 0 || tiposChecked.length !== 0) && render_times == 1) {
                let productos_lineas;
                let productos_grupos;
                let productos_tipos;

                let productos_subcategorias = []


                if (lineasChecked.length !== 0) {
                    productos_lineas = await Axios.post(`/productos/lineas?pag=${pagina}`, { lineas: lineasChecked })
                    const data = await Axios.post('/productos/contar/linea', { lineas: lineasChecked });
                    if (data.data.success) {
                        suma += (data.data.Paginas)
                    } else {
                        console.error(data);
                    }
                    productos_lineas.data.data.forEach(element => {
                        productos_subcategorias.push(element)
                    });

                }

                if (gruposChecked.length !== 0) {
                    productos_grupos = await Axios.post(`/productos/grupos?pag=${pagina}`, { grupos: gruposChecked })
                    const data = await Axios.post('/productos/contar/grupo', { grupos: gruposChecked });
                    if (data.data.success) {
                        suma += (data.data.Paginas)
                    } else {
                        console.error(data);
                    }
                    productos_grupos.data.data.forEach(element => {
                        productos_subcategorias.push(element)
                    });
                }

                if (tiposChecked.length !== 0) {
                    productos_tipos = await Axios.post(`/productos/tipos?pag=${pagina}`, { tipos: tiposChecked })
                    const data = await Axios.post('/productos/contar/tipo', { tipos: tiposChecked });
                    if (data.data.success) {
                        suma += (data.data.Paginas)
                    } else {
                        console.error(data);
                    }
                    productos_tipos.data.data.forEach(element => {
                        productos_subcategorias.push(element)
                    });
                }

                settotal_Paginas(suma)

                setarrayProductos((prevData) => {
                    if (prevData) {
                        return [...prevData, ...productos_subcategorias];
                    } else {
                        setarrayProductos(productos_subcategorias)
                    }
                })

            } else {
                if (subCategorias) {
                    const data = await Axios.get(`/productos?pag=${pagina}&class=${subCategorias.categoria.StrIdClase}`)
                    if (data.data.success) {
                        setarrayProductos((prevData) => {
                            if (prevData) {
                                return [...prevData, ...data.data.data];;
                            } else {
                                setarrayProductos(data.data.data)
                            }
                        })
                    }
                }
            }
        } catch (error) {
            console.error(error)
        } finally {
            setisLoadingProductos(false)
        }
    }


    return (
        <div className='min-h-screen overflow-x-hidden overflow-y-hidden bg-gradient-to-b from-gray-50 to-gray-200'>
            {/* ENCABEZADO TIENDA */}
            <Header setisViewModalProducto={setisViewModalProducto} setproducto_Modal={setproducto_Modal} setcarritoTotalProductos={setcarritoTotalProductos} />

            {/*FILTROS  */}
            <section className='justify-between block px-4 mt-24 md:flex md:mx-24'>
                <div className='' ref={titulo_tiendaRef}></div>
                <div className='flex flex-col w-full xs:w-1/2 md:w-auto'>
                    <div onClick={() => { setisViewModalCategoriasMobile(!isViewModalCategoriasMobile) }} className={`flex my-2 px-4 xl:hidden w-full bg-blue-700 text-white py-2 cursor-pointer rounded hover:bg-blue-700 transition-all`}>
                        <p className='w-full font-bold tracking-widest text-center'>Categorias</p>
                    </div>
                </div>
            </section>


            {/* CUERPO DE LA TIENDA */}
            <div className='relative flex justify-between mx-4 mt-12 mb-20 xl:mx-24'>
                <div className='relative xl:w-3/12'></div>

                {/* SECCION DE CATEGORIAS */}
                <Categorias
                    //VARIABLES O ESTADOS
                    subCategorias={subCategorias}
                    subCategoriaSelected={subCategoriaSelected}
                    isLoadCategorias={isLoadCategorias}
                    categorias={categorias}
                    lineasChecked={lineasChecked}
                    gruposChecked={gruposChecked}
                    tiposChecked={tiposChecked}
                    isViewModalCategoriasMobile={isViewModalCategoriasMobile}
                    //CAMBIAR ESTADOS
                    setsubCategoriaSelected={setsubCategoriaSelected}
                    setisLoadCategorias={setisLoadCategorias}
                    setsubCategorias={setsubCategorias}
                    setcategorias={setcategorias}
                    settotal_Productos={settotal_Productos}
                    setlineasChecked={setlineasChecked}
                    setgruposChecked={setgruposChecked}
                    settiposChecked={settiposChecked}
                    settotal_Paginas={settotal_Paginas}
                    setarrayProductos={setarrayProductos}
                    setpagina={setpagina}
                    //FUNCIONES
                    Consultar_Total_Productos={Consultar_Total_Productos}
                />

                {/* SECCION DE PRODUCTOS */}
                <Productos
                    arrayProductos={arrayProductos}
                    isLoadingProductos={isLoadingProductos}
                    pagina={pagina}
                    total_Paginas={total_Paginas}
                    setpagina={setpagina}
                    setisViewModalProducto={setisViewModalProducto}
                    setproducto_Modal={setproducto_Modal}
                />
            </div>


            {isViewModalCategoriasMobile && (<div onClick={() => { setisViewModalCategoriasMobile(false) }} className='fixed top-0 left-0 z-10 w-screen min-h-screen bg-gray-500/40'></div>)}
            {/* BOTON PARA REGRESAR AL HEADER */}
            <div onClick={FocusTienda} className='fixed p-2 text-white transition-all bg-blue-500 rounded-full cursor-pointer bottom-6 right-2 hover:bg-blue-700'>
                <span><AiOutlineArrowUp size={32} /></span>
            </div>


            <div onClick={() => { navigate(`${RUTAS.CARRITO}?${querySearchParams}`) }} className='fixed flex items-center justify-center w-12 h-12 text-white transition-all bg-green-500 rounded-full cursor-pointer bottom-20 right-2 hover:bg-green-700'>
                <div className='relative flex items-center justify-center w-full h-full'>
                    <span className=''><AiOutlineShoppingCart size={25} /></span>
                    <span className='absolute w-6 h-6 text-center bg-orange-500 rounded-full -top-3 -right-1'>{carritoTotalProductos}</span>
                </div>
            </div>


            {(isViewModalProducto && producto_Modal !== null) && <Modal_Productos setisViewModalProducto={setisViewModalProducto} producto_Modal={producto_Modal} setcarritoTotalProductos={setcarritoTotalProductos} />}
            <ToastContainer />
        </div>
    )
}
