Warning: truncated output (original token count: 58299)
Total output lines: 5493

const STORAGE_KEY = "paddlePinClub.v1";
const CLOUD_CONFIG_KEY = "clubSociety.cloudConfig.v1";
const INTEGRATION_CONFIG_KEY = "clubSociety.integrationConfig.v1";
const PADDLE_PINT_SYNC_CONFIG_KEY = "clubSociety.paddlePintSync.v1";
const PADDLE_PINT_ENDPOINT_URL = "https://clubsociety.app/api/paddle-pint";
const APP_VERSION = document.querySelector('meta[name="app-version"]')?.content || "local-dev";
const STORAGE_SCHEMA_VERSION = 2;
const currentHost = window.location.hostname.toLowerCase();
const MEMBER_APP_HOSTS = new Set(["clubsociety.app", "www.clubsociety.app", "club-society.pages.dev"]);
const LOCAL_DASHBOARD_HOSTS = new Set(["", "localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const isStandaloneLaunch = MEMBER_APP_HOSTS.has(currentHost);
const isDashboardLaunch = LOCAL_DASHBOARD_HOSTS.has(currentHost) || window.location.protocol === "file:";
const isUnsupportedHostedLaunch = !isStandaloneLaunch && !isDashboardLaunch;
const DEFAULT_LOCATION = { street: "", city: "Watkinsville", state: "GA", zip: "30677" };
const DEFAULT_PUBLIC_VIEW = {
  headline: "Find your next game",
  intro: "Browse published Club Society events, RSVP, and join the waitlist when an event fills up.",
  primaryLabel: "Reserve a spot",
  secondaryLabel: "Play. Connect. Challenge.",
  announcement: "New events and club drops appear here first.",
  featuredEvents: [],
  featuredPlayers: [],
};
const EVENT_TEMPLATES = {
  pint: {
    name: "Paddle + Pint Night",
    venue: "South Main Brewing",
    format: "Round Robin",
    capacity: "32",
    courts: "4",
    note: "Social rotating partner play with post-play pint specials.",
  },
  ladder: {
    name: "Club Society Skill Ladder",
    venue: "Home courts",
    format: "Round Robin",
    capacity: "24",
    courts: "3",
    note: "Skill-based pods with rotating partners and simple standings.",
  },
  open: {
    name: "Community Open Play",
    venue: "Local courts",
    format: "Open Play",
    capacity: "40",
    courts: "5",
    note: "Drop-in friendly play with host-led court assignments.",
  },
  scramble: {
    name: "Nine + Social Scramble",
    venue: "Local short course",
    format: "Golf Scramble",
    capacity: "36",
    courts: "9",
    note: "Nine-hole golf scramble with teams, prizes, and post-round hang.",
  },
};
const LOCAL_ADMIN_EMAIL = "host@clubsociety.local";
const DEFAULT_SHOP_COLLECTIONS = [
  { title: "Event Night Kit", body: "League shirt, grip, hydration, and post-play essentials.", tag: "Merch bundle" },
  { title: "Beginner Paddle Pack", body: "Friendly starter gear for new Club Society players.", tag: "Starter drop" },
  { title: "Tournament Capsule", body: "Competitive apparel and accessories for bracket days.", tag: "Challenge gear" },
  { title: "Golf Social Edit", body: "Coming-soon crossover collection for nine-hole hangs.", tag: "Golf preview" },
];
const MEMBER_SYNC_KEYS = [
  "profiles",
  "societyFavorites",
  "societyFriends",
  "clubGroups",
  "casualMatches",
  "quickGames",
  "posts",
  "golfTeeTimes",
  "golfGroups",
  "golfMessages",
  "golfMatchIndex",
  "societyFriendFilter",
  "quickGameFilter",
  "casualMatchFilter",
  "courtFilter",
];

const state = loadState();
let memberCloudSyncTimer = 0;
let suppressMemberCloudSync = false;
const els = {
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  modes: document.querySelectorAll(".mode"),
  eventForm: document.querySelector("#eventForm"),
  playerForm: document.querySelector("#playerForm"),
  postForm: document.querySelector("#postForm"),
  publicRsvpForm: document.querySelector("#publicRsvpForm"),
  societyAccountForm: document.querySelector("#societyAccountForm"),
  societyAccountMessage: document.querySelector("#societyAccountMessage"),
  societyMemberDashboard: document.querySelector("#societyMemberDashboard"),
  societyMemberName: document.querySelector("#societyMemberName"),
  societyMemberMeta: document.querySelector("#societyMemberMeta"),
  societyFavoriteCount: document.querySelector("#societyFavoriteCount"),
  societyFriendCount: document.querySelector("#societyFriendCount"),
  societyGroupCount: document.querySelector("#societyGroupCount"),
  societyFriendSearch: document.querySelector("#societyFriendSearch"),
  societyFriendResults: document.querySelector("#societyFriendResults"),
  societyProfilePreview: document.querySelector("#societyProfilePreview"),
  societySinglesToggle: document.querySelector("#societySinglesToggle"),
  myRsvpList: document.querySelector("#myRsvpList"),
  myPostList: document.querySelector("#myPostList"),
  casualMatchForm: document.querySelector("#casualMatchForm"),
  casualMatchList: document.querySelector("#casualMatchList"),
  clubGroupForm: document.querySelector("#clubGroupForm"),
  clubGroupList: document.querySelector("#clubGroupList"),
  myGroupList: document.querySelector("#myGroupList"),
  quickGameForm: document.querySelector("#quickGameForm"),
  quickGameList: document.querySelector("#quickGameList"),
  courtSearch: document.querySelector("#courtSearch"),
  courtDirectoryList: document.querySelector("#courtDirectoryList"),
  societyAvatar: document.querySelector(".society-avatar"),
  societyProfileDrawer: document.querySelector("#societyProfileDrawer"),
  societyPhotoPreview: document.querySelector("#societyPhotoPreview"),
  societyPhotoInput: document.querySelector("#societyPhotoInput"),
  golfTeeTimeForm: document.querySelector("#golfTeeTimeForm"),
  golfTeeTimeList: document.querySelector("#golfTeeTimeList"),
  golfGroupForm: document.querySelector("#golfGroupForm"),
  golfGroupList: document.querySelector("#golfGroupList"),
  golfMessageForm: document.querySelector("#golfMessageForm"),
  golfMessageList: document.querySelector("#golfMessageList"),
  memberSuggestionList: document.querySelector("#memberSuggestionList"),
  golfMatchDeck: document.querySelector("#golfMatchDeck"),
  golfPassBtn: document.querySelector("#golfPassBtn"),
  golfMessageMatchBtn: document.querySelector("#golfMessageMatchBtn"),
  adminForm: document.querySelector("#adminForm"),
  profileForm: document.querySelector("#profileForm"),
  shopForm: document.querySelector("#shopForm"),
  integrationForm: document.querySelector("#integrationForm"),
  paddlePintSyncForm: document.querySelector("#paddlePintSyncForm"),
  importPaddlePintBtn: document.querySelector("#importPaddlePintBtn"),
  paddlePintSyncStatus: document.querySelector("#paddlePintSyncStatus"),
  cloudConfigForm: document.querySelector("#cloudConfigForm"),
  seedDemoBtn: document.querySelector("#seedDemoBtn"),
  saveSnapshotBtn: document.querySelector("#saveSnapshotBtn"),
  rosterSearch: document.querySelector("#rosterSearch"),
  courtCount: document.querySelector("#courtCount"),
  roundCount: document.querySelector("#roundCount"),
  roundPlayerSource: document.querySelector("#roundPlayerSource"),
  roundRotationStyle: document.querySelector("#roundRotationStyle"),
  roundPlayerPicker: document.querySelector("#roundPlayerPicker"),
  buildRoundsBtn: document.querySelector("#buildRoundsBtn"),
  advanceRoundBtn: document.querySelector("#advanceRoundBtn"),
  clearRoundsBtn: document.querySelector("#clearRoundsBtn"),
  seedBracketBtn: document.querySelector("#seedBracketBtn"),
  advanceBracketBtn: document.querySelector("#advanceBracketBtn"),
  tournamentFormat: document.querySelector("#tournamentFormat"),
  doublesPairing: document.querySelector("#doublesPairing"),
  doublesPairingLabel: document.querySelector("#doublesPairingLabel"),
  rsvpLookup: document.querySelector("#rsvpLookup"),
  fillRsvpBtn: document.querySelector("#fillRsvpBtn"),
  coupleCheckin: document.querySelector("#coupleCheckin"),
  partnerCheckinFields: document.querySelector("#partnerCheckinFields"),
  partnerLookup: document.querySelector("#partnerLookup"),
  fillPartnerBtn: document.querySelector("#fillPartnerBtn"),
  cancelEventEditBtn: document.querySelector("#cancelEventEditBtn"),
  beginSelectedEventBtn: document.querySelector("#beginSelectedEventBtn"),
  cancelPlayerEditBtn: document.querySelector("#cancelPlayerEditBtn"),
  cancelProfileEditBtn: document.querySelector("#cancelProfileEditBtn"),
  importProfilesBtn: document.querySelector("#importProfilesBtn"),
  profilesImport: document.querySelector("#profilesImport"),
  exportProfilesBtn: document.querySelector("#exportProfilesBtn"),
  cancelShopEditBtn: document.querySelector("#cancelShopEditBtn"),
  sendVerificationBtn: document.querySelector("#sendVerificationBtn"),
  verifyProfileBtn: document.querySelector("#verifyProfileBtn"),
  profileVerificationStatus: document.querySelector("#profileVerificationStatus"),
  csvImportBtn: document.querySelector("#csvImportBtn"),
  csvImport: document.querySelector("#csvImport"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  templateButtons: document.querySelectorAll("[data-template]"),
  playerEvent: document.querySelector("#playerEvent"),
  publicCheckinForm: document.querySelector("#publicCheckinForm"),
  publicLookup: document.querySelector("#publicLookup"),
  publicFindBtn: document.querySelector("#publicFindBtn"),
  publicResult: document.querySelector("#publicResult"),
  publicWaiverStatus: document.querySelector("#publicWaiverStatus"),
  publicRsvpEvent: document.querySelector("#publicRsvpEvent"),
  publicRsvpResult: document.querySelector("#publicRsvpResult"),
  mockSyncBtn: document.querySelector("#mockSyncBtn"),
  pushCloudBtn: document.querySelector("#pushCloudBtn"),
  pullCloudBtn: document.querySelector("#pullCloudBtn"),
  cloudStatus: document.querySelector("#cloudStatus"),
  exportArchiveBtn: document.querySelector("#exportArchiveBtn"),
  integrationEventSelect: document.querySelector("#integrationEventSelect"),
  integrationStatus: document.querySelector("#integrationStatus"),
  draftAnnouncementBtn: document.querySelector("#draftAnnouncementBtn"),
  draftReminderBtn: document.querySelector("#draftReminderBtn"),
  draftFollowupBtn: document.querySelector("#draftFollowupBtn"),
  draftSocialBtn: document.querySelector("#draftSocialBtn"),
  openWaiverBtn: document.querySelector("#openWaiverBtn"),
  waiverModal: document.querySelector("#waiverModal"),
  waiverAgreeBtn: document.querySelector("#waiverAgreeBtn"),
  waiverDisagreeBtn: document.querySelector("#waiverDisagreeBtn"),
  golfDrawer: document.querySelector("#golfDrawer"),
  golfBackdrop: document.querySelector("#golfBackdrop"),
  closeGolfDrawer: document.querySelector("#closeGolfDrawer"),
};

document.querySelector("#eventForm [name=date]").value = new Date().toISOString().slice(0, 10);
resetProfileLocationDefaults();

els.navItems.forEach((item) => item.addEventListener("click", () => setView(item.dataset.view)));
document.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.jump)));
els.modes.forEach((button) => button.addEventListener("click", () => {
  setMode(button.dataset.mode);
}));
els.seedDemoBtn.addEventListener("click", seedDemo);
els.saveSnapshotBtn.addEventListener("click", exportSnapshot);
els.eventForm.addEventListener("submit", saveEvent);
els.playerForm.addEventListener("submit", savePlayer);
els.postForm.addEventListener("submit", savePost);
els.publicRsvpForm.addEventListener("submit", savePublicRsvp);
els.societyAccountForm.addEventListener("submit", saveSocietyAccount);
document.querySelector("#societyApp").addEventListener("click", handleSocietyAppClick);
els.societyProfileDrawer.addEventListener("submit", (event) => {
  event.preventDefault();
  saveSocietyProfileFromDrawer();
});
els.societyPhotoInput.addEventListener("change", previewSocietyPhoto);
els.societyFriendSearch.addEventListener("input", renderSocietyFriends);
els.casualMatchForm?.addEventListener("submit", saveCasualMatch);
els.clubGroupForm.addEventListener("submit", saveClubGroup);
els.quickGameForm.addEventListener("submit", saveQuickGame);
els.courtSearch.addEventListener("input", renderCourtDirectory);
els.golfTeeTimeForm.addEventListener("submit", saveGolfTeeTime);
els.golfGroupForm.addEventListener("submit", saveGolfGroup);
els.golfMessageForm.addEventListener("submit", saveGolfMessage);
els.golfMessageForm.elements.to.addEventListener("input", updateMemberSuggestions);
els.golfPassBtn.addEventListener("click", passGolfMatch);
els.golfMessageMatchBtn.addEventListener("click", messageGolfMatch);
els.adminForm.addEventListener("submit", saveAdmin);
els.profileForm.addEventListener("submit", saveProfile);
els.shopForm.addEventListener("submit", saveShopCollection);
els.integrationForm.addEventListener("submit", saveIntegrationConfig);
els.paddlePintSyncForm.addEventListener("submit", savePaddlePintSyncConfig);
els.importPaddlePintBtn.addEventListener("click", importPaddlePintSubmissions);
els.cloudConfigForm.addEventListener("submit", saveCloudConfig);
els.rosterSearch.addEventListener("input", renderPlayers);
document.querySelector("#playerList").addEventListener("click", handlePlayerListClick);
document.querySelector("#eventList").addEventListener("click", handleEventListClick);
document.querySelector("#commandEvents").addEventListener("click", handleEventListClick);
document.querySelector("#publicEventList").addEventListener("click", handlePublicEventListClick);
document.querySelector("#profileList").addEventListener("click", handleProfileListClick);
document.querySelector("#shopCollections").addEventListener("click", handleShopListClick);
document.querySelector("#archiveList").addEventListener("click", handleArchiveListClick);
els.buildRoundsBtn.addEventListener("click", buildRounds);
els.roundPlayerSource.addEventListener("change", renderRoundPlayerPicker);
els.roundRotationStyle.addEventListener("change", updateRoundRotationControls);
els.advanceRoundBtn.addEventListener("click", advanceRoundRobin);
els.roundPlayerPicker.addEventListener("change", saveRoundManualSelection);
els.clearRoundsBtn.addEventListener("click", clearAllRounds);
document.querySelector("#roundList").addEventListener("click", handleRoundListClick);
document.querySelector("#roundList").addEventListener("change", handleRoundListChange);
els.seedBracketBtn.addEventListener("click", seedBracket);
els.advanceBracketBtn.addEventListener("click", advanceBracket);
els.tournamentFormat.addEventListener("change", updateTournamentFormatControls);
els.fillRsvpBtn.addEventListener("click", fillRsvp);
els.coupleCheckin.addEventListener("change", toggleCoupleCheckin);
els.fillPartnerBtn.addEventListener("click", fillPartner);
els.cancelEventEditBtn.addEventListener("click", resetEventForm);
els.beginSelectedEventBtn.addEventListener("click", () => beginEvent());
els.cancelPlayerEditBtn.addEventListener("click", resetPlayerForm);
els.cancelProfileEditBtn.addEventListener("click", resetProfileForm);
els.importProfilesBtn.addEventListener("click", () => els.profilesImport.click());
els.profilesImport.addEventListener("change", importProfilesCsv);
els.exportProfilesBtn.addEventListener("click", exportProfilesCsv);
els.cancelShopEditBtn.addEventListener("click", resetShopForm);
els.sendVerificationBtn.addEventListener("click", sendProfileVerification);
els.verifyProfileBtn.addEventListener("click", verifyProfileCode);
els.csvImportBtn.addEventListener("click", () => els.csvImport.click());
els.csvImport.addEventListener("change", importPlayerCsv);
els.exportCsvBtn.addEventListener("click", exportPlayerCsv);
els.templateButtons.forEach((button) => button.addEventListener("click", () => applyEventTemplate(button.dataset.template)));
els.publicFindBtn.addEventListener("click", findPublicPlayer);
els.publicCheckinForm.addEventListener("submit", savePublicCheckin);
els.openWaiverBtn.addEventListener("click", () => openWaiverModal("public"));
els.waiverAgreeBtn.addEventListener("click", agreeToWaiver);
els.waiverDisagreeBtn.addEventListener("click", disagreeToWaiver);
els.mockSyncBtn.addEventListener("click", mockSync);
els.pushCloudBtn.addEventListener("click", pushCloudState);
els.pullCloudBtn.addEventListener("click", pullCloudState);
els.exportArchiveBtn.addEventListener("click", exportArchiveCsv);
els.draftAnnouncementBtn.addEventListener("click", () => draftEmail("announcement"));
els.draftReminderBtn.addEventListener("click", () => draftEmail("reminder"));
els.draftFollowupBtn.addEventListener("click", () => draftEmail("follow-up"));
els.draftSocialBtn.addEventListener("click", draftSocialPost);
els.golfBackdrop.addEventListener("click", closeGolfPreview);
els.closeGolfDrawer.addEventListener("click", closeGolfPreview);

