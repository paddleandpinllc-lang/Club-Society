const STORAGE_KEY = "paddlePinClub.v1";
const CLOUD_CONFIG_KEY = "clubSociety.cloudConfig.v1";
const INTEGRATION_CONFIG_KEY = "clubSociety.integrationConfig.v1";
const PADDLE_PINT_SYNC_CONFIG_KEY = "clubSociety.paddlePintSync.v1";
const PADDLE_PINT_ENDPOINT_URL = "https://clubsociety.app/api/paddle-pint";
const APP_VERSION = document.querySelector('meta[name="app-version"]')?.content || "local-dev";
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

const state = loadState();
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
  societyFriendSearch: document.querySelector("#societyFriendSearch"),
  societyFriendResults: document.querySelector("#societyFriendResults"),
  societySinglesToggle: document.querySelector("#societySinglesToggle"),
  myRsvpList: document.querySelector("#myRsvpList"),
  myPostList: document.querySelector("#myPostList"),
  casualMatchForm: document.querySelector("#casualMatchForm"),
  casualMatchList: document.querySelector("#casualMatchList"),
  quickGameForm: document.querySelector("#quickGameForm"),
  quickGameList: document.querySelector("#quickGameList"),
  courtSearch: document.querySelector("#courtSearch"),
  courtDirectoryList: document.querySelector("#courtDirectoryList"),
  societyAvatar: document.querySelector(".society-avatar"),
  societyProfileDrawer: document.querySelector("#societyProfileDrawer"),
  societyPhotoPreview: document.querySelector("#societyPhotoPreview"),
  societyPhotoInput: document.querySelector("#societyPhotoInput"),
  golfProfileForm: document.querySelector("#golfProfileForm"),
  golfProfileMessage: document.querySelector("#golfProfileMessage"),
  golfTeeTimeForm: document.querySelector("#golfTeeTimeForm"),
  golfTeeTimeList: document.querySelector("#golfTeeTimeList"),
  golfGroupForm: document.querySelector("#golfGroupForm"),
  golfGroupList: document.querySelector("#golfGroupList"),
  golfMessageForm: document.querySelector("#golfMessageForm"),
  golfMessageList: document.querySelector("#golfMessageList"),
  golfMatchDeck: document.querySelector("#golfMatchDeck"),
  golfPassBtn: document.querySelector("#golfPassBtn"),
  golfMessageMatchBtn: document.querySelector("#golfMessageMatchBtn"),
  adminForm: document.querySelector("#adminForm"),
  profileForm: document.querySelector("#profileForm"),
  publicViewForm: document.querySelector("#publicViewForm"),
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
  roundPlayerPicker: document.querySelector("#roundPlayerPicker"),
  buildRoundsBtn: document.querySelector("#buildRoundsBtn"),
  clearRoundsBtn: document.querySelector("#clearRoundsBtn"),
  seedBracketBtn: document.querySelector("#seedBracketBtn"),
  advanceBracketBtn: document.querySelector("#advanceBracketBtn"),
  rsvpLookup: document.querySelector("#rsvpLookup"),
  fillRsvpBtn: document.querySelector("#fillRsvpBtn"),
  cancelEventEditBtn: document.querySelector("#cancelEventEditBtn"),
  cancelPlayerEditBtn: document.querySelector("#cancelPlayerEditBtn"),
  cancelProfileEditBtn: document.querySelector("#cancelProfileEditBtn"),
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
els.casualMatchForm.addEventListener("submit", saveCasualMatch);
els.quickGameForm.addEventListener("submit", saveQuickGame);
els.courtSearch.addEventListener("input", renderCourtDirectory);
els.golfProfileForm.addEventListener("submit", saveGolfProfile);
els.golfTeeTimeForm.addEventListener("submit", saveGolfTeeTime);
els.golfGroupForm.addEventListener("submit", saveGolfGroup);
els.golfMessageForm.addEventListener("submit", saveGolfMessage);
els.golfPassBtn.addEventListener("click", passGolfMatch);
els.golfMessageMatchBtn.addEventListener("click", messageGolfMatch);
els.adminForm.addEventListener("submit", saveAdmin);
els.profileForm.addEventListener("submit", saveProfile);
els.publicViewForm.addEventListener("submit", savePublicView);
els.shopForm.addEventListener("submit", saveShopCollection);
els.integrationForm.addEventListener("submit", saveIntegrationConfig);
els.paddlePintSyncForm.addEventListener("submit", savePaddlePintSyncConfig);
els.importPaddlePintBtn.addEventListener("click", importPaddlePintSubmissions);
els.cloudConfigForm.addEventListener("submit", saveCloudConfig);
els.rosterSearch.addEventListener("input", renderPlayers);
document.querySelector("#playerList").addEventListener("click", handlePlayerListClick);
document.querySelector("#eventList").addEventListener("click", handleEventListClick);
document.querySelector("#profileList").addEventListener("click", handleProfileListClick);
document.querySelector("#shopCollections").addEventListener("click", handleShopListClick);
document.querySelector("#archiveList").addEventListener("click", handleArchiveListClick);
els.buildRoundsBtn.addEventListener("click", buildRounds);
els.roundPlayerSource.addEventListener("change", renderRoundPlayerPicker);
els.roundPlayerPicker.addEventListener("change", saveRoundManualSelection);
els.clearRoundsBtn.addEventListener("click", clearAllRounds);
document.querySelector("#roundList").addEventListener("click", handleRoundListClick);
document.querySelector("#roundList").addEventListener("change", handleRoundListChange);
els.seedBracketBtn.addEventListener("click", seedBracket);
els.advanceBracketBtn.addEventListener("click", advanceBracket);
els.fillRsvpBtn.addEventListener("click", fillRsvp);
els.cancelEventEditBtn.addEventListener("click", resetEventForm);
els.cancelPlayerEditBtn.addEventListener("click", resetPlayerForm);
els.cancelProfileEditBtn.addEventListener("click", resetProfileForm);
els.cancelShopEditBtn.addEventListener("click", resetShopForm);
els.sendVerificationBtn.addEventListener("click", sendProfileVerification);
els.verifyProfileBtn.addEventListener("click", verifyProfileCode);
els.csvImportBtn.addEventListener("click", () => els.csvImport.click());
els.csvImport.addEventListener("change", importPlayerCsv);
els.exportCsvBtn.addEventListener("click", exportPlayerCsv);
els.templateButtons.forEach((button) => button.addEventListener("click", () => applyEventTemplate(button.dataset.template)));
els.publicFindBtn.addEventListener("click", findPublicPlayer);
els.publicCheckinForm.addEventListener("submit", savePublicCheckin);
els.openWaiverBtn.addEventListener("click", openWaiverModal);
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
    casualMatches: [],
    casualMatchFilter: "all",
    quickGames: [],
    quickGameFilter: "all",
    courtFilter: "all",
    paddlePintImportedIds: [],
    roundSettings: { selectedPlayerIds: [], teams: [] },
    selectedEventRosterId: "",
    sync: { status: "Local only", lastSync: "", pending: 0 },
  };

  try {
    return normalizeState({ ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) });
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
    ...profile,
  }));
  data.events = data.events || [];
  data.players = data.players || [];
  data.golfProfile = data.golfProfile || {};
  data.golfTeeTimes = data.golfTeeTimes || [];
  data.golfGroups = data.golfGroups || [];
  data.golfMessages = data.golfMessages || [];
  data.golfMatchIndex = data.golfMatchIndex || 0;
  data.societySessionEmail = data.societySessionEmail || "";
  data.societyFavorites = data.societyFavorites || [];
  data.societyFriends = data.societyFriends || [];
  data.societyFriendFilter = data.societyFriendFilter || "all";
  data.casualMatches = data.casualMatches || [];
  data.casualMatchFilter = data.casualMatchFilter || "all";
  data.quickGames = data.quickGames || [];
  data.quickGameFilter = data.quickGameFilter || "all";
  data.courtFilter = data.courtFilter || "all";
  data.paddlePintImportedIds = data.paddlePintImportedIds || [];
  data.roundSettings = { selectedPlayerIds: [], teams: [], ...(data.roundSettings || {}) };
  data.selectedEventRosterId = data.selectedEventRosterId || "";
  return data;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setView(id) {
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === id));
  els.views.forEach((view) => view.classList.toggle("active", view.id === id));
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
  renderMetrics();
  renderEvents();
  renderEventRoster();
  renderEventOptions();
  renderPublicViewControls();
  renderPublicViewPreview();
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
  renderMatches();
  renderTournamentDiscovery();
  renderShopCollections();
  renderArchive();
  renderIntegrationConfig();
  renderPaddlePintSyncConfig();
  renderIntegrationEventOptions();
  renderCloudConfig();
  renderCloudStatus();
  renderGolf();
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
  const existing = state.players.find((player) => player.id === data.playerId)
    || state.players.find((player) => player.email?.toLowerCase() === data.email.toLowerCase());
  const player = {
    ...data,
    id: existing?.id || newId(),
    sport: state.mode,
    checkedIn: !["Waitlist", "Left event"].includes(data.status),
    status: data.status || "Checked in",
    checkedInAt: existing?.checkedInAt || new Date().toISOString(),
  };
  delete player.playerId;

  if (existing) Object.assign(existing, player);
  else state.players.unshift(player);
  if (player.checkedIn) {
    upsertPlayerDirectoryProfile({
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      phone: player.phone,
      skill: player.skill,
      interests: ["Played event", "Social round robins"],
      source: eventName(player.eventId) || "Admin check-in",
    });
  }

  resetPlayerForm();
  saveState();
  render();
  showAdminMessage("#playerList", "success", existing ? "Player updated." : "Player checked in.");
}

