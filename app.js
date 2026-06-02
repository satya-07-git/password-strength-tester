/* -------------------------------------------------------------
 * FortressPass JavaScript - Strength Analyzer & Gauge Core
 * Real-time entropy evaluation, k-Anonymity breach detection,
 * dynamic theme shifting, and a premium radial level meter.
 * ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const eyeOpenIcon = togglePasswordBtn.querySelector('.icon-eye-open');
    const eyeClosedIcon = togglePasswordBtn.querySelector('.icon-eye-closed');

    // Gauge Elements
    const radialFill = document.getElementById('radial-fill');
    const meterPercent = document.getElementById('meter-percent');
    const meterLevel = document.getElementById('meter-level');

    // Metric Elements
    const entropyScoreDisplay = document.getElementById('entropy-score');
    const timeOfflineFast = document.getElementById('time-offline-fast');

    // Breach elements
    const pwnedStatusCard = document.getElementById('pwned-status-card');
    const pwnedHeadline = document.getElementById('pwned-headline');
    const pwnedDescription = document.getElementById('pwned-description');

    // Feedback elements
    const warningBox = document.getElementById('strength-warning');
    const warningText = document.getElementById('warning-text');
    const suggestionsBox = document.getElementById('suggestions-box');
    const suggestionsList = document.getElementById('suggestions-list');

    // Global Constants for Radial Meter
    // Circumference = 2 * PI * r = 2 * 3.14159 * 68 = 427.25
    const MAX_OFFSET = 427.2;
    let hiberDebounceTimer = null;

    // Theme Configs (Harmonious Pastel Themes matching Strength Scores)
    const themes = {
        neutral: {
            '--theme-bg-gradient': 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
            '--theme-glow-1': 'rgba(165, 180, 252, 0.35)',
            '--theme-glow-2': 'rgba(216, 180, 254, 0.25)',
            '--theme-accent': '#4F46E5',
            '--theme-accent-hover': '#4338CA',
            '--theme-accent-light': 'rgba(79, 70, 229, 0.08)',
            '--theme-accent-border': 'rgba(79, 70, 229, 0.15)',
            '--theme-text': '#1F2937',
            '--theme-text-secondary': '#4B5563',
            '--theme-card-bg': 'rgba(255, 255, 255, 0.55)',
            '--theme-card-border': 'rgba(255, 255, 255, 0.5)'
        },
        0: { // Score 0: Very Weak (Pastel Red/Coral)
            '--theme-bg-gradient': 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
            '--theme-glow-1': 'rgba(248, 113, 113, 0.35)',
            '--theme-glow-2': 'rgba(252, 165, 165, 0.25)',
            '--theme-accent': '#DC2626',
            '--theme-accent-hover': '#B91C1C',
            '--theme-accent-light': 'rgba(220, 38, 38, 0.08)',
            '--theme-accent-border': 'rgba(220, 38, 38, 0.15)',
            '--theme-text': '#7F1D1D',
            '--theme-text-secondary': '#991B1B',
            '--theme-card-bg': 'rgba(255, 245, 245, 0.65)',
            '--theme-card-border': 'rgba(255, 229, 229, 0.6)'
        },
        1: { // Score 1: Weak (Pastel Orange)
            '--theme-bg-gradient': 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)',
            '--theme-glow-1': 'rgba(251, 146, 60, 0.35)',
            '--theme-glow-2': 'rgba(253, 186, 116, 0.25)',
            '--theme-accent': '#EA580C',
            '--theme-accent-hover': '#C2410C',
            '--theme-accent-light': 'rgba(234, 88, 12, 0.08)',
            '--theme-accent-border': 'rgba(234, 88, 12, 0.15)',
            '--theme-text': '#7C2D12',
            '--theme-text-secondary': '#9A3412',
            '--theme-card-bg': 'rgba(255, 250, 244, 0.65)',
            '--theme-card-border': 'rgba(254, 237, 222, 0.6)'
        },
        2: { // Score 2: Fair (Pastel Yellow/Amber)
            '--theme-bg-gradient': 'linear-gradient(135deg, #FEF9C3 0%, #FEF08A 100%)',
            '--theme-glow-1': 'rgba(250, 204, 21, 0.35)',
            '--theme-glow-2': 'rgba(253, 224, 71, 0.25)',
            '--theme-accent': '#CA8A04',
            '--theme-accent-hover': '#A16207',
            '--theme-accent-light': 'rgba(202, 138, 4, 0.08)',
            '--theme-accent-border': 'rgba(202, 138, 4, 0.15)',
            '--theme-text': '#713F12',
            '--theme-text-secondary': '#854D0E',
            '--theme-card-bg': 'rgba(255, 255, 240, 0.65)',
            '--theme-card-border': 'rgba(254, 249, 195, 0.6)'
        },
        3: { // Score 3: Good (Pastel Blue)
            '--theme-bg-gradient': 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
            '--theme-glow-1': 'rgba(56, 189, 248, 0.35)',
            '--theme-glow-2': 'rgba(125, 211, 252, 0.25)',
            '--theme-accent': '#0284C7',
            '--theme-accent-hover': '#0369A1',
            '--theme-accent-light': 'rgba(2, 132, 199, 0.08)',
            '--theme-accent-border': 'rgba(2, 132, 199, 0.15)',
            '--theme-text': '#0C4A6E',
            '--theme-text-secondary': '#075985',
            '--theme-card-bg': 'rgba(240, 249, 255, 0.65)',
            '--theme-card-border': 'rgba(224, 242, 254, 0.6)'
        },
        4: { // Score 4: Excellent (Pastel Green/Sage)
            '--theme-bg-gradient': 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
            '--theme-glow-1': 'rgba(52, 211, 153, 0.35)',
            '--theme-glow-2': 'rgba(110, 231, 183, 0.25)',
            '--theme-accent': '#059669',
            '--theme-accent-hover': '#047857',
            '--theme-accent-light': 'rgba(5, 150, 105, 0.08)',
            '--theme-accent-border': 'rgba(5, 150, 105, 0.15)',
            '--theme-text': '#064E3B',
            '--theme-text-secondary': '#065F46',
            '--theme-card-bg': 'rgba(240, 253, 244, 0.65)',
            '--theme-card-border': 'rgba(209, 250, 229, 0.6)'
        }
    };

    // Apply the colors dynamically to root variables
    function applyTheme(scoreOrType) {
        const selectedTheme = themes[scoreOrType] || themes.neutral;
        Object.entries(selectedTheme).forEach(([variable, value]) => {
            document.documentElement.style.setProperty(variable, value);
        });
    }

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
        const isHidden = passwordInput.getAttribute('type') === 'password';
        if (isHidden) {
            passwordInput.setAttribute('type', 'text');
            eyeOpenIcon.classList.add('hidden');
            eyeClosedIcon.classList.remove('hidden');
        } else {
            passwordInput.setAttribute('type', 'password');
            eyeClosedIcon.classList.add('hidden');
            eyeOpenIcon.classList.remove('hidden');
        }
    });

    // Helper: Cryptographically secure hashing (SHA-1)
    async function getSHA1Hash(str) {
        const utf8 = new TextEncoder().encode(str);
        const hashBuffer = await window.crypto.subtle.digest('SHA-1', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex.toUpperCase();
    }

    // k-Anonymity Leak Check (HaveIBeenPwned Range API)
    async function checkPwnedLeak(password) {
        if (!password) {
            updatePwnedUI('neutral');
            return;
        }

        updatePwnedUI('loading');

        try {
            const sha1String = await getSHA1Hash(password);
            const prefix = sha1String.substring(0, 5);
            const suffix = sha1String.substring(5);

            // Fetch list of matching hash suffixes (API is completely open & free)
            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
            if (!response.ok) throw new Error('API request failed');

            const text = await response.text();
            const lines = text.split('\n');

            let breachCount = 0;
            for (let i = 0; i < lines.length; i++) {
                const parts = lines[i].split(':');
                const apiSuffix = parts[0].trim();
                const count = parseInt(parts[1], 10);

                if (apiSuffix === suffix) {
                    breachCount = count;
                    break;
                }
            }

            if (breachCount > 0) {
                updatePwnedUI('leaked', breachCount);
            } else {
                updatePwnedUI('safe');
            }
        } catch (error) {
            console.error('Leak verification failed:', error);
            updatePwnedUI('error');
        }
    }

    // Update HaveIBeenPwned Visuals
    function updatePwnedUI(status, count = 0) {
        pwnedStatusCard.className = `pwned-banner ${status === 'loading' || status === 'error' ? 'neutral' : status}`;
        
        if (status === 'neutral') {
            pwnedHeadline.innerText = 'Leak Shield Analysis';
            pwnedDescription.innerText = 'Zero-knowledge check compares password hashes against 12+ billion exposed accounts safely.';
        } else if (status === 'loading') {
            pwnedHeadline.innerText = 'Analyzing Shield Database...';
            pwnedDescription.innerHTML = 'Hashing credential and dispatching zero-knowledge range query...';
        } else if (status === 'safe') {
            pwnedHeadline.innerText = 'Shield Secure: 0 Breaches Found';
            pwnedDescription.innerText = 'This password has not been detected in any known public data breaches! Excellent work.';
        } else if (status === 'leaked') {
            pwnedHeadline.innerText = '⚠️ CRITICAL: Password Leaked!';
            pwnedDescription.innerHTML = `Exposed in public breaches at least <strong>${count.toLocaleString()} times</strong>. Do NOT use it!`;
        } else {
            pwnedHeadline.innerText = 'Breach Service Unavailable';
            pwnedDescription.innerText = 'Could not connect to threat API. Local tests remain fully active.';
        }
    }

    // Core Strength Evaluator Event Trigger
    function handlePasswordEvaluation() {
        const val = passwordInput.value;

        if (!val) {
            applyTheme('neutral');
            
            // Reset Gauge Level Meter
            radialFill.style.strokeDashoffset = MAX_OFFSET;
            meterPercent.innerText = '0%';
            meterLevel.innerText = 'EMPTY';

            entropyScoreDisplay.innerText = '0 bits';
            timeOfflineFast.innerText = 'Instant';
            
            // Empty warnings/suggestions
            warningBox.classList.add('hidden');
            suggestionsBox.classList.add('hidden');

            clearTimeout(hiberDebounceTimer);
            updatePwnedUI('neutral');
            return;
        }

        // Run zxcvbn evaluation (Dropbox library loaded via script)
        if (typeof zxcvbn !== 'function') {
            console.error('zxcvbn library is still loading or unavailable.');
            return;
        }

        const evaluation = zxcvbn(val);
        const score = evaluation.score; // 0 to 4
        const entropyBits = Math.round(Math.log2(evaluation.guesses));

        // Update Theme Color dynamically according to the score
        applyTheme(score);

        // Update Circular Gauge level meter
        const scoreMap = {
            0: { pct: '20%', text: 'VERY WEAK', factor: 0.20 },
            1: { pct: '40%', text: 'WEAK', factor: 0.40 },
            2: { pct: '60%', text: 'FAIR', factor: 0.60 },
            3: { pct: '80%', text: 'STRONG', factor: 0.80 },
            4: { pct: '100%', text: 'EXCELLENT', factor: 1.00 }
        };

        const currentGauge = scoreMap[score];
        const newOffset = MAX_OFFSET * (1 - currentGauge.factor);
        radialFill.style.strokeDashoffset = newOffset;
        meterPercent.innerText = currentGauge.pct;
        meterLevel.innerText = currentGauge.text;

        // Set Metric Display Chips
        entropyScoreDisplay.innerText = `${entropyBits} bits`;
        timeOfflineFast.innerText = evaluation.crack_times_display.offline_fast_hashing_1e10_per_second;

        // Render warnings and feedback advice
        const feedback = evaluation.feedback;
        if (feedback.warning) {
            warningBox.classList.remove('hidden');
            warningText.innerText = feedback.warning;
        } else {
            warningBox.classList.add('hidden');
        }

        if (feedback.suggestions && feedback.suggestions.length > 0) {
            suggestionsBox.classList.remove('hidden');
            suggestionsList.innerHTML = '';
            feedback.suggestions.forEach(suggestion => {
                const li = document.createElement('li');
                li.innerText = suggestion;
                suggestionsList.appendChild(li);
            });
        } else {
            // Default suggestions if strong but nothing to improve
            if (score >= 3) {
                suggestionsBox.classList.remove('hidden');
                suggestionsList.innerHTML = '<li>This password matches all high-entropy safeguards. Protect it within your Password Manager!</li>';
            } else {
                suggestionsBox.classList.add('hidden');
            }
        }

        // Debounce HaveIBeenPwned Range API Call to save bandwidth and prevent keylogger-like API overload
        clearTimeout(hiberDebounceTimer);
        hiberDebounceTimer = setTimeout(() => {
            checkPwnedLeak(val);
        }, 400);
    }

    passwordInput.addEventListener('input', handlePasswordEvaluation);
});
