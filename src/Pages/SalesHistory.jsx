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
          <div className="bg-white  flex justify-between">
            <p className="text-xl font-semibold mb-4">Report</p>
            <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-lg w-32 mr-2">
              <p className="font-semibold">{name}</p>
              <p className="text-xs">{role}</p>
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