function resetPlayerForm() {
  els.playerForm.reset();
  els.playerForm.elements.playerId.value = "";
  els.playerForm.elements.status.value = "Checked in";
  els.playerForm.elements.paid.value = "Not tracked";
  els.playerForm.querySelector("button[type=submit]").textContent = "Check In";
}

async function sendSocietySignupConfirmation(profile) {
  if (!window.location.protocol.startsWith("http")) {
    return { ok: true, message: "Profile saved locally. Confirmation email sends from the hosted app after Brevo is configured in Cloudflare." };
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
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      return { ok: false, message: result.error || "Profile saved, but the confirmation email could not be sent yet." };
    }
    if (result.emailSent) {
      return { ok: true, message: "Welcome to Club Society. Check your email to verify your account and finish your profile." };
    }
    return { ok: true, message: result.emailWarning || "Profile saved. Brevo email is waiting on Cloudflare secret configuration." };
  } catch {
    return { ok: false, message: "Profile saved locally. Hosted email confirmation is not reachable from this device yet." };
  }
}

async function initProfileCompletionLink() {
  const url = new URL(window.location.href);
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
        showSocietyAccountMessage(result.error || "That email and password did not match.", "error");
        return;
      }
      if (result.member) upsertSocietyProfileFromCompletion(result.member);
      state.societySessionEmail = normalizedEmail;
      saveState();
      updateSocietyHome();
      localStorage.setItem("clubSociety.stayLoggedIn.v1", String(els.societyAccountForm.elements.signinStayLoggedIn.checked));
      showSocietyAccountMessage(result.emailVerified
        ? "Welcome back. You are signed in."
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
  const data = Object.fromEntries(new FormData(els.societyAccountForm).entries());
  const passwordValidation = validateSocietyPassword(data.password, data.confirmPassword);
  if (!passwordValidation.ok) {
    showSocietyAccountMessage(passwordValidation.message, "error");
    return;
  }
  const existing = state.profiles.find((profile) => profile.email?.toLowerCase() === data.email.toLowerCase());
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
  showSocietyAccountMessage(emailResult.message || (existing
    ? "Welcome back. Your Society Pass profile was updated."
    : "Welcome to Club Society. Check your email to verify your account and finish your profile."), emailResult.ok ? "success" : "error");
  els.societyAccountForm.reset();
  els.societyAccountForm.elements.city.value = "Watkinsville";
  els.societyAccountForm.elements.state.value = "GA";
  els.societyAccountForm.elements.zip.value = "30677";
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
    signInSocietyMember(email, password);
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

  const messageFriendButton = event.target.closest("[data-friend-message]");
  if (messageFriendButton) {
    messageSocietyFriend(messageFriendButton.dataset.friendMessage);
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
    item.classList.toggle("active", item.dataset.authContent === panel);
  });
  document.querySelectorAll("[data-auth-panel]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authPanel === panel);
  });
  els.societyAccountMessage.textContent = "";
}

