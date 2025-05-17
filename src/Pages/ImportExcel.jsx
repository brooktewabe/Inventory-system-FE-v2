import { useNavigate } from "react-router-dom";
import withAuth from "../withAuth";
import { FaInfoCircle } from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";
const Import = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
      <div className="grid grid-cols-1 gap-6">
          {/* Header with user info */}
          <div className="bg-white  flex justify-between">
            <p className="text-xl font-bold">Inventory Management System</p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48 mr-2">
              <img
                src="src\assets\user.png"
                className="w-8 h-8 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm mx-10">
      <div className="flex items-center mb-6 pb-2 border-b">
        <FaInfoCircle className="text-blue-600 mr-2" />
        <h2 className="font-medium">Upload Excel File</h2>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Upload File</h2>
        <label
          htmlFor="excelUpload"
          className="w-full h-48 border-2 border-dashed border-blue-400 bg-gray-50 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-blue-50"
        >
          <FiUploadCloud className="text-blue-500 text-3xl mb-2" />
          <span className="text-sm font-medium text-gray-600">Upload Excel File</span>
          <input
            type="file"
            id="excelUpload"
            accept=".xlsx, .xls"
            className="hidden"
          />
        </label>
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Upload File
        </button>
      </div>
    </div>
        </div>
      </div>
    </section>
  );
};

export { Import };
export default withAuth(Import);