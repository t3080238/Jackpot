export default function jackpot() {
    const [screenW, screenH] = [1024, 768];
    const [borderX, borderY, borderW, borderH] = [250, 40, 630, 600];
    const columnDist = 181;
    const [iconX, iconY, iconW, iconH] = [borderX + 49, borderY + 76, 170, 150];
    const [start, running, stop, pause] = ["start", "running", "stop", "pause"];
    const [startSecond, repeatSecond, stopSecond] = [5 / 4, 2 / 4, 5 / 4];
    const pay = 1000;
    const playerOriginScore = 2000;


    let columns = [];
    let state;
    let line = [];
    let isWin = false;
    let button;
    let score;

    //Aliases 設定別名
    let Application = PIXI.Application,
        resources = PIXI.loader.resources,
        loader = PIXI.loader,
        Sprite = PIXI.Sprite,
        TextureCache = PIXI.utils.TextureCache,
        Graphics = PIXI.Graphics,
        Container = PIXI.Container


    // Create a Pixi Application 
    let app = new Application({
        width: screenW,
        height: screenH,
        antialias: true,
        transparent: false,
        resolution: 1,
        backgroundColor: 0xeeeeee
    });

    // Add the canvas that Pixi automatically created for you to the HTML document 
    document.body.appendChild(app.view);

    // load an image and run the `loadImage` function when it's done
    loader
        //BallImage為別名
        //.add("BallImage", "images/PokemonBall.png")
        .add([
            "images/icon.json",
            "images/border.png",
            "images/background.png",
            "images/button.png",
            "images/buttonGrey.png",
            "images/buttonRed.png"
        ])
        .on("progress", loadProgressHandler)
        .load(initial);

    function loadProgressHandler(loader, resource) {
        //顯示進度-------------------------------------------------------------------------
        let resourceName = resource.url;
        console.log(resourceName);
        let loadPercent = loader.progress;
        console.log(loadPercent);
    }

    class column {
        constructor(x, y) {
            console.log('TCL: column -> constructor -> x', x)

            this.x = x;
            this.y = y;
            this.iconTex = [];
            this.sprites = [];
            this.spritesContainer = new Container();
            this.tl = new TimelineMax();
            this.state = pause;

            for (let i = 0; i < 9; i++) {
                this.iconTex[i] = TextureCache[`icon${i + 1}.jpg`];
            }

            for (let i = 0; i < 50; i++) {
                this.sprites[i] = new Sprite(this.iconTex[randomInt(0, 8)]);
                if (i === 47) this.sprites[i].texture = this.iconTex[0];
                if (i === 48) this.sprites[i].texture = this.iconTex[0];
                if (i === 49) this.sprites[i].texture = this.iconTex[0];
                this.sprites[i].position.set(x, y - (i - 2) * iconH);
                this.sprites[i].width = iconW;
                this.sprites[i].height = iconH;
                this.spritesContainer.addChild(this.sprites[i]);
            }
            this.spritesContainer.y = 7050;
            app.stage.addChild(this.spritesContainer);

        };

        start() {
            this.state = start;
            this.sprites[0].texture = this.sprites[47].texture;
            this.sprites[1].texture = this.sprites[48].texture;
            this.sprites[2].texture = this.sprites[49].texture;

            //換圖示
            for (let i = 3; i < 50; i++) {
                this.sprites[i].texture = this.iconTex[randomInt(0, 8)];
            }

            this.tl.set(this.spritesContainer, { y: 0 })
                .to(this.spritesContainer, startSecond, { y: 7050, ease: Power2.easeIn })
                .add(() => {
                    this.state = running;
                    this.repeat();
                });
        };

        //在停止前不斷旋轉
        repeat() {
            if (this.state === running) {
                this.tl.set(this.spritesContainer, { y: 0 })
                    .to(this.spritesContainer, repeatSecond, { y: 7050, ease: Power0.easeNone })
                    //.add(() => { this.repeat(this.tl) });
                    .add(this.repeat.bind(this))
            }
        }

        stop() {
            this.state = stop
            this.tl.set(this.spritesContainer, { y: 0 })
                //.add(() => { this.showResult(); })
                .add( this.showResult.bind(this) )
                .to(this.spritesContainer, stopSecond, { y: 7050, ease: Power2.easeOut })
                .add(() => { this.state = pause; })
                 

        };

        //顯示結果改變
        showResult() {
            this.sprites[47].texture = this.iconTex[this.down];
            this.sprites[48].texture = this.iconTex[this.middle];
            this.sprites[49].texture = this.iconTex[this.up];
        }

        //得到結果並暫存
        getResult(up, middle, down) {
            this.up = up;
            this.middle = middle;
            this.down = down;
        }
    }

    class clickButton {
        constructor() {
            this.styleBlue = new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 72,
                fill: "#91D7F3",
                stroke: '#0000FF',
                strokeThickness: 6
            });
            this.styleGrey = new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 72,
                fill: "#999999",
                stroke: '#333333',
                strokeThickness: 6
            });
            this.styleRed = new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 72,
                fill: "#FFAFAF",
                stroke: '#FF0000',
                strokeThickness: 6
            });
            this.styleYellow = new PIXI.TextStyle({
                fontFamily: "Arial",
                fontSize: 72,
                fill: "#FFFF00",
                stroke: '#FF6830',
                strokeThickness: 6
            });

            let buttonX = borderX + borderW - 120;
            let buttonY = borderY + borderH;

            this.buttonStart = PIXI.Sprite.fromImage("images/button.png");
            this.buttonStart.width = 240;
            this.buttonStart.height = 120;
            this.buttonStart.position.set(buttonX, buttonY);

            this.buttonGrey = PIXI.Sprite.fromImage("images/buttonGrey.png");
            this.buttonGrey.width = 240;
            this.buttonGrey.height = 120;
            this.buttonGrey.position.set(buttonX, buttonY);

            this.buttonStop = PIXI.Sprite.fromImage("images/buttonRed.png");
            this.buttonStop.width = 240;
            this.buttonStop.height = 120;
            this.buttonStop.position.set(buttonX, buttonY);
            this.buttonStop.visible = false;

            this.txtStart = new PIXI.Text("Spin", this.styleBlue);
            this.txtStart.position.set(buttonX + 41, buttonY + 14);

            //  設定可以互動
            this.buttonStart.interactive = true;
            this.buttonStop.interactive = true;

            // 當滑鼠滑過時顯示為手指圖示
            this.buttonStart.buttonMode = true;
            this.buttonStop.interactive = true;

            app.stage.addChild(this.buttonGrey);
            app.stage.addChild(this.buttonStop);
            app.stage.addChild(this.buttonStart);
            app.stage.addChild(this.txtStart);

            this.buttonStart.on('pointerdown', () => { this.buttonDowm() });
            this.buttonStop.on('pointerdown', () => { this.buttonDowm() });
        };

        buttonDowm() {
            console.log('TCL: keySpace.press -> state', state)
            if (state === pause) {
                if (score.playerScoreTex.score < pay) return;
                state = start;
                this.buttonStart.visible = false;
                this.txtStart.style = this.styleGrey;
                startMove();
            }
            else if (state === running) {
                state = stop;
                this.buttonStop.visible = false;
                this.txtStart.style = this.styleGrey;
                stopMove();
            }
        };

    }

    class scoreSystem {
        constructor() {
            this.tl = new TimelineMax();

            //產生得獎分數
            this.winScoreTex = new PIXI.Text("0", button.styleYellow);
            this.winScoreTex.alpha = 0;
            this.winScoreTex.position.set(borderX + borderW / 2 - 24, borderY + borderH / 2 - 38);
            app.stage.addChild(this.winScoreTex);

            //產生玩家分數
            this.playerScoreTex = new PIXI.Text(playerOriginScore, button.styleYellow);
            this.playerScoreTex.score = playerOriginScore;
            this.playerScoreTex.position.set(borderX + 200, borderY + borderH + 20);
            app.stage.addChild(this.playerScoreTex);

            //閃亮亮特效

        }

        start() {

            this.playerScoreTex.score -= pay;
            this.tl.to(this.playerScoreTex, 1, {
                text: this.playerScoreTex.score, ease: Power0.easeNone, onUpdate: () => {
                    this.playerScoreTex.text = Math.floor(this.playerScoreTex.text);
                    this.playerScoreTex.x = borderX + 200 - 40 * Math.floor(Math.log10(this.playerScoreTex.text) - 3);
                    if (this.playerScoreTex.text === '0') this.playerScoreTex.x = borderX + 320;
                }
            })
        }

        updateScore() {
            this.tl.set(this.winScoreTex, { text: 0, alpha: 1, x: borderX + borderW / 2 - 24 })
                .to(this.winScoreTex, 0.7, {
                    text: this.winScoreTex.score, ease: Power0.easeNone, onUpdate: () => {
                        this.winScoreTex.text = Math.floor(this.winScoreTex.text);
                        this.winScoreTex.x = borderX + borderW / 2 - 24 - 20 * Math.floor(Math.log10(this.winScoreTex.text));
                    }
                })
                .to(this.winScoreTex, 1, { alpha: 0, ease: Power4.easeIn })
                .to(this.playerScoreTex, 1, {
                    text: this.playerScoreTex.score, ease: Power0.easeNone, onUpdate: () => {
                        this.playerScoreTex.text = Math.floor(this.playerScoreTex.text);
                        this.playerScoreTex.x = borderX + 200 - 40 * Math.floor(Math.log10(this.playerScoreTex.text) - 3);
                    }
                }, '-=1')
        }
    }

    function initial() {
        setKeyboard();
        state = pause;

        //產生三個直行
        for (let i = 0; i < 3; i++) {
            columns[i] = new column(iconX + i * columnDist, iconY);
        }

        //產生背景
        let backgroundPic = new Sprite(resources["images/background.png"].texture);
        backgroundPic.width = screenW;
        backgroundPic.height = screenH;
        backgroundPic.position.set(0, 0);
        app.stage.addChild(backgroundPic);

        //產生外框
        let border = new Sprite(resources["images/border.png"].texture);
        border.width = borderW;
        border.height = borderH;
        border.position.set(borderX, borderY);
        app.stage.addChild(border);

        //產生按鈕
        button = new clickButton();

        //產生紅線
        creatRedLine();

        //分數系統
        score = new scoreSystem();
    }

    function startMove() {
        console.log((4 == 4 == 4));
        let tl = new TimelineMax();
        // for (lin of line){
        //     lin.visible = false;
        // }
        line.forEach((lin) => {
            lin.visible = false;
        });

        score.start();
        tl.add(() => { columns[0].start(); }, 0)
            .add(() => { columns[1].start(); }, 0.5)
            .add(() => { columns[2].start(); }, 1)
            .add(() => { decineResult(); }, 1 + startSecond);
    }

    function stopMove() {
        let tl = new TimelineMax();

        tl.add(() => { columns[0].stop(); })
            .add(() => { columns[1].stop(); }, 0.5)
            .add(() => { columns[2].stop(); }, 1)
            .add(() => { showRedLine(); }, 2 + stopSecond);
    }

    function setKeyboard() {
        let keySpace = keyboard(32);

        keySpace.press = () => {
            button.buttonDowm();
        };
    }

    function creatRedLine() {
        for (let i = 0; i < 3; i++) {
            line[i] = new Graphics();
            line[i].lineStyle(4, 0xFF0000, 1);
            line[i].moveTo(0, 0);
            line[i].lineTo(borderW, 0);
            line[i].alpha = 0;
            line[i].visible = false;
            line[i].x = borderX;
            line[i].y = borderY + i * iconH + 150;
            app.stage.addChild(line[i]);
        }
        line[3] = new Graphics();
        line[3].lineStyle(4, 0xFF0000, 1);
        line[3].moveTo(borderX, borderY + 35);
        line[3].alpha = 0;
        line[3].visible = false;
        line[3].lineTo(borderX + borderW, borderY + borderH - 35);
        app.stage.addChild(line[3]);

        line[4] = new Graphics();
        line[4].lineStyle(4, 0xFF0000, 1);
        line[4].moveTo(borderX, borderY + borderH - 35);
        line[4].visible = false;
        line[4].alpha = 0;
        line[4].lineTo(borderX + borderW, borderY + 35);
        app.stage.addChild(line[4]);
    }

    function decineResult() {
        let randomScore = randomInt(0, 1000);
        let result = [];
        console.log('TCL: decineResult -> score', randomScore);

        //沒中獎
        if (randomScore < 200) {
            isWin = false;
            do {
                for (let i = 0; i < 9; i++) {
                    result[i] = randomInt(0, 8);
                }

            } while (
                (result[0] === result[1] && result[1] === result[2]) ||
                (result[3] === result[4] && result[4] === result[5]) ||
                (result[6] === result[7] && result[7] === result[8]) ||
                (result[2] === result[4] && result[4] === result[6]) ||
                (result[0] === result[4] && result[4] === result[8])
            );
            console.log('TCL: decineResult -> result', result)
            score.winScoreTex.score = 0;
        }
        //中獎
        else if (randomScore < 800) {
            isWin = true;
            let num;

            do {
                for (let i = 0; i < 9; i++) {
                    result[i] = randomInt(0, 8);
                }
                num = 0;
                if (result[0] === result[1] && result[1] === result[2]) { line[0].visible = true; num++; }
                if (result[3] === result[4] && result[4] === result[5]) { line[1].visible = true; num++; }
                if (result[6] === result[7] && result[7] === result[8]) { line[2].visible = true; num++; }
                if (result[2] === result[4] && result[4] === result[6]) { line[4].visible = true; num++; }
                if (result[0] === result[4] && result[4] === result[8]) { line[3].visible = true; num++; }

            } while (num === 0);
            console.log('TCL: decineResult -> result', result)

            score.winScoreTex.score = 100 * Math.pow(num, 2);
        }
        //中大獎
        else if (randomScore <= 1000) {
            isWin = true;
            let num = randomInt(0, 8);
            result = [num, num, num, num, num, num, num, num, num];
            line.forEach((lin) => {
                lin.visible = true;
            });
            score.winScoreTex.score = 10000 - num * 1000;
            console.log('TCL: decineResult -> result', result)
        }

        columns[0].getResult(result[0], result[3], result[6]);
        columns[1].getResult(result[1], result[4], result[7]);
        columns[2].getResult(result[2], result[5], result[8]);

        state = running;
        score.playerScoreTex.score += score.winScoreTex.score;
        button.buttonStop.visible = true;
        button.txtStart.text = "Stop";
        button.txtStart.style = button.styleRed;
    }

    function showRedLine() {
        if (isWin === false) {
            state = pause;
            button.buttonStart.visible = true;
            button.txtStart.text = "Spin";
            button.txtStart.style = button.styleBlue;
            if (score.playerScoreTex.score < pay) {
                button.buttonStart.visible = false;
                button.txtStart.style = button.styleGrey;
            }
            return;
        }

        let tl = new TimelineMax();
        tl.fromTo(line, 0.5, { alpha: 1, ease: Power4.easeOut }, { alpha: 0, repeat: 3 })
            .add(() => { showScore(); })
    }

    function showScore() {
        console.log("showScore");
        let tl = new TimelineMax();
        score.updateScore();
        tl.add(() => {
            state = pause;
            button.buttonStart.visible = true;
            button.txtStart.text = "Spin";
            button.txtStart.style = button.styleBlue;
            if (score.playerScoreTex.score < pay) {
                button.buttonStart.visible = false;
                button.txtStart.style = button.styleGrey;
            }
        }, 1);
    }



    function keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
