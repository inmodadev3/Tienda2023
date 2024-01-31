import React, { useContext, useEffect, useState } from 'react'
import { FormateoNumberInt } from '../utilities/Helpers'
import { useLocation, useNavigate } from 'react-router-dom'
import { ModalDeleteProducto } from '../components/Carrito/ModalDeleteProducto'
import { ToastContainer, toast } from 'react-toastify'
import RUTAS from '../routes/PATHS'
import { Modal_Productos } from '../components/Productos/Modal_Productos'
import { ProductosCarrito } from '../components/Carrito/ProductosCarrito'
import { UsuarioContext } from '../routes/Routers'
import Axios from '../utilities/Axios'
import { default_price } from '../routes/QueryParams'


export const Carrito = () => {

    const [productos, setproductos] = useState([])
    const [isLoadingProductos, setisLoadingProductos] = useState(true)
    const [idEliminar, setidEliminar] = useState('')
    const [datosProductoEditar, setdatosProductoEditar] = useState({})
    const [carritoTotalProductos, setcarritoTotalProductos] = useState(0)

    /* MODALS */
    const [visibleModalBorrarProducto, setvisibleModalBorrarProducto] = useState(false)
    const [visibleModalBorrarCarrito, setvisibleModalBorrarCarrito] = useState(false)
    const [visibleModalEditarProducto, setvisibleModalEditarProducto] = useState(false)

    const navigate = useNavigate()
    const url = useLocation()
    const querySearchParams = new URLSearchParams(url.search);
    const { usuario, setUsuario } = useContext(UsuarioContext)
    let precio_default = querySearchParams.get(default_price)

    useEffect(() => {
        if (!precio_default) {
            setUsuario(JSON.parse(localStorage.getItem('usuario')))
        }
    }, [])


    useEffect(() => {
        let carrito = JSON.parse(localStorage.getItem("carrito"))

        if (precio_default) {
            if (carrito) {
                setproductos(carrito)
                setcarritoTotalProductos(carrito.length ? carrito.length : 0)
                setisLoadingProductos(false)
            } else {
                setisLoadingProductos(false)
            }
        }

    }, [localStorage.getItem("carrito")])

    useEffect(() => {
        if (!precio_default) {
            if (usuario && visibleModalEditarProducto == false) {
                consultar_productos_database()
            } else {
                setisLoadingProductos(false)
            }
        }
    }, [usuario, visibleModalEditarProducto])



    const calcularTotal = () => {
        let total = 0;
        productos.forEach((item) => {
            total += item.subTotal
        })

        return total;
    }

    const eliminarProducto = async () => {
        if (precio_default) {
            setproductos((prevData) => {
                let data_Actualizada = prevData.filter((item) => { return item.referencia !== idEliminar })
                localStorage.setItem("carrito", JSON.stringify(data_Actualizada))
                return data_Actualizada
            })
            toast.success("Eliminado correctamente")
            setvisibleModalBorrarProducto(false)
        } else {
            if (usuario) {
                try {
                    await Axios.delete(`pedidos/eliminar_producto/${idEliminar}/${usuario.StrIdTercero}`)
                    toast.success("Eliminado correctamente")
                    setproductos((prevData) => {
                        let data_Actualizada = prevData.filter((item) => { return item.id !== idEliminar })
                        return data_Actualizada
                    })
                } catch (error) {
                    toast.error(idEliminar)
                    toast.error("Ha ocurrido un error al eliminar el producto del carrito")
                } finally {
                    setvisibleModalBorrarProducto(false)
                }
            }
        }

    }

    const limpiarCarrito = async () => {
        if (precio_default) {
            localStorage.removeItem("carrito")
            setproductos([])
            toast.info("Carrito limpiado con exito")
            setvisibleModalBorrarCarrito(false)
        } else {
            if (usuario) {
                try {
                    Axios.delete(`pedidos/eliminar_productos/${productos[0].pedidoId}/${usuario.StrIdTercero}`)
                    setproductos([])
                    toast.info("Carrito limpiado con exito")
                } catch (error) {
                    toast.error('Ha ocurrido un error al eliminar los productos del carrito')
                } finally {
                    setvisibleModalBorrarCarrito(false)
                }
            }
        }

    }

    const consultar_productos_database = async () => {
        try {
            const response = await Axios.get(`pedidos/productos/${usuario.StrIdTercero}`)
            setproductos(response.data.data)
            setcarritoTotalProductos(response.data.data ? response.data.data.length : 0)
        } catch (error) {
            /* toast.error("Ha ocurrido un error cargando la información del carrito") */
        } finally {
            setisLoadingProductos(false)
        }
    }

    return (
        <div className='min-h-screen bg-gray-100'>
            <section className='flex items-center h-24'>
                <article className='mx-4 md:mx-32'>
                    <h1 className='text-3xl font-bold text-blue-500'>CARRITO DE COMPRAS</h1>
                </article>
            </section>
            <div className='flex flex-col gap-x-10 xl:flex-row'>
                <section className='md:mx-12 xl:ml-32 xl:w-11/12 h-[600px] overflow-y-scroll Scroll-invisible'>
                    {
                        !isLoadingProductos ?
                            (
                                <ProductosCarrito
                                    productos={productos}
                                    setvisibleModalBorrarProducto={setvisibleModalBorrarProducto}
                                    setidEliminar={setidEliminar}
                                    setdatosProductoEditar={setdatosProductoEditar}
                                    setvisibleModalEditarProducto={setvisibleModalEditarProducto}
                                />
                            ) :
                            (
                                <span className='flex items-center justify-center my-12 text-3xl font-medium text-center '>Cargando...</span>
                            )
                    }
                </section>
                <section className='flex justify-center mt-2 mb-12 xl:w-2/5'>
                    <div className='w-2/3 h-full '>
                        <article className='py-2 border-b-2 border-gray-500'>
                            <span className='font-medium'>Resumen del pedido</span>
                        </article>
                        <br />
                        <hr className='border-b-2 border-b-gray-200 ' />
                        <br />
                        <hr className='border-b-2 border-b-gray-200 ' />
                        <article className='flex justify-between px-2 py-2 mt-12'>
                            <p className='font-bold text-gray-800'>Cantidad de productos:</p>
                            <p className='text-lg font-medium'>{productos.length}</p>
                        </article>
                        {
                            usuario ? (
                                (usuario.IntPrecio !== 7 && usuario.IntPrecio !== 8) && (
                                    <p className='text-[14px] font-medium text-slate-500 text-center'>El total se encuentra con el iva incluido*</p>
                                )
                            ) : (
                                <p className='text-[14px] font-medium text-slate-500 text-center'>El total se encuentra con el iva incluido*</p>
                            )

                        }
                        

                        <article className='flex justify-between px-2 py-2 mt-4 border-b-2 border-b-gray-500'>
                            <p className='font-bold text-gray-800'>Total:</p>
                            <p className='text-lg font-medium'>${FormateoNumberInt(calcularTotal())}</p>
                        </article>

                        {
                            productos.length > 0 && (
                                <button
                                    className='flex items-center justify-center w-full py-2 mt-8 font-medium text-center text-white transition-all bg-green-700 border-2 border-green-700 rounded-xl hover:bg-white hover:text-green-700'
                                    onClick={() => { navigate(`${RUTAS.CHEKOUT}?${querySearchParams}`) }}
                                >
                                    Ir a finalización del pedido
                                </button>
                            )
                        }

                        <button
                            className='flex items-center justify-center w-full py-2 mt-8 font-medium text-center text-white transition-all border-2 bg-blue-950 border-blue-950 rounded-xl hover:bg-white hover:text-blue-950'
                            onClick={() => { navigate(`${RUTAS.TIENDA}?${querySearchParams}`) }}
                        >
                            Seguir comprando
                        </button>

                        {
                            productos.length > 0 && (
                                <button
                                    className='flex items-center justify-center w-full py-2 mt-8 font-medium text-center text-white transition-all bg-red-500 border-2 border-red-500 rounded-xl hover:bg-white hover:text-red-500'
                                    onClick={() => {
                                        setvisibleModalBorrarCarrito(true)
                                    }}
                                >
                                    Borrar Carrito
                                </button>
                            )
                        }

                    </div>


                </section>
            </div>
            {/* MODALS */}
            {
                visibleModalBorrarProducto && (
                    <ModalDeleteProducto
                        closeEvent={setvisibleModalBorrarProducto}
                        texto={"¿Estas seguro que deseas borrar este producto del carrito?"}
                        eventoAceptar={eliminarProducto}
                    />)
            }

            {
                visibleModalBorrarCarrito && (
                    <ModalDeleteProducto
                        closeEvent={setvisibleModalBorrarCarrito}
                        texto={"¿Estas seguro que deseas borrar el carrito?"}
                        eventoAceptar={limpiarCarrito}
                    />)
            }
            {
                visibleModalEditarProducto && (
                    <Modal_Productos
                        setisViewModalProducto={setvisibleModalEditarProducto}
                        producto_Modal={datosProductoEditar}
                        setcarritoTotalProductos={setcarritoTotalProductos}
                    />
                )
            }

            <ToastContainer />
        </div >
    )
}
