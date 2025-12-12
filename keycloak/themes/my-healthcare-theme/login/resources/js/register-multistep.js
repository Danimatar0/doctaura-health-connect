// Multi-step Registration Form Handler
import { MOCK_COUNTRIES } from './mock_countries.js';
import { MOCK_SPECIALTIES } from './mock_specialties.js';
import { MOCK_GOVERNORATES } from './mock_governorates.js';
import { MOCK_DISTRICTS } from './mock_districts.js';
import { MOCK_LOCALITIES } from './mock_localities.js';

let currentStep = 1;
const totalSteps = 3;

// Configuration - Load from config.js (window.DoctauraConfig)
const API_BASE_URL = window.DoctauraConfig?.apiBaseUrl || "https://your-dotnet-api.onrender.com/api/public";
const USE_MOCK_DATA = window.DoctauraConfig?.features?.useMockData || false;
const ENABLE_DEBUG = window.DoctauraConfig?.features?.enableDebugLogs || false;

// Helper function for logging
function debugLog(message, data) {
  if (ENABLE_DEBUG) {
    if (data) {
      console.log(`[Doctaura Registration] ${message}`, data);
    } else {
      console.log(`[Doctaura Registration] ${message}`);
    }
  }
}

// Input validation and sanitization
function sanitizeDropdownValue(value) {
    // Remove any non-numeric characters except empty string
    if (!value || value === "") return "";
    const sanitized = value.toString().replace(/[^0-9]/g, "");
    return sanitized;
  }

  function validateNumericId(value, fieldName) {
    if (!value || value === "") return true; // Empty is valid (optional fields)

    const sanitized = sanitizeDropdownValue(value);
    const numericValue = parseInt(sanitized, 10);

    if (isNaN(numericValue) || numericValue <= 0) {
      debugLog(`Invalid ${fieldName}: must be a positive number`, value);
      return false;
    }

    return true;
  }

  function validateDropdownSelection(selectElement, fieldName) {
    if (!selectElement) return false;

    const value = selectElement.value;

    // If empty and field is optional, it's valid
    if (!value || value === "") return true;

    // Validate it's numeric
    if (!validateNumericId(value, fieldName)) {
      return false;
    }

    // Check if value exists in dropdown options
    const options = Array.from(selectElement.options);
    const isValidOption = options.some(opt => opt.value === value);

    if (!isValidOption) {
      debugLog(`Invalid ${fieldName}: value not in dropdown options`, value);
      return false;
    }

    return true;
  }

