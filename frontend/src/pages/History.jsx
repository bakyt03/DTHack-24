import {
  IconDownload,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function History() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Document 1",
      date: "2024-10-01",
    },
    {
      id: 2,
      title: "Document 2",
      date: "2023-10-02",
    },
    {
      id: 3,
      title: "Document 3",
      date: "2025-10-03",
    },
  ]);
  const [sortOption, setSortOption] = useState("date");
  const [isAscending, setIsAscending] = useState(false);

  const handleDownload = (document) => {
    console.log(document);
  };

  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);

    const sortedDocuments = [...documents].sort((a, b) => {
      if (option === "date") {
        return new Date(a.date) - new Date(b.date);
      } else if (option === "title") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    setDocuments(sortedDocuments);
  };

  useEffect(() => {
    const sortedDocuments = [...documents].sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    setDocuments(sortedDocuments);
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="mt-7 text-3xl font-bold mx-auto text-center w-fit">
        History
      </div>

      <div className="mt-5 w-[70%] mx-auto">
        <div className="flex items-center mb-5">
          <h3>Sort by:</h3>
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="mx-2 p-2 border rounded-md"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
          <div>
            {!isAscending ? <IconSortDescending /> : <IconSortAscending />}
          </div>
        </div>

        {documents.map((document) => (
          <div
            key={document.id}
            className="border-4 border-gray-200 mb-2 rounded-xl"
          >
            <div className="flex justify-between items-center py-3 px-3">
              <div className="flex *:mx-3">
                <div>{document.title}</div>
                <div>{document.date}</div>
              </div>
              <button
                className="flex p-2 bg-gray-200 rounded-md"
                onClick={() => handleDownload(document)}
              >
                Download <IconDownload className="ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
