import { useState, useRef } from "react";

function App() {
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [responseText, setResponseText] = useState("");
    const [streamActive, setStreamActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    let mediaStream = null;

    const startCamera = async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStreamActive(true);
            }
        } catch (error) {
            alert("Error accessing camera: " + error.message);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setStreamActive(false);
        }
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => processImage(blob), "image/jpeg");
        }
    };

    const processImage = async (imageBlob) => {
        const formData = new FormData();
        formData.append("image", imageBlob);
        formData.append("language", selectedLanguage);

        try {
            const response = await fetch("http://127.0.0.1:5000/scan-text", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.error) {
                alert(`Error: ${data.error}`);
            } else {
                setResponseText(`Extracted Text: ${data.text}\nTranslated: ${data.translated}`);
            }
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <h2 className="text-2xl font-bold mb-4">📸 Image Text Scanner & Translator</h2>

            <video ref={videoRef} autoPlay className="w-full max-w-md border rounded-lg shadow-md"></video>
            <br />

            <div className="flex space-x-2">
                {!streamActive ? (
                    <button onClick={startCamera} className="bg-green-500 text-white px-4 py-2 rounded-lg">Start Camera</button>
                ) : (
                    <button onClick={stopCamera} className="bg-red-500 text-white px-4 py-2 rounded-lg">Stop Camera</button>
                )}
                <button onClick={captureImage} className="bg-blue-500 text-white px-4 py-2 rounded-lg">Capture Image</button>
            </div>

            <br />

            <canvas ref={canvasRef} className="hidden"></canvas>

            <div className="mt-4">
                <label className="font-semibold">Select Language:</label>
                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="border p-2 rounded-lg"
                >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                    <option value="zh-cn">Chinese (Simplified)</option>
                </select>
            </div>

            {responseText && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow-md max-w-md">
                    <h3 className="text-lg font-semibold">📜 Result:</h3>
                    <pre className="text-sm text-gray-700">{responseText}</pre>
                </div>
            )}
        </div>
    );
}

export default App;
