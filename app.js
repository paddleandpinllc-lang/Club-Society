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
  "societyFriendRequests",
  "societyBlockedMembers",
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
  "memberHostDrafts",
  "memberHostArchives",
  "lessonListings",
];

const state = loadState();
let memberCloudSyncTimer = 0;
let suppressMemberCloudSync = false;
let memberHostRefreshBusy = false;
let societySportContext = "pickleball";
const GOLF_SOCIETY_TABS = new Set(["golfHome", "golfFindGame", "golfPostTee", "golfCreateGroup", "golfLessons", "golfCourses", "golfTournament", "golfMessages"]);
const PICKLEBALL_SOCIETY_TABS = new Set(["pickleballHome", "games", "courts", "pickleDate", "memberHost", "partners", "host", "pickleballLessons"]);
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
  societyConnectionRequests: document.querySelector("#societyConnectionRequests"),
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
  courtDistance: document.querySelector("#courtDistance"),
  courtDirectoryList: document.querySelector("#courtDirectoryList"),
  pickleDateProfileForm: document.querySelector("#pickleDateProfileForm"),
  pickleDateResults: document.querySelector("#pickleDateResults"),
  pickleDateAgeMin: document.querySelector("#pickleDateAgeMin"),
  pickleDateAgeMax: document.querySelector("#pickleDateAgeMax"),
  pickleDateMiles: document.querySelector("#pickleDateMiles"),
  memberHostForm: document.querySelector("#memberHostForm"),
  memberHostBoard: document.querySelector("#memberHostBoard"),
  memberHostJoinForm: document.querySelector("#memberHostJoinForm"),
  memberHostArchiveList: document.querySelector("#memberHostArchiveList"),
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
  golfCourseDistance: document.querySelector("#golfCourseDistance"),
  golfCourseList: document.querySelector("#golfCourseList"),
  golfCourseLocation: document.querySelector("#golfCourseLocation"),
  useCurrentGolfLocation: document.querySelector("#useCurrentGolfLocation"),
  golfZipSearchForm: document.querySelector("#golfZipSearchForm"),
  golfCourseZip: document.querySelector("#golfCourseZip"),
  lessonForms: document.querySelectorAll("[data-lesson-form]"),
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
els.courtDistance?.addEventListener("change", renderCourtDirectory);
els.pickleDateProfileForm?.addEventListener("submit", savePickleDateProfile);
els.pickleDateAgeMin?.addEventListener("input", renderPickleDateProfiles);
els.pickleDateAgeMax?.addEventListener("input", renderPickleDateProfiles);
els.pickleDateMiles?.addEventListener("change", renderPickleDateProfiles);
els.memberHostForm?.addEventListener("submit", buildMemberHostedEvent);
els.memberHostJoinForm?.addEventListener("submit", joinMemberHostedEvent);
els.golfTeeTimeForm.addEventListener("submit", saveGolfTeeTime);
els.golfGroupForm.addEventListener("submit", saveGolfGroup);
els.golfMessageForm.addEventListener("submit", saveGolfMessage);
els.golfMessageForm.elements.to.addEventListener("input", updateMemberSuggestions);
els.golfPassBtn.addEventListener("click", passGolfMatch);
els.golfMessageMatchBtn.addEventListener("click", messageGolfMatch);
els.golfCourseDistance?.addEventListener("change", renderGolfCourses);
els.useCurrentGolfLocation?.addEventListener("click", useCurrentGolfLocation);
els.golfZipSearchForm?.addEventListener("submit", searchGolfCoursesByZip);
els.lessonForms.forEach((form) => form.addEventListener("submit", saveLessonListing));
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
  navigator.serviceWorker.register(`sw.js?v=${encodeURIComponent(APP_VERSION)}`, { updateViaCache: "none" }).then((registration) => {
    const checkForAppUpdate = () => registration.update().catch(() => {});
    checkForAppUpdate();
    setInterval(checkForAppUpdate, 15 * 60 * 1000);
    window.addEventListener("pageshow", checkForAppUpdate);
    window.addEventListener("online", checkForAppUpdate);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkForAppUpdate();
    });
  }).catch(() => {});
}

autoArchiveEndedEvents();
initializeAuthPanels();
applyLaunchMode();
render();
initProfileCompletionLink();
window.setInterval(refreshMemberHostedEvent, 8000);

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
    societyFriendRequests: [],
    societyBlockedMembers: [],
    societyFriendFilter: "all",
    selectedSocietyProfileId: "",
    clubGroups: [],
    casualMatches: [],
    casualMatchFilter: "all",
    quickGames: [],
    quickGameFilter: "all",
    courtFilter: "all",
    courtDistance: "25",
    golfCourseDistance: "25",
    golfCourseCoordinates: null,
    golfCourseZip: "",
    memberHostFormat: "round-robin",
    memberHostDrafts: { "round-robin": { format: "round-robin", matches: [] }, tournament: { format: "tournament", matches: [] } },
    memberHostArchives: [],
    lessonListings: [],
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
  data.societyFriendRequests = data.societyFriendRequests || [];
  data.societyBlockedMembers = data.societyBlockedMembers || [];
  data.societyFriendFilter = data.societyFriendFilter || "all";
  data.selectedSocietyProfileId = data.selectedSocietyProfileId || "";
  data.clubGroups = data.clubGroups || [];
  data.casualMatches = data.casualMatches || [];
  data.casualMatchFilter = data.casualMatchFilter || "all";
  data.quickGames = data.quickGames || [];
  data.quickGameFilter = data.quickGameFilter || "all";
  data.courtFilter = data.courtFilter || "all";
  data.courtDistance = data.courtDistance || "25";
  const legacyHostDraft = data.memberHostDraft || {};
  data.memberHostFormat = data.memberHostFormat || legacyHostDraft.format || "round-robin";
  data.memberHostDrafts = {
    "round-robin": { format: "round-robin", matches: [], ...(data.memberHostDrafts?.["round-robin"] || (legacyHostDraft.format === "round-robin" ? legacyHostDraft : {})) },
    tournament: { format: "tournament", matches: [], ...(data.memberHostDrafts?.tournament || (legacyHostDraft.format === "tournament" ? legacyHostDraft : {})) },
  };
  data.memberHostArchives = data.memberHostArchives || [];
  data.lessonListings = data.lessonListings || [];
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
      dateInterested: profile.dateInterested === true,
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
  if (appState.memberHostDrafts && typeof appState.memberHostDrafts === "object") {
    state.memberHostDrafts = { ...state.memberHostDrafts, ...appState.memberHostDrafts };
  }
  state.memberHostArchives = mergeRecords(state.memberHostArchives, appState.memberHostArchives, (item) => item.sharedEventId || item.updatedAt);
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
  els.societyAccountMessage.textContent = "Email verified. Next, add a clear photo of your face to unlock posting and messaging.";
  els.societyProfileDrawer?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    dateInterested: data.dateInterested === "on" || existing?.dateInterested === true,
    gender: data.gender || existing?.gender || "",
    preferredSport: data.sport || "both",
    passwordSet: true,
    pickleballLevel: data.pickleballLevel || existing?.pickleballLevel || "",
    handicap: data.handicap || existing?.handicap || "",
    bio: data.bio.trim(),
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

  const offerLessonsButton = event.target.closest("[data-offer-lessons]");
  if (offerLessonsButton) {
    const form = document.querySelector(`[data-lesson-form="${offerLessonsButton.dataset.offerLessons}"]`);
    const isOpen = form?.classList.toggle("active") || false;
    offerLessonsButton.setAttribute("aria-expanded", String(isOpen));
    offerLessonsButton.textContent = isOpen ? "Close Instructor Sign-Up" : "Sign Up to Give Lessons";
    if (isOpen) form?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const addFriendButton = event.target.closest("[data-friend-add]");
  if (addFriendButton) {
    addSocietyFriend(addFriendButton.dataset.friendAdd);
    return;
  }

  const acceptFriendButton = event.target.closest("[data-friend-accept]");
  if (acceptFriendButton) { acceptSocietyFriend(acceptFriendButton.dataset.friendAccept); return; }
  const declineFriendButton = event.target.closest("[data-friend-decline]");
  if (declineFriendButton) { declineSocietyFriend(declineFriendButton.dataset.friendDecline); return; }
  const removeFriendButton = event.target.closest("[data-friend-remove]");
  if (removeFriendButton) { removeSocietyFriend(removeFriendButton.dataset.friendRemove); return; }
  const blockFriendButton = event.target.closest("[data-friend-block]");
  if (blockFriendButton) { blockSocietyFriend(blockFriendButton.dataset.friendBlock); return; }

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

  const pickleDateMessageButton = event.target.closest("[data-pickle-date-message]");
  if (pickleDateMessageButton) {
    const names = { "date-maya": "Maya", "date-jordan": "Jordan", "date-taylor": "Taylor" };
    const name = names[pickleDateMessageButton.dataset.pickleDateMessage] || "Club Society member";
    openPrefilledMessage(name, `Hi ${name}, I found your profile in It's Just Pickleball and would like to connect.`);
    return;
  }

  const hostFormatButton = event.target.closest("[data-member-host-format]");
  if (hostFormatButton) {
    state.memberHostFormat = hostFormatButton.dataset.memberHostFormat;
    document.querySelectorAll("[data-member-host-format]").forEach((button) => button.classList.toggle("active", button === hostFormatButton));
    const submit = els.memberHostForm?.querySelector('[type="submit"]');
    if (submit) submit.textContent = state.memberHostFormat === "tournament" ? "Create Tournament" : "Create Round Robin";
    fillMemberHostForm();
    renderMemberHostBoard();
    saveState();
    return;
  }

  const hostDashboardInterest = event.target.closest("[data-host-dashboard-interest]");
  if (hostDashboardInterest) {
    openPrefilledMessage("Club Society Hosting", "I am interested in using the hosting dashboard for a charity event or tournament.");
    return;
  }

  if (event.target.closest("[data-golf-tournament-contact]")) {
    showSocietyAccountMessage("Club Society tournament hosting is coming soon. The contact destination will be added here when it is ready.", "notice");
    return;
  }

  const hostWinnerButton = event.target.closest("[data-member-host-winner]");
  if (hostWinnerButton) {
    const match = activeMemberHostDraft().matches.find((item) => item.id === hostWinnerButton.dataset.memberHostWinner);
    if (match) match.winner = hostWinnerButton.dataset.side === "a" ? match.playerA : match.playerB;
    saveState();
    publishMemberHostedEvent();
    renderMemberHostBoard();
    return;
  }

  if (event.target.closest("[data-member-host-clear]")) {
    clearMemberHostedEvent();
    return;
  }

  if (event.target.closest("[data-member-host-archive]")) {
    archiveMemberHostedEvent();
    return;
  }

  const restoreHostedEvent = event.target.closest("[data-member-host-restore]");
  if (restoreHostedEvent) {
    restoreMemberHostedEvent(restoreHostedEvent.dataset.memberHostRestore);
    return;
  }

  if (event.target.closest("[data-member-host-advance]")) {
    advanceMemberTournament();
    return;
  }

  const courtFilterButton = event.target.closest("[data-court-filter]");
  if (courtFilterButton) {
    state.courtFilter = courtFilterButton.dataset.courtFilter;
    saveState();
    renderCourtDirectory();
    return;
  }

  const lessonsTabButton = event.target.closest("[data-society-lessons]");
  if (lessonsTabButton) {
    setSocietyTab(societySportContext === "golf" ? "golfLessons" : "pickleballLessons");
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
    });
  });
}

function setSocietyTab(tab) {
  const protectedTabs = new Set(["pickleballHome", "games", "courts", "pickleDate", "memberHost", "events", "partners", "connectPlayers", "clubGroups", "myGroups", "host", "pickleballLessons", "settings", "golfHome", "golfFindGame", "golfPostTee", "golfCreateGroup", "golfLessons", "golfCourses", "golfTournament", "golfMessages"]);
  if (protectedTabs.has(tab) && !hasSocietyAccess()) {
    setSocietyTab("home");
    els.societyAccountMessage.textContent = "Sign in or Join to access";
    return;
  }
  if (["host", "golfMessages"].includes(tab) && !profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  if (GOLF_SOCIETY_TABS.has(tab)) societySportContext = "golf";
  if (PICKLEBALL_SOCIETY_TABS.has(tab)) societySportContext = "pickleball";
  document.querySelectorAll("[data-society-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.societyPanel === tab);
  });
  document.querySelectorAll("#societyApp [data-society-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.societyTab === tab);
  });
  document.querySelectorAll("#societyApp [data-society-lessons]").forEach((button) => {
    button.classList.toggle("active", ["pickleballLessons", "golfLessons"].includes(tab));
  });
  if (tab === "home") updateSocietyHome();
  if (tab === "partners") renderCasualMatches();
  if (tab === "connectPlayers") renderSocietyFriends();
  if (tab === "clubGroups") renderClubGroups();
  if (tab === "myGroups") renderMyGroups();
  if (tab === "games") renderQuickGames();
  if (tab === "courts") {
    if (els.courtDistance) els.courtDistance.value = state.courtDistance || "25";
    renderCourtDirectory();
  }
  if (tab === "pickleDate") renderPickleDateProfiles();
  if (tab === "memberHost") {
    fillMemberHostForm();
    renderMemberHostBoard();
  }
  if (tab === "golfCourses") {
    if (els.golfCourseDistance) els.golfCourseDistance.value = state.golfCourseDistance || "25";
    renderGolfCourses();
  }
  if (tab === "pickleballLessons") renderLessonListings("pickleball");
  if (tab === "golfLessons") renderLessonListings("golf");
}

function saveLessonListing(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const sport = form.dataset.lessonForm;
  const data = Object.fromEntries(new FormData(form).entries());
  const profile = currentSocietyProfile();
  const existing = state.lessonListings.find((item) => item.ownerEmail === profile?.email && item.sport === sport);
  const listing = { ...(existing || {}), ...data, id: existing?.id || newId(), sport, ownerEmail: profile?.email || "", paymentStatus: existing?.paymentStatus || "pending", status: existing?.status || "Pending payment", updatedAt: new Date().toISOString() };
  if (existing) Object.assign(existing, listing); else state.lessonListings.unshift(listing);
  saveState();
  renderLessonListings(sport);
  showSocietyAccountMessage("Your lesson listing is saved as Pending Payment. Secure $25 checkout will open here when the Club Society Stripe account is connected.", "notice");
}

function renderLessonListings(sport) {
  const target = document.querySelector(sport === "golf" ? "#golfLessonList" : "#pickleballLessonList");
  if (!target) return;
  const listings = state.lessonListings.filter((item) => item.sport === sport && item.paymentStatus === "paid");
  target.querySelectorAll("[data-paid-lesson]").forEach((item) => item.remove());
  listings.forEach((item) => { const card = document.createElement("article"); card.className = "society-list-card"; card.dataset.paidLesson = item.id; card.innerHTML = `<strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.location)} | ${escapeHtml(item.format)}</span><p>${escapeHtml(item.bio)}</p>`; target.prepend(card); });
}

function hasSocietyAccess() {
  return Boolean(state.societySessionEmail || state.profiles.some((profile) => profile.stayLoggedIn));
}

function currentSocietyProfile() {
  const email = state.societySessionEmail?.toLowerCase();
  return state.profiles.find((profile) => profile.email?.toLowerCase() === email)
    || state.profiles.find((profile) => profile.stayLoggedIn)
    || null;
}

function updateSocietyHome() {
  const hasAccess = hasSocietyAccess();
  document.querySelector(".society-guest-panel")?.classList.toggle("hidden", hasAccess);
  document.querySelector(".society-public-hero")?.classList.toggle("hidden", hasAccess);
  els.societyMemberDashboard?.classList.toggle("active", hasAccess);
  document.querySelector(".society-bottom-nav")?.classList.toggle("active", hasAccess);
  if (!hasAccess) return;
  const profile = currentSocietyProfile();
  const name = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Society Member";
  els.societyMemberName.textContent = name || "Society Member";
  els.societyMemberMeta.textContent = profile
    ? `${profile.city || "Watkinsville"}, ${profile.state || "GA"} | ${profile.preferredSport || "Golf + Pickleball"}`
    : "Golf + Pickleball | 30677";
  if (els.societyFavoriteCount) els.societyFavoriteCount.textContent = String(state.societyFavorites.length);
  if (els.societyFriendCount) els.societyFriendCount.textContent = String(state.societyFriends.length);
  if (els.societyGroupCount) els.societyGroupCount.textContent = String(myClubGroups().length);
  fillSocietyProfileDrawer(profile);
  updateSocietyAvatar(profile);
  renderSocietyFriends();
  renderProfileActivity();
}

function fillSocietyProfileDrawer(profile) {
  if (!els.societyProfileDrawer) return;
  const fields = els.societyProfileDrawer.elements;
  fields.firstName.value = profile?.firstName || "";
  fields.lastName.value = profile?.lastName || "";
  fields.email.value = profile?.email || state.societySessionEmail || "";
  fields.phone.value = profile?.phone || "";
  fields.city.value = profile?.city || "Watkinsville";
  fields.state.value = profile?.state || "GA";
  fields.zip.value = profile?.zip || "30677";
  fields.bio.value = profile?.bio || "";
  fields.allowMessages.checked = profile?.allowMessages !== false;
  fields.discoverable.checked = profile?.discoverable === true;
  fields.dateInterested.checked = profile?.dateInterested === true;
}

function updateSocietyAvatar(profile = currentSocietyProfile()) {
  const photo = profile?.photoDataUrl || "";
  if (photo) {
    els.societyAvatar.style.backgroundImage = `url("${photo}")`;
    els.societyAvatar.textContent = "";
    els.societyPhotoPreview.style.backgroundImage = `url("${photo}")`;
    els.societyPhotoPreview.textContent = "Change photo";
  } else {
    els.societyAvatar.style.backgroundImage = "";
    els.societyAvatar.textContent = "CS";
    els.societyPhotoPreview.style.backgroundImage = "";
    els.societyPhotoPreview.textContent = "Add photo";
  }
}

function toggleSocietyProfileDrawer(forceOpen) {
  const shouldOpen = forceOpen ?? !els.societyProfileDrawer.classList.contains("active");
  els.societyProfileDrawer.classList.toggle("active", shouldOpen);
  if (shouldOpen) fillSocietyProfileDrawer(currentSocietyProfile());
}

