// Fajaede Privacy-Cleaner - Background Service Worker
console.log('🔒 Fajaede Privacy-Cleaner is geïnitialiseerd');

// Fajaede standaard instellingen (nieuwe opties staan uit, zodat bestaand gedrag gelijk blijft)
const FAJAEDE_DEFAULTS = {
    schedule: 'off',
    cleanCache: true,
    cleanCookies: true,
    cleanHistory: false,
    cleanPasswords: false,
    cleanDownloads: false,
    cleanFormData: false,
    cleanLocalStorage: false,
    cleanRange: 'all',
    whitelist: ['google.com', 'github.com'],
    smartFeatures: true,
    fajaedeInstalled: true,
    permissionsGranted: false
};

// Fajaede schema's met vaste interval (in minuten)
const FAJAEDE_SCHEDULE_MINUTES = {
    '1h': 60,
    '6h': 6 * 60,
    '24h': 24 * 60,
    'weekly': 7 * 24 * 60
};

// Fajaede tijdsperiodes (in milliseconden, 0 = alles)
const FAJAEDE_RANGE_MS = {
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    all: 0
};

class FajaedePermissionManager {
    constructor() {
        this.requiredPermissions = [
            'browsingData'
        ];
    }

    // Check of we de benodigde permissions hebben
    async checkPermissions() {
        try {
            const permissions = await chrome.permissions.contains({
                permissions: this.requiredPermissions
            });
            return permissions;
        } catch (error) {
            console.error('Fajaede permission check error:', error);
            return false;
        }
    }

    // Vraag permissions aan bij gebruiker (werkt alleen vanuit een klik in de popup)
    async requestPermissions() {
        try {
            const granted = await chrome.permissions.request({
                permissions: this.requiredPermissions
            });

            if (granted) {
                console.log('🎉 Fajaede permissions granted');
                return true;
            } else {
                console.log('❌ Fajaede permissions denied');
                return false;
            }
        } catch (error) {
            console.error('Fajaede permission request error:', error);
            return false;
        }
    }

    // Toon permission prompt indien nodig
    async ensurePermissions() {
        const hasPermissions = await this.checkPermissions();

        if (!hasPermissions) {
            console.log('🔐 Fajaede requesting permissions...');
            // Permissions worden aangevraagd vanuit de popup
            return false;
        }

        return true;
    }
}

const fajaedePermissionManager = new FajaedePermissionManager();

// Fajaede whitelist opschonen: "https://www.bank.nl/login" -> "bank.nl"
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

function normalizeFajaedeWhitelist(list) {
    if (!Array.isArray(list)) return [];
    const domains = list.map(normalizeFajaedeDomain).filter(domain => domain.length > 0);
    return [...new Set(domains)];
}

// Initialize storage with Fajaede default values
chrome.runtime.onInstalled.addListener(async (details) => {
    const current = await chrome.storage.sync.get(null);

    // Vul alleen ontbrekende instellingen aan, bestaande waarden blijven staan
    const missing = {};
    for (const [key, value] of Object.entries(FAJAEDE_DEFAULTS)) {
        if (current[key] === undefined) {
            missing[key] = value;
        }
    }
    if (Array.isArray(current.whitelist)) {
        missing.whitelist = normalizeFajaedeWhitelist(current.whitelist);
    }
    if (Object.keys(missing).length > 0) {
        await chrome.storage.sync.set(missing);
        console.log('🎉 Fajaede standaard instellingen opgeslagen');
    }

    if (details.reason === 'install') {
        // Toon welcome message
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '🎉 Welkom bij Fajaede!',
            message: 'Klik op het icoon om te beginnen met instellen.'
        });
    } else if (details.reason === 'update') {
        const version = chrome.runtime.getManifest().version;
        if (details.previousVersion !== version) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: `🔒 Fajaede is bijgewerkt naar ${version}`,
                message: 'Nieuw: extra schema\'s, tijdsperiode en meer gegevenstypes. Whitelist werkt nu volledig.'
            });
        }
    }

    await updateFajaedeAlarm();
});

