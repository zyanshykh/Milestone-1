"use strict";
// projects.ts
// Aapke GitHub repos se sirf wo projects dikhata hai jinka "Website" (live link) set hai.
// Naya project deploy karein -> repo ke About mein Website link daalein -> resume khud update.
(() => {
    // ---------- Settings (yahan se control karein) ----------
    const USERNAME = "zyanshykh";
    const MAX_PROJECTS = 6;
    const CACHE_KEY = "gh-live-projects-v1";
    const CACHE_MS = 10 * 60 * 1000; // 10 minute cache, GitHub API limit se bachne ke liye
    const EXCLUDE = ["Milestone-1", USERNAME]; // resume repo khud + profile repo
    const FEATURED = ["ai-dashboard", "quizly-ai"]; // in ko hamesha upar rakhna hai (repo ke naam)
    // Repo ka naam/description badalna ho to yahan likhein. Example:
    // "ai-dashboard": { name: "AI Dashboard", description: "Analytics dashboard with AI insights." }
    const OVERRIDES = {};
    // ---------- Helpers ----------
    // "abc.vercel.app" ko "https://abc.vercel.app" bana deta hai, aur sirf http/https allow karta hai
    function normalizeUrl(raw) {
        const value = raw.trim();
        if (!value)
            return null;
        try {
            const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
            return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
        }
        catch {
            return null;
        }
    }
    function prettify(repoName) {
        const acronyms = ["ai", "ui", "api", "css", "html", "cli"];
        return repoName
            .split(/[-_]+/)
            .filter(Boolean)
            .map((w) => acronyms.includes(w.toLowerCase())
            ? w.toUpperCase()
            : w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    }
    function toProject(repo) {
        if (repo.fork || repo.archived || EXCLUDE.includes(repo.name))
            return null;
        if (!repo.homepage)
            return null;
        const liveUrl = normalizeUrl(repo.homepage);
        if (!liveUrl)
            return null;
        const override = OVERRIDES[repo.name] ?? {};
        const tags = [repo.language, ...(repo.topics ?? [])].filter((t) => Boolean(t));
        return {
            id: repo.name,
            title: override.name ?? prettify(repo.name),
            description: override.description ??
                repo.description ??
                "Description abhi add nahi hui. Repo ke About section mein likhein.",
            liveUrl,
            codeUrl: repo.html_url,
            tags: Array.from(new Set(tags)).slice(0, 4),
            updated: Date.parse(repo.pushed_at) || 0,
        };
    }
    function sortProjects(projects) {
        const rank = (p) => {
            const i = FEATURED.indexOf(p.id);
            return i === -1 ? FEATURED.length : i;
        };
        return [...projects].sort((a, b) => rank(a) - rank(b) || b.updated - a.updated);
    }
    // ---------- Data ----------
    async function loadRepos() {
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const { time, data } = JSON.parse(cached);
                if (Date.now() - time < CACHE_MS)
                    return data;
            }
        }
        catch {
            // cache kharab ho to ignore karein
        }
        const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`, { headers: { Accept: "application/vnd.github+json" } });
        if (!res.ok)
            throw new Error(`GitHub API error: ${res.status}`);
        const data = (await res.json());
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data }));
        }
        catch {
            // storage full/blocked ho to koi masla nahi
        }
        return data;
    }
    // ---------- Rendering (textContent use hota hai, isliye XSS ka risk nahi) ----------
    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className)
            node.className = className;
        if (text !== undefined)
            node.textContent = text;
        return node;
    }
    function link(href, label, className) {
        const a = el("a", className, label);
        a.href = href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        return a;
    }
    function renderProject(p) {
        const li = el("li", "project");
        const head = el("div", "project-head");
        head.append(el("h4", "project-name", p.title));
        const links = el("div", "project-links");
        links.append(link(p.liveUrl, "Live demo", "live-link"), link(p.codeUrl, "Code", "code-link"));
        head.append(links);
        li.append(head, el("p", "project-desc", p.description));
        if (p.tags.length) {
            const tags = el("ul", "project-tags");
            p.tags.forEach((t) => tags.append(el("li", "project-tag", t)));
            li.append(tags);
        }
        return li;
    }
    function showStatus(container, message, withProfileLink = false) {
        container.replaceChildren();
        const p = el("p", "projects-status", message);
        if (withProfileLink) {
            p.append(" ", link(`https://github.com/${USERNAME}`, "GitHub profile kholein", "code-link"));
        }
        container.append(p);
    }
    async function init() {
        const container = document.getElementById("projects-list");
        if (!container)
            return;
        showStatus(container, "Projects load ho rahe hain...");
        try {
            const repos = await loadRepos();
            const projects = sortProjects(repos.map(toProject).filter((p) => p !== null)).slice(0, MAX_PROJECTS);
            if (projects.length === 0) {
                showStatus(container, "Abhi koi live project nahi mila. Repo ke About mein Website link daalein, wo yahan aa jayega.");
                return;
            }
            const list = el("ul", "projects");
            projects.forEach((p) => list.append(renderProject(p)));
            container.replaceChildren(list);
        }
        catch (err) {
            console.error(err);
            showStatus(container, "Projects abhi load nahi ho sake.", true);
        }
    }
    init();
})();
