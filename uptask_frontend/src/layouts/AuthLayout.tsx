import Logo from '@/components/Logo'
import { Link, Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

export default function AuthLayout() {
  return (
    <>
      <div className='bg-gray-800 min-h-screen'>

        <div className='py-10 lg:py-20 mx-auto w-[650px]'>
          <Link to='/'>
            <Logo />
          </Link>

          <div className='mt-10 '>

            <Outlet />

          </div>

        </div>

      </div>
      <ToastContainer />
    </>
  )
}