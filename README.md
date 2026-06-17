# Umrah Tracker Application

A comprehensive mobile-responsive web application designed to help pilgrims track their worship activities, manage daily checklists, and access spiritual resources during their Umrah journey.

## ✨ Features

- **📊 Dashboard:** Overview of your Umrah progress and quick access to trackers.
- **🕋 Tawaf & Sa'i Tracker:** Real-time counter for Tawaf and Sa'i circuits with persistence.
- **✅ Checklist System:** Preparation guides and daily worship checklists.
- **📅 Planning:** Integrated itinerary and activity planning.
- **📖 Quran & Duas:** Interactive Quran page and categorized Duas (fetched via API & static data).
- **🔔 Reminders:** Custom notifications for prayer times and activities.
- **👨‍👩‍👧 Groups:** Family sharing and group monitoring for group leaders.
- **🔐 Authentication:** Secure login/registration and **Google Login (Gmail)** (Coming Soon).

---

## 🚀 Installation Guide

### Prerequisites
- **PHP 8.2+**
- **Node.js & NPM**
- **Composer**
- **Database:** MySQL (default).

### Steps to Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd umrah-tracker
   ```

2. **Install PHP Dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update database credentials in `.env`:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=umrah_tracker
     DB_USERNAME=root
     DB_PASSWORD=your_password
     ```
   - Configure **Google Auth** (Gmail login):
     ```env
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
     ```

5. **Generate App Key**
   ```bash
   php artisan key:generate
   ```

6. **Run Migrations**
   ```bash
   php artisan migrate
   ```

7. **Compile Assets & Start Development Server**
   - Open two terminals:
     - Terminal 1 (Vite): `npm run dev`
     - Terminal 2 (Laravel): `php artisan serve`

---

## 📖 Usage Guide

### 1. Authentication
- **Traditional:** Use the email/password form to register and log in.
- **Gmail Login:** Click the **"Masuk dengan Google"** button on the login page for instant access.

### 2. Tracking Worship
- Navigate to the **Tawaf** or **Sa'i** tracker from the Dashboard.
- Tap the "Count" button after each circuit. The app will automatically save your progress.
- Once completed (7 circuits), mark as finished.

### 3. Using the Checklist
- Go to the **Checklist** menu.
- Check off items as you prepare for your journey or complete daily tasks.

### 4. Reading Quran & Duas
- Access the **Al-Quran** page for digital reading.
- The **Duas** page includes Umrah-specific prayers and general daily supplications with search and favorite functionality.

### 5. Group Management (For Leaders)
- Create or join a group in the **Groups** menu.
- Monitor the progress of members for safety and synchronization.

---

## 🛠 Tech Stack
- **Backend:** Laravel 12 (PHP)
- **Frontend:** React.js, Vite
- **Styling:** CSS3 (Custom Glass-morphism Design)
- **Auth:** Laravel Sanctum & Laravel Socialite (Google)
- **Icons:** Lucide React

Developed with ❤️ for pilgrims.

---

## 🙏 Special Thanks

Special thanks to the following providers for their invaluable contributions to this project:

- **[EQuran.id](https://equran.id)**: For providing the free and comprehensive public APIs for Al-Quran and Doa (Supplications).
- **The Open Source Community**: For the amazing libraries and tools that made this development possible.