async function previewSocietyPhoto() {
  const file = els.societyPhotoInput.files?.[0];
  if (!file) return;
  try {
    const photo = await resizeProfilePhoto(file);
    els.societyPhotoInput.dataset.resizedPhoto = photo;
    els.societyPhotoPreview.style.backgroundImage = `url("${photo}")`;
    els.societyPhotoPreview.textContent = "Photo ready";
    showSocietyAccountMessage("Photo ready. Tap Save Profile to finish.", "success");
  } catch {
    els.societyPhotoInput.dataset.resizedPhoto = "";
    showSocietyAccountMessage("That photo could not be prepared. Try a JPG or PNG image under 15 MB.", "error");
  }
}

async function saveSocietyProfileFromDrawer() {
  const data = Object.fromEntries(new FormData(els.societyProfileDrawer).entries());
  if (!data.email?.trim()) {
    els.societyAccountMessage.textContent = "Add an email before saving your profile.";
    return;
  }
  let profile = currentSocietyProfile() || state.profiles.find((item) => item.email?.toLowerCase() === data.email.toLowerCase());
  const previousProfile = profile ? { ...profile } : null;
  const photoFile = els.societyPhotoInput.files?.[0];
  let photoDataUrl = profile?.photoDataUrl || "";
  try {
    if (photoFile) photoDataUrl = els.societyPhotoInput.dataset.resizedPhoto || await resizeProfilePhoto(photoFile);
  } catch {
    showSocietyAccountMessage("The photo could not be saved. Try another image.", "error");
    return;
  }
  const nextProfile = {
    ...(profile || {}),
    id: profile?.id || newId(),
    firstName: titleCase(data.firstName || profile?.firstName || "Society"),
    lastName: titleCase(data.lastName || profile?.lastName || "Member"),
    email: data.email.trim().toLowerCase(),
    phone: data.phone || "",
    city: data.city || "Watkinsville",
    state: data.state || "GA",
    zip: data.zip || "30677",
    bio: data.bio || "",
    photoDataUrl,
    allowMessages: data.allowMessages === "on",
    discoverable: data.discoverable === "on",
    dateInterested: data.dateInterested === "on",
    stayLoggedIn: true,
    preferredSport: profile?.preferredSport || "both",
    sport: profile?.sport || "pickleball",
    source: profile?.source || "Society profile",
    updatedAt: new Date().toISOString(),
  };
  if (profile) Object.assign(profile, nextProfile);
  else state.profiles.unshift(nextProfile);
  state.societySessionEmail = nextProfile.email;
  try {
    saveState();
  } catch (error) {
    if (profile && previousProfile) Object.assign(profile, previousProfile);
    else state.profiles = state.profiles.filter((item) => item.id !== nextProfile.id);
    showSocietyAccountMessage("This device could not store the profile photo. Try a smaller image or clear old website data, then try again.", "error");
    return;
  }
  updateSocietyHome();
  toggleSocietyProfileDrawer(false);
  els.societyAccountMessage.textContent = photoDataUrl
    ? "Profile saved. Messaging and posting are unlocked."
    : "Profile saved. Add a photo before messaging or posting.";
}

function profileHasPhoto() {
  return Boolean(currentSocietyProfile()?.photoDataUrl);
}

function promptForSocietyPhoto() {
  setSocietyTab("home");
  toggleSocietyProfileDrawer(true);
  els.societyAccountMessage.textContent = "Add a profile photo before messaging or posting an event.";
}

