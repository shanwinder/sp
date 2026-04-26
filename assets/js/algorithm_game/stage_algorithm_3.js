// File: assets/js/algorithm_game/stage_algorithm_3.js
// ด่านที่ 3: คำสั่งไหนไม่จำเป็น — 3 ด่านย่อย
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const W = 950, H = 620;
        const config = {
            type: Phaser.AUTO,
            scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: W, height: H },
            parent: "game-container",
            scene: { preload: preload, create: create }
        };

        // === 3 ด่านย่อย ===
        const subStages = [
            {
                title: "ตัดคำสั่งเกินแบบง่าย",
                mapCols: 4, starCol: 3,
                commands: [
                    { id: "f1", label: "เดินหน้า", type: "forward", removable: false },
                    { id: "f2", label: "เดินหน้า", type: "forward", removable: false },
                    { id: "tl", label: "เลี้ยวซ้าย", type: "left", removable: true },
                    { id: "tr", label: "เลี้ยวขวา", type: "right", removable: true },
                    { id: "f3", label: "เดินหน้า", type: "forward", removable: false },
                    { id: "co", label: "เก็บดาว", type: "collect", removable: false }
                ],
                correctRemove: ["tl", "tr"],
                hint: "ลองดูว่าเส้นทางเป็นเส้นตรง จำเป็นต้องเลี้ยวไหม?"
            },
            {
                title: "ตัดคำสั่งที่ทำให้เดินวกวน",
                mapCols: 5, starCol: 4,
                commands: [
                    { id: "f1", label: "เดินหน้า", type: "forward", removable: false },
                    { id: "f2", label: "เดินหน้า", type: "forward", removable: false },
                    { id: "tl", label: "เลี้ยวซ้าย", type: "left", removable: true },
                    { id: "tr", label: "เลี้ยวขวา", type: "right", removable: true },
                    { id: "f3", label: "เดินหน้า", type: "forward", removable: false },
                    { id: "f4", label: "เดินหน้า", type: "forward", removable: false },
                    { id: "co", label: "เก็บดาว", type: "collect", removable: false }
                ],
                correctRemove: ["tl", "tr"],
                hint: "คำสั่งคู่ไหนที่ทำแล้วกลับมาเหมือนเดิม ไม่ได้ช่วยเข้าใกล้ดาว?"
            },
            {
                title: "เลือกชุดคำสั่งที่เหมาะสมกว่า",
                mode: "choose",
                mapCols: 4, starCol: 3,
                choiceA: {
                    label: "ชุด A", cmds: ["เดินหน้า", "เดินหน้า", "เดินหน้า", "เก็บดาว"]
                },
                choiceB: {
                    label: "ชุด B", cmds: ["เดินหน้า", "เลี้ยวซ้าย", "เลี้ยวขวา", "เดินหน้า", "เดินหน้า", "เก็บดาว"]
                },
                correctChoice: "A",
                hint: "ชุดไหนสั้นกว่าและไม่มีคำสั่งเกิน?"
            }
        ];

        let startTime, totalAttempts = 0, currentSub = 0;
        let isExecuting = false, problemGroup;
        let mapRobotRef = null; // เก็บ reference หุ่นยนต์บนแผนที่เพื่อซ่อนตอนจำลอง
        const CELL = 100;

        function preload() {
            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
        }

        function create() {
            const scene = this;
            startTime = Date.now();
            totalAttempts = 0;
            currentSub = 0;
            // BG
            scene.add.graphics().fillGradientStyle(0xfef9c3, 0xfef9c3, 0xe0f2fe, 0xe0f2fe, 1).fillRect(0, 0, W, H).setDepth(-2);
            renderSubStage(scene);
        }

        // ============ Render Sub-Stage ============
        function renderSubStage(scene) {
            if (problemGroup) problemGroup.clear(true, true);
            problemGroup = scene.add.group();
            isExecuting = false;

            const sub = subStages[currentSub];

            // Title
            addText(scene, W / 2, 25, `ภารกิจที่ ${currentSub + 1} จาก ${subStages.length}: ${sub.title}`, 22, '#0369a1', true);

            // Map
            drawMap(scene, sub.mapCols, sub.starCol);

            if (sub.mode === "choose") {
                renderChooseMode(scene, sub);
            } else {
                renderRemoveMode(scene, sub);
            }
        }

        function drawMap(scene, cols, starCol) {
            const mapStartX = (W - cols * CELL) / 2 + CELL / 2;
            const mapY = 110;
            // BG panel
            problemGroup.add(scene.add.graphics().fillStyle(0xffffff, 0.9).fillRoundedRect((W - cols * CELL) / 2 - 15, mapY - 55, cols * CELL + 30, 110, 14));

            for (let c = 0; c < cols; c++) {
                const cx = mapStartX + c * CELL;
                problemGroup.add(scene.add.graphics().fillStyle(0xf1f5f9, 1).fillRoundedRect(cx - 40, mapY - 40, 80, 80, 10)
                    .lineStyle(2, 0x94a3b8).strokeRoundedRect(cx - 40, mapY - 40, 80, 80, 10));
            }
            mapRobotRef = scene.add.text(mapStartX, mapY, "🤖", { fontSize: '48px' }).setOrigin(0.5).setAngle(90);
            problemGroup.add(mapRobotRef);
            problemGroup.add(scene.add.text(mapStartX + starCol * CELL, mapY, "🌟", { fontSize: '44px' }).setOrigin(0.5));
        }

        // ============ Remove Mode (3.1, 3.2) ============
        function renderRemoveMode(scene, sub) {
            const selected = new Set();
            const cmdY0 = 215;
            const gap = 110;
            const cols = Math.min(sub.commands.length, 6);
            const startX = (W - (cols - 1) * gap) / 2;

            addText(scene, W / 2, 185, "👆 คลิกคำสั่งที่ไม่จำเป็นเพื่อลบออก", 18, '#92400e');

            const blocks = [];
            sub.commands.forEach((cmd, idx) => {
                const row = Math.floor(idx / cols);
                const col = idx % cols;
                const bx = startX + col * gap;
                const by = cmdY0 + 50 + row * 90;
                const block = createCmdBlock(scene, bx, by, cmd, selected, blocks);
                blocks.push(block);
            });

            // Buttons
            makeBtnG(scene, W / 2 - 180, 540, 160, 50, 0xef4444, "🗑️ ล้างที่เลือก", () => {
                if (isExecuting) return;
                selected.clear();
                blocks.forEach(b => resetBlockStyle(b));
            });
            makeBtnG(scene, W / 2, 540, 140, 50, 0x8b5cf6, "💡 คำใบ้", () => {
                if (isExecuting) return;
                showFeedback(scene, "💡 คำใบ้", sub.hint);
            });
            makeBtnG(scene, W / 2 + 180, 540, 180, 50, 0x22c55e, "▶ ทดสอบคำสั่ง", () => {
                if (isExecuting) return;
                testRemoveAnswer(scene, sub, selected, blocks);
            });
        }

        function createCmdBlock(scene, x, y, cmd, selected, blocks) {
            const w = 100, h = 70;
            const bg = scene.add.graphics();
            const label = scene.add.text(x, y, cmd.label, { fontSize: '18px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' }).setOrigin(0.5);
            const emoji = getEmoji(cmd.type);
            const emojiT = scene.add.text(x, y - 22, emoji, { fontSize: '24px' }).setOrigin(0.5);
            const block = { bg, label, emojiT, cmd, x, y, w, h };
            drawBlockBg(block, false);

            bg.setInteractive(new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h), Phaser.Geom.Rectangle.Contains);
            bg.on('pointerdown', () => {
                if (isExecuting) return;
                if (selected.has(cmd.id)) {
                    selected.delete(cmd.id);
                    drawBlockBg(block, false);
                    label.setStyle({ fontSize: '18px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' });
                } else {
                    selected.add(cmd.id);
                    drawBlockBg(block, true);
                    label.setStyle({ fontSize: '18px', color: '#fca5a5', fontFamily: 'Kanit', fontStyle: 'bold', textDecoration: 'line-through' });
                }
            });
            bg.on('pointerover', () => bg.setAlpha(0.85));
            bg.on('pointerout', () => bg.setAlpha(1));

            problemGroup.add(bg);
            problemGroup.add(emojiT);
            problemGroup.add(label);
            return block;
        }

        function drawBlockBg(block, isSelected) {
            const col = isSelected ? 0xdc2626 : getBlockColor(block.cmd.type);
            block.bg.clear().fillStyle(col, 1).fillRoundedRect(block.x - block.w / 2, block.y - block.h / 2, block.w, block.h, 12)
                .lineStyle(3, isSelected ? 0xfca5a5 : 0xffffff, 0.4).strokeRoundedRect(block.x - block.w / 2, block.y - block.h / 2, block.w, block.h, 12);
            if (isSelected) {
                // Strike-through line
                block.bg.lineStyle(3, 0xffffff, 0.8);
                block.bg.lineBetween(block.x - block.w / 2 + 8, block.y, block.x + block.w / 2 - 8, block.y);
            }
        }

        function resetBlockStyle(block) {
            drawBlockBg(block, false);
            block.label.setStyle({ fontSize: '18px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' });
        }

        function getBlockColor(type) {
            if (type === 'forward') return 0x3b82f6;
            if (type === 'left') return 0xa855f7;
            if (type === 'right') return 0xf97316;
            if (type === 'collect') return 0x22c55e;
            return 0x64748b;
        }
        function getEmoji(type) {
            if (type === 'forward') return '⬆️';
            if (type === 'left') return '⬅️';
            if (type === 'right') return '➡️';
            if (type === 'collect') return '⭐';
            return '❓';
        }

        function testRemoveAnswer(scene, sub, selected, blocks) {
            const selArr = [...selected].sort();
            const corArr = [...sub.correctRemove].sort();
            const isCorrect = selArr.length === corArr.length && selArr.every((v, i) => v === corArr[i]);

            // Simulate robot walking with remaining commands
            const remaining = sub.commands.filter(c => !selected.has(c.id));
            simulateWalk(scene, sub.mapCols, sub.starCol, remaining, isCorrect);
        }

        function simulateWalk(scene, cols, starCol, commands, answerCorrect) {
            isExecuting = true;
            const mapStartX = (W - cols * CELL) / 2 + CELL / 2;
            const mapY = 110;

            // ซ่อนหุ่นยนต์ตัวเดิมบนแผนที่
            if (mapRobotRef && mapRobotRef.active) mapRobotRef.setAlpha(0);

            const simRobot = scene.add.text(mapStartX, mapY, "🤖", { fontSize: '48px' }).setOrigin(0.5).setAngle(90).setDepth(5);
            problemGroup.add(simRobot);

            let robotCol = 0, step = 0, reachedStar = false;
            function next() {
                if (step >= commands.length) { finish(); return; }
                const cmd = commands[step];
                if (cmd.type === "forward") {
                    robotCol++;
                    if (robotCol >= cols) { finish(); return; }
                    scene.tweens.add({ targets: simRobot, x: mapStartX + robotCol * CELL, duration: 300, ease: 'Power1',
                        onComplete: () => { step++; scene.time.delayedCall(100, next); } });
                } else if (cmd.type === "collect") {
                    if (robotCol === starCol) reachedStar = true;
                    scene.tweens.add({ targets: simRobot, scaleX: 1.3, scaleY: 1.3, duration: 200, yoyo: true,
                        onComplete: () => { step++; scene.time.delayedCall(100, next); } });
                } else {
                    // left/right — visual spin but no effect on straight path
                    scene.tweens.add({ targets: simRobot, angle: cmd.type === 'left' ? -45 : 45, duration: 200, yoyo: true,
                        onComplete: () => { step++; scene.time.delayedCall(100, next); } });
                }
            }

            function finish() {
                scene.time.delayedCall(400, () => {
                    simRobot.destroy();
                    // แสดงหุ่นยนต์ตัวเดิมกลับมา
                    if (mapRobotRef && mapRobotRef.active) mapRobotRef.setAlpha(1);
                    isExecuting = false;
                    if (answerCorrect && reachedStar) {
                        showFeedback(scene, "🎉 ถูกต้อง!", "คำสั่งที่เหลือยังพาหุ่นยนต์ไปถึงดาวได้\nอัลกอริทึมกระชับขึ้นแล้ว!", true);
                        scene.time.delayedCall(2200, () => { hideFeedback(); advanceSub(scene); });
                    } else if (!reachedStar) {
                        totalAttempts++;
                        showFeedback(scene, "หุ่นยนต์ไปไม่ถึงดาว!", "มีคำสั่งสำคัญหายไป\nลองตรวจใหม่อีกครั้งนะ");
                    } else {
                        totalAttempts++;
                        showFeedback(scene, "ยังมีคำสั่งเกินอยู่!", "ยังมีคำสั่งบางอันที่ทำให้หุ่นยนต์เสียเวลา\nลองตรวจอีกครั้ง");
                    }
                });
            }
            next();
        }

        // ============ Choose Mode (3.3) ============
        function renderChooseMode(scene, sub) {
            addText(scene, W / 2, 190, "👆 เลือกชุดคำสั่งที่เหมาะสมกว่า", 20, '#92400e');

            const panelW = 380, panelH = 230, gap = 30;
            const ax = W / 2 - panelW / 2 - gap / 2;
            const bx = W / 2 + panelW / 2 + gap / 2;
            const py = 340;

            drawChoicePanel(scene, ax, py, panelW, panelH, sub.choiceA, "A", sub);
            drawChoicePanel(scene, bx, py, panelW, panelH, sub.choiceB, "B", sub);

            // ปุ่มเลือก — วางด้านล่าง panel ไม่ทับเนื้อหา
            const btnY = py + panelH / 2 + 35;
            makeBtnG(scene, ax, btnY, 160, 46, 0x3b82f6, `✅ เลือก ${sub.choiceA.label}`, () => { submitChoice(scene, sub, "A"); });
            makeBtnG(scene, bx, btnY, 160, 46, 0x3b82f6, `✅ เลือก ${sub.choiceB.label}`, () => { submitChoice(scene, sub, "B"); });
        }

        function submitChoice(scene, sub, choiceId) {
            if (isExecuting) return;
            isExecuting = true;
            const choice = choiceId === "A" ? sub.choiceA : sub.choiceB;
            if (choiceId === sub.correctChoice) {
                showFeedback(scene, "🎉 ถูกต้อง!", `${choice.label} สั้นกว่า ชัดเจน และทำภารกิจสำเร็จ!\nอัลกอริทึมที่ดีควรกระชับและไม่ซับซ้อนเกินจำเป็น`, true);
                scene.time.delayedCall(2500, () => { hideFeedback(); isExecuting = false; advanceSub(scene); });
            } else {
                totalAttempts++;
                isExecuting = false;
                showFeedback(scene, "ลองอีกครั้ง!", `${choice.label} ทำภารกิจได้ แต่มีคำสั่งที่ไม่จำเป็น\nลองเลือกชุดที่สั้นและตรงกว่า`);
            }
        }

        function drawChoicePanel(scene, cx, cy, pw, ph, choice, choiceId, sub) {
            const bg = scene.add.graphics()
                .fillStyle(0xffffff, 1).fillRoundedRect(cx - pw / 2, cy - ph / 2, pw, ph, 14)
                .lineStyle(3, choiceId === "A" ? 0x3b82f6 : 0xf97316, 2).strokeRoundedRect(cx - pw / 2, cy - ph / 2, pw, ph, 14);
            problemGroup.add(bg);

            addText(scene, cx, cy - ph / 2 + 25, choice.label, 22, '#0369a1', true);

            choice.cmds.forEach((cmd, i) => {
                const ty = cy - ph / 2 + 58 + i * 28;
                addText(scene, cx, ty, `${i + 1}. ${cmd}`, 17, '#334155');
            });
        }

        function advanceSub(scene) {
            currentSub++;
            if (currentSub < subStages.length) { renderSubStage(scene); }
            else { onComplete(scene); }
        }

        // ============ Helpers ============
        function addText(scene, x, y, txt, size, color, bold) {
            const t = scene.add.text(x, y, txt, {
                fontSize: size + 'px', color: color || '#333', fontFamily: 'Kanit', fontStyle: bold ? 'bold' : 'normal'
            }).setOrigin(0.5);
            problemGroup.add(t);
            return t;
        }

        function makeBtnG(scene, x, y, w, h, color, label, cb) {
            const g = scene.add.graphics().fillStyle(color, 1).fillRoundedRect(x - w / 2, y - h / 2, w, h, 12);
            g.setInteractive(new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h), Phaser.Geom.Rectangle.Contains);
            g.on('pointerdown', cb).on('pointerover', () => g.setAlpha(0.85)).on('pointerout', () => g.setAlpha(1));
            const t = scene.add.text(x, y, label, { fontSize: '18px', color: '#fff', fontFamily: 'Kanit', fontStyle: 'bold' }).setOrigin(0.5);
            problemGroup.add(g); problemGroup.add(t);
        }

        function showFeedback(scene, title, msg, ok) {
            const el = document.getElementById('feedback-popup'); if (!el) return;
            el.innerHTML = `<h3 style="color:${ok ? '#15803d' : '#b45309'};font-weight:bold;margin:0 0 8px">${title}</h3>
                <p style="font-size:1.15rem;color:#333;white-space:pre-line;margin:0 0 12px">${msg}</p>
                <button class="btn ${ok ? 'btn-success' : 'btn-warning'}" onclick="document.getElementById('feedback-popup').style.display='none'">${ok ? '👍 ไปต่อ' : '🔄 ลองใหม่'}</button>`;
            el.style.display = 'block';
            if (!ok) { scene.sound.play('wrong'); scene.cameras.main.shake(120, 0.004); }
            else { scene.sound.play('correct'); }
        }
        function hideFeedback() { const el = document.getElementById('feedback-popup'); if (el) el.style.display = 'none'; }

        // ============ Complete ============
        function onComplete(scene) {
            const dur = Math.floor((Date.now() - startTime) / 1000);
            let stars = 1;
            if (totalAttempts <= 1) stars = 3; else if (totalAttempts <= 3) stars = 2;
            if (problemGroup) problemGroup.clear(true, true);
            const c = scene.add.container(W / 2, H / 2).setDepth(10).setAlpha(0).setScale(0.7);
            c.add(scene.add.rectangle(0, 0, W, H, 0x000000, 0.7).setInteractive());
            c.add(scene.add.text(0, -70, "🎉 ภารกิจสำเร็จ! 🎉", { fontSize: '44px', color: '#fde047', fontFamily: 'Kanit' }).setOrigin(0.5));
            c.add(scene.add.text(0, -15, "ตรวจและตัดคำสั่งที่ไม่จำเป็นได้ครบทุกภารกิจ!", { fontSize: '22px', color: '#a7f3d0', fontFamily: 'Kanit' }).setOrigin(0.5));
            c.add(scene.add.text(0, 30, `ได้รับ ${"⭐".repeat(stars)} (${stars} ดาว)`, { fontSize: '32px', color: '#fff', fontFamily: 'Kanit' }).setOrigin(0.5));
            c.add(scene.add.text(0, 70, `เวลา ${dur} วินาที | ผิด ${totalAttempts} ครั้ง`, { fontSize: '20px', color: '#e2e8f0', fontFamily: 'Kanit' }).setOrigin(0.5));
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
