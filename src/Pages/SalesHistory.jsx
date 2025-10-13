import { useNavigate } from "react-router-dom"
import withAuth from "../withAuth"
import { TbReport } from "react-icons/tb"
import History from "../Components/History"

const SalesHistory = () => {
  const navigate = useNavigate()
  const role = localStorage.getItem("role")
  const name = localStorage.getItem("name")

  const handleGeneralMovement = () => {
    navigate(`/report`)
  }

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1">
        <div className="bg-white flex justify-between items-center mr-2">
            <p className="text-xl font-bold">Report</p>

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
          <div className="ml-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mr-2">
              <button
                onClick={handleGeneralMovement}
                className="flex items-center justify-start gap-3 p-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
              >
                <div className="bg-blue-600 text-white p-2 rounded-full">
                  <TbReport />
                </div>
                <span>General Report</span>
              </button>
            </div>
          </div>
          <History/>
        </div>
      </div>
    </section>
  )
}

export { SalesHistory }
export default withAuth(SalesHistory)