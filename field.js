(function() {
    var canvas = document.getElementById('field');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, dpr;
    var mouse = { x: -9999, y: -9999 };
    var t = 0;
    var sources = [];
    var mouseRings = [];
    var dots = [];

    function rand(a,b){ return Math.random()*(b-a)+a; }

    var PG = [30, 130, 80];
    var PT = [35, 125, 120];
    var PR = [110, 40, 38];
    var PW = [120, 115, 105];
    var PA = [145, 105, 38];

    var PANELS = {
        tl: [
            'DECOMPOSE v0.1.1',
            'status: ACTIVE',
            'classify: 6 patterns',
            'risk: safety_critical',
            'chunk_size: 2000',
            'irreducible: DETECT',
        ],
        tr: [
            'WAVE FIELD',
            'sources: 6',
            'propagation: RADIAL',
            'interference: NOMINAL',
            'damping: 1/r\u00B2',
            'mode: OBSERVATION',
        ],
        bl: [
            'authority_score =',
            '  min(auth, 5.0)',
            '  * risk_multiplier',
            'PRESERVE_VERBATIM',
            '  if conf >= 0.6',
        ],
    };

    var RING_SPACING = 16;
    var RING_SPEED = 0.32;
    var MAX_RINGS = 45;
    var BASE_ALPHA = 0.055;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeSource(xf, yf, color, phaseOff) {
        var x = W * xf, y = H * yf;
        var maxR = Math.max(W, H) * 0.85;
        var rings = [];
        for (var i = 0; i < MAX_RINGS; i++) {
            rings.push((i * RING_SPACING + phaseOff * RING_SPACING) % maxR);
        }
        return { x:x, y:y, xf:xf, yf:yf, c:color, rings:rings, maxR:maxR };
    }

    function init() {
        resize();
        sources = [
            makeSource(0.15, 0.22, PG, 0),
            makeSource(0.78, 0.18, PG, 2.5),
            makeSource(0.48, 0.48, PT, 1.2),
            makeSource(0.20, 0.75, PG, 3.8),
            makeSource(0.82, 0.62, PG, 1.8),
            makeSource(0.55, 0.88, PG, 4.2),
        ];
        dots = [];
        for (var i = 0; i < 90; i++) {
            dots.push({
                x: rand(0, W), y: rand(0, H),
                phase: rand(0, Math.PI * 2),
                sz: rand(0.4, 1.2),
            });
        }
    }

    var CONSTR = [
        [0, 2], [1, 4], [2, 5], [3, 2], [0, 3], [1, 2],
    ];

    function drawConstructionLines() {
        ctx.lineWidth = 0.4;
        ctx.setLineDash([3, 8]);
        for (var i = 0; i < CONSTR.length; i++) {
            var a = sources[CONSTR[i][0]], b = sources[CONSTR[i][1]];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba('+PR[0]+','+PR[1]+','+PR[2]+',0.06)';
            ctx.stroke();
        }
        var cx = sources[2].x, cy = sources[2].y;
        ctx.beginPath();
        ctx.moveTo(0, cy); ctx.lineTo(W, cy);
        ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
        ctx.strokeStyle = 'rgba('+PR[0]+','+PR[1]+','+PR[2]+',0.03)';
        ctx.stroke();
        ctx.setLineDash([]);
    }

    function drawCrosshairs() {
        ctx.lineWidth = 0.5;
        for (var i = 0; i < sources.length; i++) {
            var S = sources[i];
            var sz = 8;
            ctx.strokeStyle = 'rgba('+S.c[0]+','+S.c[1]+','+S.c[2]+',0.25)';
            ctx.beginPath();
            ctx.moveTo(S.x - sz, S.y); ctx.lineTo(S.x + sz, S.y);
            ctx.moveTo(S.x, S.y - sz); ctx.lineTo(S.x, S.y + sz);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(S.x, S.y, 3, 0, Math.PI * 2);
            ctx.stroke();
            ctx.font = '7px "SF Mono","Consolas",monospace';
            ctx.fillStyle = 'rgba('+S.c[0]+','+S.c[1]+','+S.c[2]+',0.15)';
            ctx.textBaseline = 'top';
            ctx.fillText('S'+(i+1)+' ('+S.xf.toFixed(2)+','+S.yf.toFixed(2)+')', S.x + 10, S.y - 3);
        }
    }

    function drawPanel(x, y, lines, color) {
        var w = 140, h = lines.length * 11 + 10;
        ctx.strokeStyle = 'rgba('+color[0]+','+color[1]+','+color[2]+',0.08)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = 'rgba(8,11,18,0.4)';
        ctx.fillRect(x + 0.5, y + 0.5, w - 1, h - 1);
        ctx.font = '7px "SF Mono","Consolas",monospace';
        ctx.textBaseline = 'top';
        for (var i = 0; i < lines.length; i++) {
            var a = (i === 0) ? 0.22 : 0.14;
            ctx.fillStyle = 'rgba('+color[0]+','+color[1]+','+color[2]+','+a+')';
            ctx.fillText(lines[i], x + 6, y + 5 + i * 11);
        }
    }

    function drawAnnotations() {
        drawPanel(12, 12, PANELS.tl, PG);
        drawPanel(W - 154, 12, PANELS.tr, PG);
        drawPanel(12, H - 70, PANELS.bl, PA);
    }

    function drawDots() {
        for (var i = 0; i < dots.length; i++) {
            var d = dots[i];
            var blink = 0.2 + 0.8 * Math.abs(Math.sin(t * 0.008 + d.phase));
            ctx.fillStyle = 'rgba('+PG[0]+','+PG[1]+','+PG[2]+','+(blink * 0.1).toFixed(4)+')';
            ctx.fillRect(d.x, d.y, d.sz, d.sz);
        }
    }

    function drawMouseRipples() {
        if (mouse.x < 0) return;
        if (t % 6 === 0) mouseRings.push(0);
        ctx.lineWidth = 0.6;
        for (var i = mouseRings.length - 1; i >= 0; i--) {
            mouseRings[i] += 1.8;
            if (mouseRings[i] > 250) { mouseRings.splice(i, 1); continue; }
            var fade = 1 - mouseRings[i] / 250;
            fade = fade * fade;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, mouseRings[i], 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba('+PT[0]+','+PT[1]+','+PT[2]+','+(fade*0.12).toFixed(4)+')';
            ctx.stroke();
        }
    }

    function drawVignette() {
        var r = Math.max(W, H) * 0.75;
        var grd = ctx.createRadialGradient(W/2, H/2, r * 0.4, W/2, H/2, r);
        grd.addColorStop(0, 'rgba(8,11,18,0)');
        grd.addColorStop(1, 'rgba(8,11,18,0.35)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
    }

    function frame() {
        t++;
        ctx.clearRect(0, 0, W, H);

        ctx.lineWidth = 0.5;
        for (var i = 0; i < sources.length; i++) {
            var S = sources[i];
            for (var r = 0; r < S.rings.length; r++) {
                S.rings[r] += RING_SPEED;
                if (S.rings[r] > S.maxR) S.rings[r] -= S.maxR;

                var radius = S.rings[r];
                var fade = 1 - radius / S.maxR;
                fade = Math.pow(fade, 1.3);
                var alpha = fade * BASE_ALPHA;
                if (alpha < 0.003) continue;

                var dx = S.x - mouse.x, dy = S.y - mouse.y;
                var sDist = Math.sqrt(dx*dx + dy*dy);
                var mBoost = 1;
                if (sDist < radius + 60 && sDist > radius - 60) {
                    var ringDist = Math.abs(sDist - radius);
                    if (ringDist < 30) mBoost = 1 + (1 - ringDist / 30) * 2;
                }

                ctx.beginPath();
                ctx.arc(S.x, S.y, radius, 0, Math.PI * 2);
                var a = Math.min(alpha * mBoost, 0.3);
                ctx.strokeStyle = 'rgba('+S.c[0]+','+S.c[1]+','+S.c[2]+','+a.toFixed(4)+')';
                ctx.lineWidth = 0.4 + fade * 0.3;
                ctx.stroke();
            }
        }

        drawConstructionLines();
        drawMouseRipples();
        drawDots();
        drawCrosshairs();
        drawAnnotations();
        drawVignette();

        var whisp = document.getElementById('whisper-text');
        if (whisp) {
            var wr = whisp.getBoundingClientRect();
            if (wr.top < H * 0.85) whisp.classList.add('visible');
        }

        requestAnimationFrame(frame);
    }

    window.addEventListener('mousemove', function(e) { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', function() { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('touchmove', function(e) {
        if (e.touches.length) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
    }, { passive: true });
    window.addEventListener('touchend', function() { mouse.x = -9999; mouse.y = -9999; });

    window.addEventListener('resize', function() { init(); });
    init();
    requestAnimationFrame(frame);
})();
