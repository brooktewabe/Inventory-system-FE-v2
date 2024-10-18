import { useState, useEffect } from "react";
import axios from "../axiosInterceptor";
import withAuth from "../withAuth";
import UnauthorizedAccess from "../Components/UnauthorizedAccess";
import { FaSearch } from "react-icons/fa";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const currentRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `https://api.akbsproduction.com/notification/all`
        );
        setNotifications(response.data);

        // Get the date range
        const currentDate = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Set the date range in state
        setDateRange({
          start: thirtyDaysAgo,
          end: currentDate,
        });

        // Filter notifications for the past 30 days
        const recentNotifications = response.data
          .filter(
            (notification) => new Date(notification.createdAt) >= thirtyDaysAgo
          )
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .reverse(); // Sort by createdAt descending;

        setFilteredNotifications(recentNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [searchTerm]);

  useEffect(() => {
    let updatedNotifications = filteredNotifications;

    if (searchTerm) {
      updatedNotifications = updatedNotifications.filter((notification) =>
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(updatedNotifications);
  }, [searchTerm, filteredNotifications]);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="bg-[#edf0f0b9] min-h-screen">
      {currentRole === "admin" ? (
        <div className="container m-auto">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white p-4">
              <h3 className="text-xl font-bold">Notification</h3>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md ml-6 min-w-fit">
              {/* Display Date Range */}
              {dateRange.start && dateRange.end && (
                <p className="text-sm text-gray-600">
                  Showing notifications from {formatDate(dateRange.start)} to{" "}
                  {formatDate(dateRange.end)}
                </p>
              )}
              <div className="flex justify-between items-center mb-6">
                <div className="flex justify-end items-center space-x-4 w-full">
                  <button
                    onClick={() => setSearchVisible(!searchVisible)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <FaSearch size={20} />
                  </button>
                </div>
              </div>

              {searchVisible && (
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full mb-4 p-2 border border-gray-300 rounded"
                />
              )}

              <table className="min-w-full bg-white">
                <tbody>
                  {filteredNotifications &&
                    [...filteredNotifications]
                      .reverse()
                      .map((notification, index) => (
                        <tr key={notification.id}>
                          <td className="py-2 px-4 border-b">{index + 1}</td>
                          <td className="py-2 px-4 border-b">
                            {notification.message}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {new Date(notification.createdAt).toLocaleString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <UnauthorizedAccess />
      )}
    </section>
  );
};

export { Notification };
export default withAuth(Notification);
