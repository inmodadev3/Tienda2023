import React, { createContext, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import RUTAS from './PATHS'
import { Tienda } from '../views/Tienda'
import { Login } from '../views/Login'
import { Carrito } from '../views/Carrito'
import { Chekcout } from '../views/Chekcout'
import { Busquedas } from '../views/Busquedas'
import { Perfil } from '../views/Perfil'

export const UsuarioContext = createContext();

export const Routers = () => {

    const [usuario, setUsuario] = useState(null);

    return (
        <UsuarioContext.Provider value={{ usuario, setUsuario }}>
            <HashRouter>
                <Routes>
                    <Route path={RUTAS.TIENDA} Component={Tienda} />
                    <Route path={RUTAS.LOGIN} Component={Login} />
                    <Route path={RUTAS.CARRITO} Component={Carrito} />
                    <Route path={RUTAS.CHEKOUT} Component={Chekcout} />
                    <Route path={RUTAS.BUSCAR} Component={Busquedas}/>
                    <Route path={RUTAS.PERFIL} Component={Perfil}/>
                </Routes>
            </HashRouter>
        </UsuarioContext.Provider>

    )
}
