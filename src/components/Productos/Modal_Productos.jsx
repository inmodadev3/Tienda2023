import React, { useContext, useRef } from 'react'
import Axios from '../../utilities/Axios'
import { useEffect } from 'react'
import { useState } from 'react'
import { ConsultarImagenes, FormateoNumberInt } from '../../utilities/Helpers'
import { IoIosAdd, IoMdRemove } from 'react-icons/io'
import { UsuarioContext } from '../../routes/Routers'
import { ToastContainer, toast } from 'react-toastify'
import { default_price, vendedor } from '../../routes/QueryParams'
import { useLocation, useNavigate } from 'react-router-dom'
import RUTAS from '../../routes/PATHS'

export const Modal_Productos = ({ setisViewModalProducto, producto_Modal, setcarritoTotalProductos }) => {

  const [producto_info, setproducto_info] = useState(null)
  const [imagen_principal, setimagen_principal] = useState('')
  const [resetAnimation, setResetAnimation] = useState(false);
  const [cantidad, setcantidad] = useState(1)
  const [subTotal, setsubTotal] = useState(0)
  const [observacion, setobservacion] = useState('')
  const [productoExistente, setproductoExistente] = useState(false)
  const { usuario } = useContext(UsuarioContext)
  const [idProductoDB, setidProductoDB] = useState(0)

  const url = useLocation()
  const querySearchParams = new URLSearchParams(url.search);
  const navigate = useNavigate()

  //Refs

  const inputCantidadRef = useRef(null)

  useEffect(() => {
    consultar_Producto()
  }, [])

  useEffect(() => {
    let timer;

    clearTimeout(timer);

    timer = setTimeout(() => {
      setsubTotal(producto_Modal.precio * cantidad)
    }, 300);


    return () => {
      clearTimeout(timer);
    };
  }, [cantidad])

  const consultar_Producto = async () => {
    let precio_default = querySearchParams.get(default_price)

    try {
      const producto = await Axios.get(`/productos/${producto_Modal.referencia}`)
      let carrito = JSON.parse(localStorage.getItem("carrito"))
      if (producto.data.success) {
        setproducto_info(producto.data)
        setsubTotal(producto_Modal.precio)
        if (producto.data.images.length > 0) {
          setimagen_principal(producto.data.images[0].strArchivo)
        }
        if (precio_default) {
          if (carrito) {
            let repetido = await carrito.find((item) => (item.referencia == producto_Modal.referencia))
            if (repetido) {
              setcantidad(repetido.cantidad ? repetido.cantidad : 1)
              setobservacion(repetido.observacion ? repetido.observacion : "")
              setproductoExistente(true)
            }
          }
        } else {
          if (usuario) {
            const response = await Axios.get(`pedidos/producto?id=${usuario.StrIdTercero}&p=${producto_Modal.referencia}`)

            if (response.data.data.length > 0) {
              setidProductoDB(response.data.data[0].id)
              setcantidad(response.data.data[0].intCantidad ? response.data.data[0].intCantidad : 1)
              setobservacion(response.data.data[0].strObservacion ? response.data.data[0].strObservacion : "")
              setproductoExistente(true)
            }
          }
        }


      } else {
        console.error("Ha ocurrido un error en el modal de producto")
        console.log(producto)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleImagenPrincipalChange = (imagen) => {
    setimagen_principal(imagen);
    setResetAnimation(true); // Activa la clase para reiniciar la animación
    setTimeout(() => {
      setResetAnimation(false); // Desactiva la clase después de un corto período de tiempo
    }, 1); // Ajusta el tiempo según sea necesario
  };

  const cambiar_cantidades = (operacion) => {
    if (operacion == 1) {
      setcantidad((Prevalue) => {
        return parseInt(Prevalue) + 1;
      })
    } else if (operacion == 2) {
      setcantidad((Prevalue) => {
        if (Prevalue !== 1) {
          return parseInt(Prevalue) - 1;
        } else {
          return parseInt(Prevalue)
        }
      })
    } else {
      console.error(operacion)
    }
  }


  const agregar_carrito = async () => {
    let precio_default = querySearchParams.get(default_price)
    const seller = querySearchParams.get(vendedor) ? querySearchParams.get(vendedor) : 138

    let producto_info_carrito = {
      referencia: producto_Modal.referencia,
      precio: producto_Modal.precio,
      descripcion: producto_info.data[0].StrDescripcion,
      cantidad: cantidad,
      subTotal: producto_Modal.precio * cantidad,
      imagen: producto_info.images[0] ? producto_info.images[0].strArchivo : "",
      observacion: observacion,
      unidad: producto_info.data[0].StrUnidad
    }

    if (precio_default) {
      /* EN CASO DE QUE EXSISTA EL PARAMETRO DE PRECIO POR DEFECTO SE REALIZA ESTA FUNCION */
      let carrito = JSON.parse(localStorage.getItem("carrito"))
      if (carrito) {
        let repetido = await carrito.find((item) => (item.referencia == producto_Modal.referencia))

        if (repetido) {
          carrito = await carrito.map((item) => {
            if (item.referencia == producto_Modal.referencia) {
              return { ...item, cantidad, observacion, subTotal: producto_Modal.precio * cantidad }
            } else {
              return {
                ...item
              }
            }
          })
        } else {
          if (setcarritoTotalProductos && typeof setcarritoTotalProductos === 'function') {
            setcarritoTotalProductos((prevData) => {
              return prevData + 1;
            })
          }

          carrito = [
            ...carrito,
            {
              ...producto_info_carrito
            }
          ]
        }

        localStorage.setItem("carrito", JSON.stringify(carrito))
      } else {
        if (setcarritoTotalProductos) {
          setcarritoTotalProductos(1)
        }
        localStorage.setItem("carrito", JSON.stringify([producto_info_carrito]))
      }

      toast.success("producto agregado", {
        closeOnClick: true,
        theme: 'colored',
        autoClose: 1000,
        position: 'top-right',
        hideProgressBar: true
      })

      setisViewModalProducto(false)
    } else {
      /* EN CASO DE QUE NO EXISTA EL PARAMTRO DE PRECIO POR DEFECTO */
      if (usuario) {
        /* SI EXISTE UN USUARIO */
        try {
          if (productoExistente) {
            const response = await Axios.put('pedidos/actualizar_producto', {
              cantidad: cantidad,
              observacion: observacion,
              id: idProductoDB,
              strIdCliente: usuario.StrIdTercero
            })

            if (response.data) {
              toast.success("producto Actualizado", {
                closeOnClick: true,
                theme: 'colored',
                autoClose: 1000,
                position: 'top-right',
                hideProgressBar: true
              })
              setisViewModalProducto(false)
            }
          } else {
            const response = await Axios.post(`/pedidos/agregar_producto`, {
              idVendedor: seller,
              cliente: {
                strIdCliente: usuario.StrIdTercero,
                strNombreCliente: usuario.StrNombre
              },
              producto: {
                strIdProducto: producto_info.data[0].StrIdProducto,
                strDescripcion: producto_info.data[0].StrDescripcion,
                intCantidad: cantidad,
                strUnidadMedida: producto_info.data[0].StrUnidad,
                strObservacion: observacion,
                intPrecio: producto_Modal.precio,
                strRutaImg: producto_info.images[0] ? producto_info.images[0].strArchivo  : ""
              }
            })

            if (response.data) {
              toast.success("producto agregado", {
                closeOnClick: true,
                theme: 'colored',
                autoClose: 1000,
                position: 'top-right',
                hideProgressBar: true
              })
              if (setcarritoTotalProductos && typeof setcarritoTotalProductos === 'function') {
                setcarritoTotalProductos((prevData) => {
                  return prevData + 1;
                })
              }
              setisViewModalProducto(false)
            }
          }

        } catch (error) {
          console.error(error)
          toast.error('Ha ocurrido un error al agregar al producto consulte con soporte', {
            closeOnClick: true,
            theme: 'colored',
            autoClose: 1000,
            position: 'top-right',
            hideProgressBar: true
          })
        }
      } else {
        /* SI NO EXISTE NINGUN USUARIO SE OBLIGA A INICIAR SESION */
        toast.info("Debe iniciar sesion para poder agregar productos", {
          closeOnClick: true,
          theme: 'colored',
          autoClose: 1000,
          position: 'top-right',
          hideProgressBar: true
        })

        setTimeout(() => {
          navigate(`${RUTAS.LOGIN}?${querySearchParams}`)
        }, 2000);
      }
    }
  }


  return (
    <div className='fixed w-screen h-screen top-0 left-0 z-20 flex justify-center items-center'>
      <div onClick={() => { setisViewModalProducto(false) }} className='absolute w-full h-screen bg-black/70 z-10'></div>
      {
        producto_info !== null ?
          (
            <section className='z-20 flex flex-col justify-between bg-white w-screen h-screen rounded-md py-8 overflow-y-scroll mb-4 relative  lg:w-8/12 lg:h-5/6 lg:flex-row'>
              <div className='bg-whie flex-1 flex flex-col items-center justify-center gap-y-12'>
                <div>
                  <img
                    src={`${(producto_info && imagen_principal !== "") ? ConsultarImagenes(imagen_principal) : ``}`}
                    alt={`Imagen de ${producto_info.data[0].StrDescripcion}`}
                    className={`w-80 h-80 fade-in ${resetAnimation ? 'reset-animation' : ''}`}
                  />
                </div>
                <div className={`flex gap-x-1 w-full Scroll-invisible px-8 ${producto_info.images.length > 4 && "overflow-x-scroll"} `}>
                  {
                    producto_info.images.map((imagen, index) => (
                      <img
                        key={index}
                        src={ConsultarImagenes(imagen.strArchivo)}
                        alt={`Imagen de producto ${producto_info.data[0].StrDescripcion} con referencia ${producto_info.data[0].StrIdProducto}`}
                        className='w-24 h-24 cursor-pointer border-2 rounded'
                        onClick={() => { handleImagenPrincipalChange(imagen.strArchivo) }}
                      />
                    ))
                  }
                </div>
              </div>
              <div className='bg-white flex-1 mx-8 flex flex-col justify-between'>
                {
                  productoExistente && <span className='text-red-500'> * El producto ya se encuentra agregado *</span>
                }
                <div>
                  <p className='font-bold text-2xl text-blue-500'>{producto_info.data[0] ? producto_info.data[0].StrDescripcion : "Error ..."}</p>
                  <p className='font-medium text-gray-800 text-normal my-2 '>
                    <span className='font-bold'>Referencia: </span>
                    {producto_info.data[0] ? producto_info.data[0].StrIdProducto : "Error ..."}
                  </p>
                  <p className='font-medium text-normal'>{producto_Modal.precio ? `$${FormateoNumberInt(producto_Modal.precio)}` : "Error ..."} <span> / {producto_info.data[0].StrUnidad}</span></p>



                  <div className='flex gap-x-6'>
                    {
                      (producto_info.data[0] && producto_info.data[0].StrParam3) &&
                      (
                        <div className='mt-2 bg-gray-200 rounded-xl w-fit min-w-[120px] pr-4 pl-2 py-2 flex gap-x-6 flex-col'>
                          <p className='font-bold'>Dimension</p>
                          <p className='font-medium text-gray-800 text-normal'>{` ${producto_info.data[0].StrParam3}`}</p>
                        </div>
                      )
                    }

                    {/* en caso de que exista material */}
                    {
                      (producto_info.data[0] && producto_info.data[0].material) &&
                      (
                        <div className='mt-2 bg-gray-200 rounded-xl w-fit min-w-[120px] pr-4 pl-2 py-2 flex gap-x-6 flex-col'>
                          <p className='font-bold'>Material</p>
                          <p className='font-medium text-gray-800 text-normal'>{` ${producto_info.data[0].material}`}</p>
                        </div>
                      )
                    }

                    {
                      (producto_info.data[0] && producto_info.data[0].Strauxiliar && producto_info.data[0].Strauxiliar !== "0" && producto_info.data[0].Strauxiliar !== "1") &&
                      (
                        <div className='mt-2 bg-gray-200 rounded-xl w-fit min-w-[120px] pr-4 pl-2 py-2 flex gap-x-6 flex-col'>
                          <p className='font-bold'>Cantidad por Emapaque:</p>
                          <p className='font-medium text-gray-800 text-normal'>{` ${producto_info.data[0].Strauxiliar}`}</p>
                        </div>
                      )
                    }
                  </div>


                  <p className='font-normal text-gray-600 text-normal my-4'>{producto_info.data[0] ? producto_info.data[0].StrDescripcionCorta : ""}</p>
                  <textarea
                    className='w-full h-40 outline-none border-2 border-gray-500 resize-none rounded-xl p-4'
                    placeholder='Observacion, Por favor digitar en este espacio el estilo y color deseado.'
                    value={observacion}
                    onChange={(e) => { setobservacion(e.target.value) }}
                  />
                  <div className='flex gap-y-2 flex-col'>
                    <span className='text-sm font-normal text-gray-700'>Cantidad:</span>
                    <div>
                      <div className='border-2 border-gray-200 w-max flex rounded mt-2 items-center'>
                        <button onClick={() => { cambiar_cantidades(2) }} className='bg-gray-100 h-full left-0 w-auto px-4 flex justify-center items-center cursor-pointer rounded-l py-2 border-r-2 border-r-gray-200'><IoMdRemove size={21} /></button>
                        <input
                          className='outline-none px-4 text-center w-16 appearance-none resize-none'
                          type='number'
                          ref={inputCantidadRef}
                          min={1}
                          value={cantidad}
                          onChange={(e) => {
                            setcantidad(e.target.value)
                          }}

                        />
                        <button onClick={() => { cambiar_cantidades(1) }} className='bg-gray-100 h-full left-0 w-auto px-4 flex justify-center items-center cursor-pointer rounded-r py-2 border-l-2 border-l-gray-200'><IoIosAdd size={21} /></button>
                      </div>
                      <p className='font-normal text-gray-600 text-sm my-2'>Subtotal : ${FormateoNumberInt((subTotal).toString())}</p>
                    </div>

                  </div>
                </div>

                <button
                  className='block text-center xl:w-4/5 bg-blue-500 text-white py-2 rounded-2xl hover:bg-white hover:text-blue-500 transition-all border-2 border-blue-500 font-medium my-4'
                  onClick={agregar_carrito}
                >
                  {productoExistente ? "Actualizar Producto" : "Agregar al carrito"}
                </button>
                <br />
                <article className='block text-center lg:hidden'>
                  <span onClick={() => { setisViewModalProducto(false) }} className='underline cursor-pointer'>Seguir comprando</span>
                  <br />
                </article>
              </div>

            </section>
          ) :
          (
            <div>Cargando datos...</div>
          )
      }

      <ToastContainer />
    </div>
  )
}
