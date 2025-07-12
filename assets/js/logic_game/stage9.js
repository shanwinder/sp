// File: assets/js/logic_game/stage9.js

// ด่าน 9: วัตถุเปลี่ยนรูป (บทที่ 1: การใช้เหตุผลเชิงตรรกะ)

// ✅ แก้ไข: Uncaught ReferenceError: targetSize is not defined

// ✅ ปรับปรุง: แสดงภาพรูปร่างดั้งเดิม (คงสัดส่วน) และปรับ Layout ตามความกว้างจริง

(function () {
    document.addEventListener("DOMContentLoaded", function () {
        const config = {
            type: Phaser.AUTO,

            scale: {
                mode: Phaser.Scale.FIT,

                autoCenter: Phaser.Scale.CENTER_BOTH,

                width: 900,

                height: 600,
            },

            input: {
                mouse: {
                    preventDefaultWheel: false,
                },
            },

            parent: "game-container",

            scene: {
                preload: preload,

                create: create,
            },
        };

        let startTime; // เวลาเริ่มต้นเล่นด่าน
        let attempts = 0; // จำนวนครั้งที่พยายามตอบผิด
        let solvedProblems = 0; // นับจำนวนปัญหาย่อยที่แก้ได้

        const problems = [
            {
                // ปัญหาที่ 1: เปลี่ยนสีและหมุน

                rule: "สี่เหลี่ยมน้ำเงิน: แดง ➡️ หมุน 90°",

                initialObject: "blue_square",

                transformations: [
                    { rule_desc: "เปลี่ยนสี: แดง" },
                    { rule_desc: "หมุน: 90 องศา" },
                ],

                correctAnswer: "red_square_rotated_90",

                options: Phaser.Utils.Array.Shuffle([
                    "red_square_rotated_90",
                    "red_square_normal",
                    "blue_square_rotated_90",
                    "green_square_normal",
                ]),
            },

            {
                // ปัญหาที่ 2: ขยายและเปลี่ยนรูปทรง

                rule: "วงกลมเขียว: ขยาย 📈 2เท่า ➡️ สามเหลี่ยม",

                initialObject: "green_circle",

                transformations: [
                    { rule_desc: "ขยาย: 2เท่า" },
                    { rule_desc: "เปลี่ยนรูปทรง: สามเหลี่ยม" },
                ],

                correctAnswer: "green_triangle_large",

                options: Phaser.Utils.Array.Shuffle([
                    "green_triangle_large",
                    "green_circle_large",
                    "blue_triangle_large",
                    "red_triangle_large",
                ]),
            },

            {
                // ปัญหาที่ 3: สะท้อนและเปลี่ยนสี

                rule: "สามเหลี่ยมแดง: สะท้อน ↔️ ➡️ ฟ้า",

                initialObject: "red_triangle",

                transformations: [
                    { rule_desc: "สะท้อน: แนวนอน" },
                    { rule_desc: "เปลี่ยนสี: ฟ้า" },
                ],

                correctAnswer: "blue_triangle_flipped",

                options: Phaser.Utils.Array.Shuffle([
                    "blue_triangle_flipped",
                    "red_triangle_normal",
                    "blue_triangle_normal",
                    "green_triangle_flipped",
                ]),
            },
        ];

        let targetDropZone;

        let draggableOptions = [];

        // --- ฟังก์ชัน Preload: โหลดทรัพยากรล่วงหน้า ---

        function preload() {
            console.log("Stage 9: Preload started.");

            this.load.image("blue_square", "../assets/img/objects/blue_square.webp");

            this.load.image(
                "red_square_rotated_90",
                "../assets/img/objects/red_square_rotated_90.webp"
            );

            this.load.image(
                "red_square_normal",
                "../assets/img/objects/red_square_normal.webp"
            );

            this.load.image(
                "blue_square_rotated_90",
                "../assets/img/objects/blue_square_rotated_90.webp"
            );

            this.load.image(
                "green_square_normal",
                "../assets/img/objects/green_square_normal.webp"
            );

            this.load.image(
                "green_circle",
                "../assets/img/objects/green_circle.webp"
            );

            this.load.image(
                "green_triangle_large",
                "../assets/img/objects/green_triangle_large.webp"
            );

            this.load.image(
                "green_circle_large",
                "../assets/img/objects/green_circle_large.webp"
            );

            this.load.image(
                "blue_triangle_large",
                "../assets/img/objects/blue_triangle_large.webp"
            );

            this.load.image(
                "red_triangle_large",
                "../assets/img/objects/red_triangle_large.webp"
            );

            this.load.image(
                "red_triangle",
                "../assets/img/objects/red_triangle.webp"
            );

            this.load.image(
                "blue_triangle_flipped",
                "../assets/img/objects/blue_triangle_flipped.webp"
            );

            this.load.image(
                "red_triangle_normal",
                "../assets/img/objects/red_triangle_normal.webp"
            );

            this.load.image(
                "blue_triangle_normal",
                "../assets/img/objects/blue_triangle_normal.webp"
            );

            this.load.image(
                "green_triangle_flipped",
                "../assets/img/objects/green_triangle_flipped.webp"
            );

            this.load.audio("correct", "../assets/sound/correct.mp3");

            this.load.audio("wrong", "../assets/sound/wrong.mp3");

            console.log("Stage 9: Assets loaded.");
        }

        // --- ฟังก์ชัน Create: สร้างองค์ประกอบของเกม ---

        function create() {
            console.log("Stage 9: Create started.");

            const scene = this;

            startTime = Date.now();

            attempts = 0;

            solvedProblems = 0;

            currentProblemIndex = 0;

            const graphics = scene.add.graphics();

            graphics.fillGradientStyle(0x87ceeb, 0x87ceeb, 0x98fb98, 0x98fb98, 1);

            graphics.fillRect(0, 0, config.scale.width, config.scale.height);

            graphics.setDepth(-2);

            const problemZoneBg = scene.add.graphics();

            problemZoneBg
                .fillStyle(0xfffff0, 0.9)

                .lineStyle(3, 0xffa000);

            problemZoneBg.strokeRoundedRect(25, 25, 850, 300, 20);

            problemZoneBg.fillRoundedRect(25, 25, 850, 300, 20).setDepth(-1);

            const choicesZoneBg = scene.add.graphics();

            choicesZoneBg
                .fillStyle(0xf0f8ff, 0.9)

                .lineStyle(3, 0x4682b4);

            choicesZoneBg.strokeRoundedRect(25, 350, 850, 225, 20);

            choicesZoneBg.fillRoundedRect(25, 350, 850, 225, 20).setDepth(-1);

            renderProblem(scene, problems[currentProblemIndex]);

            console.log("Stage 9: Initial problem rendered.");

            scene.input.on("dragstart", (pointer, gameObject) => {
                scene.children.bringToTop(gameObject);

                gameObject.setTint(0xfff7d6);

                gameObject.setScale(gameObject.scaleX * 1.1); // ขยายเล็กน้อยตอนเริ่มลาก (คงสัดส่วน)
            });

            scene.input.on("drag", (pointer, gameObject, dragX, dragY) => {
                gameObject.x = dragX;

                gameObject.y = dragY;
            });

            scene.input.on("drop", (pointer, gameObject, dropZone) => {
                gameObject.clearTint();

                const isCorrectDropZone =
                    dropZone.getData("type") === "target_area" &&
                    !dropZone.getData("isFilled");

                if (
                    isCorrectDropZone &&
                    gameObject.getData("itemType") ===
                    problems[currentProblemIndex].correctAnswer
                ) {
                    scene.sound.play("correct");

                    gameObject.disableInteractive();

                    scene.tweens.add({
                        targets: gameObject,

                        x: dropZone.x,
                        y: dropZone.y,

                        scale: gameObject.getData("originalScale"), // กลับไป scale เดิมที่บันทึกไว้

                        duration: 200,
                        ease: "Power2",
                    });

                    dropZone.setData("isFilled", true);

                    checkProblemCompletion(scene);
                } else {
                    scene.sound.play("wrong");

                    scene.cameras.main.shake(150, 0.005);

                    attempts++;

                    const originalX = gameObject.getData("originalX");

                    const originalY = gameObject.getData("originalY");

                    const originalScale = gameObject.getData("originalScale");

                    scene.tweens.add({
                        targets: gameObject,

                        x: originalX + 5,

                        yoyo: true,

                        repeat: 2,

                        duration: 50,

                        ease: "Sine.easeInOut",

                        onComplete: () => {
                            gameObject.setPosition(originalX, originalY);

                            gameObject.setScale(originalScale); // บังคับกลับ original scale

                            console.log(
                                "Tween complete (Shake). Final position:",
                                gameObject.x,
                                gameObject.y,
                                "Final scale:",
                                gameObject.scaleX
                            );
                        },
                    });
                }
            });

            scene.input.on("dragend", (pointer, gameObject, dropped) => {
                if (!dropped) {
                    gameObject.clearTint();

                    scene.tweens.add({
                        targets: gameObject,

                        x: gameObject.getData("originalX"),
                        y: gameObject.getData("originalY"),

                        scale: gameObject.getData("originalScale"), // กลับไป original scale

                        duration: 300,
                        ease: "Bounce.easeOut",
                    });
                }
            });
        }

        // ฟังก์ชันสำหรับแสดงปัญหาแต่ละข้อย่อย

        function renderProblem(scene_param, problem) {
            console.log(`Rendering Problem ${currentProblemIndex + 1}:`, problem);

            if (
                !problem ||
                !problem.initialObject ||
                !Array.isArray(problem.transformations) ||
                !Array.isArray(problem.options)
            ) {
                console.error(
                    "Critical Error: problem data is invalid/incomplete in renderProblem. Cannot render stage.",
                    problem
                );

                return;
            }

            // ล้างของเก่า

            if (scene_param.problemElements) {
                scene_param.problemElements.forEach((el) => el.destroy());
            }

            scene_param.problemElements = [];

            const ruleTextTitleY = 80;

            const ruleTextTitle = scene_param.add
                .text(
                    config.scale.width / 2,
                    ruleTextTitleY,
                    `โจทย์: ${problem.rule}`,
                    {
                        fontSize: "28px",
                        color: "#1e3a8a",
                        fontFamily: "Kanit, Arial",
                        align: "center",
                        wordWrap: { width: 800 },
                        lineSpacing: 0,
                    }
                )
                .setOrigin(0.5);

            scene_param.problemElements.push(ruleTextTitle);

            // ✅ วาด Initial Object (ชิดซ้ายในกรอบ)

            const targetDisplayHeight = 80;

            const initialX = 250;

            const initialY = ruleTextTitleY + 100;

            const initialObjectImage = scene_param.add.image(
                initialX,
                initialY,
                problem.initialObject
            );

            const initialObjectScale =
                targetDisplayHeight / initialObjectImage.height;

            initialObjectImage.setScale(initialObjectScale);

            initialObjectImage.setData("originalScale", initialObjectScale);

            scene_param.problemElements.push(initialObjectImage);

            // ✅ วาด Transformations (ตรงกลาง)

            const problemBoxLeft = 25;

            const problemBoxWidth = 750;

            const ruleDescTextSize = 24;

            const centerAreaX = config.scale.width / 2 - 100;

            const totalTransformHeight = problem.transformations.length * 50;

            let transformY = initialY - totalTransformHeight / 2 + 25;

            problem.transformations.forEach((transformRule, index) => {
                const arrow = scene_param.add.graphics();

                arrow.lineStyle(3, 0x888888);

                arrow.lineBetween(
                    centerAreaX - 25,
                    transformY,
                    centerAreaX - 5,
                    transformY
                );

                arrow.lineBetween(
                    centerAreaX - 5,
                    transformY,
                    centerAreaX - 15,
                    transformY - 5
                );

                arrow.lineBetween(
                    centerAreaX - 5,
                    transformY,
                    centerAreaX - 15,
                    transformY + 5
                );

                scene_param.problemElements.push(arrow);

                const ruleText = scene_param.add
                    .text(centerAreaX, transformY, transformRule.rule_desc, {
                        fontSize: `${ruleDescTextSize}px`,

                        color: "#333",

                        fontFamily: "Kanit, Arial",

                        align: "left",
                    })
                    .setOrigin(0, 0.5);

                scene_param.problemElements.push(ruleText);

                transformY += 50;
            });

            // ✅ กล่องคำตอบ (Drop Zone) ชิดขวา

            const targetSize = 120;

            const targetX = problemBoxLeft + problemBoxWidth - targetSize / 2 - 20;

            const targetY = initialY;

            const targetOutline = scene_param.add
                .graphics()

                .lineStyle(4, 0x1e3a8a)

                .strokeRect(
                    targetX - targetSize / 2,
                    targetY - targetSize / 2,
                    targetSize,
                    targetSize
                );

            targetOutline.setDepth(-1);

            targetDropZone = scene_param.add
                .zone(targetX, targetY, targetSize, targetSize)

                .setRectangleDropZone(targetSize, targetSize);

            targetDropZone.setData({ type: "target_area", isFilled: false });

            scene_param.problemElements.push(targetOutline, targetDropZone);

            // ✅ วางตัวเลือกคำตอบด้านล่าง (centered)

            const optionSize = 100;

            const optionPadding = 40;

            const totalOptionsWidth =
                problem.options.length * optionSize +
                (problem.options.length - 1) * optionPadding;

            const optionsStartX =
                (config.scale.width - totalOptionsWidth) / 2 + optionSize / 2;

            const optionsY = 450;

            draggableOptions = [];

            problem.options.forEach((optionKey, index) => {
                const x = optionsStartX + index * (optionSize + optionPadding);

                const optionImage = scene_param.add.image(x, optionsY, optionKey);

                const optionImageScale = optionSize / optionImage.height;

                optionImage.setScale(optionImageScale);

                optionImage.setInteractive({ useHandCursor: true });

                optionImage.setData("originalX", x);

                optionImage.setData("originalY", optionsY);

                optionImage.setData("originalScale", optionImageScale);

                optionImage.setData("itemType", optionKey);

                console.log(
                    `Created choice "${optionKey}": native size(${optionImage.width}, ${optionImage.height}), displaySize(${optionImage.displayWidth}, ${optionImage.displayHeight}), scale(${optionImage.scaleX}, ${optionImage.scaleY})`
                );

                optionImage.setData({ type: "draggable", value: optionKey });

                scene_param.input.setDraggable(optionImage);

                scene_param.problemElements.push(optionImage);

                draggableOptions.push(optionImage);
            });

            console.log("Problem rendered. All elements created.");
        }

        function getBlankIndex(problemData, patternIndex) {
            let blankCount = -1;

            for (let i = 0; i <= patternIndex; i++) {
                if (problemData.sequence[i] === "?") {
                    blankCount++;
                }
            }

            return blankCount;
        }

        function checkProblemCompletion(scene_param) {
            if (targetDropZone.getData("isFilled")) {
                solvedProblems++;

                console.log(
                    `Problem ${currentProblemIndex + 1
                    } solved! Total solved problems: ${solvedProblems} out of ${problems.length
                    }`
                );

                scene_param.time.delayedCall(1000, () => {
                    currentProblemIndex++;

                    if (currentProblemIndex < problems.length) {
                        renderProblem(scene_param, problems[currentProblemIndex]);
                    } else {
                        onStageComplete(scene_param);
                    }
                });
            }
        }

        // ฟังก์ชันเมื่อด่านสำเร็จ

        function onStageComplete(scene_param) {
            console.log("Stage 9: onStageComplete called.");

            console.log(
                "DEBUG: onStageComplete - scene_param type:",
                typeof scene_param,
                "scene_param value:",
                scene_param
            );

            const endTime = Date.now();

            const durationSeconds = Math.floor((endTime - startTime) / 1000);

            let starsEarned = 0;

            const finalAttempts = attempts;

            if (solvedProblems === problems.length && finalAttempts === 0) {
                if (durationSeconds <= 90) {
                    starsEarned = 3;
                } else {
                    starsEarned = 2;
                }
            } else if (
                solvedProblems === problems.length &&
                finalAttempts <= problems.length * 2
            ) {
                if (durationSeconds <= 120) {
                    starsEarned = 2;
                } else {
                    starsEarned = 1;
                }
            } else if (solvedProblems === problems.length) {
                starsEarned = 1;
            } else {
                starsEarned = 0;
            }

            console.log(
                "Stage 9 Complete! Stars to send:",
                starsEarned,
                "Duration:",
                durationSeconds,
                "Attempts (wrong answers):",
                finalAttempts,
                "Solved Problems:",
                solvedProblems
            );

            scene_param.time.delayedCall(800, () => {
                console.log(
                    "DEBUG: inside delayedCall - scene_param type:",
                    typeof scene_param,
                    "scene_param value:",
                    scene_param
                );

                if (scene_param.problemElements) {
                    scene_param.problemElements.forEach((el) => el.destroy());
                }

                const container = scene_param.add.container(
                    config.scale.width / 2,
                    config.scale.height / 2
                );

                container.setDepth(10);

                container.setAlpha(0);

                container.setScale(0.7);

                const rect = scene_param.add
                    .rectangle(
                        0,
                        0,
                        config.scale.width,
                        config.scale.height,
                        0x000000,
                        0.7
                    )
                    .setInteractive();

                container.add(rect);

                const winText = scene_param.add
                    .text(0, -50, "🎉 เยี่ยม! ผ่านด่าน 9! 🎉", {
                        fontSize: "48px",
                        color: "#fde047",
                        fontFamily: "Kanit, Arial",
                        align: "center",
                        lineSpacing: 0,
                    })
                    .setOrigin(0.5);

                container.add(winText);

                const scoreText = scene_param.add
                    .text(0, 20, `ได้ ${starsEarned} ดาว!`, {
                        fontSize: "32px",
                        color: "#ffffff",
                        fontFamily: "Kanit, Arial",
                        align: "center",
                        lineSpacing: 0,
                    })
                    .setOrigin(0.5);

                container.add(scoreText);

                scene_param.tweens.add({
                    targets: container,

                    alpha: 1,

                    scale: 1,

                    duration: 500,

                    ease: "Power2.easeOut",

                    onComplete: () => {
                        window.sendResult(
                            STAGE_ID,
                            starsEarned,
                            durationSeconds,
                            finalAttempts
                        );
                    },
                });
            });
        }

        new Phaser.Game(config);
    }); // End document.fonts.ready.then
})(); // End IIFE
