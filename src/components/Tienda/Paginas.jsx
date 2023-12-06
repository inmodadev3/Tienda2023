import React from 'react';

export const Paginas = ({ totalPaginas, pagina = 0, setpagina }) => {
    const maxPagesToShow = 10; // Número máximo de páginas a mostrar
    const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);
    const totalPages = Array.from({ length: totalPaginas }, (_, index) => index + 1);

    const firstPage = 1;
    const lastPage = totalPages[totalPages.length - 1];

    // Calcula los rangos de páginas a mostrar
    let startPage = Math.max(pagina - halfMaxPagesToShow, firstPage);
    let endPage = Math.min(pagina + halfMaxPagesToShow, lastPage);

    // Ajusta los rangos si es necesario para mostrar el número máximo de páginas
    if (endPage - startPage + 1 < maxPagesToShow) {
        if (startPage === firstPage) {
            endPage = Math.min(startPage + maxPagesToShow - 1, lastPage);
        } else if (endPage === lastPage) {
            startPage = Math.max(endPage - maxPagesToShow + 1, firstPage);
        }
    }

    return (
        <div>
            <div className="w-full">
                <ul className="flex justify-center gap-x-2 [&>li]:font-bold">
                    {startPage > firstPage && (
                        <>
                            <li
                                className={`flex justify-center items-center cursor-pointer w-8 h-8 rounded bg-white hover:bg-sky-700 hover:text-white transition-all duration-300`}
                                onClick={() => setpagina(firstPage)}
                                key={firstPage}
                            >
                                {firstPage}
                            </li>
                            <li className="bg-white px-2 rounded">...</li>
                        </>
                    )}

                    {totalPages.map((page) => (
                        page >= startPage && page <= endPage && (
                            <li
                                className={`flex justify-center items-center cursor-pointer w-8 h-8 rounded hover:bg-sky-700 hover:text-white transition-all duration-300 ${pagina + 1 === page ? 'bg-sky-700 text-white' : 'bg-white text-black'}`}
                                onClick={() => setpagina(page - 1)}
                                key={page}
                            >
                                {page}
                            </li>
                        )
                    ))}

                    {endPage < lastPage && (
                        <>
                            <li className="bg-white px-2 rounded">...</li>
                            <li
                                className={`flex justify-center bg-white items-center cursor-pointer w-8 h-8 rounded hover:bg-sky-700 hover:text-white transition-all duration-300`}
                                onClick={() => setpagina(lastPage - 1)}
                                key={lastPage}
                            >
                                {lastPage}
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};
