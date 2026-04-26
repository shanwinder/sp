// File: assets/js/algorithm_game/stage_algorithm_2.js
// ด่านที่ 2: เก็บของตามลำดับ — 3 ด่านย่อย (แก้ไขคำตอบ + ขนาดตัวอักษร)
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const W = 950, H = 620;
        const config = {
            type: Phaser.AUTO,
            scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
            parent: "game-container",
            scene: { preload: preload, create: create }
        };

        // ด่านย่อย 3 ด่าน — ตรวจสอบคำตอบแล้ว
        // ย่อย 1: F,C,F,F,C = 5 คำสั่ง, 5 ช่อง ✅
        // ย่อย 2: F,C,F,F,F,F,C = 7 คำสั่ง, 7 ช่อง ✅
        // ย่อย 3: F,F,C,F,F,C,F,F,C = 9 คำสั่ง, 9 ช่อง ✅
        const problems = [
            { cols: 4, maxSlots: 5,
              items: [
                  { id: "book", icon: "📘", name: "หนังสือ", col: 1 },
                  { id: "pencil", icon: "✏️", name: "ดินสอ", col: 3 }
              ],
              order: ["book", "pencil"]
            },
            { cols: 6, maxSlots: 7,
              items: [
                  { id: "pencil", icon: "✏️", name: "ดินสอ", col: 1 },
                  { id: "bag", icon: "🎒", name: "กระเป๋า", col: 5 }
              ],
              order: ["pencil", "bag"]
            },
            { cols: 7, maxSlots: 9,
              items: [
                  { id: "book", icon: "📘", name: "หนังสือ", col: 2 },
                  { id: "pencil", icon: "✏️", name: "ดินสอ", col: 4 },
                  { id: "bag", icon: "🎒", name: "กระเป๋า", col: 6 }
              ],
              order: ["book", "pencil", "bag"]
            }
        ];

        const BLOCKS = {
            forward: { emoji: "⬆️", label: "เดินหน้า", color: 0x3b82f6 },
            collect: { emoji: "🤲", label: "เก็บของ", color: 0xf59e0b }
        };

        let startTime, totalAttempts = 0, currentProblem = 0;
        let robot, dropZones = [], placedBlocks = [];
        let isExecuting = false, problemGroup;
        let itemSprites = {}, collectedItems = [];
        const CELL = 100;
        const MAP_Y = 160;

        function preload() {
            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
        }

        function create() {
            const scene = this;
            startTime = Date.now();
            totalAttempts = 0;
            currentProblem = 0;

            // BG
            scene.add.graphics().fillGradientStyle(0xecfeff, 0xecfeff, 0xfef3c7, 0xfef3c7, 1).fillRect(0, 0, W, H).setDepth(-2);
            // Map area
            scene.add.graphics().fillStyle(0xffffff, 0.85).fillRoundedRect(20, 50, W - 40, 185, 16).setDepth(-1);
            // Command area
            scene.add.graphics().fillStyle(0xfef3c7, 0.85).fillRoundedRect(20, 250, W - 40, H - 265, 16).setDepth(-1);

            createButtons(scene);
            setupDrag(scene);
            renderProblem(scene);
        }

        function createButtons(scene) {
            scene.clearBtn = makeBtn(scene, 170, 575, 160, 50, 0xef4444, "🗑️ ล้างคำสั่ง", () => { if (!isExecuting) clearAll(scene); });
            scene.testBtn = makeBtn(scene, 780, 575, 180, 50, 0x22c55e, "▶ ทดสอบคำสั่ง", () => { if (!isExecuting) executeCommands(scene); });
        }
        function makeBtn(scene, x, y, w, h, color, label, cb) {
            const g = scene.add.graphics().fillStyle(color, 1).fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
            g.setInteractive(new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h), Phaser.Geom.Rectangle.Contains);
            g.on('pointerdown', cb).on('pointerover', () => g.setAlpha(0.85)).on('pointerout', () => g.setAlpha(1));
            scene.add.text(x, y, label, { fontSize: '22px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' }).setOrigin(0.5);
            return g;
        }

        // ==================== Render ====================
        function renderProblem(scene) {
            if (problemGroup) problemGroup.clear(true, true);
            if (scene.trackerGroup) scene.trackerGroup.clear(true, true);
            problemGroup = scene.add.group();
            dropZones = [];
            placedBlocks.forEach(b => { if (b && b.active) { const v = b.getData('visual'); if (v && v.active) v.destroy(); b.destroy(); } });
            placedBlocks = []; collectedItems = []; itemSprites = {};

            const prob = problems[currentProblem];
            const mapStartX = (W - prob.cols * CELL) / 2 + CELL / 2;

            // Title + mission
            const orderStr = prob.items.map(it => it.icon + " " + it.name).join(" → ");
            problemGroup.add(scene.add.text(W / 2, 65, `ภารกิจที่ ${currentProblem + 1} จาก ${problems.length}`, {
                fontSize: '24px', color: '#0369a1', fontFamily: 'Kanit', fontStyle: 'bold'
            }).setOrigin(0.5, 0));
            problemGroup.add(scene.add.text(W / 2, 95, `เก็บตามลำดับ: ${orderStr}`, {
                fontSize: '20px', color: '#92400e', fontFamily: 'Kanit'
            }).setOrigin(0.5, 0));

            // Grid
            for (let c = 0; c < prob.cols; c++) {
                const cx = mapStartX + c * CELL;
                problemGroup.add(scene.add.graphics().fillStyle(0xf1f5f9, 1).fillRoundedRect(cx - 42, MAP_Y - 42, 84, 84, 10)
                    .lineStyle(2, 0x94a3b8).strokeRoundedRect(cx - 42, MAP_Y - 42, 84, 84, 10));
            }

            // Robot
            robot = scene.add.text(mapStartX, MAP_Y, "🤖", { fontSize: '52px' }).setOrigin(0.5).setAngle(90);
            robot.setData({ col: 0, mapStartX: mapStartX });
            problemGroup.add(robot);

            // Items
            prob.items.forEach(item => {
                const sp = scene.add.text(mapStartX + item.col * CELL, MAP_Y, item.icon, { fontSize: '44px' }).setOrigin(0.5);
                itemSprites[item.id] = sp;
                problemGroup.add(sp);
            });

            // Tracker
            renderTracker(scene);

            // Drop zones
            const slotW = 74, slotPad = 8;
            const numSlots = prob.maxSlots;
            const totalSW = numSlots * slotW + (numSlots - 1) * slotPad;
            const slotStartX = (W - totalSW) / 2 + slotW / 2;
            const slotY = 480;

            for (let i = 0; i < numSlots; i++) {
                const sx = slotStartX + i * (slotW + slotPad);
                const outline = scene.add.graphics().lineStyle(3, 0x94a3b8).strokeRoundedRect(sx - slotW / 2, slotY - slotW / 2, slotW, slotW, 8);
                problemGroup.add(outline);
                problemGroup.add(scene.add.text(sx, slotY - slotW / 2 - 14, `${i + 1}`, { fontSize: '16px', color: '#64748b', fontFamily: 'Kanit' }).setOrigin(0.5));
                const zone = scene.add.zone(sx, slotY, slotW, slotW).setRectangleDropZone(slotW, slotW);
                zone.setData({ isFilled: false, outline: outline, command: null, slotW: slotW });
                problemGroup.add(zone);
                dropZones.push(zone);
            }

            // Command blocks
            const keys = Object.keys(BLOCKS);
            const bGap = 160, bStartX = (W - (keys.length - 1) * bGap) / 2, bY = 350;
            keys.forEach((key, idx) => {
                const bx = bStartX + idx * bGap;
                problemGroup.add(drawBlock(scene, bx, bY, BLOCKS[key], 0.35).container);
                spawnDraggable(scene, bx, bY, key);
            });
        }

        function renderTracker(scene) {
            if (scene.trackerGroup) scene.trackerGroup.clear(true, true);
            scene.trackerGroup = scene.add.group();
            const prob = problems[currentProblem];
            const gap = 110;
            const startX = W / 2 - ((prob.items.length - 1) * gap) / 2;
            const ty = 268;
            scene.trackerGroup.add(scene.add.text(W / 2, ty - 25, "🧩 สถานะการเก็บของ:", { fontSize: '18px', color: '#92400e', fontFamily: 'Kanit' }).setOrigin(0.5));
            prob.items.forEach((item, idx) => {
                const x = startX + idx * gap;
                const done = collectedItems.includes(item.id);
                scene.trackerGroup.add(scene.add.text(x, ty + 5, item.icon + (done ? " ✅" : " ⬜"), { fontSize: '26px', fontFamily: 'Kanit' }).setOrigin(0.5));
                if (idx < prob.items.length - 1) {
                    scene.trackerGroup.add(scene.add.text(x + gap / 2, ty + 5, "→", { fontSize: '24px', color: '#94a3b8' }).setOrigin(0.5));
                }
            });
        }

        // ==================== Blocks ====================
        const BLK_SIZE = 68;
        function drawBlock(scene, x, y, def, alpha) {
            const container = scene.add.container(x, y);
            container.add(scene.add.graphics().fillStyle(def.color, alpha || 1).fillRoundedRect(-BLK_SIZE / 2, -BLK_SIZE / 2, BLK_SIZE, BLK_SIZE, 10));
            container.add(scene.add.text(0, -8, def.emoji, { fontSize: '30px' }).setOrigin(0.5));
            container.add(scene.add.text(0, 24, def.label, { fontSize: '14px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' }).setOrigin(0.5));
            return { container };
        }
        function spawnDraggable(scene, ox, oy, key) {
            const def = BLOCKS[key];
            const handle = scene.add.rectangle(ox, oy, BLK_SIZE, BLK_SIZE, def.color).setInteractive({ useHandCursor: true, draggable: true }).setAlpha(0.001);
            const vis = scene.add.container(ox, oy);
            vis.add(scene.add.graphics().fillStyle(def.color, 1).fillRoundedRect(-BLK_SIZE / 2, -BLK_SIZE / 2, BLK_SIZE, BLK_SIZE, 10).lineStyle(2, 0xffffff, 0.5).strokeRoundedRect(-BLK_SIZE / 2, -BLK_SIZE / 2, BLK_SIZE, BLK_SIZE, 10));
            vis.add(scene.add.text(0, -8, def.emoji, { fontSize: '30px' }).setOrigin(0.5));
            vis.add(scene.add.text(0, 24, def.label, { fontSize: '14px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' }).setOrigin(0.5));
            handle.setData({ value: key, originalX: ox, originalY: oy, visual: vis, currentZone: null });
            scene.input.setDraggable(handle);
            placedBlocks.push(handle);
        }

        // ==================== Drag ====================
        function setupDrag(scene) {
            scene.input.on('dragstart', (p, obj) => {
                if (isExecuting) return;
                scene.children.bringToTop(obj.getData('visual'));
                scene.children.bringToTop(obj);
                const cz = obj.getData('currentZone');
                if (cz) {
                    const sw = cz.getData('slotW');
                    cz.setData('isFilled', false); cz.setData('command', null);
                    cz.getData('outline').clear().lineStyle(3, 0x94a3b8).strokeRoundedRect(cz.x - sw / 2, cz.y - sw / 2, sw, sw, 8);
                    obj.setData('currentZone', null);
                } else {
                    spawnDraggable(scene, obj.getData('originalX'), obj.getData('originalY'), obj.getData('value'));
                }
            });
            scene.input.on('drag', (p, obj, dx, dy) => {
                if (isExecuting) return;
                obj.x = dx; obj.y = dy; obj.getData('visual').x = dx; obj.getData('visual').y = dy;
            });
            scene.input.on('drop', (p, obj, zone) => {
                if (isExecuting) return;
                const sw = zone.getData('slotW');
                if (!zone.getData('isFilled')) {
                    obj.x = zone.x; obj.y = zone.y; obj.getData('visual').x = zone.x; obj.getData('visual').y = zone.y;
                    zone.setData('isFilled', true); zone.setData('command', obj.getData('value'));
                    zone.getData('outline').clear().lineStyle(4, 0x3b82f6).strokeRoundedRect(zone.x - sw / 2, zone.y - sw / 2, sw, sw, 8);
                    obj.setData('currentZone', zone);
                } else { destroyBlock(obj); }
            });
            scene.input.on('dragend', (p, obj, dropped) => {
                if (isExecuting) return;
                if (!dropped) {
                    if (obj.getData('currentZone')) {
                        const z = obj.getData('currentZone');
                        obj.x = z.x; obj.y = z.y; obj.getData('visual').x = z.x; obj.getData('visual').y = z.y;
                    } else { destroyBlock(obj); }
                }
            });
        }
        function destroyBlock(obj) {
            const v = obj.getData('visual'); if (v && v.active) v.destroy();
            obj.destroy(); placedBlocks = placedBlocks.filter(b => b && b.active);
        }

        // ==================== Clear ====================
        function clearAll(scene) {
            dropZones.forEach(z => {
                const sw = z.getData('slotW');
                z.setData('isFilled', false); z.setData('command', null);
                z.getData('outline').clear().lineStyle(3, 0x94a3b8).strokeRoundedRect(z.x - sw / 2, z.y - sw / 2, sw, sw, 8);
            });
            placedBlocks.forEach(b => { if (b && b.active && b.getData('currentZone')) destroyBlock(b); });
            placedBlocks = placedBlocks.filter(b => b && b.active);
            resetState(scene);
        }
        function resetState(scene) {
            const msx = robot.getData('mapStartX');
            robot.x = msx; robot.setData('col', 0);
            collectedItems = [];
            problems[currentProblem].items.forEach(it => { if (itemSprites[it.id]) { itemSprites[it.id].setAlpha(1); itemSprites[it.id].y = MAP_Y; } });
            renderTracker(scene);
        }

        // ==================== Execute ====================
        function executeCommands(scene) {
            let cmds = [];
            for (let i = 0; i < dropZones.length; i++) { const c = dropZones[i].getData('command'); if (!c) break; cmds.push(c); }
            if (cmds.length === 0) { showFeedback(scene, "อุ๊ย! ยังไม่มีคำสั่ง", "หนูยังไม่ได้วางบล็อกคำสั่งเลย\nลองลากบล็อกมาวางก่อนนะ"); return; }

            isExecuting = true; scene.testBtn.setAlpha(0.5); scene.clearBtn.setAlpha(0.5);
            resetState(scene);

            const prob = problems[currentProblem];
            let robotCol = 0, nextIdx = 0, fail = null, step = 0;
            const collected = [];

            function next() {
                if (step >= cmds.length || fail) { finish(); return; }
                dropZones.forEach((z, i) => {
                    if (i >= cmds.length) return;
                    const sw = z.getData('slotW'), c = (i === step) ? 0xf59e0b : 0x3b82f6;
                    z.getData('outline').clear().lineStyle(i === step ? 5 : 3, c).strokeRoundedRect(z.x - sw / 2, z.y - sw / 2, sw, sw, 8);
                });
                const cmd = cmds[step], msx = robot.getData('mapStartX');
                if (cmd === "forward") {
                    robotCol++;
                    if (robotCol >= prob.cols) { fail = { type: "out" }; step++; next(); return; }
                    scene.tweens.add({ targets: robot, x: msx + robotCol * CELL, duration: 350, ease: 'Power1',
                        onComplete: () => { robot.setData('col', robotCol); step++; scene.time.delayedCall(120, next); } });
                } else if (cmd === "collect") {
                    const itemHere = prob.items.find(it => it.col === robotCol && !collected.includes(it.id));
                    if (!itemHere) { fail = { type: "no_item" }; step++; next(); return; }
                    const reqId = prob.order[nextIdx];
                    if (itemHere.id !== reqId) { fail = { type: "wrong", got: itemHere, exp: prob.items.find(it => it.id === reqId) }; step++; next(); return; }
                    collected.push(itemHere.id); collectedItems = [...collected]; nextIdx++;
                    const sp = itemSprites[itemHere.id];
                    scene.tweens.add({ targets: sp, y: sp.y - 35, alpha: 0, duration: 400,
                        onComplete: () => { renderTracker(scene); step++; scene.time.delayedCall(120, next); } });
                }
            }

            function finish() {
                dropZones.forEach(z => { if (z.getData('isFilled')) { const sw = z.getData('slotW'); z.getData('outline').clear().lineStyle(3, 0x3b82f6).strokeRoundedRect(z.x - sw / 2, z.y - sw / 2, sw, sw, 8); } });
                isExecuting = false; scene.testBtn.setAlpha(1); scene.clearBtn.setAlpha(1);
                if (fail) {
                    if (fail.type === "out") showFeedback(scene, "หุ่นยนต์เดินออกนอกเส้นทาง!", "ลองลดคำสั่งเดินหน้า\nหรือตรวจตำแหน่งคำสั่งเก็บของนะ");
                    else if (fail.type === "no_item") showFeedback(scene, "ตรงนี้ไม่มีของ!", "ตอนนี้ยังไม่มีของให้เก็บ\nลองเดินไปที่ของก่อนนะ");
                    else if (fail.type === "wrong") showFeedback(scene, "ผิดลำดับ!", `ยังไม่ถึงลำดับของ ${fail.got.icon} ${fail.got.name}\nต้องเก็บ ${fail.exp.icon} ${fail.exp.name} ก่อนนะ`);
                } else if (collected.length === prob.order.length) {
                    showFeedback(scene, "🎉 ถูกต้อง!", "เก็บของครบและถูกลำดับแล้ว!", true);
                    scene.time.delayedCall(2200, () => {
                        hideFeedback(); currentProblem++;
                        if (currentProblem < problems.length) renderProblem(scene);
                        else onComplete(scene);
                    });
                } else {
                    showFeedback(scene, "ยังเก็บของไม่ครบ!", `เก็บได้ ${collected.length} จาก ${prob.order.length} ชิ้น\nลองเพิ่มคำสั่งให้หุ่นยนต์เดินต่อนะ`);
                }
            }
            next();
        }

        // ==================== Feedback ====================
        function showFeedback(scene, title, msg, ok) {
            const el = document.getElementById('feedback-popup'); if (!el) return;
            el.innerHTML = `<h3 style="color:${ok ? '#15803d' : '#b45309'};font-weight:bold;margin:0 0 8px">${title}</h3>
                <p style="font-size:1.15rem;color:#333;white-space:pre-line;margin:0 0 12px">${msg}</p>
                <button class="btn ${ok ? 'btn-success' : 'btn-warning'}" onclick="document.getElementById('feedback-popup').style.display='none'">${ok ? '👍 ไปต่อ' : '🔄 ลองใหม่'}</button>`;
            el.style.display = 'block';
            if (!ok) { scene.sound.play('wrong'); scene.cameras.main.shake(120, 0.004); totalAttempts++; }
            else { scene.sound.play('correct'); }
        }
        function hideFeedback() { const el = document.getElementById('feedback-popup'); if (el) el.style.display = 'none'; }

        // ==================== Complete ====================
        function onComplete(scene) {
            const dur = Math.floor((Date.now() - startTime) / 1000);
            let stars = 1;
            if (totalAttempts <= 1) stars = 3; else if (totalAttempts <= 3) stars = 2;
            if (problemGroup) problemGroup.clear(true, true);
            if (scene.trackerGroup) scene.trackerGroup.clear(true, true);
            const c = scene.add.container(W / 2, H / 2).setDepth(10).setAlpha(0).setScale(0.7);
            c.add(scene.add.rectangle(0, 0, W, H, 0x000000, 0.7).setInteractive());
            c.add(scene.add.text(0, -70, "🎉 ภารกิจสำเร็จ! 🎉", { fontSize: '44px', color: '#fde047', fontFamily: 'Kanit' }).setOrigin(0.5));
            c.add(scene.add.text(0, -15, "เก็บของครบและถูกลำดับทุกภารกิจ!", { fontSize: '24px', color: '#a7f3d0', fontFamily: 'Kanit' }).setOrigin(0.5));
            c.add(scene.add.text(0, 30, `ได้รับ ${"⭐".repeat(stars)} (${stars} ดาว)`, { fontSize: '32px', color: '#fff', fontFamily: 'Kanit' }).setOrigin(0.5));
            c.add(scene.add.text(0, 70, `เวลา ${dur} วินาที | ทดสอบ ${totalAttempts + 1} ครั้ง`, { fontSize: '20px', color: '#e2e8f0', fontFamily: 'Kanit' }).setOrigin(0.5));
            scene.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 500, ease: 'Power2.easeOut',
                onComplete: () => {
                    if (window.sendResult) window.sendResult(STAGE_ID, stars, dur, totalAttempts);
                    setTimeout(() => { if (window.triggerAutoNextStage) window.triggerAutoNextStage(); }, 3000);
                }
            });
        }

        new Phaser.Game(config);
    });
})();
