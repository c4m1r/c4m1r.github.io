
import './App.css'
// import { Desktop } from './components/Desktop/Desktop'
import { Taskbar } from './components/Taskbar/Taskbar'
import { WindowManager } from './components/WindowManager/WindowManager'

import { useContext,useEffect } from 'react'
import { WindowManagerContext } from './contexts/WindowManagerContext'



import { Window_Greeting } from './components/windowPages/Greeting/Greeting'

function App() {
  const {addWindow} = useContext(WindowManagerContext)

  useEffect(()=>{
    // addWindow({title:"Documents",ico:ico_folder,x:50,y:50},)
    addWindow( Window_Greeting )
  },[])

  return (
    <>
      <div className='App'>
        {/* <Desktop/> */}
        <WindowManager/>
        <Taskbar/>
      </div>
    </>
  )
}

export default App