if ("serviceWorker" in navigator) {
  let refreshingForUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshingForUpdate) return;
    refreshingForUpdate = true;
    window.location.reload();
  });
  navigator.serviceWorker.register(`sw.js?v=${encodeURIComponent(APP_VERSION)}`).then((registration) => {
    registration.update().catch(() => {});
    setInterval(() => registration.update().catch(() => {}), 15 * 60 * 1000);
  }).catch(() => {});
}

autoArchiveEndedEvents();
initializeAuthPanels();
applyLaunchMode();
render();
initProfileCompletionLink();

function loadState() {
  const fallback = {
    mode: "pickleball",
    events: [],
    players: [],
    posts: [],
    rounds: [],
    bracket: [],
    archivedEvents: [],
    shopCollections: DEFAULT_SHOP_COLLECTIONS.map((item) => ({ ...item, id: newId(), url: "https://www.paddleandpin.com" })),
    publicView: { ...DEFAULT_PUBLIC_VIEW },
    verificationCodes: {},
    admins: [{ id: "owner", name: "Event Owner", email: LOCAL_ADMIN_EMAIL, role: "Host Admin" }],
    profiles: [],
    golfProfile: {},
    golfTeeTimes: [],
    golfGroups: [],
    golfMessages: [],
    golfMatchIndex: 0,
    societySessionEmail: "",
    societyFavorites: [],
    societyFriends: [],
    societyFriendFilter: "all",
    selectedSocietyProfileId: "",
    clubGroups: [],
    casualMatches: [],
    casualMatchFilter: "all",
    quickGames: [],
    quickGameFilter: "all",
    courtFilter: "all",
    paddlePintImportedIds: [],
    roundSettings: { selectedPlayerIds: [], teams: [], partnerTeams: [], teamMatchQueue: [], sequentialTeams: [], sequentialMatchesRemaining: 0 },
    selectedEventRosterId: "",
    sync: { status: "Local only", lastSync: "", pending: 0 },
    storageMeta: {
      schemaVersion: STORAGE_SCHEMA_VERSION,
      appVersion: APP_VERSION,
      lastSavedAt: "",
      note: "Club Society saves member data outside the app cache so updates do not erase profiles.",
    },
    cloudMemberSync: {
      email: "",
      token: "",
      lastPulledAt: "",
      lastPushedAt: "",
      status: "Local only",
    },
  };

  try {
    return normalizeState({ ...fallback, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) });
  } catch {
    return normalizeState(fallback);
  }
}

function normalizeState(data) {
  data.publicView = { ...DEFAULT_PUBLIC_VIEW, ...(data.publicView || {}) };
  data.shopCollections = (data.shopCollections && data.shopCollections.length ? data.shopCollections : DEFAULT_SHOP_COLLECTIONS)
    .map((item) => ({ url: "https://www.paddleandpin.com", id: item.id || newId(), ...item }));
  data.archivedEvents = data.archivedEvents || [];
  data.verificationCodes = data.verificationCodes || {};
  data.profiles = (data.profiles || []).map((profile) => ({
    ...DEFAULT_LOCATION,
    verificationStatus: profile.verificationStatus || "Unverified",
    verificationMethod: profile.verificationMethod || "email",
    waiver: profile.waiver || "Needs Signature",
    waiverSignedAt: profile.waiverSignedAt || "",
    waiverSource: profile.waiverSource || "",
    waiverAgreementText: profile.waiverAgreementText || "",
    discoverable: profile.discoverable === true,
    gender: profile.gender || "",
    ...profile,
  }));
  data.players = (data.players || []).map((player) => ({
    waiverSignedAt: "",
    waiverSource: "",
    waiverAgreementText: "",
    checkedInAt: "",
    gender: "",
    ...player,
  }));
  data.events = data.events || [];
  data.golfProfile = data.golfProfile || {};
  data.golfTeeTimes = data.golfTeeTimes || [];
  data.golfGroups = data.golfGroups || [];
  data.golfMessages = data.golfMessages || [];
  data.golfMatchIndex = data.golfMatchIndex || 0;
  data.societySessionEmail = data.societySessionEmail || "";
  data.societyFavorites = data.societyFavorites || [];
  data.societyFriends = data.societyFriends || [];
  data.societyFriendFilter = data.societyFriendFilter || "all";
  data.selectedSocietyProfileId = data.selectedSocietyProfileId || "";
  data.clubGroups = data.clubGroups || [];
  data.casualMatches = data.casualMatches || [];
  data.casualMatchFilter = data.casualMatchFilter || "all";
  data.quickGames = data.quickGames || [];
  data.quickGameFilter = data.quickGameFilter || "all";
  data.courtFilter = data.courtFilter || "all";
  data.paddlePintImportedIds = data.paddlePintImportedIds || [];
  data.roundSettings = { selectedPlayerIds: [], teams: [], partnerTeams: [], teamMatchQueue: [], sequentialTeams: [], sequentialMatchesRemaining: 0, ...(data.roundSettings || {}) };
  data.selectedEventRosterId = data.selectedEventRosterId || "";
  data.storageMeta = {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    lastSavedAt: data.storageMeta?.lastSavedAt || "",
    note: "Club Society saves member data outside the app cache so updates do not erase profiles.",
  };
  data.cloudMemberSync = {
    email: "",
    token: "",
    lastPulledAt: "",
    lastPushedAt: "",
    status: "Local only",
    ...(data.cloudMemberSync || {}),
  };
  return data;
}

