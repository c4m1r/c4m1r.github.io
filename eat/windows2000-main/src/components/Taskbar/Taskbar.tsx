import './Taskbar.css'

import startBtn from '../../assets/start.png'
import startBtn_open from '../../assets/start_down.png'
import { useState,useContext } from 'react'
import { StartMenu } from './StartMenu/StartMenu'

//context
import { WindowManagerContext } from '../../contexts/WindowManagerContext'

export function Taskbar(){

  const {windows,updateWindow} = useContext(WindowManagerContext)

  const [menuIsOpen,setMenuOpen] = useState(false)

  const d = new Date()

  return (
    <>
      <div className='Taskbar'>
        <button className='startbtn' onClick={()=>setMenuOpen(prev=>!prev)}>
          <img src={menuIsOpen ? startBtn_open : startBtn} title='Click here to start' />
        </button>
        <Spacer/>
        <div className='activeWindows'>

          {windows &&
            windows.map((w,i)=>{

              function handleMinimize(){

                //TODO !focus?w.focus():(prev.isMinimized=!prev.isMinimized)
                updateWindow(w,(prev)=>{
                  prev.isMinimized=!prev.isMinimized
                  return prev
                })
              }

              return (
                <div className={'thumbnail' + (!w.isMinimized?" active":"")}
                  onClick={handleMinimize}
                  key={i}
                >
                  <div className='inner'>
                    <span>{w.title.length>10?w.title.substring(0, 7)+"...":w.title}</span>
                  </div>
                </div>
              )
            })
          }


        </div>
        <Spacer/>
        <div className='notifications'>
          
          <span className='clock'>{d.getHours().toString().padStart(2,"0")}:{d.getMinutes().toString().padStart(2,"0")}</span>
        </div>
      </div>
      {menuIsOpen && <StartMenu/>}
    </>
  )
}


function Spacer(){
  return (<span className='spacer' />)
}