export default function jackpot() {
    const [screenW, screenH] = [1024, 768];
    const [borderX, borderY, borderW, borderH] = [250, 40, 630, 600];
    const columnDist = 181;
    const [iconX, iconY, iconW, iconH] = [borderX + 49, borderY + 76, 170, 150];
    const [start, running, stop, pause] = ["start", "running", "stop", "pause"];

    let columns = [];
    let state;
    let line = [];
    let isWin = false;
    let button;
    let scoreTex;

    //Aliases 設定別名
    let Application = PIXI.Application,
        resources = PIXI.loader.resources,
        loader = PIXI.loader,
        Sprite = PIXI.Sprite,
        TextureCache = PIXI.utils.TextureCache,
        Graphics = PIXI.Graphics,
        Container = PIXI.Container
    //AnimatedSprite = PIXI.extras.AnimatedSprite;


    // Create a Pixi Application 
    let app = new Application({
        width: screenW,         // default: 1024
        height: screenH,        // default: 768
        antialias: true,    // default: false
        transparent: false, // default: false
        resolution: 1,       // default: 1
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
            this.spritesContainer = new Container();
            this.tl = new TimelineMax();
            this.state = pause;

            for (let i = 0; i < 9; i++) {
                this.iconTex[i] = TextureCache[`icon${i + 1}.jpg`];
            }
            this.sprites = [];

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
                .to(this.spritesContainer, 5, { y: 7050, ease: Power2.easeIn })
                .add(() => { this.state = running })
                .add(() => { this.repeat(this.tl) });

        };

        //在停止前不斷旋轉
        repeat(tl) {
            if (this.state === running) {
                tl.set(this.spritesContainer, { y: 0 })
                    .to(this.spritesContainer, 2, { y: 7050, ease: Power0.easeNone })
                    .add(() => { this.repeat(this.tl) });
            }
        }

        stop() {
            this.state = stop
            this.tl.set(this.spritesContainer, { y: 0 })
                .add(() => { this.showResult(); })
                .to(this.spritesContainer, 5, { y: 7050, ease: Power2.easeOut })
                .add(() => { this.state = pause; });

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
                stroke: '#0000ff',
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
                stroke: '#ff0000',
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
        tl.add(() => { columns[0].start(); })
            .add(() => { columns[1].start(); }, 0.5)
            .add(() => { columns[2].start(); }, 1)
            .add(() => { decineResult(); }, 6);

    }

    function stopMove() {
        let tl = new TimelineMax();

        tl.add(() => { columns[0].stop(); })
            .add(() => { columns[1].stop(); }, 0.5)
            .add(() => { columns[2].stop(); }, 1)
            .add(() => { showRedLine(); }, 7);
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
        let score = randomInt(0, 1000);
        let result = [];
        console.log('TCL: decineResult -> score', score);

        //沒中獎
        if (score < 200) {
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
        }
        //中獎
        else if (score < 900) {
            isWin = true;

            do {
                for (let i = 0; i < 9; i++) {
                    result[i] = randomInt(0, 8);
                }

            } while ((
                (result[0] === result[1] && result[1] === result[2]) ||
                (result[3] === result[4] && result[4] === result[5]) ||
                (result[6] === result[7] && result[7] === result[8]) ||
                (result[2] === result[4] && result[4] === result[6]) ||
                (result[0] === result[4] && result[4] === result[8])) === false
            );
            console.log('TCL: decineResult -> result', result)

            if (result[0] === result[1] && result[1] === result[2]) line[0].visible = true;
            if (result[3] === result[4] && result[4] === result[5]) line[1].visible = true;
            if (result[6] === result[7] && result[7] === result[8]) line[2].visible = true;
            if (result[2] === result[4] && result[4] === result[6]) line[4].visible = true;
            if (result[0] === result[4] && result[4] === result[8]) line[3].visible = true;
        }
        //中大獎
        else if (score <= 1000) {
            isWin = true;
            let num = randomInt(0, 8);
            result = [num, num, num, num, num, num, num, num, num];
            line.forEach((lin) => {
                lin.visible = true;
            });
            console.log('TCL: decineResult -> result', result)
        }

        columns[0].getResult(result[0], result[3], result[6]);
        columns[1].getResult(result[1], result[4], result[7]);
        columns[2].getResult(result[2], result[5], result[8]);

        state = running;
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
            return;
        }

        let tl = new TimelineMax();
        tl.fromTo(line, 0.5, { alpha: 1, ease: Power4.easeOut }, { alpha: 0, repeat: 3 })
            .add(() => {
                state = pause;
                button.buttonStart.visible = true;
                button.txtStart.text = "Spin";
                button.txtStart.style = button.styleBlue;
                console.log('TCL: showRedLine -> state', state)
            }, 2);
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
