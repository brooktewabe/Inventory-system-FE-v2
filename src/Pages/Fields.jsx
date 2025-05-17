/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react"
import withAuth from "../withAuth"
import axios from "../axiosInterceptor"
import Swal from "sweetalert2"
import { toast } from "react-toastify"

const ManageOptions = () => {
  const [fieldName, setFieldName] = useState("")
  const [fieldType, setFieldType] = useState("")
  const [optionValues, setOptionValues] = useState([])
  const [newOption, setNewOption] = useState("")
  const [fields, setFields] = useState([])
  const [loading, setLoading] = useState(true)

  const role = localStorage.getItem("role")
  const name = localStorage.getItem("name")

  // Fetch initial options from backend
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await axios.get("http://localhost:5000/custom-product-columns/all")
        setFields(res.data)
        setLoading(false)
      } catch (error) {
        toast.error("Failed to fetch fields.")
        console.error("Fetch error:", error)
      }
    }
    fetchFields()
  }, [])

  // Add new field
  const handleAddOptionValue = () => {
    if (newOption.trim() && !optionValues.includes(newOption.trim())) {
      setOptionValues([...optionValues, newOption.trim()])
      setNewOption("")
    }
  }

  const handleDeleteOptionValue = (valueToDelete) => {
    setOptionValues(optionValues.filter((val) => val !== valueToDelete))
  }

  const handleAddField = async (e) => {
    e.preventDefault()
    if (!fieldName || !fieldType) {
      toast.error("Field name and type are required")
      return
    }

    // Validate options for option type
    if (fieldType === "options" && optionValues.length === 0) {
      toast.error("Please add at least one option value")
      return
    }

    try {
      // Create field data according to the expected structure
      const fieldData = {
        fieldName: fieldName,
        type: fieldType,
      }

      // Add options array if field type is options
      if (fieldType === "options") {
        fieldData.options = optionValues
      }

      // Send POST request to create the field
      const response = await axios.post("http://localhost:5000/custom-product-columns/create", fieldData)

      // Update the fields list with the new field
      setFields([...fields, response.data])

      // Reset form
      setFieldName("")
      setFieldType("")
      setOptionValues([])

      toast.success("Field added successfully")
    } catch (error) {
      toast.error("Failed to add field")
      console.error("Error adding field:", error)
    }
  }

  // Delete field
  const handleDeleteField = async (id) => {
    Swal.fire({
      text: "Are you sure you want to delete this field?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/custom-product-columns/${id}`)
          setFields(fields.filter((field) => field.id !== id))
          toast.success("Deleted successfully.")
        } catch (error) {
          toast.error("Failed to delete.")
        }
      }
    })
  }

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Top Header */}
          <div className="bg-white flex justify-between">
            <p className="text-xl font-bold">Settings</p>
            <div className="flex items-center bg-blue-500 text-white rounded-lg w-48 mr-2">
              <img src="src/assets/user.png" className="w-8 h-8 rounded-full object-cover mr-4" />
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs">{role}</p>
              </div>
            </div>
          </div>


          {/* Manage Options */}
          <h3 className="text-xl font-semibold mb-4 ml-4">Manage Options</h3>
          <div className="bg-white p-6 rounded-lg shadow-md w-[90%] mx-auto">
            <h2 className="text-md font-semibold mb-4">Manage Fields</h2>

            {/* Form */}
            <form onSubmit={handleAddField} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Enter Field</label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  placeholder="Enter field name"
                  className="w-full p-2 border rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  value={fieldType}
                  onChange={(e) => {
                    setFieldType(e.target.value)
                    setOptionValues([]) // Reset options if type changes
                  }}
                  className="w-full p-2 border rounded-md bg-gray-100"
                >
                  <option disabled value="">
                    Select Type
                  </option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="options">Options</option>
                </select>
              </div>

              {fieldType === "options" && (
                <div className="col-span-3">
                  <label className="block text-sm text-gray-600 mb-1">Add Options</label>
                  <div className="flex gap-2  w-1/3 mb-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder="e.g. S, M, L"
                      className="flex-1 p-2 border rounded-md bg-gray-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddOptionValue}
                      className="bg-green-600 text-white px-4 rounded-md hover:bg-green-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {optionValues.map((opt, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                        {opt}
                        <button
                          onClick={() => handleDeleteOptionValue(opt)}
                          className="ml-2 text-red-600 hover:text-red-800"
                          type="button"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <button type="submit" className="bg-blue-700 text-white py-2 px-6 rounded-md hover:bg-blue-800">
                  Add
                </button>
              </div>
            </form>


            {/* Display List */}
            <h3 className="text-md font-semibold mb-2">Custom Fields List</h3>
            <div className="space-y-2">
              {loading ? (
                <p>Loading...</p>
              ) : fields.length > 0 ? (
                fields.map((field, index) => (
                  <div key={field.id || index} className="flex justify-between items-center border-b pb-1">
                    <span className="text-gray-800">
                      {field.fieldName} - <span className="text-gray-500 text-sm">{field.type}</span>
                      {field.type === "options" && field.options && (
                        <span className="text-gray-500 text-sm ml-2">({field.options.join(", ")})</span>
                      )}
                    </span>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="text-black hover:text-red-600"
                      aria-label={`Delete ${field.fieldName}`}
                    >
                      🗑
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No fields found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { ManageOptions }
export default withAuth(ManageOptions)
