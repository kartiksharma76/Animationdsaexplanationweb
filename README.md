# AlgoPulse — Interactive Animated DSA Question Explanation Web Application

![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)
![Security](https://img.shields.io/badge/Spring%20Security-JWT-blue.svg)
![Database](https://img.shields.io/badge/MySQL-8.0-blue.svg)
![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%2F%20CSS3%20%2F%20Vanilla%20JS-yellow.svg)
![Theme](https://img.shields.io/badge/Design-Modern%20Dark%20Glassmorphism-purple.svg)

**AlgoPulse** is a modern, full-stack **Animated DSA Question Explanation Web Application** built with Java 21, Spring Boot, MySQL, HTML5, CSS3, and JavaScript. It helps students master Data Structures & Algorithms through interactive step-by-step animations, live pointer tracking, dynamic variable inspectors, line-by-line Java code synchronization, and conceptual mastery quizzes.

---

## 🌟 Key Features

### 1. Interactive Algorithm Visualizer Studio
- **Full Playback Controls**: Play, Pause, Next Step (`>`), Previous Step (`<`), Reset (`|<<`), and Seek scrubber.
- **Speed Multiplier**: Adjust playback speed smoothly from `0.25x` to `3.0x`.
- **Keyboard Shortcuts**:
  - `[Space]` — Toggle Play / Pause
  - `[Right Arrow]` — Step Forward
  - `[Left Arrow]` — Step Backward
  - `[R]` — Reset to Beginning
- **Multi-Panel Real-Time Synchronization**:
  1. **Visual Canvas**: Renders specialized graphics for Arrays, Strings, Linked Lists, Stacks, Queues, Trees, Graphs, Recursion, and DP grids.
  2. **Synchronized Java Code**: Automatically highlights the exact executing lines of Java code as the animation advances.
  3. **Dry-Run Explanation Card**: Contextual narrative explaining *why* pointers moved, comparisons evaluated, or states mutated.
  4. **Variable Watcher**: Live inspector panel tracking runtime memory variables (e.g. `left: 0`, `right: 3`, `sum: 9`, `target: 9`).
- **Custom Input Sandbox**: Type your own test array or target and click **"Simulate"** to generate custom animated execution traces on the fly!

### 2. Comprehensive Problem Catalog Across 12 DSA Topics
Pre-seeded with 16 high-quality sample problems across all core DSA domains:
1. **Arrays**: *Two Sum II (Two Pointer)*, *Container With Most Water*, *Maximum Subarray (Kadane's Algorithm)*
2. **Strings**: *Longest Substring Without Repeating Characters (Sliding Window)*, *Valid Palindrome*
3. **Linked Lists**: *Reverse Linked List (3-pointer inversion)*, *Middle of the Linked List (Fast & Slow Tortoise/Hare)*
4. **Stacks**: *Valid Parentheses (LIFO Bracket Matching)*
5. **Queues**: *Sliding Window Maximum (Monotonic Deque)*
6. **Searching**: *Binary Search (Search Space Bisection)*
7. **Sorting**: *Bubble Sort (Adjacent Swaps & Sorted Regions)*
8. **Trees**: *Binary Tree Inorder Traversal (Recursive & Stack-based)*
9. **Graphs**: *Breadth-First Search (BFS Level-Order)*
10. **Recursion**: *Tower of Hanoi (Recursive Call Stack)*
11. **Greedy Algorithms**: *Non-overlapping Intervals (Activity Selection)*
12. **Dynamic Programming**: *Climbing Stairs (1D DP Memoization)*

### 3. Detailed Multi-Tab Question Workspace
- **Problem Statement**: Detailed description, constraints, and formatted example cards (input, output, explanation).
- **Approaches & Complexity**:
  - **Optimized Approach** with accurate Time & Space complexity badges (e.g. $O(n)$, $O(1)$).
  - **Brute-Force Approach** with comparative trade-off analysis (e.g. $O(n^2)$, $O(1)$).
- **Java Solution Code**: Syntax-highlighted code with line numbers, copy-to-clipboard functionality, and toggle between Optimized and Brute-force solutions.
- **Interactive Quizzes**: Multiple-choice conceptual quizzes with immediate feedback and algorithmic explanations.
- **Student Study Notes**: Dedicated notes tab that saves personal insights directly to your account.

### 4. User Authentication & Progress Tracking
- **JWT Stateless Security**: Token-based authentication using HMAC-SHA256.
- **Progress Tracking**: Mark problems as *Not Started*, *In Progress*, or *Solved*.
- **Bookmarks**: Star any question to save it to your bookmarks list.
- **Learning Metrics Dashboard**: Total solved counter, completion percentage, difficulty distribution (Easy, Medium, Hard), and topic proficiency bars.
- **Streak Counter**: Daily problem-solving flame indicator (🔥).

### 5. Admin Management Portal
- Restricted to users with `ROLE_ADMIN`.
- Real-time catalog analytics: Total Questions, Registered Users, Categories, and Quiz Attempts.
- Full CRUD operations: Create new DSA questions, edit problem statements, update visualization step timelines, or delete questions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA / Hibernate |
| **Security** | Spring Security 6, JJWT (io.jsonwebtoken 0.12.5), BCrypt Password Hashing |
| **Database** | MySQL 8.0 (`animated_dsa`) with auto-reconnect, HikariCP pool |
| **Frontend** | Semantic HTML5, Vanilla CSS3 (Custom Design System, Glassmorphism, Dark Mode), Vanilla ES6+ JavaScript |
| **Build Tool** | Apache Maven 3.9.6 / `mvnw.cmd` wrapper |

---

## 📁 Layered Architecture & Project Structure

```
AnimatedDsaExplanation/
├── mvnw.cmd                              # Portable Maven wrapper
├── pom.xml                               # Maven project dependencies
├── README.md                             # Documentation and setup guide
└── src/
    ├── main/
    │   ├── java/com/animateddsa/
    │   │   ├── AnimatedDsaApplication.java   # Spring Boot entry point
    │   │   ├── config/                       # Security, JWT, and Data Seeder
    │   │   │   ├── DataInitializer.java      # Seeds users, categories, questions, quizzes
    │   │   │   ├── CustomUserDetailsService.java
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   ├── JwtTokenProvider.java
    │   │   │   └── SecurityConfig.java
    │   │   ├── controller/                   # REST API Controllers
    │   │   │   ├── AuthController.java       # /api/auth/*
    │   │   │   ├── CategoryController.java   # /api/categories/*
    │   │   │   ├── QuestionController.java   # /api/questions/*
    │   │   │   ├── ProgressController.java   # /api/progress/*
    │   │   │   ├── BookmarkController.java   # /api/bookmarks/*
    │   │   │   ├── QuizController.java       # /api/quizzes/*
    │   │   │   └── AdminController.java      # /api/admin/*
    │   │   ├── dto/                          # Request & Response Transfer Objects
    │   │   ├── entity/                       # JPA Database Entities
    │   │   │   ├── User.java
    │   │   │   ├── Category.java
    │   │   │   ├── Question.java
    │   │   │   ├── Bookmark.java
    │   │   │   ├── UserProgress.java
    │   │   │   ├── Quiz.java
    │   │   │   ├── QuizQuestion.java
    │   │   │   └── QuizAttempt.java
    │   │   ├── repository/                   # Spring Data JPA Repositories
    │   │   └── service/                      # Business Logic Layer
    │   └── resources/
    │       ├── application.properties        # MySQL and JWT configuration
    │       └── static/                       # Production Web Assets
    │           ├── index.html                # Main Single Page App structure
    │           ├── css/
    │           │   ├── main.css              # Dark theme design system & tokens
    │           │   └── visualizer.css        # Visualizer studio & data structure styles
    │           └── js/
    │               ├── api.js                # REST client & JWT handler
    │               ├── app.js                # Routing, views, search, quizzes & dashboard
    │               └── visualizer/
    │                   ├── Renderers.js      # Array, list, stack, queue, tree, graph renderers
    │                   └── VisualizerEngine.js # Playback timeline & custom input generator
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
1. **Java JDK 21** installed and configured on your `PATH`.
2. **MySQL Server 8.0** running on `localhost:3306`.

### Database Configuration
Ensure MySQL has a database named `animated_dsa` (the application will also create it automatically if permitted):
```sql
CREATE DATABASE IF NOT EXISTS animated_dsa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Check `src/main/resources/application.properties` to ensure your local MySQL credentials match:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/animated_dsa?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=Kartik@2005
```

### Running the Application
From the project root directory, run:
```bash
# Using the provided Maven wrapper:
.\mvnw.cmd spring-boot:run

# Or with system Maven:
mvn spring-boot:run
```

Once started, open your web browser and navigate to:
👉 **`http://localhost:8080`**

---

## 👥 Default Demo Credentials

The platform automatically seeds demo accounts for immediate testing:

| Role | Username | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin` | `Admin@123` | Full access, Admin Portal, Question CRUD, Analytics |
| **Student** | `student` | `Student@123` | Progress tracking, bookmarks, notes, quiz submissions |

> **Pro-Tip**: In the **Sign In** modal, click the **"👑 Admin Demo"** or **"🎓 Student Demo"** quick-fill buttons to log in with a single click!

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `GET` | `/api/categories` | Public | Retrieve all 12 DSA topics |
| `GET` | `/api/questions` | Public | Search and filter questions by category/difficulty |
| `GET` | `/api/questions/{idOrSlug}` | Public | Get full question detail & visualizer steps |
| `GET` | `/api/progress/stats` | Authenticated | Get student learning metrics & topic percentages |
| `PUT` | `/api/progress/{questionId}` | Authenticated | Update question status (`SOLVED`/`IN_PROGRESS`) and notes |
| `GET` | `/api/bookmarks` | Authenticated | List all favorited questions |
| `POST` | `/api/bookmarks/{questionId}/toggle` | Authenticated | Bookmark / unbookmark question |
| `GET` | `/api/quizzes` | Public | List all available algorithmic quizzes |
| `GET` | `/api/quizzes/by-question/{questionId}` | Public | Get quiz for specific question |
| `POST` | `/api/quizzes/submit` | Authenticated | Submit quiz answers and receive score + review |
| `GET` | `/api/admin/stats` | `ROLE_ADMIN` | View administrative analytics |
| `POST` | `/api/admin/questions` | `ROLE_ADMIN` | Create a new DSA question |
| `PUT` | `/api/admin/questions/{id}` | `ROLE_ADMIN` | Update an existing DSA question |
| `DELETE` | `/api/admin/questions/{id}` | `ROLE_ADMIN` | Delete question from catalog |

---

## 🎨 Design Philosophy
- **Modern Dark Obsidian Aesthetic**: Tailored deep background tones (`#0a0e17`, `#0f172a`, `#1e293b`) with vibrant cyan, indigo, and emerald accents.
- **Glassmorphic Depth**: Backdrop blur filters, translucent cards, and smooth hover micro-interactions.
- **Developer-Centric Typography**: `Outfit` for bold headings, `Inter` for crisp body copy, and `JetBrains Mono` / `Fira Code` for code blocks and data structures.
- **Zero Incomplete Mockups**: Every button, tab, playback control, slider, filter, and form is wired to working logic.
