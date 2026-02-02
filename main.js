localStorage.removeItem('polls')
// ALUSTUS
if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
if (!localStorage.getItem('polls')) localStorage.setItem('polls', JSON.stringify([]));

// --- REKISTERÖITYMINEN ---
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('role').value;
    let users = JSON.parse(localStorage.getItem('users'));

    if (users.find(user => user.username === username)) {
        alert('Käyttäjätunnus on jo käytössä.');
    } else {
        users.push({ username, password, role });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Rekisteröinti onnistui!');
        showLoginPage();
    }
});

// --- KIRJAUTUMINEN ---
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    let users = JSON.parse(localStorage.getItem('users'));
    let user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainPage();
    } else {
        alert('Väärä käyttäjätunnus tai salasana.');
    }
});

// --- SIVUNVAIHDOT ---
document.getElementById('registerLink').addEventListener('click', showRegisterPage);
document.getElementById('loginLink').addEventListener('click', showLoginPage);

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'none';
}

function showRegisterPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'block';
    document.getElementById('mainPage').style.display = 'none';
}

function showMainPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('currentUser').textContent = currentUser.username;
    loadPolls();
}

// --- ÄÄNESTYKSEN LUOMINEN ---
document.getElementById('pollForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const question = document.getElementById('pollQuestion').value;
    const optionsInput = document.getElementById('pollOptions').value;

    const options = optionsInput.split(',').map(opt => ({
        name: opt.trim(),
        votes: 0
    })).filter(opt => opt.name !== "");

    if (options.length < 2) {
        alert("Anna vähintään kaksi vaihtoehtoa.");
        return;
    }

    let polls = JSON.parse(localStorage.getItem('polls'));
    // Lisätään votedBy-taulukko, johon tallennetaan äänestäneiden nimet
    polls.push({ 
        question, 
        options, 
        votedBy: [] 
    });
    
    localStorage.setItem('polls', JSON.stringify(polls));
    e.target.reset();
    loadPolls();
});

// --- ÄÄNESTYSTEN NÄYTTÄMINEN ---
function loadPolls() {
    const pollsContainer = document.getElementById('pollsContainer');
    pollsContainer.innerHTML = '';
    let polls = JSON.parse(localStorage.getItem('polls'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    polls.forEach((poll, pollIndex) => {
        const pollDiv = document.createElement('div');
        pollDiv.className = 'poll';
        pollDiv.style.border = "1px solid #ccc";
        pollDiv.style.padding = "15px";
        pollDiv.style.marginBottom = "10px";

        // Tarkistetaan, onko käyttäjä jo äänestänyt tätä
        const hasVoted = poll.votedBy.includes(currentUser.username);

        let html = `<h4>${poll.question}</h4>`;
        if (hasVoted) html += `<p style="color: green;"><i>Olet jo äänestänyt tätä.</i></p>`;

        poll.options.forEach((option, optionIndex) => {
            // Estetään painikkeen klikkaus, jos on jo äänestänyt
            const disabled = hasVoted ? "disabled" : "";
            html += `
                <div style="margin-bottom: 5px;">
                    <button onclick="vote(${pollIndex}, ${optionIndex})" ${disabled}>
                        ${option.name}
                    </button>
                    <span> Äänet: ${option.votes}</span>
                </div>
            `;
        });

        pollDiv.innerHTML = html;

        if (currentUser.role === 'admin') {
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Poista';
            delBtn.style.backgroundColor = '#dc3545';
            delBtn.onclick = () => deletePoll(pollIndex);
            pollDiv.appendChild(delBtn);
        }
        pollsContainer.appendChild(pollDiv);
    });
}

// --- ÄÄNESTÄMINEN ---
function vote(pollIndex, optionIndex) {
    let polls = JSON.parse(localStorage.getItem('polls'));
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const poll = polls[pollIndex];

    // Varmistus: jos nimi löytyy jo listalta, keskeytetään
    if (poll.votedBy.includes(currentUser.username)) {
        alert("Olet jo äänestänyt tässä kyselyssä!");
        return;
    }

    // Lisätään ääni ja tallennetaan käyttäjän nimi
    poll.options[optionIndex].votes++;
    poll.votedBy.push(currentUser.username);

    localStorage.setItem('polls', JSON.stringify(polls));
    loadPolls();
}

// --- POISTO JA ULOSKIRJAUS ---
function deletePoll(index) {
    let polls = JSON.parse(localStorage.getItem('polls'));
    polls.splice(index, 1);
    localStorage.setItem('polls', JSON.stringify(polls));
    loadPolls();
}

document.getElementById('logoutButton').addEventListener('click', function () {
    localStorage.removeItem('currentUser');
    showLoginPage();
});

showLoginPage();