function saveState() {
  state.storageMeta = {
    ...state.storageMeta,
    schemaVersion: STORAGE_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    lastSavedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  scheduleMemberCloudSync();
}

function saveCloudMemberCredentials(email, token) {
  if (!email || !token) return;
  state.cloudMemberSync = {
    ...(state.cloudMemberSync || {}),
    email: email.toLowerCase(),
    token,
    status: "Cloud sync ready",
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function memberCloudSnapshot() {
  const snapshot = {};
  MEMBER_SYNC_KEYS.forEach((key) => {
    snapshot[key] = state[key];
  });
  snapshot.savedAt = new Date().toISOString();
  snapshot.schemaVersion = STORAGE_SCHEMA_VERSION;
  return snapshot;
}

function memberSignupSnapshot(profile) {
  return {
    profiles: [{
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      gender: profile.gender || "",
      city: profile.city,
      state: profile.state,
      zip: profile.zip,
      preferredSport: profile.preferredSport,
      pickleballLevel: profile.pickleballLevel,
      handicap: profile.handicap,
      discoverable: profile.discoverable,
      allowMessages: profile.allowMessages !== false,
      verificationStatus: profile.verificationStatus,
      source: profile.source,
      updatedAt: profile.updatedAt,
    }],
    societySessionEmail: profile.email,
    savedAt: new Date().toISOString(),
    schemaVersion: STORAGE_SCHEMA_VERSION,
  };
}

function scheduleMemberCloudSync() {
  if (suppressMemberCloudSync || !canUseMemberCloudSync()) return;
  clearTimeout(memberCloudSyncTimer);
  memberCloudSyncTimer = setTimeout(() => pushMemberCloudState(), 900);
}

function canUseMemberCloudSync() {
  return window.location.protocol.startsWith("http")
    && state.cloudMemberSync?.email
    && state.cloudMemberSync?.token;
}

async function pushMemberCloudState(immediate = false) {
  if (!canUseMemberCloudSync()) return;
  clearTimeout(memberCloudSyncTimer);
  const payload = {
    action: "save_app_state",
    email: state.cloudMemberSync.email,
    syncToken: state.cloudMemberSync.token,
    appState: memberCloudSnapshot(),
  };
  try {
    const response = await fetch("/api/member-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.error || "Cloud sync failed");
    state.cloudMemberSync.lastPushedAt = result.savedAt || new Date().toISOString();
    state.cloudMemberSync.status = immediate ? "Cloud backup saved" : "Synced";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    state.cloudMemberSync.status = "Cloud sync pending";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function mergeMemberCloudState(appState) {
  if (!appState || typeof appState !== "object") return;
  suppressMemberCloudSync = true;
  state.profiles = mergeRecords(state.profiles, appState.profiles, (item) => item.email || item.id);
  state.clubGroups = mergeRecords(state.clubGroups, appState.clubGroups, (item) => item.id);
  state.casualMatches = mergeRecords(state.casualMatches, appState.casualMatches, (item) => item.id);
  state.quickGames = mergeRecords(state.quickGames, appState.quickGames, (item) => item.id);
  state.posts = mergeRecords(state.posts, appState.posts, (item) => item.id);
  state.golfTeeTimes = mergeRecords(state.golfTeeTimes, appState.golfTeeTimes, (item) => item.id);
  state.golfGroups = mergeRecords(state.golfGroups, appState.golfGroups, (item) => item.id);
  state.golfMessages = mergeRecords(state.golfMessages, appState.golfMessages, (item) => item.id);
  state.societyFavorites = mergeValues(state.societyFavorites, appState.societyFavorites);
  state.societyFriends = mergeValues(state.societyFriends, appState.societyFriends);
  ["golfMatchIndex", "societyFriendFilter", "quickGameFilter", "casualMatchFilter", "courtFilter"].forEach((key) => {
    if (appState[key] !== undefined && appState[key] !== null && appState[key] !== "") state[key] = appState[key];
  });
  state.cloudMemberSync.lastPulledAt = new Date().toISOString();
  state.cloudMemberSync.status = "Cloud data loaded";
  suppressMemberCloudSync = false;
}

function mergeRecords(localItems = [], cloudItems = [], identityFor) {
  const records = new Map();
  [...(cloudItems || []), ...(localItems || [])].forEach((item) => {
    if (!item || typeof item !== "object") return;
    const identity = String(identityFor(item) || item.id || newId()).toLowerCase();
    const existing = records.get(identity) || {};
    records.set(identity, { ...existing, ...item });
  });
  return [...records.values()].sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")));
}

function mergeValues(localItems = [], cloudItems = []) {
  return [...new Set([...(cloudItems || []), ...(localItems || [])].filter(Boolean))];
}

function setView(id) {
  if (id === "societyApp" && !isStandaloneLaunch) id = "command";
  if (id !== "societyApp" && isStandaloneLaunch) id = "societyApp";
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === id));
  els.views.forEach((view) => view.classList.toggle("active", view.id === id));
}

function applyLaunchMode() {
  if (isUnsupportedHostedLaunch) {
    window.location.replace("https://clubsociety.app");
    return;
  }

  if (isStandaloneLaunch) {
    document.body.classList.add("standalone-member-app");
    document.title = "Club Society App";
    setView("societyApp");
    setSocietyTab("home");
    preserveMemberStorage();
    return;
  }

  if (isDashboardLaunch) {
    document.body.classList.add("admin-mode");
    document.title = "Club Society Dashboard";
    setView("command");
    document.querySelector("#societyApp")?.remove();
  }
}

async function preserveMemberStorage() {
  if (!navigator.storage?.persist) return;
  try {
    const alreadyPersistent = await navigator.storage.persisted();
    if (!alreadyPersistent) await navigator.storage.persist();
  } catch {
    // Some browsers do not expose persistent storage for installed web apps.
  }
}

function setMode(mode) {
  state.mode = mode;
  els.modes.forEach((item) => item.classList.toggle("active", item.dataset.mode === mode));
  saveState();
  render();

  if (mode === "golf") {
    closeGolfPreview();
    setView("societyApp");
    setSocietyTab("golfHome");
    return;
  }
  closeGolfPreview();
  setView("command");
}

function openGolfPreview() {
  setView("golfSoon");
  document.body.classList.add("golf-drawer-open");
  els.golfDrawer.setAttribute("aria-hidden", "false");
}

function closeGolfPreview() {
  document.body.classList.remove("golf-drawer-open");
  els.golfDrawer.setAttribute("aria-hidden", "true");
}

function render() {
  els.modes.forEach((item) => item.classList.toggle("active", item.dataset.mode === state.mode));
  updateTournamentFormatControls();
  renderMetrics();
  renderEvents();
  renderEventRoster();
  renderEventOptions();
  renderPublicEvents();
  renderPlayers();
  renderRsvpOptions();
  renderWaivers();
  renderCommunity();
  renderRounds();
  renderBracket();
  renderHost();
  renderAdmins();
  renderSync();
  renderProfiles();
  renderShopCollections();
  renderArchive();
  renderIntegrationConfig();
  renderPaddlePintSyncConfig();
  renderIntegrationEventOptions();
  renderCloudConfig();
  renderCloudStatus();
  renderGolf();
  renderClubGroups();
  renderMyGroups();
  updateMemberSuggestions();
  updateSocietyHome();
}

function applyEventTemplate(key) {
  const template = EVENT_TEMPLATES[key];
  if (!template) return;

  Object.entries(template).forEach(([name, value]) => {
    const field = els.eventForm.elements[name];
    if (field) field.value = value;
  });
  els.eventForm.elements.slug.value = slugify(template.name);
  els.eventForm.elements.published.value = "true";

  if (key === "scramble") setMode("golf");
  else setMode("pickleball");
}

function saveEvent(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.eventForm).entries());
  const validation = validateEvent(data);
  if (!validation.ok) {
    showAdminMessage("#eventList", "notice", validation.message);
    return;
  }
  const existing = state.events.find((item) => item.id === data.eventId);
  const eventRecord = {
    ...data,
    id: existing?.id || newId(),
    sport: state.mode,
    slug: data.slug || slugify(data.name),
    published: data.published === "true",
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  delete eventRecord.eventId;
  if (existing) Object.assign(existing, eventRecord);
  else state.events.unshift(eventRecord);
  saveState();
  resetEventForm();
  render();
  showAdminMessage("#eventList", "success", existing ? "Event updated." : "Event created.");
}

function validateEvent(data) {
  if (!data.name?.trim()) return { ok: false, message: "Event name is required." };
  if (!data.venue?.trim()) return { ok: false, message: "Venue is required." };
  if (!data.date) return { ok: false, message: "Event date is required." };
  if (Number(data.capacity) < 2) return { ok: false, message: "Capacity must be at least 2." };
  if (Number(data.courts) < 1) return { ok: false, message: "Courts or bays must be at least 1." };
  return { ok: true };
}

function resetEventForm() {
  els.eventForm.reset();
  els.eventForm.elements.eventId.value = "";
  els.eventForm.elements.name.value = "Paddle + Pint Night";
  els.eventForm.elements.venue.value = "South Main Brewing";
  els.eventForm.elements.date.value = new Date().toISOString().slice(0, 10);
  els.eventForm.elements.format.value = "Round Robin";
  els.eventForm.elements.capacity.value = "32";
  els.eventForm.elements.courts.value = "4";
  els.eventForm.elements.published.value = "true";
  els.eventForm.querySelector("button[type=submit]").textContent = "Save Event";
}

function savePlayer(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.playerForm).entries());
  const checkingInPartner = data.checkInPartner === "on";
  if (checkingInPartner && (!data.partnerFirstName?.trim() || !data.partnerLastName?.trim() || !isValidEmail(data.partnerEmail))) {
    showAdminMessage("#playerList", "notice", "Enter the partner's first name, last name, and valid email.");
    return;
  }
  if (checkingInPartner && data.partnerEmail.trim().toLowerCase() === data.email.trim().toLowerCase()) {
    showAdminMessage("#playerList", "notice", "Choose a different member as the partner.");
    return;
  }
  if (data.waiver !== "Signed") {
    els.playerForm.dataset.pendingSubmit = "true";
    openWaiverModal("admin-primary");
    return;
  }
  if (checkingInPartner && data.partnerWaiver !== "Signed") {
    els.playerForm.dataset.pendingSubmit = "true";
    openWaiverModal("admin-partner");
    return;
  }
  const existing = state.players.find((player) => player.id === data.playerId)
    || state.players.find((player) => player.email?.toLowerCase() === data.email.toLowerCase());
  const waiverAudit = buildWaiverAudit(data.waiver, {
    ...existing,
    waiverSignedAt: existing?.waiverSignedAt || els.playerForm.dataset.waiverSignedAt,
    waiverSource: existing?.waiverSource || els.playerForm.dataset.waiverSource,
  }, "Admin check-in waiver modal");
  const player = {
    ...data,
    id: existing?.id || newId(),
    sport: state.mode,
    checkedIn: !["Waitlist", "Left event"].includes(data.status),
    status: data.status || "Checked in",
    checkedInAt: existing?.checkedInAt || new Date().toISOString(),
    ...waiverAudit,
  };
  delete player.playerId;
  ["checkInPartner", "partnerFirstName", "partnerLastName", "partnerEmail", "partnerPhone", "partnerGender", "partnerSkill", "partnerWaiver"].forEach((field) => delete player[field]);

  if (existing) Object.assign(existing, player);
  else state.players.unshift(player);
  if (player.checkedIn) {
    upsertPlayerDirectoryProfile({
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      phone: player.phone,
      gender: player.gender || "",
      skill: player.skill,
      waiver: player.waiver,
      waiverSignedAt: player.waiverSignedAt,
      waiverSource: player.waiverSource,
      waiverAgreementText: player.waiverAgreementText,
      interests: ["Played event", "Social round robins"],
      source: eventName(player.eventId) || "Admin check-in",
    });
  }

  if (checkingInPartner) savePartnerCheckin(data, player);

  resetPlayerForm();
  saveState();
  render();
  showAdminMessage("#playerList", "success", checkingInPartner ? "Both partners are checked in." : existing ? "Player updated." : "Player checked in.");
}

function savePartnerCheckin(data, primaryPlayer) {
  const existing = state.players.find((player) => player.id === els.playerForm.dataset.partnerPlayerId)
    || state.players.find((player) => player.email?.toLowerCase() === data.partnerEmail.toLowerCase());
  const waiverAudit = buildWaiverAudit(data.partnerWaiver, {
    ...existing,
    waiverSignedAt: existing?.waiverSignedAt || els.playerForm.dataset.partnerWaiverSignedAt,
    waiverSource: existing?.waiverSource || els.playerForm.dataset.partnerWaiverSource,
  }, "Admin partner waiver modal");
  const partner = {
    id: existing?.id || newId(),
    firstName: data.partnerFirstName,
    lastName: data.partnerLastName,
    email: data.partnerEmail,
    phone: data.partnerPhone || "",
    gender: data.partnerGender || "",
    skill: data.partnerSkill || "Intermediate",
    waiver: data.partnerWaiver,
    status: "Checked in",
    paid: data.paid || "Not tracked",
    eventId: data.eventId,
    notes: `Checked in with ${primaryPlayer.firstName} ${primaryPlayer.lastName}`,
    checkedIn: true,
    checkedInAt: existing?.checkedInAt || new Date().toISOString(),
    sport: state.mode,
    partnerPlayerId: primaryPlayer.id,
    partnerName: `${primaryPlayer.firstName} ${primaryPlayer.lastName}`,
    ...waiverAudit,
  };
  if (existing) Object.assign(existing, partner);
  else state.players.unshift(partner);
  const savedPrimary = state.players.find((player) => player.id === primaryPlayer.id);
  if (savedPrimary) {
    savedPrimary.partnerPlayerId = partner.id;
    savedPrimary.partnerName = `${partner.firstName} ${partner.lastName}`;
  }
  upsertPlayerDirectoryProfile({
    firstName: partner.firstName,
    lastName: partner.lastName,
    email: partner.email,
    phone: partner.phone,
    gender: partner.gender || "",
    skill: partner.skill,
    waiver: partner.waiver,
    waiverSignedAt: partner.waiverSignedAt,
    waiverSource: partner.waiverSource,
    waiverAgreementText: partner.waiverAgreementText,
    interests: ["Played event", "Social round robins"],
    source: eventName(partner.eventId) || "Couple check-in",
  });
}

function resetPlayerForm() {
  els.playerForm.reset();
  els.playerForm.dataset.pendingSubmit = "";
  els.playerForm.dataset.waiverSignedAt = "";
  els.playerForm.dataset.waiverSource = "";
  els.playerForm.dataset.partnerPlayerId = "";
  els.playerForm.dataset.partnerWaiverSignedAt = "";
  els.playerForm.dataset.partnerWaiverSource = "";
  els.playerForm.elements.playerId.value = "";
  els.playerForm.elements.status.value = "Checked in";
  els.playerForm.elements.paid.value = "Not tracked";
  els.playerForm.querySelector("button[type=submit]").textContent = "Check In";
  toggleCoupleCheckin();
}

function buildWaiverAudit(waiverStatus, existing = {}, source = "Check-in") {
  const signed = waiverStatus === "Signed";
  if (!signed) {
    return {
      waiverSignedAt: "",
      waiverSource: "",
      waiverAgreementText: "",
    };
  }
  return {
    waiverSignedAt: existing?.waiverSignedAt || new Date().toISOString(),
    waiverSource: existing?.waiverSource || source,
    waiverAgreementText: existing?.waiverAgreementText || "Player selected I Agree to the Club Society / Paddle + Pint liability waiver before check-in.",
  };
}

async function sendSocietySignupConfirmation(profile) {
  if (!window.location.protocol.startsWith("http")) {
    return { ok: false, message: "Open https://clubsociety.app to create a real account. This local preview cannot save users to Cloudflare or send verification emails." };
  }

  try {
    const response = await fetch("/api/member-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        password: profile.password,
        phone: profile.phone,
        sport: profile.preferredSport,
        city: profile.city,
        state: profile.state,
        zip: profile.zip,
        appState: memberSignupSnapshot(profile),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      return { ok: false, message: result.error || "Profile saved, but the confirmation email could not be sent yet." };
    }
    if (result.emailSent) {
      saveCloudMemberCredentials(profile.email, result.syncToken);
      pushMemberCloudState(true);
      return { ok: true, message: "Welcome to Club Society. Check your email to verify your account and finish your profile." };
    }
    saveCloudMemberCredentials(profile.email, result.syncToken);
    pushMemberCloudState(true);
    return { ok: true, message: result.emailWarning || "Profile saved, but the verification email did not send. Check the Brevo settings in Cloudflare." };
  } catch {
    return { ok: false, message: "Cloud signup is not reachable from this device yet. Open https://clubsociety.app and try again." };
  }
}

async function sendForgotPasswordEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    showSocietyAccountMessage("Enter a valid email address first.", "error");
    return;
  }

  if (!window.location.protocol.startsWith("http")) {
    showSocietyAccountMessage("Password reset emails send from the hosted app.", "notice");
    return;
  }

  try {
    const response = await fetch("/api/member-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "forgot_password", email: normalizedEmail }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      showSocietyAccountMessage(result.error || "Password reset could not be started yet.", "error");
      return;
    }
    showSocietyAccountMessage("If that email is in Club Society, a password reset link is on the way.", "success");
  } catch {
    showSocietyAccountMessage("Password reset is not reachable from this device yet. Try the hosted app.", "error");
  }
}

async function initProfileCompletionLink() {
  const url = new URL(window.location.href);
  const resetToken = url.searchParams.get("resetPassword");
  const resetEmail = url.searchParams.get("email") || "";
  if (resetToken) {
    setView("societyApp");
    setSocietyTab("home");
    setAuthPanel("reset");
    els.societyAccountForm.elements.resetToken.value = resetToken;
    els.societyAccountForm.elements.resetEmail.value = resetEmail;
    els.societyAccountForm.elements.resetNewPassword.focus();
    showSocietyAccountMessage("Create a new password below. This reset link expires after one hour.", "notice");
    return;
  }

  const token = url.searchParams.get("completeProfile");
  if (!token) return;

  setView("societyApp");
  setSocietyTab("home");

  if (!window.location.protocol.startsWith("http")) {
    toggleSocietyProfileDrawer(true);
    els.societyAccountMessage.textContent = "Complete your profile by adding your photo and details.";
    return;
  }

  try {
    const response = await fetch(`/api/member-signup?token=${encodeURIComponent(token)}`);
    const result = await response.json().catch(() => ({}));
    if (response.ok && result.ok && result.member) {
      upsertSocietyProfileFromCompletion(result.member);
      url.searchParams.delete("completeProfile");
      window.history.replaceState({}, "", url.toString());
    }
  } catch {
    // The profile drawer still opens even if the lookup is unavailable.
  }

  toggleSocietyProfileDrawer(true);
  els.societyAccountMessage.textContent = "Complete your profile by adding your photo and details.";
}

function upsertSocietyProfileFromCompletion(member) {
  const existing = state.profiles.find((profile) => profile.email?.toLowerCase() === member.email.toLowerCase());
  const profile = {
    ...(existing || {}),
    id: existing?.id || newId(),
    firstName: titleCase(member.firstName || existing?.firstName || ""),
    lastName: titleCase(member.lastName || existing?.lastName || ""),
    email: member.email.toLowerCase(),
    phone: member.phone || existing?.phone || "",
    city: member.city || existing?.city || "Watkinsville",
    state: member.state || existing?.state || "GA",
    zip: member.zip || existing?.zip || "30677",
    preferredSport: member.sport || existing?.preferredSport || "both",
    sport: member.sport === "golf" ? "golf" : "pickleball",
    stayLoggedIn: true,
    source: "Email profile completion",
    verificationStatus: "Verified",
    updatedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, profile);
  else state.profiles.unshift(profile);
  state.societySessionEmail = profile.email;
  saveState();
  updateSocietyHome();
}

