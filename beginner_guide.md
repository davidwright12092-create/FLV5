# FieldLink v5: Beginner's Guide to Building with Claude
## How to Use This Development Plan with Claude

### Understanding How to Work with Claude

**Claude is your AI coding partner** - you don't need to run all the commands yourself. Instead, you'll give Claude specific prompts and it will help you build the application step by step.

---

## How to Use This Guide

### Step 1: Start with Project Setup
Instead of running all the commands yourself, give Claude this prompt:

```
"Help me set up the FieldLink v5 project structure. I want to create a React frontend, Node.js backend, and React Native mobile app. Please create the initial project structure and configuration files."
```

### Step 2: Build UI Components
For each component, give Claude prompts like:

```
"Create a Button component for the FieldLink v5 design system. It should be built with React, TypeScript, and Tailwind CSS. Include different variants (primary, secondary, outline) and sizes (sm, md, lg)."
```

### Step 3: Build Pages
For pages, use prompts like:

```
"Create a LoginPage component for FieldLink v5. It should include a form with email and password fields, validation, and integration with the Button component we created earlier."
```

---

## Recommended Approach: One Feature at a Time

### Phase 1: Project Foundation (Week 1)
**Give Claude this prompt:**
```
"I want to start building FieldLink v5, a conversation recording and analysis platform for trades businesses. Help me set up the initial project structure with:

1. React frontend with TypeScript
2. Node.js backend with Express
3. Proper folder structure
4. Basic configuration files
5. Git repository setup

Please create all the necessary files and explain what each one does."
```

### Phase 2: Design System (Week 2)
**Give Claude this prompt:**
```
"Now I want to create a design system for FieldLink v5. Please create:

1. A color palette suitable for a professional trades industry app
2. Typography system
3. Spacing system
4. Base Button component with variants
5. Base Input component
6. Base Card component

Use React, TypeScript, and Tailwind CSS. Make it look professional and modern."
```

### Phase 3: Authentication (Week 3)
**Give Claude this prompt:**
```
"Create the authentication system for FieldLink v5. I need:

1. Login page with email/password
2. Signup page with company information
3. Authentication context and hooks
4. Protected routes
5. Basic user management

Use React, TypeScript, and include form validation."
```

### Phase 4: Dashboard (Week 4)
**Give Claude this prompt:**
```
"Build the main dashboard for FieldLink v5. It should include:

1. Overview metrics cards
2. Recent recordings list
3. Performance charts
4. Quick actions
5. Navigation sidebar

Make it responsive and professional looking for trades business owners."
```

### Phase 5: Recording Features (Week 5)
**Give Claude this prompt:**
```
"Create the recording functionality for FieldLink v5. I need:

1. Audio recording component
2. Recording list page
3. Recording detail page
4. File upload functionality
5. Basic audio player

Focus on the UI first - we'll add backend integration later."
```

---

## Pro Tips for Working with Claude

### 1. Be Specific About What You Want
❌ **Bad:** "Create a button"
✅ **Good:** "Create a Button component with primary, secondary, and outline variants, in small, medium, and large sizes, using React, TypeScript, and Tailwind CSS"

### 2. Ask for Explanations
Add this to your prompts:
```
"Please explain what each part of the code does and why it's needed."
```

### 3. Request Step-by-Step Instructions
```
"Please break this down into smaller steps and explain how to implement each part."
```

### 4. Ask for Best Practices
```
"What are the best practices for [specific feature] and how should I implement it?"
```

### 5. Request Testing
```
"Please include unit tests for this component and explain how to run them."
```

---

## Example Conversation Flow

### Starting the Project
**You:** "I want to build FieldLink v5, a conversation recording platform for trades businesses. Help me get started."

**Claude:** "Great! Let's start by setting up the project structure. I'll create a React frontend with TypeScript and Tailwind CSS..."

### Building Components
**You:** "Now I need a professional-looking dashboard. Create the main dashboard page with metrics cards, charts, and a sidebar navigation."

**Claude:** "I'll create a comprehensive dashboard with modern design. Here's the main dashboard component..."

### Adding Features
**You:** "I need to add audio recording functionality. Create a recording component that can capture audio and display recording status."

**Claude:** "I'll create an audio recording component using the Web Audio API. Here's the implementation..."

---

## What Claude Can Do for You

### ✅ Claude Can:
- Write complete code files
- Explain how code works
- Debug issues and fix errors
- Suggest best practices
- Create documentation
- Write tests
- Optimize performance
- Handle complex logic

### ❌ Claude Cannot:
- Run commands on your computer
- Access your local files directly
- Make changes to your system
- Install software for you
- Access external APIs without keys

---

## Getting Started Right Now

### Your First Prompt
Copy and paste this into Claude:

```
"I want to build FieldLink v5, a conversation recording and analysis platform for trades businesses (roofing, plumbing, HVAC). 

Please help me:
1. Set up the initial React project with TypeScript
2. Install necessary dependencies (Tailwind CSS, React Router, etc.)
3. Create a basic project structure
4. Set up the main App component with routing
5. Create a simple landing page

Explain each step and what the code does."
```

### Your Second Prompt (After the first is complete)
```
"Now I want to create the authentication system for FieldLink v5. Please create:

1. Login page with email/password fields
2. Signup page with company information
3. Authentication context for state management
4. Protected routes
5. Form validation

Use modern React patterns and make it look professional for trades business owners."
```

---

## Troubleshooting Common Issues

### If Claude's Code Doesn't Work
**Prompt:** "The code you provided isn't working. Here's the error: [paste error]. Please help me fix it."

### If You Don't Understand Something
**Prompt:** "I don't understand how [specific part] works. Can you explain it in simpler terms?"

### If You Want to Modify Something
**Prompt:** "I want to change [specific feature] to [new requirement]. Please update the code accordingly."

---

## Next Steps

1. **Start with the first prompt** above
2. **Follow Claude's instructions** step by step
3. **Ask questions** when you don't understand
4. **Test each feature** before moving to the next
5. **Build incrementally** - one feature at a time

Remember: Claude is here to help you learn and build. Don't hesitate to ask for explanations, ask questions, or request modifications. The goal is to build a working application while understanding how it all works together.