function setSocietyTab(tab) {
  const protectedTabs = new Set(["pickleballHome", "games", "courts", "events", "partners", "host", "learn", "settings", "golfMessages"]);
  if (protectedTabs.has(tab) && !hasSocietyAccess()) {
    setSocietyTab("home");
    els.societyAccountMessage.textContent = "Sign in or Join to access";
    return;
  }
  if (["host", "golfMessages"].includes(tab) && !profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  document.querySelectorAll("[data-society-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.societyPanel === tab);
  });
  document.querySelectorAll("#societyApp [data-society-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.societyTab === tab);
  });
  if (tab === "home") updateSocietyHome();
  if (tab === "partners") {
    renderCasualMatches();
    renderSocietyFriends();
  }
  if (tab === "games") renderQuickGames();
  if (tab === "courts") renderCourtDirectory();
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
  if (!hasAccess) return;
  const profile = currentSocietyProfile();
  const name = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "Society Member";
  els.societyMemberName.textContent = name || "Society Member";
  els.societyMemberMeta.textContent = profile
    ? `${profile.city || "Watkinsville"}, ${profile.state || "GA"} | ${profile.preferredSport || "Golf + Pickleball"}`
    : "Golf + Pickleball | 30677";
  if (els.societyFavoriteCount) els.societyFavoriteCount.textContent = String(state.societyFavorites.length);
  if (els.societyFriendCount) els.societyFriendCount.textContent = String(state.societyFriends.length);
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
  const photo = await readFileAsDataUrl(file);
  els.societyPhotoPreview.style.backgroundImage = `url("${photo}")`;
  els.societyPhotoPreview.textContent = "Photo selected";
}

async function saveSocietyProfileFromDrawer() {
  const data = Object.fromEntries(new FormData(els.societyProfileDrawer).entries());
  if (!data.email?.trim()) {
    els.societyAccountMessage.textContent = "Add an email before saving your profile.";
    return;
  }
  let profile = currentSocietyProfile() || state.profiles.find((item) => item.email?.toLowerCase() === data.email.toLowerCase());
  const photoFile = els.societyPhotoInput.files?.[0];
  const photoDataUrl = photoFile ? await readFileAsDataUrl(photoFile) : profile?.photoDataUrl || "";
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
    stayLoggedIn: true,
    preferredSport: profile?.preferredSport || "both",
    sport: profile?.sport || "pickleball",
    source: profile?.source || "Society profile",
    updatedAt: new Date().toISOString(),
  };
  if (profile) Object.assign(profile, nextProfile);
  else state.profiles.unshift(nextProfile);
  state.societySessionEmail = nextProfile.email;
  saveState();
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
  state.societySessionEmail = "";
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

function societyDirectoryCards() {
  const currentEmail = state.societySessionEmail?.toLowerCase();
  const savedProfiles = state.profiles
    .filter((profile) => profile.email?.toLowerCase() !== currentEmail)
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
    }));
  const demoProfiles = [
    { id: "demo-maya", name: "Maya Thompson", city: "Watkinsville", sport: "pickleball", skill: "3.5 doubles", vibe: "Weeknight games, mixed doubles, and post-match hangouts.", socialPlay: true, allowMessages: true },
    { id: "demo-eli", name: "Eli Parker", city: "Athens", sport: "golf", skill: "12 handicap", vibe: "Last-minute tee times, relaxed pace, good playlists.", socialPlay: true, allowMessages: true },
    { id: "demo-jordan", name: "Jordan Reese", city: "Oconee", sport: "both", skill: "Pickleball 3.0 | Golf 18", vibe: "Down for social play, beginner-friendly groups, and club events.", socialPlay: true, allowMessages: true },
    { id: "demo-avery", name: "Avery Collins", city: "Athens", sport: "pickleball", skill: "Open play", vibe: "Looking for a steady drill partner and Saturday morning games.", socialPlay: false, allowMessages: false },
  ];
  return [...savedProfiles, ...demoProfiles];
}

function defaultCasualMatches() {
  return [
    { id: "match-sat-doubles", title: "Need 2 for social doubles", day: "Today", time: "18:00", playersNeeded: "2", skill: "3.0-3.5", location: "Southeast Clarke Park", note: "Rotating partners, friendly but competitive.", rsvps: [] },
    { id: "match-mixed-oconee", title: "Mixed doubles practice group", day: "Tomorrow", time: "09:00", playersNeeded: "1", skill: "Open", location: "Herman C. Michael Park", note: "Easy pace, drill a little then play.", rsvps: [] },
    { id: "match-ladder-preview", title: "Next 7 days ladder warmup", day: "Next 7 days", time: "17:30", playersNeeded: "4", skill: "3.5+", location: "Bishop Park", note: "Looking for players who want challenge style games.", rsvps: [] },
  ];
}

