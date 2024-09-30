const video = document.getElementById('video');
const heartRateDisplay = document.getElementById('heartRate');
const startButton = document.getElementById('startButton');

let mediaStream = null;
let lastBeatTime = 0;
let heartRate = 0;
let analyzing = false;

// Start video stream
async function startVideo() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = mediaStream;
        analyzing = true;
        analyzeVideo();
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
}

// Analyze video frames for PPG
function analyzeVideo() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    setInterval(() => {
        if (!analyzing) return;

        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const frame = context.getImageData(0, 0, video.videoWidth, video.videoHeight);
        const data = frame.data;

        // Average red channel values for PPG
        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
            sum += data[i]; // Red channel
        }
        const averageRed = sum / (data.length / 4);

        // Simple threshold to detect beats
        if (averageRed > 150) { // Adjust this threshold
            const currentTime = Date.now();
            if (currentTime - lastBeatTime > 600) { // 600ms for approx 100 BPM
                heartRate++;
                lastBeatTime = currentTime;
            }
        }

        heartRateDisplay.innerText = `Heart Rate: ${heartRate} BPM`;
    }, 1000);
}

// Start monitoring on button click
startButton.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent any default action
    startVideo();
});
