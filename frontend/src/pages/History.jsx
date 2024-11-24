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
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  console.log(itemsPerPage);

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

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = documents.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(documents.length / itemsPerPage);

  return (
    <div className="page">
      <div className="content bg-terciary rounded-xl">
        <h1 className="mt-4 text-3xl font-bold text-center">User history</h1>

        <div className="mt-5 pb-5">
          <div className="flex justify-between px-6">
            <div className="flex items-center mb-5">
              <h3>Sort by:</h3>
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="mx-2 p-2 border rounded-xl bg-terciary"
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
                  className={`mx-2 p-2 border-2 rounded-xl border-primary ${
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
                className="p-2 rounded-md bg-bg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {paginatedDocuments.length > 0 ? (
            <table className="w-full">
              <thead className="border-t border-b">
                <tr className="child:py-4">
                  <th className="text-left pl-4">Date</th>
                  <th className="text-left">Document name</th>
                  <th className="text-left">Type</th>
                  <th className="text-left">Score</th>
                  <th className="text-right pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDocuments.map((document) => (
                  <tr key={document.id}>
                    <td className="p-2 pl-4">{document.date}</td>
                    <td className="p-2">{document.title}</td>
                    <td className="p-2">{document.type}</td>
                    <td className="p-2">90%</td>
                    <td className="p-2 pr-4">
                      <div className="flex items-center justify-end ">
                        <span className="">
                          <IconDownload className="mr-2" />
                        </span>
                        <button
                          className="flex p-2 ml-3 bg-primary rounded-xl"
                          onClick={() => handleDownload(document)}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No documents available.</p>
          )}

          <div className="flex justify-between mt-4 px-6 items-center">
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="mx-2 p-2 border rounded-xl bg-bg"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <div className="flex items-center">
              <div>
                <select
                  value={currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="mx-2 p-2 border rounded-xl bg-bg"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <span>of {totalPages} pages</span>
              </div>
              <div className="child:ml-6 child:text-2xl child:font-bold">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
