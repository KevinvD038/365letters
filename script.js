document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("camera");
    const scanButton = document.getElementById("scan-btn");
    const messageBox = document.getElementById("message");
    const letterContainer = document.getElementById("letter-container");
    const letterDisplay = document.getElementById("letter-display");
    
    scanButton.addEventListener("click", async () => {
        video.classList.remove("hidden");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        const scanInterval = setInterval(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            
            if (qrCode) {
                clearInterval(scanInterval);
                video.srcObject.getTracks().forEach(track => track.stop());
                validateQRCode(qrCode.data);
            }
        }, 500);
    });

    async function validateQRCode(qrData) {
        const today = new Date().toLocaleDateString("en-GB", { timeZone: "Europe/Amsterdam" });
        const storedLetters = JSON.parse(localStorage.getItem("unlockedLetters")) || {};
        
        if (storedLetters[today]) {
            messageBox.textContent = "Letter already unlocked. Try again tomorrow.";
            messageBox.classList.remove("hidden");
            return;
        }
        
        const response = await fetch("letters.json");
        const letters = await response.json();
        
        const dayOfYear = getDayOfYear(new Date());
        if (letters[dayOfYear]) {
            storedLetters[today] = true;
            localStorage.setItem("unlockedLetters", JSON.stringify(storedLetters));
            letterDisplay.textContent = letters[dayOfYear];
            letterContainer.classList.remove("hidden");
        } else {
            messageBox.textContent = "Invalid QR code.";
            messageBox.classList.remove("hidden");
        }
    }
    
    function getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000);
        return Math.floor(diff / 86400000);
    }
});
