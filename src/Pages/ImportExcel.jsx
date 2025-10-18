import { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { FiUploadCloud } from "react-icons/fi";
import withAuth from "../withAuth";
import axios from "../axiosInterceptor";
import Swal from "sweetalert2";

const Import = () => {
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      Swal.fire("Error", "Please select a file before uploading.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:5000/stock/import-excel", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Success", "File uploaded successfully!", "success");
      setFile(null);
      document.getElementById("excelUpload").value = "";
    } catch (error) {
      const serverMessage = "Upload failed.";
      const serverErrors = error.response?.data?.errors || [];

      Swal.fire({
        title: "Upload Failed",
        html: `
        <p class="mb-2 font-medium">${serverMessage}</p>
        <ul class="text-left text-sm text-red-600 pl-5 list-disc">
          ${serverErrors.map((err) => `<li>${err}</li>`).join("")}
        </ul>
      `,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Header with user info */}
        <div className="bg-white flex justify-between items-center mr-2 p-1">
          <p className="text-lg sm:text-xl font-bold whitespace-nowrap flex items-center ml-3 mt-[1px]">
              <span className="sm:hidden">Inventory</span>
              <span className="hidden sm:inline">Inventory Management System</span>
            </p>

          <div className="flex items-center bg-blue-600 text-white rounded-lg px-3 py-1 space-x-2 cursor-pointer">
            {/* Circle with initial */}
            <div className="bg-white text-blue-600 font-semibold w-6 h-6 flex items-center justify-center rounded-full text-sm">
              {name?.charAt(0)?.toUpperCase() || "?"}
            </div>

            {/* Name and role */}
            <div className="flex flex-col text-left leading-tight">
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-blue-100">{role}</p>
            </div>

            {/* Dropdown arrow */}
            <svg
              className="w-4 h-4 text-blue-100 ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
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
                <span className="text-sm font-medium text-gray-600">
                  Upload Excel File
                </span>
                <input
                  type="file"
                  id="excelUpload"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {file && (
                <p className="text-sm text-center mt-2 text-gray-600">
                  Selected file: <strong>{file.name}</strong>
                </p>
              )}
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmit}
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
