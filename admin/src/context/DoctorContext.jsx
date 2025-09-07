import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)


    const getAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })
            if (data.success) {
                setAppointments(data?.appointments.reverse())
                // console.log(data?.appointments.reverse());
            } else {
                toast.error(data.messsage)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.messsage)
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {

            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.messsage)
                getAppointments()
            } else {
                toast.error(data.messsage)
            }

        } catch (error) {
            console.log(error);
            toast.error(error.messsage)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dToken } })
            if (data.success) {
                toast.success(data.messsage)
                getAppointments()
            } else {
                toast.error(data.messsage)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.messsage)
        }
    }

    const getDashData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })
            if (data.success) {
                toast.success(data.messsage)
                setDashData(data.dashData)
                console.log(data.dashData);

            } else {
                toast.error(data.messsage)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.messsage)
        }

    }

    const getProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })
            if (data.success) {
                toast.success(data.messsage)
                setProfileData(data.profileData)
                console.log(data.profileData);

            } else {
                toast.error(data.messsage)
            }
        } catch (error) {
            console.log(error);
            toast.error(error.messsage)
        }

    }



    const value = {
        dToken, setDToken,
        backendUrl,
        appointments, setAppointments, getAppointments,
        completeAppointment, cancelAppointment,
        dashData, setDashData, getDashData,
        profileData, setProfileData, getProfileData
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )
}

export default DoctorContextProvider