// Security check - validate legitimate client access
function validateClientAccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("client_id");
  const codeChallenge = urlParams.get("code_challenge");
  const kcRole = urlParams.get("kc_role");
  const ALLOWED_CLIENTS = ["doctaura-app"];
  const isAllowedClient = ALLOWED_CLIENTS.includes(clientId);

  // Log all parameters for debugging
  console.log("[Doctaura Registration] Validating client access:", {
    clientId,
    hasCodeChallenge: !!codeChallenge,
    kcRole,
    isAllowedClient,
    allParams: Object.fromEntries(urlParams)
  });

  // Check if this is a legitimate client application request
  // Must have client_id and kc_role (code_challenge only present during OAuth flow)
  const isLegitimateClientRequest = clientId && kcRole && isAllowedClient;

  if (!isLegitimateClientRequest) {
    // Hide registration form
    const registrationContainer = document.getElementById(
      "registration-form-container"
    );
    if (registrationContainer) {
      registrationContainer.style.display = "none";
    }

    // Show unauthorized access message
    const unauthorizedContainer = document.getElementById(
      "unauthorized-access"
    );
    if (unauthorizedContainer) {
      unauthorizedContainer.style.display = "block";
    }

    console.error(
      "[Doctaura Registration] Unauthorized registration attempt - missing required parameters:",
      { clientId, kcRole, isAllowedClient }
    );
    return false;
  }

  console.log("[Doctaura Registration] Legitimate client request validated - registration enabled");
  return true;
}

  async function loadCountries() {
    const countrySelect = document.querySelector(
      'select[name="user.attributes.country"]'
    );
    if (!countrySelect) return;

    try {
      // Try fetching from API first
      const response = await fetch(`${API_BASE_URL}/countries`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} when fetching countries`
        );
      }

      const countries = await response.json();
      countrySelect.innerHTML = '<option value="">Select Country</option>';

      countries.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.id;
        option.textContent = country.name;
        countrySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading countries from API, using mock data:", error);

      // Use inline mock data as fallback
      countrySelect.innerHTML = '<option value="">Select Country</option>';
      MOCK_COUNTRIES.forEach((country) => {
        const option = document.createElement("option");
        option.value = country.id;
        option.textContent = country.name;
        countrySelect.appendChild(option);
      });
      debugLog("Loaded countries from inline mock data", MOCK_COUNTRIES);
    }
  }

  async function loadSpecialties() {
    const specialtySelect = document.getElementById("specialty-select");
    if (!specialtySelect) return;

    try {
      // Try fetching from API first
      const response = await fetch(`${API_BASE_URL}/specialties`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} when fetching specialties`
        );
      }

      const specialties = await response.json();
      specialtySelect.innerHTML = '<option value="">Select Specialty</option>';

      specialties.forEach((specialty) => {
        const option = document.createElement("option");
        option.value = specialty.id;
        option.textContent = specialty.name;
        specialtySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading specialties from API, using mock data:", error);

      // Use inline mock data as fallback
      specialtySelect.innerHTML = '<option value="">Select Specialty</option>';
      MOCK_SPECIALTIES.forEach((specialty) => {
        const option = document.createElement("option");
        option.value = specialty.id;
        option.textContent = specialty.name;
        specialtySelect.appendChild(option);
      });
      debugLog("Loaded specialties from inline mock data", MOCK_SPECIALTIES);
    }
  }

  // Load governorates from API (with fallback to mock data)
  async function loadGovernorates() {
    const governorateSelect = document.getElementById("governorate-select");
    if (!governorateSelect) return;

    try {
      // Try fetching from API first
      const response = await fetch(`${API_BASE_URL}/locations/governorates`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} when fetching governorates`
        );
      }

      const governorates = await response.json();
      governorateSelect.innerHTML = '<option value="">Select Governorate</option>';

      governorates.forEach((governorate) => {
        const option = document.createElement("option");
        option.value = governorate.id;
        option.textContent = governorate.name;
        governorateSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading governorates from API, using mock data:", error);

      // Use inline mock data as fallback
      governorateSelect.innerHTML = '<option value="">Select Governorate</option>';
      MOCK_GOVERNORATES.forEach((governorate) => {
        const option = document.createElement("option");
        option.value = governorate.id;
        option.textContent = governorate.name;
        governorateSelect.appendChild(option);
      });
      debugLog("Loaded governorates from inline mock data", MOCK_GOVERNORATES);
    }
  }

  // Load districts based on selected governorate (with fallback to mock data)
  async function loadDistricts(governorateId) {
    const districtSelect = document.getElementById("district-select");
    const localitySelect = document.getElementById("locality-select");

    if (!districtSelect) return;

    // Reset district and locality dropdowns
    districtSelect.innerHTML = '<option value="">Loading districts...</option>';
    districtSelect.disabled = true;
    localitySelect.innerHTML = '<option value="">Select District First</option>';
    localitySelect.disabled = true;

    if (!governorateId) {
      districtSelect.innerHTML = '<option value="">Select Governorate First</option>';
      return;
    }

    try {
      // Try fetching from API first
      const response = await fetch(
        `${API_BASE_URL}/governorates/${governorateId}/districts`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} when fetching districts`
        );
      }

      const districts = await response.json();
      districtSelect.innerHTML = '<option value="">Select District</option>';

      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district.id;
        option.textContent = district.name;
        districtSelect.appendChild(option);
      });

      districtSelect.disabled = false;
    } catch (error) {
      console.error("Error loading districts from API, using mock data:", error);

      // Use inline mock data as fallback
      // Filter districts by parentId (governorateId)
      const districts = MOCK_DISTRICTS.filter(
        (district) => district.parentId === parseInt(governorateId, 10)
      );

      districtSelect.innerHTML = '<option value="">Select District</option>';

      if (districts.length === 0) {
        districtSelect.innerHTML = '<option value="">No districts available</option>';
      } else {
        districts.forEach((district) => {
          const option = document.createElement("option");
          option.value = district.id;
          option.textContent = district.name;
          districtSelect.appendChild(option);
        });
        districtSelect.disabled = false;
      }
      debugLog("Loaded districts from inline mock data", districts);
    }
  }

  // Load localities based on selected district (with fallback to mock data)
  async function loadLocalities(districtId) {
    const localitySelect = document.getElementById("locality-select");

    if (!localitySelect) return;

    localitySelect.innerHTML = '<option value="">Loading localities...</option>';
    localitySelect.disabled = true;

    if (!districtId) {
      localitySelect.innerHTML = '<option value="">Select District First</option>';
      return;
    }

    try {
      // Try fetching from API first
      const response = await fetch(
        `${API_BASE_URL}/districts/${districtId}/localities`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} when fetching localities`
        );
      }

      const localities = await response.json();
      localitySelect.innerHTML = '<option value="">Select Locality</option>';

      localities.forEach((locality) => {
        const option = document.createElement("option");
        option.value = locality.id;
        option.textContent = locality.name;
        localitySelect.appendChild(option);
      });

      localitySelect.disabled = false;
    } catch (error) {
      console.error("Error loading localities from API, using mock data:", error);

      // Use inline mock data as fallback
      // Filter localities by parentId (districtId)
      const localities = MOCK_LOCALITIES.filter(
        (locality) => locality.parentId === parseInt(districtId, 10)
      );

      localitySelect.innerHTML = '<option value="">Select Locality</option>';

      if (localities.length === 0) {
        localitySelect.innerHTML = '<option value="">No localities available</option>';
      } else {
        localities.forEach((locality) => {
          const option = document.createElement("option");
          option.value = locality.id;
          option.textContent = locality.name;
          localitySelect.appendChild(option);
        });
        localitySelect.disabled = false;
      }
      debugLog("Loaded localities from inline mock data", localities);
    }
  }

  // Setup cascading dropdown listeners
  function setupCascadingDropdowns() {
    const governorateSelect = document.getElementById("governorate-select");
    const districtSelect = document.getElementById("district-select");

    if (governorateSelect) {
      governorateSelect.addEventListener("change", function (e) {
        const governorateId = sanitizeDropdownValue(e.target.value);

        // Validate the selection
        if (!validateDropdownSelection(governorateSelect, "governorateId")) {
          // Reset to empty if invalid
          governorateSelect.value = "";
          return;
        }

        loadDistricts(governorateId);
      });
    }

    if (districtSelect) {
      districtSelect.addEventListener("change", function (e) {
        const districtId = sanitizeDropdownValue(e.target.value);

        // Validate the selection
        if (!validateDropdownSelection(districtSelect, "districtId")) {
          // Reset to empty if invalid
          districtSelect.value = "";
          return;
        }

        loadLocalities(districtId);
      });
    }
  }

  function initializeRole() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get("kc_role") || "patient";

    // console.log('User desired role:', role);

    // Update hidden input
    const roleInput = document.getElementById("role-input");
    if (roleInput) {
      roleInput.value = role;
    }

    // Update UI based on role
    if (role === "doctor") {
      const roleTitle = document.getElementById("role-title");
      const roleDesc = document.getElementById("role-description");
      const iconPatient = document.getElementById("icon-patient");
      const iconPatientCircle = document.getElementById("icon-patient-circle");
      const iconDoctor = document.getElementById("icon-doctor");
      const doctorFields = document.getElementById("doctor-fields");
      const patientFields = document.getElementById("patient-fields");

      if (roleTitle) roleTitle.textContent = "Register as Doctor";
      if (roleDesc)
        roleDesc.textContent = "Create your professional medical account";

      if (iconPatient) iconPatient.style.display = "none";
      if (iconPatientCircle) iconPatientCircle.style.display = "none";
      if (iconDoctor) iconDoctor.style.display = "block";

      if (doctorFields) doctorFields.style.display = "block";
      if (patientFields) patientFields.style.display = "none";

      // Make doctor fields required
      const specialtySelect = document.getElementById("specialty-select");
      const doctorInputs = document.querySelectorAll(
        '#doctor-fields input[type="text"]'
      );
      const fileUpload = document.getElementById("medical-cert-upload");

      if (specialtySelect) specialtySelect.required = true;
      if (fileUpload) fileUpload.required = true;

      doctorInputs.forEach((input) => {
        input.required = true;
      });
    }
  }

  // File upload handler
  function initializeFileUpload() {
    const fileInput = document.getElementById("medical-cert-upload");
    const fileError = document.getElementById("file-upload-error");
    const hiddenFileData = document.getElementById("medical-cert-data");

    if (fileInput) {
      fileInput.addEventListener("change", function (e) {
        const file = e.target.files[0];

        if (!file) return;

        // Validate file type
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        const allowedExtensions = [".pdf", ".doc", ".docx"];
        const fileExtension = "." + file.name.split(".").pop().toLowerCase();

        if (
          !allowedTypes.includes(file.type) &&
          !allowedExtensions.includes(fileExtension)
        ) {
          fileError.textContent =
            "Invalid file type. Only PDF, DOC, and DOCX files are allowed.";
          fileError.style.display = "block";
          fileInput.value = "";
          return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          fileError.textContent =
            "File size exceeds 5MB. Please upload a smaller file.";
          fileError.style.display = "block";
          fileInput.value = "";
          return;
        }

        // Convert to base64 and store in hidden field
        const reader = new FileReader();
        reader.onload = function (event) {
          // Store base64 data with filename
          const base64Data = event.target.result;
          const fileData = JSON.stringify({
            filename: file.name,
            data: base64Data,
            size: file.size,
            type: file.type,
          });

          if (hiddenFileData) {
            hiddenFileData.value = fileData;
          }

          fileError.style.display = "none";
          console.log("File uploaded successfully:", file.name);
        };

        reader.onerror = function () {
          fileError.textContent = "Error reading file. Please try again.";
          fileError.style.display = "block";
        };

        reader.readAsDataURL(file);
      });
    }
  }

  function showStep(step) {
    const steps = document.querySelectorAll(".form-step");
    steps.forEach((s) => (s.style.display = "none"));

    const currentStepElement = document.querySelector(
      `.form-step[data-step="${step}"]`
    );
    if (currentStepElement) {
      currentStepElement.style.display = "block";
    }

    updateProgressIndicator(step);
    updateButtons(step);
  }

  function updateProgressIndicator(step) {
    const indicators = document.querySelectorAll(".step-indicator");
    indicators.forEach((indicator, index) => {
      const stepNum = index + 1;
      const circle = indicator.querySelector(".step-circle");

      if (stepNum < step) {
        indicator.classList.add("completed");
        indicator.classList.remove("active");
        circle.style.background = "#10b981";
        circle.style.color = "white";
      } else if (stepNum === step) {
        indicator.classList.add("active");
        indicator.classList.remove("completed");
        circle.style.background = "#0891b2";
        circle.style.color = "white";
      } else {
        indicator.classList.remove("active", "completed");
        circle.style.background = "#e5e7eb";
        circle.style.color = "#9ca3af";
      }
    });

    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
      const progress = ((step - 1) / (totalSteps - 1)) * 100;
      progressBar.style.width = progress + "%";
    }
  }

  function updateButtons(step) {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    if (!prevBtn || !nextBtn || !submitBtn) return;

    prevBtn.style.display = step === 1 ? "none" : "block";

    if (step === totalSteps) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "block";
    } else {
      nextBtn.style.display = "block";
      submitBtn.style.display = "none";
    }
  }

  function validateStep(step) {
    const currentStepElement = document.querySelector(
      `.form-step[data-step="${step}"]`
    );
    if (!currentStepElement) return true;

    const inputs = currentStepElement.querySelectorAll(
      "input[required], select[required]"
    );
    let isValid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = "#ef4444";
      } else {
        input.style.borderColor = "#e5e7eb";
      }
    });

    if (step === 1) {
      const email = document.getElementById("email");
      const password = document.getElementById("password");
      const passwordConfirm = document.getElementById("password-confirm");

      if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
          email.style.borderColor = "#ef4444";
          alert("Please enter a valid email address");
          return false;
        }
      }

      if (password && passwordConfirm) {
        if (password.value !== passwordConfirm.value) {
          passwordConfirm.style.borderColor = "#ef4444";
          alert("Passwords do not match");
          return false;
        }
      }
    }

    // Validate location dropdowns on step 2
    if (step === 2) {
      const governorateSelect = document.getElementById("governorate-select");
      const districtSelect = document.getElementById("district-select");
      const localitySelect = document.getElementById("locality-select");

      // Validate governorate if selected
      if (governorateSelect && governorateSelect.value) {
        if (!validateDropdownSelection(governorateSelect, "governorateId")) {
          governorateSelect.style.borderColor = "#ef4444";
          alert("Invalid governorate selection. Please select a valid option.");
          return false;
        }
        governorateSelect.style.borderColor = "#e5e7eb";
      }

      // Validate district if selected
      if (districtSelect && districtSelect.value && !districtSelect.disabled) {
        if (!validateDropdownSelection(districtSelect, "districtId")) {
          districtSelect.style.borderColor = "#ef4444";
          alert("Invalid district selection. Please select a valid option.");
          return false;
        }
        districtSelect.style.borderColor = "#e5e7eb";
      }

      // Validate locality if selected
      if (localitySelect && localitySelect.value && !localitySelect.disabled) {
        if (!validateDropdownSelection(localitySelect, "localityId")) {
          localitySelect.style.borderColor = "#ef4444";
          alert("Invalid locality selection. Please select a valid option.");
          return false;
        }
        localitySelect.style.borderColor = "#e5e7eb";
      }
    }

    // Validate doctor fields on step 3
    if (step === 3) {
      const roleInput = document.getElementById("role-input");
      if (roleInput && roleInput.value === "doctor") {
        const fileInput = document.getElementById("medical-cert-upload");
        if (fileInput && fileInput.required && !fileInput.files.length) {
          alert("Please upload your medical certification document");
          fileInput.style.borderColor = "#ef4444";
          return false;
        }
      }
    }

    if (!isValid) {
      alert("Please fill in all required fields");
    }

    return isValid;
  }

  function changeStep(direction) {
    if (direction === 1 && !validateStep(currentStep)) {
      return;
    }

    const newStep = currentStep + direction;

    if (newStep >= 1 && newStep <= totalSteps) {
      currentStep = newStep;
      showStep(currentStep);
    }
  }

  // Expose changeStep globally for onclick handlers
  window.changeStep = changeStep;

  // Final form validation before submission
  function setupFormValidation() {
    const form = document.getElementById("kc-register-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      const governorateSelect = document.getElementById("governorate-select");
      const districtSelect = document.getElementById("district-select");
      const localitySelect = document.getElementById("locality-select");

      // Prevent submission if disabled fields have values (manipulation attempt)
      if (districtSelect && districtSelect.disabled && districtSelect.value) {
        e.preventDefault();
        alert("Invalid form state detected. Please refresh and try again.");
        debugLog("Form manipulation detected: district has value but is disabled");
        return false;
      }

      if (localitySelect && localitySelect.disabled && localitySelect.value) {
        e.preventDefault();
        alert("Invalid form state detected. Please refresh and try again.");
        debugLog("Form manipulation detected: locality has value but is disabled");
        return false;
      }

      // Final validation of all location dropdowns
      if (governorateSelect && governorateSelect.value) {
        if (!validateDropdownSelection(governorateSelect, "governorateId")) {
          e.preventDefault();
          alert("Invalid governorate selection.");
          return false;
        }
      }

      if (districtSelect && districtSelect.value && !districtSelect.disabled) {
        if (!validateDropdownSelection(districtSelect, "districtId")) {
          e.preventDefault();
          alert("Invalid district selection.");
          return false;
        }
      }

      if (localitySelect && localitySelect.value && !localitySelect.disabled) {
        if (!validateDropdownSelection(localitySelect, "localityId")) {
          e.preventDefault();
          alert("Invalid locality selection.");
          return false;
        }
      }

      debugLog("Form validation passed - submitting registration");
    });
  }

  function init() {
    // First, validate client access
    const hasAccess = validateClientAccess();

    if (!hasAccess) {
      console.warn("Registration blocked - unauthorized access attempt");
      return; // Stop initialization if access is not legitimate
    }

    initializeRole(); // Initialize role first
    initializeFileUpload(); // Setup file upload handler
    loadCountries(); // Load countries from API
    loadGovernorates(); // Load governorates from API
    loadSpecialties(); // Load specialties from API
    setupCascadingDropdowns(); // Setup cascading dropdown listeners
    setupFormValidation(); // Setup final form validation
    showStep(1); // Then show first step
  }

// Initialize
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
