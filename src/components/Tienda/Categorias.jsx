import React, { useEffect } from 'react'
import Axios from '../../utilities/Axios'
import { LoaderComponent } from '../Loader/LoaderComponent'
import { AiFillCaretDown, AiFillCaretUp } from 'react-icons/ai'
import { BiArrowBack } from 'react-icons/bi'
import { useLocation } from 'react-router-dom'
import { categoria } from '../../routes/QueryParams'

export const Categorias = ({
    subCategorias,
    subCategoriaSelected,
    isLoadCategorias,
    categorias,
    lineasChecked,
    gruposChecked,
    tiposChecked,
    isViewModalCategoriasMobile,
    setsubCategoriaSelected, // CAMBIO DE ESTADOS
    setisLoadCategorias, //     CAMBIO DE ESTADOS
    setsubCategorias, //        CAMBIO DE ESTADOS
    setcategorias, //           CAMBIO DE ESTADOS
    settotal_Productos, //      CAMBIO DE ESTADOS
    setlineasChecked, //        CAMBIO DE ESTADOS
    setgruposChecked, //        CAMBIO DE ESTADOS
    settiposChecked,
    settotal_Paginas,
    setarrayProductos,
    setpagina,
    Consultar_Total_Productos, //FUNCION PARA CALCULAR EL TOTAL DE PRODUCTOS POR CATEGORIAS
}) => {

    const url = useLocation()
    const querySearchParams = new URLSearchParams(url.search);

    useEffect(() => {
        consultar_Categorias()
    }, [])

    useEffect(()=>{
        const categoria_parametro = querySearchParams.get(categoria)
        if(categorias.length > 0 &&  categoria_parametro){
            let findCategoria = categorias.find((categoria)=>categoria.StrDescripcion == categoria_parametro)
            if(findCategoria){
                consultar_SubCategorias(findCategoria)
            }
        }
    },[categorias])


    const LimpiarDatos = () => {
        setsubCategorias(null)
        setsubCategoriaSelected([])
        setlineasChecked([])
        setgruposChecked([])
        settiposChecked([])
        Consultar_Total_Productos()
        setarrayProductos(null)
        setpagina(0)
    }

    /* CONSULTAR CATEGORIAS PRINCIPALES */
    const consultar_Categorias = async () => {
        setisLoadCategorias(true)
        try {
            const data_Categorias = await Axios.get('/categorias')
            const categorias = data_Categorias.data.data
            setcategorias(categorias)
        } catch (error) {
            console.error(error)
        } finally {
            setisLoadCategorias(false)
        }
    }

    //CONSULTAR LA CANTIDAD DE PRODUCTOS DE LA CLASE
    const consultar_cantidadProductos_Clase = (StrIdClase) => {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await Axios.get(`/productos/contar/clase/${StrIdClase}`)
                settotal_Paginas(data.data.Paginas)

                resolve(data)
            } catch (error) {
                reject(error)
            }
        })
    }

    /* CONSULTAR LINEAS GRUPOS Y TIPOS DE UNA CATEGORIA */
    const consultar_SubCategorias = async (categoria) => {
        setisLoadCategorias(true)
        setpagina(0)
        try {
            const subCategorias = []
            const data_Lineas = await Axios.get(`/categorias/lineas?clase=${categoria.StrIdClase}`)
            const lineas = data_Lineas.data.data
            for (const linea of lineas) {
                const data_grupo = await Axios.get(`/categorias/lineas/grupos?linea=${linea.StrIdLinea}`);
                const grupos = data_grupo.data.data;

                const lineaInfo = {
                    linea: linea,
                    grupos: []
                };

                for (const grupo of grupos) {
                    const data_Tipos = await Axios.get(`/categorias/lineas/grupos/tipos?Grupo=${grupo.strIdGrupo}&Linea=${linea.StrIdLinea}`);
                    const tipos = data_Tipos.data.data;

                    const grupoInfo = {
                        grupo: grupo,
                        tipos: tipos
                    };
                    lineaInfo.grupos.push(grupoInfo);
                }

                subCategorias.push(lineaInfo);
            }

            const totalPaginas = await consultar_cantidadProductos_Clase(categoria.StrIdClase)

            if (totalPaginas.data.success) {
                settotal_Productos(totalPaginas.data.data)
            }

            setsubCategorias({
                categoria,
                subCategorias
            })

        } catch (error) {
            console.error(error)
        } finally {
            setisLoadCategorias(false)
        }
    }

    //DESPLEGAR GRUPOS Y TIPOS DE SUBCATEGORIAS
    const Desplegar_Subcategorias = (IdSubcategoria) => {
        const subcategoria = subCategoriaSelected.find((item) => { return item == IdSubcategoria })
        if (subcategoria) {
            setsubCategoriaSelected((subcategoria) => {
                return subcategoria.filter((item) => { return item !== IdSubcategoria })
            })
        } else {
            setsubCategoriaSelected((subcategoria) => {
                return [...subcategoria, IdSubcategoria]
            })
        }
    }

    //VALIDAR LINEAS CHECKEADAS
    const checkearCategorias = (IdLinea) => {
        const categoriaFind = lineasChecked.find((item) => { return item == IdLinea })
        if (categoriaFind) {
            setlineasChecked((subcategoria) => {
                return subcategoria.filter((item) => { return item !== IdLinea })
            })
        } else {
            setlineasChecked((subcategoria) => {
                return [...subcategoria, IdLinea]
            })
        }
    }

    //VALIDAR GRUPOS CHECKEADOS
    const chekearGrupos = (IdGrupo,IdLinea) => {
        const gruposFind = gruposChecked.find((item) => { return item.IdGrupo == IdGrupo })
        if (gruposFind) {
            setgruposChecked((subcategoria) => {
                return subcategoria.filter((item) => { return item.IdGrupo !== IdGrupo })
            })
        } else {
            setgruposChecked((subcategoria) => {
                return [...subcategoria, {IdGrupo,IdLinea}]
            })
        }
    }

    //VALIDAR Tipos CHECKEADOS
    const checkearTipos = (IdTipo ,IdGrupo, IdLinea) => {
        const tiposFind = tiposChecked.find((item) => { return item.IdTipo == IdTipo })

        if (tiposFind) {
            settiposChecked((subcategoria) => {
                return subcategoria.filter((item) => { return item.IdTipo !== IdTipo })
            })
        } else {
            settiposChecked((subcategoria) => {
                return [...subcategoria, {IdTipo,IdGrupo,IdLinea}]
            })
        }

    }


    return (
        <section className={`
        absolute right-0 h-auto w-[280px] min-h-[350px] max-h-[600px] overflow-y-scroll py-2 bg-white Scroll-invisible ${isViewModalCategoriasMobile ? "inline" : "hidden"} z-20 border-2 border-gray-300
        xl:left-0 xl:flex xl:sticky xl:top-0`}>
            <div className='w-full text-sm font-medium'>

                {
                    subCategorias !== null ?
                        (<div>
                            <div
                                onClick={() => {
                                    LimpiarDatos()
                                }}
                                className='flex items-center w-auto px-4 mb-2 cursor-pointer gap-x-3'
                            >
                                <span><BiArrowBack size={20} /></span>
                                <span>Volver</span>
                            </div>
                            <h4 className='text-lg font-bold text-center text-black'>{subCategorias.categoria.StrDescripcion}</h4>
                            <div className='mt-2'>
                                {
                                    subCategorias.subCategorias.map((lineas) => (
                                        <div
                                            key={lineas.linea.StrIdLinea}
                                            className='flex flex-col '
                                        >
                                            <div className={`flex items-center justify-between px-2 ${lineas.grupos.length > 1 && "hover:text-blue-500 cursor-pointer"}`}>
                                                <label >
                                                    <input
                                                        className={"w-4 h-4"}
                                                        value={""}
                                                        type='checkbox'
                                                        onChange={(e) => {
                                                            e.stopPropagation()
                                                            checkearCategorias(lineas.linea.StrIdLinea)
                                                        }}
                                                    />
                                                </label>
                                                <div
                                                    className='flex items-center justify-between w-full py-5 mx-4'
                                                    onClick={() => { Desplegar_Subcategorias(lineas.linea.StrIdLinea) }}
                                                >
                                                    <p className=''>{lineas.linea.StrDescripcion == "UNAS" ? "UÑAS" : lineas.linea.StrDescripcion}</p>
                                                    {lineas.grupos.length > 1 &&
                                                        (<span className=' text-end'>
                                                            {subCategoriaSelected.find((item) => { return item == lineas.linea.StrIdLinea }) ? <AiFillCaretUp size={20} /> : <AiFillCaretDown size={20} />}

                                                        </span>)
                                                    }
                                                </div>
                                            </div>
                                            {
                                                subCategoriaSelected.find((item) => { return item == lineas.linea.StrIdLinea }) && (
                                                    <div className='flex flex-col ml-6 '>
                                                        {
                                                            lineas.grupos.map((grupo) => (
                                                                grupo.grupo.strIdGrupo !== '0' &&
                                                                <div key={grupo.grupo.strIdGrupo}>

                                                                    <div className='flex items-center py-2 text-gray-700 gap-x-6'>
                                                                        <input
                                                                            className={"!w-4 !h-4"}
                                                                            type='checkbox'
                                                                            disabled={lineasChecked.find((item) => { return item == lineas.linea.StrIdLinea }) ? true : false}
                                                                            checked={
                                                                                (lineasChecked.find((item) => { return item == lineas.linea.StrIdLinea }) ? true : false) 
                                                                                | (gruposChecked.find((item) => item.IdGrupo == grupo.grupo.strIdGrupo && item.IdLinea == lineas.linea.StrIdLinea) ? true : false)
                                                                            }
                                                                            onChange={() => {
                                                                                chekearGrupos(grupo.grupo.strIdGrupo,lineas.linea.StrIdLinea)
                                                                            }}
                                                                        />
                                                                        <p>{grupo.grupo.StrDescripcion == "CORTAUNAS" ? "CORTAUÑAS" : grupo.grupo.StrDescripcion}</p>
                                                                    </div>
                                                                    <div className='py-2'>
                                                                        {
                                                                            grupo.tipos.map((tipo) => (
                                                                                tipo.strIdTipo !== "0" &&
                                                                                <div className='flex py-2 ml-6 text-gray-500 gap-x-4' key={tipo.strIdTipo}>
                                                                                    <input
                                                                                        className={"w-4 h-4"}
                                                                                        type='checkbox'
                                                                                        value={""}
                                                                                        checked={
                                                                                            (lineasChecked.find((item) => { return item == lineas.linea.StrIdLinea }) ? true : false) 
                                                                                            | (gruposChecked.find((item) => item.IdGrupo == grupo.grupo.strIdGrupo) ? true : false) 
                                                                                            | (tiposChecked.find(item => item.IdTipo == tipo.strIdTipo && item.IdGrupo == grupo.grupo.strIdGrupo) ? true: false)
                                                                                        }
                                                                                        disabled={
                                                                                            (lineasChecked.find((item) => { return item == lineas.linea.StrIdLinea }) ? true : false) 
                                                                                            | (gruposChecked.find((item) => item.IdGrupo == grupo.grupo.strIdGrupo) ? true : false)
                                                                                        }
                                                                                        onChange={() => {
                                                                                            checkearTipos(tipo.strIdTipo, grupo.grupo.strIdGrupo,lineas.linea.StrIdLinea)
                                                                                        }}
                                                                                    />
                                                                                    <p>{tipo.strDescripcion}</p>
                                                                                </div>
                                                                            ))
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                )
                                            }

                                        </div>
                                    ))
                                }
                            </div>
                        </div>)
                        :
                        (!isLoadCategorias && subCategorias == null ?
                            (<>
                                <h3 className='my-2 text-base font-medium text-center text-blue-800'>Seleccione una categoria</h3>
                                {categorias.map((categoria) => (
                                    <div
                                        key={categoria.StrIdClase}
                                        className='px-2 py-6 border-b-2 cursor-pointer hover:bg-blue-600 hover:text-white border-b-slate-300'
                                        onClick={() => { consultar_SubCategorias(categoria) }}
                                    >
                                        <p>{categoria.StrDescripcion}</p>
                                    </div>
                                ))}
                            </>

                            ) :
                            (
                                <div className='absolute top-0 bottom-0 flex flex-col items-center justify-center w-full h-full m-auto gap-y-5'>
                                    <LoaderComponent />
                                    <span> Cargando Categorias...</span>
                                </div>
                            ))
                }
            </div>

        </section>
    )
}
