const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the client's dist directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// API routes
app.get('/api/courses/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    res.sendFile(path.join(__dirname, 'courses', courseId, 'course.json'));
});

app.get('/api/courses/:courseId/lessons/:lessonId', (req, res) => {
    const { courseId, lessonId } = req.params;
    res.sendFile(path.join(__dirname, 'courses', courseId, 'lessons', lessonId));
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(port, () => {
    console.log(`Course platform running at http://localhost:${port}`);
    console.log(`View introduction at http://localhost:${port}/courses/sample-course/lessons/introduction.html`);
    console.log(`View setup at http://localhost:${port}/courses/sample-course/lessons/setup.html`);
}); 