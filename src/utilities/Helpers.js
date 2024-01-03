export const FormateoNumberInt = (num) => {
    try {
        return parseFloat(num).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
    } catch (error) {
        //// console.log(err)
    }
}

export const ConsultarImagenes = (ruta_imagen) =>{
    return `https://panel.inmodafantasy.com.co:8083/imagenes/owncloud${ruta_imagen}`
}