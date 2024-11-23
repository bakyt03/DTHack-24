import { useState, useRef } from 'react';
import { IconFileFilled, IconFile, IconFileSettings, IconFileSpark } from '@tabler/icons-react';

export default function Document() {

    const [pending, setPending] = useState(false);

    const targetInputRef = useRef(null);
    const rulesInputRef = useRef(null);

    const [resolved, setResolved] = useState(false);


    const [formData, setFormData] = useState({
        target: null,
        rules: null,
        docnName: ''
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: files ? files[0] : value
        }));

    };

    const handleSubmit = () => {
        setPending(true);
        let dataF = new FormData();
        dataF.append('document', formData.target);
        dataF.append('rules', formData.rules);
        dataF.append('docnName', formData.docnName);

        fetch(`${process.env.REACT_APP_PATH}/openapi/upload`, {
            method: 'POST',
            body: dataF,
            headers: {
                type: 'formData'
            }
        })
            .then((res) => res.json())
            .then((data) => console.log(data))
            .catch((err) => console.error(err))
            .finally(() => {
                setPending(false);
                setResolved(true);
            });
    };

    const handleFileChange = async (event, doc) => {
        setPending(true);
        const file = event.target.files[0];

        setFormData((prevData) => ({
            ...prevData,
            [doc === 1 ? 'target' : 'rules']: file
        }));


        setPending(false);

    };

    function openFileExplorer(val) {
        const InputRef = val === 1 ? targetInputRef : rulesInputRef;
        InputRef.current.value = "";
        InputRef.current.click();
    }


    return (
        <div className="page flex items-center">
            <div className='w-1/4 h-[90vh] '>
                <div className='bg-terciary mx-4 rounded-2xl  flex items-center h-[90vh] '>

                    <form onSubmit={handleSubmit} className='mx-auto flex flex-col justify-between  h-[85vh] py-8   w-[80%] ' >
                        <h1 className='text-2xl text-primary text-center'>New Report</h1>
                        <div className='flex flex-col mt-4'>
                            <label htmlFor="docnName" className='text-center text-lg font-semibold text-primary '>Document Name:</label>
                            <input className='bg-bg  rounded-md px-4 py-2 text-white' type="text" id="docnName" name="docnName" value={formData.docnName} onChange={handleChange} />
                        </div>
                        <div className='flex flex-col justify-center'>
                            <label className='text-center text-lg font-semibold text-primary' htmlFor="target">Target File</label>
                            <div className="bg-bg  font-bold cursor-pointer py-8 rounded-2xl flex flex-col justify-center items-center  " onClick={() => openFileExplorer(1)}>

                                {formData.target ? <IconFileFilled size={32} color='#e63a46' /> : <IconFile size={32} color='#e63a46' />}
                                {!!formData.target && <p className='text-primary text-sm text-center'>{formData.target.name}</p>}
                                {pending && <p className='text-primary text-sm'>Uploading...</p>}
                                <input
                                    type="file"
                                    ref={targetInputRef}
                                    onChange={e => handleFileChange(e, 1)}
                                    className='hidden'
                                />
                            </div>
                        </div>
                        <div className=' flex flex-col  justify-center'>
                            <label className='text-center text-lg font-semibold text-primary' htmlFor="rules">Rules File</label>
                            <div className="bg-bg  font-bold cursor-pointer py-8   rounded-2xl flex flex-col justify-center items-center  " onClick={() => openFileExplorer(2)}>

                                {formData.rules ? <IconFileFilled size={32} color='#e63a46' /> : <IconFile size={32} color='#e63a46' />}
                                {!!formData.rules && <p className='text-primary text-sm text-center'>{formData.rules.name}</p>}
                                {pending && <p className='text-primary text-sm'>Uploading...</p>}
                                <input
                                    type="file"
                                    ref={rulesInputRef}
                                    onChange={e => handleFileChange(e, 2)}
                                    className='hidden'
                                />
                            </div>
                        </div>



                        <div className='w-full   flex justify-center items-center'>
                            <div className={`btn mx-auto text-xl ${pending ? " cursor-not-allowed " : " cursor-pointer "}`} onClick={handleSubmit}>{pending ? "Uploading..." : "Submit"}</div>
                        </div>

                    </form>
                </div>

            </div>
            <div className='w-3/4 h-[90vh]'>
                <div className='bg-terciary mx-4 rounded-2xl p-16 h-[90vh]'>
                    <div className='flex justify-center items-center w-full h-full'>
                        {!pending && <h1 className='text-primary text-3xl'>Submit files to create new report</h1>}
                        {pending && <h1 className='text-primary text-3xl'>Generating...</h1>}
                    </div>

                </div>

            </div>


        </div>
    );
}