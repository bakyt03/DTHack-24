import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { IconEdit, IconUserCircle } from "@tabler/icons-react";

export default function User() {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState(userData);
  const [search, setSearch] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEditClick = (index, value) => {
    setEditIndex(index);
    setEditValue(value);
  };

  const fetchUserData = async () => {
    console.log("Fetching user data");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_PATH}/users/user-data?id=${user.id}`
      );
      const data = await response.json();
      console.log(data);

      setUserData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const filtered = userData.filter((data) =>
      data.dataName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(filtered);
  }, [search, userData]);

  const handleSaveClick = async (id, value) => {
    console.log("Updating data:", id, value);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_PATH}/users/user-data?dataID=${id}&value=${value}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value }),
        }
      );

      if (response.ok) {
        fetchUserData(); // Fetch updated data
      } else {
        console.error("Failed to update data");
      }
    } catch (error) {
      console.error("Error updating data:", error);
    }
    setEditIndex(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure?")) {
      console.log("Deleting data:", id);

      fetch(`${process.env.REACT_APP_PATH}/users/user-data?dataID=${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            fetchUserData(); // Fetch updated data
          } else {
            console.error("Failed to delete data");
          }
        })
        .catch((error) => {
          console.error("Error deleting data:", error);
        });
    }
  };

  return (
    <div className="page">
      <div className="content">
        <div className="bg-terciary rounded-md w-[60%] mx-auto mt-6 px-16 py-3">
          <IconUserCircle
            className="mx-auto"
            size={200}
            strokeWidth={0.5}
            color="#e63a46"
          />
          <h1 className="text-3xl font-semibold text-center text-primary mb-8">
            {user.username}
          </h1>
          <div className="flex flex-col child:flex child:justify-between w-[70%] mx-auto">
            <p>
              <strong>First Name:</strong> {user.firstname}
            </p>
            <p>
              <strong>Last Name:</strong> {user.lastname}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
          <div className="flex mt-8 items-center justify-between p-4 border-b-2">
            <h2 className="text-lg">User Data</h2>
            <div>
              <input
                type="text"
                placeholder="Search"
                className="p-2 rounded-md bg-bg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          {filteredData.length > 0 ? (
            <table className="w-full">
              <tbody>
                {filteredData.map((data, i) => (
                  <tr key={data.id}>
                    <td className="text-left p-3 overflow-x-hidden text-ellipsis text-nowrap max-w-[15ch]">
                      {data.dataName.replaceAll("_", " ")}
                    </td>
                    <td className="text-left p-3 overflow-x-hidden text-ellipsis text-nowrap max-w-[15ch]">
                      {editIndex === i ? (
                        <input
                          type="text"
                          value={editValue}
                          className="px-2 rounded-md bg-bg"
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        data.dataValue
                      )}
                    </td>
                    <td className="text-left p-2">
                      <IconEdit
                        className="cursor-pointer"
                        onClick={() => handleEditClick(i, data.dataValue)}
                      />
                    </td>
                    <td className="text-right">
                      {editIndex === i ? (
                        <button
                          className="flex w-24 py-1 px-6 ml-3 bg-[#0ead69] rounded-xl justify-center"
                          onClick={() => handleSaveClick(data.id, editValue)}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          className="flex w-24 py-1 px-6 ml-3 bg-primary rounded-xl justify-center"
                          onClick={() => handleDelete(data.id)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No user data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
