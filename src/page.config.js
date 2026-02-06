/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Curriculum from './pages/Curriculum';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Quiz from './pages/Quiz';
import QuizSetup from './pages/QuizSetup';
import Settings from './pages/Settings';
import Study from './pages/Study';
import YearSelection from './pages/YearSelection';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export const PAGES = {
    "Curriculum": Curriculum,
    "Dashboard": Dashboard,
    "Login": Login,
    "Quiz": Quiz,
    "QuizSetup": QuizSetup,
    "Settings": Settings,
    "Study": Study,
    "YearSelection": YearSelection,
    "Privacy": Privacy,
    "Terms": Terms
}

export const pagesConfig = {
    mainPage: "YearSelection",
    Pages: PAGES,
};