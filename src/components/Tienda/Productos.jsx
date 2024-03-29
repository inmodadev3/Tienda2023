import React from 'react'
import { Card_Productos } from '../Productos/Card_Productos'
import { LoaderComponent } from '../Loader/LoaderComponent'



export const Productos = ({ arrayProductos, isLoadingProductos, pagina, total_Paginas, setpagina, setisViewModalProducto, setproducto_Modal }) => {

  return (
    <div className='flex flex-col flex-1 md:px-4 md:mx-4 '>
  
      <div className=' rounded min-h-[600px] grid items-center gap-y-6 gap-x-4 pb-12 md:px-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
        {
          (arrayProductos !== null && arrayProductos !== undefined) ?
            (
              arrayProductos.map((producto, index) => (
                <Card_Productos producto={producto} key={index} setisViewModalProducto={setisViewModalProducto} setproducto_Modal={setproducto_Modal} />
              ))
            )
            : (
              <div className='flex flex-col items-center justify-center w-full col-span-4'>
                <span className='my-12 text-3xl font-medium text-center'>Cargando articulos</span>
              </div>
            )
        }
      </div>
      {
        isLoadingProductos && (
          <div className='flex items-center justify-center py-12'>
            <LoaderComponent />
          </div>
        )
      }
      <div>
        {
          pagina < total_Paginas && (
            <div className='flex justify-center'>
              <span onClick={() => { setpagina(pagina + 1) }} className='w-32 py-2 text-center text-white bg-blue-600 rounded cursor-pointer hover:bg-blue-800'>Cargar mas</span>
            </div>
          )
        }
      </div>
    </div>
  )
}
