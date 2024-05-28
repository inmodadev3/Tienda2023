import axios from "axios";

const url = 'https://panel.inmodafantasy.com.co:8083/api/tienda'
const urlPruebas = 'https://localhost:8083/api/tienda'

export default axios.create({
  baseURL: url
})


