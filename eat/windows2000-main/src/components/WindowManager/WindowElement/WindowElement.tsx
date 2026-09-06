//style
import './WindowElement.css'

//icons
import btn_close_ico from "../../../assets/sprites/window/close.png"
import btn_close_hover_ico from "../../../assets/sprites/window/close_hover.png"
import btn_minimize_ico from "../../../assets/sprites/window/minimize.png"
import btn_minimize_hover_ico from "../../../assets/sprites/window/minimize_hover.png"
import btn_maximize_ico from "../../../assets/sprites/window/maximize.png"
import btn_maximize_hover_ico from "../../../assets/sprites/window/maximize_hover.png"
import btn_unmaximize_ico from "../../../assets/sprites/window/unmaximize.png"
import btn_unmaximize_hover_ico from "../../../assets/sprites/window/unmaximize_hover.png"



//hooks
import { useState } from 'react'
import { WindowModel } from '../../../models/WindowModel'

export function WindowElement({
  handleDragStart,
  windowObj,
  updateWindow,
}:{
  handleDragStart:(e: React.MouseEvent<HTMLDivElement>)=>void,
  windowObj:WindowModel,
  updateWindow(updater: (a: WindowModel) => WindowModel): void
}){

  const {x,y,w,h,title,ico} = windowObj
  // const [x,setX] = useState(50)
  // const [y,setY] = useState(50)
  const [minimizePressed,setMinimizePressed] =useState(false)
  const [maximizePressed,setMaximizePressed] =useState(false)
  const [closePressed,setClosePressed] =useState(false)

  const [isMaximized,setIsMaximized] = useState(false)  


  function handleMinimize(){
    setMinimizePressed(false)
    updateWindow((prev)=>{
      prev.isMinimized=!prev.isMinimized
      return prev
    })

  }

  function handleMaximize(){
    setMaximizePressed(false)

    setIsMaximized(prev=>!prev)

    //TODO? call windowManager            
  }

  function handleClose(){
    setClosePressed(false)

    //TODO call window manager close
  }



  function innerHandleDragStart(e: React.MouseEvent<HTMLDivElement>): void {
    // setIsMaximized(false) //TODO fix mouse offset
    handleDragStart(e)
  }

  if(windowObj.isMinimized){
    return <></>
  }



  return(
    <>
      <div className={'Window' + (isMaximized?" maximized":"")} 
        style={{top:y+"px",left:x+"px"}}
      >

        <div className='Window--inner'>

          <header>
            <div className='info'
              onMouseDown={innerHandleDragStart}
              // onMouseUp={handleDragEnd}
            >
              <img src={ico} alt="" />
              <span className='title'>{ title }</span>
            </div>
            <div className='actions'>
              <button className='minimize'
                onMouseDown={()=>setMinimizePressed(true)}
                onMouseUp={handleMinimize}
                onMouseLeave={()=>setMinimizePressed(false)}
              >
                <img 
                src={
                  minimizePressed
                  ?btn_minimize_hover_ico
                  :btn_minimize_ico
                  } alt="minimize" />
              </button>

              <button className='maximize'
                onMouseDown={()=>setMaximizePressed(true)}
                onMouseUp={handleMaximize}
                onMouseLeave={()=>setMaximizePressed(false)}
              >
                <img 
                src={
                  isMaximized
                  ?(maximizePressed
                    ?btn_unmaximize_hover_ico
                    :btn_unmaximize_ico)
                  :(maximizePressed
                    ?btn_maximize_hover_ico
                    :btn_maximize_ico
                  )
                  } alt="maximize" />
              </button>

              <button className='close'
                onMouseDown={()=>setClosePressed(true)}
                onMouseUp={handleClose}
                onMouseLeave={()=>setClosePressed(false)}
              >
                <img 
                src={
                  closePressed
                  ?btn_close_hover_ico
                  :btn_close_ico
                  } alt="close" />
              </button>


            </div>
          </header>
          <div className='content'>
            <div className='content--inner' style={{width:w,height:h}}>
              <windowObj.windowElement />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}




