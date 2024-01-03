import React from 'react'
import { ConsultarImagenes, FormateoNumberInt } from '../../utilities/Helpers'
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai'
import { EmptyLottie } from '../Lotties/LottiesCompoent/EmptyLottie'
import { soldOut } from '../../utilities/Imagenes'

export const ProductosCarrito = ({ productos, setvisibleModalBorrarProducto, setidEliminar, setdatosProductoEditar, setvisibleModalEditarProducto }) => {
    return (
        <>
            <table className='hidden w-full md:table'>
                <thead>
                    <tr className='justify-between table-row h-12 px-4 py-2 font-medium bg-gray-100 border-2'>
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
                                <tr key={index} className='my-12 bg-white border-2 border-gray-200'>
                                    <td className='flex items-center justify-center'>
                                        <img
                                            src={ConsultarImagenes(producto.imagen)}
                                            alt={`Imagen de producto ${producto.referencia} en carrito`}
                                            className='object-cover w-16 h-16 mx-4 md:w-32 md:h-32'
                                            onError={(e) => {
                                                e.target.src = soldOut
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <p className='w-24 text-xs font-medium text-green-600 truncate md:text-sm md:w-40'>{producto.descripcion}</p>
                                        <p className='w-20 text-sm md:w-40'>{producto.referencia}</p>
                                        <p className='md:hidden'>${FormateoNumberInt(producto.precio)}</p>
                                    </td>
                                    <td className='hidden text-center md:table-cell'>${FormateoNumberInt(producto.precio)}</td>
                                    <td className='text-center'>{producto.cantidad}</td>
                                    <td className='hidden text-center md:table-cell'>${FormateoNumberInt(producto.subTotal)}</td>
                                    <td >
                                        <div className='flex flex-col items-center justify-center h-full px-4 gap-y-2 md:gap-y-3'>
                                            <span onClick={() => {
                                                setvisibleModalBorrarProducto(true)
                                                setidEliminar(producto.id ? producto.id : producto.referencia)
                                            }}
                                                className='p-1 text-black transition-all rounded-full cursor-pointer hover:bg-red-500 hover:text-white' title='Eliminar'>
                                                <AiOutlineDelete size={20} />
                                            </span>
                                            <span onClick={() => {
                                                setdatosProductoEditar(producto)
                                                setvisibleModalEditarProducto(true)
                                            }}
                                                className='p-1 transition-all rounded-full cursor-pointer hover:bg-gray-300' title='Editar'
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
                    <div className='flex flex-col items-center justify-center'>
                        <div className='flex items-center justify-center'>
                            <EmptyLottie />
                        </div>
                        <span className='my-12 text-3xl font-medium text-center'>Sin productos en el carrito</span>
                    </div>
                )
            }

            <section className='md:hidden'>
                {
                    productos.length > 0 && (
                        productos.map((item, index) => (
                            <div className='flex justify-between py-4 mx-1 my-2 bg-white border-2 border-gray-300 rounded sm:mx-8' key={index}>
                                <div className='flex'>
                                    <img
                                        className='w-24 h-24 sm:mx-4'
                                        src={ConsultarImagenes(item.imagen)}
                                        onError={(e) => {
                                            e.target.src = soldOut
                                        }}
                                    />
                                    <article className='sm:ml-12'>
                                        <p className='text-sm font-medium text-green-600'>{item.descripcion}</p>
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
                                        className='p-1 text-black transition-all rounded-full cursor-pointer hover:bg-red-500 hover:text-white' title='Eliminar'>
                                        <AiOutlineDelete size={20} />
                                    </span>
                                    <span onClick={() => {
                                        setdatosProductoEditar(item)
                                        setvisibleModalEditarProducto(true)
                                    }}
                                        className='p-1 transition-all rounded-full cursor-pointer hover:bg-gray-300' title='Editar'
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