// Fajaede Smart Rule-based Intelligence (zelfde als voorheen)
class FajaedeSmartCleaner {
    constructor() {
        this.importantPatterns = [
            /bank|rabobank|ing|abn|amro|fortis|bunq|asn|triodos|sns|regiobank/i,
            /login|signin|auth|secure|mijn|account|authenticate/i,
            /email|mail|outlook|gmail|hotmail|yahoo|protonmail|icloud/i,
            /pay|ideal|betalen|payment|stripe|paypal|mollie|adyen/i,
            /overheid|belasting|digid|government|tax|belastingdienst/i,
            /health|zorg|gezondheid|hospital|doctor|apotheek|huisarts/i,
            /insurance|verzekering|zorgverzekering|univé|aegon|asr/i,
            /fajaede|portfolio|project|admin|dashboard|beheer/i
        ];

        this.socialPatterns = [
            /facebook|instagram|twitter|x\.com|tiktok|linkedin|reddit|pinterest/i,
            /youtube|netflix|spotify|twitch|porn|xxx|adult|game|gaming/i
        ];
    }

    suggestWhitelist(domain, title = '') {
        const domainLower = domain.toLowerCase();
        const titleLower = title.toLowerCase();

        const isImportant = this.importantPatterns.some(pattern =>
            pattern.test(domainLower) || pattern.test(titleLower)
        );

        const isSocial = this.socialPatterns.some(pattern =>
            pattern.test(domainLower)
        );

        return isImportant && !isSocial;
    }

    // Gebaseerd op echte gegevens: dagen sinds de laatste opschoning
    estimateCleanupNeed(storageData) {
        if (!storageData || storageData.daysSinceCleanup === null || storageData.daysSinceCleanup === undefined) {
            return 'medium';
        }
        const { daysSinceCleanup } = storageData;

        if (daysSinceCleanup > 7) return 'high';
        if (daysSinceCleanup > 2) return 'medium';
        return 'low';
    }

    generateFajaedeTips(storageData, schedule, hasPermissions) {
        const tips = [];
        const urgency = this.estimateCleanupNeed(storageData);

        if (!hasPermissions) {
            tips.push('🔐 Fajaede: Permissions nodig voor volledige functionaliteit');
        }

        if (storageData && storageData.daysSinceCleanup === null) {
            tips.push('🧹 Fajaede: Nog nooit opgeschoond - probeer "Nu Opschonen"');
        } else if (urgency === 'high') {
            tips.push(`🚨 Fajaede: Laatste opschoning was ${storageData.daysSinceCleanup} dagen geleden`);
        }

        if (schedule === 'off') {
            tips.push('🎯 Fajaede: Zet automatisch opschonen aan voor optimale privacy');
        }

        if (storageData && storageData.cleanPasswords) {
            tips.push('⚠️ Fajaede: Opgeslagen wachtwoorden worden mee verwijderd');
        }

        if (storageData && storageData.cleanCookies && storageData.whitelistCount === 0) {
            tips.push('✅ Fajaede: Voeg je bank en e-mail toe aan de whitelist om ingelogd te blijven');
        }

        return tips.length > 0 ? tips : ['✅ Fajaede: Je instellingen zijn optimaal!'];
    }
}

const fajaedeSmartCleaner = new FajaedeSmartCleaner();

// Luister naar Fajaede berichten
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateSchedule') {
        updateFajaedeAlarm(message.schedule);
        sendResponse({ status: 'Fajaede schema bijgewerkt' });
    } else if (message.action === 'analyzeDomain') {
        const suggestion = fajaedeSmartCleaner.suggestWhitelist(message.domain, message.title);
        sendResponse({ shouldWhitelist: suggestion });
    } else if (message.action === 'getFajaedeTips') {
        checkPermissionsAndGetTips(message).then(sendResponse);
        return true;
    } else if (message.action === 'performCleanup') {
        performFajaedeCleanup().then(sendResponse);
        return true;
    } else if (message.action === 'requestPermissions') {
        fajaedePermissionManager.requestPermissions().then(granted => {
            if (granted) {
                chrome.storage.sync.set({ permissionsGranted: true });
            }
            sendResponse({ granted });
        });
        return true;
    } else if (message.action === 'checkPermissions') {
        fajaedePermissionManager.checkPermissions().then(sendResponse);
        return true;
    }
    return true;
});

async function checkPermissionsAndGetTips(message) {
    const hasPermissions = await fajaedePermissionManager.checkPermissions();
    const tips = fajaedeSmartCleaner.generateFajaedeTips(
        message.storageData,
        message.schedule,
        hasPermissions
    );
    return { tips, hasPermissions };
}

