// Fajaede Privacy-Cleaner - Popup Script
document.addEventListener('DOMContentLoaded', loadSettings);

async function loadSettings() {
    const result = await chrome.storage.sync.get([
        'schedule',
        'cleanCache',
        'cleanCookies',
        'cleanHistory',
        'cleanPasswords',
        'cleanDownloads',
        'cleanFormData',
        'cleanLocalStorage',
        'cleanRange',
        'whitelist',
        'smartFeatures'
    ]);

    // Schema
    if (result.schedule) {
        document.getElementById('schedule').value = result.schedule;
    }
    document.getElementById('cleanRange').value = result.cleanRange || 'all';

    // Te verwijderen gegevens
    document.getElementById('cache').checked = result.cleanCache || false;
    document.getElementById('cookies').checked = result.cleanCookies || false;
    document.getElementById('history').checked = result.cleanHistory || false;
    document.getElementById('passwords').checked = result.cleanPasswords || false;
    document.getElementById('downloads').checked = result.cleanDownloads || false;
    document.getElementById('formData').checked = result.cleanFormData || false;
    document.getElementById('localStorage').checked = result.cleanLocalStorage || false;
    document.getElementById('smartFeatures').checked = result.smartFeatures !== false;

    // Whitelist
    if (result.whitelist) {
        document.getElementById('whitelist').value = result.whitelist.join('\n');
    }

    // Fajaede versie in de badge
    document.getElementById('fajaedeVersion').textContent = 'v' + chrome.runtime.getManifest().version;

    await loadFajaedeLastCleanup();
    applyFajaedeSmartFeatures();

    // Laad Fajaede slimme tips
    await loadFajaedeSmartTips();
}

