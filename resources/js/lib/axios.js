import axios from "axios";

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common["Accept"] = "application/json";
axios.defaults.headers.common["Content-Type"] = "application/json";

// Set CSRF token when DOM is ready
const setCsrfToken = () => {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
    if (token) {
        axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
    }
};

// Set token immediately if DOM is ready, otherwise wait
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setCsrfToken);
} else {
    setCsrfToken();
}

export default axios;
