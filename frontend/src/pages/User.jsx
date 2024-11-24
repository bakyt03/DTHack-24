import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { IconEdit, IconUserCircle } from "@tabler/icons-react";

export default function User() {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState([
    {
      id: 1,
      title: "Address",
      value: "address",
    },
    {
      id: 2,
      title: "IČO",
      value: "189374981",
    },
    {
      id: 3,
      title: "Birth Number",
      value: "123456789",
    },
    {
      id: 4,
      title: "Phone Number",
      value: "0301020/1234",
    },
    {
      id: 5,
      title: "Bank Account",
      value: "019275019275019275019275",
    },
    {
      id: 6,
      title: "Tax ID",
      value: "019284",
    },
    {
      id: 7,
      title: "VAT ID",
      value: "019284",
    },
    {
      id: 8,
      title: "Company ID",
      value: "391",
    },
    {
      id: 9,
      title: "Company Name",
      value: "Company s.r.o.",
    },
  ]);
  const [filteredData, setFilteredData] = useState(userData);
  const [search, setSearch] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleEditClick = (index, value) => {
    setEditIndex(index);
    setEditValue(value);
  };

  useEffect(() => {
    const filtered = userData.filter((data) =>
      data.title.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredData(filtered);
  }, [search, userData]);

  const handleSaveClick = (index) => {
    const updatedUserData = [...userData];
    updatedUserData[index].value = editValue;
    setUserData(updatedUserData);
    setEditIndex(null);
  };

  const handleDelete = (data) => {
    const updatedUserData = userData.filter((d) => d.id !== data.id);
    setUserData(updatedUserData);
  };

  return (
    <div className="page">
      <div className="content">
        <div className="bg-terciary rounded-md w-[60%] mx-auto mt-6 px-16 pt-4 pb-10">
          <IconUserCircle className="mx-auto" size={200} strokeWidth={1} />
          <h1 className="text-3xl font-semibold text-center">
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
                    <td className="text-left p-3">{data.title}</td>
                    <td className="text-left p-3 overflow-x-hidden text-ellipsis max-w-[15ch]">
                      {editIndex === i ? (
                        <input
                          type="text"
                          value={editValue}
                          className="px-2 rounded-md bg-bg"
                          onChange={(e) => setEditValue(e.target.value)}
                        />
                      ) : (
                        data.value
                      )}
                    </td>
                    <td className="text-left p-2">
                      <IconEdit
                        className="cursor-pointer"
                        onClick={() => handleEditClick(i, data.value)}
                      />
                    </td>
                    <td className="text-right child:w-16">
                      {editIndex === i ? (
                        <button
                          className="flex py-[6px] px-2 ml-3 bg-[#0ead69] rounded-xl justify-center"
                          onClick={() => handleSaveClick(i)}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          className="flex py-[6px] px-2 ml-3 bg-primary rounded-xl justify-center"
                          onClick={() => handleDelete(data)}
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