function validateSocietyPassword(password, confirmPassword) {
  if (!password) return { ok: false, message: "Create a password to join Club Society." };
  if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { ok: false, message: "Passwords do not match." };
  return { ok: true };
}

function showSocietyAccountMessage(message, type = "notice") {
  if (!els.societyAccountMessage) return;
  els.societyAccountMessage.className = `society-message ${type}`;
  if (type === "success" && /check your email|verify/i.test(message)) {
    els.societyAccountMessage.innerHTML = `
      <div class="society-welcome-confirmation">
        <span class="society-confirmation-icon">CS</span>
        <div>
          <strong>Welcome to Club Society.</strong>
          <p>${escapeHtml(message)}</p>
        </div>
      </div>
    `;
    return;
  }
  els.societyAccountMessage.textContent = message;
}

async function signInSocietyMember(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  if (window.location.protocol.startsWith("http")) {
    try {
      const response = await fetch("/api/member-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signin", email: normalizedEmail, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        if (result.needsPasswordSetup) {
          showSocietyAccountMessage(result.error, "notice");
          setAuthPanel("signup");
          els.societyAccountForm.elements.email.value = normalizedEmail;
          els.societyAccountForm.elements.email.focus();
          return;
        }
        showSocietyAccountMessage(result.error || "That email and password did not match.", "error");
        return;
      }
      if (result.member) upsertSocietyProfileFromCompletion(result.member);
      saveCloudMemberCredentials(normalizedEmail, result.syncToken);
      if (result.appState) mergeMemberCloudState(result.appState);
      state.societySessionEmail = normalizedEmail;
      saveState();
      updateSocietyHome();
      render();
      localStorage.setItem("clubSociety.stayLoggedIn.v1", String(els.societyAccountForm.elements.signinStayLoggedIn.checked));
      showSocietyAccountMessage(result.emailVerified
        ? "Welcome back. Your Club Society data is synced."
        : "Welcome back. Please verify your email from your Club Society welcome email.", "success");
      return;
    } catch {
      showSocietyAccountMessage("Sign-in is not reachable from this device yet. Try the hosted app.", "error");
      return;
    }
  }

  const profile = state.profiles.find((item) => item.email?.toLowerCase() === normalizedEmail);
  if (!profile) {
    showSocietyAccountMessage("That member profile was not found on this device.", "error");
    return;
  }
  state.societySessionEmail = normalizedEmail;
  saveState();
  updateSocietyHome();
  showSocietyAccountMessage("Welcome back. Local sign-in is active on this device.", "success");
}

function savePost(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.postForm).entries());
  state.posts.unshift({ ...data, id: newId(), sport: state.mode, createdAt: new Date().toISOString() });
  els.postForm.reset();
  saveState();
  render();
}

async function saveSocietyAccount(event) {
  event.preventDefault();
  if (document.querySelector('[data-auth-content="reset"]')?.classList.contains("active")) {
    await saveResetPassword();
    return;
  }
  const data = Object.fromEntries(new FormData(els.societyAccountForm).entries());
  const passwordValidation = validateSocietyPassword(data.password, data.confirmPassword);
  if (!passwordValidation.ok) {
    showSocietyAccountMessage(passwordValidation.message, "error");
    return;
  }
  if (!window.location.protocol.startsWith("http")) {
    showSocietyAccountMessage("Open https://clubsociety.app to join. This local preview cannot save users to the Cloudflare database or send verification email.", "error");
    return;
  }
  const signupButton = els.societyAccountForm.querySelector("[data-signup-submit]");
  const signupLabel = signupButton?.textContent || "Create My Society Pass";
  if (signupButton) {
    signupButton.disabled = true;
    signupButton.textContent = "Creating your Society Pass…";
  }
  const existing = state.profiles.find((profile) => profile.email?.toLowerCase() === data.email.toLowerCase());
  const previousExisting = existing ? { ...existing } : null;
  const previousSessionEmail = state.societySessionEmail;
  const sport = data.sport === "both" ? "pickleball" : data.sport || "pickleball";
  const level = data.sport === "golf" ? (data.handicap ? `Golf handicap ${data.handicap}` : "Golf member") : (data.pickleballLevel || "Open");
  const password = data.password;
  const profile = {
    id: existing?.id || newId(),
    firstName: titleCase(data.firstName),
    lastName: titleCase(data.lastName),
    email: data.email.trim().toLowerCase(),
    phone: data.phone || existing?.phone || "",
    street: existing?.street || "",
    city: data.city || existing?.city || "Watkinsville",
    state: data.state || existing?.state || "GA",
    zip: data.zip || existing?.zip || "30677",
    age: data.age || existing?.age || "",
    gender: data.gender || existing?.gender || "",
    preferredSport: data.sport || "both",
    passwordSet: true,
    pickleballLevel: data.pickleballLevel || existing?.pickleballLevel || "",
    handicap: data.handicap || existing?.handicap || "",
    skill: level,
    availability: existing?.availability || "Flexible",
    interests: Array.from(new Set([...(existing?.interests || []), "Find local games", "Social round robins", "Golf groups"])),
    smsSubscriber: existing?.smsSubscriber || false,
    discoverable: data.discoverableSignup === "on" || existing?.discoverable === true,
    stayLoggedIn: data.stayLoggedIn === "on",
    sport,
    verificationStatus: existing?.verificationStatus || "Unverified",
    verificationMethod: existing?.verificationMethod || "email",
    source: "Society Pass signup",
    updatedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, profile);
  else state.profiles.unshift(profile);
  state.societySessionEmail = profile.email;
  saveState();
  renderProfiles();
  updateSocietyHome();
  const emailResult = await sendSocietySignupConfirmation({ ...profile, password });
  if (!emailResult.ok) {
    if (existing && previousExisting) Object.assign(existing, previousExisting);
    else state.profiles = state.profiles.filter((item) => item.id !== profile.id);
    state.societySessionEmail = previousSessionEmail;
    saveState();
    renderProfiles();
    updateSocietyHome();
    showSocietyAccountMessage(emailResult.message, "error");
    if (signupButton) {
      signupButton.disabled = false;
      signupButton.textContent = signupLabel;
    }
    return;
  }
  showSocietyAccountMessage(emailResult.message || (existing
    ? "Welcome back. Your Society Pass profile was updated."
    : "Welcome to Club Society. Check your email to verify your account and finish your profile."), emailResult.ok ? "success" : "error");
  els.societyAccountForm.reset();
  els.societyAccountForm.elements.city.value = "Watkinsville";
  els.societyAccountForm.elements.state.value = "GA";
  els.societyAccountForm.elements.zip.value = "30677";
  if (signupButton) {
    signupButton.disabled = false;
    signupButton.textContent = signupLabel;
  }
  setSocietyTab("home");
}

async function saveResetPassword() {
  const form = els.societyAccountForm.elements;
  const passwordValidation = validateSocietyPassword(form.resetNewPassword.value, form.resetConfirmPassword.value);
  if (!passwordValidation.ok) {
    showSocietyAccountMessage(passwordValidation.message.replace("join Club Society", "continue"), "error");
    return;
  }
  try {
    const response = await fetch("/api/member-signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "reset_password",
        token: form.resetToken.value,
        password: form.resetNewPassword.value,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      showSocietyAccountMessage(result.error || "This reset link could not be used. Request a new one.", "error");
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("resetPassword");
    url.searchParams.delete("email");
    window.history.replaceState({}, "", url.toString());
    const email = form.resetEmail.value;
    els.societyAccountForm.reset();
    setAuthPanel("signin");
    els.societyAccountForm.elements.signinEmail.value = email;
    showSocietyAccountMessage("Your password has been updated. Sign in with your new password.", "success");
    els.societyAccountForm.elements.signinPassword.focus();
  } catch {
    showSocietyAccountMessage("Password reset is temporarily unavailable. Please try again.", "error");
  }
}

function handleSocietyAppClick(event) {
  const authButton = event.target.closest("[data-auth-panel]");
  if (authButton) {
    setAuthPanel(authButton.dataset.authPanel);
    return;
  }

  const signinButton = event.target.closest("[data-signin-submit]");
  if (signinButton) {
    const email = els.societyAccountForm.elements.signinEmail.value.trim();
    const password = els.societyAccountForm.elements.signinPassword.value;
    if (!email) {
      showSocietyAccountMessage("Enter your email address to sign in.", "error");
      return;
    }
    if (!password) {
      showSocietyAccountMessage("Enter your password to sign in.", "error");
      return;
    }
    const originalLabel = signinButton.textContent;
    signinButton.disabled = true;
    signinButton.textContent = "Opening your Society…";
    signInSocietyMember(email, password).finally(() => {
      signinButton.disabled = false;
      signinButton.textContent = originalLabel;
    });
    return;
  }

  const forgotPasswordButton = event.target.closest("[data-forgot-password]");
  if (forgotPasswordButton) {
    const email = els.societyAccountForm.elements.signinEmail.value.trim();
    if (!email) {
      showSocietyAccountMessage("Enter your email address, then tap Forgot password.", "error");
      els.societyAccountForm.elements.signinEmail.focus();
      return;
    }
    sendForgotPasswordEmail(email);
    return;
  }

  const eventTabButton = event.target.closest("[data-society-event-tab]");
  if (eventTabButton) {
    setSocietyEventTab(eventTabButton.dataset.societyEventTab);
    return;
  }

  const favoriteButton = event.target.closest("[data-society-favorite]");
  if (favoriteButton) {
    addSocietyFavorite(favoriteButton.dataset.societyFavorite);
    return;
  }

  const profileToggle = event.target.closest("[data-profile-toggle]");
  if (profileToggle) {
    toggleSocietyProfileDrawer();
    return;
  }

  const profileSave = event.target.closest("[data-profile-save]");
  if (profileSave) {
    saveSocietyProfileFromDrawer();
    return;
  }

  const logoutButton = event.target.closest("[data-logout]");
  if (logoutButton) {
    logoutSociety();
    return;
  }

  const friendFilterButton = event.target.closest("[data-society-friend-filter]");
  if (friendFilterButton) {
    state.societyFriendFilter = friendFilterButton.dataset.societyFriendFilter;
    saveState();
    renderSocietyFriends();
    return;
  }

  const addFriendButton = event.target.closest("[data-friend-add]");
  if (addFriendButton) {
    addSocietyFriend(addFriendButton.dataset.friendAdd);
    return;
  }

  const profileViewButton = event.target.closest("[data-profile-view]");
  if (profileViewButton) {
    showSocietyProfilePreview(profileViewButton.dataset.profileView);
    return;
  }

  const messageFriendButton = event.target.closest("[data-friend-message]");
  if (messageFriendButton) {
    messageSocietyFriend(messageFriendButton.dataset.friendMessage);
    return;
  }

  const groupMessageButton = event.target.closest("[data-group-message]");
  if (groupMessageButton) {
    messageClubGroup(groupMessageButton.dataset.groupMessage);
    return;
  }

  const groupJoinButton = event.target.closest("[data-group-join]");
  if (groupJoinButton) {
    joinClubGroup(groupJoinButton.dataset.groupJoin);
    return;
  }

  const groupDeleteButton = event.target.closest("[data-group-delete]");
  if (groupDeleteButton) {
    deleteClubGroup(groupDeleteButton.dataset.groupDelete);
    return;
  }

  const groupEventButton = event.target.closest("[data-group-add-event]");
  if (groupEventButton) {
    addClubGroupEvent(groupEventButton.dataset.groupAddEvent);
    return;
  }

  const singlesToggle = event.target.closest("[data-singles-toggle]");
  if (singlesToggle) {
    toggleSocialPlay();
    return;
  }

  const matchFilterButton = event.target.closest("[data-match-filter]");
  if (matchFilterButton) {
    state.casualMatchFilter = matchFilterButton.dataset.matchFilter;
    saveState();
    renderCasualMatches();
    return;
  }

  const matchRsvpButton = event.target.closest("[data-match-rsvp]");
  if (matchRsvpButton) {
    rsvpToCasualMatch(matchRsvpButton.dataset.matchRsvp);
    return;
  }

  const matchMessageButton = event.target.closest("[data-match-message]");
  if (matchMessageButton) {
    messagePostCreator(matchMessageButton.dataset.matchMessage);
    return;
  }

  const quickGameFilterButton = event.target.closest("[data-quick-game-filter]");
  if (quickGameFilterButton) {
    state.quickGameFilter = quickGameFilterButton.dataset.quickGameFilter;
    saveState();
    renderQuickGames();
    return;
  }

  const quickGameRsvpButton = event.target.closest("[data-quick-game-rsvp]");
  if (quickGameRsvpButton) {
    rsvpToQuickGame(quickGameRsvpButton.dataset.quickGameRsvp);
    return;
  }

  const quickGameMessageButton = event.target.closest("[data-quick-game-message]");
  if (quickGameMessageButton) {
    messagePostCreator(quickGameMessageButton.dataset.quickGameMessage);
    return;
  }

  const societyEventRsvpButton = event.target.closest("[data-society-event-rsvp]");
  if (societyEventRsvpButton) {
    openEventRsvp(societyEventRsvpButton.dataset.societyEventRsvp);
    return;
  }

  const societyEventMessageButton = event.target.closest("[data-society-event-message]");
  if (societyEventMessageButton) {
    messageEventHost(societyEventMessageButton.dataset.societyEventMessage);
    return;
  }

  const staticEventMessageButton = event.target.closest("[data-static-event-message]");
  if (staticEventMessageButton) {
    messageStaticEventHost(staticEventMessageButton.dataset.staticEventMessage);
    return;
  }

  const courtFilterButton = event.target.closest("[data-court-filter]");
  if (courtFilterButton) {
    state.courtFilter = courtFilterButton.dataset.courtFilter;
    saveState();
    renderCourtDirectory();
    return;
  }

  const tabButton = event.target.closest("[data-society-tab]");
  if (tabButton) {
    setSocietyTab(tabButton.dataset.societyTab);
    return;
  }

  const jumpButton = event.target.closest("[data-jump]");
  if (jumpButton) setView(jumpButton.dataset.jump);
}

function setAuthPanel(panel) {
  els.societyAccountForm.classList.remove("auth-form-collapsed");
  document.querySelectorAll("[data-auth-content]").forEach((item) => {
    const active = item.dataset.authContent === panel;
    item.classList.toggle("active", active);
    item.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = !active;
    });
  });
  document.querySelectorAll("[data-auth-panel]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authPanel === panel);
  });
  els.societyAccountMessage.textContent = "";
  window.setTimeout(() => {
    els.societyAccountForm.scrollIntoView({ behavior: "smooth", block: "start" });
    const firstField = els.societyAccountForm.querySelector(`[data-auth-content="${panel}"] input:not([type="hidden"]):not([readonly])`);
    firstField?.focus({ preventScroll: true });
  }, 60);
}

