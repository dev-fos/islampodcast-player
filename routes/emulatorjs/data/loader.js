/**
 * EmulatorJS Loader
 * 
 * This is a placeholder loader. For full functionality, please download the complete EmulatorJS library from:
 * https://github.com/EmulatorJS/EmulatorJS/releases
 * 
 * Instructions:
 * 1. Download the latest release from the link above
 * 2. Extract the contents to this 'data' folder
 * 3. Replace this loader.js with the one from the release
 * 
 * The complete package includes:
 * - loader.js (main loader)
 * - emulator.min.js (core emulator)
 * - cores/ (emulator cores for different platforms)
 *   - fceumm-core.js (NES)
 *   - snes9x-core.js (SNES)
 *   - mgba-core.js (GBA)
 *   - gambatte-core.js (GB/GBC)
 *   - mupen64plus-core.js (N64)
 *   - pcsx_rearmed-core.js (PS1)
 *   - ppsspp-core.js (PSP)
 */

// Show installation message
document.addEventListener('DOMContentLoaded', function() {
    var emulatorContainer = document.getElementById('emulator');
    if (emulatorContainer) {
        emulatorContainer.innerHTML = `
            <div style="
                text-align: center;
                padding: 40px;
                background: rgba(0,0,0,0.8);
                border-radius: 15px;
                border: 2px solid #a3001b;
            ">
                <i class="fas fa-download" style="font-size: 48px; color: #a3001b; margin-bottom: 20px;"></i>
                <h3 style="color: #fff; margin-bottom: 15px;">EmulatorJS Not Installed</h3>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px; line-height: 1.6;">
                    Please download the complete EmulatorJS library from:<br>
                    <a href="https://github.com/EmulatorJS/EmulatorJS/releases" target="_blank" style="color: #a3001b;">
                        https://github.com/EmulatorJS/EmulatorJS/releases
                    </a>
                </p>
                <p style="color: rgba(255,255,255,0.5); font-size: 12px;">
                    Extract the contents to the <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">emulatorjs/data/</code> folder
                </p>
            </div>
        `;
    }
});

// Placeholder EJS_emulator object
window.EJS_emulator = null;