// Fajaede whitelist opschonen: "https://www.bank.nl/login" -> "bank.nl" (zelfde regels als background)
function normalizeFajaedeDomain(entry) {
    return String(entry)
        .trim()
        .toLowerCase()
        .replace(/^[a-z]+:\/\//, '')
        .replace(/[\/?#].*$/, '')
        .replace(/:\d+$/, '')
        .replace(/^www\./, '')
        .replace(/\.+$/, '');
}

function getFajaedeWhitelist() {
    const domains = document.getElementById('whitelist').value.split('\n')
        .map(normalizeFajaedeDomain)
        .filter(site => site.length > 0);
    return [...new Set(domains)];
}

// Vraag browsingData permission aan (moet direct vanuit een klik gebeuren)
async function ensureFajaedePermissions() {
    try {
        const granted = await chrome.permissions.request({ permissions: ['browsingData'] });
        if (granted) {
            await chrome.storage.sync.set({ permissionsGranted: true });
        }
        return granted;
    } catch (error) {
        console.error('Fajaede permission request error:', error);
        return false;
    }
}

// Opslaan Fajaede instellingen
document.getElementById('save').addEventListener('click', saveFajaedeSettings);

async function saveFajaedeSettings() {
    const schedule = document.getElementById('schedule').value;

    // Automatisch opschonen heeft permissions nodig
    const permissionDenied = schedule !== 'off' && !(await ensureFajaedePermissions());

    const cleanRange = document.getElementById('cleanRange').value;
    const cleanCache = document.getElementById('cache').checked;
    const cleanCookies = document.getElementById('cookies').checked;
    const cleanHistory = document.getElementById('history').checked;
    const cleanPasswords = document.getElementById('passwords').checked;
    const cleanDownloads = document.getElementById('downloads').checked;
    const cleanFormData = document.getElementById('formData').checked;
    const cleanLocalStorage = document.getElementById('localStorage').checked;
    const smartFeatures = document.getElementById('smartFeatures').checked;

    const whitelist = getFajaedeWhitelist();
    document.getElementById('whitelist').value = whitelist.join('\n');

    await chrome.storage.sync.set({
        schedule,
        cleanRange,
        cleanCache,
        cleanCookies,
        cleanHistory,
        cleanPasswords,
        cleanDownloads,
        cleanFormData,
        cleanLocalStorage,
        whitelist,
        smartFeatures
    });

    // Stuur bericht naar background script om alarm bij te werken
    chrome.runtime.sendMessage({
        action: 'updateSchedule',
        schedule: schedule
    });

    if (permissionDenied) {
        showFajaedeStatus('🔐 Opgeslagen, maar zonder toestemming kan automatisch opschonen niet werken', 'error');
    } else {
        showFajaedeStatus('Fajaede instellingen opgeslagen! 🎉', 'success');
    }
    await loadFajaedeSmartTips();
}

// Fajaede waarschuwing voor wachtwoorden
document.getElementById('passwords').addEventListener('change', function() {
    if (this.checked && !confirm('Fajaede: Weet je zeker dat je opgeschoonde wachtwoorden wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) {
        this.checked = false;
    }
});

// Fajaede slimme features aan/uit
document.getElementById('smartFeatures').addEventListener('change', applyFajaedeSmartFeatures);

function applyFajaedeSmartFeatures() {
    const enabled = document.getElementById('smartFeatures').checked;
    document.getElementById('smartTips').style.display = enabled ? 'block' : 'none';
    document.getElementById('analyzeCurrent').disabled = !enabled;
    document.getElementById('analyzeCurrent').style.opacity = enabled ? '1' : '0.5';
}

// Fajaede Nu Opschonen
document.getElementById('cleanNow').addEventListener('click', async function() {
    if (!(await ensureFajaedePermissions())) {
        showFajaedeStatus('🔐 Fajaede: Toestemming nodig om op te schonen', 'error');
        return;
    }

    const result = await performFajaedeCleanup();
    if (result && result.ok) {
        showFajaedeStatus(`Fajaede opschonen voltooid! ✨ (${result.cleanedItems} soorten data)`, 'success');
    } else if (result && result.reason === 'permissions') {
        showFajaedeStatus('🔐 Fajaede: Toestemming nodig om op te schonen', 'error');
    } else {
        showFajaedeStatus('❌ Fajaede: Opschonen mislukt, probeer het opnieuw', 'error');
    }
    await loadFajaedeLastCleanup();
    await loadFajaedeSmartTips();
});

// Fajaede Analyseer huidige website
document.getElementById('analyzeCurrent').addEventListener('click', analyzeCurrentWebsiteWithFajaede);

async function analyzeCurrentWebsiteWithFajaede() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && /^https?:/.test(tab.url)) {
            const domain = normalizeFajaedeDomain(new URL(tab.url).hostname);
            const title = tab.title || '';

            showFajaedeStatus(`Fajaede analyseert: ${domain}...`, 'success');

            const response = await chrome.runtime.sendMessage({
                action: 'analyzeDomain',
                domain: domain,
                title: title
            });

            if (response.shouldWhitelist) {
                // Voeg toe aan whitelist
                const textarea = document.getElementById('whitelist');
                const currentList = getFajaedeWhitelist();
                if (!currentList.includes(domain)) {
                    currentList.push(domain);
                    textarea.value = currentList.join('\n');
                    showFajaedeStatus(`✅ Fajaede adviseert: ${domain} toevoegen aan whitelist`, 'success');
                } else {
                    showFajaedeStatus(`ℹ️ Fajaede: ${domain} staat al in whitelist`, 'success');
                }
            } else {
                showFajaedeStatus(`❌ Fajaede: ${domain} lijkt niet essentieel om te bewaren`, 'success');
            }
        } else {
            showFajaedeStatus('ℹ️ Fajaede: Open een website om te analyseren', 'error');
        }
    } catch (error) {
        showFajaedeStatus('❌ Fajaede kon website niet analyseren', 'error');
    }
}

// Fajaede laatste opschoning tonen
async function loadFajaedeLastCleanup() {
    const container = document.getElementById('lastCleanup');
    if (!container) return null;

    const stats = await chrome.storage.local.get(['lastCleanup', 'cleanupCount']);
    if (stats.lastCleanup) {
        const date = new Date(stats.lastCleanup).toLocaleString('nl-NL');
        container.textContent = `🕒 Laatste opschoning: ${date} (totaal ${stats.cleanupCount || 1}×)`;
    } else {
        container.textContent = '🕒 Nog niet opgeschoond';
    }
    return stats;
}

// Laad Fajaede slimme tips
async function loadFajaedeSmartTips() {
    const tipsContainer = document.getElementById('smartTips');
    if (!tipsContainer) return;

    // Echte gegevens, geen schattingen
    const stats = await chrome.storage.local.get('lastCleanup');
    const storageData = {
        daysSinceCleanup: stats.lastCleanup
            ? Math.floor((Date.now() - stats.lastCleanup) / (24 * 60 * 60 * 1000))
            : null,
        cleanCookies: document.getElementById('cookies').checked,
        cleanPasswords: document.getElementById('passwords').checked,
        whitelistCount: getFajaedeWhitelist().length
    };

    const settings = await chrome.storage.sync.get('schedule');

    const response = await chrome.runtime.sendMessage({
        action: 'getFajaedeTips',
        storageData: storageData,
        schedule: settings.schedule
    });

    tipsContainer.textContent = '';
    const tips = response && response.tips && response.tips.length > 0
        ? response.tips
        : ['✅ Fajaede: Alles ziet er perfect uit!'];

    const heading = document.createElement('h4');
    heading.textContent = '💡 Fajaede Tips:';
    tipsContainer.appendChild(heading);
    for (const tip of tips) {
        const div = document.createElement('div');
        div.className = 'tip';
        div.textContent = tip;
        tipsContainer.appendChild(div);
    }
}

function showFajaedeStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    clearTimeout(showFajaedeStatus.timer);
    showFajaedeStatus.timer = setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 4000);
}

// Fajaede Cleanup functie
async function performFajaedeCleanup() {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'performCleanup' }, resolve);
    });
}
