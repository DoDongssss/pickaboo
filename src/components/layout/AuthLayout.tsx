import { Outlet } from 'react-router-dom'
import logo from '../../assets/logo.png'
import loginBgGif from '../../assets/gif/loginBgGif.gif'

export function AuthLayout() {
  return (
    <div className="relative h-screen min-w-full bg-[#F24E1E]">
      <div className='absolute inset-0 w-full h-full flex justify-center'>
        <img src={loginBgGif} alt="" className='h-80'/>
      </div>
      <div className='absolute bottom-0 w-full p-6 py-8 bg-white rounded-tl-2xl rounded-tr-2xl'>
        <img src={logo} alt="" className='w-20 mb-2' />
        <Outlet />
      </div>
    </div>
  )
}