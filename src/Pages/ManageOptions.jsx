import { useState, useEffect } from "react";
import withAuth from "../withAuth";
import axios from "../axiosInterceptor";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const ManageOptions = () => {
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const [fields, setFields] = useState([]);
  const [newOption, setNewOption] = useState("");
  const [selectedField, setSelectedField] = useState(null);

  const fetchFields = async () => {
    try {
      const res = await axios.get("http://apiv2.cnhtc4.com/custom-product-columns/all");
      const optionsOnly = res.data.filter((f) => f.type === "options");
      setFields(optionsOnly);
      if (selectedField) {
        const updated = optionsOnly.find(f => f.id === selectedField.id);
        if (updated) setSelectedField(updated);
      }
    } catch (err) {
      toast.error("Failed to fetch fields.");
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleAddOption = async () => {
    if (!selectedField || !newOption.trim()) {
      toast.error("Select a field and enter a value.");
      return;
    }

    const currentOptions = selectedField.options || [];
    if (currentOptions.includes(newOption.trim())) {
      toast.warning("Option already exists.");
      return;
    }

    const updatedOptions = [...currentOptions, newOption.trim()];

    try {
      await axios.patch(
        `http://apiv2.cnhtc4.com/custom-product-columns/${selectedField.id}`,
        { options: updatedOptions }
      );
      toast.success("Option added successfully.");
      setNewOption("");
      fetchFields(); // re-fetch and rerender
    } catch (error) {
      toast.error("Failed to update options.");
    }
  };

  const handleDeleteOption = async (optionToDelete) => {
    Swal.fire({
      title: "Delete Option?",
      text: `Are you sure you want to delete "${optionToDelete}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updatedOptions = selectedField.options.filter(opt => opt !== optionToDelete);
          await axios.patch(
            `http://apiv2.cnhtc4.com/custom-product-columns/${selectedField.id}`,
            { options: updatedOptions }
          );
          toast.success("Option deleted.");
          fetchFields(); // Refresh after deletion
        } catch (error) {
          toast.error("Failed to delete option.");
        }
      }
    });
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      <div className="container m-auto">
        <div className="grid grid-cols-1 gap-6">
        <div className="bg-white flex justify-between items-center mr-2 p-1">
            <p className="text-xl font-bold ml-3">Settings</p>

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

          <h3 className="text-xl font-semibold mb-4 ml-4">Manage Options</h3>
          <div className="bg-white p-6 rounded-lg shadow-md w-[90%] mx-auto">
            <div className="mb-6">
              <label className="block mb-1 text-sm">Choose a Field</label>
              <select
                value={selectedField?.id || ""}
                onChange={(e) =>
                  setSelectedField(fields.find((f) => f.id === e.target.value))
                }
                className="w-full p-2 border rounded-md bg-gray-100"
              >
                <option disabled value="">Select Field</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.fieldName}
                  </option>
                ))}
              </select>
            </div>

            {selectedField && (
              <>
                <div className="mb-4">
                  <label className="block mb-1 text-sm">Add New Option</label>
                  <input
                    type="text"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    className="w-full p-2 border rounded-md bg-gray-100"
                    placeholder="Enter new option"
                  />
                  <button
                    onClick={handleAddOption}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Option
                  </button>
                </div>

                <h4 className="text-md font-semibold mb-2">Current Options:</h4>
                <ul className="space-y-2 text-gray-700">
                  {selectedField.options?.length ? (
                    selectedField.options.map((opt, idx) => (
                      <li
                        key={idx}
                        className="flex justify-between items-center border-b pb-1"
                      >
                        <span>{opt}</span>
                        <button
                          onClick={() => handleDeleteOption(opt)}
                          className="text-red-500 hover:text-red-700"
                        >
                          🗑️
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No options yet.</li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export { ManageOptions };
export default withAuth(ManageOptions);