function initializeAuthPanels() {
  document.querySelectorAll("[data-auth-content]").forEach((item) => {
    const active = item.classList.contains("active");
    item.querySelectorAll("input, select, textarea, button").forEach((control) => {
      control.disabled = !active;
   …28299 tokens truncated…data.waiver || "Needs Signature",
      ...waiverAudit,
      status: "Profile",
      paid: "Not tracked",
      checkedIn: false,
      sport: state.mode,
      source: "Admin profile entry",
    });
  } else {
    existingPlayer.gender = data.gender || existingPlayer.gender || "";
  }

  resetProfileForm();
  saveState();
  render();
  showAdminMessage("#profileList", "success", existing ? "Player profile updated." : "Player profile created.");
}

function renderProfiles() {
  const profiles = state.profiles.filter((profile) => (profile.sport || "pickleball") === state.mode);
  document.querySelector("#profileList").innerHTML = profiles.length
    ? profiles.map((profile) => `
      <article class="profile-card">
        <span class="status-pill ${profile.verificationStatus === "Verified" ? "" : "draft"}">${escapeHtml(profile.verificationStatus || "Unverified")}</span>
        <strong>${escapeHtml(profile.firstName)} ${escapeHtml(profile.lastName)}</strong>
        <p class="meta">${escapeHtml(profile.skill)} | ${escapeHtml(profile.street || "")} ${escapeHtml(profile.city || "Local")}${profile.state ? `, ${escapeHtml(profile.state)}` : ""}${profile.zip ? ` ${escapeHtml(profile.zip)}` : ""}</p>
        <p>${escapeHtml(listText(profile.interests))} | ${escapeHtml(profile.availability)}</p>
        <p class="meta">${escapeHtml(profile.phone || "No phone")} | Gender: ${escapeHtml(profile.gender || "Not specified")} | SMS: ${profile.smsSubscriber ? "Yes" : "No"} | Waiver: ${escapeHtml(profile.waiver || "Needs Signature")}</p>
        <p class="meta">Signup date: ${(profile.signupDate || profile.importedAt || profile.createdAt) ? escapeHtml(formatDateTime(profile.signupDate || profile.importedAt || profile.createdAt)) : "Not recorded"}</p>
        <p class="meta">Waiver proof: ${profile.waiverSignedAt ? `${escapeHtml(formatDateTime(profile.waiverSignedAt))} via ${escapeHtml(profile.waiverSource || "Profile")}` : "Not signed yet"}</p>
        <div class="card-actions">
          <button type="button" data-edit-profile="${escapeHtml(profile.id)}">Edit</button>
          <button class="danger" type="button" data-delete-profile="${escapeHtml(profile.id)}">Delete</button>
        </div>
      </article>
    `).join("")
    : `<div class="empty">Create the first ${escapeHtml(state.mode)} player profile.</div>`;
}

function validateProfile(data) {
  if (!data.firstName?.trim() || !data.lastName?.trim()) return { ok: false, message: "First and last name are required." };
  if (!isValidEmail(data.email)) return { ok: false, message: "A valid email is required." };
  if (!["Female", "Male"].includes(data.gender)) return { ok: false, message: "Select female or male for team balancing." };
  if (data.verificationMethod === "sms" && !isValidPhone(data.phone)) return { ok: false, message: "A valid phone number is required for SMS verification." };
  if (!data.city?.trim() || !data.state?.trim() || !data.zip?.trim()) return { ok: false, message: "City, state, and ZIP are required." };
  return { ok: true };
}

function handleProfileListClick(event) {
  const editButton = event.target.closest("[data-edit-profile]");
  const deleteButton = event.target.closest("[data-delete-profile]");
  if (editButton) editProfile(editButton.dataset.editProfile);
  if (deleteButton) deleteProfile(deleteButton.dataset.deleteProfile);
}

function editProfile(id) {
  const profile = state.profiles.find((item) => item.id === id);
  if (!profile) return;
  resetProfileForm();
  Object.entries(profile).forEach(([name, value]) => {
    const field = els.profileForm.elements[name === "id" ? "profileId" : name];
    if (field && field.type !== "checkbox") field.value = Array.isArray(value) ? "" : value || "";
  });
  els.profileForm.elements.profileId.value = profile.id;
  els.profileForm.elements.smsSubscriber.checked = Boolean(profile.smsSubscriber);
  els.profileForm.querySelectorAll("[name=interests]").forEach((input) => {
    input.checked = (profile.interests || []).includes(input.value);
  });
  els.profileForm.querySelector("button[type=submit]").textContent = "Update Profile";
  els.profileVerificationStatus.textContent = profile.verificationStatus === "Verified" ? "Verified" : "Not verified";
  els.profileVerificationStatus.classList.toggle("signed", profile.verificationStatus === "Verified");
  els.profileForm.dataset.verified = profile.verificationStatus === "Verified" ? "true" : "";
  els.profileForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteProfile(id) {
  const profile = state.profiles.find((item) => item.id === id);
  if (!profile) return;
  if (!window.confirm(`Delete ${profile.firstName} ${profile.lastName}'s profile?`)) return;
  state.profiles = state.profiles.filter((item) => item.id !== id);
  saveState();
  render();
  showAdminMessage("#profileList", "success", "Player profile deleted.");
}

function resetProfileForm() {
  els.profileForm.reset();
  els.profileForm.elements.profileId.value = "";
  resetProfileLocationDefaults();
  els.profileForm.querySelector("button[type=submit]").textContent = "Save Profile";
  els.profileForm.dataset.verified = "";
  els.profileVerificationStatus.textContent = "Not verified";
  els.profileVerificationStatus.classList.remove("signed");
}

function resetProfileLocationDefaults() {
  if (!els.profileForm) return;
  els.profileForm.elements.city.value = DEFAULT_LOCATION.city;
  els.profileForm.elements.state.value = DEFAULT_LOCATION.state;
  els.profileForm.elements.zip.value = DEFAULT_LOCATION.zip;
}

function sendProfileVerification() {
  const data = Object.fromEntries(new FormData(els.profileForm).entries());
  const method = data.verificationMethod || "email";
  const target = method === "sms" ? data.phone : data.email;
  if (method === "sms" && !isValidPhone(target)) {
    showAdminMessage("#profileList", "notice", "Enter a valid phone number before sending an SMS verification code.");
    return;
  }
  if (method === "email" && !isValidEmail(target)) {
    showAdminMessage("#profileList", "notice", "Enter a valid email before sending a verification code.");
    return;
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  state.verificationCodes[String(target).toLowerCase()] = { code, method, createdAt: new Date().toISOString() };
  saveState();
  els.profileVerificationStatus.textContent = `Code created: ${code}`;
  showAdminMessage("#profileList", "success", `Prototype ${method.toUpperCase()} code created. In production, this sends through Brevo/Twilio or Supabase Auth.`);
}

function verifyProfileCode() {
  const data = Object.fromEntries(new FormData(els.profileForm).entries());
  const target = String(data.verificationMethod === "sms" ? data.phone : data.email || "").toLowerCase();
  const record = state.verificationCodes[target];
  if (!record || record.code !== data.verificationCode) {
    showAdminMessage("#profileList", "notice", "Verification code does not match.");
    return;
  }
  els.profileForm.dataset.verified = "true";
  els.profileVerificationStatus.textContent = "Verified";
  els.profileVerificationStatus.classList.add("signed");
  showAdminMessage("#profileList", "success", "Profile verified.");
}

function isCurrentProfileVerified() {
  return els.profileForm.dataset.verified === "true";
}

function buildMatchRecommendations() {
  const profileMatches = state.profiles.filter((profile) => (profile.sport || "pickleball") === state.mode).slice(0, 6).map((profile) => ({
    type: "Player",
    title: `${profile.firstName} ${profile.lastName}`,
    meta: `${profile.skill} | ${profile.city || "Local"}${profile.state ? `, ${profile.state}` : ""} | ${profile.availability}`,
    body: `Interested in ${listText(profile.interests)}. Good fit for local Club Society play.`,
  }));
  const postMatches = state.posts.filter((post) => (post.sport || "pickleball") === state.mode).slice(0, 4).map((post) => ({
    type: "Post",
    title: post.type,
    meta: `${post.name} | ${post.location} | ${post.skill}`,
    body: post.body,
  }));
  return [...profileMatches, ...postMatches];
}

function renderShopCollections() {
  document.querySelector("#shopCollections").innerHTML = state.shopCollections.map((collection) => `
    <article class="collection-card">
      <span>${escapeHtml(collection.tag)}</span>
      <strong>${escapeHtml(collection.title)}</strong>
      <p>${escapeHtml(collection.body)}</p>
      <a href="${escapeHtml(collection.url || "https://www.paddleandpin.com")}" target="_blank" rel="noreferrer">Open shop</a>
      <div class="card-actions">
        <button type="button" data-edit-shop="${escapeHtml(collection.id)}">Edit</button>
        <button class="danger" type="button" data-delete-shop="${escapeHtml(collection.id)}">Delete</button>
      </div>
    </article>
  `).join("");
}

function saveShopCollection(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.shopForm).entries());
  if (!data.title?.trim() || !data.tag?.trim() || !data.body?.trim()) {
    showAdminMessage("#shopCollections", "notice", "Title, tag, and description are required.");
    return;
  }
  if (data.url && !/^https?:\/\//i.test(data.url)) {
    showAdminMessage("#shopCollections", "notice", "Shop link must start with http:// or https://.");
    return;
  }
  const existing = state.shopCollections.find((item) => item.id === data.shopId);
  const record = { ...data, id: existing?.id || newId(), url: data.url || "https://www.paddleandpin.com" };
  delete record.shopId;
  if (existing) Object.assign(existing, record);
  else state.shopCollections.unshift(record);
  resetShopForm();
  saveState();
  renderShopCollections();
  showAdminMessage("#shopCollections", "success", existing ? "Shop drop updated." : "Shop drop created.");
}

function handleShopListClick(event) {
  const editButton = event.target.closest("[data-edit-shop]");
  const deleteButton = event.target.closest("[data-delete-shop]");
  if (editButton) editShopCollection(editButton.dataset.editShop);
  if (deleteButton) deleteShopCollection(deleteButton.dataset.deleteShop);
}

function editShopCollection(id) {
  const item = state.shopCollections.find((collection) => collection.id === id);
  if (!item) return;
  Object.entries(item).forEach(([name, value]) => {
    const field = els.shopForm.elements[name === "id" ? "shopId" : name];
    if (field) field.value = value || "";
  });
  els.shopForm.querySelector("button[type=submit]").textContent = "Update Shop Drop";
  els.shopForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteShopCollection(id) {
  const item = state.shopCollections.find((collection) => collection.id === id);
  if (!item) return;
  if (!window.confirm(`Delete shop drop "${item.title}"?`)) return;
  state.shopCollections = state.shopCollections.filter((collection) => collection.id !== id);
  saveState();
  renderShopCollections();
  showAdminMessage("#shopCollections", "success", "Shop drop deleted.");
}

function resetShopForm() {
  els.shopForm.reset();
  els.shopForm.elements.shopId.value = "";
  els.shopForm.elements.url.value = "https://www.paddleandpin.com";
  els.shopForm.querySelector("button[type=submit]").textContent = "Save Shop Drop";
}

function saveCloudConfig(event) {
  event.preventDefault();
  const config = Object.fromEntries(new FormData(els.cloudConfigForm).entries());
  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  state.sync = {
    ...(state.sync || {}),
    status: config.syncMode === "supabase" ? "Supabase configured" : "Local only",
    lastSync: state.sync?.lastSync || "",
  };
  saveState();
  renderCloudStatus("Cloud settings saved.");
  renderSync();
}

function loadCloudConfig() {
  try {
    return {
      syncMode: "local",
      supabaseUrl: "",
      supabaseAnonKey: "",
      clubId: "club-society-main",
      ...JSON.parse(localStorage.getItem(CLOUD_CONFIG_KEY)),
    };
  } catch {
    return { syncMode: "local", supabaseUrl: "", supabaseAnonKey: "", clubId: "club-society-main" };
  }
}

function renderCloudConfig() {
  const config = loadCloudConfig();
  Object.entries(config).forEach(([name, value]) => {
    const field = els.cloudConfigForm.elements[name];
    if (field) field.value = value || "";
  });
}

function renderArchive() {
  document.querySelector("#archiveList").innerHTML = state.archivedEvents.length
    ? state.archivedEvents.map((event) => `
      <article class="card">
        <span class="status-pill">Archived</span>
        <strong>${escapeHtml(event.name)}</strong>
        <p class="meta">${escapeHtml(event.date)} | ${escapeHtml(event.venue)} | ${escapeHtml(event.format)}</p>
        <p class="meta">${event.checkedInCount || 0} checked in / ${event.attendeeCount || 0} saved attendees | Archived ${formatDateTime(event.archivedAt)}</p>
        <div class="card-actions">
          <button type="button" data-export-event-csv="${escapeHtml(event.id)}">Export CSV</button>
          <button type="button" data-export-event-report="${escapeHtml(event.id)}">Printable Report</button>
        </div>
      </article>
    `).join("")
    : `<div class="empty">Archive ended events from the Events tab.</div>`;
  document.querySelector("#archiveExportPanel").innerHTML = `
    <article class="card">
      <strong>Exports available</strong>
      <p class="meta">Archive CSV downloads all completed events. Event CSV downloads one event roster. Printable Report opens a clean HTML report that can be saved as PDF from the browser print dialog.</p>
    </article>
  `;
}

function handleArchiveListClick(event) {
  const csvButton = event.target.closest("[data-export-event-csv]");
  const reportButton = event.target.closest("[data-export-event-report]");
  if (csvButton) exportSingleArchivedEventCsv(csvButton.dataset.exportEventCsv);
  if (reportButton) exportArchivedEventReport(reportButton.dataset.exportEventReport);
}

function exportArchiveCsv() {
  const headers = ["Name", "Date", "Venue", "Format", "Sport", "Attendees", "Checked In", "Archived At"];
  const rows = state.archivedEvents.map((event) => [
    event.name, event.date, event.venue, event.format, event.sport, event.attendeeCount || 0, event.checkedInCount || 0, event.archivedAt,
  ]);
  downloadText(`club-society-event-archive-${todaySlug()}.csv`, [headers, ...rows].map(csvLine).join("\n"), "text/csv");
}

function exportSingleArchivedEventCsv(id) {
  const event = state.archivedEvents.find((item) => item.id === id);
  if (!event) return;
  const headers = ["First Name", "Last Name", "Email", "Phone", "Gender", "Skill", "Status", "Waiver", "Waiver Signed At", "Waiver Source", "Waiver Agreement", "Paid", "Checked In", "Checked In At"];
  const rows = (event.players || []).map((player) => [
    player.firstName,
    player.lastName,
    player.email,
    player.phone,
    player.gender || "",
    player.skill,
    player.status,
    player.waiver,
    player.waiverSignedAt || "",
    player.waiverSource || "",
    player.waiverAgreementText || "",
    player.paid,
    player.checkedIn ? "Yes" : "No",
    player.checkedInAt || "",
  ]);
  downloadText(`${slugify(event.name)}-roster-${todaySlug()}.csv`, [headers, ...rows].map(csvLine).join("\n"), "text/csv");
}

function exportArchivedEventReport(id) {
  const event = state.archivedEvents.find((item) => item.id === id);
  if (!event) return;
  const rows = (event.players || []).map((player) => `
    <tr><td>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</td><td>${escapeHtml(player.email)}</td><td>${escapeHtml(player.status || "")}</td><td>${player.checkedIn ? "Yes" : "No"}</td><td>${escapeHtml(player.waiver || "")}</td><td>${escapeHtml(player.waiverSignedAt ? formatDateTime(player.waiverSignedAt) : "Not signed")}</td></tr>
  `).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(event.name)} Report</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#13262e}h1{color:#0b2231}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}.meta{color:#657477}</style></head><body><h1>${escapeHtml(event.name)}</h1><p class="meta">${escapeHtml(event.date)} | ${escapeHtml(event.venue)} | ${escapeHtml(event.format)}</p><p>${event.checkedInCount || 0} checked in / ${event.attendeeCount || 0} saved attendees.</p><table><thead><tr><th>Player</th><th>Email</th><th>Status</th><th>Checked In</th><th>Waiver</th><th>Waiver Signed At</th></tr></thead><tbody>${rows}</tbody></table><script>window.print();</script></body></html>`;
  downloadText(`${slugify(event.name)}-printable-report.html`, html, "text/html");
}

function loadIntegrationConfig() {
  try {
    return JSON.parse(localStorage.getItem(INTEGRATION_CONFIG_KEY)) || {};
  } catch {
    return {};
  }
}

function saveIntegrationConfig(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.integrationForm).entries());
  localStorage.setItem(INTEGRATION_CONFIG_KEY, JSON.stringify(data));
  renderIntegrationStatus("Integration settings saved. API secrets still belong in Cloudflare environment variables, not this browser app.");
}

