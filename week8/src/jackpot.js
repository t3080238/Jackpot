export default function jackpot() {
    const [screenW, screenH] = [1024, 768];
    const [borderX, borderY, borderW, borderH] = [250, 40, 630, 600];
    const columnDist = 181;
    const [iconX, iconY, iconW, iconH] = [borderX + 49, borderY + 76, 170, 150];
    const [start, running, stop, pause] = ["start", "running", "stop", "pause"];

    let columns = [];
    let state = pause;


    //Aliases 設定別名
    let Application = PIXI.Application,
        resources = PIXI.loader.resources,
        loader = PIXI.loader,
        Sprite = PIXI.Sprite,
        TextureCache = PIXI.utils.TextureCache,
        Rectangle = PIXI.Rectangle,
        Container = PIXI.Container;

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
            "images/border.png"
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
                this.sprites[i] = new Sprite(this.iconTex[i % 9]);
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

            this.tl.set(this.spritesContainer, { y: 0 })
                .to(this.spritesContainer, 5, { y: 7050, ease: Power2.easeIn }) 
                .add(() => { this.state = running })
                .add(() => { this.repeat(this.tl) });

        };

        repeat(tl){
            if(this.state === running ){
                tl.set(this.spritesContainer, { y: 0 })
                    .to(this.spritesContainer, 2, { y: 7050 , ease: Power0.easeNone})
                    .add(() => { this.repeat(this.tl)} );
            }
        }

        stop() {
            this.state = stop
            this.tl.set(this.spritesContainer, { y: 0 })
                .to(this.spritesContainer, 5, { y: 7050, ease: Power2.easeOut })
                .add(() => { state = pause; });

        };
    }

    function initial() {
        setKeyboard();
        for (let i = 0; i < 3; i++) {
            columns[i] = new column(iconX + i * columnDist, iconY);
        }
        let border = new Sprite(resources["images/border.png"].texture);
        border.width = borderW;
        border.height = borderH;
        border.position.set(borderX, borderY);
        app.stage.addChild(border);
    }

    function startMove() {
        let tl = new TimelineMax();

        tl.add(() => { columns[0].start(); })
        .add(() => { columns[1].start(); }, 0.5)
        .add(() => { columns[2].start(); }, 1)
        .add(() => { state = running }, 6);

    }

    function stopMove() {
        let tl = new TimelineMax();

        tl.add(() => { columns[0].stop(); })
        .add(() => { columns[1].stop(); }, 0.5)
        .add(() => { columns[2].stop(); }, 1)
        .add(() => { state = pause }, 6);
    }


    function setKeyboard() {
        let keySpace = keyboard(32);

        keySpace.press = () => {
            if (state === pause) {
                state = start;
                startMove();
            }
            else if (state === running) {
                state = stop;
                stopMove();
            }
        };
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
