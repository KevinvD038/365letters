document.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scan-btn");
    const messageDiv = document.getElementById("message");
    const video = document.getElementById("camera");
    const calendarLink = document.getElementById("calendar-link");
    
    function getAmsterdamDate() {
        let now = new Date();
        let options = { timeZone: "Europe/Amsterdam", year: "numeric", month: "2-digit", day: "2-digit" };
        return new Intl.DateTimeFormat("fr-CA", options).format(now); // YYYY-MM-DD
    }
    
    function unlockLetter(code) {
        let today = getAmsterdamDate();
        let unlockedDay = localStorage.getItem("unlockedDay");
        
        if (unlockedDay === today) {
            messageDiv.innerText = "Today's letter is already unlocked! Try again tomorrow.";
            messageDiv.classList.remove("hidden");
            return;
        }
        
        localStorage.setItem("unlockedDay", today);
        messageDiv.innerText = "Letter unlocked for " + today + "!";
        messageDiv.classList.remove("hidden");
    }
    
    async function startScan() {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        video.play();

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        function scanFrame() {
            if (!video.videoWidth) {
                requestAnimationFrame(scanFrame);
                return;
            }
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            let qrCode = jsQR(imageData.data, canvas.width, canvas.height);
            if (qrCode) {
                video.srcObject.getTracks().forEach(track => track.stop());
                unlockLetter(qrCode.data);
            } else {
                requestAnimationFrame(scanFrame);
            }
        }
        requestAnimationFrame(scanFrame);
    }
    
    scanBtn.addEventListener("click", startScan);
    calendarLink.addEventListener("click", () => {
        alert("Calendar feature coming soon!");
    });
});
