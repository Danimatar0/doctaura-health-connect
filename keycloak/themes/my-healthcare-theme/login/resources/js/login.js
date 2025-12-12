// Keycloak Login Page - Security and Enhancement Script
(function () {
  "use strict";

  /**
   * Security check - hide registration/forgot password if accessed without client context
   * This prevents unauthorized users from accessing registration through admin console
   */
  function validateAndSecureAccess() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const codeChallenge = urlParams.get("code_challenge");
    const clientId = urlParams.get("client_id");
    const ALLOWED_CLIENTS = ["doctaura-app"];
    const isAllowedClient = ALLOWED_CLIENTS.includes(clientId);

    // Check if this is a legitimate client application request
    // Must have both client_id and code_challenge (PKCE)
    const isLegitimateClientRequest = clientId && codeChallenge && isAllowedClient;

    if (!isLegitimateClientRequest) {
      // Hide registration link
      const registerContainer = document.getElementById("register-container");
      if (registerContainer) {
        registerContainer.style.display = "none";
      }

      // Hide forgot password link
      const forgotPasswordLink = document.getElementById(
        "forgot-password-link"
      );
      if (forgotPasswordLink) {
        forgotPasswordLink.style.display = "none";
      }

      // Hide social providers for registration
      const socialProvidersContainer = document.getElementById(
        "social-providers-container"
      );
      if (socialProvidersContainer) {
        socialProvidersContainer.style.display = "none";
      }

      // Adjust remember-me container to center if forgot password is hidden
      const rememberForgotContainer = document.getElementById(
        "remember-forgot-container"
      );
      if (rememberForgotContainer && !forgotPasswordLink) {
        rememberForgotContainer.style.justifyContent = "flex-start";
      }

      console.log(
        "Access without client context detected - registration and password reset disabled"
      );
    } else {
      console.log(
        "Legitimate client request detected - full functionality enabled"
      );
    }
  }

  /**
   * Toggle password visibility
   */
  function togglePassword() {
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eye-icon");
    const eyeOffIcon = document.getElementById("eye-off-icon");

    if (!passwordInput || !eyeIcon || !eyeOffIcon) return;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      eyeIcon.style.display = "none";
      eyeOffIcon.style.display = "block";
    } else {
      passwordInput.type = "password";
      eyeIcon.style.display = "block";
      eyeOffIcon.style.display = "none";
    }
  }

  /**
   * Enhanced focus effects for input fields
   */
  function initializeInputEffects() {
    const inputs = document.querySelectorAll(
      'input[type="text"], input[type="password"], input[type="email"]'
    );

    inputs.forEach((input) => {
      // Focus effect
      input.addEventListener("focus", function () {
        this.style.borderColor = "#0891b2";
        this.style.boxShadow = "0 0 0 3px rgba(8, 145, 178, 0.1)";
      });

      // Blur effect
      input.addEventListener("blur", function () {
        this.style.borderColor = "#e5e7eb";
        this.style.boxShadow = "none";
      });

      // Add smooth transition if not already present
      if (!input.style.transition) {
        input.style.transition = "border-color 0.2s, box-shadow 0.2s";
      }
    });
  }

  /**
   * Initialize remember me checkbox enhancement
   */
  function initializeRememberMe() {
    const rememberMeCheckbox = document.getElementById("rememberMe");
    if (rememberMeCheckbox) {
      rememberMeCheckbox.addEventListener("change", function () {
        if (this.checked) {
          console.log("Remember me enabled");
        } else {
          console.log("Remember me disabled");
        }
      });
    }
  }

  /**
   * Form validation before submission
   */
  function initializeFormValidation() {
    const loginForm = document.getElementById("kc-form-login");
    if (!loginForm) return;

    loginForm.addEventListener("submit", function (e) {
      const username = document.getElementById("username");
      const password = document.getElementById("password");

      let isValid = true;

      // Validate username
      if (username && !username.value.trim()) {
        username.style.borderColor = "#ef4444";
        isValid = false;
      }

      // Validate password
      if (password && !password.value) {
        password.style.borderColor = "#ef4444";
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();

        // Show error message if not already present
        const existingError = document.querySelector(
          ".validation-error-message"
        );
        if (!existingError) {
          const errorDiv = document.createElement("div");
          errorDiv.className = "validation-error-message";
          errorDiv.style.cssText =
            "padding: 0.75rem; margin-bottom: 1rem; background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; border-radius: 0.5rem; font-size: 0.875rem;";
          errorDiv.textContent = "Please fill in all required fields";

          const formWrapper = document.getElementById("kc-form-wrapper");
          if (formWrapper) {
            formWrapper.insertBefore(errorDiv, loginForm);
          }
        }
      }
    });
  }

  /**
   * Auto-focus username field on page load
   */
  function autoFocusUsername() {
    const username = document.getElementById("username");
    if (username && !username.value) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        username.focus();
      }, 100);
    }
  }

  /**
   * Keyboard shortcuts
   */
  function initializeKeyboardShortcuts() {
    document.addEventListener("keydown", function (e) {
      // Alt + P to toggle password visibility
      if (e.altKey && e.key === "p") {
        e.preventDefault();
        togglePassword();
      }
    });
  }

  /**
   * Initialize all features
   */
  function init() {
    console.log("Initializing Keycloak login enhancements...");

    // Run security validation first
    validateAndSecureAccess();

    // Initialize UI enhancements
    initializeInputEffects();
    initializeRememberMe();
    initializeFormValidation();
    initializeKeyboardShortcuts();
    autoFocusUsername();

    console.log("Login page initialization complete");
  }

  // Expose togglePassword globally for onclick handler in FTL
  window.togglePassword = togglePassword;

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
