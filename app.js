const video = document.getElementById('video');
const heartRateDisplay = document.getElementById('heartRate');
const startButton = document.getElementById('startButton');

let mediaStream = null;
let lastBeatTime = 0;
let heartRate = 0;
let analyzing = false;

// Start video stream
async function startVideo() {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = mediaStream;
    analyzeVideo();
}

// Analyze video frames for PPG
function analyzeVideo() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;

    canvas.width = width;
    canvas.height = height;

    const flashEnabled = true; // Toggle flashlight
    if (flashEnabled && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Flashlight code might vary depending on device/browser support
        const constraints = {
            video: {
                facingMode: 'environment',
                torch: true // Request flashlight
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => {
                video.srcObject = stream;
                analyzing = true;
                captureFrames(context, width, height);
            })
            .catch(err => {
                console.error("Error accessing camera:", err);
            });
    } else {
        console.error("Flashlight not supported");
    }
}

// Capture frames from video and analyze PPG
function captureFrames(context, width, height) {
    setInterval(() => {
        if (!analyzing) return;

        context.drawImage(video, 0, 0, width, height);
        const frame = context.getImageData(0, 0, width, height);
        const data = frame.data;

        // Average red channel values for PPG
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
            sum += data[i]; // red channel
        }
        const averageRed = sum / (data.length / 4);

        // Simple threshold to detect beats
        if (averageRed > 150) { // Adjust this threshold
            const currentTime = Date.now();
            if (currentTime - lastBeatTime > 600) { // 600ms interval for approx 100 BPM
                heartRate++;
                lastBeatTime = currentTime;
            }
        }

        heartRateDisplay.innerText = `Heart Rate: ${heartRate} BPM`;
    }, 1000);
}

// Start monitoring on button click
startButton.addEventListener('click', () => {
    startVideo();
});
