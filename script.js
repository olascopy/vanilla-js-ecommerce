const bar = document.getElementById('size')
const close = document.getElementById('close')
const nav = document.getElementById('navbar')

if(bar){
    bar.addEventListener('click', () =>{
   nav.classList.add('active')
    });
}

if(close){
    close.addEventListener('click', () =>{
   nav.classList.remove('active')
    });
}


function sendMail(event) {
    if (event) event.preventDefault();

    let parms = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        subject: document.getElementById("subject").value,
        message: document.getElementById("message").value
    };

    emailjs.send("service_hvoc016", "template_7x0cgfl", parms)
        .then(() => {
            alert("Email Sent!!");
        })
        .catch((error) => {
            console.error("FAILED...", error);
            alert("Failed to send email. Check console for details.");
        });
}


let currentUser = localStorage.getItem('yt_user') || "";
let myPass = localStorage.getItem('yt_pass') || "";
let comments = JSON.parse(localStorage.getItem('yt_comments')) || [];
let ratings = JSON.parse(localStorage.getItem('yt_ratings')) || [];
let userLikedIds = JSON.parse(localStorage.getItem('user_liked_ids')) || [];

window.onload = () => {
    if(currentUser) showUI();
    renderComments();
    updateAvgRating();
};

function setUser() {
    const user = document.getElementById('username-input').value.trim();
    const pass = document.getElementById('password-input').value.trim();
    const errorMsg = document.getElementById('setup-error');
    
    errorMsg.style.display = 'none';

    if (user && pass) {
        // Check if name is already taken by someone else in the comments
        const isTaken = comments.some(c => c.user.toLowerCase() === user.toLowerCase() && c.pass !== pass);
        
        if (isTaken) {
            errorMsg.innerText = "Username has been taken!";
            errorMsg.style.display = 'block';
            return;
        }

        currentUser = user;
        myPass = pass;
        localStorage.setItem('yt_user', user);
        localStorage.setItem('yt_pass', pass);
        showUI();
    }
}

function showUI() {
    document.getElementById('user-setup').style.display = 'none';
    document.getElementById('reset-section').style.display = 'block';
    document.getElementById('comment-controls').style.display = 'block';
    document.getElementById('display-name').innerText = currentUser;
}

function resetName() {
    const newName = document.getElementById('new-username').value.trim();
    const passInput = document.getElementById('verify-pass').value.trim();
    const errorMsg = document.getElementById('reset-error');
    
    errorMsg.style.display = 'none';

    if (passInput === myPass && newName !== "") {
        const isTaken = comments.some(c => c.user.toLowerCase() === newName.toLowerCase() && c.pass !== myPass);
        
        if (isTaken) {
            errorMsg.innerText = "Username has been taken!";
            errorMsg.style.display = 'block';
            return;
        }

        // Update name on old comments
        comments.forEach(c => { if(c.pass === myPass) c.user = newName; });
        currentUser = newName;
        localStorage.setItem('yt_user', newName);
        localStorage.setItem('yt_comments', JSON.stringify(comments));
        document.getElementById('display-name').innerText = newName;
        renderComments();
    } else {
        errorMsg.innerText = "Incorrect Password!";
        errorMsg.style.display = 'block';
    }
}

function postComment() {
    const text = document.getElementById('comment-text').value;
    if (!text.trim()) return;
    comments.unshift({ id: Date.now(), user: currentUser, pass: myPass, text: text, likes: 0 });
    localStorage.setItem('yt_comments', JSON.stringify(comments));
    renderComments();
    document.getElementById('comment-text').value = "";
}

function rateWeb(n) {
    const index = ratings.indexOf(n);
    index > -1 ? ratings.splice(index, 1) : ratings.push(n);
    localStorage.setItem('yt_ratings', JSON.stringify(ratings));
    updateAvgRating();
}

function updateAvgRating() {
    if (!ratings.length) return;
    const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
    document.getElementById('avg-display').innerText = avg;
    document.querySelectorAll('.star-big').forEach((s, i) => s.classList.toggle('active', ratings.includes(i + 1)));
}

function renderComments() {
    const container = document.getElementById('comments-container');
    container.innerHTML = comments.map(c => `
        <div class="input-row" style="margin-bottom:20px;">
            <div class="profile-circle">ifashionn</div>
            <div style="flex:1;">
                <div style="font-weight:bold; font-size:13px;">@${c.user}</div>
                <div style="font-size:14px;">${c.text}</div>
                <div style="display:flex;">
                    <button class="action-btn ${userLikedIds.includes(c.id) ? 'liked' : ''}" onclick="like(${c.id})">👍 ${c.likes}</button>
                    ${c.pass === myPass ? `<button class="action-btn" onclick="del(${c.id})" style="color:red">Delete</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function del(id) {
    comments = comments.filter(c => c.id !== id);
    localStorage.setItem('yt_comments', JSON.stringify(comments));
    renderComments();
}

function like(id) {
    const c = comments.find(x => x.id === id);
    if (userLikedIds.includes(id)) {
        c.likes = 0;
        userLikedIds = userLikedIds.filter(i => i !== id);
    } else {
        c.likes = 1;
        userLikedIds.push(id);
    }
    localStorage.setItem('user_liked_ids', JSON.stringify(userLikedIds));
    localStorage.setItem('yt_comments', JSON.stringify(comments));
    renderComments();
}
function deleteComment(buttonElement) {
    // Finds the specific comment container and removes it
    const comment = buttonElement.closest('.comment-entry');
    if (comment) {
        comment.remove();
    }
}

