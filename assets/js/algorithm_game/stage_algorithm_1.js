// File: assets/js/algorithm_game/stage_algorithm_1.js
// ภารกิจที่ 1: เดินตามคำสั่ง (พาหุ่นยนต์ไปเก็บดาว)
// ✅ ใช้ Phaser Graphics + Text วาดทั้งหมด ไม่ต้องโหลดรูปภาพจากไฟล์

(function () {
    document.addEventListener('DOMContentLoaded', function () {

        const W = 900, H = 600;

        const config = {
            type: Phaser.AUTO,
            scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
            parent: "game-container",
            scene: { preload: preload, create: create }
        };

        // === State ===
        let startTime, totalAttempts = 0, currentProblemIndex = 0;
        let robot, starObj, dropZones = [], placedBlocks = [];
        let isExecuting = false;
        let problemGroup;

        const problems = [
            { distance: 1, slots: 2 },
            { distance: 2, slots: 3 },
            { distance: 3, slots: 4 }
        ];

        const GRID_SIZE = 100;

        // === Block definitions ===
        const BLOCKS = {
            forward:    { emoji: "⬆️", label: "เดินหน้า",  color: 0x3b82f6 },
            turn_left:  { emoji: "⬅️", label: "เลี้ยวซ้าย", color: 0x8b5cf6 },
            turn_right: { emoji: "➡️", label: "เลี้ยวขวา", color: 0xa855f7 },
            collect:    { emoji: "⭐", label: "เก็บดาว",   color: 0xf59e0b }
        };

        function preload() {
            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
        }

        function create() {
            const scene = this;
            startTime = Date.now();
            totalAttempts = 0;
            currentProblemIndex = 0;

            // BG
            scene.add.graphics().fillGradientStyle(0xdbeafe, 0xdbeafe, 0xfef3c7, 0xfef3c7, 1).fillRect(0, 0, W, H).setDepth(-2);

            // Map area BG
            scene.add.graphics().fillStyle(0xffffff, 0.85).fillRoundedRect(25, 25, 850, 220, 16).setDepth(-1);

            // Command area BG
            scene.add.graphics().fillStyle(0xfef3c7, 0.85).fillRoundedRect(25, 260, 850, 310, 16).setDepth(-1);

            // Labels
            scene.add.text(50, 35, "🗺️ แผนที่ภารกิจ", { fontSize: '20px', color: '#1e3a8a', fontFamily: 'Kanit' });
            scene.add.text(50, 270, "🧩 บล็อกคำสั่ง (ลากไปวางในช่องด้านล่าง)", { fontSize: '18px', color: '#92400e', fontFamily: 'Kanit' });

            createButtons(scene);
            setupDrag(scene);
            renderProblem(scene);
        }

        // ===================== UI Buttons =====================
        function createButtons(scene) {
            // Clear button
            scene.clearBtn = makeButton(scene, 160, 540, 140, 46, 0xef4444, "🗑️ ล้างคำสั่ง", () => {
                if (!isExecuting) clearAll(scene);
            });
            // Test button
            scene.testBtn = makeButton(scene, 740, 540, 170, 46, 0x22c55e, "▶ ทดสอบคำสั่ง", () => {
                if (!isExecuting) executeCommands(scene);
            });
        }

        function makeButton(scene, x, y, w, h, color, label, cb) {
            const g = scene.add.graphics();
            g.fillStyle(color, 1).fillRoundedRect(x - w/2, y - h/2, w, h, 12);
            g.setInteractive(new Phaser.Geom.Rectangle(x - w/2, y - h/2, w, h), Phaser.Geom.Rectangle.Contains);
            g.on('pointerdown', cb);
            g.on('pointerover', () => g.setAlpha(0.85));
            g.on('pointerout', () => g.setAlpha(1));
            scene.add.text(x, y, label, { fontSize: '18px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' }).setOrigin(0.5);
            return g;
        }

        // ===================== Render Problem =====================
        function renderProblem(scene) {
            if (problemGroup) problemGroup.clear(true, true);
            problemGroup = scene.add.group();
            dropZones = [];
            // ✅ ลบทั้ง handle และ visual container เพื่อไม่ให้ค้างบังบล็อกใหม่
            placedBlocks.forEach(b => {
                if (b && b.active) {
                    const vis = b.getData('visual');
                    if (vis && vis.active) vis.destroy();
                    b.destroy();
                }
            });
            placedBlocks = [];

            const prob = problems[currentProblemIndex];
            const totalCells = prob.distance + 1;
            const mapStartX = (W - totalCells * GRID_SIZE) / 2 + GRID_SIZE / 2;
            const mapY = 150;

            // Title
            const t = scene.add.text(W/2, 70, `ภารกิจที่ ${currentProblemIndex+1} จาก ${problems.length}  |  ระยะ ${prob.distance} ช่อง`, {
                fontSize: '22px', color: '#1e3a8a', fontFamily: 'Kanit', fontStyle: 'bold'
            }).setOrigin(0.5);
            problemGroup.add(t);

            // Grid cells
            for (let i = 0; i < totalCells; i++) {
                const cx = mapStartX + i * GRID_SIZE;
                const g = scene.add.graphics().fillStyle(0xf1f5f9, 1).fillRoundedRect(cx - 42, mapY - 42, 84, 84, 10)
                    .lineStyle(2, 0x94a3b8).strokeRoundedRect(cx - 42, mapY - 42, 84, 84, 10);
                problemGroup.add(g);
            }

            // Robot
            robot = scene.add.text(mapStartX, mapY, "🤖", { fontSize: '52px' }).setOrigin(0.5).setAngle(90);
            robot.setData({ position: 0, startX: mapStartX, mapY: mapY });
            problemGroup.add(robot);

            // Star
            const starX = mapStartX + prob.distance * GRID_SIZE;
            starObj = scene.add.text(starX, mapY, "🌟", { fontSize: '48px' }).setOrigin(0.5);
            problemGroup.add(starObj);

            // Drop zones
            const slotW = 80, slotPad = 16;
            const totalSlotsW = prob.slots * slotW + (prob.slots - 1) * slotPad;
            const slotStartX = (W - totalSlotsW) / 2 + slotW / 2;
            const slotY = 460;

            for (let i = 0; i < prob.slots; i++) {
                const sx = slotStartX + i * (slotW + slotPad);
                const outline = scene.add.graphics().lineStyle(3, 0x94a3b8).strokeRoundedRect(sx - slotW/2, slotY - slotW/2, slotW, slotW, 10);
                problemGroup.add(outline);

                const numLabel = scene.add.text(sx, slotY - slotW/2 - 14, `${i+1}`, { fontSize: '16px', color: '#64748b', fontFamily: 'Kanit' }).setOrigin(0.5);
                problemGroup.add(numLabel);

                const zone = scene.add.zone(sx, slotY, slotW, slotW).setRectangleDropZone(slotW, slotW);
                zone.setData({ isFilled: false, outline: outline, command: null, index: i });
                problemGroup.add(zone);
                dropZones.push(zone);
            }

            // Command blocks (draggable sources)
            const keys = Object.keys(BLOCKS);
            const bw = 80, bGap = 110;
            const bStartX = (W - (keys.length - 1) * bGap) / 2;
            const bY = 340;

            keys.forEach((key, idx) => {
                const bx = bStartX + idx * bGap;
                // Base (always visible)
                const base = drawBlock(scene, bx, bY, BLOCKS[key], 0.4);
                problemGroup.add(base.container);
                // Draggable clone on top
                spawnDraggable(scene, bx, bY, key);
            });
        }

        function drawBlock(scene, x, y, def, alpha) {
            const size = 72;
            const container = scene.add.container(x, y);
            const bg = scene.add.graphics();
            bg.fillStyle(def.color, alpha || 1).fillRoundedRect(-size/2, -size/2, size, size, 10);
            container.add(bg);
            const emoji = scene.add.text(0, -6, def.emoji, { fontSize: '32px' }).setOrigin(0.5);
            container.add(emoji);
            const lbl = scene.add.text(0, 26, def.label, { fontSize: '11px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' }).setOrigin(0.5);
            container.add(lbl);
            return { container };
        }

        function spawnDraggable(scene, ox, oy, key) {
            const def = BLOCKS[key];
            const size = 72;
            // Use a simple rectangle as draggable handle
            const handle = scene.add.rectangle(ox, oy, size, size, def.color).setInteractive({ useHandCursor: true, draggable: true });
            handle.setAlpha(0.001); // invisible handle on top of visual
            // Visual container
            const vis = scene.add.container(ox, oy);
            const bg = scene.add.graphics().fillStyle(def.color, 1).fillRoundedRect(-size/2, -size/2, size, size, 10)
                .lineStyle(2, 0xffffff, 0.5).strokeRoundedRect(-size/2, -size/2, size, size, 10);
            vis.add(bg);
            vis.add(scene.add.text(0, -6, def.emoji, { fontSize: '32px' }).setOrigin(0.5));
            vis.add(scene.add.text(0, 26, def.label, { fontSize: '11px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' }).setOrigin(0.5));

            handle.setData({ value: key, originalX: ox, originalY: oy, visual: vis, currentZone: null });
            scene.input.setDraggable(handle);
            placedBlocks.push(handle);
        }

        // ===================== Drag Events =====================
        function setupDrag(scene) {
            scene.input.on('dragstart', (ptr, obj) => {
                if (isExecuting) return;
                scene.children.bringToTop(obj.getData('visual'));
                scene.children.bringToTop(obj);

                const cz = obj.getData('currentZone');
                if (cz) {
                    cz.setData('isFilled', false);
                    cz.setData('command', null);
                    cz.getData('outline').clear().lineStyle(3, 0x94a3b8).strokeRoundedRect(cz.x - 40, cz.y - 40, 80, 80, 10);
                    obj.setData('currentZone', null);
                } else {
                    // Clone: spawn a new one at original position
                    spawnDraggable(scene, obj.getData('originalX'), obj.getData('originalY'), obj.getData('value'));
                }
            });

            scene.input.on('drag', (ptr, obj, dx, dy) => {
                if (isExecuting) return;
                obj.x = dx; obj.y = dy;
                obj.getData('visual').x = dx;
                obj.getData('visual').y = dy;
            });

            scene.input.on('drop', (ptr, obj, zone) => {
                if (isExecuting) return;
                if (!zone.getData('isFilled')) {
                    obj.x = zone.x; obj.y = zone.y;
                    obj.getData('visual').x = zone.x;
                    obj.getData('visual').y = zone.y;
                    zone.setData('isFilled', true);
                    zone.setData('command', obj.getData('value'));
                    zone.getData('outline').clear().lineStyle(4, 0x3b82f6).strokeRoundedRect(zone.x - 40, zone.y - 40, 80, 80, 10);
                    obj.setData('currentZone', zone);
                } else {
                    snapBack(obj);
                }
            });

            scene.input.on('dragend', (ptr, obj, dropped) => {
                if (isExecuting) return;
                if (!dropped) {
                    if (obj.getData('currentZone')) {
                        const z = obj.getData('currentZone');
                        obj.x = z.x; obj.y = z.y;
                        obj.getData('visual').x = z.x;
                        obj.getData('visual').y = z.y;
                    } else {
                        destroyBlock(obj);
                    }
                }
            });
        }

        function snapBack(obj) {
            destroyBlock(obj);
        }

        function destroyBlock(obj) {
            const vis = obj.getData('visual');
            if (vis) vis.destroy();
            obj.destroy();
            placedBlocks = placedBlocks.filter(b => b && b.active);
        }

        // ===================== Clear =====================
        function clearAll(scene) {
            dropZones.forEach(z => {
                z.setData('isFilled', false);
                z.setData('command', null);
                z.getData('outline').clear().lineStyle(3, 0x94a3b8).strokeRoundedRect(z.x - 40, z.y - 40, 80, 80, 10);
            });
            placedBlocks.forEach(b => {
                if (b && b.active && b.getData('currentZone')) destroyBlock(b);
            });
            placedBlocks = placedBlocks.filter(b => b && b.active);
            resetRobot();
        }

        function resetRobot() {
            robot.x = robot.getData('startX');
            robot.setData('position', 0);
            starObj.setAlpha(1);
        }

        // ===================== Execute =====================
        function executeCommands(scene) {
            let cmds = [];
            for (let i = 0; i < dropZones.length; i++) {
                const c = dropZones[i].getData('command');
                if (!c) {
                    showFeedback(scene, "อุ๊ย! คำสั่งไม่ครบ", "หนูยังวางบล็อกคำสั่งไม่เต็มทุกช่องเลย\nลองวางให้ครบก่อนกดทดสอบนะ");
                    return;
                }
                cmds.push(c);
            }

            isExecuting = true;
            scene.testBtn.setAlpha(0.5);
            scene.clearBtn.setAlpha(0.5);
            resetRobot();

            const prob = problems[currentProblemIndex];
            let pos = 0, gotStar = false, fail = null, step = 0;

            function next() {
                if (step >= cmds.length || fail) { finish(); return; }

                // Highlight current slot
                dropZones.forEach((z, i) => {
                    const c = (i === step) ? 0xf59e0b : 0x3b82f6;
                    const lw = (i === step) ? 5 : 3;
                    z.getData('outline').clear().lineStyle(lw, c).strokeRoundedRect(z.x - 40, z.y - 40, 80, 80, 10);
                });

                const cmd = cmds[step];

                if (cmd === "forward") {
                    pos++;
                    const nx = robot.getData('startX') + pos * GRID_SIZE;
                    scene.tweens.add({ targets: robot, x: nx, duration: 400, ease: 'Power1', onComplete: () => {
                        robot.setData('position', pos);
                        step++;
                        scene.time.delayedCall(150, next);
                    }});
                } else if (cmd === "collect") {
                    if (pos === prob.distance) {
                        gotStar = true;
                        scene.tweens.add({ targets: starObj, y: starObj.y - 40, alpha: 0, duration: 400, onComplete: () => {
                            step++; scene.time.delayedCall(150, next);
                        }});
                    } else {
                        fail = "early_collect"; step++; next();
                    }
                } else if (cmd === "turn_left" || cmd === "turn_right") {
                    fail = "unnecessary_turn";
                    scene.tweens.add({ targets: robot, angle: cmd === "turn_left" ? -30 : 30, duration: 250, yoyo: true, onComplete: () => { step++; next(); }});
                }
            }

            function finish() {
                dropZones.forEach(z => z.getData('outline').clear().lineStyle(3, 0x3b82f6).strokeRoundedRect(z.x - 40, z.y - 40, 80, 80, 10));
                isExecuting = false;
                scene.testBtn.setAlpha(1);
                scene.clearBtn.setAlpha(1);

                if (fail === "early_collect") {
                    showFeedback(scene, "เก็บดาวไม่ได้!", "ต้องเดินไปให้ถึงดาวก่อน จึงจะเก็บดาวได้นะ");
                } else if (fail === "unnecessary_turn") {
                    showFeedback(scene, "ผิดทางแล้ว!", "ด่านนี้ดาวอยู่ตรงหน้า\nหุ่นยนต์ไม่จำเป็นต้องเลี้ยวนะ");
                } else if (!gotStar) {
                    if (pos < prob.distance) {
                        showFeedback(scene, "ยังไม่ถึง!", "หุ่นยนต์ยังเดินไม่ถึงดาว\nลองเพิ่มคำสั่ง เดินหน้า อีกนิดนะ");
                    } else {
                        showFeedback(scene, "ลืมอะไรไปหรือเปล่า?", "หุ่นยนต์เดินมาถึงดาวแล้ว\nแต่อย่าลืมใช้คำสั่ง เก็บดาว ด้วยนะ");
                    }
                } else {
                    // SUCCESS
                    showFeedback(scene, "🎉 ถูกต้อง!", "ยอดเยี่ยม! นักเรียนเรียงอัลกอริทึมได้ถูกต้อง", true);
                    scene.time.delayedCall(2200, () => {
                        hideFeedback();
                        currentProblemIndex++;
                        if (currentProblemIndex < problems.length) {
                            renderProblem(scene);
                        } else {
                            onComplete(scene);
                        }
                    });
                }
            }

            next();
        }

        // ===================== Feedback =====================
        function showFeedback(scene, title, msg, ok) {
            const el = document.getElementById('feedback-popup');
            if (!el) return;
            el.innerHTML = `<h3 style="color:${ok ? '#15803d' : '#b45309'};font-weight:bold;margin:0 0 8px">${title}</h3>
                <p style="font-size:1.1rem;color:#333;white-space:pre-line;margin:0 0 12px">${msg}</p>
                <button class="btn ${ok ? 'btn-success' : 'btn-warning'}" onclick="document.getElementById('feedback-popup').style.display='none'">${ok ? '👍 ไปต่อ' : '🔄 ลองใหม่'}</button>`;
            el.style.display = 'block';
            if (!ok) { scene.sound.play('wrong'); scene.cameras.main.shake(120, 0.004); totalAttempts++; }
            else { scene.sound.play('correct'); }
        }

        function hideFeedback() {
            const el = document.getElementById('feedback-popup');
            if (el) el.style.display = 'none';
        }

        // ===================== Stage Complete =====================
        function onComplete(scene) {
            const dur = Math.floor((Date.now() - startTime) / 1000);
            let stars = 1;
            if (totalAttempts === 0 && dur <= 45) stars = 3;
            else if (totalAttempts === 0) stars = 2;
            else if (totalAttempts <= 3) stars = 2;

            if (problemGroup) problemGroup.clear(true, true);

            const c = scene.add.container(W/2, H/2).setDepth(10).setAlpha(0).setScale(0.7);
            c.add(scene.add.rectangle(0, 0, W, H, 0x000000, 0.7).setInteractive());
            c.add(scene.add.text(0, -60, "🎉 ภารกิจสำเร็จ! 🎉", { fontSize: '44px', color: '#fde047', fontFamily: 'Kanit', align: 'center' }).setOrigin(0.5));
            c.add(scene.add.text(0, 10, `ได้รับ ${"⭐".repeat(stars)} (${stars} ดาว)`, { fontSize: '30px', color: '#fff', fontFamily: 'Kanit' }).setOrigin(0.5));
            c.add(scene.add.text(0, 60, `เวลา ${dur} วินาที | ตอบผิด ${totalAttempts} ครั้ง`, { fontSize: '20px', color: '#e2e8f0', fontFamily: 'Kanit' }).setOrigin(0.5));

            scene.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 500, ease: 'Power2.easeOut', onComplete: () => {
                if (window.sendResult) {
                    window.sendResult(STAGE_ID, stars, dur, totalAttempts);
                }
                // ✅ Fallback: ถ้า API ล้มเหลว ให้ปุ่มด่านถัดไปยังคงขึ้นหลังจาก 3 วินาที
                setTimeout(() => {
                    if (window.triggerAutoNextStage) window.triggerAutoNextStage();
                }, 3000);
            }});
        }

        new Phaser.Game(config);
    });
})();
