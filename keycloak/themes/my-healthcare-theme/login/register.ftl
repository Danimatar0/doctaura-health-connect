<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','email','firstName','lastName','password','password-confirm'); section>
    
    <#if section = "form">

        <!-- Security Check Container - Hidden by default, shown if access is unauthorized -->
        <div id="unauthorized-access" style="display: none; text-align: center; padding: 2rem;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            </div>
            <h2 style="font-size: 1.75rem; font-weight: 700; color: #111827; margin: 0 0 1rem 0;">
                Access Restricted
            </h2>
            <p style="font-size: 1rem; color: #6b7280; margin: 0 0 2rem 0; line-height: 1.6;">
                Registration is only available through the Doctaura application.<br>
                Direct registration access is not permitted for security reasons.
            </p>
            <a href="${url.loginUrl}" style="display: inline-block; padding: 1rem 2rem; font-size: 1rem; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #0891b2, #06b6d4); border-radius: 0.5rem; text-decoration: none; transition: transform 0.2s;">
                Go to Login
            </a>
        </div>

        <!-- Main Registration Form - Will be hidden if unauthorized -->
        <div id="registration-form-container">
            <!-- Role Header -->
            <div style="text-align: center; margin-bottom: 2rem;">
                <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #0891b2, #06b6d4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                        <!-- Default to patient icon, will be updated by JS -->
                        <path id="icon-patient" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle id="icon-patient-circle" cx="12" cy="7" r="4"></circle>
                        <path id="icon-doctor" d="M22 12h-4l-3 9L9 3l-3 9H2" style="display: none;"></path>
                    </svg>
                </div>
                <h2 id="role-title" style="font-size: 1.75rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
                    Register as Patient
                </h2>
                <p id="role-description" style="font-size: 0.95rem; color: #6b7280; margin: 0;">
                    Create your patient account to access healthcare services
                </p>
            </div>

            <!-- Progress Indicator -->
            <div id="progress-indicator" style="display: flex; justify-content: space-between; margin-bottom: 2rem; position: relative;">
                <div style="position: absolute; top: 15px; left: 0; right: 0; height: 2px; background: #e5e7eb; z-index: 0;"></div>
                <div id="progress-bar" style="position: absolute; top: 15px; left: 0; height: 2px; background: #0891b2; z-index: 0; width: 0%; transition: width 0.3s;"></div>
                
                <div class="step-indicator active" data-step="1" style="position: relative; z-index: 1; text-align: center; flex: 1;">
                    <div class="step-circle" style="width: 32px; height: 32px; border-radius: 50%; background: #0891b2; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; font-weight: 600; font-size: 0.875rem;">1</div>
                    <div style="font-size: 0.75rem; color: #6b7280;">Account</div>
                </div>
                <div class="step-indicator" data-step="2" style="position: relative; z-index: 1; text-align: center; flex: 1;">
                    <div class="step-circle" style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; color: #9ca3af; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; font-weight: 600; font-size: 0.875rem;">2</div>
                    <div style="font-size: 0.75rem; color: #6b7280;">Personal</div>
                </div>
                <div class="step-indicator" data-step="3" style="position: relative; z-index: 1; text-align: center; flex: 1;">
                    <div class="step-circle" style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; color: #9ca3af; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; font-weight: 600; font-size: 0.875rem;">3</div>
                    <div style="font-size: 0.75rem; color: #6b7280;">Details</div>
                </div>
            </div>

            <form id="kc-register-form" action="${url.registrationAction}" method="post" enctype="multipart/form-data">
                
                <!-- Hidden field for role - will be set by JavaScript -->
                <input type="hidden" id="role-input" name="user.attributes.role" value="patient" />
                
                <!-- Hidden field for medical certification (base64) -->
                <input type="hidden" id="medical-cert-data" name="user.attributes.medicalCertificationFile" value="" />

                <!-- STEP 1: Account Information -->
                <div class="form-step active" data-step="1">
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 1.5rem;">Account Information</h3>
                    
                    <!-- Username -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                            <span style="color: #ef4444;">*</span> Username
                        </label>
                        <input type="text" id="username" name="username" 
                               value="${(register.formData.username!'')}" 
                               style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" 
                               required />
                    </div>

                    <!-- Email -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                            <span style="color: #ef4444;">*</span> Email
                        </label>
                        <input type="email" id="email" name="email" 
                               value="${(register.formData.email!'')}" 
                               style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" 
                               required />
                    </div>

                    <!-- Password -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                            <span style="color: #ef4444;">*</span> Password
                        </label>
                        <input type="password" id="password" name="password" 
                               style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" 
                               required />
                    </div>

                    <!-- Confirm Password -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                            <span style="color: #ef4444;">*</span> Confirm Password
                        </label>
                        <input type="password" id="password-confirm" name="password-confirm" 
                               style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" 
                               required />
                    </div>
                </div>

                <!-- STEP 2: Personal Details -->
                <div class="form-step" data-step="2" style="display: none;">
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 1.5rem;">Personal Details</h3>
                    
                    <!-- First Name & Last Name -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                <span style="color: #ef4444;">*</span> First Name
                            </label>
                            <input type="text" id="firstName" name="firstName" 
                                   value="${(register.formData.firstName!'')}" 
                                   style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" 
                                   required />
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                <span style="color: #ef4444;">*</span> Last Name
                            </label>
                            <input type="text" id="lastName" name="lastName" 
                                   value="${(register.formData.lastName!'')}" 
                                   style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" 
                                   required />
                        </div>
                    </div>

                    <!-- Date of Birth & Gender -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                <span style="color: #ef4444;">*</span> Date of Birth
                            </label>
                            <input type="date" name="user.attributes.dateOfBirth" 
                                   style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" 
                                   required />
                        </div>
                        <div>
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                <span style="color: #ef4444;">*</span> Gender
                            </label>
                            <select name="user.attributes.gender" 
                                    style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" 
                                    required>
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <!-- Country (Loaded from API) -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                            <span style="color: #ef4444;">*</span> Country
                        </label>
                        <select id="country-select" name="user.attributes.country" 
                                style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" 
                                required>
                            <option value="">Loading countries...</option>
                        </select>
                    </div>

                    <!-- Governorate, District, Locality (Cascading Dropdowns) -->
                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                            Governorate (Optional)
                        </label>
                        <select id="governorate-select" name="user.attributes.governorateId"
                                style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;">
                            <option value="">Select Governorate</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                            District (Optional)
                        </label>
                        <select id="district-select" name="user.attributes.districtId"
                                style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;"
                                disabled>
                            <option value="">Select Governorate First</option>
                        </select>
                    </div>

                    <div style="margin-bottom: 1.25rem;">
                        <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                            Locality (Optional)
                        </label>
                        <select id="locality-select" name="user.attributes.localityId"
                                style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;"
                                disabled>
                            <option value="">Select District First</option>
                        </select>
                    </div>
                </div>

                <!-- STEP 3: Additional Details -->
                <div class="form-step" data-step="3" style="display: none;">
                    <h3 style="font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 1.5rem;">Additional Information</h3>
                    
                    <!-- Patient: Blood Type -->
                    <div id="patient-fields">
                        <div style="margin-bottom: 1.25rem;">
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                Blood Type (Optional)
                            </label>
                            <select name="user.attributes.bloodType" 
                                    style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;">
                                <option value="">Select Blood Type</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                            </select>
                        </div>
                    </div>

                    <!-- Doctor: Specialty & Certification -->
                    <div id="doctor-fields" style="display: none;">
                        <div style="margin-bottom: 1.25rem;">
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                <span style="color: #ef4444;">*</span> Medical Specialty
                            </label>
                            <select id="specialty-select" name="user.attributes.specialty" 
                                    style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;">
                                <option value="">Loading specialties...</option>
                            </select>
                        </div>

                        <div style="margin-bottom: 1.25rem;">
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                <span style="color: #ef4444;">*</span> Medical Certification Number
                            </label>
                            <input type="text" name="user.attributes.medicalCertification" 
                                   placeholder="e.g., MC123456"
                                   style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem;" />
                        </div>

                        <div style="margin-bottom: 1.25rem;">
                            <label style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                <span style="color: #ef4444;">*</span> Upload Medical Certification
                            </label>
                            <div style="position: relative;">
                                <input type="file" 
                                       id="medical-cert-upload" 
                                       accept=".pdf,.doc,.docx"
                                       style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; cursor: pointer;" />
                                <p id="file-upload-info" style="font-size: 0.75rem; color: #6b7280; margin: 0.5rem 0 0 0;">
                                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                                </p>
                                <p id="file-upload-error" style="font-size: 0.75rem; color: #ef4444; margin: 0.5rem 0 0 0; display: none;"></p>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 1rem; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 0.5rem; margin-bottom: 1.25rem;">
                        <p style="font-size: 0.875rem; color: #0c4a6e; margin: 0;">
                            <strong>Almost done!</strong> Review your information and click "Create Account" to complete registration.
                        </p>
                    </div>
                </div>

                <!-- Navigation Buttons -->
                <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                    <button type="button" id="prevBtn" onclick="changeStep(-1)" 
                            style="flex: 1; padding: 1rem 1.5rem; font-size: 1rem; font-weight: 600; color: #374151; background: #f3f4f6; border: none; border-radius: 0.5rem; cursor: pointer; display: none;">
                        Previous
                    </button>
                    <button type="button" id="nextBtn" onclick="changeStep(1)" 
                            style="flex: 1; padding: 1rem 1.5rem; font-size: 1rem; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #0891b2, #06b6d4); border: none; border-radius: 0.5rem; cursor: pointer;">
                        Next
                    </button>
                    <button type="submit" id="submitBtn" 
                            style="flex: 1; padding: 1rem 1.5rem; font-size: 1rem; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #0891b2, #06b6d4); border: none; border-radius: 0.5rem; cursor: pointer; display: none;">
                        Create Account
                    </button>
                </div>

                <!-- Back to Login -->
                <div style="margin-top: 1.5rem; text-align: center;">
                    <p style="color: #6b7280; font-size: 0.875rem;">
                        Already have an account? <a href="${url.loginUrl}" style="color: #0891b2; text-decoration: none; font-weight: 600;">Sign in</a>
                    </p>
                </div>
            </form>
        </div>

        <!-- Include configuration first -->
        <script src="${url.resourcesPath}/js/config.js"></script>

        <!-- Include the registration JavaScript as ES6 module -->
        <script type="module" src="${url.resourcesPath}/js/register-multistep.js?v=2.0.0"></script>

    </#if>
</@layout.registrationLayout>
