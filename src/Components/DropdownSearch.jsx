import { useEffect, useState, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "../axiosInterceptor";
import PropTypes from "prop-types";

const ItemSelector = ({ index, item, handleItemChange, getSelectedIds }) => {
  const [sale, setSale] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStock(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchStock = async (query = "") => {
    try {
      const response = await axios.get(
        `http://localhost:5000/stock/all/store?search=${query}`
      );
      setSale(response.data.data || []);
    } catch (error) {
      console.error("Error fetching stock:", error);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm mb-1">Item Name</label>
      <div
        className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-2 cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {item.itemName
          ? sale.find((s) => s.id === item.itemName)?.Name || "Select Item"
          : "Select Item"}
      </div>

      {isOpen && (
        <div className="absolute mt-1 z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="flex items-center px-2 py-1 border-b">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              className="w-full py-1 px-2 text-sm border-none focus:outline-none"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {sale.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-sm">No items found</div>
          ) : (
            sale.map((sl) => {
              const isDisabled =
                getSelectedIds().includes(sl.id.toString()) &&
                item.itemName !== sl.id.toString();

              return (
                <div
                  key={sl.id}
                  className={`px-4 py-2 hover:bg-gray-100 text-sm cursor-pointer ${
                    isDisabled ? "text-gray-400 cursor-not-allowed" : ""
                  }`}
                  onClick={() => {
                    if (!isDisabled) {
                      handleItemChange(index, {
                        target: { name: "itemName", value: sl.id },
                      });
                      setIsOpen(false);
                      setSearchTerm(""); // reset search after selection
                    }
                  }}
                >
                  {sl.Name} {isDisabled ? "(Already Selected)" : ""}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
ItemSelector.propTypes = {
  index: PropTypes.number.isRequired,
  item: PropTypes.shape({
    itemName: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  handleItemChange: PropTypes.func.isRequired,
  getSelectedIds: PropTypes.func.isRequired
};

export default ItemSelector;