function logoutSociety() {
  pushMemberCloudState(true);
  state.societySessionEmail = "";
  state.cloudMemberSync = { email: "", token: "", lastPulledAt: "", lastPushedAt: "", status: "Local only" };
  state.profiles.forEach((profile) => {
    profile.stayLoggedIn = false;
  });
  saveState();
  els.societyProfileDrawer?.classList.remove("active");
  els.societyAccountForm.classList.add("auth-form-collapsed");
  document.querySelector(".society-public-hero")?.classList.remove("hidden");
  updateSocietyHome();
  setSocietyTab("home");
  els.societyAccountMessage.textContent = "You are logged out.";
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function resizeProfilePhoto(file) {
  if (!file?.type?.startsWith("image/")) throw new Error("Unsupported image");
  if (file.size > 15 * 1024 * 1024) throw new Error("Image too large");
  const source = await readFileAsDataUrl(file);
  const image = await new Promise((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = source;
  });
  const maxSize = 720;
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d", { alpha: false }).drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function societyDirectoryCards() {
  const currentEmail = state.societySessionEmail?.toLowerCase();
  const savedProfiles = state.profiles
    .filter((profile) => profile.email?.toLowerCase() !== currentEmail && profile.discoverable === true)
    .map((profile) => ({
      id: profile.id,
      name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Club member",
      city: profile.city || "Watkinsville",
      sport: profile.preferredSport || profile.sport || "pickleball",
      skill: profile.skill || profile.pickleballLevel || (profile.handicap ? `Golf handicap ${profile.handicap}` : "Open play"),
      vibe: profile.bio || (profile.socialPlay ? "Open to social play and friendly matchups." : "Looking for local games and club friends."),
      photoDataUrl: profile.photoDataUrl || "",
      socialPlay: Boolean(profile.socialPlay),
      allowMessages: profile.allowMessages !== false,
      bio: profile.bio || "",
      email: profile.email || "",
      phone: profile.phone || "",
      discoverable: true,
    }));
  const demoProfiles = [
    { id: "demo-maya", email: "demo-maya@example.com", name: "Maya Thompson", city: "Watkinsville", sport: "pickleball", skill: "3.5 doubles", vibe: "Weeknight games, mixed doubles, and post-match hangouts.", socialPlay: true, allowMessages: true, discoverable: true },
    { id: "demo-eli", email: "demo-eli@example.com", name: "Eli Parker", city: "Athens", sport: "golf", skill: "12 handicap", vibe: "Last-minute tee times, relaxed pace, good playlists.", socialPlay: true, allowMessages: true, discoverable: true },
    { id: "demo-jordan", email: "demo-jordan@example.com", name: "Jordan Reese", city: "Oconee", sport: "both", skill: "Pickleball 3.0 | Golf 18", vibe: "Down for social play, beginner-friendly groups, and club events.", socialPlay: true, allowMessages: true, discoverable: true },
  ];
  return [...savedProfiles, ...demoProfiles];
}

function defaultCasualMatches() {
  return [
    { id: "match-sat-doubles", title: "Need 2 for social doubles", day: "Today", time: "18:00", playersNeeded: "2", skill: "3.0-3.5", location: "Southeast Clarke Park", note: "Rotating partners, friendly but competitive.", ownerName: "Maya T.", ownerEmail: "demo-maya@example.com", rsvps: [] },
    { id: "match-mixed-oconee", title: "Mixed doubles practice group", day: "Tomorrow", time: "09:00", playersNeeded: "1", skill: "Open", location: "Herman C. Michael Park", note: "Easy pace, drill a little then play.", ownerName: "Jordan R.", ownerEmail: "demo-jordan@example.com", rsvps: [] },
    { id: "match-weekend-open", title: "Weekend open play group", day: "This weekend", time: "10:00", playersNeeded: "4", skill: "All levels", location: "Bishop Park", note: "Looking for a relaxed rotation Saturday morning.", ownerName: "Avery C.", ownerEmail: "demo-avery@example.com", rsvps: [] },
  ];
}

function defaultQuickGames() {
  return [
    { id: "quick-today-singles", title: "Singles hit around", day: "Today", time: "16:30", location: "Satterfield Park", note: "One player, 45 minutes, any level.", ownerName: "Maya T.", ownerEmail: "demo-maya@example.com", rsvps: [] },
    { id: "quick-tomorrow-open", title: "Need 1 for doubles", day: "Tomorrow", time: "07:45", location: "Southeast Clarke Park", note: "Casual doubles before work.", ownerName: "Jordan R.", ownerEmail: "demo-jordan@example.com", rsvps: [] },
    { id: "quick-weekend-rotation", title: "Weekend rotation", day: "This weekend", time: "09:30", location: "Bishop Park", note: "Trying to get 6-8 players for rotating games.", ownerName: "Taylor R.", ownerEmail: "demo-taylor@example.com", rsvps: [] },
  ];
}

function courtDirectory() {
  return [
    { name: "Southeast Clarke Park", city: "Athens", address: "4440 Lexington Road, Athens, GA 30605", access: "Public city/county", surface: "Outdoor", courts: "6 dedicated", note: "Free; permanent nets; dawn to dusk; no lights." },
    { name: "Satterfield Park", city: "Athens", address: "2950 Cherokee Road, Athens, GA 30605", access: "Public city/county", surface: "Outdoor", courts: "6 shared/lined", note: "Lighted courts lined on tennis courts; first come when not reserved." },
    { name: "Bishop Park", city: "Athens", address: "705 Sunset Drive, Athens, GA 30606", access: "Public city/county", surface: "Outdoor", courts: "6 shared/lined", note: "Lighted; lined on tennis/jr tennis courts." },
    { name: "UGA Intramural Fields", city: "Athens", address: "5 Lake Herrick Drive, Athens, GA 30602", access: "College/public access varies", surface: "Outdoor", courts: "18 dedicated", note: "Large outdoor bank; check parking and access rules." },
    { name: "Thomas Lay Community Center", city: "Athens", address: "297 Hoyt Street, Athens, GA 30601", access: "Public city/county", surface: "Indoor", courts: "3", note: "Weekday morning indoor play listed by AAPA." },
    { name: "Aaron Heard Park and Community Center", city: "Athens", address: "400 McKinley Drive, Athens, GA 30601", access: "Public city/county", surface: "Indoor/outdoor", courts: "3 indoor / 4 outdoor", note: "Beginner-friendly sessions; outdoor times can vary by season." },
    { name: "Athens First United Methodist Church", city: "Athens", address: "327 N Lumpkin Street, Athens, GA 30601", access: "Church/community", surface: "Indoor", courts: "3", note: "Tuesday/Thursday afternoon play listed by AAPA." },
    { name: "Herman C. Michael Park", city: "Bishop", address: "1051 Elder Road, Bishop, GA 30621", access: "Oconee County public", surface: "Indoor/outdoor", courts: "3 indoor / 2 outdoor", note: "Indoor fee may apply for non-residents; outdoor free during park hours." },
    { name: "YWCO", city: "Athens", address: "562 Research Drive, Athens, GA 30605", access: "Membership/day fee", surface: "Indoor", courts: "3", note: "Members/Silver Sneakers free; non-member day fee listed by AAPA." },
    { name: "Mars Hill Baptist Church", city: "Watkinsville", address: "2661 Mars Hill Road, Watkinsville, GA 30677", access: "Church/community", surface: "Indoor", courts: "2 dedicated", note: "Tuesday sessions listed by AAPA; free to play." },
    { name: "Oconee Veterans Park", city: "Watkinsville", address: "3500A Hog Mountain Road, Watkinsville, GA 30677", access: "Oconee County public", surface: "Indoor", courts: "2+", note: "County facility; check current schedule and resident/non-resident fees." },
    { name: "Ramsey Student Center", city: "Athens", address: "330 River Road, Athens, GA 30602", access: "UGA students/faculty", surface: "Indoor", courts: "3", note: "UGA access only per AAPA listing." },
    { name: "Jennings Mill Country Club", city: "Bogart", address: "Bogart, GA 30622", access: "Club/private", surface: "Outdoor", courts: "8", note: "Country club members only; pickleball memberships may be available." },
    { name: "Athens Country Club", city: "Athens", address: "2700 Jefferson Road, Athens, GA 30607", access: "Club/private", surface: "Outdoor", courts: "6 dedicated / 12 shared", note: "Member or member guest access." },
    { name: "The Georgia Club", city: "Statham", address: "1050 Chancellors Drive, Statham, GA 30666", access: "Club/private", surface: "Outdoor", courts: "4 dedicated / 4 shared", note: "Member or member guest access." },
    { name: "Winder-Barrow / Victor Lord Park", city: "Winder", address: "175 2nd Street, Winder, GA 30680", access: "Public", surface: "Indoor/outdoor", courts: "7 total", note: "Indoor gym plus outdoor courts; schedule listed by AAPA." },
    { name: "Jefferson Parks and Recreation", city: "Jefferson", address: "2495 Old Pendergrass Road, Jefferson, GA 30549", access: "Public", surface: "Indoor", courts: "4", note: "Indoor schedule listed by AAPA; call to confirm." },
    { name: "Bethlehem First United Methodist Church", city: "Bethlehem", address: "709 Christmas Avenue, Bethlehem, GA 30620", access: "Church/community", surface: "Indoor", courts: "3", note: "Wednesday afternoon play listed by AAPA." },
  ];
}

function renderSocietyFriends() {
  if (!els.societyFriendResults) return;
  const profile = currentSocietyProfile();
  if (!profile?.bio?.trim()) {
    els.societyFriendResults.innerHTML = `<article class="society-list-card profile-required-card"><strong>Create your brief player profile first</strong><p>Tell members how you play, when you are available, and what kind of connection you want. A profile is required before sending connection requests.</p><button data-profile-toggle type="button">Complete My Profile</button></article>`;
    if (els.societyConnectionRequests) els.societyConnectionRequests.innerHTML = "";
    return;
  }
  const query = (els.societyFriendSearch?.value || "").trim().toLowerCase();
  const filter = state.societyFriendFilter || "all";
  const cards = societyDirectoryCards().filter((card) => !state.societyBlockedMembers.includes(card.id)).filter((card) => {
    const haystack = `${card.name} ${card.city} ${card.sport} ${card.skill} ${card.vibe}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesFilter = filter === "all"
      || (filter === "social" ? card.socialPlay : String(card.sport).toLowerCase().includes(filter) || card.sport === "both");
    return matchesQuery && matchesFilter;
  });
  document.querySelectorAll("[data-society-friend-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.societyFriendFilter === filter);
  });
  els.societyFriendResults.innerHTML = cards.length
    ? cards.map((card) => renderSocietyFriendCard(card)).join("")
    : `<article class="society-list-card"><strong>No discoverable members yet</strong><p>Members appear here only after they turn on discoverability in their profile.</p></article>`;
  if (els.societyProfilePreview && state.selectedSocietyProfileId && cards.some((card) => card.id === state.selectedSocietyProfileId)) {
    showSocietyProfilePreview(state.selectedSocietyProfileId);
  } else if (els.societyProfilePreview) {
    state.selectedSocietyProfileId = "";
    els.societyProfilePreview.innerHTML = `<article class="society-list-card"><strong>Tap a member</strong><p>Click a profile photo or name to preview details and connection options.</p></article>`;
  }
  updateSinglesToggle();
  renderSocietyConnectionRequests();
}

function renderSocietyConnectionRequests() {
  if (!els.societyConnectionRequests) return;
  const incoming = state.societyFriendRequests.filter((request) => request.direction === "incoming");
  els.societyConnectionRequests.innerHTML = incoming.length ? `<article class="connection-request-panel"><strong>Connection requests</strong>${incoming.map((request) => `<div><span>${escapeHtml(request.name || "Club Society member")}</span><button data-friend-accept="${escapeHtml(request.id)}" type="button">Approve</button><button data-friend-decline="${escapeHtml(request.id)}" type="button">Decline</button></div>`).join("")}</article>` : "";
}

function showSocietyProfilePreview(id) {
  const card = societyDirectoryCards().find((item) => item.id === id);
  if (!card || !els.societyProfilePreview) return;
  state.selectedSocietyProfileId = id;
  saveState();
  const photo = card.photoDataUrl
    ? `style="background-image:url('${escapeHtml(card.photoDataUrl)}')"`
    : "";
  els.societyProfilePreview.innerHTML = `
    <article class="society-profile-preview-card">
      <button class="society-friend-photo large" data-profile-view="${escapeHtml(card.id)}" ${photo} type="button">${card.photoDataUrl ? "" : escapeHtml(initials(card.name))}</button>
      <div>
        <span>${escapeHtml(card.city)} | ${escapeHtml(card.sport)}</span>
        <strong>${escapeHtml(card.name)}</strong>
        <p>${escapeHtml(card.skill)}</p>
        <p>${escapeHtml(card.bio || card.vibe || "Open to club play.")}</p>
      </div>
      <div class="society-friend-actions">
        <button data-friend-add="${escapeHtml(card.id)}" type="button">Add Friend</button>
        <button ${card.allowMessages === false ? "disabled" : `data-friend-message="${escapeHtml(card.id)}"`} type="button">${card.allowMessages === false ? "No messages" : "Message"}</button>
      </div>
    </article>
  `;
}

function saveCasualMatch(event) {
  event.preventDefault();
  if (!profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  const data = Object.fromEntries(new FormData(els.casualMatchForm).entries());
  state.casualMatches.unshift({ ...data, ...currentPostOwner(), id: newId(), rsvps: [], createdAt: new Date().toISOString() });
  els.casualMatchForm.reset();
  saveState();
  renderCasualMatches();
  renderProfileActivity();
}

function renderCasualMatches() {
  if (!els.casualMatchList) return;
  const filter = state.casualMatchFilter || "all";
  document.querySelectorAll("[data-match-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.matchFilter === filter);
  });
  const currentEmail = (currentSocietyProfile()?.email || state.societySessionEmail || "").toLowerCase();
  const posts = [...state.quickGames, ...state.casualMatches, ...defaultQuickGames(), ...defaultCasualMatches()]
    .filter((post) => String(post.ownerEmail || "").toLowerCase() !== currentEmail)
    .filter((post) => matchesDayFilter(post.day, filter));
  els.casualMatchList.innerHTML = posts.length
    ? posts.map((post) => renderPostCard(post, "match")).join("")
    : `<article class="society-list-card"><strong>No member matches yet</strong><p>Check another day or ask members to post from Play.</p></article>`;
}

function saveQuickGame(event) {
  event.preventDefault();
  if (!profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  const data = Object.fromEntries(new FormData(els.quickGameForm).entries());
  state.quickGames.unshift({ ...data, ...currentPostOwner(), id: newId(), rsvps: [], createdAt: new Date().toISOString() });
  els.quickGameForm.reset();
  saveState();
  renderQuickGames();
  renderProfileActivity();
}

function renderQuickGames() {
  if (!els.quickGameList) return;
  const filter = state.quickGameFilter || "all";
  document.querySelectorAll("[data-quick-game-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.quickGameFilter === filter);
  });
  const currentEmail = (currentSocietyProfile()?.email || state.societySessionEmail || "").toLowerCase();
  const posts = state.quickGames
    .filter((post) => !currentEmail || String(post.ownerEmail || "").toLowerCase() === currentEmail)
    .filter((post) => matchesDayFilter(post.day, filter));
  els.quickGameList.innerHTML = posts.length
    ? posts.map((post) => renderPostCard(post, "quick")).join("")
    : `<article class="society-list-card"><strong>No games posted yet</strong><p>Post a last-minute game above for today, tomorrow, or this weekend.</p></article>`;
}

function renderPostCard(post, type) {
  const rsvps = post.rsvps || [];
  const action = type === "match" ? "data-match-rsvp" : "data-quick-game-rsvp";
  const messageAction = type === "match" ? "data-match-message" : "data-quick-game-message";
  const needed = post.playersNeeded ? `${post.playersNeeded} needed | ` : "";
  return `
    <article class="society-post-card">
      <div>
        <span>${escapeHtml(post.day)} | ${escapeHtml(formatDisplayTime(post.time) || "Time TBD")}</span>
        <strong>${escapeHtml(post.title)}</strong>
        ${post.ownerName ? `<em class="post-owner">Posted by ${escapeHtml(post.ownerName)}</em>` : ""}
        <p>${needed}${escapeHtml(post.location || "Location TBD")} ${post.skill ? `| ${escapeHtml(post.skill)}` : ""}</p>
        <p>${escapeHtml(post.note || "RSVP if you can play.")}</p>
      </div>
      <div class="society-post-actions">
        <span>${rsvps.length} RSVP${rsvps.length === 1 ? "" : "s"}</span>
        <button ${action}="${escapeHtml(post.id)}" type="button">RSVP</button>
        <button ${messageAction}="${escapeHtml(post.id)}" type="button">Message</button>
      </div>
    </article>
  `;
}

function currentPostOwner() {
  const profile = currentSocietyProfile();
  return {
    ownerEmail: profile?.email || state.societySessionEmail || "",
    ownerName: profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Society Member",
  };
}

function renderProfileActivity() {
  if (!els.myRsvpList || !els.myPostList) return;
  const profile = currentSocietyProfile();
  const email = (profile?.email || state.societySessionEmail || "").toLowerCase();
  const allPosts = [
    ...state.casualMatches.map((post) => ({ ...post, typeLabel: "Match" })),
    ...state.quickGames.map((post) => ({ ...post, typeLabel: "Quick Game" })),
  ];
  const myRsvps = allPosts.filter((post) => (post.rsvps || []).some((rsvp) => String(rsvp.email || rsvp).toLowerCase() === email));
  const myPosts = allPosts.filter((post) => String(post.ownerEmail || "").toLowerCase() === email);
  els.myRsvpList.innerHTML = myRsvps.length
    ? myRsvps.map((post) => renderActivityItem(post, `${post.typeLabel} RSVP`)).join("")
    : `<p class="empty-mini">No RSVPs yet.</p>`;
  els.myPostList.innerHTML = myPosts.length
    ? myPosts.map((post) => {
      const responders = (post.rsvps || []).map((rsvp) => rsvp.name || rsvp).filter(Boolean);
      return renderActivityItem(post, `${responders.length} response${responders.length === 1 ? "" : "s"}`, responders.join(", ") || "No responses yet");
    }).join("")
    : `<p class="empty-mini">No posts yet.</p>`;
}

function renderActivityItem(post, label, detail = "") {
  return `
    <article class="society-activity-item">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(post.title || "Untitled")}</strong>
      <p>${escapeHtml(post.day || "Any day")} | ${escapeHtml(formatDisplayTime(post.time) || "Time TBD")} | ${escapeHtml(post.location || "Location TBD")}</p>
      ${detail ? `<p>${escapeHtml(detail)}</p>` : ""}
    </article>
  `;
}

function rsvpToCasualMatch(id) {
  const collection = state.quickGames.some((item) => item.id === id) ? state.quickGames : state.casualMatches;
  rsvpToPost(collection, id);
  renderCasualMatches();
}

function rsvpToQuickGame(id) {
  rsvpToPost(state.quickGames, id);
  renderQuickGames();
}

function rsvpToPost(collection, id) {
  let post = collection.find((item) => item.id === id);
  if (!post) {
    const seed = [...defaultCasualMatches(), ...defaultQuickGames()].find((item) => item.id === id);
    if (!seed) return;
    post = { ...seed, rsvps: [] };
    collection.unshift(post);
  }
  const profile = currentSocietyProfile();
  const name = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Society Member";
  post.rsvps = post.rsvps || [];
  const email = profile?.email || state.societySessionEmail || "";
  if (!post.rsvps.some((rsvp) => String(rsvp.email || rsvp).toLowerCase() === email.toLowerCase())) {
    post.rsvps.push({ name, email, at: new Date().toISOString() });
  }
  saveState();
  renderProfileActivity();
  els.societyAccountMessage.textContent = "RSVP saved.";
}

function allPlayablePosts() {
  return [
    ...state.casualMatches,
    ...state.quickGames,
    ...defaultCasualMatches(),
    ...defaultQuickGames(),
  ];
}

function findPlayablePost(id) {
  return allPlayablePosts().find((post) => post.id === id);
}

function messagePostCreator(id) {
  const post = findPlayablePost(id);
  if (!post) return;
  openPrefilledMessage(
    post.ownerName || "Society Member",
    `Hey ${post.ownerName || "there"}, I saw your post for ${post.title || "a game"} and wanted to connect.`
  );
}

function matchesDayFilter(day, filter) {
  const normalized = String(day || "").toLowerCase();
  if (filter === "all") return true;
  if (filter === "weekend") return normalized.includes("weekend");
  return normalized === filter;
}

function renderCourtDirectory() {
  if (!els.courtDirectoryList) return;
  const query = (els.courtSearch?.value || "").trim().toLowerCase();
  const filter = state.courtFilter || "all";
  const maxMiles = Number(els.courtDistance?.value || state.courtDistance || 25);
  state.courtDistance = String(maxMiles);
  document.querySelectorAll("[data-court-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.courtFilter === filter);
  });
  const courts = courtDirectory().map((court) => ({ ...court, miles: courtMilesFromProfile(court) })).filter((court) => {
    const text = `${court.name} ${court.city} ${court.address} ${court.access} ${court.surface} ${court.courts} ${court.note}`.toLowerCase();
    const filterMatch = filter === "all"
      || (filter === "club" ? court.access.toLowerCase().includes("club") || court.access.toLowerCase().includes("private") : text.includes(filter));
    return court.miles <= maxMiles && filterMatch && (!query || text.includes(query));
  });
  els.courtDirectoryList.innerHTML = courts.map((court) => `
    <article class="society-court-card">
      <span>${court.miles} miles away | ${escapeHtml(court.city)} | ${escapeHtml(court.surface)} | ${escapeHtml(court.access)}</span>
      <strong>${escapeHtml(court.name)}</strong>
      <p>${escapeHtml(court.address)}</p>
      <p>${escapeHtml(court.courts)} - ${escapeHtml(court.note)}</p>
    </article>
  `).join("") || `<article class="society-list-card"><strong>No courts inside ${maxMiles} miles</strong><p>Increase your distance to see more options.</p></article>`;
  saveState();
}

function courtMilesFromProfile(court) {
  const profileCity = String(currentSocietyProfile()?.city || "Watkinsville").toLowerCase();
  const city = String(court.city || "").toLowerCase();
  if (city === profileCity) return 3;
  const estimates = { athens: 12, bishop: 8, bogart: 10, statham: 18, winder: 27, jefferson: 31, bethlehem: 29 };
  return estimates[city] || 35;
}

function savePickleDateProfile(event) {
  event.preventDefault();
  const profile = currentSocietyProfile();
  if (!profile) return;
  const data = Object.fromEntries(new FormData(els.pickleDateProfileForm).entries());
  profile.dateBio = String(data.dateBio || "").trim();
  profile.dateIdea = String(data.dateIdea || "").trim();
  profile.dateProfileActive = data.dateProfileActive === "on";
  profile.dateInterested = profile.dateInterested || profile.dateProfileActive;
  profile.updatedAt = new Date().toISOString();
  saveState();
  renderPickleDateProfiles();
  showSocietyAccountMessage(profile.dateProfileActive ? "Your private pickleball date profile is live." : "Your date profile is saved but hidden.", "success");
}

function renderPickleDateProfiles() {
  if (!els.pickleDateResults || !els.pickleDateProfileForm) return;
  const current = currentSocietyProfile();
  els.pickleDateProfileForm.elements.dateBio.value = current?.dateBio || "";
  els.pickleDateProfileForm.elements.dateIdea.value = current?.dateIdea || "";
  els.pickleDateProfileForm.elements.dateProfileActive.checked = current?.dateProfileActive === true;
  const minAge = Math.max(18, Number(els.pickleDateAgeMin?.value || 18));
  const maxAge = Math.max(minAge, Number(els.pickleDateAgeMax?.value || 99));
  const maxMiles = Number(els.pickleDateMiles?.value || 25);
  const demoDates = [
    { id: "date-maya", name: "Maya", age: 34, miles: 6, level: "3.5 doubles", bio: "Competitive rallies, easy laughs, and coffee after the match.", idea: "Saturday morning open play and brunch." },
    { id: "date-jordan", name: "Jordan", age: 41, miles: 14, level: "3.0 social", bio: "Here for good games, good conversation, and no pressure.", idea: "A relaxed mixed-doubles social." },
    { id: "date-taylor", name: "Taylor", age: 29, miles: 22, level: "4.0", bio: "Serious about improving, equally serious about having fun.", idea: "Best-of-three then tacos." },
  ];
  const profiles = demoDates.filter((profile) => profile.age >= minAge && profile.age <= maxAge && profile.miles <= maxMiles);
  els.pickleDateResults.innerHTML = profiles.length ? profiles.map((profile) => `
    <article class="pickle-date-profile">
      <div class="pickle-date-avatar">${escapeHtml(initials(profile.name))}</div>
      <div><span>${profile.age} | ${profile.miles} miles away | ${escapeHtml(profile.level)}</span><strong>${escapeHtml(profile.name)}</strong><p>${escapeHtml(profile.bio)}</p><em>${escapeHtml(profile.idea)}</em></div>
      <button data-pickle-date-message="${escapeHtml(profile.id)}" type="button">Message</button>
    </article>
  `).join("") : `<article class="society-list-card"><strong>No matches in this range yet</strong><p>Try widening the age or distance filters.</p></article>`;
}

function activeMemberHostDraft() {
  const format = state.memberHostFormat || "round-robin";
  state.memberHostDrafts ||= {};
  state.memberHostDrafts[format] ||= { format, matches: [] };
  return state.memberHostDrafts[format];
}

function fillMemberHostForm() {
  if (!els.memberHostForm) return;
  const draft = activeMemberHostDraft();
  els.memberHostForm.elements.eventName.value = draft.eventName || "";
  els.memberHostForm.elements.passcode.value = draft.passcode || "";
  els.memberHostForm.elements.playType.value = draft.playType || "singles";
  els.memberHostForm.elements.courts.value = draft.courts || "2";
  els.memberHostForm.elements.participants.value = (draft.participants || []).join("\n");
  document.querySelectorAll("[data-member-host-format]").forEach((button) => button.classList.toggle("active", button.dataset.memberHostFormat === state.memberHostFormat));
}

async function buildMemberHostedEvent(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.memberHostForm).entries());
  const participants = String(data.participants || "").split(/\r?\n/).map((name) => name.trim()).filter(Boolean);
  if (participants.length < 2) {
    showSocietyAccountMessage("Add at least two players or teams.", "error");
    return;
  }
  const matches = [];
  if (state.memberHostFormat === "tournament") {
    for (let index = 0; index < participants.length; index += 2) matches.push({ id: newId(), round: 1, playerA: participants[index], playerB: participants[index + 1] || "Bye", scoreA: "", scoreB: "", winner: participants[index + 1] ? "" : participants[index] });
  } else {
    for (let left = 0; left < participants.length; left += 1) for (let right = left + 1; right < participants.length; right += 1) matches.push({ id: newId(), round: matches.length + 1, playerA: participants[left], playerB: participants[right], scoreA: "", scoreB: "", winner: "" });
  }
  const previous = activeMemberHostDraft();
  state.memberHostDrafts[state.memberHostFormat] = { ...previous, ...data, format: state.memberHostFormat, participants, matches, updatedAt: new Date().toISOString() };
  saveState();
  renderMemberHostBoard();
  await publishMemberHostedEvent(true);
}

function renderMemberHostBoard() {
  if (!els.memberHostBoard) return;
  const draft = activeMemberHostDraft();
  els.memberHostBoard.innerHTML = draft.matches?.length ? `<div class="member-host-board-head"><span>${escapeHtml(draft.playType || "singles")} | ${draft.joinCode ? `Join code ${escapeHtml(draft.joinCode)}` : "Saving join code..."}</span><strong>${escapeHtml(draft.eventName || "Hosted Event")}</strong></div>${draft.matches.map((match) => `
    <article class="member-host-match">
      <span>${draft.format === "tournament" ? `Round ${match.round}` : `Match ${match.round}`}</span>
      <div><button data-member-host-winner="${match.id}" data-side="a" type="button" class="${match.winner === match.playerA ? "winner" : ""}">${escapeHtml(match.playerA)}</button><input data-member-score="${match.id}" data-side="a" type="number" min="0" value="${escapeHtml(match.scoreA)}" placeholder="0"></div>
      <div><button data-member-host-winner="${match.id}" data-side="b" type="button" class="${match.winner === match.playerB ? "winner" : ""}">${escapeHtml(match.playerB)}</button><input data-member-score="${match.id}" data-side="b" type="number" min="0" value="${escapeHtml(match.scoreB)}" placeholder="0"></div>
      <em>${match.winner ? `${escapeHtml(match.winner)} advances / wins` : "Enter scores, then tap the winner"}</em>
    </article>`).join("")}${draft.format === "tournament" ? '<button class="primary member-advance-button" data-member-host-advance type="button">Advance Winners</button>' : ""}` : `<article class="society-list-card"><strong>Your event board will appear here</strong><p>Choose a format, add players or teams, and create the event.</p></article>`;
  els.memberHostBoard.querySelectorAll("[data-member-score]").forEach((input) => input.addEventListener("change", () => {
    const match = activeMemberHostDraft().matches.find((item) => item.id === input.dataset.memberScore);
    if (match) match[input.dataset.side === "a" ? "scoreA" : "scoreB"] = input.value;
    saveState();
    publishMemberHostedEvent();
  }));
  renderMemberHostArchives();
}

function advanceMemberTournament() {
  const draft = activeMemberHostDraft();
  const currentRound = Math.max(0, ...draft.matches.map((match) => Number(match.round) || 0));
  const currentMatches = draft.matches.filter((match) => Number(match.round) === currentRound);
  if (!currentMatches.length || currentMatches.some((match) => !match.winner)) {
    showSocietyAccountMessage("Select a winner for every match before advancing.", "error");
    return;
  }
  if (currentMatches.length === 1) {
    showSocietyAccountMessage(`${currentMatches[0].winner} is the tournament champion.`, "success");
    return;
  }
  const winners = currentMatches.map((match) => match.winner);
  for (let index = 0; index < winners.length; index += 2) draft.matches.push({ id: newId(), round: currentRound + 1, playerA: winners[index], playerB: winners[index + 1] || "Bye", scoreA: "", scoreB: "", winner: winners[index + 1] ? "" : winners[index] });
  saveState();
  publishMemberHostedEvent();
  renderMemberHostBoard();
}

function clearMemberHostedEvent() {
  const draft = activeMemberHostDraft();
  if (draft.matches?.length && !window.confirm(`Start over and clear ${draft.eventName || "this event"}?`)) return;
  state.memberHostDrafts[state.memberHostFormat] = { format: state.memberHostFormat, matches: [] };
  saveState();
  fillMemberHostForm();
  renderMemberHostBoard();
}

function archiveMemberHostedEvent() {
  const draft = activeMemberHostDraft();
  if (!draft.matches?.length) {
    showSocietyAccountMessage("Create an event before archiving it.", "error");
    return;
  }
  state.memberHostArchives.unshift({ ...structuredClone(draft), archivedAt: new Date().toISOString() });
  state.memberHostDrafts[state.memberHostFormat] = { format: state.memberHostFormat, matches: [] };
  saveState();
  fillMemberHostForm();
  renderMemberHostBoard();
  showSocietyAccountMessage("Event archived on this phone and in your account backup.", "success");
}

function restoreMemberHostedEvent(id) {
  const archived = state.memberHostArchives.find((item) => (item.sharedEventId || item.updatedAt) === id);
  if (!archived) return;
  state.memberHostFormat = archived.format || "round-robin";
  state.memberHostDrafts[state.memberHostFormat] = structuredClone(archived);
  saveState();
  fillMemberHostForm();
  renderMemberHostBoard();
}

function renderMemberHostArchives() {
  if (!els.memberHostArchiveList) return;
  els.memberHostArchiveList.innerHTML = state.memberHostArchives.length ? state.memberHostArchives.map((item) => `
    <article class="society-list-card"><strong>${escapeHtml(item.eventName || "Hosted Event")}</strong><span>${escapeHtml(item.format || "event")} | ${formatDateTime(item.archivedAt)}</span><p>${item.matches?.length || 0} matches saved</p><button data-member-host-restore="${escapeHtml(item.sharedEventId || item.updatedAt)}" type="button">Open Archived Event</button></article>
  `).join("") : `<div class="empty">No archived events on this phone yet.</div>`;
}

async function publishMemberHostedEvent(announce = false) {
  const draft = activeMemberHostDraft();
  if (!draft.eventName || !draft.matches?.length || !canUseMemberCloudSync()) return;
  try {
    const response = await fetch("/api/member-event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", email: state.cloudMemberSync.email, syncToken: state.cloudMemberSync.token, event: draft }) });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Shared event could not be saved");
    draft.sharedEventId = result.event.id;
    draft.joinCode = result.event.joinCode;
    draft.updatedAt = result.event.updatedAt;
    saveState();
    renderMemberHostBoard();
    if (announce) showSocietyAccountMessage(`Event ready. Players can join with ${result.event.joinCode}${draft.passcode ? " and your passcode" : " or the event name"}.`, "success");
  } catch (error) {
    if (announce) showSocietyAccountMessage(error.message, "error");
  }
}

async function joinMemberHostedEvent(event) {
  event.preventDefault();
  if (!canUseMemberCloudSync()) {
    showSocietyAccountMessage("Sign in before joining a shared event.", "error");
    return;
  }
  const data = Object.fromEntries(new FormData(els.memberHostJoinForm).entries());
  try {
    const response = await fetch("/api/member-event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join", email: state.cloudMemberSync.email, syncToken: state.cloudMemberSync.token, eventKey: data.eventKey, passcode: data.passcode }) });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Event not found");
    state.memberHostFormat = result.event.format;
    state.memberHostDrafts[result.event.format] = result.event;
    saveState();
    fillMemberHostForm();
    renderMemberHostBoard();
    showSocietyAccountMessage(`Joined ${result.event.eventName}. Scores now sync for joined players.`, "success");
  } catch (error) {
    showSocietyAccountMessage(error.message, "error");
  }
}

async function refreshMemberHostedEvent() {
  if (memberHostRefreshBusy || !canUseMemberCloudSync() || !document.querySelector('[data-society-panel="memberHost"]')?.classList.contains("active")) return;
  const draft = activeMemberHostDraft();
  if (!draft.sharedEventId) return;
  memberHostRefreshBusy = true;
  try {
    const response = await fetch("/api/member-event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "get", email: state.cloudMemberSync.email, syncToken: state.cloudMemberSync.token, eventId: draft.sharedEventId }) });
    const result = await response.json();
    if (response.ok && result.ok && result.event.updatedAt !== draft.updatedAt) {
      state.memberHostDrafts[result.event.format] = result.event;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      fillMemberHostForm();
      renderMemberHostBoard();
    }
  } catch {
    // Keep the local board usable while the phone is temporarily offline.
  } finally {
    memberHostRefreshBusy = false;
  }
}

function renderSocietyFriendCard(card) {
  const isFriend = state.societyFriends.includes(card.id);
  const pending = state.societyFriendRequests.some((request) => request.memberId === card.id && request.direction === "outgoing");
  const photo = card.photoDataUrl
    ? `style="background-image:url('${escapeHtml(card.photoDataUrl)}')"`
    : "";
  return `
    <article class="society-friend-card">
      <button class="society-friend-photo" data-profile-view="${escapeHtml(card.id)}" ${photo} type="button" aria-label="View ${escapeHtml(card.name)}">${card.photoDataUrl ? "" : escapeHtml(initials(card.name))}</button>
      <div>
        <span>${escapeHtml(card.city)} | ${escapeHtml(card.sport)}</span>
        <button class="profile-name-link" data-profile-view="${escapeHtml(card.id)}" type="button">${escapeHtml(card.name)}</button>
        <p>${escapeHtml(card.skill)} - ${escapeHtml(card.vibe)}</p>
      </div>
      <div class="society-friend-actions">
        ${isFriend ? `<button class="active" data-friend-remove="${escapeHtml(card.id)}" type="button">Remove</button>` : `<button class="${pending ? "active" : ""}" data-friend-add="${escapeHtml(card.id)}" type="button" ${pending ? "disabled" : ""}>${pending ? "Requested" : "Connect"}</button>`}
        <button class="danger-link" data-friend-block="${escapeHtml(card.id)}" type="button">Block</button>
        <button ${card.allowMessages === false ? "disabled" : `data-friend-message="${escapeHtml(card.id)}"`} type="button">${card.allowMessages === false ? "No messages" : "Message"}</button>
      </div>
    </article>
  `;
}

function addSocietyFriend(id) {
  if (!id) return;
  const profile = currentSocietyProfile();
  if (!profile?.bio?.trim()) {
    showSocietyAccountMessage("Complete your brief player profile before connecting with members.", "notice");
    toggleSocietyProfileDrawer(true);
    return;
  }
  if (!state.societyFriendRequests.some((request) => request.memberId === id && request.direction === "outgoing")) state.societyFriendRequests.push({ id: newId(), memberId: id, direction: "outgoing", status: "pending", createdAt: new Date().toISOString() });
  saveState();
  syncSocietyConnection("request", id);
  renderSocietyFriends();
  showSocietyAccountMessage("Connection request sent. They must approve it before you are connected.", "success");
}

function acceptSocietyFriend(requestId) { const request = state.societyFriendRequests.find((item) => item.id === requestId); if (!request) return; if (!state.societyFriends.includes(request.memberId)) state.societyFriends.push(request.memberId); state.societyFriendRequests = state.societyFriendRequests.filter((item) => item.id !== requestId); syncSocietyConnection("approve", request.memberId); saveState(); renderSocietyFriends(); updateSocietyHome(); }
function declineSocietyFriend(requestId) { const request = state.societyFriendRequests.find((item) => item.id === requestId); if (request) syncSocietyConnection("decline", request.memberId); state.societyFriendRequests = state.societyFriendRequests.filter((item) => item.id !== requestId); saveState(); renderSocietyFriends(); }
function removeSocietyFriend(id) { syncSocietyConnection("remove", id); state.societyFriends = state.societyFriends.filter((item) => item !== id); saveState(); renderSocietyFriends(); updateSocietyHome(); }
function blockSocietyFriend(id) { if (!window.confirm("Block this member? They will disappear from Connect Players and will not be able to connect with you.")) return; syncSocietyConnection("block", id); state.societyBlockedMembers = Array.from(new Set([...state.societyBlockedMembers, id])); state.societyFriends = state.societyFriends.filter((item) => item !== id); state.societyFriendRequests = state.societyFriendRequests.filter((item) => item.memberId !== id); saveState(); renderSocietyFriends(); updateSocietyHome(); }

async function syncSocietyConnection(action, memberId) {
  if (!canUseMemberCloudSync()) return;
  const card = societyDirectoryCards().find((item) => item.id === memberId);
  if (!card?.email) return;
  try { await fetch("/api/member-connections", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ action, email:state.cloudMemberSync.email, syncToken:state.cloudMemberSync.token, targetEmail:card.email }) }); } catch { /* Keep local request queued in account sync. */ }
}

function messageSocietyFriend(id) {
  if (!profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  const card = societyDirectoryCards().find((item) => item.id === id);
  if (!card) return;
  if (card.allowMessages === false) {
    els.societyAccountMessage.textContent = "That member is not accepting messages right now.";
    return;
  }
  setSocietyTab("golfMessages");
  els.golfMessageForm.elements.to.value = card.name;
  els.golfMessageForm.elements.body.value = `Want to connect for ${String(card.sport).includes("golf") ? "a round" : "a game"} sometime?`;
}

function toggleSocialPlay() {
  const profile = currentSocietyProfile();
  if (!profile) return;
  profile.socialPlay = !profile.socialPlay;
  saveState();
  updateSinglesToggle();
  renderSocietyFriends();
  els.societyAccountMessage.textContent = profile.socialPlay
    ? "Social Play is on. Members can see you are open to friendly meetups."
    : "Social Play is off.";
}

function saveClubGroup(event) {
  event.preventDefault();
  if (!profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  const data = Object.fromEntries(new FormData(els.clubGroupForm).entries());
  const owner = currentPostOwner();
  state.clubGroups.unshift({
    ...data,
    ...owner,
    id: newId(),
    invitees: splitInvitees(data.invitees),
    members: [owner.ownerEmail].filter(Boolean),
    messages: [],
    events: [],
    createdAt: new Date().toISOString(),
  });
  els.clubGroupForm.reset();
  saveState();
  renderClubGroups();
  renderMyGroups();
  els.societyAccountMessage.textContent = `${data.name} created.`;
}

function currentGroupIdentity() {
  const profile = currentSocietyProfile();
  return {
    email: (profile?.email || state.societySessionEmail || "").toLowerCase(),
    name: profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim().toLowerCase() : "",
  };
}

function isGroupOwner(group, email = currentGroupIdentity().email) {
  return String(group.ownerEmail || "").toLowerCase() === email;
}

function isGroupInvited(group, identity = currentGroupIdentity()) {
  return (group.invitees || []).some((invite) => {
    const value = invite.toLowerCase();
    return value === identity.email || (identity.name && value === identity.name);
  });
}

function isGroupMember(group, email = currentGroupIdentity().email) {
  return (group.members || []).some((member) => String(member).toLowerCase() === email);
}

function myClubGroups() {
  const identity = currentGroupIdentity();
  return state.clubGroups.filter((group) => {
    const isOwner = isGroupOwner(group, identity.email);
    const isJoined = isGroupMember(group, identity.email);
    const isInvited = isGroupInvited(group, identity);
    return isOwner || isJoined || isInvited;
  });
}

function renderClubGroups() {
  if (!els.clubGroupList) return;
  const identity = currentGroupIdentity();
  const groups = state.clubGroups.filter((group) => group.visibility === "public");
  els.clubGroupList.innerHTML = groups.length
    ? groups.map((group) => renderClubGroupCard(group, identity.email, "public")).join("")
    : `<article class="society-list-card"><strong>No public groups yet</strong><p>Create a public group from My Groups and it will show here for members to join.</p></article>`;
}

function renderMyGroups() {
  if (!els.myGroupList) return;
  const identity = currentGroupIdentity();
  const groups = myClubGroups();
  if (els.societyGroupCount) els.societyGroupCount.textContent = String(groups.length);
  els.myGroupList.innerHTML = groups.length
    ? groups.map((group) => renderClubGroupCard(group, identity.email, "mine")).join("")
    : `<article class="society-list-card"><strong>No groups yet</strong><p>Create a group above or join a public group from Club Groups.</p></article>`;
}

function renderClubGroupCard(group, currentEmail, context = "mine") {
  const isOwner = isGroupOwner(group, currentEmail);
  const isJoined = isGroupMember(group, currentEmail);
  const canJoin = context === "public" && !isOwner && !isJoined;
  const invitees = (group.invitees || []).join(", ") || "No invitees yet";
  const events = (group.events || []).map((item) => `
    <li><strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.date || "Date TBD")} ${escapeHtml(formatDisplayTime(item.time) || "")} | ${escapeHtml(item.repeats || "One-time")}</li>
  `).join("") || "<li>No scheduled events yet.</li>";
  const messages = (group.messages || []).slice(0, 3).map((item) => `
    <p><strong>${escapeHtml(item.from || "Member")}:</strong> ${escapeHtml(item.body)}</p>
  `).join("") || "<p>No group messages yet.</p>";
  return `
    <article class="club-group-card">
      <div class="club-group-head">
        <div>
          <span>${escapeHtml(group.visibility)} | ${escapeHtml(group.sport)}</span>
          <strong>${escapeHtml(group.name)}</strong>
          <p>${escapeHtml(group.description || "A Club Society group.")}</p>
        </div>
        <span class="status-pill">${escapeHtml(group.ownerName || "Organizer")}</span>
      </div>
      <p class="meta">Invited: ${escapeHtml(invitees)}</p>
      <div class="club-group-events"><span>Schedule</span><ul>${events}</ul></div>
      <div class="club-group-messages"><span>Group chat</span>${messages}</div>
      <div class="society-friend-actions">
        ${canJoin ? `<button class="primary" data-group-join="${escapeHtml(group.id)}" type="button">Join Group</button>` : `<button data-group-message="${escapeHtml(group.id)}" type="button">Message Group</button>`}
        ${context === "public" && isJoined ? `<button class="active" type="button" disabled>Joined</button>` : ""}
        ${isOwner && context === "mine" ? `<button data-group-add-event="${escapeHtml(group.id)}" type="button">Schedule Event</button><button class="danger" data-group-delete="${escapeHtml(group.id)}" type="button">Delete</button>` : ""}
      </div>
    </article>
  `;
}

function joinClubGroup(id) {
  const group = state.clubGroups.find((item) => item.id === id);
  const email = currentGroupIdentity().email;
  if (!group || !email) return;
  group.members = group.members || [];
  if (!group.members.some((member) => String(member).toLowerCase() === email)) {
    group.members.push(email);
  }
  saveState();
  renderClubGroups();
  renderMyGroups();
  els.societyAccountMessage.textContent = `Joined ${group.name}.`;
}

function messageClubGroup(id) {
  const group = state.clubGroups.find((item) => item.id === id);
  if (!group) return;
  const body = window.prompt(`Message ${group.name}`);
  if (!body?.trim()) return;
  group.messages = group.messages || [];
  group.messages.unshift({ from: currentPostOwner().ownerName, body: body.trim(), at: new Date().toISOString() });
  saveState();
  renderClubGroups();
  renderMyGroups();
}

function addClubGroupEvent(id) {
  const group = state.clubGroups.find((item) => item.id === id);
  if (!group) return;
  const title = window.prompt("Event name");
  if (!title?.trim()) return;
  const date = window.prompt("Event date, ex: Friday or 2026-08-01") || "";
  const time = window.prompt("Start time, ex: 6:00 PM") || "";
  const repeats = window.prompt("Repeat schedule: One-time, Weekly, Monthly") || "One-time";
  group.events = group.events || [];
  group.events.unshift({ id: newId(), title: title.trim(), date, time, repeats, createdAt: new Date().toISOString() });
  saveState();
  renderClubGroups();
  renderMyGroups();
}

function deleteClubGroup(id) {
  const group = state.clubGroups.find((item) => item.id === id);
  if (!group) return;
  if (!window.confirm(`Delete ${group.name}?`)) return;
  state.clubGroups = state.clubGroups.filter((item) => item.id !== id);
  saveState();
  renderClubGroups();
  renderMyGroups();
}

function splitInvitees(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function updateSinglesToggle() {
  const enabled = Boolean(currentSocietyProfile()?.socialPlay);
  if (!els.societySinglesToggle) return;
  els.societySinglesToggle.classList.toggle("active", enabled);
  els.societySinglesToggle.textContent = enabled ? "On" : "Turn On";
}

function initials(name) {
  return String(name || "CS")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "CS";
}

function setSocietyEventTab(tab) {
  document.querySelectorAll("[data-society-event-list]").forEach((list) => {
    list.classList.toggle("active", list.dataset.societyEventList === tab);
  });
  document.querySelectorAll("[data-society-event-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.societyEventTab === tab);
  });
}

function addSocietyFavorite(label) {
  if (!label) return;
  if (!state.societyFavorites.includes(label)) state.societyFavorites.push(label);
  saveState();
  updateSocietyHome();
  els.societyAccountMessage.textContent = `${label} added to favorites and reminders.`;
}

function saveGolfTeeTime(event) {
  event.preventDefault();
  if (!profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  const data = Object.fromEntries(new FormData(els.golfTeeTimeForm).entries());
  state.golfTeeTimes.unshift({
    ...data,
    id: newId(),
    zip: data.zip || "30677",
    createdAt: new Date().toISOString(),
  });
  els.golfTeeTimeForm.reset();
  els.golfTeeTimeForm.elements.zip.value = "30677";
  saveState();
  renderGolf();
}

function saveGolfGroup(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.golfGroupForm).entries());
  state.golfGroups.unshift({ ...data, id: newId(), createdAt: new Date().toISOString() });
  els.golfGroupForm.reset();
  saveState();
  renderGolf();
}

function saveGolfMessage(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.golfMessageForm).entries());
  const recipient = resolveMessageRecipient(data.to);
  if (!recipient.ok) {
    els.societyAccountMessage.textContent = recipient.message;
    els.golfMessageForm.elements.to.focus();
    return;
  }
  state.golfMessages.unshift({
    ...data,
    to: recipient.name,
    toId: recipient.id || "",
    id: newId(),
    from: currentPostOwner().ownerName || "You",
    createdAt: new Date().toISOString(),
  });
  els.golfMessageForm.reset();
  saveState();
  renderGolf();
  els.societyAccountMessage.textContent = `Message sent to ${recipient.name}.`;
}

function passGolfMatch() {
  const cards = golfMatchCards();
  state.golfMatchIndex = (state.golfMatchIndex + 1) % cards.length;
  saveState();
  renderGolfMatchDeck();
}

function messageGolfMatch() {
  if (!profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  const card = golfMatchCards()[state.golfMatchIndex % golfMatchCards().length];
  setSocietyTab("golfMessages");
  els.golfMessageForm.elements.to.value = card.name;
  els.golfMessageForm.elements.body.value = `Interested in ${card.cta.toLowerCase()} at ${card.course}.`;
}

function renderGolf() {
  renderGolfMatchDeck();
  renderGolfTeeTimes();
  renderGolfGroups();
  renderGolfMessages();
  renderGolfCourses();
}

async function renderGolfCourses() {
  if (!els.golfCourseList) return;
  const distance = Number(els.golfCourseDistance?.value || state.golfCourseDistance || 25);
  state.golfCourseDistance = String(distance);
  saveState();
  const profile = currentSocietyProfile();
  const profileLabel = [profile?.city, profile?.state, profile?.zip].filter(Boolean).join(", ") || "Watkinsville, GA 30677";
  const label = state.golfCourseZip || profileLabel;
  if (els.golfCourseZip && !els.golfCourseZip.value) els.golfCourseZip.value = state.golfCourseZip || profile?.zip || "";
  els.golfCourseLocation.textContent = state.golfCourseCoordinates?.source === "device" ? "Using your current device location" : `Near ${label}`;
  els.golfCourseList.innerHTML = `<div class="empty">Finding courses within ${distance} miles of ${escapeHtml(label)}...</div>`;
  try {
    const params = new URLSearchParams({ miles: String(distance) });
    if (state.golfCourseCoordinates?.lat && state.golfCourseCoordinates?.lon) {
      params.set("lat", state.golfCourseCoordinates.lat);
      params.set("lon", state.golfCourseCoordinates.lon);
    } else {
      params.set("location", label);
    }
    const response = await fetch(`/api/golf-courses?${params}`);
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Course search is unavailable.");
    els.golfCourseLocation.textContent = `Near ${result.locationLabel || label}`;
    els.golfCourseList.innerHTML = result.courses.length ? result.courses.map((course) => `
      <article class="society-list-card">
        <strong>${escapeHtml(course.name)}</strong>
        <span>${course.miles} miles away | ${escapeHtml(course.access)}</span>
        <p>${escapeHtml(course.address || "Course details available from the course.")}</p>
        <div class="course-card-actions">
          <a class="course-map-link" href="${escapeHtml(golfCourseMapUrl(course))}" target="_blank" rel="noopener">Open in Maps</a>
          ${course.website ? `<a href="${escapeHtml(course.website)}" target="_blank" rel="noopener">Course Website</a>` : ""}
          ${course.bookingUrl && course.access !== "Private" ? `<a class="primary" href="${escapeHtml(course.bookingUrl)}" target="_blank" rel="noopener">View Tee Times</a>` : `<span>${course.access === "Private" ? "Member access only" : "Call course for tee times"}</span>`}
        </div>
      </article>
    `).join("") : `<div class="empty">No mapped golf courses were found inside ${distance} miles. Try a wider distance.</div>`;
  } catch (error) {
    els.golfCourseList.innerHTML = `<div class="empty">${escapeHtml(error.message)} Check your profile city/ZIP or try Use My Current Location.</div>`;
  }
}

function golfCourseMapUrl(course) {
  const query = course.lat && course.lon
    ? `${course.lat},${course.lon}`
    : [course.name, course.address].filter(Boolean).join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function searchGolfCoursesByZip(event) {
  event.preventDefault();
  const zip = String(els.golfCourseZip?.value || "").trim();
  if (!/^\d{5}$/.test(zip)) {
    showSocietyAccountMessage("Enter a valid five-digit ZIP code.", "error");
    els.golfCourseZip?.focus();
    return;
  }
  state.golfCourseZip = zip;
  state.golfCourseCoordinates = null;
  saveState();
  renderGolfCourses();
}

function useCurrentGolfLocation() {
  if (!navigator.geolocation) {
    showSocietyAccountMessage("Current location is not supported on this device.", "error");
    return;
  }
  els.golfCourseLocation.textContent = "Requesting your location...";
  navigator.geolocation.getCurrentPosition((position) => {
    state.golfCourseCoordinates = { lat: String(position.coords.latitude), lon: String(position.coords.longitude), source: "device" };
    state.golfCourseZip = "";
    saveState();
    renderGolfCourses();
  }, () => {
    showSocietyAccountMessage("Location was not shared. Course search will use the city and ZIP in your profile.", "notice");
    renderGolfCourses();
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
}

function renderGolfMatchDeck() {
  const cards = golfMatchCards();
  const card = cards[state.golfMatchIndex % cards.length];
  els.golfMatchDeck.innerHTML = `
    <article class="golf-match-card">
      <span>${escapeHtml(card.distance)} from 30677</span>
      <strong>${escapeHtml(card.name)}</strong>
      <p>${escapeHtml(card.course)} | ${escapeHtml(card.time)} | HCP ${escapeHtml(card.handicap)}</p>
      <div class="golf-card-tags">
        ${card.tags.map((tag) => `<em>${escapeHtml(tag)}</em>`).join("")}
      </div>
      <div class="golf-card-cta">${escapeHtml(card.cta)}</div>
    </article>
  `;
}

function renderGolfTeeTimes() {
  const demo = [
    { course: "Lane Creek Golf Club", date: "Today", time: "4:20 PM", spots: "1", note: "Single dropped. Need one more for a relaxed foursome." },
    { course: "UGA Golf Course", date: "Tomorrow", time: "8:40 AM", spots: "2", note: "Cart booked. Casual pace, 12-20 handicap range." },
  ];
  const items = [...state.golfTeeTimes, ...demo];
  els.golfTeeTimeList.innerHTML = items.map((item) => `
    <article class="society-list-card">
      <strong>${escapeHtml(item.course)}</strong>
      <span>${escapeHtml(item.date)} | ${escapeHtml(formatDisplayTime(item.time))} | ${escapeHtml(item.spots)} open</span>
      <p>${escapeHtml(item.note || "Open tee time inside the Club Society golf radius.")}</p>
    </article>
  `).join("");
}

function renderGolfGroups() {
  const demo = [
    { name: "Oconee After Work 9", vibe: "Casual foursome finder", note: "Weekday nine-hole rounds near Watkinsville." },
    { name: "Athens Weekend Skins", vibe: "Competitive matches", note: "Friendly matches with a little pressure." },
  ];
  const items = [...state.golfGroups, ...demo];
  els.golfGroupList.innerHTML = items.map((item) => `
    <article class="society-list-card">
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(item.vibe)}</span>
      <p>${escapeHtml(item.note || "Golf group inside the 30677 radius.")}</p>
    </article>
  `).join("");
}

function renderGolfMessages() {
  els.golfMessageList.innerHTML = state.golfMessages.length
    ? state.golfMessages.map((message) => `
      <article class="society-list-card">
        <strong>${escapeHtml(message.to)}</strong>
        <span>${escapeHtml(message.from)} | ${formatDateTime(message.createdAt)}</span>
        <p>${escapeHtml(message.body)}</p>
      </article>
    `).join("")
    : `<div class="empty">No golf messages yet. Message a match or tee-time host to start the conversation.</div>`;
}

function messageSuggestionCards() {
  const profile = currentSocietyProfile();
  const currentEmail = (profile?.email || state.societySessionEmail || "").toLowerCase();
  const profileCards = state.profiles
    .filter((item) => item.email?.toLowerCase() !== currentEmail)
    .filter((item) => item.discoverable === true || item.allowMessages === true)
    .map((item) => ({
      id: item.id,
      name: `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email,
      email: item.email || "",
      type: "Member",
    }));
  const demoCards = societyDirectoryCards().map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email || "",
    type: "Member",
  }));
  const groupCards = state.clubGroups.map((item) => ({
    id: item.id,
    name: item.name,
    email: "",
    type: item.visibility === "private" ? "Private group" : "Group",
  }));
  const postOwnerCards = allPlayablePosts()
    .filter((item) => item.ownerName)
    .map((item) => ({
      id: item.ownerEmail || item.ownerName,
      name: item.ownerName,
      email: item.ownerEmail || "",
      type: "Post creator",
    }));
  const hostCards = state.events.map((item) => ({
    id: item.id,
    name: item.ownerName || item.hostName || "Club Society Host",
    email: item.ownerEmail || item.hostEmail || "",
    type: "Event host",
  }));
  const byName = new Map();
  [...profileCards, ...demoCards, ...groupCards, ...postOwnerCards, ...hostCards, { id: "club-society-host", name: "Club Society Host", email: "", type: "Event host" }]
    .filter((item) => item.name)
    .forEach((item) => {
      const key = item.name.toLowerCase();
      if (!byName.has(key)) byName.set(key, item);
    });
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function updateMemberSuggestions() {
  if (!els.memberSuggestionList) return;
  els.memberSuggestionList.innerHTML = messageSuggestionCards().map((item) => `
    <option value="${escapeHtml(item.name)}" label="${escapeHtml([item.type, item.email].filter(Boolean).join(" | "))}"></option>
  `).join("");
}