function renderIntegrationConfig() {
  const config = loadIntegrationConfig();
  Object.entries(config).forEach(([name, value]) => {
    const field = els.integrationForm.elements[name];
    if (field) field.value = value || "";
  });
  renderIntegrationStatus();
}

function loadPaddlePintSyncConfig() {
  try {
    const config = JSON.parse(localStorage.getItem(PADDLE_PINT_SYNC_CONFIG_KEY)) || {};
    if (!config.endpointUrl || config.endpointUrl.includes("club-society.pages.dev")) {
      config.endpointUrl = PADDLE_PINT_ENDPOINT_URL;
      localStorage.setItem(PADDLE_PINT_SYNC_CONFIG_KEY, JSON.stringify(config));
    }
    return config;
  } catch {
    return {};
  }
}

function savePaddlePintSyncConfig(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.paddlePintSyncForm).entries());
  localStorage.setItem(PADDLE_PINT_SYNC_CONFIG_KEY, JSON.stringify(data));
  renderPaddlePintSyncStatus("Paddle + Pint sync settings saved.");
}

function renderPaddlePintSyncConfig() {
  const config = {
    endpointUrl: PADDLE_PINT_ENDPOINT_URL,
    ...loadPaddlePintSyncConfig(),
  };
  Object.entries(config).forEach(([name, value]) => {
    const field = els.paddlePintSyncForm.elements[name];
    if (field) field.value = value || "";
  });
  if (!els.paddlePintSyncStatus.innerHTML) {
    renderPaddlePintSyncStatus("T-shirt claims and event RSVPs are stored in Cloudflare D1. Import RSVPs here to attach them to app events.");
  }
}

