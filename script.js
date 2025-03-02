document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('camera');
    const scanButton = document.getElementById('scan-btn');
    const messageDiv = document.getElementById('message');
    let scanning = false;

    async function startCamera() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
    }

    function scanQR() {
        if (scanning) return;
        scanning = true;

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const scanInterval = setInterval(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

            if (qrCode) {
                clearInterval(scanInterval);
                scanning = false;
                unlockLetter(qrCode.data);
            }
        }, 500);
    }

    function unlockLetter(qrData) {
        fetch('letters.json')
            .then(response => response.json())
            .then(letters => {
                const today = new Date().toLocaleDateString('en-GB');
                if (letters[today]) {
                    messageDiv.textContent = "Letter already unlocked for today! Try again tomorrow.";
                    messageDiv.style.background = "#dc3545";
                } else {
                    letters[today] = { unlocked: true };
                    fetch('letters.json', {
                        method: 'PUT',
                        body: JSON.stringify(letters),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    messageDiv.textContent = "Letter unlocked!";
                    messageDiv.style.background = "#28a745";
                }
                messageDiv.style.display = "block";
            });
    }

    scanButton.addEventListener('click', async () => {
        await startCamera();
        scanQR();
    });
});