function resolveMessageRecipient(value) {
  const input = String(value || "").trim();
  if (!input) return { ok: false, message: "Type a member or group name first." };
  const normalized = input.toLowerCase();
  const cards = messageSuggestionCards();
  const exact = cards.find((item) => item.name.toLowerCase() === normalized || item.email.toLowerCase() === normalized);
  if (exact) return { ok: true, ...exact };
  const partial = cards.filter((item) => item.name.toLowerCase().includes(normalized));
  if (partial.length === 1) return { ok: true, ...partial[0] };
  if (partial.length > 1) return { ok: false, message: "Pick one matching member from the suggestions." };
  return { ok: false, message: "No matching member or group found. Try a different name." };
}

function openPrefilledMessage(to, body) {
  if (!profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  setSocietyTab("golfMessages");
  els.golfMessageForm.elements.to.value = to || "Club Society Host";
  els.golfMessageForm.elements.body.value = body || "Wanted to connect about this post.";
  els.golfMessageForm.elements.body.focus();
}

function golfMatchCards() {
  return [
    { name: "Blake M.", course: "Lane Creek Golf Club", time: "Today 4:10 PM", handicap: "11", distance: "9 miles", cta: "Needs one more", tags: ["Fast reply", "Cart booked", "Casual"] },
    { name: "Jordan K.", course: "UGA Golf Course", time: "Tomorrow 8:40 AM", handicap: "18", distance: "12 miles", cta: "Open twosome", tags: ["Beginner friendly", "Morning", "Social"] },
    { name: "Taylor R.", course: "Jennings Mill", time: "Friday 2:30 PM", handicap: "6", distance: "14 miles", cta: "Match play invite", tags: ["Competitive", "Member invite", "18 holes"] },
  ];
}

function savePublicRsvp(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.publicRsvpForm).entries());
  const selectedEvent = state.events.find((item) => item.id === data.eventId);

  if (!selectedEvent) {
    showPublicRsvpMessage("notice", "No event selected.", "Publish an event before accepting RSVPs.");
    return;
  }

  const reserved = eventPlayers(selectedEvent.id).filter((player) => player.status !== "Waitlist").length;
  const capacity = Number(selectedEvent.capacity) || 0;
  const status = capacity > 0 && reserved >= capacity ? "Waitlist" : "RSVP";
  const existing = state.players.find((player) => player.email.toLowerCase() === data.email.toLowerCase());
  const player = {
    ...data,
    id: existing?.id || newId(),
    eventId: selectedEvent.id,
    waiver: existing?.waiver || "Needs Signature",
    status,
    checkedIn: false,
    sport: selectedEvent.sport || state.mode,
    publicSignupAt: new Date().toISOString(),
  };

  if (existing) Object.assign(existing, player);
  else state.players.unshift(player);

  saveState();
  render();
  els.publicRsvpForm.reset();
  showPublicRsvpMessage(
    status === "Waitlist" ? "notice" : "success",
    status === "Waitlist" ? "You're on the waitlist." : "You're on the list.",
    status === "Waitlist" ? "The event is full, so the host will follow up if a spot opens." : "Your RSVP is saved. Use Check-In when you arrive."
  );
}

