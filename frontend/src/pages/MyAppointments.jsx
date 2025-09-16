import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {

  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  const [appointments, setAppointments] = useState([])

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
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)

    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {

      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  const handlePayNow = async (appointmentId) => {
    try {

      const res = await axios.post(backendUrl + '/api/user/payment/initiate', { appointmentId }, { headers: { token } });

      if (res.data.success) {
        const { paymentData, action } = res.data;

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = action;

        for (const key in paymentData) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = paymentData[key];
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
      } else {
        toast.error('Payment initiation failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment error');
    }
  };



  useEffect(() => {
    if (token) {
      getUserAppointments()
    }
  }, [token])



  return (

    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>
      <div className='text-black'>
        {appointments.map((item, index) => (
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
              {!item.cancelled && item.payment?.status === "success" && !item.isCompleted && <button className='text-sm text-sone-500 text-center sm:mon-w-48 py-2 px-3 cursor-pointer border rounded hover:bg-primary hover:text-white transition-all duration-300'>Paid</button>}
              {!item.cancelled && item.payment && !item.isCompleted && <button onClick={() => handlePayNow(item._id)} className='text-sm text-sone-500 text-center sm:mon-w-48 py-2 px-3 cursor-pointer border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay online</button>}
              {!item.cancelled && !item.payment && !item.isCompleted && <button onClick={() => handlePayNow(item._id)} className='text-sm text-sone-500 text-center sm:mon-w-48 py-2 px-3 cursor-pointer border rounded hover:bg-primary hover:text-white transition-all duration-300'>Pay online</button>}
              {!item.cancelled && !item.isCompleted && <button onClick={() => cancelAppointment(item._id)} className='text-sm text-sone-500 text-center sm:mon-w-48 py-2 px-3 cursor-pointer border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
              {item.cancelled && !item.isCompleted && <button className='min-w-48 py-2 border border-red-500 rounded text-red-500'> Appointment Cancelled </button>}
              {item.isCompleted && <button className='min-w-48 py-2 border border-green-500 rounded text-green-500'> Appointment Completed </button>}
            </div>
          </div>
        ))
        }
      </div>
    </div>

  )
}

export default MyAppointments