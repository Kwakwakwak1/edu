# Course Creation Guidelines

## Overview

Each course in the edu.kwakwakwak.com platform should be a self-contained project that follows these guidelines to ensure proper indexing and integration with the main website.

## Requirements

1. **Course Manifest**
   - Each course must provide a `course.json` file with metadata
   - This file should be at the root of the course project

2. **Structure**
   - Content should be organized in a clear, hierarchical structure
   - Use consistent naming conventions for files and directories

3. **Dependencies**
   - All dependencies should be clearly documented
   - If possible, use a standardized dependency management system

## Course Manifest Format

```json
{
  "id": "unique-course-id",
  "title": "Course Title",
  "description": "Brief description of the course",
  "author": "Author Name",
  "tags": ["tag1", "tag2"],
  "level": "beginner|intermediate|advanced",
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "lessons": [
        {
          "id": "lesson-1",
          "title": "Lesson Title",
          "path": "relative/path/to/lesson.html"
        }
      ]
    }
  ]
}
```

## Integration Process

1. Create your course following these guidelines
2. Submit a pull request to add your course to the main repository
3. Once approved, your course will be indexed and displayed on edu.kwakwakwak.com