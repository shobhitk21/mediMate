import React, { useContext, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const MyAppointments = () => {

  const { backendUrl, token } = useContext(AppContext)

  const [appointments, setAppointments] = useContext([])

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  const getUserAppointments = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
        console.log(data.appointments);
      }

    } catch (error) {
      console.log(error);
      taost.error(error.message)

    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])



  return (

    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
      <div className='text-black'>
        {doctors.slice(0, 3).map((item, index) => (
          <div className='grid grid-col-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
            <div>
              <img className='w-32 bg-indigo-50' src={item.docData.image} alt="err" />
            </div>

            <div className='flex-1 text-sm text-zinc-600'>
              <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
              <p>{item.docData.speciality}</p>
              <p className='text-zinc-700 font-medium mt-1'>Address:</p>
              <p className='text-xm'>{item.docData.address.line1}</p>
              <p className='text-xm'>{item.docData.address.line2}</p>
              <p className='text-xm mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
            </div>
            <div></div>
            <div className='flex flex-col gap-2 justify-end'>
              <button className='text-sm text-sone-500 text-center sm:mon-w-48 py-2 px-3 cursor-pointer border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay online</button>
              <button className='text-sm text-sone-500 text-center sm:mon-w-48 py-2 px-3 cursor-pointer border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>
            </div>
          </div>
        ))
        }
      </div>
    </div>

  )
}

export default MyAppointments