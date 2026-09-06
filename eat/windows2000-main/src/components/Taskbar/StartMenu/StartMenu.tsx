import './StartMenu.css'

import sideBar from '../../../assets/sprites/startMenu/sideBar.png'



/*

151,"Apagar ..."
135,"Ejecutar ..."
129,"Ayuda"
123,"Buscar"
115,"Configuración"
109,"Documentos"
104,"Programas"
104,"Accesorios"
104,"Inicio"
104,"Internet Explorer"
104,"Outlook Express"
228,"Windows Update"

 */

import ico_Apagar from '../../../assets/ICON/151.ico'
import ico_Ejecutar from '../../../assets/ICON/135.ico'
import ico_Ayuda from '../../../assets/ICON/129.ico'
import ico_Buscar from '../../../assets/ICON/123.ico'
import ico_Configuracion from '../../../assets/ICON/115.ico'
import ico_Documentos from '../../../assets/ICON/109.ico'
import ico_Programas from '../../../assets/ICON/104.ico'
import ico_Accesorios from '../../../assets/ICON/102.ico'
// import ico_Inicio from '../../../assets/ICON/102.ico'
// import ico_Internet from '../../../assets/ICON/104.ico'
// import ico_Outlook from '../../../assets/ICON/104.ico'
import ico_Update from '../../../assets/ICON/228.ico'
import { ReactElement, ReactNode, useState } from 'react'





export function StartMenu(){

  return(
    <>
      <div className='StartMenu'>
        <div className='StartMenu--inner'>

          <img src={sideBar} alt="" className='banner'/>
          <div className='content'>

            <Row ico={ico_Update} name='Windows Update'/>

            <Spacer/>
            
            <Row ico={ico_Programas} name='Programas'>
              <Row ico={ico_Accesorios} name='Accesorios' />
              <Row ico={ico_Accesorios} name='Inicio' />
            </Row>
            <Row ico={ico_Documentos} name='Documentos'/>
            <Row ico={ico_Configuracion} name='Configuración'/>
            <Row ico={ico_Buscar} name='Buscar'/>

            <Row ico={ico_Ayuda} name='Ayuda'/>

            <Row ico={ico_Ejecutar} name='Ejecutar...'/>

            <Spacer/>

            <Row ico={ico_Apagar} name='Apagar...'/>

            
          </div>

        </div>
      </div>
    </>
  )
}


import {Ico_Arrow} from '../../../assets/sprites/sprites.tsx'


function Row({ico,name,children}:{ico:string,name:string,children?:ReactElement | ReactNode}){

  const [active,setActive] = useState(false)

  return(
    <>
    <div className={'row' + (active?" active":"")} onClick={()=>setActive(true)}>
      <img src={ico} alt="" />
      <span className='main'>{name}</span>
      {children && <Ico_Arrow/> }
      {(children && active) && 
        <ContextBox>
          {children}
        </ContextBox> 
      }
    </div>
    </>

  )
}



function Spacer(){
  return (<span className='spacer' />)
}

function ContextBox({children}:{children?:ReactElement | ReactNode}){
  return (
    <div className='contextBox'>
      <div className='contentBox--inner'>
        <div className='content'>
          {children}

        </div>
      </div>
    </div>
  )
}