function showPublicRsvpMessage(type, title, body) {
  els.publicRsvpResult.innerHTML = `
    <div class="public-message ${type}">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(body)}</span>
    </div>
  `;
}

function renderMetrics() {
  const modePlayers = state.players.filter((player) => (player.sport || "pickleball") === state.mode);
  const modeEvents = state.events.filter((event) => (event.sport || "pickleball") === state.mode);
  const checked = modePlayers.filter((player) => player.checkedIn).length;
  text("#metricPlayers", modePlayers.length);
  text("#metricCheckedIn", checked);
  text("#metricEvents", modeEvents.length);
  text("#metricPosts", state.posts.filter((post) => (post.sport || "pickleball") === state.mode).length);
}

function renderEvents() {
  const command = document.querySelector("#commandEvents");
  const list = document.querySelector("#eventList");
  const events = state.events.filter((event) => (event.sport || "pickleball") === state.mode);
  const html = events.length
    ? events.map(eventCard).join("")
    : `<div class="empty">Create the first ${escapeHtml(state.mode)} club event.</div>`;
  command.innerHTML = html;
  list.innerHTML = html;
}

function renderEventOptions() {
  const events = state.events.filter((event) => (event.sport || "pickleball") === state.mode);
  const options = events.length
    ? events.map((event) => `<option value="${event.id}">${escapeHtml(event.name)} - ${escapeHtml(event.date)}</option>`).join("")
    : `<option value="">No event selected</option>`;
  els.playerEvent.innerHTML = options;
}

function renderPublicEvents() {
  const view = state.publicView || DEFAULT_PUBLIC_VIEW;
  const featured = new Set(view.featuredEvents || []);
  const published = state.events
    .filter((event) => (event.sport || "pickleball") === state.mode)
    .filter((event) => event.published !== false)
    .filter((event) => !featured.size || featured.has(event.id));
  const hero = document.querySelector(".public-event-hero");
  if (hero) {
    hero.querySelector(".eyebrow").textContent = view.secondaryLabel || "Public events";
    hero.querySelector("h2").textContent = view.headline;
    hero.querySelector("p:not(.eyebrow)").textContent = view.intro;
  }
  const publicRsvpPanel = document.querySelector(".public-rsvp-panel");
  if (publicRsvpPanel) {
    publicRsvpPanel.querySelector("h2").textContent = view.primaryLabel || "Reserve a spot";
    publicRsvpPanel.querySelector("button[type=submit]").textContent = view.primaryLabel || "Submit RSVP";
  }
  document.querySelector("#publicEventList").innerHTML = published.length
    ? published.map((event) => {
      const count = eventPlayers(event.id).filter((player) => player.status !== "Waitlist").length;
      const capacity = Number(event.capacity) || 0;
      const full = capacity > 0 && count >= capacity;
      return `
        <article class="card public-event-card">
          <span class="status-pill ${full ? "waitlist" : ""}">${full ? "Waitlist" : "Open"}</span>
          <strong>${escapeHtml(event.name)}</strong>
          <p class="meta">${escapeHtml(event.format)} | ${escapeHtml(event.venue)} | ${escapeHtml(event.date)}</p>
          <p>${escapeHtml(event.note || "")}</p>
          <p class="meta">${count}/${capacity || "No"} spots reserved | /events/${escapeHtml(event.slug || event.id)}</p>
          <div class="card-actions">
            <button type="button" data-society-event-rsvp="${escapeHtml(event.id)}">${full ? "Join Waitlist" : "RSVP"}</button>
            <button type="button" data-society-event-message="${escapeHtml(event.id)}">Message Host</button>
          </div>
        </article>
      `;
    }).join("")
    : `<div class="empty">${escapeHtml(featured.size ? "No featured published events match your Public View settings." : "Publish an event from the Events tab to preview the public page.")}</div>`;

  els.publicRsvpEvent.innerHTML = published.length
    ? published.map((event) => `<option value="${event.id}">${escapeHtml(event.name)} - ${escapeHtml(event.date)}</option>`).join("")
    : `<option value="">No published events yet</option>`;
}

function handlePublicEventListClick(event) {
  const rsvpButton = event.target.closest("[data-society-event-rsvp]");
  if (rsvpButton) {
    openEventRsvp(rsvpButton.dataset.societyEventRsvp);
    return;
  }

  const messageButton = event.target.closest("[data-society-event-message]");
  if (messageButton) messageEventHost(messageButton.dataset.societyEventMessage);
}

