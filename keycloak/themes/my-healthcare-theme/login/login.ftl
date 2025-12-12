<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>

    <#if section = "header">
        ${msg("loginAccountTitle")}
    <#elseif section = "form">
    
        <!-- Header with Icon -->
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #0891b2, #06b6d4); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <h2 style="font-size: 1.75rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem 0;">
                Welcome Back
            </h2>
            <p style="font-size: 0.95rem; color: #6b7280; margin: 0;">
                Sign in to your Doctaura account
            </p>
        </div>

        <!-- Error/Info Messages -->
        <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
            <div style="padding: 1rem; margin-bottom: 1.5rem; border-radius: 0.5rem; font-size: 0.875rem; 
                        <#if message.type = 'success'>background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;</#if>
                        <#if message.type = 'warning'>background: #fef3c7; border: 1px solid #fde68a; color: #92400e;</#if>
                        <#if message.type = 'error'>background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;</#if>
                        <#if message.type = 'info'>background: #f0f9ff; border: 1px solid #bae6fd; color: #0c4a6e;</#if>">
                <#if message.type = 'success'>
                    <strong>✓</strong>
                <#elseif message.type = 'warning'>
                    <strong>⚠</strong>
                <#elseif message.type = 'error'>
                    <strong>✕</strong>
                <#else>
                    <strong>ℹ</strong>
                </#if>
                ${kcSanitize(message.summary)?no_esc}
            </div>
        </#if>

        <!-- Login Form -->
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <#if realm.password>
                    <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                        
                        <!-- Username/Email Field -->
                        <div style="margin-bottom: 1.25rem;">
                            <label for="username" style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                <#if !realm.loginWithEmailAllowed>
                                    ${msg("username")}
                                <#elseif !realm.registrationEmailAsUsername>
                                    ${msg("usernameOrEmail")}
                                <#else>
                                    ${msg("email")}
                                </#if>
                            </label>
                            <input 
                                tabindex="1" 
                                id="username" 
                                name="username" 
                                value="${(login.username!'')}"  
                                type="text" 
                                autofocus 
                                autocomplete="username"
                                aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                style="width: 100%; padding: 0.75rem 1rem; font-size: 0.9375rem; border: 2px solid <#if messagesPerField.existsError('username','password')>#ef4444<#else>#e5e7eb</#if>; border-radius: 0.5rem; outline: none; transition: border-color 0.2s;"
                                onfocus="this.style.borderColor='#0891b2'"
                                onblur="this.style.borderColor='#e5e7eb'"
                            />
                            <#if messagesPerField.existsError('username','password')>
                                <span style="display: block; margin-top: 0.5rem; font-size: 0.75rem; color: #ef4444;">
                                    ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                                </span>
                            </#if>
                        </div>

                        <!-- Password Field -->
                        <div style="margin-bottom: 1.25rem;">
                            <label for="password" style="display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.5rem;">
                                ${msg("password")}
                            </label>
                            <div style="position: relative;">
                                <input 
                                    tabindex="2" 
                                    id="password" 
                                    name="password" 
                                    type="password" 
                                    autocomplete="current-password"
                                    aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
                                    style="width: 100%; padding: 0.75rem 1rem; padding-right: 3rem; font-size: 0.9375rem; border: 2px solid <#if messagesPerField.existsError('username','password')>#ef4444<#else>#e5e7eb</#if>; border-radius: 0.5rem; outline: none; transition: border-color 0.2s;"
                                    onfocus="this.style.borderColor='#0891b2'"
                                    onblur="this.style.borderColor='#e5e7eb'"
                                />
                                <button 
                                    type="button" 
                                    id="toggle-password"
                                    onclick="togglePassword()"
                                    style="position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 0.5rem; color: #6b7280;">
                                    <svg id="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                    <svg id="eye-off-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Remember Me & Forgot Password -->
                        <div id="remember-forgot-container" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <#if realm.rememberMe && !usernameHidden??>
                                <div style="display: flex; align-items: center;">
                                    <input 
                                        tabindex="3" 
                                        id="rememberMe" 
                                        name="rememberMe" 
                                        type="checkbox"
                                        <#if login.rememberMe??>checked</#if>
                                        style="width: 1rem; height: 1rem; border: 2px solid #e5e7eb; border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem;"
                                    />
                                    <label for="rememberMe" style="font-size: 0.875rem; color: #374151; cursor: pointer;">
                                        ${msg("rememberMe")}
                                    </label>
                                </div>
                            <#else>
                                <div></div>
                            </#if>
                            
                            <#if realm.resetPasswordAllowed>
                                <a id="forgot-password-link" href="${url.loginResetCredentialsUrl}" style="font-size: 0.875rem; color: #0891b2; text-decoration: none; font-weight: 600;">
                                    ${msg("doForgotPassword")}
                                </a>
                            </#if>
                        </div>

                        <!-- Hidden Fields -->
                        <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>

                        <!-- Submit Button -->
                        <div style="margin-bottom: 1.5rem;">
                            <input 
                                tabindex="4" 
                                name="login" 
                                id="kc-login" 
                                type="submit" 
                                value="${msg("doLogIn")}"
                                style="width: 100%; padding: 1rem 1.5rem; font-size: 1rem; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #0891b2, #06b6d4); border: none; border-radius: 0.5rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;"
                                onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(8, 145, 178, 0.3)'"
                                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                            />
                        </div>
                    </form>
                </#if>
            </div>

            <!-- Social Providers -->
            <#if realm.password && social.providers??>
                <div id="social-providers-container" style="margin-top: 2rem;">
                    <div style="position: relative; text-align: center; margin-bottom: 1.5rem;">
                        <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e5e7eb;"></div>
                        <span style="position: relative; background: white; padding: 0 1rem; font-size: 0.875rem; color: #6b7280;">
                            ${msg("identity-provider-login-label")}
                        </span>
                    </div>

                    <div id="kc-social-providers" style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <#list social.providers as p>
                            <a 
                                id="social-${p.alias}" 
                                href="${p.loginUrl}"
                                style="display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 0.875rem 1.5rem; font-size: 0.9375rem; font-weight: 600; color: #374151; background: white; border: 2px solid #e5e7eb; border-radius: 0.5rem; text-decoration: none; transition: all 0.2s;"
                                onmouseover="this.style.borderColor='#0891b2'; this.style.color='#0891b2'"
                                onmouseout="this.style.borderColor='#e5e7eb'; this.style.color='#374151'">
                                <#if p.iconClasses?has_content>
                                    <i class="${p.iconClasses}" aria-hidden="true"></i>
                                </#if>
                                <span>${p.displayName}</span>
                            </a>
                        </#list>
                    </div>
                </div>
            </#if>

            <!-- Register Link -->
            <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                <div id="register-container" style="margin-top: 2rem; text-align: center; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 0.875rem; margin: 0;">
                        ${msg("noAccount")} 
                        <a id="register-link" href="${url.registrationUrl}" style="color: #0891b2; text-decoration: none; font-weight: 600; margin-left: 0.25rem;">
                            ${msg("doRegister")}
                        </a>
                    </p>
                </div>
            </#if>
        </div>

        <!-- Include Login JavaScript -->
        <script src="${url.resourcesPath}/js/login.js"></script>

    </#if>
</@layout.registrationLayout>
