const SETTINGS_KEY = "pkt_settings";
const SAVE_KEY = "pkt_save";

export function loadSettingsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY));
  } catch (error) {
    return null;
  }
}

export function saveSettingsToStorage(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSaveFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY));
  } catch (error) {
    return null;
  }
}

export function saveGameToStorage(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}