async function importPaddlePintSubmissions() {
  const config = {
    endpointUrl: PADDLE_PINT_ENDPOINT_URL,
    ...loadPaddlePintSyncConfig(),
    ...Object.fromEntries(new FormData(els.paddlePintSyncForm).entries()),
  };
  if (!config.endpointUrl || config.endpointUrl.includes("club-society.pages.dev")) {
    config.endpointUrl = PADDLE_PINT_ENDPOINT_URL;
    els.paddlePintSyncForm.elements.endpointUrl.value = PADDLE_PINT_ENDPOINT_URL;
  }
  if (!config.endpointUrl?.trim()) {
    renderPaddlePintSyncStatus("Add the Club Society endpoint URL first.", "notice");
    return;
  }
  if (!config.adminKey?.trim()) {
    renderPaddlePintSyncStatus("Add the admin sync key first. It must match ADMIN_SYNC_KEY in Cloudflare.", "notice");
    return;
  }

  localStorage.setItem(PADDLE_PINT_SYNC_CONFIG_KEY, JSON.stringify(config));
  renderPaddlePintSyncStatus("Checking Cloudflare for Paddle + Pint RSVPs...");

  try {
    const url = new URL(config.endpointUrl);
    url.searchParams.set("type", "round_robin_event");
    url.searchParams.set("sync_version", "20260810");
    const response = await fetch(url.toString(), {
      headers: { "X-Admin-Key": config.adminKey },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
      renderPaddlePintSyncStatus(result.error || `Sync failed with status ${response.status}`, "notice");
      return;
    }

    const submissions = result.submissions || [];
    const stats = importRoundRobinSubmissions(submissions);
    const latestSignup = submissions.map((submission) => submission.signup_date || submission.created_at).filter(Boolean).sort().at(-1);
    saveState();
    render();
    renderPaddlePintSyncStatus(`Imported ${stats.playersCreated} player RSVP${stats.playersCreated === 1 ? "" : "s"} into ${stats.eventsTouched} event${stats.eventsTouched === 1 ? "" : "s"} and updated ${stats.profilesTouched} reusable player profile${stats.profilesTouched === 1 ? "" : "s"}. Skipped ${stats.skipped} already-imported submission${stats.skipped === 1 ? "" : "s"}.${latestSignup ? ` Latest Cloudflare signup: ${formatDateTime(latestSignup)}.` : ""}`, "success");
  } catch (error) {
    renderPaddlePintSyncStatus(`Sync failed: ${error.message}`, "notice");
  }
}

function importRoundRobinSubmissions(submissions) {
  const imported = new Set(state.paddlePintImportedIds.map(String));
  const touchedEvents = new Set();
  let playersCreated = 0;
  let profilesTouched = 0;
  let skipped = 0;

  submissions
    .filter((submission) => submission.type === "round_robin_event")
    .reverse()
    .forEach((submission) => {
      const submissionId = String(submission.id || `${submission.email}-${submission.event_date}`);
      if (imported.has(submissionId)) {
        skipped += 1;
        return;
      }

      const event = findOrCreatePaddlePintEvent(submission);
      touchedEvents.add(event.id);
      const createdPrimary = upsertImportedPlayer(submission, event.id);
      if (createdPrimary) playersCreated += 1;
      if (upsertDirectoryProfileFromSubmission(submission)) profilesTouched += 1;

      parseAdditionalPlayers(submission.additional_players_json).forEach((guest, index) => {
        const createdGuest = upsertImportedGuestPlayer(guest, submission, event.id, index);
        if (createdGuest) playersCreated += 1;
        if (upsertDirectoryProfileFromGuest(guest, submission)) profilesTouched += 1;
      });

      imported.add(submissionId);
      state.paddlePintImportedIds.push(submissionId);
    });

  return { playersCreated, profilesTouched, skipped, eventsTouched: touchedEvents.size };
}

function findOrCreatePaddlePintEvent(submission) {
  const submittedDate = submission.event_date || "Upcoming";
  const eventDate = dateInputValue(submittedDate);
  let event = state.events.find((item) => item.paddlePintEventDate === submittedDate)
    || state.events.find((item) => item.date === eventDate && /paddle \+ pint/i.test(item.name));

  if (event) return event;

  event = {
    id: newId(),
    name: `Paddle + Pint - ${submittedDate}`,
    venue: "Paddle + Pin",
    date: eventDate,
    format: "Round Robin",
    capacity: "32",
    courts: "4",
    note: "Imported from the Paddle + Pint Shopify form.",
    sport: "pickleball",
    slug: slugify(`paddle-pint-${submittedDate}`),
    published: true,
    paddlePintEventDate: submittedDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.events.unshift(event);
  return event;
}

function upsertImportedPlayer(submission, eventId) {
  const email = String(submission.email || "").trim().toLowerCase();
  const existing = state.players.find((player) => player.email?.toLowerCase() === email && player.eventId === eventId);
  const record = {
    id: existing?.id || newId(),
    firstName: titleCase(submission.first_name || ""),
    lastName: titleCase(submission.last_name || ""),
    email,
    phone: submission.phone || "",
    skill: "Open",
    waiver: "Needs Signature",
    paid: "Not tracked",
    status: "RSVP",
    eventId,
    sport: "pickleball",
    checkedIn: false,
    shirtGender: submission.shirt_gender || "",
    shirtSize: submission.shirt_size || "",
    optionalShirtChoice: submission.optional_shirt_choice || "",
    notes: submission.notes || "",
    source: submission.source || "paddleandpin.com",
    signupDate: submission.signup_date || submission.created_at || "",
    importedSubmissionId: String(submission.id || ""),
  };

  if (existing) {
    Object.assign(existing, record);
    return false;
  }
  state.players.unshift(record);
  return true;
}

function upsertImportedGuestPlayer(guest, submission, eventId, index) {
  const firstName = titleCase(guest.first_name || guest.firstName || "");
  const lastName = titleCase(guest.last_name || guest.lastName || "");
  if (!firstName && !lastName) return false;

  const guestKey = `${submission.id || submission.email}-guest-${index}`;
  const existing = state.players.find((player) => player.importedGuestKey === guestKey);
  if (existing) return false;

  state.players.push({
    id: newId(),
    firstName,
    lastName,
    email: "",
    phone: "",
    skill: "Open",
    waiver: "Needs Signature",
    paid: "Not tracked",
    status: "Additional player",
    eventId,
    sport: "pickleball",
    checkedIn: false,
    notes: `Additional player for ${submission.first_name || ""} ${submission.last_name || ""}`.trim(),
    source: submission.source || "paddleandpin.com",
    signupDate: submission.signup_date || submission.created_at || "",
    importedSubmissionId: String(submission.id || ""),
    importedGuestKey: guestKey,
  });
  return true;
}

function upsertDirectoryProfileFromSubmission(submission) {
  const email = String(submission.email || "").trim().toLowerCase();
  const phone = submission.phone || "";
  const firstName = titleCase(submission.first_name || "");
  const lastName = titleCase(submission.last_name || "");
  if (!email && !phone && !firstName && !lastName) return false;

  return upsertPlayerDirectoryProfile({
    firstName,
    lastName,
    email,
    phone,
    skill: "Open",
    interests: ["Social round robins"],
    source: submission.source || "paddleandpin.com",
    signupDate: submission.signup_date || submission.created_at || "",
  });
}

function upsertDirectoryProfileFromGuest(guest, submission) {
  const firstName = titleCase(guest.first_name || guest.firstName || "");
  const lastName = titleCase(guest.last_name || guest.lastName || "");
  if (!firstName && !lastName) return false;

  return upsertPlayerDirectoryProfile({
    firstName,
    lastName,
    email: "",
    phone: "",
    skill: "Open",
    interests: ["Social round robins"],
    source: submission.source || "paddleandpin.com",
    signupDate: submission.signup_date || submission.created_at || "",
  });
}

function upsertPlayerDirectoryProfile(profile) {
  const email = String(profile.email || "").trim().toLowerCase();
  const phoneDigits = digits(profile.phone);
  const firstName = profile.firstName || "";
  const lastName = profile.lastName || "";
  const nameKey = `${firstName} ${lastName}`.trim().toLowerCase();

  const existing = state.profiles.find((item) => {
    const itemEmail = String(item.email || "").trim().toLowerCase();
    const itemPhone = digits(item.phone);
    const itemName = `${item.firstName || ""} ${item.lastName || ""}`.trim().toLowerCase();
    return (email && itemEmail === email) || (phoneDigits && itemPhone === phoneDigits) || (!email && !phoneDigits && nameKey && itemName === nameKey);
  });

  const record = {
    id: existing?.id || newId(),
    firstName,
    lastName,
    email,
    phone: profile.phone || "",
    gender: profile.gender || existing?.gender || "",
    street: existing?.street || "",
    city: existing?.city || DEFAULT_LOCATION.city,
    state: existing?.state || DEFAULT_LOCATION.state,
    zip: existing?.zip || DEFAULT_LOCATION.zip,
    skill: profile.skill || existing?.skill || "Open",
    waiver: profile.waiver || existing?.waiver || "Needs Signature",
    waiverSignedAt: profile.waiverSignedAt || existing?.waiverSignedAt || "",
    waiverSource: profile.waiverSource || existing?.waiverSource || "",
    waiverAgreementText: profile.waiverAgreementText || existing?.waiverAgreementText || "",
    availability: existing?.availability || "Flexible",
    interests: Array.from(new Set([...(existing?.interests || []), ...(profile.interests || [])])),
    smsSubscriber: existing?.smsSubscriber || false,
    sport: profile.sport || existing?.sport || "pickleball",
    verificationStatus: existing?.verificationStatus || "Imported",
    verificationMethod: existing?.verificationMethod || "email",
    source: profile.source || existing?.source || "Club Society",
    signupDate: profile.signupDate || existing?.signupDate || "",
    importedAt: existing?.importedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existing) {
    Object.assign(existing, record);
    return true;
  }

  state.profiles.unshift(record);
  return true;
}

function renderPaddlePintSyncStatus(message, tone = "") {
  els.paddlePintSyncStatus.innerHTML = `
    <article class="card ${tone}">
      <strong>${escapeHtml(message)}</strong>
      <p class="meta">Endpoint: ${escapeHtml(PADDLE_PINT_ENDPOINT_URL)} | Table: paddle_pint_submissions</p>
    </article>
  `;
}

function renderIntegrationEventOptions() {
  const events = state.events.filter((event) => (event.sport || "pickleball") === state.mode);
  els.integrationEventSelect.innerHTML = events.length
    ? events.map((event) => `<option value="${event.id}">${escapeHtml(event.name)} - ${escapeHtml(event.date)}</option>`).join("")
    : `<option value="">No active events</option>`;
}

function draftEmail(type) {
  const event = state.events.find((item) => item.id === els.integrationEventSelect.value);
  if (!event) {
    renderIntegrationStatus("Create or select an event first.");
    return;
  }
  const subject = type === "reminder" ? `Reminder: ${event.name}` : type === "follow-up" ? `Thanks for coming to ${event.name}` : `Join us for ${event.name}`;
  const body = type === "follow-up"
    ? `Thanks for coming out to ${event.name}. Watch for the next Club Society event soon.`
    : `${event.name} is set for ${event.date} at ${event.venue}. ${event.note || "Reserve your spot with Club Society."}`;
  renderIntegrationStatus(`Draft ${type} email ready. Subject: ${subject}`, body);
}

function draftSocialPost() {
  const event = state.events.find((item) => item.id === els.integrationEventSelect.value);
  if (!event) {
    renderIntegrationStatus("Create or select an event first.");
    return;
  }
  const body = `${event.name} at ${event.venue} on ${event.date}. Play, connect, and challenge with Club Society. RSVP in the app.`;
  renderIntegrationStatus("Facebook/Instagram post draft ready.", body);
}

function renderIntegrationStatus(title = "Connect Brevo and Meta through a secure Cloudflare Worker before sending live messages.", body = "") {
  const config = loadIntegrationConfig();
  els.integrationStatus.innerHTML = `
    <article class="card">
      <strong>${escapeHtml(title)}</strong>
      <p class="meta">Brevo sender: ${escapeHtml(config.brevoSenderEmail || "Not set")} | Facebook Page: ${escapeHtml(config.facebookPageId || "Not set")} | Instagram: ${escapeHtml(config.instagramAccountId || "Not set")}</p>
      ${body ? `<p>${escapeHtml(body)}</p>` : ""}
      <p class="meta">Do not paste API keys here. Store BREVO_API_KEY and Meta tokens as Cloudflare Worker secrets.</p>
    </article>
  `;
}

function renderCloudStatus(message = "") {
  const config = loadCloudConfig();
  const connected = config.syncMode === "supabase" && config.supabaseUrl && config.supabaseAnonKey;
  els.cloudStatus.innerHTML = `
    <div class="sync-grid">
      <article><span>Mode</span><strong>${connected ? "Supabase ready" : "Local only"}</strong></article>
      <article><span>Club ID</span><strong>${escapeHtml(config.clubId || "club-society-main")}</strong></article>
      <article><span>Last sync</span><strong>${state.sync?.lastSync ? formatDateTime(state.sync.lastSync) : "Not synced"}</strong></article>
      <article><span>Records</span><strong>${state.events.length} events / ${state.players.length} players</strong></article>
    </div>
    <p class="meta">${escapeHtml(message || (connected ? "Ready to push or pull shared data." : "Add Supabase settings when your hosted database is ready."))}</p>
  `;
}

async function pushCloudState() {
  const config = requireSupabaseConfig();
  if (!config) return;

  try {
    const response = await fetch(`${cleanUrl(config.supabaseUrl)}/rest/v1/club_state`, {
      method: "POST",
      headers: supabaseHeaders(config, { Prefer: "resolution=merge-duplicates" }),
      body: JSON.stringify({
        club_id: config.clubId,
        payload: state,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!response.ok) throw new Error(`Cloud push failed: ${response.status}`);
    state.sync = { ...(state.sync || {}), status: "Cloud push complete", lastSync: new Date().toISOString(), pending: 0 };
    saveState();
    renderSync();
    renderCloudStatus("Local data pushed to Supabase.");
  } catch (error) {
    renderCloudStatus(error.message);
  }
}

async function pullCloudState() {
  const config = requireSupabaseConfig();
  if (!config) return;

  try {
    const response = await fetch(`${cleanUrl(config.supabaseUrl)}/rest/v1/club_state?club_id=eq.${encodeURIComponent(config.clubId)}&select=payload,updated_at`, {
      headers: supabaseHeaders(config),
    });
    if (!response.ok) throw new Error(`Cloud pull failed: ${response.status}`);
    const rows = await response.json();
    if (!rows.length) throw new Error("No cloud data found for this Club ID.");
    Object.assign(state, rows[0].payload);
    state.sync = { ...(state.sync || {}), status: "Cloud pull complete", lastSync: rows[0].updated_at || new Date().toISOString(), pending: 0 };
    saveState();
    render();
    renderCloudStatus("Cloud data pulled into this device.");
  } catch (error) {
    renderCloudStatus(error.message);
  }
}

function requireSupabaseConfig() {
  const config = loadCloudConfig();
  if (config.syncMode !== "supabase" || !config.supabaseUrl || !config.supabaseAnonKey || !config.clubId) {
    renderCloudStatus("Save Supabase URL, anon key, Club ID, and Mode = Supabase first.");
    return null;
  }
  return config;
}

function supabaseHeaders(config, extra = {}) {
  return {
    apikey: config.supabaseAnonKey,
    Authorization: `Bearer ${config.supabaseAnonKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function cleanUrl(value) {
  return String(value || "").replace(/\/+$/, "");
}

function renderAdmins() {
  document.querySelector("#adminList").innerHTML = state.admins.length
    ? state.admins.map((admin) => `
      <article class="card">
        <strong>${escapeHtml(admin.name)}</strong>
        <p class="meta">${escapeHtml(admin.role)} | ${escapeHtml(admin.email)}</p>
      </article>
    `).join("")
    : `<div class="empty">Add the first co-host.</div>`;
}

function mockSync() {
  state.sync = {
    status: "Ready for hosted database",
    lastSync: new Date().toISOString(),
    pending: 0,
    events: state.events.length,
    players: state.players.length,
    admins: state.admins.length,
  };
  saveState();
  renderSync();
}

function renderSync() {
  const sync = state.sync || {};
  document.querySelector("#syncStatus").innerHTML = `
    <div class="sync-grid">
      <article><span>Status</span><strong>${escapeHtml(sync.status || "Local only")}</strong></article>
      <article><span>Last sync</span><strong>${sync.lastSync ? formatDateTime(sync.lastSync) : "Not synced"}</strong></article>
      <article><span>Records</span><strong>${state.events.length} events / ${state.players.length} players</strong></article>
      <article><span>Admins</span><strong>${state.admins.length}</strong></article>
    </div>
    <p class="meta">This is a local simulation. The next technical step is connecting these same records to a hosted database.</p>
  `;
}

function seedDemo() {
  const eventId = newId();
  const golfEventId = newId();
  state.events = [
    { id: eventId, name: "Paddle + Pint Night", venue: "South Main Brewing", date: new Date().toISOString().slice(0, 10), format: "Round Robin", capacity: "32", courts: "4", note: "Social rotating partner play with post-match pints.", sport: "pickleball", slug: "paddle-pint-night", published: true },
    { id: golfEventId, name: "Sunday Nine + Social", venue: "Local short course", date: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10), format: "Golf Scramble", capacity: "24", courts: "6", note: "Nine-hole golf play and club meet-up.", sport: "golf", slug: "sunday-nine-social", published: false },
  ];
  state.players = [
    ["Maya", "Singh", "maya@example.com", "Advanced", "Signed"],
    ["Theo", "Grant", "theo@example.com", "Beginner", "Needs Signature"],
    ["Nina", "Park", "nina@example.com", "Intermediate", "Signed"],
    ["Sam", "Reed", "sam@example.com", "Open", "Signed"],
    ["Jules", "Baker", "jules@example.com", "Intermediate", "Needs Signature"],
    ["Cam", "Lewis", "cam@example.com", "Advanced", "Signed"],
    ["Riley", "Stone", "riley@example.com", "Beginner", "Signed"],
    ["Ari", "Cole", "ari@example.com", "Intermediate", "Signed"],
  ].map(([firstName, lastName, email, skill, waiver]) => ({
    id: newId(),
    firstName,
    lastName,
    email,
    phone: "",
    skill,
    waiver,
    status: "Checked in",
    paid: "Paid",
    eventId,
    checkedIn: true,
    checkedInAt: new Date().toISOString(),
    sport: "pickleball",
    ...buildWaiverAudit(waiver, {}, "Demo data"),
  }));
  state.posts = [
    { id: newId(), name: "Taylor", type: "Looking for players", location: "South Main", skill: "Intermediate social", body: "Need two more for Thursday evening play.", sport: "pickleball" },
    { id: newId(), name: "Morgan", type: "Golf foursome", location: "West side", skill: "Casual", body: "Looking for a Sunday morning nine-hole group.", sport: "golf" },
  ];
  state.profiles = [
    { id: newId(), firstName: "Maya", lastName: "Singh", email: "maya@example.com", phone: "555-0101", city: "Greenville", state: "SC", zip: "29601", skill: "Advanced", availability: "Weeknights", interests: ["Tournaments", "Competitive drills"], smsSubscriber: true, sport: "pickleball" },
    { id: newId(), firstName: "Theo", lastName: "Grant", email: "theo@example.com", phone: "555-0102", city: "Greenville", state: "SC", zip: "29601", skill: "Beginner", availability: "Weekends", interests: ["Beginner-friendly play", "Casual Golfing"], smsSubscriber: false, sport: "pickleball" },
    { id: newId(), firstName: "Nina", lastName: "Park", email: "nina@example.com", phone: "555-0103", city: "Greenville", state: "SC", zip: "29605", skill: "Intermediate", availability: "Flexible", interests: ["Social round robins", "Golf groups"], smsSubscriber: true, sport: "pickleball" },
  ];
  state.rounds = [];
  state.bracket = [];
  state.admins = [
    { id: "owner", name: "Event Owner", email: LOCAL_ADMIN_EMAIL, role: "Host Admin" },
    { id: newId(), name: "Check-In Lead", email: "checkin@example.com", role: "Check-In Only" },
  ];
  state.sync = { status: "Local only", lastSync: "", pending: state.players.length + state.events.length };
  saveState();
  render();
}

function exportSnapshot() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `club-society-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importPlayerCsv() {
  const file = els.csvImport.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const rows = parseCsv(String(reader.result || ""));
    const imported = rows.map(normalizeImportedPlayer).filter((player) => player.email || (player.firstName && player.lastName));

    imported.forEach((player) => {
      const existing = state.players.find((item) => item.email && player.email && item.email.toLowerCase() === player.email.toLowerCase());
      if (existing) Object.assign(existing, player, { id: existing.id });
      else state.players.unshift({ ...player, id: newId() });
    });

    els.csvImport.value = "";
    saveState();
    render();
  });
  reader.readAsText(file);
}

function normalizeImportedPlayer(row) {
  const firstName = row.firstName || row.firstname || row.first || splitName(row.name)[0];
  const lastName = row.lastName || row.lastname || row.last || splitName(row.name)[1];
  const email = row.email || row.emailAddress || "";
  const phone = row.phone || row.phoneNumber || row.mobile || "";
  const event = row.event || row.eventName || row["event name"] || "";
  const eventId = findEventId(event) || state.events[0]?.id || "";

  return {
    firstName: titleCase(firstName),
    lastName: titleCase(lastName),
    email: email.trim(),
    phone: phone.trim(),
    gender: titleCase(row.gender || row.sex || ""),
    skill: row.skill || row.level || "Intermediate",
    waiver: normalizeWaiver(row.waiver || row.signedWaiver),
    ...buildWaiverAudit(normalizeWaiver(row.waiver || row.signedWaiver), {
      waiverSignedAt: row.waiverSignedAt || row.waiverTime || row.signedAt || "",
      waiverSource: row.waiverSource || row.source || "CSV import",
      waiverAgreementText: row.waiverAgreement || row.waiverAgreementText || "",
    }, "CSV import"),
    status: row.status || "RSVP",
    paid: row.paid || row.payment || row.paymentStatus || "Not tracked",
    eventId,
    notes: row.notes || "",
    checkedIn: false,
    sport: state.mode,
    importedAt: new Date().toISOString(),
  };
}

function exportPlayerCsv() {
  const headers = ["First Name", "Last Name", "Email", "Phone", "Gender", "Event", "Skill", "Waiver", "Waiver Signed At", "Waiver Source", "Waiver Agreement", "Status", "Paid", "Checked In", "Checked In At", "Notes"];
  const selectedEventId = els.playerEvent.value;
  const event = state.events.find((item) => item.id === selectedEventId);
  const attendees = state.players
    .filter((player) => (player.sport || "pickleball") === state.mode)
    .filter((player) => player.checkedIn)
    .filter((player) => !selectedEventId || player.eventId === selectedEventId);
  const rows = attendees.map((player) => [
    player.firstName,
    player.lastName,
    player.email,
    player.phone,
    player.gender || "",
    eventName(player.eventId),
    player.skill,
    player.waiver,
    player.waiverSignedAt || "",
    player.waiverSource || "",
    player.waiverAgreementText || "",
    player.status,
    player.paid,
    player.checkedIn ? "Yes" : "No",
    player.checkedInAt || "",
    player.notes,
  ]);
  const label = event ? slugify(event.name) : "checked-in-attendees";
  downloadText(`club-society-${label}-${todaySlug()}.csv`, [headers, ...rows].map(csvLine).join("\n"), "text/csv");
}

function exportProfilesCsv() {
  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Gender",
    "Street",
    "City",
    "State",
    "ZIP",
    "Sport",
    "Preferred Sport",
    "Skill",
    "Pickleball Level",
    "Golf Handicap",
    "Availability",
    "Interests",
    "Waiver",
    "Waiver Signed At",
    "Waiver Source",
    "Waiver Agreement",
    "SMS Subscriber",
    "Discoverable",
    "Allow Messages",
    "Verification Status",
    "Verification Method",
    "Verified At",
    "Source",
    "Created At",
    "Updated At",
    "Bio",
  ];
  const rows = state.profiles
    .slice()
    .sort((a, b) => `${a.lastName || ""} ${a.firstName || ""}`.localeCompare(`${b.lastName || ""} ${b.firstName || ""}`))
    .map((profile) => [
      profile.firstName || "",
      profile.lastName || "",
      profile.email || "",
      profile.phone || "",
      profile.gender || "",
      profile.street || "",
      profile.city || "",
      profile.state || "",
      profile.zip || "",
      profile.sport || "",
      profile.preferredSport || "",
      profile.skill || "",
      profile.pickleballLevel || "",
      profile.handicap || "",
      profile.availability || "",
      listText(profile.interests || []),
      profile.waiver || "Needs Signature",
      profile.waiverSignedAt || "",
      profile.waiverSource || "",
      profile.waiverAgreementText || "",
      profile.smsSubscriber ? "Yes" : "No",
      profile.discoverable ? "Yes" : "No",
      profile.allowMessages === false ? "No" : "Yes",
      profile.verificationStatus || "",
      profile.verificationMethod || "",
      profile.verifiedAt || "",
      profile.source || "",
      profile.createdAt || "",
      profile.updatedAt || "",
      profile.bio || "",
    ]);
  downloadText(`club-society-player-profiles-${todaySlug()}.csv`, [headers, ...rows].map(csvLine).join("\n"), "text/csv");
}

function importProfilesCsv() {
  const file = els.profilesImport.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const rows = parseCsv(String(reader.result || ""));
    const stats = { created: 0, updated: 0, unchanged: 0, skipped: 0 };

    rows.forEach((row) => {
      const imported = normalizeImportedProfile(row);
      if (!imported.firstName && !imported.lastName && !imported.email && !imported.phone) {
        stats.skipped += 1;
        return;
      }

      const existing = findImportedProfileMatch(imported);
      if (!existing) {
        const newProfile = {
          id: newId(),
          city: DEFAULT_LOCATION.city,
          state: DEFAULT_LOCATION.state,
          zip: DEFAULT_LOCATION.zip,
          skill: "Open",
          availability: "Flexible",
          interests: [],
          sport: state.mode,
          verificationStatus: "Imported",
          verificationMethod: "email",
          source: "Member directory CSV import",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mergeImportedProfile(newProfile, imported);
        state.profiles.unshift(newProfile);
        stats.created += 1;
        return;
      }

      const changed = mergeImportedProfile(existing, imported);
      if (changed) {
        existing.updatedAt = new Date().toISOString();
        stats.updated += 1;
      } else {
        stats.unchanged += 1;
      }
    });

    els.profilesImport.value = "";
    saveState();
    render();
    showAdminMessage(
      "#profileList",
      "success",
      `Import complete: ${stats.created} added, ${stats.updated} updated, ${stats.unchanged} unchanged, ${stats.skipped} skipped.`,
    );
  });
  reader.readAsText(file);
}

function normalizeImportedProfile(row) {
  const [nameFirst, nameLast] = splitName(row.name || row.fullName || "");
  const list = (value) => String(value || "").split(/[|;,]/).map((item) => item.trim()).filter(Boolean);
  const explicitBoolean = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    if (["yes", "true", "1", "on"].includes(normalized)) return true;
    if (["no", "false", "0", "off"].includes(normalized)) return false;
    return undefined;
  };

  return {
    firstName: titleCase(row.firstName || row.firstname || row.first || nameFirst),
    lastName: titleCase(row.lastName || row.lastname || row.last || nameLast),
    email: String(row.email || row.emailAddress || "").trim().toLowerCase(),
    phone: String(row.phone || row.phoneNumber || row.mobile || "").trim(),
    gender: titleCase(row.gender || row.sex || ""),
    street: String(row.street || row.address || row.address1 || "").trim(),
    city: String(row.city || "").trim(),
    state: String(row.state || row.province || row.region || "").trim(),
    zip: String(row.zip || row.zipCode || row.postalCode || "").trim(),
    sport: String(row.sport || "").trim().toLowerCase(),
    preferredSport: String(row.preferredSport || "").trim(),
    skill: String(row.skill || row.level || "").trim(),
    pickleballLevel: String(row.pickleballLevel || "").trim(),
    handicap: String(row.golfHandicap || row.handicap || "").trim(),
    availability: String(row.availability || "").trim(),
    interests: list(row.interests),
    waiver: String(row.waiver || "").trim(),
    waiverSignedAt: String(row.waiverSignedAt || "").trim(),
    waiverSource: String(row.waiverSource || "").trim(),
    waiverAgreementText: String(row.waiverAgreement || row.waiverAgreementText || "").trim(),
    smsSubscriber: explicitBoolean(row.smsSubscriber),
    discoverable: explicitBoolean(row.discoverable),
    allowMessages: explicitBoolean(row.allowMessages),
    verificationStatus: String(row.verificationStatus || "").trim(),
    verificationMethod: String(row.verificationMethod || "").trim(),
    verifiedAt: String(row.verifiedAt || "").trim(),
    source: String(row.source || "").trim(),
    bio: String(row.bio || "").trim(),
  };
}

function findImportedProfileMatch(imported) {
  const email = imported.email.toLowerCase();
  const phone = digits(imported.phone);
  const name = `${imported.firstName} ${imported.lastName}`.trim().toLowerCase();
  return state.profiles.find((profile) => {
    const profileEmail = String(profile.email || "").trim().toLowerCase();
    const profilePhone = digits(profile.phone);
    const profileName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim().toLowerCase();
    return (email && profileEmail === email)
      || (phone && profilePhone === phone)
      || (!email && !phone && name && profileName === name);
  });
}

function mergeImportedProfile(existing, imported) {
  let changed = false;
  const preservedFields = [
    "firstName", "lastName", "email", "phone", "gender", "street", "city", "state", "zip", "sport",
    "preferredSport", "skill", "pickleballLevel", "handicap", "availability", "waiver",
    "waiverSignedAt", "waiverSource", "waiverAgreementText", "verificationStatus",
    "verificationMethod", "verifiedAt", "source", "bio",
  ];

  preservedFields.forEach((field) => {
    const value = imported[field];
    if (value === "" || value == null || existing[field] === value) return;
    existing[field] = value;
    changed = true;
  });

  ["smsSubscriber", "discoverable", "allowMessages"].forEach((field) => {
    if (typeof imported[field] !== "boolean" || existing[field] === imported[field]) return;
    existing[field] = imported[field];
    changed = true;
  });

  if (imported.interests.length) {
    const interests = Array.from(new Set([...(existing.interests || []), ...imported.interests]));
    if (interests.length !== (existing.interests || []).length) {
      existing.interests = interests;
      changed = true;
    }
  }
  return changed;
}

function parseCsv(input) {
  const rows = [];
  let current = "";
  let row = [];
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const headers = (rows.shift() || []).map((header) => camelHeader(header));
  return rows
    .filter((item) => item.some((cell) => cell.trim()))
    .map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index]?.trim() || ""])));
}

