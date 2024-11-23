import { useState } from "react";

export default function History() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      title: "Document 1",
      date: "2021-10-01",
    },
    {
      id: 2,
      title: "Document 2",
      date: "2021-10-02",
    },
    {
      id: 3,
      title: "Document 3",
      date: "2021-10-03",
    },
  ]);

  return (
    <div>
      <div className="ml-14">
        <div className="mt-7 text-3xl font-bold">History</div>
        <div className="mt-3"></div>
        See all document you have ever submitted in one place
      </div>

      <div className="mt-5 w-[70%] mx-auto">
        {documents.map((document) => (
          <div
            key={document.id}
            className="border-4 border-gray-200 mb-2 rounded-xl"
          >
            <div className="flex justify-between items-center py-3 px-3">
              <div className="flex *:mr-7">
                <div>{document.title}</div>
                <div>{document.date}</div>
              </div>
              <button className="block py-2 bg-gray-200">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
