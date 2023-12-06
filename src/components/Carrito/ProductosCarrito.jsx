import React from 'react'
import { ConsultarImagenes, FormateoNumberInt } from '../../utilities/Helpers'
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai'
import { EmptyLottie } from '../Lotties/LottiesCompoent/EmptyLottie'

export const ProductosCarrito = ({ productos, setvisibleModalBorrarProducto, setidEliminar, setdatosProductoEditar, setvisibleModalEditarProducto }) => {
    return (
        <>
            <table className='w-full hidden md:table'>
                <thead>
                    <tr className='border-2 px-4 py-2 justify-between font-medium bg-gray-100 table-row h-12'>
                        <th>Producto</th>
                        <th></th>
                        <th className='hidden md:table-cell'>Precio</th>
                        <th>Cantidad</th>
                        <th className='hidden md:table-cell'>Total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody className='relative'>
                    {
                        productos.length > 0 && (
                            productos.map((producto, index) => (
                                <tr key={index} className='bg-white my-12 border-2 border-gray-200'>
                                    <td className='flex justify-center items-center'>
                                        <img
                                            src={ConsultarImagenes(producto.imagen)}
                                            alt={`Imagen de producto ${producto.referencia} en carrito`}
                                            className='w-16 h-16 md:w-32 md:h-32 mx-4 object-cover'
                                        />
                                    </td>
                                    <td>
                                        <p className='text-xs md:text-sm w-24 md:w-40 font-medium text-green-600 truncate'>{producto.descripcion}</p>
                                        <p className='text-sm w-20 md:w-40'>{producto.referencia}</p>
                                        <p className='md:hidden'>${FormateoNumberInt(producto.precio)}</p>
                                    </td>
                                    <td className='text-center hidden md:table-cell'>${FormateoNumberInt(producto.precio)}</td>
                                    <td className='text-center'>{producto.cantidad}</td>
                                    <td className='text-center hidden md:table-cell'>${FormateoNumberInt(producto.subTotal)}</td>
                                    <td >
                                        <div className='flex flex-col items-center justify-center h-full px-4 gap-y-2 md:gap-y-3'>
                                            <span onClick={() => {
                                                setvisibleModalBorrarProducto(true)
                                                setidEliminar(producto.id ? producto.id : producto.referencia)
                                            }}
                                                className='cursor-pointer hover:bg-red-500 transition-all rounded-full p-1 text-black hover:text-white' title='Eliminar'>
                                                <AiOutlineDelete size={20} />
                                            </span>
                                            <span onClick={() => {
                                                setdatosProductoEditar(producto)
                                                setvisibleModalEditarProducto(true)
                                            }}
                                                className='cursor-pointer hover:bg-gray-300 transition-all rounded-full p-1' title='Editar'
                                            ><AiOutlineEdit size={20} /></span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )
                    }
                </tbody>
            </table>

            {
                productos.length == 0 && (
                    <div className='flex flex-col justify-center items-center'>
                        <div className='flex justify-center items-center'>
                            <EmptyLottie />
                        </div>
                        <span className='font-medium text-3xl my-12 text-center'>Sin productos en el carrito</span>
                    </div>
                )
            }

            <section className='md:hidden'>
                {
                    productos.length > 0 && (
                        productos.map((item, index) => (
                            <div className='bg-white my-2 mx-1 sm:mx-8 py-4 flex justify-between border-2 border-gray-300 rounded' key={index}>
                                <div className='flex'>
                                    <img
                                        className='w-24 h-24 sm:mx-4'
                                        src={ConsultarImagenes(item.imagen)}
                                    />
                                    <article className='sm:ml-12'>
                                        <p className='text-green-600 text-sm font-medium'>{item.descripcion}</p>
                                        <p className='text-sm text-gray-500'>{item.referencia}</p>
                                        <p className='font-medium'>${FormateoNumberInt(item.precio.toString())}</p>
                                        <p>Cantidad: {item.cantidad}</p>
                                    </article>
                                </div>

                                <div className='flex flex-col items-center justify-center h-full px-4 py-2 gap-y-2 md:gap-y-3'>
                                    <span onClick={() => {
                                        setvisibleModalBorrarProducto(true)
                                        setidEliminar(item.id ? item.id : item.referencia)
                                    }}
                                        className='cursor-pointer hover:bg-red-500 transition-all rounded-full p-1 text-black hover:text-white' title='Eliminar'>
                                        <AiOutlineDelete size={20} />
                                    </span>
                                    <span onClick={() => {
                                        setdatosProductoEditar(item)
                                        setvisibleModalEditarProducto(true)
                                    }}
                                        className='cursor-pointer hover:bg-gray-300 transition-all rounded-full p-1' title='Editar'
                                    ><AiOutlineEdit size={20} /></span>
                                </div>
                            </div>
                        ))
                    )
                }
            </section>
        </>
    )
}
