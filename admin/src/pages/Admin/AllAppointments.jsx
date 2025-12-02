import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../../src/assets/assets_admin/assets'
import { useState } from 'react'

const AllAppointments = () => {

  const { aToken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { calculateAge, slotDateFormat } = useContext(AppContext)

  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => {
    getAllAppointments()
  }, [aToken])


  return (
    <div className='w-full max-w-6xl m-5 '>
      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {
          [...appointments].reverse().map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2'>
                <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
              </div>
              <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
              <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
              <div className='flex items-center gap-2'>
                <img src={item.docData.image} className='w-8 rounded-full bg-gray-200' alt="" /> <p>{item.docData.name}</p>
              </div>
              <p>₹{item.amount}</p>
              {item.cancelled
                ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                : item.isCompleted
                  ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                  : <>
                    {
                      confirmId === item._id
                        ? (<div className='flex gap-2'>
                          <button className='bg-red-500 text-white px-2 py-1 rounded text-xs sm:text-sm hover:bg-red-600 transition' onClick={() => { cancelAppointment(item._id); setConfirmId(null); }}>Yes</button>
                          <button className='bg-gray-300 px-2 py-1 rounded text-xs sm:text-sm hover:bg-gray-400 transition' onClick={() => setConfirmId(null)}>No</button>
                        </div>)
                        : item.isPayed
                          ? <p className='text-green-500 text-sm'>Paid</p>
                          : (<img onClick={() => setConfirmId(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />)
                    }
                  </>
              }
            </div>
          ))
        }
      </div>

    </div>
  )
}

export default AllAppointments