// Modal and Overlay Elements
const modal = document.querySelector(".modal");
const outlay = document.querySelector(".outlay");
const loginContainer = document.querySelector("#loginContainer");

// Chat Elements
const chatBox = document.getElementById('chatBox');
const attachButton = document.getElementById('attachButton');
const sendButton = document.getElementById('sendButton');
const messageInput = document.getElementById('messageInput');

// File Input Element
const fileInput = document.getElementById('fileInput');

// Function to open the modal
const openModal = () => {
    modal.classList.add("active");
    outlay.classList.add("overlayactive");
};

// Function to close the modal
const closeModal = () => {
    modal.classList.remove("active");
    outlay.classList.remove("overlayactive");
};

// Function to open the login container
const openLogin = () => {
    loginContainer.classList.add("logactive"); // Show login container
};

// Function to close the login container
const closeLogin = () => {
    loginContainer.classList.remove("logactive"); // Hide login container
};

// Function to handle bot response based on user input
const getBotResponse = (userInput) => {
    const responses = {
        "hi": "Happy to see you here! How can I assist you today? Whether you have questions about HR policies, IT support, or company events, feel free to ask!",
        "Can you tell me about the employee performance review process?": "Absolutely! The employee performance review process happens annually. Employees are evaluated on key performance indicators (KPIs) related to their roles, and the review is conducted by their immediate supervisor. Feedback from colleagues and self-assessments are also considered. If you need detailed steps or documents on how the process works, I can help with that too!",
        "How do I reset my email password?": "You can reset your email password through the self-service portal. Log in with your employee ID, navigate to the Account Settings, and select Password Reset. A verification link will be sent to your registered email for confirmation. If you face issues, the IT support team is available to assist!",
        "I've uploaded the latest HR manual. Can you summarize it?": "I've received the document. Here's a summary of the HR manual:\n- *Leave Entitlements:* Updated leave policies for casual, medical, and earned leave.\n- *Performance Reviews:* The manual outlines the updated criteria and timelines for performance evaluations.\n- *Employee Benefits:* Detailed information about health insurance, retirement plans, and new wellness initiatives.\nLet me know if you'd like further details or specific sections summarized!",
        "I uploaded the company's event schedule. Can you extract the key details from it?": "I've processed the document. Here are the key details:\n- *Annual Conference:* Scheduled for November 15th.\n- *Team Building Workshop:* Happening on October 5th.\n- *Monthly Townhall:* Scheduled on the first Friday of every month.\nWould you like to know more about any of these events?"
    };

    const lowerCaseInput = userInput.toLowerCase().trim();
    for (const [key, response] of Object.entries(responses)) {
        if (lowerCaseInput === key.toLowerCase()) {
            return response;
        }
    }

    return "I couldn't quite catch that. Could you try again?";
};

// Function to handle file input and display file name
const handleFileUpload = () => {
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            messageInput.value = `Uploaded file: ${file.name}\n\n`; // Double \n for extra line break
        }
    });
};

// Function to send a message
const sendMessage = () => {
    if (messageInput.value.trim() !== '') {
        const newUserMessage = document.createElement('div');
        newUserMessage.classList.add('message', 'user1');

        const user = document.createElement('div');
        user.classList.add('user');
        user.textContent = 'You:';

        const text = document.createElement('div');
        text.classList.add('text');
        text.textContent = messageInput.value;

        newUserMessage.appendChild(user);
        newUserMessage.appendChild(text);

        chatBox.appendChild(newUserMessage);
        chatBox.scrollTop = chatBox.scrollHeight;

        messageInput.value = '';

        setTimeout(() => {
            const botResponse = getBotResponse(newUserMessage.querySelector('.text').textContent);
            
            const newBotMessage = document.createElement('div');
            newBotMessage.classList.add('message', 'user2');

            const botUser = document.createElement('div');
            botUser.classList.add('user');
            botUser.textContent = 'Bot:';

            const botText = document.createElement('div');
            botText.classList.add('text');
            botText.textContent = botResponse;

            newBotMessage.appendChild(botUser);
            newBotMessage.appendChild(botText);

            chatBox.appendChild(newBotMessage);
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1000);
    }
};

// Event listener for send button in chat
sendButton.addEventListener('click', sendMessage);

// Event listener for Enter key press
messageInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

// Open login container when login button is clicked
// document.getElementById('loginButton').addEventListener('click', openLogin);

// Close login container if clicking outside of it
window.addEventListener('click', function(event) {
    if (event.target === loginContainer) {
        closeLogin();
    }
});

// Show file input when attach button is clicked
attachButton.addEventListener('click', () => {
    fileInput.click();
});

// Initialize file handling
handleFileUpload();

// Toggle between sign up and sign in forms
const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signInForm = document.getElementById('signInForm');
const signUpForm = document.getElementById('signUpForm');

signUpButton.addEventListener('click', function() {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
});

signInButton.addEventListener('click', function() {
    signInForm.style.display = "block";
    signUpForm.style.display = "none";
});


// Toggle between sign up and sign in forms


// Handle Sign-Up
document.getElementById('submitSignUp').addEventListener('click', async (event) => {
    event.preventDefault();

    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;

    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        const data = await response.json();
        if (response.status === 201) {
            alert('Account Created Successfully');
            window.location.href = 'index.html'; // Redirect to login page
        } else {
            alert(data.message || 'Error creating account');
        }
    } catch (error) {
        console.error('Sign up error:', error);
        alert('An error occurred while signing up.');
    }
});

// Handle Sign-In
document.getElementById('submitSignIn').addEventListener('click', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.status === 200) {
            alert('Login successful');
            localStorage.setItem('token', data.token); // Save token for authenticated requests
            window.location.href = 'homepage.html'; // Redirect to homepage
        } else {
            alert(data.message || 'Error during login');
        }
    } catch (error) {
        console.error('Sign in error:', error);
        alert('An error occurred while signing in.');
    }
});



