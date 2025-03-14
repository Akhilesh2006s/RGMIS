require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload'); // For handling file uploads
const app = express();
const port = 3000;

// Middleware to parse form data and handle file uploads
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload()); // Enable file uploads

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Load environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME; // Username from .env
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Password from .env
const SECRET_KEY = process.env.SECRET_KEY; // Secret key from .env

// Mock database for activities
let activities = [];

// Mock database for gallery items
let galleryItems = [];

// Mock database for birthdays
let birthdays = [];

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/admissions', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admissions.html'));
});

app.get('/academics', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'academics.html'));
});

app.get('/secondary', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'secondary.html'));
});

app.get('/senior-secondary', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'senior-secondary.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signin.html'));
});

app.get('/activities', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'activities.html'));
});
app.get('/Login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'Login.html'));
});

app.get('/staff', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'staff.html'));
});

app.get('/admin-activities', (req, res) => {
    const token = req.query.token || req.headers.authorization?.split(' ')[1]; // Get token from query or headers
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });

    try {
        jwt.verify(token, SECRET_KEY); // Verify the token
        res.sendFile(path.join(__dirname, 'views', 'admin-activities.html'));
    } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
});

app.get('/admin-gallery', (req, res) => {
    const token = req.query.token || req.headers.authorization?.split(' ')[1]; // Get token from query or headers
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });

    try {
        jwt.verify(token, SECRET_KEY); // Verify the token
        res.sendFile(path.join(__dirname, 'views', 'admin-gallery.html'));
    } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
});

app.get('/admin-birthday', (req, res) => {
    const token = req.query.token || req.headers.authorization?.split(' ')[1]; // Get token from query or headers
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });

    try {
        jwt.verify(token, SECRET_KEY); // Verify the token
        res.sendFile(path.join(__dirname, 'views', 'admin-birthday.html')); // Serve the admin-birthday.html file
    } catch (error) {
        res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'gallery.html'));
});

app.get('/birthday', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'birthday.html'));
});

// Handle form submission
app.post('/submit-form', (req, res) => {
    const { parentName, mobile, email, city, branch } = req.body;

    // Send an email (mock implementation)
    const subject = 'New Admission Inquiry';
    const text = `
        Parent Name: ${parentName}
        Mobile: ${mobile}
        Email: ${email}
        City: ${city}
        Branch: ${branch}
    `;

    console.log('Email sent:', text); // Replace with actual email sending logic
    res.send('Form submitted successfully!');
});

// Sign-In Endpoint
app.post('/signin', (req, res) => {
    const { username, password } = req.body;

    // Check if the username and password match the environment variables
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Generate a JWT token
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ success: true, token });
    } else {
        res.json({ success: false });
    }
});

// Upload Image Endpoint
app.post('/upload-image', (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const file = req.files.image;
    const fileName = `${Date.now()}-${file.name}`; // Add a timestamp to avoid filename conflicts
    const filePath = path.join(__dirname, 'uploads', fileName);

    // Save the file to the uploads folder
    file.mv(filePath, (err) => {
        if (err) {
            console.error('File upload failed:', err);
            return res.status(500).json({ success: false, message: 'File upload failed' });
        }
        console.log('File uploaded successfully:', fileName);
        res.json({ success: true, imageUrl: `/uploads/${fileName}` }); // Return the correct URL
    });
});

// Add Activity Endpoint
app.post('/add-activity', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    try {
        jwt.verify(token, SECRET_KEY); // Verify the token
        const { title, description, image } = req.body;

        // Check if the activity already exists
        const existingActivity = activities.find(activity => activity.title === title);
        if (existingActivity) {
            return res.status(400).json({ success: false, message: 'Activity with this title already exists' });
        }

        activities.push({ title, description, image });
        res.json({ success: true });
    } catch (error) {
        res.status(401).json({ success: false });
    }
});

// Get Activities Endpoint
app.get('/get-activities', (req, res) => {
    res.json(activities);
});

// Delete Activity Endpoint
app.post('/delete-activity', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    try {
        jwt.verify(token, SECRET_KEY); // Verify the token
        const { title } = req.body;

        // Filter out the activity with the matching title
        const initialLength = activities.length;
        activities = activities.filter(activity => activity.title !== title);

        if (activities.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Activity not found' });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(401).json({ success: false });
    }
});

// Upload Images Endpoint
app.post('/upload-images', (req, res) => {
    if (!req.files || !req.files.images) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const imageUrls = files.map(file => {
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(__dirname, 'uploads', fileName);
        file.mv(filePath);
        return `/uploads/${fileName}`;
    });

    res.json({ success: true, imageUrls });
});

// Add Gallery Item Endpoint
app.post('/add-gallery-item', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    try {
        jwt.verify(token, SECRET_KEY); // Verify the token
        const { title, images } = req.body;

        // Check if the gallery item already exists
        const existingItem = galleryItems.find(item => item.title === title);
        if (existingItem) {
            return res.status(400).json({ success: false, message: 'Gallery item with this title already exists' });
        }

        galleryItems.push({ title, images });
        res.json({ success: true });
    } catch (error) {
        res.status(401).json({ success: false });
    }
});

// Get Gallery Items Endpoint
app.get('/get-gallery', (req, res) => {
    res.json(galleryItems);
});

// Delete Gallery Item Endpoint
app.post('/delete-gallery-item', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    try {
        jwt.verify(token, SECRET_KEY); // Verify the token
        const { title } = req.body;

        // Filter out the gallery item with the matching title
        const initialLength = galleryItems.length;
        galleryItems = galleryItems.filter(item => item.title !== title);

        if (galleryItems.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Gallery item not found' });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(401).json({ success: false });
    }
});

// Add Birthday Endpoint
app.post('/add-birthday', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    try {
        jwt.verify(token, SECRET_KEY); // Verify the token
        const { name, date, image } = req.body;

        // Check if the birthday already exists
        const existingBirthday = birthdays.find(birthday => birthday.name === name);
        if (existingBirthday) {
            return res.status(400).json({ success: false, message: 'Birthday with this name already exists' });
        }

        birthdays.push({ name, date, image });
        res.json({ success: true });
    } catch (error) {
        res.status(401).json({ success: false });
    }
});

// Get Birthdays Endpoint
app.get('/get-birthdays', (req, res) => {
    res.json(birthdays);
});

// Delete Birthday Endpoint
app.post('/delete-birthday', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    try {
        jwt.verify(token, SECRET_KEY); // Verify the token
        const { name } = req.body;

        // Filter out the birthday with the matching name
        const initialLength = birthdays.length;
        birthdays = birthdays.filter(birthday => birthday.name !== name);

        if (birthdays.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Birthday not found' });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(401).json({ success: false });
    }
    const cleanupOldBirthdays = () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Filter out birthdays older than 24 hours
    birthdays = birthdays.filter(birthday => new Date(birthday.createdAt) > twentyFourHoursAgo);

    console.log('Cleaned up old birthdays');
};

// Schedule Cleanup to Run Every Hour
setInterval(cleanupOldBirthdays, 60 * 60 * 1000); // 60 minutes * 60 seconds * 1000 milliseconds

});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});