/* TERMINAL ENGINE */

(function () {
  'use strict';

  const state = {
    cwd: '/home/raphael',
    history: [],
    historyIdx: -1,
    pending: '',
    ready: false,
    typing: false,
  };

  const FS = {
    '/home/raphael': ['about.txt', 'skills/', 'projects/', 'interests/', 'contact/'],
    '/home/raphael/skills': ['languages.txt', 'linux.txt', 'gamedev.txt', 'tools.txt'],
    '/home/raphael/projects': ['arch-config/', 'godot-game/', 'bash-toolkit/', 'consciousness-notes/', 'README.md'],
    '/home/raphael/interests': ['linux.txt', 'philosophy.txt', 'gamedev.txt', 'consciousness.txt', 'storytelling.txt'],
    '/home/raphael/contact': ['links.txt'],
  };

  let output, input, promptDir, body;

  function domReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function cwdDisplay() {
    if (state.cwd === '/home/raphael') return '~';
    return '~' + state.cwd.replace('/home/raphael', '');
  }

  function appendLine(text, cls = '') {
    const span = document.createElement('span');
    span.className = 'term-line' + (cls ? ' ' + cls : '');
    span.innerHTML = text;
    output.appendChild(span);
    scrollBottom();
    return span;
  }

  function appendEmpty() { appendLine('', 'term-line--empty'); }

  function appendPromptEcho(cmd) {
    const div = document.createElement('div');
    div.className = 'term-prompt-echo';
    div.innerHTML =
      `<span class="pe-user">raphael</span>` +
      `<span class="pe-at">@</span>` +
      `<span class="pe-host">arch</span>` +
      `<span class="pe-sep">:</span>` +
      `<span class="pe-dir">${cwdDisplay()}</span>` +
      `<span class="pe-dol">$</span>` +
      `<span class="pe-cmd">${escHtml(cmd)}</span>`;
    output.appendChild(div);
    scrollBottom();
  }

  function scrollBottom() { body.scrollTop = body.scrollHeight; }

  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function typeLines(lines, delay = 30, done) {
    state.typing = true;
    input.disabled = true;
    let i = 0;
    function next() {
      if (i >= lines.length) {
        state.typing = false;
        input.disabled = false;
        input.focus({ preventScroll: true });
        if (done) done();
        return;
      }
      const [text, cls, pause] = lines[i++];
      if (text === null) appendEmpty();
      else appendLine(text, cls);
      setTimeout(next, pause || delay);
    }
    next();
  }

  const ASCII_ART = [
    '   ███████╗██╗   ██╗██╗   ██╗ █████╗ ███████╗██╗  ██╗',
    '   ██╔════╝██║   ██║╚██╗ ██╔╝██╔══██╗██╔════╝██║  ██║',
    '   ███████╗██║   ██║ ╚████╔╝ ███████║███████╗███████║',
    '   ╚════██║██║   ██║  ╚██╔╝  ██╔══██║╚════██║██╔══██║',
    '   ███████║╚██████╔╝   ██║   ██║  ██║███████║██║  ██║',
    '   ╚══════╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝',
  ];

  function neofetch() {
    const lines = [];
    ASCII_ART.forEach(row => { lines.push([row, 'term-line--ascii', 18]); });
    lines.push([null, '', 8]);

    const neoRows = [
      ['suyash<span style="color:var(--term-dim)">@</span><span style="color:var(--accent-cyan)">arch</span>', ''],
      ['──────────────────────────────', 'term-line--dim'],
      null,
      ['OS',       'Arch Linux x86_64'],
      ['Kernel',   'linux (latest-stable)'],
      ['WM',       'Hyprland (Wayland)'],
      ['Shell',    'bash'],
      ['Terminal', 'kitty'],
      ['Editor',   'neovim'],
      null,
      ['Role',     'Student Developer'],
      ['Focus',    'Systems · Game Dev · Philosophy'],
      ['Languages','C# · GDScript · Python · Bash'],
      ['Uptime',   'Still learning, still building...'],
      null,
      ['GitHub',   '<a href="https://github.com/suyashnamdeo" target="_blank" rel="noopener" style="color:var(--accent-cyan);text-decoration:underline">github.com/suyashnamdeo</a>'],
      null,
    ];

    neoRows.forEach(row => {
      if (row === null) { lines.push([null, '', 10]); }
      else if (row[1] === '') { lines.push([row[0], 'term-line--neo-key', 20]); }
      else {
        const html =
          `<span class="neo-key" style="color:var(--accent-pink);font-weight:700;min-width:110px;display:inline-block">${row[0]}</span>` +
          `<span style="color:var(--term-dim)"> : </span>` +
          `<span style="color:var(--term-text)">${row[1]}</span>`;
        lines.push([html, 'term-neo-row', 20]);
      }
    });

    const swatches =
      `<span style="color:var(--accent-pink)">████</span>` +
      `<span style="color:var(--accent-cyan)">████</span>` +
      `<span style="color:var(--accent-purple)">████</span>` +
      `<span style="color:var(--accent-green)">████</span>` +
      `<span style="color:var(--accent-amber)">████</span>`;
    lines.push([swatches, '', 25]);
    lines.push([null, '', 8]);

    typeLines(lines, 20);
  }

  const COMMANDS = {
    help() {
      const lines = [
        [null],
        ['<span style="color:var(--accent-pink);font-weight:700">Available Commands</span>', '', 0],
        ['────────────────────────────────────────', 'term-line--dim', 0],
        [null],
        [fmt('neofetch', 'Display system profile'), '', 0],
        [fmt('whoami',   'Who is Suyash?'), '', 0],
        [fmt('about',    'About me'), '', 0],
        [fmt('skills',   'Technical skills'), '', 0],
        [fmt('projects', 'Things I have built'), '', 0],
        [fmt('interests','What drives me'), '', 0],
        [fmt('focus',    'Current learning goals'), '', 0],
        [fmt('github',   'Open GitHub'), '', 0],
        [fmt('contact',  'Get in touch'), '', 0],
        [null],
        [fmt('ls',       'List files'), '', 0],
        [fmt('pwd',      'Print working dir'), '', 0],
        [fmt('cd <dir>', 'Change directory'), '', 0],
        [fmt('cat <file>','Read a file'), '', 0],
        [fmt('clear',    'Clear terminal'), '', 0],
        [null],
        ['<span style="color:var(--term-comment)"># Use arrow keys for history</span>', '', 0],
        [null],
      ];
      typeLines(lines, 12);
      function fmt(cmd, desc) {
        return `  <span style="color:var(--accent-cyan);font-weight:500;display:inline-block;min-width:140px">${escHtml(cmd)}</span><span style="color:var(--text-secondary)"> ${desc}</span>`;
      }
    },

    whoami() {
      const lines = [
        [null],
        ['<span style="color:var(--accent-pink);font-weight:700">suyash namdeo</span>', '', 0],
        [null],
        ['<span style="color:var(--term-text)">Linux-first developer, system thinker, game dev explorer.</span>', '', 0],
        ['<span style="color:var(--term-text)">Daily-driving Arch Linux with Hyprland.</span>', '', 0],
        [null],
        ['<span style="color:var(--term-comment)"># "Learn deeply. Build patiently. Question everything."</span>', '', 0],
        [null],
      ];
      typeLines(lines, 16);
    },

    about() {
      const lines = [
        [null],
        ['<span style="color:var(--accent-cyan);font-weight:700">── About ──</span>', '', 0],
        [null],
        ['<span style="color:var(--term-text)">Raphael — Student &amp; developer who treats understanding as the primary goal.</span>', '', 0],
        ['<span style="color:var(--term-text)">Arch Linux daily driver. Configure everything by hand.</span>', '', 0],
        [null],
        ['<span style="color:var(--accent-pink)">Learning style:</span>', '', 0],
        ['<span style="color:var(--term-text)">  · Fundamentals first</span>', '', 0],
        ['<span style="color:var(--term-text)">  · Learn by building &amp; breaking</span>', '', 0],
        ['<span style="color:var(--term-text)">  · Question defaults</span>', '', 0],
        [null],
      ];
      typeLines(lines, 16);
    },

    skills() {
      const lines = [
        [null],
        ['<span style="color:var(--accent-cyan);font-weight:700">── Skills ──</span>', '', 0],
        [null],
        ['<span style="color:var(--accent-pink)">Languages</span>', '', 0],
        ['<span style="color:var(--term-text)">  C# · GDScript · Python · Bash</span>', '', 0],
        [null],
        ['<span style="color:var(--accent-pink)">Linux &amp; OS</span>', '', 0],
        ['<span style="color:var(--term-text)">  Arch · Hyprland · Wayland · Git · Neovim</span>', '', 0],
        [null],
        ['<span style="color:var(--accent-pink)">Game Dev</span>', '', 0],
        ['<span style="color:var(--term-text)">  Godot 4 · Narrative Design · Mechanics</span>', '', 0],
        [null],
      ];
      typeLines(lines, 14);
    },

    projects() {
      const lines = [
        [null],
        ['<span style="color:var(--accent-cyan);font-weight:700">── Projects ──</span>', '', 0],
        [null],
        projLine('01', 'Hyprland Dotfiles',         'Arch setup from scratch', '#87B5BE'),
        projLine('02', 'Narrative Game Prototype',   'Godot 4 story game', '#9B86B5'),
        projLine('03', 'Bash Toolkit',               'Shell scripts', '#E5D8CF'),
        projLine('04', 'Consciousness Notes',        'Philosophy repo', '#7ec8a4'),
        [null],
        [`<span style="color:var(--term-comment)"># </span><a href="https://github.com/suyashnamdeo" target="_blank" rel="noopener" style="color:var(--accent-cyan)">github.com/suyashnamdeo</a>`, '', 0],
        [null],
      ];
      typeLines(lines, 16);
      function projLine(num, name, desc, col) {
        return [`  <span style="color:${col};font-weight:700">[${num}]</span> <span style="font-weight:600">${name}</span><span style="color:var(--term-comment)"> — ${desc}</span>`, '', 0];
      }
    },

    interests() {
      const lines = [
        [null],
        ['<span style="color:var(--accent-cyan);font-weight:700">── Interests ──</span>', '', 0],
        [null],
        [`  <span style="color:var(--accent-pink)">❯</span> <span style="font-weight:600">Linux &amp; Systems</span>`, '', 0],
        [`  <span style="color:var(--accent-pink)">❯</span> <span style="font-weight:600">Programming</span>`, '', 0],
        [`  <span style="color:var(--accent-pink)">❯</span> <span style="font-weight:600">Game Development</span>`, '', 0],
        [`  <span style="color:var(--accent-pink)">❯</span> <span style="font-weight:600">Philosophy</span>`, '', 0],
        [`  <span style="color:var(--accent-pink)">❯</span> <span style="font-weight:600">Consciousness</span>`, '', 0],
        [`  <span style="color:var(--accent-pink)">❯</span> <span style="font-weight:600">Storytelling &amp; Lore</span>`, '', 0],
        [`  <span style="color:var(--accent-pink)">❯</span> <span style="font-weight:600">Customization</span>`, '', 0],
        [`  <span style="color:var(--accent-pink)">❯</span> <span style="font-weight:600">Optimization</span>`, '', 0],
        [null],
      ];
      typeLines(lines, 14);
    },

    focus() {
      const lines = [
        [null],
        ['<span style="color:var(--accent-cyan);font-weight:700">── Current Focus ──</span>', '', 0],
        [null],
        [`<span style="color:var(--accent-green)">●</span> Strengthening Fundamentals`, '', 0],
        [`<span style="color:var(--accent-green)">●</span> Completing a Meaningful Game`, '', 0],
        [`<span style="color:var(--accent-green)">●</span> Exploring Consciousness`, '', 0],
        [`<span style="color:var(--accent-amber)">○</span> Low-Level Exploration`, '', 0],
        [null],
      ];
      typeLines(lines, 16);
    },

    contact() {
      const lines = [
        [null],
        ['<span style="color:var(--accent-cyan);font-weight:700">── Contact ──</span>', '', 0],
        [null],
        [`  GitHub → <a href="https://github.com/raphael2517" target="_blank" rel="noopener" style="color:var(--accent-cyan)">github.com/raphael2517</a>`, '', 0],
        [`  Email  → <a href="mailto:raphael.prototype@gmail.com" style="color:var(--accent-cyan)">raphael.prototype@gmail.com</a>`, '', 0],
        [`  Phone  → <span style="color:var(--accent-cyan)">+91-9179886147 (call only)</span>`, '', 0],
        [null],
      ];
      typeLines(lines, 18);
    },

    github() {
      window.open('https://github.com/raphael2517', '_blank', 'noopener');
      typeLines([[null], ['<span style="color:var(--accent-green)">Opening GitHub...</span>', '', 0], [null]], 20);
    },

    pwd() {
      typeLines([[null], [`<span style="color:var(--term-text)">${escHtml(state.cwd)}</span>`, '', 0], [null]], 15);
    },

    ls() {
      const dir = state.cwd;
      const entries = FS[dir] || [];
      if (entries.length === 0) {
        typeLines([[null], ['<span style="color:var(--term-comment)">empty</span>', '', 0], [null]], 15);
        return;
      }
      const items = entries.map(e => {
        const isDir = e.endsWith('/');
        if (isDir) return `<span style="color:var(--accent-cyan);font-weight:600">${escHtml(e)}</span>`;
        return `<span style="color:var(--term-text)">${escHtml(e)}</span>`;
      });
      typeLines([[null], [items.join('  '), '', 0], [null]], 12);
    },

    cd(args) {
      const target = (args || '').trim();
      if (!target || target === '~') {
        state.cwd = '/home/raphael';
        promptDir.textContent = cwdDisplay();
        typeLines([[null], ['<span style="color:var(--term-comment)">changed to ~</span>', '', 0], [null]], 15);
        return;
      }
      if (target === '..') {
        if (state.cwd === '/home/raphael') {
          typeLines([[null], ['<span style="color:var(--term-comment)">already at home</span>', '', 0], [null]], 15);
          return;
        }
        const parts = state.cwd.split('/');
        parts.pop();
        state.cwd = parts.join('/') || '/';
        promptDir.textContent = cwdDisplay();
        typeLines([[null], [`<span style="color:var(--term-comment)">changed to ${cwdDisplay()}</span>`, '', 0], [null]], 15);
        return;
      }
      const base = target.replace(/\/$/, '');
      let newPath = base.startsWith('/') ? base : state.cwd.replace(/\/$/, '') + '/' + base;
      if (FS[newPath] !== undefined) {
        state.cwd = newPath;
        promptDir.textContent = cwdDisplay();
        typeLines([[null], [`<span style="color:var(--term-comment)">changed to ${cwdDisplay()}</span>`, '', 0], [null]], 15);
      } else {
        typeLines([[null], [`<span style="color:#ff6b6b">cd: ${escHtml(target)}: No such directory</span>`, '', 0], [null]], 15);
      }
    },

    cat(args) {
      const file = (args || '').trim();
      const catFiles = {
        'about.txt': ['Name: Suyash Namdeo', 'OS: Arch Linux', 'Role: Student Developer', '', 'Learn deeply. Build patiently. Question everything.'],
        'README.md': ['# Suyash Namdeo — Projects', '', 'Things I built while learning.', '', 'github.com/suyashnamdeo'],
      };
      const fileBase = file.split('/').pop();
      const data = catFiles[fileBase];
      if (data) {
        const lines = [[null]];
        data.forEach(line => { lines.push([line === '' ? null : `<span style="color:var(--term-text)">${line}</span>`, '', 0]); });
        lines.push([null]);
        typeLines(lines, 14);
      } else if (!file) {
        typeLines([[null], ['<span style="color:#ff6b6b">cat: missing operand</span>', '', 0], [null]], 15);
      } else {
        typeLines([[null], [`<span style="color:#ff6b6b">cat: ${escHtml(fileBase)}: No such file</span>`, '', 0], [null]], 15);
      }
    },

    clear() { output.innerHTML = ''; },

    exit() {
      typeLines([[null], ['<span style="color:var(--term-comment)">Thanks for visiting. Keep building.</span>', '', 0], [null]], 20);
    },

    neofetch() { neofetch(); },
  };

  function dispatch(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    appendPromptEcho(trimmed);
    if (trimmed !== state.history[0]) {
      state.history.unshift(trimmed);
      if (state.history.length > 100) state.history.pop();
    }
    state.historyIdx = -1;
    state.pending = '';
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');
    if (COMMANDS[cmd]) COMMANDS[cmd](args);
    else {
      typeLines([
        [null],
        [`<span style="color:#ff6b6b">bash: ${escHtml(cmd)}: command not found</span>`, '', 0],
        ['<span style="color:var(--term-comment)">type help for commands</span>', '', 0],
        [null],
      ], 15);
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      dispatch(val);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (state.history.length === 0) return;
      if (state.historyIdx === -1) state.pending = input.value;
      state.historyIdx = Math.min(state.historyIdx + 1, state.history.length - 1);
      input.value = state.history[state.historyIdx];
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.historyIdx <= 0) {
        state.historyIdx = -1;
        input.value = state.pending;
        return;
      }
      state.historyIdx--;
      input.value = state.history[state.historyIdx];
      return;
    }
    if (e.key === 'Tab') { e.preventDefault(); return; }
    if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); COMMANDS.clear(); return; }
    if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); appendPromptEcho(input.value + '^C'); input.value = ''; appendEmpty(); }
  }

  function onBodyClick() { input.focus(); }

  function initToolbar() {
    const clearBtn = document.getElementById('termClear');
    const helpBtn  = document.getElementById('termHelp');
    if (clearBtn) clearBtn.addEventListener('click', () => { COMMANDS.clear(); input.focus(); });
    if (helpBtn)  helpBtn.addEventListener('click',  () => { COMMANDS.help(); input.focus(); });
  }

  function startup() {
    const intro = [
      ['<span style="color:var(--term-comment)">Welcome. Type help to get started.</span>', '', 25],
      [null, '', 15],
    ];
    typeLines(intro, 20, () => COMMANDS.neofetch());
  }

  function init() {
    output     = document.getElementById('terminalOutput');
    input      = document.getElementById('terminalInput');
    promptDir  = document.getElementById('promptDir');
    body       = document.getElementById('terminalBody');
    if (!output || !input || !body) return;
    input.addEventListener('keydown', onKeyDown);
    body.addEventListener('click', onBodyClick);
    initToolbar();
    setTimeout(startup, 600);
    state.ready = true;
  }

  domReady(init);
})();
