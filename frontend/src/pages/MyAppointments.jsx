import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext.jsx'
const axios = window.axios;
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners';


const MyAppointments = () => {


  const { backendUrl, token, getDoctorsData } = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(false)


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

  const handlePayment = async (appointmentId) => {
    setLoading(true)
    try {
      const response = await axios.post(backendUrl + '/api/user/payment/create-order', { appointmentId }, { headers: { token } });
      console.log(response.data)

      const { id, amount, currency } = response.data;

      // Set up RazorPay options
      const options = {
        key: `${import.meta.env.VITE_RAZORPAY_KEY_ID}`, // Replace with your RazorPay Key ID
        amount: amount,
        currency: currency,
        name: "MEDIMATE",
        description: "Test Transaction",
        order_id: id,
        handler: async function (response) {
          try {
            const { data } = await axios.post(backendUrl + "/api/user/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appointmentId,
            })
            setLoading(false)

          } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.message)
            setLoading(false)
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setLoading(false)
    }
    setLoading(false)
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
        {
          appointments.length === 0 && <p className='text-center text-3xl text-zinc-600 mt-10'>No appointment booked yet</p>
        }
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
              {!item.cancelled && item.isPayed && !item.isCompleted && <button className='min-w-48 py-2 border border-green-500 rounded text-green-500'>Paid</button>}
              {!item.cancelled && !item.isPayed && !item.isCompleted && <button onClick={() => handlePayment(item._id)} className='text-sm text-sone-500 text-center sm:mon-w-48 py-2 px-3 cursor-pointer border rounded hover:bg-primary hover:text-white transition-all duration-300'> {loading ? <ClipLoader size={20} /> : "Pay online"}</button>}
              {!item.cancelled && !item.isPayed && !item.isCompleted && <button onClick={() => cancelAppointment(item._id)} className='text-sm text-sone-500 text-center sm:mon-w-48 py-2 px-3 cursor-pointer border rounded hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel appointment</button>}
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