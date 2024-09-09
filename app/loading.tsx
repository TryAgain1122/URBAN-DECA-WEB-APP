
import Loader from '@/components/layout/Loader'
import React from 'react'

const loading = () => {
  return (
    <div className='w-full h-[100vh] flex justify-center items-center'>
       <Loader />
    </div>
  )
  
 
}

export default loading