username.form.addEventListener("submit", e => e.preventDefault());
const APIURL = "https://api.chess.com/pub/player/"
const playerURL = u => APIURL + u;
const gamesURL = u => playerURL(u) + "/games/archives";
const clubsURL = u => playerURL(u) + "/clubs";
const logMessage = (u, c, n) => "<b>" + u + "</b> has played <b>" + n + "</b> games for <i>" + c + "</i>";
const filename = (u, c) => u + " " + c + ".pgn";
const getJSON = async url => await (await fetch(url)).json();
const getAvatar = async u => (await getJSON(playerURL(u))).avatar;
let logos = {};

async function getClubs(form) {
    avatar.hidden = true;
    const username = form.username,
          club     = form.club;
    const clubs = (await getJSON(clubsURL(username.value))).clubs;
    await Promise.all(clubs.map(async c => logos[c.name] = c.icon));
    while(club.options.length) club.remove(0);
    clubs.map(c => c.name).map(c => club.add(new Option(c, c)));
    getGames(form);
    avatar.src = await getAvatar(username.value);
    avatar.hidden = false;
}

async function getGames(form) {
    logo.hidden = download.hidden = copy.hidden = true;
    const username = form.username.value,
          club     = form.club.value;
    log.textContent = "Loading";
    const monthlist = await getJSON(gamesURL(username));
    const months = [];
    await Promise.all(monthlist.archives.map(async (archive, i) => {
        const json = await getJSON(archive);
        months[i] = json;
    }));
    let games = months.map(month => month.games).flat();
    await Promise.all(games.map(async game => {
        if(game.match) {
            const json = await getJSON(game.match);
            const teams = json.teams;
            game.wanted = [teams.team1.name, teams.team2.name].includes(club);
        }
    }));
    games = games.filter(g => g.wanted).map(g => g.pgn);
    log.innerHTML = logMessage(username, club, games.length);
    copy.disabled = false;
    copybuttontext.textContent = "Copy";
    logo.src = logos[club];
    gamepgns.textContent = games.join("\n");
    download.hidden = copy.hidden = !games.length;
    logo.hidden = false;
}

function downloadpgns() {
    let fileContent = gamepgns.textContent;
    let fileName = filename(username.value, club.value);
    let a = document.createElement("a");
    const blob = new Blob([fileContent], {type: "text/plain"});
    a.setAttribute("download", fileName);
    a.setAttribute("href", window.URL.createObjectURL(blob));
    a.click();
}

function copypgns() {
    copy.disabled = true;
    copybuttontext.textContent = "Copied";
    navigator.clipboard.writeText(gamepgns.value);
}