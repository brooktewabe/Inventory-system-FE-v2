import { useNavigate } from "react-router-dom";
import withAuth from "../withAuth";
import { FaInfoCircle } from "react-icons/fa";
import { BsListCheck } from "react-icons/bs";
import { RiFileExcel2Line } from "react-icons/ri";

const Choose = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleInput = () => {
    navigate("/add-store-product");
  };
  
  const handleUpload = () => {
    navigate("/import");
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

          {/* Add Product Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm max-w-3xl mx-auto">
            {/* Header with info icon */}
            <div className="flex items-center mb-6 pb-2 border-b">
              <FaInfoCircle className="text-blue-600 mr-2" />
              <h2 className="font-medium">Add Product </h2>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Choose option</h3>
            
            {/* Option Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fill Input Option */}
              <div 
                onClick={handleInput}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="text-blue-600 mb-2">
                  <BsListCheck size={24} />
                </div>
                <h4 className="font-medium mb-2">Fill Input</h4>
                <p className="text-sm text-gray-600">
                  Complete this form to submit product details, update inventory, and more. Ensure to check that all required fields are accurately filled to avoid errors in stock tracking, ordering, or reporting.
                </p>
              </div>
              
              {/* Import Excel Option */}
              <div 
                onClick={handleUpload}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
              >
                <div className="text-blue-600 mb-2">
                  <RiFileExcel2Line size={24} />
                </div>
                <h4 className="font-medium mb-2">Import Excel File</h4>
                <p className="text-sm text-gray-600">
                  Use this feature to bulk upload product or inventory data using a pre-defined Excel template. Please follows the required format, including columns like Product Name, Quantity, Unit Price, and Category.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Choose };
export default withAuth(Choose);