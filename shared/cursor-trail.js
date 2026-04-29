/* Subtle cursor trail — soft pink glow particles that fade out.
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
    var MAX_PARTICLES = 150;
    var lastX = -1, lastY = -1;
    var lastSpawn = 0;

    function spawn(x, y) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            size: 4 + Math.random() * 8,
            life: 1
        });
    }

    document.addEventListener('mousemove', function (e) {
        var x = e.clientX, y = e.clientY;
        if (lastX < 0) { lastX = x; lastY = y; }
        var dx = x - lastX, dy = y - lastY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var now = performance.now();
        if (dist > 4 && now - lastSpawn > 16) {
            spawn(x, y);
            lastSpawn = now;
        }
        lastX = x; lastY = y;
    }, { passive: true });

    function loop() {
        if (!ctx) return requestAnimationFrame(loop);
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        var isLight = document.documentElement.classList.contains('light-mode');
        // Dark mode: warm pink #e8a0b8 → 232,160,184
        // Light mode: rose #8b475d → 139,71,93
        var rgb = isLight ? '139,71,93' : '232,160,184';

        for (var i = particles.length - 1; i >= 0; i--) {
            var p = particles[i];
            p.life -= 0.012;
            if (p.life <= 0) { particles.splice(i, 1); continue; }
            var size = p.size * (0.4 + 0.6 * p.life);
            var alpha = 0.35 * p.life;
            // Soft glow via radial gradient
            var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
            g.addColorStop(0, 'rgba(' + rgb + ',' + alpha + ')');
            g.addColorStop(1, 'rgba(' + rgb + ',0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(loop);
    }

    window.addEventListener('resize', sizeCanvas);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
