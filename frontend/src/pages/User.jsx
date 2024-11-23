import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { IconEdit } from "@tabler/icons-react";

export default function User() {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (user) {
      const userArray = Object.entries(user).map(([key, value]) => ({
        key,
        value,
      }));
      setUserData(userArray);
    }
  }, [user]);

  const handleEditClick = (index, value) => {
    setEditIndex(index);
    setEditValue(value);
  };

  const handleSaveClick = (index) => {
    const updatedUserData = [...userData];
    updatedUserData[index].value = editValue;
    setUserData(updatedUserData);
    setEditIndex(null);
  };

  const handleInputChange = (e) => {
    setEditValue(e.target.value);
  };

  return (
    <div>
      <h1 className="mt-7 text-3xl font-bold mx-auto text-center w-fit">
        {user.username}
      </h1>

      <div className="mt-12  w-[70%] mx-auto">
        {userData.map((attribute, index) => (
          <div key={attribute.key} className="mb-2">
            <strong>{attribute.key}:</strong>
            {editIndex === index ? (
              <span>
                <input
                  type="text"
                  value={editValue}
                  onChange={handleInputChange}
                  className="ml-2 p-1 border rounded"
                />
                <button
                  onClick={() => handleSaveClick(index)}
                  className="ml-2 p-1 border rounded bg-primary text-white"
                >
                  Save
                </button>
              </span>
            ) : (
              <span>
                {attribute.value}
                <IconEdit
                  onClick={() => handleEditClick(index, attribute.value)}
                  className="inline-block ml-2 cursor-pointer"
                >
                  Edit
                </IconEdit>
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
