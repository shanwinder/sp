// File: assets/js/logic_game/stage1.js (ฉบับแก้ไขการเลื่อนเมาส์)

(function() {
    document.addEventListener('DOMContentLoaded', function() {

        const config = {
            type: Phaser.AUTO,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 900,
                height: 600
            },
            // ✅✅✅ ส่วนที่เพิ่มเข้ามาเพื่อแก้ปัญหาการเลื่อนสกอลล์ ✅✅✅
            input: {
                mouse: {
                    preventDefaultWheel: false
                }
            },
            parent: "game-container",
            scene: {
                preload: preload,
                create: create
            }
        };

        function preload() {
            this.load.image("cat", "../assets/img/cat.webp");
            this.load.image("dog", "../assets/img/dog.webp");
            this.load.image("rabbit", "../assets/img/rabbit.webp");
            this.load.audio("correct", "../assets/sound/correct.mp3");
            this.load.audio("wrong", "../assets/sound/wrong.mp3");
        }

        function create() {
            const scene = this;

            const graphics = scene.add.graphics();
            graphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98, 1);
            graphics.fillRect(0, 0, config.scale.width, config.scale.height);
            graphics.setDepth(-2);
            
            const puzzleZoneBg = scene.add.graphics();
            puzzleZoneBg.fillStyle(0xfffbe6, 0.9).fillRoundedRect(25, 25, 850, 300, 20).setDepth(-1);
            scene.add.text(450, 60, "โจทย์: สังเกตและเรียงลำดับให้ถูกต้อง", { fontSize: '28px', color: '#b45309', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
            
            const choiceZoneBg = scene.add.graphics();
            choiceZoneBg.fillStyle(0xe0f2fe, 0.9).fillRoundedRect(25, 350, 850, 225, 20).setDepth(-1);
            scene.add.text(450, 375, "ตัวเลือก: ลากไปวางในช่องว่าง", { fontSize: '24px', color: '#0c4a6e', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);

            const sequence = ["dog", "cat", "rabbit", "dog", "cat", "rabbit"];
            const missingIndices = [2, 4];
            const dropZones = [];

            for (let i = 0; i < 6; i++) {
                const x = 150 + i * 120;
                const y = 180;
                if (missingIndices.includes(i)) {
                    const outline = scene.add.graphics().lineStyle(3, 0x6b7280).strokeRect(x - 50, y - 50, 100, 100);
                    const zone = scene.add.zone(x, y, 100, 100).setRectangleDropZone(100, 100);
                    zone.setData({ answer: sequence[i], isFilled: false, outline: outline });
                    dropZones.push(zone);
                } else {
                    scene.add.image(x, y, sequence[i]).setDisplaySize(100, 100);
                }
            }

            const options = Phaser.Utils.Array.Shuffle(["cat", "rabbit", "dog"]);
            options.forEach((animal, index) => {
                const x = 270 + index * 180;
                const y = 480;
                const dragItem = scene.add.image(x, y, animal).setDisplaySize(100, 100).setInteractive({ useHandCursor: true });
                dragItem.setData({ type: animal, originalX: x, originalY: y });
                scene.input.setDraggable(dragItem);
            });

            scene.input.on('dragstart', (pointer, gameObject) => {
                scene.children.bringToTop(gameObject);
                gameObject.setTint(0xfff7d6);
                scene.tweens.add({ targets: gameObject, displayWidth: 110, displayHeight: 110, duration: 150 });
            });

            scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
                gameObject.x = dragX;
                gameObject.y = dragY;
            });

            scene.input.on('drop', (pointer, gameObject, dropZone) => {
                gameObject.clearTint();
                const isCorrect = !dropZone.data.values.isFilled && dropZone.data.values.answer === gameObject.getData('type');
                
                if (isCorrect) {
                    gameObject.disableInteractive();
                    scene.sound.play('correct');
                    scene.tweens.add({
                        targets: gameObject,
                        x: dropZone.x, y: dropZone.y, 
                        displayWidth: 100, displayHeight: 100,
                        duration: 200, ease: 'Power2'
                    });
                    
                    dropZone.data.values.outline.clear().lineStyle(4, 0x22c55e).strokeRect(dropZone.x - 50, dropZone.y - 50, 100, 100);
                    dropZone.setData('isFilled', true);
                    
                    checkCompletion(scene, dropZones);
                } else {
                    scene.sound.play('wrong');
                    scene.tweens.add({
                        targets: gameObject,
                        x: gameObject.getData('originalX'), y: gameObject.getData('originalY'),
                        displayWidth: 100, displayHeight: 100,
                        duration: 300, ease: 'Bounce.easeOut'
                    });
                }
            });

            scene.input.on('dragend', (pointer, gameObject, dropped) => {
                if (!dropped) {
                    gameObject.clearTint();
                    scene.tweens.add({
                        targets: gameObject,
                        x: gameObject.getData('originalX'), y: gameObject.getData('originalY'),
                        displayWidth: 100, displayHeight: 100,
                        duration: 300, ease: 'Bounce.easeOut'
                    });
                }
            });
        }

        function checkCompletion(scene, dropZones) {
            const correctCount = dropZones.filter(zone => zone.getData('isFilled')).length;
            if (correctCount === dropZones.length) {
                scene.time.delayedCall(800, () => {
                    const container = scene.add.container(config.scale.width / 2, config.scale.height / 2);
                    container.setDepth(10);
                    container.setAlpha(0);
                    container.setScale(0.7);

                    const rect = scene.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000, 0.7).setInteractive();
                    container.add(rect);

                    const winText = scene.add.text(0, -50, "🎉 เก่งมาก! ผ่านด่านที่ 1 🎉", { fontSize: '48px', color: '#fde047', fontFamily: 'Kanit, Arial', align: 'center' }).setOrigin(0.5);
                    container.add(winText);

                    const scoreText = scene.add.text(0, 20, 'ได้รับ +100 คะแนน', { fontSize: '32px', color: '#ffffff', fontFamily: 'Kanit, Arial' }).setOrigin(0.5);
                    container.add(scoreText);

                    scene.tweens.add({
                        targets: container,
                        alpha: 1,
                        scale: 1,
                        duration: 500,
                        ease: 'Power2.easeOut',
                        onComplete: () => {
                            sendStageScore(100);
                        }
                    });
                });
            }
        }

        function sendStageScore(score) {
            fetch('../api/submit_stage_score.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `stage_id=${STAGE_ID}&score=${score}`
            }).then(() => {
                if (typeof window.updateScoreBar === 'function') {
                    window.updateScoreBar();
                }
                if (typeof window.triggerAutoNextStage === 'function') {
                    window.triggerAutoNextStage();
                }
            });
        }

        new Phaser.Game(config);

    });
})();
