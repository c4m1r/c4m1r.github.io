import { WindowElement } from './WindowElement/WindowElement'
import './WindowManager.css'


import { useState,useContext } from 'react'
import { WindowManagerContext } from '../../contexts/WindowManagerContext'
import { WindowModel } from '../../models/WindowModel'




export function WindowManager() {

  const {windows,setWindows,updateWindow} = useContext(WindowManagerContext)




  //start of windowDragIndex
  const [xStart,setXStart] = useState(0)
  const [yStart,setYStart] = useState(0)

  const [isDragging,setIsDragging] = useState(false)
  const [windowDragIndex,setWindowDragIndex] = useState<number | undefined>(undefined);


  //updates a window to the first position in the windows array
  function focusWindow(
    windowIndex: number,
    windowObject: WindowModel | ((window: WindowModel) => WindowModel)
  ) {
    setWindows(prevWindows => {
      const newWindows = [...prevWindows];
      const currentWindow = prevWindows[windowIndex];

      if (typeof windowObject === 'function') {
        newWindows[windowIndex] = windowObject(currentWindow);
      } else {
        newWindows[windowIndex] = windowObject;
      }

      return newWindows;
    });
  }



  //when dragging ends
  // function handleDragEnd(e: React.MouseEvent<HTMLDivElement>): void {
  function handleDragEnd(): void {
    if(isDragging && windowDragIndex!== undefined){
      setIsDragging(false)
      setWindowDragIndex(undefined)
    }
  }

  //when dragging
  function handleDrag(e: React.MouseEvent<HTMLDivElement>): void {

    if(isDragging && windowDragIndex!== undefined){
      setXStart(e.clientX)
      setYStart(e.clientY)
      focusWindow(windowDragIndex,(prevWind)=>{
        const newWind = {...prevWind}
        const {x:prevX,y:prevY} = newWind
        newWind.x = prevX + (e.clientX - xStart)
        newWind.y = prevY + (e.clientY - yStart)
        return newWind
      })

    }
  }


  //when drag starts
  function handleDragStart(e: React.MouseEvent<HTMLDivElement>,i:number): void {
        
    setWindows(prevWindows=>{
      const newWindows = [...prevWindows]; // Create a shallow copy of the original array
      const [selected] = newWindows.splice(i, 1); // Remove the selected at the specified index
      return [...newWindows,selected]
    })


    setXStart(e.clientX)
    setYStart(e.clientY)
    setWindowDragIndex(windows.length-1)
    setIsDragging(true)
  }

  

  return (
    <>
      <div className='WindowManager'

        onMouseUp={handleDragEnd}
        onMouseMove={handleDrag}
      >
        
        <div className='container'>

          {
            windows.map((wind, i) => {

              function handleUpdateWindow(updater:(a: WindowModel) => WindowModel){
                updateWindow(wind,updater)
              }

              return (
                <WindowElement
                  windowObj={wind}
                  key={i}
                  updateWindow={handleUpdateWindow}


                  handleDragStart={(e:React.MouseEvent<HTMLDivElement>) => handleDragStart(e, i)}
                />
              )
            })
          }
          


        </div>
      </div>
    </>
  )
}