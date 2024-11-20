import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
const TopDoctors = () => {
  const navigate = useNavigate();
  const {doctors, getAllDoctors, getDoctorByEmail} = useContext(AppContext)
  const handleSelectedDoctor = async (email) => {
    await getDoctorByEmail(email); // Đảm bảo hoàn tất trước
    navigate(`/appointment/${email}`);
  };
  useEffect(() => {
    // Fetch lần đầu
    getAllDoctors();

    // Tạo interval để fetch định kỳ 
    const interval = setInterval(() => {
      getAllDoctors();
    }, 10000);

    // Cleanup khi component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array
  
  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {doctors.slice(0, 10).map((item, index) => {
          return (
            <div
              onClick={() => handleSelectedDoctor(item.email)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
              key={index}
            >
              <img className="bg-blue-50" src={item.doctorImg} alt="" />
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-center text-green-600">
                  <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                  <p>Available</p>
                </div>
                <p className="text-gray-900 text-lg font-medium">{item.doctorName}</p>
                <p className="text-gray-600 text-sm"> {item.specializationName} </p>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick = {() => {navigate('/doctors'); scrollTo(0,0)}} className="bg-blue-50 text-gray-600 text-sm rounded-full px-12 py-3 mt-10 font-medium">
        More
      </button>
    </div>
  );
};

export default TopDoctors;