function openEventRsvp(id) {
  const item = state.events.find((event) => event.id === id);
  if (!item) return;
  setView("publicEvents");
  if (els.publicRsvpEvent) els.publicRsvpEvent.value = item.id;
  document.querySelector(".public-rsvp-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function messageEventHost(id) {
  const item = state.events.find((event) => event.id === id);
  if (!item) return;
  const host = item.ownerName || item.hostName || "Club Society Host";
  openPrefilledMessage(host, `I wanted to ask about ${item.name} on ${item.date || "the event date"}.`);
}

function messageStaticEventHost(label) {
  openPrefilledMessage("Club Society Host", `I wanted to ask about ${label || "this event"}.`);
}

function eventCard(event) {
  return `
    <article class="card">
      <span class="status-pill ${event.published === false ? "draft" : ""}">${event.published === false ? "Draft" : "Published"}</span>
      <strong>${escapeHtml(event.name)}</strong>
      <p class="meta">${escapeHtml(event.format)} | ${escapeHtml(event.venue)} | ${escapeHtml(event.date)} | ${escapeHtml(event.sport)}</p>
      <p class="meta">Public link: /events/${escapeHtml(event.slug || event.id)}</p>
      <p class="meta">${escapeHtml(event.note || "")}</p>
      <div class="card-actions">
        <button class="primary" type="button" data-begin-event="${escapeHtml(event.id)}">Begin Event</button>
        <button type="button" data-view-event-roster="${escapeHtml(event.id)}">View RSVPs</button>
        <button type="button" data-edit-event="${escapeHtml(event.id)}">Edit</button>
        <button type="button" data-archive-event="${escapeHtml(event.id)}">Archive</button>
        <button class="danger" type="button" data-delete-event="${escapeHtml(event.id)}">Delete</button>
      </div>
    </article>
  `;
}

function handleEventListClick(event) {
  const beginButton = event.target.closest("[data-begin-event]");
  const rosterButton = event.target.closest("[data-view-event-roster]");
  const editButton = event.target.closest("[data-edit-event]");
  const archiveButton = event.target.closest("[data-archive-event]");
  const deleteButton = event.target.closest("[data-delete-event]");

  if (beginButton) beginEvent(beginButton.dataset.beginEvent);
  if (rosterButton) viewEventRoster(rosterButton.dataset.viewEventRoster);
  if (editButton) editEvent(editButton.dataset.editEvent);
  if (archiveButton) archiveEvent(archiveButton.dataset.archiveEvent);
  if (deleteButton) deleteEvent(deleteButton.dataset.deleteEvent);
}

function beginEvent(id = "") {
  const modeEvents = state.events.filter((item) => (item.sport || "pickleball") === state.mode);
  const selected = state.events.find((item) => item.id === (id || state.selectedEventRosterId));
  const today = new Date().toISOString().slice(0, 10);
  const nextEvent = modeEvents
    .slice()
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
    .find((item) => !item.date || item.date >= today) || modeEvents[0];
  const event = selected || nextEvent;

  if (!event) {
    showAdminMessage("#eventList", "notice", "Create an event before beginning one.");
    return;
  }

  state.mode = event.sport || state.mode;
  state.selectedEventRosterId = event.id;
  saveState();
  render();
  if (els.playerEvent) els.playerEvent.value = event.id;
  setView("checkin");
  showAdminMessage("#playerList", "success", `${event.name} is ready for check-in.`);
}

function viewEventRoster(id) {
  state.selectedEventRosterId = id;
  saveState();
  renderEventRoster();
  document.querySelector("#eventRosterPanel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderEventRoster() {
  const panel = document.querySelector("#eventRosterPanel");
  if (!panel) return;
  const event = state.events.find((item) => item.id === state.selectedEventRosterId);
  if (!event) {
    panel.innerHTML = "";
    return;
  }

  const roster = eventPlayers(event.id).sort((a, b) => (a.lastName || "").localeCompare(b.lastName || ""));
  panel.innerHTML = `
    <article class="card event-roster-card">
      <span class="status-pill">${roster.length} RSVP${roster.length === 1 ? "" : "s"}</span>
      <strong>${escapeHtml(event.name)}</strong>
      <p class="meta">${escapeHtml(event.date)} | ${escapeHtml(event.venue)} | ${escapeHtml(event.format)}</p>
      ${roster.length ? `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Signup date</th>
                <th>Status</th>
                <th>Shirt</th>
              </tr>
            </thead>
            <tbody>
              ${roster.map((player) => `
                <tr>
                  <td>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</td>
                  <td>${escapeHtml(player.email || "")}</td>
                  <td>${escapeHtml(player.phone || "")}</td>
                  <td>${player.signupDate ? escapeHtml(formatDateTime(player.signupDate)) : "-"}</td>
                  <td>${escapeHtml(player.status || "RSVP")}</td>
                  <td>${escapeHtml([player.shirtGender, player.shirtSize, player.optionalShirtChoice].filter(Boolean).join(" / ") || "-")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      ` : `<p class="meta">No RSVPs have been imported for this event yet.</p>`}
    </article>
  `;
}

function editEvent(id) {
  const item = state.events.find((event) => event.id === id);
  if (!item) return;
  Object.entries(item).forEach(([name, value]) => {
    const field = els.eventForm.elements[name === "id" ? "eventId" : name];
    if (field) field.value = value;
  });
  els.eventForm.elements.published.value = String(item.published !== false);
  els.eventForm.querySelector("button[type=submit]").textContent = "Update Event";
  els.eventForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteEvent(id) {
  const item = state.events.find((event) => event.id === id);
  if (!item) return;
  if (!window.confirm(`Delete ${item.name}? This removes it from public events and event dropdowns.`)) return;
  state.events = state.events.filter((event) => event.id !== id);
  state.players = state.players.map((player) => player.eventId === id ? { ...player, eventId: "" } : player);
  if (state.selectedEventRosterId === id) state.selectedEventRosterId = "";
  saveState();
  render();
  showAdminMessage("#eventList", "success", "Event deleted.");
}

function archiveEvent(id) {
  const item = state.events.find((event) => event.id === id);
  if (!item) return;
  if (!window.confirm(`Archive ${item.name}? It will move from active events into Event History.`)) return;
  archiveEventRecord(item, "Manual archive");
  state.events = state.events.filter((event) => event.id !== id);
  if (state.selectedEventRosterId === id) state.selectedEventRosterId = "";
  saveState();
  render();
  showAdminMessage("#eventList", "success", "Event archived.");
}

function autoArchiveEndedEvents() {
  const today = localDateKey();
  const endedEvents = state.events.filter((event) => event.date && event.date < today);
  if (!endedEvents.length) return;
  endedEvents.forEach((event) => archiveEventRecord(event, "Auto archived after event date"));
  const endedIds = new Set(endedEvents.map((event) => event.id));
  state.events = state.events.filter((event) => !endedIds.has(event.id));
  if (endedIds.has(state.selectedEventRosterId)) state.selectedEventRosterId = "";
  saveState();
}

function archiveEventRecord(event, reason) {
  const attendees = state.players.filter((player) => player.eventId === event.id);
  state.archivedEvents.unshift({
    ...event,
    archivedAt: new Date().toISOString(),
    archiveReason: reason,
    attendeeCount: attendees.length,
    checkedInCount: attendees.filter((player) => player.checkedIn).length,
    players: attendees,
  });
}

function renderPlayers() {
  const query = els.rosterSearch.value.trim().toLowerCase();
  const players = state.players
    .filter((player) => (player.sport || "pickleball") === state.mode)
    .filter((player) => player.checkedIn)
    .filter((player) => `${player.firstName} ${player.lastName} ${player.email}`.toLowerCase().includes(query))
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  document.querySelector("#playerList").innerHTML = players.length
    ? players.map((player) => `
      <article class="card player-card">
        <div class="card-copy">
          <strong>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</strong>
          <p class="meta">${escapeHtml(player.skill)} | ${escapeHtml(player.gender || "Gender not specified")} | ${escapeHtml(player.email)} | ${escapeHtml(player.status || "Checked in")}</p>
          <p class="meta">Check-in priority: ${player.checkedInAt ? escapeHtml(formatDateTime(player.checkedInAt)) : "Time not recorded"}</p>
          <p class="meta">Waiver: ${escapeHtml(player.waiver)} | Paid: ${escapeHtml(player.paid || "Not tracked")}${player.eventId ? ` | ${escapeHtml(eventName(player.eventId))}` : ""}</p>
          <p class="meta">Waiver proof: ${player.waiverSignedAt ? `${escapeHtml(formatDateTime(player.waiverSignedAt))} via ${escapeHtml(player.waiverSource || "Check-in")}` : "Not signed yet"}</p>
        </div>
        <div class="card-actions">
          <button type="button" data-edit-player="${escapeHtml(player.id)}">Edit</button>
          <button type="button" data-toggle-player-active="${escapeHtml(player.id)}">${player.checkedIn ? "Mark Out" : "Check In"}</button>
          <button class="danger delete-player-btn" type="button" data-delete-player="${escapeHtml(player.id)}" aria-label="Delete ${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}">Delete</button>
        </div>
      </article>
    `).join("")
    : `<div class="empty">No players are currently checked in.</div>`;
}

function handlePlayerListClick(event) {
  const editButton = event.target.closest("[data-edit-player]");
  if (editButton) {
    editPlayer(editButton.dataset.editPlayer);
    return;
  }

  const activeButton = event.target.closest("[data-toggle-player-active]");
  if (activeButton) {
    togglePlayerActive(activeButton.dataset.togglePlayerActive);
    return;
  }

  const button = event.target.closest("[data-delete-player]");
  if (!button) return;

  const player = state.players.find((item) => item.id === button.dataset.deletePlayer);
  if (!player) return;

  const name = `${player.firstName} ${player.lastName}`.trim() || "this player";
  if (!window.confirm(`Delete ${name} from check-in?`)) return;

  deletePlayer(player.id);
  showAdminMessage("#playerList", "success", "Player deleted.");
}

function editPlayer(id) {
  const player = state.players.find((item) => item.id === id);
  if (!player) return;
  Object.entries(player).forEach(([name, value]) => {
    const field = els.playerForm.elements[name === "id" ? "playerId" : name];
    if (field) field.value = value || "";
  });
  els.playerForm.elements.playerId.value = player.id;
  els.playerForm.querySelector("button[type=submit]").textContent = "Update Player";
  els.playerForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function togglePlayerActive(id) {
  const player = state.players.find((item) => item.id === id);
  if (!player) return;
  if (player.checkedIn) {
    if (!window.confirm(`Mark ${player.firstName} ${player.lastName} out and remove them from current rounds?`)) return;
    player.checkedIn = false;
    player.status = "Left event";
    removePlayerFromActivePlay(id);
  } else {
    player.checkedIn = true;
    player.status = "Checked in";
    player.checkedInAt = new Date().toISOString();
  }
  saveState();
  render();
  showAdminMessage("#playerList", "success", player.checkedIn ? "Player checked back in." : "Player marked out.");
}

function deletePlayer(id) {
  state.players = state.players.filter((player) => player.id !== id);
  removePlayerFromActivePlay(id);
  state.roundSettings.selectedPlayerIds = (state.roundSettings.selectedPlayerIds || []).filter((playerId) => playerId !== id);
  saveState();
  render();
}

function removePlayerFromActivePlay(id) {
  state.rounds = state.rounds
    .map((round) => ({
      ...round,
      sitting: (round.sitting || []).filter((playerId) => playerId !== id),
      matches: (round.matches || [])
        .map((match) => ({
          ...match,
          teamA: (match.teamA || []).filter((playerId) => playerId !== id),
          teamB: (match.teamB || []).filter((playerId) => playerId !== id),
        }))
        .filter((match) => match.teamA.length || match.teamB.length),
    }))
    .filter((round) => round.matches.length || round.sitting.length);
  state.bracket = state.bracket
    .map((match) => ({
      ...match,
      players: (match.players || []).filter((playerId) => playerId !== id),
      winner: match.winner === id ? "" : match.winner,
    }))
    .filter((match) => match.players.length);
  state.sync.pending = (state.sync.pending || 0) + 1;
}

function renderRsvpOptions() {
  const seen = new Set();
  const candidates = [...state.players, ...state.profiles].filter((player) => {
    const email = String(player.email || "").trim().toLowerCase();
    const phone = digits(player.phone);
    const name = `${player.firstName || ""} ${player.lastName || ""}`.trim().toLowerCase();
    const key = email || phone || name;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  document.querySelector("#rsvpOptions").innerHTML = candidates.map((player) => `
    <option value="${escapeHtml(`${player.firstName || ""} ${player.lastName || ""} | ${player.email || ""} | ${player.phone || ""}`)}"></option>
  `).join("");
}

function renderWaivers() {
  const queue = state.players.filter((player) => player.waiver === "Needs Signature");
  document.querySelector("#waiverList").innerHTML = queue.length
    ? queue.map((player) => `
      <article class="card alert-card">
        <strong>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</strong>
        <p class="meta">${escapeHtml(player.email)} | ${escapeHtml(player.phone || "No phone")}</p>
        <p class="meta">No waiver timestamp saved yet.</p>
      </article>
    `).join("")
    : `<div class="empty">All current players have signed waivers.</div>`;
}

function fillRsvp() {
  const query = els.rsvpLookup.value.split("|")[0].trim();
  const match = findCheckinLookupRecord(query);
  const player = match?.player || match?.profile;

  if (!player) {
    showAdminMessage("#playerList", "notice", "No active member or RSVP matched that search.");
    return;
  }

  ["firstName", "lastName", "email", "phone", "gender", "skill", "waiver", "status", "paid", "notes"].forEach((name) => {
    const field = els.playerForm.elements[name];
    if (field && player[name]) field.value = player[name];
  });

  if (player.eventId) els.playerForm.elements.eventId.value = player.eventId;
  els.playerForm.elements.status.value = "Checked in";
  els.playerForm.elements.paid.value = player.paid || "Not tracked";
  els.playerForm.elements.playerId.value = match?.player?.id || "";
  els.playerForm.dataset.waiverSignedAt = player.waiverSignedAt || "";
  els.playerForm.dataset.waiverSource = player.waiverSource || "";
  els.playerForm.querySelector("button[type=submit]").textContent = match?.player ? "Update Check-In" : "Check In Member";
}

function toggleCoupleCheckin() {
  const enabled = Boolean(els.coupleCheckin.checked);
  els.partnerCheckinFields.hidden = !enabled;
  els.partnerCheckinFields.querySelectorAll("input, select").forEach((field) => {
    field.disabled = !enabled;
  });
  if (!enabled) {
    els.partnerLookup.value = "";
    els.playerForm.dataset.partnerPlayerId = "";
    els.playerForm.dataset.partnerWaiverSignedAt = "";
    els.playerForm.dataset.partnerWaiverSource = "";
  }
}

function fillPartner() {
  const query = els.partnerLookup.value.split("|")[0].trim();
  const match = findCheckinLookupRecord(query);
  const partner = match?.player || match?.profile;
  if (!partner) {
    showAdminMessage("#playerList", "notice", "No active member or RSVP matched that partner search.");
    return;
  }
  const values = {
    partnerFirstName: partner.firstName,
    partnerLastName: partner.lastName,
    partnerEmail: partner.email,
    partnerPhone: partner.phone,
    partnerGender: partner.gender || "",
    partnerSkill: partner.skill,
    partnerWaiver: partner.waiver || "Needs Signature",
  };
  Object.entries(values).forEach(([name, value]) => {
    const field = els.playerForm.elements[name];
    if (field && value) field.value = value;
  });
  els.playerForm.dataset.partnerPlayerId = match?.player?.id || "";
  els.playerForm.dataset.partnerWaiverSignedAt = partner.waiverSignedAt || "";
  els.playerForm.dataset.partnerWaiverSource = partner.waiverSource || "";
}

function findPublicPlayer() {
  const match = findCheckinLookupRecord(els.publicLookup.value);
  const player = match?.player || match?.profile || null;
  els.publicCheckinForm.dataset.playerId = match?.player?.id || "";
  els.publicCheckinForm.dataset.profileId = match?.profile?.id || "";

  if (!player) {
    els.publicResult.innerHTML = `
      <div class="public-message notice">
        <strong>No RSVP found yet.</strong>
        <span>You can still check in as a walk-up. Enter your details below.</span>
      </div>
    `;
    clearPublicForm(false);
    setPublicWaiverStatus("Needs Signature");
    return;
  }

  ["firstName", "lastName", "email", "phone", "skill", "waiver"].forEach((name) => {
    const field = els.publicCheckinForm.elements[name];
    if (field && player[name]) field.value = player[name];
  });

  els.publicResult.innerHTML = `
    <div class="public-message success">
      <strong>${match.player ? "We found your RSVP" : "We found your player profile"}, ${escapeHtml(player.firstName)}.</strong>
      <span>${match.player?.checkedIn ? "You are already checked in. You can update and submit again if needed." : "Confirm your details below to finish check-in."}</span>
    </div>
  `;
  setPublicWaiverStatus(player.waiver || "Needs Signature");
  if (player.waiver !== "Signed") openWaiverModal("public");
}

function savePublicCheckin(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.publicCheckinForm).entries());
  if (data.waiver !== "Signed") {
    els.publicCheckinForm.dataset.pendingSubmit = "true";
    openWaiverModal("public");
    return;
  }

  const existing = state.players.find((player) => player.id === els.publicCheckinForm.dataset.playerId)
    || state.players.find((player) => player.email.toLowerCase() === data.email.toLowerCase());
  const matchedProfile = state.profiles.find((profile) => profile.id === els.publicCheckinForm.dataset.profileId)
    || findProfileByPrivateLookup(data.email || data.phone || `${data.firstName} ${data.lastName}`);
  const player = {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    skill: data.skill,
    waiver: data.waiver,
    status: existing?.status === "Walk-up" ? "Walk-up" : matchedProfile && !existing ? "Profile check-in" : existing ? "Checked in" : "Walk-up",
    paid: existing?.paid || "Not tracked",
    eventId: existing?.eventId || state.events[0]?.id || "",
    notes: existing?.notes || "",
    checkedIn: true,
    checkedInAt: new Date().toISOString(),
    sport: existing?.sport || state.mode,
    ...buildWaiverAudit(data.waiver, {
      ...existing,
      waiverSignedAt: existing?.waiverSignedAt || els.publicCheckinForm.dataset.waiverSignedAt,
      waiverSource: existing?.waiverSource || els.publicCheckinForm.dataset.waiverSource,
    }, "Public check-in waiver modal"),
  };

  if (existing) Object.assign(existing, player);
  else state.players.unshift({ ...player, id: newId() });
  if (matchedProfile) {
    Object.assign(matchedProfile, {
      waiver: data.waiver,
      ...buildWaiverAudit(data.waiver, {
        ...matchedProfile,
        waiverSignedAt: matchedProfile.waiverSignedAt || els.publicCheckinForm.dataset.waiverSignedAt,
        waiverSource: matchedProfile.waiverSource || els.publicCheckinForm.dataset.waiverSource,
      }, "Public check-in waiver modal"),
      updatedAt: new Date().toISOString(),
    });
  }
  upsertPlayerDirectoryProfile({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    skill: data.skill,
    waiver: data.waiver,
    waiverSignedAt: els.publicCheckinForm.dataset.waiverSignedAt,
    waiverSource: els.publicCheckinForm.dataset.waiverSource,
    waiverAgreementText: "Player selected I Agree to the Club Society / Paddle + Pint liability waiver before check-in.",
    interests: ["Social round robins"],
    source: "Public check-in",
  });

  saveState();
  render();
  els.publicResult.innerHTML = `
    <div class="public-message success">
      <strong>You're checked in.</strong>
      <span>You're all set. See the host if you need to change anything.</span>
    </div>
  `;
  clearPublicForm(true);
}

function findCheckinLookupRecord(value) {
  const player = findPlayerByPrivateLookup(value);
  if (player) return { player, profile: findProfileByPrivateLookup(player.email || player.phone || `${player.firstName} ${player.lastName}`) };

  const profile = findProfileByPrivateLookup(value);
  if (profile) return { player: null, profile };

  return null;
}

function openWaiverModal(context = "public") {
  els.waiverModal.dataset.context = context;
  const title = document.querySelector("#waiverTitle");
  if (title) title.textContent = context === "admin-partner" ? "Partner Liability Waiver & Release" : "Liability Waiver & Release";
  els.waiverModal.classList.add("open");
  els.waiverModal.setAttribute("aria-hidden", "false");
}

function closeWaiverModal() {
  els.waiverModal.classList.remove("open");
  els.waiverModal.setAttribute("aria-hidden", "true");
}

function agreeToWaiver() {
  if (els.waiverModal.dataset.context === "admin-primary") {
    els.playerForm.elements.waiver.value = "Signed";
    els.playerForm.dataset.waiverSignedAt = new Date().toISOString();
    els.playerForm.dataset.waiverSource = "Admin check-in waiver modal";
    closeWaiverModal();
    if (els.playerForm.dataset.pendingSubmit === "true") {
      els.playerForm.dataset.pendingSubmit = "";
      els.playerForm.requestSubmit();
    }
    return;
  }

  if (els.waiverModal.dataset.context === "admin-partner") {
    els.playerForm.elements.partnerWaiver.value = "Signed";
    els.playerForm.dataset.partnerWaiverSignedAt = new Date().toISOString();
    els.playerForm.dataset.partnerWaiverSource = "Admin partner waiver modal";
    closeWaiverModal();
    if (els.playerForm.dataset.pendingSubmit === "true") {
      els.playerForm.dataset.pendingSubmit = "";
      els.playerForm.requestSubmit();
    }
    return;
  }

  setPublicWaiverStatus("Signed");
  els.publicCheckinForm.dataset.waiverSignedAt = new Date().toISOString();
  els.publicCheckinForm.dataset.waiverSource = "Public check-in waiver modal";
  closeWaiverModal();

  if (els.publicCheckinForm.dataset.pendingSubmit === "true") {
    els.publicCheckinForm.dataset.pendingSubmit = "";
    els.publicCheckinForm.requestSubmit();
  }
}

function disagreeToWaiver() {
  if (els.waiverModal.dataset.context === "admin-primary" || els.waiverModal.dataset.context === "admin-partner") {
    const partner = els.waiverModal.dataset.context === "admin-partner";
    els.playerForm.elements[partner ? "partnerWaiver" : "waiver"].value = "Needs Signature";
    els.playerForm.dataset[partner ? "partnerWaiverSignedAt" : "waiverSignedAt"] = "";
    els.playerForm.dataset[partner ? "partnerWaiverSource" : "waiverSource"] = "";
    els.playerForm.dataset.pendingSubmit = "";
    closeWaiverModal();
    showAdminMessage("#playerList", "notice", `Check-in paused. The ${partner ? "partner" : "player"} must agree to the waiver before check-in.`);
    return;
  }

  setPublicWaiverStatus("Needs Signature");
  els.publicCheckinForm.dataset.waiverSignedAt = "";
  els.publicCheckinForm.dataset.waiverSource = "";
  els.publicCheckinForm.dataset.pendingSubmit = "";
  closeWaiverModal();
  els.publicResult.innerHTML = `
    <div class="public-message notice">
      <strong>Check-in paused.</strong>
      <span>You must agree to the waiver before completing check-in.</span>
    </div>
  `;
}

function setPublicWaiverStatus(status) {
  const signed = status === "Signed";
  els.publicCheckinForm.elements.waiver.value = signed ? "Signed" : "Needs Signature";
  els.publicWaiverStatus.textContent = signed ? "Signed" : "Needs Signature";
  els.publicWaiverStatus.classList.toggle("signed", signed);
}

function findPlayerByPrivateLookup(value) {
  const query = String(value || "").trim().toLowerCase();
  if (query.length < 3) return null;

  return state.players.find((player) => {
    const exactEmail = player.email?.toLowerCase() === query;
    const exactPhone = digits(player.phone) && digits(player.phone) === digits(query);
    const name = `${player.firstName} ${player.lastName}`.toLowerCase();
    const nameMatch = name.includes(query);
    return exactEmail || exactPhone || nameMatch;
  }) || null;
}

function findProfileByPrivateLookup(value) {
  const query = String(value || "").trim().toLowerCase();
  if (query.length < 3) return null;

  return state.profiles.find((profile) => {
    const exactEmail = profile.email?.toLowerCase() === query;
    const exactPhone = digits(profile.phone) && digits(profile.phone) === digits(query);
    const name = `${profile.firstName} ${profile.lastName}`.toLowerCase();
    const nameMatch = name.includes(query);
    return exactEmail || exactPhone || nameMatch;
  }) || null;
}

function clearPublicForm(keepMessage) {
  els.publicCheckinForm.reset();
  els.publicCheckinForm.dataset.playerId = "";
  els.publicCheckinForm.dataset.profileId = "";
  els.publicCheckinForm.dataset.waiverSignedAt = "";
  els.publicCheckinForm.dataset.waiverSource = "";
  els.publicCheckinForm.dataset.pendingSubmit = "";
  setPublicWaiverStatus("Needs Signature");
  if (!keepMessage) {
    ["firstName", "lastName", "email", "phone"].forEach((name) => {
      els.publicCheckinForm.elements[name].value = "";
    });
  }
}

function renderCommunity() {
  const posts = state.posts.filter((post) => (post.sport || "pickleball") === state.mode);
  document.querySelector("#communityList").innerHTML = posts.length
    ? posts.map((post) => `
      <article class="post">
        <strong>${escapeHtml(post.type)}</strong>
        <p class="meta">${escapeHtml(post.name)} | ${escapeHtml(post.location)} | ${escapeHtml(post.skill)}</p>
        <p>${escapeHtml(post.body)}</p>
      </article>
    `).join("")
    : `<div class="empty">No ${escapeHtml(state.mode)} match posts yet.</div>`;
}

function checkedPlayers() {
  return state.players.filter((player) => player.checkedIn && (player.sport || "pickleball") === state.mode);
}

function roundEligiblePlayers() {
  const players = checkedPlayers().sort(checkinPrioritySort);
  if (!["manual", "teams", "partners"].includes(els.roundPlayerSource.value)) return players;
  if (["teams", "partners"].includes(els.roundPlayerSource.value)) return players;

  const selected = new Set(state.roundSettings.selectedPlayerIds || []);
  return players.filter((player) => selected.has(player.id));
}

function renderRoundPlayerPicker() {
  const players = checkedPlayers().sort(checkinPrioritySort);
  const mode = els.roundPlayerSource.value;
  const manual = mode === "manual";
  const teamsMode = mode === "teams";
  const partnersMode = mode === "partners";
  els.roundPlayerPicker.classList.toggle("is-hidden", !manual && !teamsMode && !partnersMode);

  if (!manual && !teamsMode && !partnersMode) {
    els.roundPlayerPicker.innerHTML = "";
    return;
  }

  if (teamsMode) {
    renderRoundTeamBuilder(players);
    return;
  }

  if (partnersMode) {
    renderPartnerAwareTeamBuilder(players);
    return;
  }

  const selected = new Set(state.roundSettings.selectedPlayerIds || players.map((player) => player.id));
  state.roundSettings.selectedPlayerIds = Array.from(selected);
  els.roundPlayerPicker.innerHTML = players.length
    ? `
      <div class="round-picker-head">
        <strong>Manual player selection</strong>
        <span>${selected.size} of ${players.length} checked-in players selected</span>
      </div>
      <div class="check-list round-check-list">
        ${players.map((player) => `
          <label>
            <input type="checkbox" value="${player.id}" ${selected.has(player.id) ? "checked" : ""}>
            ${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}
            <span>${escapeHtml(player.gender || "Gender not specified")} | ${escapeHtml(player.skill || "Open")} | ${player.checkedInAt ? escapeHtml(formatDateTime(player.checkedInAt)) : "No check-in time"}</span>
          </label>
        `).join("")}
      </div>
    `
    : `<div class="empty">No checked-in players are ready for round robin yet.</div>`;
}

function saveRoundManualSelection() {
  if (["teams", "partners"].includes(els.roundPlayerSource.value)) {
    saveRoundTeams();
    return;
  }
  state.roundSettings.selectedPlayerIds = Array.from(els.roundPlayerPicker.querySelectorAll("input[type='checkbox']:checked")).map((input) => input.value);
  saveState();
  renderRoundPlayerPicker();
}

function renderPartnerAwareTeamBuilder(players) {
  const byId = new Map(players.map((player) => [player.id, player]));
  const paired = new Set();
  const linkedTeams = [];
  players.forEach((player) => {
    const partner = byId.get(player.partnerPlayerId);
    if (!partner || paired.has(player.id) || paired.has(partner.id)) return;
    linkedTeams.push({ id: `partner-${player.id}-${partner.id}`, name: `${player.firstName} & ${partner.firstName}`, playerA: player.id, playerB: partner.id, locked: true });
    paired.add(player.id);
    paired.add(partner.id);
  });

  const singles = players.filter((player) => !paired.has(player.id));
  const priorManual = (state.roundSettings.partnerTeams || []).filter((team) => !team.locked);
  const manualCount = Math.ceil(singles.length / 2);
  const manualTeams = Array.from({ length: manualCount }, (_, index) => priorManual[index] || { id: newId(), name: `Singles Team ${index + 1}`, playerA: "", playerB: "", locked: false });
  state.roundSettings.partnerTeams = [...linkedTeams, ...manualTeams];

  els.roundPlayerPicker.innerHTML = players.length >= 4
    ? `
      <div class="round-picker-head">
        <strong>Partner-aware teams</strong>
        <span>${linkedTeams.length} came-with pair${linkedTeams.length === 1 ? "" : "s"}; assign ${singles.length} single player${singles.length === 1 ? "" : "s"} manually</span>
      </div>
      <div class="round-team-list">
        ${linkedTeams.map((team) => `
          <article class="round-team-card">
            <strong>${escapeHtml(team.name)}</strong>
            <span>${names([team.playerA, team.playerB])}</span>
            <small>Came together — paired automatically</small>
          </article>
        `).join("")}
        ${manualTeams.map((team, index) => `
          <article class="round-team-card">
            <input data-partner-team-index="${index}" data-team-field="name" value="${escapeHtml(team.name)}" aria-label="Team name">
            ${partnerSingleSelect(singles, team.playerA, index, "playerA")}
            ${partnerSingleSelect(singles, team.playerB, index, "playerB")}
          </article>
        `).join("")}
      </div>
    `
    : `<div class="empty">Check in at least 4 players before assigning partner-aware teams.</div>`;
}

function partnerSingleSelect(players, selectedId, teamIndex, field) {
  return `
    <select data-partner-team-index="${teamIndex}" data-team-field="${field}">
      <option value="">Assign single player</option>
      ${players.map((player) => `<option value="${player.id}" ${player.id === selectedId ? "selected" : ""}>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</option>`).join("")}
    </select>
  `;
}

function renderRoundTeamBuilder(players) {
  const existingTeams = (state.roundSettings.teams || []).filter((team) => team?.playerA || team?.playerB);
  const teamCount = Math.max(2, existingTeams.length || Math.floor(players.length / 2));
  const teams = Array.from({ length: teamCount }, (_, index) => existingTeams[index] || { id: newId(), name: `Team ${index + 1}`, playerA: "", playerB: "" });
  state.roundSettings.teams = teams;

  els.roundPlayerPicker.innerHTML = players.length >= 4
    ? `
      <div class="round-picker-head">
        <strong>Manual team assignment</strong>
        <span>${teams.length} teams | Choose two players per team</span>
      </div>
      <div class="round-team-list">
        ${teams.map((team, index) => `
          <article class="round-team-card">
            <input data-team-index="${index}" data-team-field="name" value="${escapeHtml(team.name || `Team ${index + 1}`)}" aria-label="Team name">
            ${roundTeamPlayerSelect(players, team.playerA, index, "playerA")}
            ${roundTeamPlayerSelect(players, team.playerB, index, "playerB")}
          </article>
        `).join("")}
      </div>
    `
    : `<div class="empty">Check in at least 4 players before assigning teams.</div>`;
}

function roundTeamPlayerSelect(players, selectedId, teamIndex, field) {
  return `
    <select data-team-index="${teamIndex}" data-team-field="${field}">
      <option value="">Select player</option>
      ${players.map((player) => `
        <option value="${player.id}" ${player.id === selectedId ? "selected" : ""}>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)} - ${escapeHtml(player.gender || "Gender not specified")} / ${escapeHtml(player.skill || "Open")}</option>
      `).join("")}
    </select>
  `;
}

function saveRoundTeams() {
  if (els.roundPlayerSource.value === "partners") {
    const linked = (state.roundSettings.partnerTeams || []).filter((team) => team.locked);
    const manualMap = new Map((state.roundSettings.partnerTeams || []).filter((team) => !team.locked).map((team, index) => [String(index), { ...team }]));
    els.roundPlayerPicker.querySelectorAll("[data-partner-team-index]").forEach((field) => {
      const team = manualMap.get(field.dataset.partnerTeamIndex) || { id: newId(), name: `Singles Team ${Number(field.dataset.partnerTeamIndex) + 1}`, playerA: "", playerB: "", locked: false };
      team[field.dataset.teamField] = field.value;
      manualMap.set(field.dataset.partnerTeamIndex, team);
    });
    state.roundSettings.partnerTeams = [...linked, ...manualMap.values()];
    saveState();
    return;
  }
  const teamMap = new Map((state.roundSettings.teams || []).map((team, index) => [String(index), { ...team }]));
  els.roundPlayerPicker.querySelectorAll("[data-team-index]").forEach((field) => {
    const team = teamMap.get(field.dataset.teamIndex) || { id: newId(), name: `Team ${Number(field.dataset.teamIndex) + 1}`, playerA: "", playerB: "" };
    team[field.dataset.teamField] = field.value;
    teamMap.set(field.dataset.teamIndex, team);
  });
  state.roundSettings.teams = Array.from(teamMap.values());
  saveState();
}

function buildRounds() {
  if (["teams", "partners"].includes(els.roundPlayerSource.value)) {
    buildTeamRounds();
    return;
  }

  const players = roundEligiblePlayers();
  const courts = Math.max(1, Number(els.courtCount.value) || 1);
  const courtCapacity = courts * 4;
  const requestedRounds = Math.max(1, Number(els.roundCount.value) || 1);
  const winnerRotation = els.roundRotationStyle.value === "winners";
  const roundCount = winnerRotation ? 1 : requestedRounds;

  if (players.length < 4) {
    document.querySelector("#roundList").innerHTML = `<div class="empty">Select at least 4 checked-in players.</div>`;
    return;
  }

  state.rounds = [];
  const rotationQueue = [...players];

  for (let round = 1; round <= roundCount; round += 1) {
    const slotsThisRound = Math.min(courtCapacity, players.length);
    const roundPlayers = rotationQueue.splice(0, slotsThisRound);
    rotationQueue.push(...roundPlayers);
    const activeCourts = Math.min(courts, Math.floor(roundPlayers.length / 4));
    const matches = buildBalancedRoundMatches(roundPlayers, activeCourts);

    const playingIds = new Set(roundPlayers.map((player) => player.id));
    state.rounds.push({
      round,
      rotationStyle: winnerRotation ? "winners" : "all",
      matches,
      sitting: players.filter((player) => !playingIds.has(player.id)).map((player) => player.id),
    });
  }

  saveState();
  renderRounds();
}

function buildTeamRounds() {
  saveRoundTeams();
  const requestedRounds = Math.max(1, Number(els.roundCount.value) || 1);
  const winnerRotation = els.roundRotationStyle.value === "winners";
  const teams = getManualRoundTeams();
  const configuredTeams = els.roundPlayerSource.value === "partners" ? state.roundSettings.partnerTeams || [] : state.roundSettings.teams || [];
  const incompleteTeams = configuredTeams.filter((team) => team.playerA || team.playerB).filter((team) => !team.playerA || !team.playerB);
  const allTeamPlayerIds = teams.flatMap((team) => team.players.map((player) => player.id));
  const duplicatePlayers = allTeamPlayerIds.filter((id, index) => allTeamPlayerIds.indexOf(id) !== index);
  const unassignedPartnerPlayers = els.roundPlayerSource.value === "partners"
    ? checkedPlayers().filter((player) => !allTeamPlayerIds.includes(player.id))
    : [];

  if (incompleteTeams.length || unassignedPartnerPlayers.length) {
    document.querySelector("#roundList").innerHTML = `<div class="empty">Assign every single player a teammate before generating rounds.</div>`;
    return;
  }
  if (teams.length < 2) {
    document.querySelector("#roundList").innerHTML = `<div class="empty">Create at least 2 complete teams before generating team rounds.</div>`;
    return;
  }
  if (duplicatePlayers.length) {
    document.querySelector("#roundList").innerHTML = `<div class="empty">Each player can only be assigned to one team.</div>`;
    return;
  }

  state.rounds = [];
  const firstPairing = { teamA: teams[0], teamB: teams[1] };
  state.roundSettings.teamMatchQueue = teams.slice(2);
  state.roundSettings.sequentialTeams = teams;
  state.roundSettings.sequentialMatchesRemaining = Math.max(0, requestedRounds - 1);
  state.rounds.push(createSequentialTeamRound(firstPairing, teams, 1, "teams-sequential", winnerRotation ? "winners" : "all"));

  saveState();
  renderRounds();
}

function createSequentialTeamRound(pairing, allTeams, roundNumber, rotationStyle = "teams-sequential", teamRotation = "all") {
  const playingIds = new Set([pairing.teamA.id, pairing.teamB.id]);
  return {
    round: roundNumber,
    rotationStyle,
    teamRotation,
    matches: [{
      court: 1,
      teamA: pairing.teamA.players.map((player) => player.id),
      teamB: pairing.teamB.players.map((player) => player.id),
      teamALabel: pairing.teamA.name,
      teamBLabel: pairing.teamB.name,
      teamAId: pairing.teamA.id,
      teamBId: pairing.teamB.id,
      winner: "",
    }],
    sitting: allTeams.filter((team) => !playingIds.has(team.id)).flatMap((team) => team.players.map((player) => player.id)),
  };
}

function getManualRoundTeams() {
  const configuredTeams = els.roundPlayerSource.value === "partners"
    ? state.roundSettings.partnerTeams || []
    : state.roundSettings.teams || [];
  return configuredTeams
    .map((team, index) => {
      const players = [team.playerA, team.playerB]
        .map((id) => state.players.find((player) => player.id === id && player.checkedIn))
        .filter(Boolean);
      return {
        id: team.id || `team-${index + 1}`,
        name: team.name || `Team ${index + 1}`,
        players,
      };
    })
    .filter((team) => team.players.length === 2)
    .sort((a, b) => teamCheckinPriority(a) - teamCheckinPriority(b));
}

function teamCheckinPriority(team) {
  return Math.min(...team.players.map(checkinTime));
}

function renderRounds() {
  const target = document.querySelector("#roundList");
  renderRoundPlayerPicker();
  updateRoundRotationControls();
  target.innerHTML = state.rounds.length
    ? `${renderRoundTeamChart()}${state.rounds.map((round) => `
      <article class="card round-card">
        <div class="round-card-head">
          <div>
            <strong>${round.rotationStyle === "teams-sequential" ? "Match" : "Round"} ${round.round}</strong>
            <p class="meta">${round.rotationStyle === "winners" ? "Winning teams stay together; sitting players have priority before recent losers" : round.rotationStyle === "teams-sequential" ? "One matchup at a time; waiting teams are ordered by earliest check-in" : round.rotationStyle === "teams" ? "Configured teams remain together in check-in priority order" : "Players rotate by check-in time; random teams balance gender and level"}</p>
          </div>
          <button type="button" data-clear-round="${round.round}">Clear Round</button>
        </div>
        ${round.matches.map((match, matchIndex) => `
          <div class="match">
            <p class="meta">Court ${match.court}</p>
            <strong>${names(match.teamA)} vs ${names(match.teamB)}</strong>
            ${["winners", "teams-sequential"].includes(round.rotationStyle) ? `
              <label>Match winner
                <select data-round-winner="${round.round}" data-match-index="${matchIndex}">
                  <option value="">Select winning team</option>
                  <option value="teamA" ${match.winner === "teamA" ? "selected" : ""}>${names(match.teamA)}</option>
                  <option value="teamB" ${match.winner === "teamB" ? "selected" : ""}>${names(match.teamB)}</option>
                </select>
              </label>
            ` : ""}
            <div class="round-edit-grid">
              ${roundSlotSelect(round, match, matchIndex, "teamA", 0)}
              ${roundSlotSelect(round, match, matchIndex, "teamA", 1)}
              ${roundSlotSelect(round, match, matchIndex, "teamB", 0)}
              ${roundSlotSelect(round, match, matchIndex, "teamB", 1)}
            </div>
          </div>
        `).join("")}
        ${round.sitting.length ? `<p class="meta">Sitting: ${names(round.sitting)}</p>` : ""}
      </article>
    `).join("")}`
    : `<div class="empty">Generate round-robin assignments after check-in.</div>`;
}

function renderRoundTeamChart() {
  const teams = state.roundSettings.sequentialTeams || [];
  if (!teams.length || !state.rounds.some((round) => round.rotationStyle === "teams-sequential")) return "";
  const standings = new Map(teams.map((team) => [team.id, { team, wins: 0, losses: 0, played: 0, opponents: new Set() }]));
  state.rounds.forEach((round) => round.matches.forEach((match) => {
    const teamA = standings.get(match.teamAId);
    const teamB = standings.get(match.teamBId);
    if (!teamA || !teamB) return;
    if (!match.winner) return;
    teamA.opponents.add(teamB.team.name);
    teamB.opponents.add(teamA.team.name);
    teamA.played += 1;
    teamB.played += 1;
    if (match.winner === "teamA") {
      teamA.wins += 1;
      teamB.losses += 1;
    } else {
      teamB.wins += 1;
      teamA.losses += 1;
    }
  }));
  return `
    <article class="card round-team-standings">
      <div class="round-card-head"><strong>Team Results</strong><span class="meta">Updates after every match</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Team</th><th>Players</th><th>Played</th><th>Wins</th><th>Losses</th><th>Opponents</th></tr></thead>
          <tbody>${Array.from(standings.values()).map(({ team, played, wins, losses, opponents }) => `
            <tr>
              <td><strong>${escapeHtml(team.name)}</strong></td>
              <td>${names(team.players.map((player) => player.id))}</td>
              <td>${played}</td><td>${wins}</td><td>${losses}</td>
              <td>${escapeHtml(Array.from(opponents).join(", ") || "Not played yet")}</td>
            </tr>
          `).join("")}</tbody>
        </table>
      </div>
    </article>
  `;
}

function roundSlotSelect(round, match, matchIndex, teamKey, slotIndex) {
  const selectedId = match[teamKey]?.[slotIndex] || "";
  const label = `${teamKey === "teamA" ? "Team A" : "Team B"} ${slotIndex + 1}`;
  return `
    <label>${label}
      <select data-round-slot="${round.round}" data-match-index="${matchIndex}" data-team-key="${teamKey}" data-slot-index="${slotIndex}">
        ${roundPlayerOptions(round, selectedId)}
      </select>
    </label>
  `;
}

function roundPlayerOptions(round, selectedId = "") {
  const ids = new Set([
    ...checkedPlayers().map((player) => player.id),
    ...(round.sitting || []),
    ...(round.matches || []).flatMap((match) => [...(match.teamA || []), ...(match.teamB || [])]),
  ]);
  const players = Array.from(ids)
    .map((id) => state.players.find((player) => player.id === id))
    .filter(Boolean)
    .sort(checkinPrioritySort);
  return `<option value="">Empty</option>${players.map((player) => `
    <option value="${player.id}" ${player.id === selectedId ? "selected" : ""}>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)} (${escapeHtml(player.skill || "Open")})</option>
  `).join("")}`;
}

function handleRoundListClick(event) {
  const clearButton = event.target.closest("[data-clear-round]");
  if (!clearButton) return;
  clearRound(Number(clearButton.dataset.clearRound));
}

function handleRoundListChange(event) {
  const winnerSelect = event.target.closest("[data-round-winner]");
  if (winnerSelect) {
    const round = state.rounds.find((item) => item.round === Number(winnerSelect.dataset.roundWinner));
    const match = round?.matches?.[Number(winnerSelect.dataset.matchIndex)];
    if (match) {
      match.winner = winnerSelect.value;
      saveState();
      renderRounds();
    }
    return;
  }
  const select = event.target.closest("[data-round-slot]");
  if (!select) return;
  updateRoundSlot({
    roundNumber: Number(select.dataset.roundSlot),
    matchIndex: Number(select.dataset.matchIndex),
    teamKey: select.dataset.teamKey,
    slotIndex: Number(select.dataset.slotIndex),
    playerId: select.value,
  });
}

function updateRoundRotationControls() {
  const winnerMode = els.roundRotationStyle.value === "winners";
  const latestRound = state.rounds.length ? Math.max(...state.rounds.map((round) => round.round)) : 0;
  const latest = state.rounds.find((round) => round.round === latestRound);
  const latestMatches = latest?.matches || [];
  const isSequentialTeamMatch = latest?.rotationStyle === "teams-sequential";
  const sequentialMode = latest?.rotationStyle === "teams-sequential" && state.roundSettings.sequentialMatchesRemaining > 0;
  els.advanceRoundBtn.hidden = isSequentialTeamMatch ? !sequentialMode : !winnerMode;
  els.advanceRoundBtn.textContent = sequentialMode ? "Next Match" : "Next Round";
  els.advanceRoundBtn.disabled = (winnerMode || sequentialMode) && (!latestMatches.length || latestMatches.some((match) => !match.winner));
}

function advanceRoundRobin() {
  const currentNumber = Math.max(0, ...state.rounds.map((round) => round.round));
  const current = state.rounds.find((round) => round.round === currentNumber);
  if (current?.rotationStyle === "teams-sequential" && state.roundSettings.sequentialMatchesRemaining > 0) {
    const match = current.matches[0];
    if (!match?.winner) {
      window.alert("Select the winning team before creating the next match.");
      return;
    }
    const teams = state.roundSettings.sequentialTeams || [];
    const byId = new Map(teams.map((team) => [team.id, team]));
    const teamA = byId.get(match.teamAId);
    const teamB = byId.get(match.teamBId);
    const queue = state.roundSettings.teamMatchQueue || [];
    let nextPairing;
    if (current.teamRotation === "winners") {
      const winner = match.winner === "teamA" ? teamA : teamB;
      const loser = match.winner === "teamA" ? teamB : teamA;
      queue.push(loser);
      nextPairing = { teamA: winner, teamB: queue.shift() };
    } else {
      queue.push(teamA, teamB);
      nextPairing = { teamA: queue.shift(), teamB: queue.shift() };
    }
    state.roundSettings.sequentialMatchesRemaining -= 1;
    state.rounds.push(createSequentialTeamRound(nextPairing, teams, currentNumber + 1, "teams-sequential", current.teamRotation));
    saveState();
    renderRounds();
    return;
  }
  advanceWinnerRotationRound();
}

function advanceWinnerRotationRound() {
  const currentNumber = Math.max(0, ...state.rounds.map((round) => round.round));
  const current = state.rounds.find((round) => round.round === currentNumber);
  if (!current?.matches?.length || current.matches.some((match) => !match.winner)) {
    window.alert("Select a winner for every court before creating the next round.");
    return;
  }

  const winnerTeams = current.matches.map((match) => [...match[match.winner]]);
  const waitingIds = [
    ...(current.sitting || []),
    ...current.matches.flatMap((match) => match[match.winner === "teamA" ? "teamB" : "teamA"]),
  ].filter(Boolean);
  const waitingPlayers = Array.from(new Set(waitingIds))
    .map((id) => state.players.find((player) => player.id === id))
    .filter(Boolean)
    .sort(checkinPrioritySort);
  const rotatingTeams = buildBalancedTeams(waitingPlayers).map((team) => team.players.map((player) => player.id));
  const courts = Math.max(1, Number(els.courtCount.value) || 1);
  const matches = [];
  for (let court = 1; court <= courts && winnerTeams.length && rotatingTeams.length; court += 1) {
    matches.push({ court, teamA: winnerTeams.shift(), teamB: rotatingTeams.shift(), winner: "" });
  }
  const assigned = new Set(matches.flatMap((match) => [...match.teamA, ...match.teamB]));
  const allIds = new Set([
    ...matches.flatMap((match) => [...match.teamA, ...match.teamB]),
    ...winnerTeams.flat(),
    ...waitingPlayers.map((player) => player.id),
  ]);
  state.rounds.push({
    round: currentNumber + 1,
    rotationStyle: "winners",
    matches,
    sitting: Array.from(allIds).filter((id) => !assigned.has(id)),
  });
  saveState();
  renderRounds();
}

function updateRoundSlot({ roundNumber, matchIndex, teamKey, slotIndex, playerId }) {
  const round = state.rounds.find((item) => item.round === roundNumber);
  const match = round?.matches?.[matchIndex];
  if (!round || !match) return;

  match.teamA = [...(match.teamA || [])];
  match.teamB = [...(match.teamB || [])];
  match[teamKey][slotIndex] = playerId;

  if (playerId) {
    round.matches.forEach((item, index) => {
      ["teamA", "teamB"].forEach((key) => {
        item[key] = (item[key] || []).map((id, playerIndex) =>
          index === matchIndex && key === teamKey && playerIndex === slotIndex ? id : id === playerId ? "" : id
        );
      });
    });
  }

  const roundPool = new Set([
    ...(round.sitting || []),
    ...(round.matches || []).flatMap((item) => [...(item.teamA || []), ...(item.teamB || [])]).filter(Boolean),
  ]);
  if (playerId) roundPool.add(playerId);
  const assigned = new Set((round.matches || []).flatMap((item) => [...(item.teamA || []), ...(item.teamB || [])]).filter(Boolean));
  round.sitting = Array.from(roundPool).filter((id) => !assigned.has(id));
  round.matches = round.matches.filter((item) => (item.teamA || []).some(Boolean) || (item.teamB || []).some(Boolean));

  saveState();
  renderRounds();
}

function clearRound(roundNumber) {
  const round = state.rounds.find((item) => item.round === roundNumber);
  if (!round) return;
  if (!window.confirm(`Clear Round ${roundNumber}?`)) return;
  state.rounds = state.rounds.filter((item) => item.round !== roundNumber);
  saveState();
  renderRounds();
}

function clearAllRounds() {
  if (!state.rounds.length) {
    renderRounds();
    return;
  }
  if (!window.confirm("Clear all generated round-robin assignments?")) return;
  state.rounds = [];
  state.roundSettings.teamMatchQueue = [];
  state.roundSettings.sequentialTeams = [];
  state.roundSettings.sequentialMatchesRemaining = 0;
  saveState();
  renderRounds();
}

function seedBracket() {
  const players = checkedPlayers().sort(checkinPrioritySort);
  const format = els.tournamentFormat.value;
  const minimum = format === "doubles" ? 4 : 2;
  if (players.length < minimum) {
    document.querySelector("#bracket").innerHTML = `<div class="empty">Check in at least ${minimum} players for ${format}.</div>`;
    return;
  }

  if (format === "doubles" && players.length % 2 !== 0) {
    document.querySelector("#bracket").innerHTML = `<div class="empty">Doubles requires an even number of checked-in players.</div>`;
    return;
  }

  const competitors = format === "doubles"
    ? buildTournamentTeams(players, els.doublesPairing.value).map((team) => tournamentTeamId(team))
    : players.map((player) => player.id);

  state.bracket = chunk(competitors, 2).map((ids, index) => ({
    round: 1,
    match: index + 1,
    players: ids,
    winner: "",
    scoreA: "",
    scoreB: "",
    format,
  }));
  saveState();
  renderBracket();
}

function updateTournamentFormatControls() {
  els.doublesPairingLabel.hidden = els.tournamentFormat.value !== "doubles";
}

function buildTournamentTeams(players, pairingMode) {
  if (pairingMode === "random") return buildBalancedTeams(players).map((team) => team.players);

  const byId = new Map(players.map((player) => [player.id, player]));
  const paired = new Set();
  const teams = [];
  players.forEach((player) => {
    const partner = byId.get(player.partnerPlayerId);
    if (!partner || paired.has(player.id) || paired.has(partner.id)) return;
    teams.push([player, partner]);
    paired.add(player.id);
    paired.add(partner.id);
  });
  const remaining = shuffle(players.filter((player) => !paired.has(player.id)));
  return [...teams, ...chunk(remaining, 2)];
}

function tournamentTeamId(team) {
  return `team:${team.map((player) => player.id).join(",")}`;
}

function tournamentCompetitorName(id) {
  if (!String(id).startsWith("team:")) return names([id]);
  return names(String(id).slice(5).split(","));
}

function renderBracket() {
  const target = document.querySelector("#bracket");
  if (!state.bracket.length) {
    target.innerHTML = `<div class="empty">Seed a bracket from checked-in players.</div>`;
    return;
  }

  const rounds = [...new Set(state.bracket.map((match) => match.round))];
  target.innerHTML = rounds.map((round) => `
    <article class="card">
      <div class="panel-head">
        <strong>Bracket Round ${round}</strong>
        <button class="danger subtle clear-bracket-round" type="button" data-clear-round="${round}">Clear Round</button>
      </div>
      ${state.bracket.filter((match) => match.round === round).map((match) => `
        <div class="match">
          <p class="meta">Match ${match.match}</p>
          <strong>${match.players.map(tournamentCompetitorName).join(" vs ")}</strong>
          <div class="round-edit-grid">
            <label>${tournamentCompetitorName(match.players[0])} score
              <input class="bracket-score" data-round="${match.round}" data-match="${match.match}" data-score-side="scoreA" type="number" min="0" inputmode="numeric" value="${match.scoreA ?? ""}" placeholder="0">
            </label>
            <label>${tournamentCompetitorName(match.players[1])} score
              <input class="bracket-score" data-round="${match.round}" data-match="${match.match}" data-score-side="scoreB" type="number" min="0" inputmode="numeric" value="${match.scoreB ?? ""}" placeholder="0">
            </label>
          </div>
          <select class="winner-select" data-round="${match.round}" data-match="${match.match}">
            <option value="">Select winner</option>
            ${match.players.map((id) => `<option value="${id}" ${match.winner === id ? "selected" : ""}>${tournamentCompetitorName(id)}</option>`).join("")}
          </select>
        </div>
      `).join("")}
    </article>
  `).join("");

  document.querySelectorAll(".winner-select").forEach((select) => {
    select.addEventListener("change", () => {
      const match = state.bracket.find((item) => item.round === Number(select.dataset.round) && item.match === Number(select.dataset.match));
      match.winner = select.value;
      saveState();
    });
  });

  document.querySelectorAll(".bracket-score").forEach((input) => {
    input.addEventListener("change", () => {
      const match = state.bracket.find((item) => item.round === Number(input.dataset.round) && item.match === Number(input.dataset.match));
      if (!match) return;
      match[input.dataset.scoreSide] = input.value;
      saveState();
    });
  });

  document.querySelectorAll(".clear-bracket-round").forEach((button) => {
    button.addEventListener("click", () => clearBracketRound(Number(button.dataset.clearRound)));
  });
}

function clearBracketRound(round) {
  const laterRounds = state.bracket.some((match) => match.round > round);
  const detail = laterRounds ? " This will also clear every later round that depends on it." : "";
  if (!window.confirm(`Clear Bracket Round ${round}?${detail}`)) return;
  state.bracket = state.bracket.filter((match) => match.round < round);
  saveState();
  renderBracket();
}

function advanceBracket() {
  const current = Math.max(0, ...state.bracket.map((match) => match.round));
  const matches = state.bracket.filter((match) => match.round === current);
  const winners = matches.map((match) => match.winner).filter(Boolean);

  if (!matches.length || winners.length !== matches.length || winners.length === 1) return;

  chunk(winners, 2).forEach((players, index) => {
    state.bracket.push({ round: current + 1, match: index + 1, players, winner: "", scoreA: "", scoreB: "", format: matches[0]?.format || "singles" });
  });
  saveState();
  renderBracket();
}

function renderHost() {
  const latest = state.events[0];
  const capacity = latest ? Number(latest.capacity) : 0;
  const checked = checkedPlayers().length;
  const revenue = estimateRevenue();
  text("#hostCapacity", capacity ? `${Math.round((checked / capacity) * 100)}%` : "0%");
  text("#hostWaivers", state.players.filter((player) => player.waiver === "Needs Signature").length);
  text("#hostCourts", latest ? latest.courts : "0");
  document.querySelector("#hostActions").innerHTML = [
    ["Player accounts", `${state.profiles.length} saved profiles ready for login/account expansion`],
    ["Community matching", `${buildMatchRecommendations().length} match signals from profiles and posts`],
    ["Tournament management", "Singles and doubles brackets can be seeded from event check-ins"],
    ["Commerce + payouts", `$${revenue.total} estimated event revenue / $${revenue.hostPayout} host payout`],
  ].map(([title, body]) => `<article class="card"><strong>${title}</strong><p class="meta">${body}</p></article>`).join("");
}

function saveAdmin(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.adminForm).entries());
  const existing = state.admins.find((admin) => admin.email.toLowerCase() === data.email.toLowerCase());

  if (existing) Object.assign(existing, data);
  else state.admins.push({ ...data, id: newId(), invitedAt: new Date().toISOString() });

  els.adminForm.reset();
  saveState();
  renderAdmins();
}

function saveProfile(event) {
  event.preventDefault();
  const form = new FormData(els.profileForm);
  const data = Object.fromEntries(form.entries());
  data.interests = form.getAll("interests");
  data.smsSubscriber = form.get("smsSubscriber") === "on";
  const validation = validateProfile(data);
  if (!validation.ok) {
    showAdminMessage("#profileList", "notice", validation.message);
    return;
  }
  const existing = state.profiles.find((profile) => profile.id === data.profileId)
    || state.profiles.find((profile) => profile.email.toLowerCase() === data.email.toLowerCase());
  const verified = existing?.verificationStatus === "Verified" || isCurrentProfileVerified();
  const waiverAudit = buildWaiverAudit(data.waiver, existing, "Admin profile entry");
  const profile = {
    ...data,
    id: existing?.id || newId(),
    sport: state.mode,
    ...waiverAudit,
    verificationStatus: verified ? "Verified" : "Admin entered",
    verifiedAt: verified ? (existing?.verifiedAt || new Date().toISOString()) : existing?.verifiedAt || "",
    source: existing?.source || "Admin profile entry",
    updatedAt: new Date().toISOString(),
  };
  delete profile.profileId;
  delete profile.verificationCode;

  if (existing) Object.assign(existing, profile);
  else state.profiles.unshift(profile);

  const existingPlayer = state.players.find((player) => player.email.toLowerCase() === data.email.toLowerCase());
  if (!existingPlayer) {
    state.players.unshift({
      id: newId(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || "",
      gender: data.gender || "",
      skill: data.skill,
      waiver: data.waiver || "Needs Signature",
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

