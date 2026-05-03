/* Sparkly cursor trail — soft pink glow + twinkling 4-point star sparkles.
   Desktop only; skipped on touch devices and reduced-motion users. */
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    var canvas = document.createElement('canvas');
    canvas.id = 'cursor-trail-canvas';
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9998;';
    var ctx;
    var dpr = window.devicePixelRatio || 1;

    function sizeCanvas() {
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function start() {
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');
        sizeCanvas();
        requestAnimationFrame(loop);
    }

    var particles = [];
    var MAX_PARTICLES = 120;
    var lastX = -1, lastY = -1;
    var lastSpawn = 0;

    function spawn(x, y) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        // Soft glow puff (smaller, fewer)
        if (Math.random() < 0.6) {
            particles.push({
                type: 'glow',
                x: x + (Math.random() - 0.5) * 6,
                y: y + (Math.random() - 0.5) * 6,
                size: 3 + Math.random() * 5,
                life: 1
            });
        }
        // Sparkle (4-point star) — occasional, single
        if (Math.random() < 0.22) {
            particles.push({
                type: 'sparkle',
                x: x + (Math.random() - 0.5) * 22,
                y: y + (Math.random() - 0.5) * 22,
                size: 3 + Math.random() * 4,
                rot: Math.random() * Math.PI,
                rotSpeed: (Math.random() - 0.5) * 0.04,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.16 + Math.random() * 0.16,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4 - 0.1,
                life: 1
            });
        }
    }

    document.addEventListener('mousemove', function (e) {
        var x = e.clientX, y = e.clientY;
        if (lastX < 0) { lastX = x; lastY = y; }
        var dx = x - lastX, dy = y - lastY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var now = performance.now();
        // Spawn less often: bigger min distance + longer cooldown
        if (dist > 8 && now - lastSpawn > 32) {
            spawn(x, y);
            lastSpawn = now;
        }
        lastX = x; lastY = y;
    }, { passive: true });

    // Draw a 4-point sparkle (cross/twinkle) using gradients for soft tips
    function drawSparkle(p, rgb, alpha) {
        var s = p.size;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalCompositeOperation = 'lighter';

        // Long axis (horizontal)
        var gH = ctx.createLinearGradient(-s, 0, s, 0);
        gH.addColorStop(0,   'rgba(' + rgb + ',0)');
        gH.addColorStop(0.5, 'rgba(' + rgb + ',' + alpha + ')');
        gH.addColorStop(1,   'rgba(' + rgb + ',0)');
        ctx.fillStyle = gH;
        ctx.beginPath();
        ctx.moveTo(-s, 0);
        ctx.lineTo(0, -s * 0.18);
        ctx.lineTo(s, 0);
        ctx.lineTo(0,  s * 0.18);
        ctx.closePath();
        ctx.fill();

        // Cross axis (vertical)
        var gV = ctx.createLinearGradient(0, -s, 0, s);
        gV.addColorStop(0,   'rgba(' + rgb + ',0)');
        gV.addColorStop(0.5, 'rgba(' + rgb + ',' + alpha + ')');
        gV.addColorStop(1,   'rgba(' + rgb + ',0)');
        ctx.fillStyle = gV;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo( s * 0.18, 0);
        ctx.lineTo(0,  s);
        ctx.lineTo(-s * 0.18, 0);
        ctx.closePath();
        ctx.fill();

        // Bright white-ish core
        var core = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.55);
        core.addColorStop(0, 'rgba(255,255,255,' + Math.min(1, alpha * 1.6) + ')');
        core.addColorStop(0.4, 'rgba(' + rgb + ',' + alpha + ')');
        core.addColorStop(1, 'rgba(' + rgb + ',0)');
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function loop() {
        if (!ctx) return requestAnimationFrame(loop);
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        var isLight = document.documentElement.classList.contains('light-mode');
        // Dark mode: warm pink #e8a0b8 → 232,160,184
        // Light mode: rose #8b475d → 139,71,93
        var rgb = isLight ? '139,71,93' : '232,160,184';

        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            if (p.type === 'sparkle') {
                p.life -= 0.022;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                p.x += p.vx; p.y += p.vy;
                p.rot += p.rotSpeed;
                p.twinkle += p.twinkleSpeed;
                // Twinkle: oscillating brightness multiplied by life envelope
                var tw = 0.5 + 0.5 * Math.abs(Math.sin(p.twinkle));
                var alpha = 0.45 * p.life * tw;
                drawSparkle(p, rgb, alpha);
            } else {
                p.life -= 0.018;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                var size = p.size * (0.4 + 0.6 * p.life);
                var a = 0.18 * p.life;
                var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
                g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')');
                g.addColorStop(1, 'rgba(' + rgb + ',0)');
                ctx.fillStyle = g;
                ctx.globalCompositeOperation = 'source-over';
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalCompositeOperation = 'source-over';
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', sizeCanvas);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
