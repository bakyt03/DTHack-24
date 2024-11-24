import { useState, useRef, useEffect } from 'react';
import { IconFileFilled, IconFile, IconFileSettings, IconFileSpark, IconCheck, IconX, IconUpload, IconReload } from '@tabler/icons-react';
import { useAuthContext } from '../hooks/useAuthContext';
import { data } from 'react-router-dom';

export default function Document() {

    const { user } = useAuthContext();

    const [pending, setPending] = useState(false);
    const targetInputRef = useRef(null);
    const rulesInputRef = useRef(null);
    const referenceInputRef = useRef(null);

    const [resolved, setResolved] = useState(false);


    const [response, setResponse] = useState(null);
    const [correctness, setCorrectness] = useState(0);
    const [mistakeCount, setMistakeCount] = useState(0);
    const [notSureReplying, setNotSureReplying] = useState("");
    const [notSureReplyingIndex, setNotSureReplyingIndex] = useState(null);

    const [formData, setFormData] = useState({
        target: null,
        rules: null,
        reference: null,
        docnName: ''
    });

    // {
    //     completeness: "100%",
    //         documentName: "Document 1",
    //             documentType: "pdf",
    //                 primaryCorrect: 85,
    //                     secondaryCorrect: null,
    //                         assistantId: "1",
    //                             mistakes: [
    //                                 "Field 'name' is mandatory and cannot be empty",
    //                                 "Field 'rodne cislo' cannot contain letters",
    //                                 "Field 'rodne cislo' must be 10 characters long",
    //                             ],
    //                                 notSureAbout: [
    //                                     "i think value in Field 'surname' is too short ",
    //                                     'i think the date field should be filled'
    //                                 ],
    // }

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
        dataF.append('instructions', formData.rules);
        dataF.append('documentName', formData.docnName);
        dataF.append('reference', formData.reference);

        fetch(`${process.env.REACT_APP_PATH}/openapi/upload?documentName=${formData.docnName}&userID=${user.id}`, {
            method: 'POST',
            body: dataF,
            headers: {
                type: 'formData'
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);

                let parsedData = data.response;
                parsedData['assistantId'] = data.assistantId;
                parsedData['primaryCorrect'] = parseInt(parsedData.completeness.match(/\d+/)[0], 10);
                const secondaryMatch = parsedData.completeness.match(/\d+/g);
                parsedData['secondaryCorrect'] = secondaryMatch.length > 1 ? parseInt(secondaryMatch[1], 10) : null;
                console.log(parsedData);
                setCorrectness(parsedData.primaryCorrect);
                setMistakeCount(parsedData.mistakes.length);
                parsedData.notSureAbout.push('i think the date field should be filled');

                setResponse(parsedData);
                setFixedMistakes([]);
                if (parsedData.error) {
                    alert(parsedData.errorResponse);
                    window.location.reload();
                }
            })
            .catch((err) => {

                console.error(err)
            })
            .finally(() => {
                setPending(false);
                setResolved(true);
            });
        console.log(response);

        fetchUserData();
    };

    const [question, setQuestion] = useState('');


    const askQuestion = () => {
        setPending(true);
        let dataF = new FormData();
        dataF.append('document', formData.target);
        dataF.append('instructions', formData.rules);
        dataF.append('reference', formData.reference);
        dataF.append('documentName', formData.docnName);
        if (question.length > 5) {
            if (notSureReplying) {
                setNotSureReplying("");
                setNotSureReplyingIndex(null);
            }
            fetch(`${process.env.REACT_APP_PATH}/openapi/ask-question?assistantID=${response.assistantId}&userPrompt=${question}&userID=${user.id}`, {
                method: 'POST',
                body: dataF,
                headers: {
                    type: 'formData'
                }
            })
                .then(res => res.json())
                .then(data => {

                    let parsedData = data.response;
                    parsedData['assistantId'] = data.assistantId;
                    parsedData['primaryCorrect'] = parseInt(parsedData.completeness.match(/\d+/)[0], 10);
                    const secondaryMatch = parsedData.completeness.match(/\d+/g);
                    parsedData['secondaryCorrect'] = secondaryMatch.length > 1 ? parseInt(secondaryMatch[1], 10) : null;
                    console.log(parsedData);
                    setCorrectness(parsedData.primaryCorrect);
                    setMistakeCount(parsedData.mistakes.length);
                    setResponse(parsedData);
                    setFixedMistakes([]);
                    if (parsedData.error) {
                        alert(parsedData.errorResponse);
                        window.location.reload();
                    }
                })
                .catch(err => {
                    console.error(err);
                }).finally(() => {
                    setPending(false);
                    setQuestion('');
                });
        } else {
            alert('Question too short')
        }
    }

    const [userData, setUserData] = useState(null);

    const fetchUserData = async () => {
        try {
            const response = await fetch(
                `${process.env.REACT_APP_PATH}/users/user-data?id=${user.id}`
            );
            const data = await response.json();
            console.log(data);

            setUserData(data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };



    const handleFileChange = async (event, doc) => {
        setPending(true);
        const file = event.target.files[0];

        setFormData((prevData) => ({
            ...prevData,
            [doc === 1 ? 'target' : doc === 2 ? 'rules' : 'reference']: file
        }));


        setPending(false);

    };

    function openFileExplorer(val) {
        const InputRef = val === 1 ? targetInputRef : val === 2 ? rulesInputRef : referenceInputRef;
        InputRef.current.value = "";
        InputRef.current.click();
    }

    const [fixedMistakes, setFixedMistakes] = useState([]);
    const [fixedUnsure, setFixedUnsure] = useState([]);



    const addToFixedMistake = (index) => {
        setFixedMistakes([...fixedMistakes, index]);
    }


    const removeFromFixedMistake = (index) => {
        setFixedMistakes(fixedMistakes.filter(i => i !== index));
    }






    useEffect(() => {
        if (fixedMistakes.length === 0) {
            setCorrectness(response?.primaryCorrect);
        } else {
            let temp = (100 - response?.primaryCorrect) / mistakeCount;
            let temp2 = response?.primaryCorrect + fixedMistakes.length * temp
            if (temp2 > 100) {
                setCorrectness(100);
            }
            setCorrectness(Math.round(temp2));
        }


        // eslint-disable-next-line
    }, [fixedMistakes]);

    const [dots, setDots] = useState('...');
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(dots => {
                if (dots.length > 2) {
                    return '.';
                } else {
                    return dots + '.';
                }
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="page flex items-center !bg-terciary">
            <div className='w-1/4 min-h-[90vh] border-r border-white '>
                <div className='bg-terciary mx-4 rounded-md   py-8 items-center min-h-[90vh] '>
                    {!resolved && <h1 className='text-2xl text-primary text-center'>New Report</h1>}
                    {(resolved && !pending) && <h1 className='text-2xl text-primary text-center'>{response?.documentName}</h1>}
                    <div className='h-full flex flex-col justify-center '>
                        <form onSubmit={handleSubmit} className='grow mx-auto w-[80%] mt-4' >

                            {!resolved && <div className='flex flex-col my-4 '>
                                <label htmlFor="docnName" className='text-center text-lg  mb-1'>Document Name</label>
                                <input className='bg-bg  rounded-md px-4 py-2 text-white' type="text" id="docnName" name="docnName" value={formData.docnName} onChange={handleChange} />
                            </div>}
                            <div className='flex flex-col justify-center my-4'>
                                <label className='text-center text-lg  mb-1' htmlFor="target">Target File</label>

                                <div className="bg-bg   cursor-pointer py-4 rounded-md flex flex-col justify-center items-center  " onClick={() => openFileExplorer(1)}>

                                    {formData.target ? <IconFileFilled size={32} color='#fff' /> : <IconUpload size={32} color='#fff' />}
                                    {!!formData.target && <p className=' text-sm text-center'>{formData.target.name}</p>}
                                    {pending && <p className=' text-sm'>Uploading...</p>}
                                    <input
                                        type="file"
                                        ref={targetInputRef}
                                        onChange={e => handleFileChange(e, 1)}
                                        className='hidden'
                                    />
                                </div>
                                {resolved && <div onClick={() => openFileExplorer(1)} className='cursor-pointer h-full flex justify-center items-center py-2  rounded-md mt-2 text-sm  bg-primary right-0'><IconReload color='#fff' /></div>}

                            </div>
                            <div className=' flex flex-col  justify-center my-4'>
                                <label className='text-center text-lg  mb-1' htmlFor="rules">Rules File</label>
                                <div className="bg-bg relative  font-bold cursor-pointer py-4   rounded-md flex flex-col justify-center items-center  " onClick={() => openFileExplorer(2)}>

                                    {formData.rules ? <IconFileFilled size={32} color='#fff' /> : <IconUpload size={32} color='#fff' />}
                                    {!!formData.rules && <p className=' text-sm text-center'>{formData.rules.name}</p>}
                                    {pending && <p className=' text-sm'>Uploading...</p>}

                                    <input
                                        type="file"
                                        ref={rulesInputRef}
                                        onChange={e => handleFileChange(e, 2)}
                                        className='hidden'
                                    />

                                </div>
                                {resolved && <div onClick={() => openFileExplorer(2)} className='cursor-pointer h-full flex justify-center items-center py-2  rounded-md mt-2 text-sm  bg-primary right-0'><IconReload color='#fff' /></div>}

                            </div>
                            <div className=' flex flex-col  justify-center my-4'>
                                <label className='text-center text-lg  mb-1' htmlFor="rules">Reference File</label>
                                <div className="bg-bg relative  font-bold cursor-pointer py-4   rounded-md flex flex-col justify-center items-center  " onClick={() => openFileExplorer(3)}>

                                    {formData.reference ? <IconFileFilled size={32} color='#fff' /> : <IconUpload size={32} color='#fff' />}
                                    {!!formData.reference && <p className=' text-sm text-center'>{formData.reference.name}</p>}
                                    {pending && <p className=' text-sm'>Uploading...</p>}

                                    <input
                                        type="file"
                                        ref={referenceInputRef}
                                        onChange={e => handleFileChange(e, 3)}
                                        className='hidden'
                                    />

                                </div>
                                {resolved && <div onClick={() => openFileExplorer(3)} className='cursor-pointer h-full flex justify-center items-center py-2  rounded-md mt-2 text-sm  bg-primary right-0'><IconReload color='#fff' /></div>}

                            </div>

                            {!resolved && <div className='w-full   flex justify-center items-center mt-8'>
                                <div className={`btn w-full  text-center text-xl ${pending ? " cursor-not-allowed " : " cursor-pointer "}`} onClick={handleSubmit}>{pending ? "Uploading..." : "Submit"}</div>
                            </div>
                            }
                        </form>
                        {!!resolved && <div className='w-[80%] mx-auto h-max cursor-pointer mb-12  text-xl text-center py-2  rounded-md mt-2   bg-primary right-0' onClick={() => window.location.reload()}>New conversation</div>
                        }
                    </div>


                </div>

            </div >
            <div className='w-3/4 min-h-[90vh]'>
                <div className='bg-terciary mx-4 rounded-md p-8 min-h-[90vh]'>
                    {!resolved && <div className='flex justify-center items-center w-full h-full'>
                        {!pending && <h1 className='text-primary text-3xl'>Submit files to create new report</h1>}
                        {pending && <h1 className='text-primary text-3xl'>Generating{dots}</h1>}
                    </div>}
                    {(resolved && response) && <div className='flex flex-col justify-center  h-full w-full'>
                        <div>
                            <h1 className='text-primary text-center text-3xl'>Report Generated</h1>
                            <div className='flex flex-col justify-center items-center mt-8'>
                                <CircularProgress value={correctness} />
                                <span>Document score</span>
                            </div>
                        </div>
                        <div className='flex grow justify-between mt-8'>
                            {response.mistakes.length > 0 && <div className={`${response.notSureAbout.length > 0 ? " w-[48%] mr-4 " : "  w-[98%] mx-2"} `}>
                                <h2 className='  py-2 mb-2 border-b border-white text-lg'>Mistakes Found</h2>
                                <div>
                                    {response.mistakes.map((mistake, index) => (
                                        <div key={index} className='flex justify-between items-center pb-3'>
                                            <div className='flex items-center'>
                                                <span className='size-3 bg-primary rounded-full mr-4 '></span>
                                                <p>
                                                    {
                                                        Object.keys(mistake).map((key, i) => (
                                                            <div className={` ${fixedMistakes.includes(index) ? " child:line-through " : ""} `} key={i}>
                                                                <span>{key.replaceAll("_", " ")}: {mistake[key]}</span>
                                                                <br />

                                                                {
                                                                    userData?.filter(user => user.dataName === key).map((user, index) => (
                                                                        <div>
                                                                            <span className={` text-primary`}>Suggestion:</span>
                                                                            <span className='ml-1 bg-bg p-1 rounded-md cursor-pointer hover:bg-[#353535]' title='Copy' onClick={() => { navigator.clipboard.writeText(user.dataValue) }}>{user.dataValue}</span>

                                                                        </div>
                                                                    ))
                                                                }
                                                                {response.recommendations.filter(suggestion => !!suggestion[key]).map((suggestion, index) => (
                                                                    <span>
                                                                        {
                                                                            userData?.filter(user => user.dataName === key).length === 0 &&
                                                                            <div>
                                                                                <span className={` text-primary`}>Suggestion:</span>
                                                                                <span className={`" ml-1 ${suggestion[key].length < 20 ? " bg-bg p-1 rounded-md cursor-pointer hover:bg-[#353535] " : " "}`} title='Copy' onClick={() => { navigator.clipboard.writeText(user.dataValue) }}>{suggestion[key]}</span>

                                                                            </div>
                                                                        }
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ))
                                                    }
                                                </p>
                                            </div>

                                            {fixedMistakes.filter(e => e === index).length < 1 && <div onClick={() => addToFixedMistake(index)} className='btn text-nowrap '>I Fixed</div>}
                                            {fixedMistakes.filter(e => e === index).length > 0 && <div onClick={() => removeFromFixedMistake(index)} className='btn '>Cancel</div>}
                                        </div>
                                    ))}
                                </div>
                            </div>}
                            {response.notSureAbout.length > 0 && <div className={`${response.mistakes.length > 0 ? " w-[48%] mr-4 " : "  w-[98%] mx-2"} `}>
                                <h2 className='py-2 mb-2 border-b border-white text-lg '>Unsure About</h2>
                                <div>
                                    {response.notSureAbout.map((mistake, index) => (
                                        <div key={index} className='flex items-center justify-between '>
                                            <span className='size-3 bg-gray-500 rounded-full mr-4 shadow-md shadow-gray-500'></span>
                                            <p>{mistake}</p>
                                            <div className='py-1 px-4 bg-primary rounded-md cursor-pointer' onClick={() => { setNotSureReplying(mistake); setNotSureReplyingIndex(index) }}>Reply</div>
                                        </div>
                                    ))}
                                </div>
                            </div>}
                        </div>
                        {notSureReplying && (
                            <div className='flex items-center'>
                                <span className="text-white bg-primary max-w-50 text-nowrap text-ellipsis overflow-x-hidden rounded-t-xl py-1 px-4">Replying to: unsure about [{notSureReplyingIndex + 1}] <span className='cursor-pointer ml-4' onClick={() => { setNotSureReplying(""); setNotSureReplyingIndex(null) }}>x</span></span>

                            </div>
                        )}
                        <div className='w-full flex items-center'>

                            <input value={question} onChange={e => setQuestion(e.target.value)} type="text" className={`bg-bg py-2 w-full rounded-md ${notSureReplyingIndex !== null ? " rounded-tl-none  border-t-2 border-primary " : ""}`} placeholder='' />
                            <div className='w-max text-nowrap py-2 px-4 bg-primary rounded-md ml-4 cursor-pointer ' onClick={askQuestion}>{pending ? "Generating" : "Send"}</div>
                        </div>

                    </div>}

                </div>

            </div>


        </div >
    );
}


const CircularProgress = ({ value, max = 100 }) => {


    const radius = 30; // Radius of the circle
    const circumference = 2 * Math.PI * radius;
    const progress = (value / max) * circumference;

    const colors = ["#dc2626", "#ea580c", "#facc15", "#65a30d"]
    const colorsText = ["text-red-600", "text-orange-600", "text-yellow-400", "text-lime-600"]
    let colorIndex = 0;
    const breakpoints = [30, 50, 80, 95]

    for (let i = 0; i < breakpoints.length; i++) {
        if (value > breakpoints[i]) {

            colorIndex = i;
        }
    }

    return (
        <div className="relative flex items-center justify-center w-20 h-20 -z-0">

            <svg className="rotate-90" width="80" height="80">
                {/* Background Circle */}
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke={`#252525`} // Light background color
                    strokeWidth="7"
                />
                {/* Progress Circle */}
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke={colors[colorIndex]} // Progress color
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                />
            </svg>
            {/* Centered Value */}
            <span className={`absolute text-lg font-semibold ${colorsText[colorIndex]}`}>
                {value}
            </span>

        </div>
    );
};

