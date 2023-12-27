import React, { useContext, useEffect, useState } from 'react'
import { ConsultarImagenes, FormateoNumberInt } from '../../utilities/Helpers'
import { UsuarioContext } from '../../routes/Routers'
import { useLocation } from 'react-router-dom'
import { default_price } from '../../routes/QueryParams'
import './styles.css'

export const Card_Productos = ({ producto, setisViewModalProducto, setproducto_Modal }) => {

    const { usuario } = useContext(UsuarioContext)
    const [precio, setprecio] = useState(0)
    const url = useLocation()
    const querySearchParams = new URLSearchParams(url.search);


    useEffect(() => {
        definirPrecio()
    }, [])

    const definirPrecio = () => {
        const precio_default = querySearchParams.get(default_price)
        try {
            if (precio_default) {
                let precio = listas_Precios(parseInt(precio_default))
                setprecio(precio)
            } else {
                if (usuario) {
                    let precio = listas_Precios(usuario.IntPrecio)
                    setprecio(precio)
                } else {
                    setprecio(producto.IntPrecio3)
                }
            }
        } catch (error) {
            console.log(error)

        }
    }

    const listas_Precios = (precio) => {
        switch (precio) {
            case 1:
                return producto.IntPrecio1
            case 2:
                return producto.IntPrecio2
            case 3:
                return producto.IntPrecio3
            case 4:
                return producto.IntPrecio4
            default:
                return producto.IntPrecio3
        }
    }

    return (
        <div
            onClick={() => {
                setisViewModalProducto(true)
                setproducto_Modal({
                    referencia: producto.StrIdProducto,
                    precio: precio
                })
            }}
            className='flex flex-col bg-white pb-4 rounded-md hover:scale-105 transition-all border-2 border-gray-300 overflow-hidden'
        >
            <img
                src={`${(producto && producto.StrArchivo !== null) ? ConsultarImagenes(producto.StrArchivo) : ""} `}
                loading='lazy'
                className='w-full h-72 rounded-t-lg object-contain cursor-pointer '
                alt={`${producto.StrDescripcion}`}
            />
            <div className='px-2 mt-8'>
                <p className='font-medium w-52 lg:w-40 truncate'>{producto.StrDescripcion ? producto.StrDescripcion : "Undefined"}</p>
                <p className='font-medium text-slate-700 text-sm'>{producto.StrIdProducto ? producto.StrIdProducto : "Undefined"}</p>
                <p className='font-medium text-blue-700'>${precio ? FormateoNumberInt(precio) : "Error"} / <span>{producto.StrUnidad ? producto.StrUnidad : "Undefined"}</span></p>
                <div className='letrero_iva'>
                    * Precio con iva incluido *
                </div>
            </div>


        </div>
    )
}
