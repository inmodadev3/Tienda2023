import React from "react";

export const Filtros = ({ filtro, setfiltro }) => {

    const manejarCambioFiltro = (e) => {
        const value = e.target.value

        if (value) {
            setfiltro(value)
        }
    }


    return (
        <div className='flex items-center gap-x-1'>
            <label
                htmlFor="sort-select"
                className='cursor-pointer'
            >
                Ordenar por
            </label>
            <select
                id="sort-select"
                className='font-bold tracking-wide bg-transparent outline-none'
                value={filtro}
                onChange={manejarCambioFiltro}
            >
                <option value="recent">Mas recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
            </select>
        </div>
    );
}
