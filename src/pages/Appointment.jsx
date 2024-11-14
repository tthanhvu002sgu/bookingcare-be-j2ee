import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RalatedDoctors from "../components/RalatedDoctors";
import axios from "axios";
import { toast } from "react-toastify";

const Appointment = () => {
  const { selectedDoctor, getDoctorByEmail, user } = useContext(AppContext);
  const email = useParams();

  useEffect(() => {
    getDoctorByEmail(email.doctorEmail);
  }, []);
  console.log(selectedDoctor);

  const daysOfWeek = ["SUN", "MON", "THU", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(selectedDoctor);

  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  const bookAppointment = async () => {
    try {
      if (user && Object.keys(user).length != 0) {
        const selectedSlot = docSlots[slotIndex];
        console.log(selectedSlot);

        const appointmentDate = selectedSlot[0].datetime.toDateString();
        const appointmentTime = slotTime;

        const dateObject = new Date(appointmentDate);
        const formattedDate = dateObject.toISOString().split("T")[0];

        const data = {
          patientEmail: user,
          doctorEmail: selectedDoctor.email,
          specialization: selectedDoctor.specializationName,
          address: '',
          doctorName: selectedDoctor.doctorName,
          paymentId: 1,
          date: formattedDate,
          time: appointmentTime,
          appointmentStatus: 0, // Assuming matching enum
        };

        

        const response = await axios.post(
          "https://localhost:7235/api/Appointment/add",
          data,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if(response.status == 200){
          toast.dark(
            `Booking appointment for ${data.patientEmail} with ${data.doctorName} on ${data.date} at ${data.time}`
          );
        }
      } else {
        toast.error("Please login to book an appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
    }
  };

  const getAvailableSlots = async () => {
    setDocSlots([]);

    //getting current
    let today = new Date();
    for (let i = 0; i < 7; i++) {
      //getting date with index
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      //setting end time of the date with index

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      //setting hours
      if (today.getDate() == currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        //add slot to array

        timeSlots.push({
          datetime: new Date(currentDate),
          time: formattedTime,
        });
        //increment time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots((prev) => [...prev, timeSlots]);
    }
  };

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
  }, [docSlots]);
  return (
    docInfo && (
      <div>
        {/* doctor details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt=""
            />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg py-8 p-8 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/* doc info */}
            <p className="flex items-center gap-2 text-xl font-medium text-gray-900">
              {docInfo.name}{" "}
              <img className="w-5" src={assets.verified_icon} alt="" />{" "}
            </p>
            <div className="flex items-center gap-3 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.specializationName}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience}
              </button>
            </div>
            {/* Doctor about */}

            <div>
              <p className="flex items-center font-medium text-xs text-gray-900 mt-3 gap-1">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-3">
                {docInfo.doctorAbout}
              </p>
            </div>
            {/* <p>Appointment Fee: {docInfo.fee}</p> */}
          </div>
        </div>

        {/* booking slot */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking Slot</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots.map((item, index) => (
                <div
                  onClick={() => setSlotIndex(index)}
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex == index
                      ? "bg-primary text-white"
                      : "border border-gray-200"
                  }`}
                  key={index}
                >
                  <p>{item[0] && daysOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0] && item[0].datetime.getDate()}</p>
                </div>
              ))}
          </div>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    item.time == slotTime
                      ? "bg-primary text-white"
                      : "border border-gray-200 text-gray-400"
                  }`}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <button
            onClick={() => bookAppointment(user, selectedDoctor)}
            className="bg-primary text-white font-light px-14 py-3 text-sm rounded-full my-6"
          >
            Book an appointment
          </button>
        </div>
      </div>
    )
  );
};

export default Appointment;
