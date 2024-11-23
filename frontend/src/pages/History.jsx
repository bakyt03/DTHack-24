import {
  IconDownload,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useEffect, useState, useCallback } from "react";

export default function History() {
  const [allDocuments, setAllDocuments] = useState([
    {
      id: 1,
      title: "Document 1",
      date: "2024-10-01",
      type: "pdf",
    },
    {
      id: 2,
      title: "Document 2",
      date: "2023-10-02",
      type: "docx",
    },
    {
      id: 3,
      title: "Document 3",
      date: "2025-10-03",
      type: "pdf",
    },
    {
      id: 4,
      title: "Document 4",
      date: "2022-09-15",
      type: "xlsx",
    },
    {
      id: 5,
      title: "Document 5",
      date: "2021-08-20",
      type: "pptx",
    },
    {
      id: 6,
      title: "Document 6",
      date: "2020-07-25",
      type: "pdf",
    },
    {
      id: 7,
      title: "Document 7",
      date: "2019-06-30",
      type: "docx",
    },
    {
      id: 8,
      title: "Document 8",
      date: "2018-05-05",
      type: "xlsx",
    },
    {
      id: 9,
      title: "Document 9",
      date: "2017-04-10",
      type: "pptx",
    },
    {
      id: 10,
      title: "Document 10",
      date: "2016-03-15",
      type: "pdf",
    },
  ]);
  const [documents, setDocuments] = useState([]);
  const [sortOption, setSortOption] = useState("date");
  const [isAscending, setIsAscending] = useState(false);
  const [types, setTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const initialTypes = [...new Set(allDocuments.map((doc) => doc.type))];
    setTypes(initialTypes);
    setDocuments(
      [...allDocuments].sort((a, b) => new Date(b.date) - new Date(a.date))
    );
  }, [allDocuments]);

  const handleDownload = (document) => {
    console.log(document);
  };

  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);
    sortDocuments(option, isAscending);
  };

  const sortDocuments = useCallback(
    (option, ascending) => {
      const sorted = [...documents].sort((a, b) => {
        if (option === "date") {
          return ascending
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        } else if (option === "title") {
          return ascending
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
        return 0;
      });
      setDocuments(sorted);
    },
    [documents]
  );

  const toggleSortOrder = () => {
    const newOrder = !isAscending;
    setIsAscending(newOrder);
    sortDocuments(sortOption, newOrder);
  };

  const updateSelectedTypes = (type) => {
    setSelectedTypes((prevSelected) =>
      prevSelected.includes(type)
        ? prevSelected.filter((t) => t !== type)
        : [...prevSelected, type]
    );
  };

  useEffect(() => {
    const filtered = selectedTypes.length
      ? allDocuments.filter((doc) => selectedTypes.includes(doc.type))
      : allDocuments;

    const sorted = filtered.sort((a, b) => {
      if (sortOption === "date") {
        return isAscending
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortOption === "title") {
        return !isAscending
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });

    setDocuments(sorted);
  }, [allDocuments, selectedTypes, sortOption, isAscending]);

  useEffect(() => {
    const filtered = allDocuments.filter((doc) =>
      doc.title.toLowerCase().includes(search.toLowerCase())
    );
    setDocuments(filtered);
  }, [search, allDocuments]);
  return (
    <div className="page">
      <div className="content">
        <h1 className="mt-7 text-3xl font-bold text-center">History</h1>

        <div className="mt-5">
          <div className="flex justify-between">
            <div className="flex items-center mb-5">
              <h3>Sort by:</h3>
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="mx-2 p-2 border rounded-md bg-terciary"
              >
                <option value="date">Date</option>
                <option value="title">Title</option>
              </select>
              <div className="cursor-pointer" onClick={toggleSortOrder}>
                {isAscending ? <IconSortAscending /> : <IconSortDescending />}
              </div>
            </div>
            <div className="filters">
              {types.map((type) => (
                <button
                  key={type}
                  className={`mx-2 p-2 border-2 rounded-md border-primary ${
                    selectedTypes.includes(type) ? "bg-primary text-white" : ""
                  }`}
                  onClick={() => {
                    updateSelectedTypes(type);
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
            <div>
              <input
                type="text"
                placeholder="Search"
                className="p-2 border rounded-xl bg-terciary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {documents.map((document) => (
            <div
              key={document.id}
              className="border-2 border-primary mb-2 rounded-xl bg-secondary"
            >
              <div className="flex justify-between items-center py-3 px-2">
                <div className="flex child:mx-3">
                  <div>{document.title}</div>
                  <div>{document.date}</div>
                  <div>{document.type}</div>
                </div>
                <div className="flex child:mx-3 items-center">
                  View details
                  <button
                    className="flex p-2 bg-terciary rounded-md"
                    onClick={() => handleDownload(document)}
                  >
                    Download <IconDownload className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