function csvLine(cells) {
  return cells.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",");
}

function downloadText(filename, contents, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function showAdminMessage(selector, type, message) {
  const target = document.querySelector(selector);
  if (!target) return;
  const note = document.createElement("div");
  note.className = `public-message ${type}`;
  note.innerHTML = `<strong>${escapeHtml(message)}</strong>`;
  target.prepend(note);
  window.setTimeout(() => note.remove(), 5200);
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidPhone(value) {
  return digits(value).length >= 10;
}

function todaySlug() {
  return new Date().toISOString().slice(0, 10);
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function names(ids) {
  const list = ids
    .map((id) => state.players.find((player) => player.id === id))
    .filter(Boolean)
    .map((player) => `${player.firstName} ${player.lastName}`)
    .join(" / ");
  return list || "Open slot";
}

function eventName(id) {
  return state.events.find((event) => event.id === id)?.name || "";
}

function eventPlayers(id) {
  return state.players.filter((player) => player.eventId === id);
}

function dateInputValue(value) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return new Date().toISOString().slice(0, 10);
  return new Date(parsed).toISOString().slice(0, 10);
}

function parseAdditionalPlayers(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function findEventId(name) {
  const normalized = String(name || "").trim().toLowerCase();
  if (!normalized) return "";
  return state.events.find((event) => event.name.toLowerCase() === normalized)?.id || "";
}

function splitName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return [parts[0] || "", parts.slice(1).join(" ") || ""];
}

function titleCase(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function normalizeWaiver(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["yes", "y", "signed", "true", "complete", "completed"].includes(normalized)) return "Signed";
  return "Needs Signature";
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || `event-${Date.now()}`;
}

function formatDateTime(value) {
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function formatDisplayTime(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const match = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return text;
  let hour = Number(match[1]);
  const minute = match[2];
  const period = hour >= 12 ? "PM" : "AM";
  hour %= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${period}`;
}

function estimateRevenue() {
  const paid = state.players.filter((player) => player.paid === "Paid").length;
  const total = paid * 20;
  return { total, hostPayout: Math.round(total * 0.85), platform: Math.round(total * 0.15) };
}

function listText(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value || "Open play";
}

function digits(value) {
  return String(value || "").replace(/\D/g, "");
}

function camelHeader(value) {
  const cleaned = String(value || "").trim().toLowerCase();
  return cleaned.replace(/[^a-z0-9]+([a-z0-9])/g, (_, letter) => letter.toUpperCase());
}

function skillSort(a, b) {
  const weight = { Advanced: 0, Open: 1, Intermediate: 2, Beginner: 3 };
  return (weight[a.skill] ?? 9) - (weight[b.skill] ?? 9) || a.lastName.localeCompare(b.lastName);
}

function checkinPrioritySort(a, b) {
  const timeA = Date.parse(a.checkedInAt || "") || Number.MAX_SAFE_INTEGER;
  const timeB = Date.parse(b.checkedInAt || "") || Number.MAX_SAFE_INTEGER;
  return timeA - timeB || skillSort(a, b);
}

function skillScore(player) {
  const normalized = String(player?.skill || player?.pickleballLevel || "Open").toLowerCase();
  if (normalized.includes("advanced") || normalized.includes("4.")) return 4;
  if (normalized.includes("intermediate") || normalized.includes("3.")) return 3;
  if (normalized.includes("beginner") || normalized.includes("2.")) return 2;
  return 3;
}

function normalizedGender(player) {
  const value = String(player?.gender || "").trim().toLowerCase();
  return value === "male" || value === "female" ? value : "";
}

function buildBalancedTeams(players) {
  const pool = [...players].sort(checkinPrioritySort);
  const averageSkill = pool.reduce((total, player) => total + skillScore(player), 0) / Math.max(1, pool.length);
  const targetTeamSkill = averageSkill * 2;
  const teams = [];

  while (pool.length >= 2) {
    const anchor = pool.shift();
    const anchorGender = normalizedGender(anchor);
    let bestIndex = 0;
    let bestCost = Number.POSITIVE_INFINITY;
    pool.forEach((candidate, index) => {
      const candidateGender = normalizedGender(candidate);
      const genderCost = anchorGender && candidateGender ? (anchorGender === candidateGender ? 1 : 0) : 0.35;
      const skillCost = Math.abs(skillScore(anchor) + skillScore(candidate) - targetTeamSkill);
      const checkinCost = index * 0.001;
      const cost = skillCost * 4 + genderCost * 2 + checkinCost;
      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = index;
      }
    });
    const partner = pool.splice(bestIndex, 1)[0];
    teams.push({
      id: `balanced-${anchor.id}-${partner.id}`,
      name: `${anchor.firstName} & ${partner.firstName}`,
      players: [anchor, partner],
      skillTotal: skillScore(anchor) + skillScore(partner),
      priorityTime: Math.min(checkinTime(anchor), checkinTime(partner)),
    });
  }
  return teams;
}

function buildBalancedRoundMatches(players, courts) {
  const availableTeams = buildBalancedTeams(players);
  const matches = [];
  for (let court = 1; court <= courts && availableTeams.length >= 2; court += 1) {
    availableTeams.sort((a, b) => a.priorityTime - b.priorityTime);
    const teamA = availableTeams.shift();
    let opponentIndex = 0;
    let opponentGap = Number.POSITIVE_INFINITY;
    availableTeams.forEach((team, index) => {
      const gap = Math.abs(team.skillTotal - teamA.skillTotal);
      if (gap < opponentGap) {
        opponentGap = gap;
        opponentIndex = index;
      }
    });
    const teamB = availableTeams.splice(opponentIndex, 1)[0];
    matches.push({
      court,
      teamA: teamA.players.map((player) => player.id),
      teamB: teamB.players.map((player) => player.id),
    });
  }
  return matches;
}

function checkinTime(player) {
  return Date.parse(player?.checkedInAt || "") || Number.MAX_SAFE_INTEGER;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function text(selector, value) {
  document.querySelector(selector).textContent = value;
}

function newId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}


