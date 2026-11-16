
import './Greeting.css'

import ico from '../../../assets/ICON/104.ico'
import { WindowModel } from '../../../models/WindowModel'
import { useState } from "react"

const Greeting = () => {
    const [n,setN] = useState(0)


  return(
    <div>
        <h1>Welcome to my website</h1>
        <button
        onClick={()=>setN(prev=>prev+1)}
        >{n==0?"TEST":n}</button>

        <p>This is my portfolio, but also is a useful tool</p>
        <p>Feel free to play and investigate every single folder ;)</p>

        <p className='red'>ATENTION: this page is still in development, some functionalities may not work properly</p>

        <p>Meanwhile you can visit <a href="https://fabrega.cat">fabrega.cat</a></p>
    </div>
  )
}

export const Window_Greeting = new WindowModel({title:"Documentos",ico:ico,x:50,y:50,w:500,h:300},Greeting)