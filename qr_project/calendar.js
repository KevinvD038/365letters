document.addEventListener('DOMContentLoaded', () => {
    const calendarDiv = document.getElementById('calendar');
    fetch('letters.json')
        .then(response => response.json())
        .then(letters => {
            let calendarHTML = "<table><tr>";
            for (let i = 2; i <= 365; i++) {
                let date = new Date(2025, 1, i);
                let dateString = date.toLocaleDateString('en-GB');
                let unlocked = letters[dateString]?.unlocked ? "✅" : "❌";
                calendarHTML += `<td>${i}<br>${unlocked}</td>`;
                if (i % 7 === 0) calendarHTML += "</tr><tr>";
            }
            calendarHTML += "</tr></table>";
            calendarDiv.innerHTML = calendarHTML;
        });
});