import { useEffect, useState } from "react";
import { useAuthContext } from "../hooks/useAuthContext";
import { IconUserCircle } from "@tabler/icons-react";

export default function User() {
  const { user } = useAuthContext();
  const [userData, setUserData] = useState([]);
  //   const [editIndex, setEditIndex] = useState(null);
  //   const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (user) {
      const userArray = Object.entries(user).map(([key, value]) => ({
        key,
        value,
      }));
      setUserData(userArray);
    }
  }, [user]);

  //   const handleEditClick = (index, value) => {
  //     setEditIndex(index);
  //     setEditValue(value);
  //   };

  //   const handleSaveClick = (index) => {
  //     const updatedUserData = [...userData];
  //     updatedUserData[index].value = editValue;
  //     setUserData(updatedUserData);
  //     setEditIndex(null);
  //   };

  //   const handleInputChange = (e) => {
  //     setEditValue(e.target.value);
  //   };

  return (
    <div className="page">
      <div className="content">
        <div className="border-2 border-primary rounded-md w-[50%] mx-auto mt-6 px-16 pt-4 pb-10">
          <IconUserCircle className="mx-auto" size={200} strokeWidth={1} />
          <h1 className="text-3xl font-semibold text-center">
            {user.username}
          </h1>
          <div className="flex flex-col child:flex child:justify-between">
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
        </div>
      </div>
    </div>
  );
}
