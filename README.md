# FIn-Plus Project

> A full-stack financial services web application built with React, Vite, Tailwind CSS, PostgreSQL, and Firebase.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This project is a modern, full-stack financial application. The frontend is built using **React** and **Vite** for a fast, responsive user interface, styled with **Tailwind CSS**. The backend consists of a **PostgreSQL** database, with Firebase integrated for handling user authentication.

---

## 💻 Tech Stack

* **Frontend:**
    * [React](https://reactjs.org/) (using `.jsx` components)
    * [Vite](https://vitejs.dev/) (Build Tool)
    * [Tailwind CSS](https://tailwindcss.com/) (Utility-First CSS Framework)
* **Backend & Database:**
    * [PostgreSQL](https://www.postgresql.org/) (inferred from `finPulse_noext.sql` and `PLpgSQL` language use)
* **Authentication:**
    * [Firebase](https://firebase.google.com/) (inferred from `firebaseClient.js`)
* **Scripting/Tooling:**
    * [Node.js](https://nodejs.org/) (Runtime)
    * [PowerShell](https://learn.microsoft.com/en-us/powershell/) (for database setup script `setup_database.ps1`)

---

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

You will need the following software installed on your machine:
* [Node.js](https://nodejs.org/) (which includes npm)
* [PostgreSQL](https://www.postgresql.org/download/)
* A [Firebase Project](https://firebase.google.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/BUGHUNTER-SACHIN/FIn-Plus-project.git](https://github.com/BUGHUNTER-SACHIN/FIn-Plus-project.git)
    cd FIn-Plus-project
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the PostgreSQL Database:**
    * Make sure your PostgreSQL server is running.
    * Create a new database.
    * You can either run the `setup_database.ps1` PowerShell script or manually execute the SQL commands found in `finPulse_noext.sql` to populate your database schema.

4.  **Configure Firebase:**
    * Go to your Firebase project settings and find your web app's configuration object.
    * This configuration will likely need to be added to `firebaseClient.js` or a similar configuration file. (Note: Sensitive keys should not be hard-coded for production.)

5.  **Run the development server:**
    * The `vite.config.js` file suggests this project uses Vite. The standard command to run it is:
    ```bash
    npm run dev
    ```
    * Open your browser and navigate to the local URL provided (usually `http://localhost:5173`).

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