function defaultQuickGames() {
  return [
    { id: "quick-today-singles", title: "Singles hit around", day: "Today", time: "16:30", location: "Satterfield Park", note: "One player, 45 minutes, any level.", rsvps: [] },
    { id: "quick-tomorrow-open", title: "Need 1 for doubles", day: "Tomorrow", time: "07:45", location: "Southeast Clarke Park", note: "Casual doubles before work.", rsvps: [] },
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
  const query = (els.societyFriendSearch?.value || "").trim().toLowerCase();
  const filter = state.societyFriendFilter || "all";
  const cards = societyDirectoryCards().filter((card) => {
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
    : `<article class="society-list-card"><strong>No matches yet</strong><p>Try a different name, city, sport, or skill.</p></article>`;
  updateSinglesToggle();
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
  const posts = [...state.casualMatches, ...defaultCasualMatches()].filter((post) => matchesDayFilter(post.day, filter));
  els.casualMatchList.innerHTML = posts.map((post) => renderPostCard(post, "match")).join("");
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
  const posts = [...state.quickGames, ...defaultQuickGames()].filter((post) => matchesDayFilter(post.day, filter));
  els.quickGameList.innerHTML = posts.map((post) => renderPostCard(post, "quick")).join("");
}

function renderPostCard(post, type) {
  const rsvps = post.rsvps || [];
  const action = type === "match" ? "data-match-rsvp" : "data-quick-game-rsvp";
  const needed = post.playersNeeded ? `${post.playersNeeded} needed | ` : "";
  return `
    <article class="society-post-card">
      <div>
        <span>${escapeHtml(post.day)} | ${escapeHtml(post.time || "Time TBD")}</span>
        <strong>${escapeHtml(post.title)}</strong>
        <p>${needed}${escapeHtml(post.location || "Location TBD")} ${post.skill ? `| ${escapeHtml(post.skill)}` : ""}</p>
        <p>${escapeHtml(post.note || "RSVP if you can play.")}</p>
      </div>
      <div class="society-post-actions">
        <span>${rsvps.length} RSVP${rsvps.length === 1 ? "" : "s"}</span>
        <button ${action}="${escapeHtml(post.id)}" type="button">RSVP</button>
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
      <p>${escapeHtml(post.day || "Any day")} | ${escapeHtml(post.time || "Time TBD")} | ${escapeHtml(post.location || "Location TBD")}</p>
      ${detail ? `<p>${escapeHtml(detail)}</p>` : ""}
    </article>
  `;
}

function rsvpToCasualMatch(id) {
  rsvpToPost(state.casualMatches, id);
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

function matchesDayFilter(day, filter) {
  const normalized = String(day || "").toLowerCase();
  if (filter === "all") return true;
  if (filter === "next7") return normalized.includes("next 7");
  return normalized === filter;
}

function renderCourtDirectory() {
  if (!els.courtDirectoryList) return;
  const query = (els.courtSearch?.value || "").trim().toLowerCase();
  const filter = state.courtFilter || "all";
  document.querySelectorAll("[data-court-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.courtFilter === filter);
  });
  const courts = courtDirectory().filter((court) => {
    const text = `${court.name} ${court.city} ${court.address} ${court.access} ${court.surface} ${court.courts} ${court.note}`.toLowerCase();
    const filterMatch = filter === "all"
      || (filter === "club" ? court.access.toLowerCase().includes("club") || court.access.toLowerCase().includes("private") : text.includes(filter));
    return filterMatch && (!query || text.includes(query));
  });
  els.courtDirectoryList.innerHTML = courts.map((court) => `
    <article class="society-court-card">
      <span>${escapeHtml(court.city)} | ${escapeHtml(court.surface)} | ${escapeHtml(court.access)}</span>
      <strong>${escapeHtml(court.name)}</strong>
      <p>${escapeHtml(court.address)}</p>
      <p>${escapeHtml(court.courts)} - ${escapeHtml(court.note)}</p>
    </article>
  `).join("");
}

function renderSocietyFriendCard(card) {
  const isFriend = state.societyFriends.includes(card.id);
  const photo = card.photoDataUrl
    ? `style="background-image:url('${escapeHtml(card.photoDataUrl)}')"`
    : "";
  return `
    <article class="society-friend-card">
      <div class="society-friend-photo" ${photo}>${card.photoDataUrl ? "" : escapeHtml(initials(card.name))}</div>
      <div>
        <span>${escapeHtml(card.city)} | ${escapeHtml(card.sport)}</span>
        <strong>${escapeHtml(card.name)}</strong>
        <p>${escapeHtml(card.skill)} - ${escapeHtml(card.vibe)}</p>
      </div>
      <div class="society-friend-actions">
        <button class="${isFriend ? "active" : ""}" data-friend-add="${escapeHtml(card.id)}" type="button">${isFriend ? "Friends" : "Add"}</button>
        <button ${card.allowMessages === false ? "disabled" : `data-friend-message="${escapeHtml(card.id)}"`} type="button">${card.allowMessages === false ? "No messages" : "Message"}</button>
      </div>
    </article>
  `;
}

function addSocietyFriend(id) {
  if (!id) return;
  if (!state.societyFriends.includes(id)) state.societyFriends.push(id);
  saveState();
  renderSocietyFriends();
  updateSocietyHome();
  els.societyAccountMessage.textContent = "Added to Club Friends.";
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

function saveGolfProfile(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.golfProfileForm).entries());
  state.golfProfile = {
    ...data,
    zip: data.zip || "30677",
    updatedAt: new Date().toISOString(),
  };
  const [firstName = "", ...rest] = data.name.trim().split(/\s+/);
  upsertPlayerDirectoryProfile({
    firstName: titleCase(firstName),
    lastName: titleCase(rest.join(" ")),
    email: data.email,
    phone: "",
    skill: data.handicap ? `Golf handicap ${data.handicap}` : "Golf member",
    interests: ["Golf groups", "Last-minute tee times"],
    source: "Golf Society signup",
    sport: "golf",
  });
  saveState();
  renderGolf();
  els.golfProfileMessage.textContent = "Golf profile saved. You are ready to match inside the 30677 radius.";
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
  if (!profileHasPhoto()) {
    promptForSocietyPhoto();
    return;
  }
  const data = Object.fromEntries(new FormData(els.golfMessageForm).entries());
  state.golfMessages.unshift({
    ...data,
    id: newId(),
    from: state.golfProfile.name || "You",
    createdAt: new Date().toISOString(),
  });
  els.golfMessageForm.reset();
  saveState();
  renderGolf();
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
  renderGolfProfileForm();
  renderGolfMatchDeck();
  renderGolfTeeTimes();
  renderGolfGroups();
  renderGolfMessages();
}

function renderGolfProfileForm() {
  Object.entries(state.golfProfile || {}).forEach(([name, value]) => {
    const field = els.golfProfileForm.elements[name];
    if (field) field.value = value || "";
  });
  if (!els.golfProfileForm.elements.zip.value) els.golfProfileForm.elements.zip.value = "30677";
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
      <span>${escapeHtml(item.date)} | ${escapeHtml(item.time)} | ${escapeHtml(item.spots)} open</span>
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
    status === "Waitlist" ? "The event is full, so the host will follow up if a spot opens." : "Your RSVP is saved. Use Public Check-In when you arrive."
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
        </article>
      `;
    }).join("")
    : `<div class="empty">${escapeHtml(featured.size ? "No featured published events match your Public View settings." : "Publish an event from the Events tab to preview the public page.")}</div>`;

  els.publicRsvpEvent.innerHTML = published.length
    ? published.map((event) => `<option value="${event.id}">${escapeHtml(event.name)} - ${escapeHtml(event.date)}</option>`).join("")
    : `<option value="">No published events yet</option>`;
}

function renderPublicViewControls() {
  const view = state.publicView || DEFAULT_PUBLIC_VIEW;
  Object.entries(view).forEach(([name, value]) => {
    const field = els.publicViewForm.elements[name];
    if (field && !Array.isArray(value)) field.value = value || "";
  });
  const featuredEvents = new Set(view.featuredEvents || []);
  document.querySelector("#featuredEventControls").innerHTML = state.events.length
    ? state.events.map((event) => `
      <label><input name="featuredEvents" type="checkbox" value="${escapeHtml(event.id)}" ${featuredEvents.has(event.id) ? "checked" : ""}> ${escapeHtml(event.name)} (${escapeHtml(event.date)})</label>
    `).join("")
    : `<p class="meta">Create events first, then choose which ones appear publicly.</p>`;

  const featuredPlayers = new Set(view.featuredPlayers || []);
  document.querySelector("#featuredPlayerControls").innerHTML = state.profiles.length
    ? state.profiles.map((profile) => `
      <label><input name="featuredPlayers" type="checkbox" value="${escapeHtml(profile.id)}" ${featuredPlayers.has(profile.id) ? "checked" : ""}> ${escapeHtml(profile.firstName)} ${escapeHtml(profile.lastName)}</label>
    `).join("")
    : `<p class="meta">Create player profiles first, then feature selected players.</p>`;
}

function savePublicView(event) {
  event.preventDefault();
  const form = new FormData(els.publicViewForm);
  const data = Object.fromEntries(form.entries());
  if (!data.headline?.trim() || !data.intro?.trim() || !data.primaryLabel?.trim()) {
    showAdminMessage("#publicViewPreview", "notice", "Headline, intro text, and primary button label are required.");
    return;
  }
  state.publicView = {
    ...state.publicView,
    ...data,
    featuredEvents: form.getAll("featuredEvents"),
    featuredPlayers: form.getAll("featuredPlayers"),
  };
  saveState();
  render();
  showAdminMessage("#publicViewPreview", "success", "Public view updated.");
}

function renderPublicViewPreview() {
  const view = state.publicView || DEFAULT_PUBLIC_VIEW;
  const featuredEvents = state.events.filter((event) => (view.featuredEvents || []).includes(event.id));
  const featuredPlayers = state.profiles.filter((profile) => (view.featuredPlayers || []).includes(profile.id));
  document.querySelector("#publicViewPreview").innerHTML = `
    <article class="card public-preview-card">
      <span class="status-pill">${escapeHtml(view.secondaryLabel || "Public page")}</span>
      <strong>${escapeHtml(view.headline)}</strong>
      <p>${escapeHtml(view.intro)}</p>
      <p class="meta">${escapeHtml(view.announcement || "No announcement set.")}</p>
    </article>
    <article class="card">
      <strong>Featured events</strong>
      <p class="meta">${featuredEvents.length ? featuredEvents.map((event) => event.name).join(", ") : "All published events appear."}</p>
    </article>
    <article class="card">
      <strong>Featured players</strong>
      <p class="meta">${featuredPlayers.length ? featuredPlayers.map((profile) => `${profile.firstName} ${profile.lastName}`).join(", ") : "No featured player section selected."}</p>
    </article>
  `;
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
        <button type="button" data-view-event-roster="${escapeHtml(event.id)}">View RSVPs</button>
        <button type="button" data-edit-event="${escapeHtml(event.id)}">Edit</button>
        <button type="button" data-archive-event="${escapeHtml(event.id)}">Archive</button>
        <button class="danger" type="button" data-delete-event="${escapeHtml(event.id)}">Delete</button>
      </div>
    </article>
  `;
}

function handleEventListClick(event) {
  const rosterButton = event.target.closest("[data-view-event-roster]");
  const editButton = event.target.closest("[data-edit-event]");
  const archiveButton = event.target.closest("[data-archive-event]");
  const deleteButton = event.target.closest("[data-delete-event]");

  if (rosterButton) viewEventRoster(rosterButton.dataset.viewEventRoster);
  if (editButton) editEvent(editButton.dataset.editEvent);
  if (archiveButton) archiveEvent(archiveButton.dataset.archiveEvent);
  if (deleteButton) deleteEvent(deleteButton.dataset.deleteEvent);
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
  const attendees = state.players.filter((player) => player.eventId === id);
  state.archivedEvents.unshift({
    ...item,
    archivedAt: new Date().toISOString(),
    attendeeCount: attendees.length,
    checkedInCount: attendees.filter((player) => player.checkedIn).length,
    players: attendees,
  });
  state.events = state.events.filter((event) => event.id !== id);
  if (state.selectedEventRosterId === id) state.selectedEventRosterId = "";
  saveState();
  render();
  showAdminMessage("#eventList", "success", "Event archived.");
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
          <p class="meta">${escapeHtml(player.skill)} | ${escapeHtml(player.email)} | ${escapeHtml(player.status || "Checked in")} | ${player.checkedIn ? "Checked in" : "Not active"}</p>
          <p class="meta">Waiver: ${escapeHtml(player.waiver)} | Paid: ${escapeHtml(player.paid || "Not tracked")}${player.eventId ? ` | ${escapeHtml(eventName(player.eventId))}` : ""}</p>
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
  document.querySelector("#rsvpOptions").innerHTML = state.players.map((player) => `
    <option value="${escapeHtml(`${player.firstName} ${player.lastName} | ${player.email} | ${player.phone || ""}`)}"></option>
  `).join("");
}

function renderWaivers() {
  const queue = state.players.filter((player) => player.waiver === "Needs Signature");
  document.querySelector("#waiverList").innerHTML = queue.length
    ? queue.map((player) => `
      <article class="card alert-card">
        <strong>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</strong>
        <p class="meta">${escapeHtml(player.email)} | ${escapeHtml(player.phone || "No phone")}</p>
      </article>
    `).join("")
    : `<div class="empty">All current players have signed waivers.</div>`;
}

function fillRsvp() {
  const query = els.rsvpLookup.value.toLowerCase();
  const player = state.players.find((item) => {
    const haystack = `${item.firstName} ${item.lastName} ${item.email} ${item.phone || ""}`.toLowerCase();
    return query && haystack.includes(query.split("|")[0].trim());
  });

  if (!player) return;

  ["firstName", "lastName", "email", "phone", "skill", "waiver", "status", "paid", "notes"].forEach((name) => {
    const field = els.playerForm.elements[name];
    if (field && player[name]) field.value = player[name];
  });

  if (player.eventId) els.playerForm.elements.eventId.value = player.eventId;
  els.playerForm.elements.status.value = "Checked in";
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
  if (player.waiver !== "Signed") openWaiverModal();
}

function savePublicCheckin(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(els.publicCheckinForm).entries());
  if (data.waiver !== "Signed") {
    els.publicCheckinForm.dataset.pendingSubmit = "true";
    openWaiverModal();
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
  };

  if (existing) Object.assign(existing, player);
  else state.players.unshift({ ...player, id: newId() });
  upsertPlayerDirectoryProfile({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    skill: data.skill,
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

function openWaiverModal() {
  els.waiverModal.classList.add("open");
  els.waiverModal.setAttribute("aria-hidden", "false");
}

function closeWaiverModal() {
  els.waiverModal.classList.remove("open");
  els.waiverModal.setAttribute("aria-hidden", "true");
}

function agreeToWaiver() {
  setPublicWaiverStatus("Signed");
  closeWaiverModal();

  if (els.publicCheckinForm.dataset.pendingSubmit === "true") {
    els.publicCheckinForm.dataset.pendingSubmit = "";
    els.publicCheckinForm.requestSubmit();
  }
}

function disagreeToWaiver() {
  setPublicWaiverStatus("Needs Signature");
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
  const players = checkedPlayers().sort(skillSort);
  if (!["manual", "teams"].includes(els.roundPlayerSource.value)) return players;
  if (els.roundPlayerSource.value === "teams") return players;

  const selected = new Set(state.roundSettings.selectedPlayerIds || []);
  return players.filter((player) => selected.has(player.id));
}

function renderRoundPlayerPicker() {
  const players = checkedPlayers().sort(skillSort);
  const mode = els.roundPlayerSource.value;
  const manual = mode === "manual";
  const teamsMode = mode === "teams";
  els.roundPlayerPicker.classList.toggle("is-hidden", !manual && !teamsMode);

  if (!manual && !teamsMode) {
    els.roundPlayerPicker.innerHTML = "";
    return;
  }

  if (teamsMode) {
    renderRoundTeamBuilder(players);
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
            <span>${escapeHtml(player.skill || "Open")}</span>
          </label>
        `).join("")}
      </div>
    `
    : `<div class="empty">No checked-in players are ready for round robin yet.</div>`;
}

function saveRoundManualSelection() {
  if (els.roundPlayerSource.value === "teams") {
    saveRoundTeams();
    return;
  }
  state.roundSettings.selectedPlayerIds = Array.from(els.roundPlayerPicker.querySelectorAll("input[type='checkbox']:checked")).map((input) => input.value);
  saveState();
  renderRoundPlayerPicker();
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
        <option value="${player.id}" ${player.id === selectedId ? "selected" : ""}>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</option>
      `).join("")}
    </select>
  `;
}

function saveRoundTeams() {
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
  if (els.roundPlayerSource.value === "teams") {
    buildTeamRounds();
    return;
  }

  const players = roundEligiblePlayers();
  const courts = Math.max(1, Number(els.courtCount.value) || 1);
  const courtCapacity = courts * 4;
  const roundCount = Math.max(1, Number(els.roundCount.value) || 1);

  if (players.length < 4) {
    document.querySelector("#roundList").innerHTML = `<div class="empty">Select at least 4 checked-in players.</div>`;
    return;
  }

  state.rounds = [];
  let drawBag = shuffle(players);
  const drawNextPlayer = () => {
    if (!drawBag.length) drawBag = shuffle(players);
    return drawBag.shift();
  };

  for (let round = 1; round <= roundCount; round += 1) {
    const roundPlayers = [];
    const slotsThisRound = Math.min(courtCapacity, players.length);
    while (roundPlayers.length < slotsThisRound) {
      const nextPlayer = drawNextPlayer();
      if (!nextPlayer) break;
      roundPlayers.push(nextPlayer);
    }

    const available = [...roundPlayers];
    const matches = [];
    const activeCourts = Math.min(courts, Math.floor(available.length / 4));

    for (let court = 1; court <= activeCourts; court += 1) {
      const group = available.splice(0, 4);
      matches.push({
        court,
        teamA: [group[0].id, group[1].id],
        teamB: [group[2].id, group[3].id],
      });
    }

    const playingIds = new Set(roundPlayers.map((player) => player.id));
    state.rounds.push({
      round,
      rotationStyle: "random",
      matches,
      sitting: players.filter((player) => !playingIds.has(player.id)).map((player) => player.id),
    });
  }

  saveState();
  renderRounds();
}

function buildTeamRounds() {
  saveRoundTeams();
  const courts = Math.max(1, Number(els.courtCount.value) || 1);
  const roundCount = Math.max(1, Number(els.roundCount.value) || 1);
  const teams = getManualRoundTeams();
  const allTeamPlayerIds = teams.flatMap((team) => team.players.map((player) => player.id));
  const duplicatePlayers = allTeamPlayerIds.filter((id, index) => allTeamPlayerIds.indexOf(id) !== index);

  if (teams.length < 2) {
    document.querySelector("#roundList").innerHTML = `<div class="empty">Create at least 2 complete teams before generating team rounds.</div>`;
    return;
  }
  if (duplicatePlayers.length) {
    document.querySelector("#roundList").innerHTML = `<div class="empty">Each player can only be assigned to one team.</div>`;
    return;
  }

  state.rounds = [];
  let teamBag = shuffle(teams);
  const drawNextTeam = () => {
    if (!teamBag.length) teamBag = shuffle(teams);
    return teamBag.shift();
  };

  for (let round = 1; round <= roundCount; round += 1) {
    const roundTeams = [];
    const teamsThisRound = Math.min(courts * 2, teams.length);
    while (roundTeams.length < teamsThisRound) {
      const nextTeam = drawNextTeam();
      if (!nextTeam) break;
      roundTeams.push(nextTeam);
    }

    const availableTeams = [...roundTeams];
    const matches = [];
    for (let court = 1; court <= courts && availableTeams.length >= 2; court += 1) {
      const teamA = availableTeams.shift();
      const teamB = availableTeams.shift();
      matches.push({
        court,
        teamA: teamA.players.map((player) => player.id),
        teamB: teamB.players.map((player) => player.id),
        teamALabel: teamA.name,
        teamBLabel: teamB.name,
      });
    }

    const playingTeamIds = new Set(roundTeams.map((team) => team.id));
    state.rounds.push({
      round,
      rotationStyle: "teams",
      matches,
      sitting: teams.filter((team) => !playingTeamIds.has(team.id)).flatMap((team) => team.players.map((player) => player.id)),
    });
  }

  saveState();
  renderRounds();
}

function getManualRoundTeams() {
  return (state.roundSettings.teams || [])
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
    .filter((team) => team.players.length === 2);
}

function renderRounds() {
  const target = document.querySelector("#roundList");
  renderRoundPlayerPicker();
  target.innerHTML = state.rounds.length
    ? state.rounds.map((round) => `
      <article class="card round-card">
        <div class="round-card-head">
          <div>
            <strong>Round ${round.round}</strong>
            <p class="meta">Random draw bag; repeats only after everyone selected has been used</p>
          </div>
          <button type="button" data-clear-round="${round.round}">Clear Round</button>
        </div>
        ${round.matches.map((match, matchIndex) => `
          <div class="match">
            <p class="meta">Court ${match.court}</p>
            <strong>${names(match.teamA)} vs ${names(match.teamB)}</strong>
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
    `).join("")
    : `<div class="empty">Generate round-robin assignments after check-in.</div>`;
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
    .sort(skillSort);
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
  saveState();
  renderRounds();
}

function seedBracket() {
  const players = checkedPlayers().sort(skillSort);
  if (players.length < 2) {
    document.querySelector("#bracket").innerHTML = `<div class="empty">Check in at least 2 players.</div>`;
    return;
  }

  state.bracket = chunk(players.map((player) => player.id), 2).map((ids, index) => ({
    round: 1,
    match: index + 1,
    players: ids,
    winner: "",
  }));
  saveState();
  renderBracket();
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
      <strong>Bracket Round ${round}</strong>
      ${state.bracket.filter((match) => match.round === round).map((match) => `
        <div class="match">
          <p class="meta">Match ${match.match}</p>
          <strong>${names(match.players)}</strong>
          <select class="winner-select" data-round="${match.round}" data-match="${match.match}">
            <option value="">Select winner</option>
            ${match.players.map((id) => `<option value="${id}" ${match.winner === id ? "selected" : ""}>${names([id])}</option>`).join("")}
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
}

function advanceBracket() {
  const current = Math.max(0, ...state.bracket.map((match) => match.round));
  const matches = state.bracket.filter((match) => match.round === current);
  const winners = matches.map((match) => match.winner).filter(Boolean);

  if (!matches.length || winners.length !== matches.length || winners.length === 1) return;

  chunk(winners, 2).forEach((players, index) => {
    state.bracket.push({ round: current + 1, match: index + 1, players, winner: "" });
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
    ["Tournament discovery", "Published ladder, tournament, and challenge events feed Discover"],
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
  if (!verified) {
    showAdminMessage("#profileList", "notice", "Verify the profile by email or SMS before saving.");
    return;
  }
  const profile = {
    ...data,
    id: existing?.id || newId(),
    sport: state.mode,
    verificationStatus: "Verified",
    verifiedAt: existing?.verifiedAt || new Date().toISOString(),
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
      skill: data.skill,
      waiver: "Needs Signature",
      status: "Profile",
      paid: "Not tracked",
      checkedIn: false,
      sport: state.mode,
    });
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
        <p class="meta">${escapeHtml(profile.phone || "No phone")} | SMS: ${profile.smsSubscriber ? "Yes" : "No"}</p>
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

function renderMatches() {
  const items = buildMatchRecommendations();
  document.querySelector("#matchList").innerHTML = items.length
    ? items.map((item) => `
      <article class="match-card">
        <span class="status-pill">${escapeHtml(item.type)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p class="meta">${escapeHtml(item.meta)}</p>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `).join("")
    : `<div class="empty">Add player profiles or community posts to generate matches.</div>`;
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

function renderTournamentDiscovery() {
  const tournaments = state.events.filter((event) => (event.sport || "pickleball") === state.mode && event.published !== false && /tournament|ladder|challenge/i.test(`${event.format} ${event.name}`));
  document.querySelector("#tournamentDiscoveryList").innerHTML = tournaments.length
    ? tournaments.map((event) => `
      <article class="card tournament-discovery-card">
        <span class="status-pill">Challenge</span>
        <strong>${escapeHtml(event.name)}</strong>
        <p class="meta">${escapeHtml(event.venue)} | ${escapeHtml(event.date)} | ${escapeHtml(event.format)}</p>
        <p>${escapeHtml(event.note || "Published competitive event.")}</p>
      </article>
    `).join("")
    : `<div class="empty">Publish a tournament, ladder, or challenge event to list it here.</div>`;
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
  const headers = ["First Name", "Last Name", "Email", "Phone", "Skill", "Status", "Waiver", "Paid", "Checked In"];
  const rows = (event.players || []).map((player) => [
    player.firstName, player.lastName, player.email, player.phone, player.skill, player.status, player.waiver, player.paid, player.checkedIn ? "Yes" : "No",
  ]);
  downloadText(`${slugify(event.name)}-roster-${todaySlug()}.csv`, [headers, ...rows].map(csvLine).join("\n"), "text/csv");
}

function exportArchivedEventReport(id) {
  const event = state.archivedEvents.find((item) => item.id === id);
  if (!event) return;
  const rows = (event.players || []).map((player) => `
    <tr><td>${escapeHtml(player.firstName)} ${escapeHtml(player.lastName)}</td><td>${escapeHtml(player.email)}</td><td>${escapeHtml(player.status || "")}</td><td>${player.checkedIn ? "Yes" : "No"}</td></tr>
  `).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(event.name)} Report</title><style>body{font-family:Arial,sans-serif;margin:32px;color:#13262e}h1{color:#0b2231}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}.meta{color:#657477}</style></head><body><h1>${escapeHtml(event.name)}</h1><p class="meta">${escapeHtml(event.date)} | ${escapeHtml(event.venue)} | ${escapeHtml(event.format)}</p><p>${event.checkedInCount || 0} checked in / ${event.attendeeCount || 0} saved attendees.</p><table><thead><tr><th>Player</th><th>Email</th><th>Status</th><th>Checked In</th></tr></thead><tbody>${rows}</tbody></table><script>window.print();</script></body></html>`;
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
    const response = await fetch(url.toString(), {
      headers: { "X-Admin-Key": config.adminKey },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
      renderPaddlePintSyncStatus(result.error || `Sync failed with status ${response.status}`, "notice");
      return;
    }

    const stats = importRoundRobinSubmissions(result.submissions || []);
    saveState();
    render();
    renderPaddlePintSyncStatus(`Imported ${stats.playersCreated} player RSVP${stats.playersCreated === 1 ? "" : "s"} into ${stats.eventsTouched} event${stats.eventsTouched === 1 ? "" : "s"} and updated ${stats.profilesTouched} reusable player profile${stats.profilesTouched === 1 ? "" : "s"}. Skipped ${stats.skipped} already-imported submission${stats.skipped === 1 ? "" : "s"}.`, "success");
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
    street: existing?.street || "",
    city: existing?.city || DEFAULT_LOCATION.city,
    state: existing?.state || DEFAULT_LOCATION.state,
    zip: existing?.zip || DEFAULT_LOCATION.zip,
    skill: profile.skill || existing?.skill || "Open",
    availability: existing?.availability || "Flexible",
    interests: Array.from(new Set([...(existing?.interests || []), ...(profile.interests || [])])),
    smsSubscriber: existing?.smsSubscriber || false,
    sport: profile.sport || existing?.sport || "pickleball",
    verificationStatus: existing?.verificationStatus || "Imported",
    verificationMethod: existing?.verificationMethod || "email",
    source: profile.source || existing?.source || "Club Society",
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
  ].map(([firstName, lastName, email, skill, waiver]) => ({ id: newId(), firstName, lastName, email, phone: "", skill, waiver, status: "Checked in", paid: "Paid", eventId, checkedIn: true, sport: "pickleball" }));
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
    skill: row.skill || row.level || "Intermediate",
    waiver: normalizeWaiver(row.waiver || row.signedWaiver),
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
  const headers = ["First Name", "Last Name", "Email", "Phone", "Event", "Skill", "Waiver", "Status", "Paid", "Checked In", "Notes"];
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
    eventName(player.eventId),
    player.skill,
    player.waiver,
    player.status,
    player.paid,
    player.checkedIn ? "Yes" : "No",
    player.notes,
  ]);
  const label = event ? slugify(event.name) : "checked-in-attendees";
  downloadText(`club-society-${label}-${todaySlug()}.csv`, [headers, ...rows].map(csvLine).join("\n"), "text/csv");
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

