// Main JavaScript for edu.kwakwakwak.com

document.addEventListener('DOMContentLoaded', () => {
  // Fetch and display courses
  loadCourses();
});

async function loadCourses() {
  try {
    const response = await fetch('/courses/index.json');
    const data = await response.json();
    
    renderCourses(data.courses);
  } catch (error) {
    console.error('Error loading courses:', error);
    document.querySelector('#courses').innerHTML += '<p>Failed to load courses. Please try again later.</p>';
  }
}

function renderCourses(courses) {
  const courseGrid = document.querySelector('.course-grid');
  
  if (courses.length === 0) {
    courseGrid.innerHTML = '<p>No courses available yet. Check back soon!</p>';
    return;
  }
  
  courses.forEach(course => {
    const courseCard = document.createElement('div');
    courseCard.className = 'course-card';
    
    const levelText = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    
    // Create tags HTML
    const tagsHtml = course.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    courseCard.innerHTML = `
      <img src="${course.image || '/static/img/default-course.jpg'}" alt="${course.title}">
      <div class="course-content">
        <span class="level">${levelText[course.level] || 'All Levels'}</span>
        <h3>${course.title}</h3>
        <p class="description">${course.description}</p>
        <div class="tags">${tagsHtml}</div>
        <a href="/courses/${course.id}" class="button">View Course</a>
      </div>
    `;
    
    courseGrid.appendChild(courseCard);
  });
}