// Update Fajaede alarm
async function updateFajaedeAlarm(schedule) {
    await chrome.alarms.clear('fajaedeAutoCleanup');

    const settings = await chrome.storage.sync.get('schedule');
    const currentSchedule = schedule || settings.schedule;

    if (currentSchedule && currentSchedule !== 'off') {
        switch (currentSchedule) {
            case '1h':
            case '6h':
            case '24h':
            case 'weekly':
                chrome.alarms.create('fajaedeAutoCleanup', {
                    periodInMinutes: FAJAEDE_SCHEDULE_MINUTES[currentSchedule]
                });
                console.log(`🔔 Fajaede ${currentSchedule} alarm ingesteld`);
                break;
            case 'browser_start':
            case 'browser_close':
                console.log('🔔 Fajaede browser-start cleanup actief');
                break;
        }
    }
}

// Fajaede alarm afhandeling
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'fajaedeAutoCleanup') {
        await performFajaedeCleanup();
    }
});

// Whitelist domeinen -> origins voor browsingData.excludeOrigins
function buildFajaedeExcludeOrigins(whitelist) {
    const origins = [];
    for (const domain of normalizeFajaedeWhitelist(whitelist)) {
        // Ongeldige invoer overslaan, anders weigert browsingData de hele opschoning
        if (!/^[a-z0-9.-]+$/.test(domain)) continue;
        for (const scheme of ['https://', 'http://']) {
            origins.push(scheme + domain);
            origins.push(scheme + 'www.' + domain);
        }
    }
    return origins;
}

// Fajaede Opschonen uitvoeren
async function performFajaedeCleanup() {
    // Check permissions eerst
    const hasPermissions = await fajaedePermissionManager.checkPermissions();

    if (!hasPermissions) {
        console.log('❌ Fajaede: Permissions needed for cleanup');
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: '🔒 Fajaede Permissions Nodig',
            message: 'Klik op het Fajaede icoon om permissions te verlenen'
        });
        return { ok: false, reason: 'permissions', cleanedItems: 0 };
    }

    const settings = await chrome.storage.sync.get([
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

    console.log('🧹 Fajaede start automatische opschoning...');

    const rangeMs = FAJAEDE_RANGE_MS[settings.cleanRange] || 0;
    const since = rangeMs ? Date.now() - rangeMs : 0;
    let cleanedItems = 0;

    try {
        // Gegevens zonder whitelist (excludeOrigins wordt hier niet ondersteund)
        const generalTypes = {};
        if (settings.cleanCache) generalTypes.cache = true;
        if (settings.cleanHistory) generalTypes.history = true;
        if (settings.cleanPasswords) generalTypes.passwords = true;
        if (settings.cleanDownloads) generalTypes.downloads = true;
        if (settings.cleanFormData) generalTypes.formData = true;

        if (Object.keys(generalTypes).length > 0) {
            await chrome.browsingData.remove({ since }, generalTypes);
            cleanedItems += Object.keys(generalTypes).length;
        }

        // Cookies en site-opslag met whitelist ondersteuning
        const siteTypes = {};
        if (settings.cleanCookies) siteTypes.cookies = true;
        if (settings.cleanLocalStorage) {
            siteTypes.localStorage = true;
            siteTypes.indexedDB = true;
        }

        if (Object.keys(siteTypes).length > 0) {
            const removalOptions = { since };
            const excludeOrigins = buildFajaedeExcludeOrigins(settings.whitelist);
            if (excludeOrigins.length > 0) {
                removalOptions.excludeOrigins = excludeOrigins;
            }
            await chrome.browsingData.remove(removalOptions, siteTypes);
            cleanedItems += (settings.cleanCookies ? 1 : 0) + (settings.cleanLocalStorage ? 1 : 0);
        }
    } catch (error) {
        console.error('Fajaede cleanup error:', error);
        return { ok: false, reason: 'error', cleanedItems };
    }

    // Fajaede statistieken bijwerken
    const stats = await chrome.storage.local.get('cleanupCount');
    await chrome.storage.local.set({
        lastCleanup: Date.now(),
        cleanupCount: (stats.cleanupCount || 0) + 1
    });

    // Fajaede melding
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: '🔒 Fajaede Privacy-Cleaner',
        message: `Succesvol opgeschoond! ${cleanedItems} soorten data verwijderd.`
    });

    console.log(`🎉 Fajaede opschoning voltooid: ${cleanedItems} soorten data opgeschoond`);
    return { ok: true, reason: null, cleanedItems };
}

// Fajaede opschonen bij browser start (ook voor "na sluiten": dat gebeurt bij de volgende start)
chrome.runtime.onStartup.addListener(async () => {
    const settings = await chrome.storage.sync.get('schedule');
    if (settings.schedule === 'browser_start' || settings.schedule === 'browser_close') {
        console.log('🔄 Fajaede start browser-start cleanup');
        await performFajaedeCleanup();
    }
});
